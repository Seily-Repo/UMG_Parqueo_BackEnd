const { sequelize } = require('../config/db');
const { Pago } = require('../model/catalogos.model');
const { limpiarCarne, mapTipoVehiculoToPlanBucket } = require('../utils/helpers');

class PagoStore {
  /**
   * SOLUCIÓN A DEUDAS PENDIENTES — Calcula deuda "al vuelo".
   * 
   * En vez de leer CB_PAGO (que ahora solo escribe cobros-dev),
   * buscamos:
   * 1. Vehículos sin pago completado asociado → deuda de plan
   * 2. Multas pendientes sin pago completado → deuda de multa
   *
   * Esto garantiza que el estudiante vea su deuda REAL en el frontend,
   * sin que back-parqueo-umg escriba jamás en CB_PAGO.
   *
   * Retorna las llaves que espera Dashboard.tsx:
   * DESCRIPCION, MONTO, PAG_ESTADO, TIPO
   */
  static async getListaPendientes(carne) {
    const carneLimpio = limpiarCarne(carne);

    const [usuarioRows] = await sequelize.query(
      `SELECT JOR_ID_JORNADA FROM INFRA_DEV.LR_USUARIO WHERE LR_CARNE = :carne`,
      { replacements: { carne: carneLimpio } }
    );
    const jornadaId = Number(usuarioRows?.[0]?.JOR_ID_JORNADA || 0);

    const [vehiculos] = await sequelize.query(
      `SELECT * FROM INFRA_DEV.LR_VEHICULO WHERE LR_CARNE = :carne AND VEH_ACTIVO = 1 ORDER BY VEH_ID_VEHICULO ASC`,
      { replacements: { carne: carneLimpio } }
    );

    const [pagosCompletados] = await sequelize.query(
      `SELECT * FROM INFRA_DEV.CB_PAGO WHERE LR_CARNE = :carne AND PAG_ESTADO IN ('C', 'A')`,
      { replacements: { carne: carneLimpio } }
    );

    const [pagosPendientesGuardados] = await sequelize.query(`
      SELECT 
        p.PLN_PLAN AS ID_A_PAGAR,
        NVL(pl.PLN_NOMBRE_PLAN, 'Tarifa Administrativa - Vehiculo Extra') AS DESCRIPCION,
        p.PAG_MONTO_TOTAL AS MONTO,
        'P' AS PAG_ESTADO,
        'PLAN' AS TIPO,
        p.PLN_PLAN
      FROM INFRA_DEV.CB_PAGO p
      LEFT JOIN INFRA_DEV.CB_PLAN_PARQUEO pl ON p.PLN_PLAN = pl.PLN_PLAN
      WHERE p.LR_CARNE = :carne 
        AND p.PAG_ESTADO = 'P'
        AND p.EMU_USUARIO_MULTA IS NULL
    `, { replacements: { carne: carneLimpio } });

    let deudas = [];

    if (vehiculos.length > 0) {
      const tienePagoPlan = pagosCompletados.some((p) => p.PLN_PLAN != null);

      const pendingPlan = pagosPendientesGuardados
        .filter((p) => p.PLN_PLAN != null)
        .sort((a, b) => Number(b.MONTO) - Number(a.MONTO))[0];

      if (!tienePagoPlan) {
        if (pendingPlan) {
          deudas.push(pendingPlan);
        } else {
          const vehicleBuckets = [
            ...new Set(vehiculos.map((v) => mapTipoVehiculoToPlanBucket(v.VEH_TIPO_VEHICULO))),
          ];
          const includeMoto = vehicleBuckets.includes('MOTO') ? 1 : 0;
          const includeCarro = vehicleBuckets.includes('CARRO') ? 1 : 0;

          const [deudaPlanes] = await sequelize.query(`
            SELECT
              candidato.ID_A_PAGAR,
              candidato.DESCRIPCION,
              candidato.MONTO,
              'P' AS PAG_ESTADO,
              'PLAN' AS TIPO
            FROM (
              SELECT DISTINCT
                pl.PLN_PLAN AS ID_A_PAGAR,
                pl.PLN_NOMBRE_PLAN AS DESCRIPCION,
                pl.PLN_PRECIO AS MONTO
              FROM INFRA_DEV.CB_PLAN_PARQUEO pl
              WHERE pl.PLN_ESTADO_REGISTRO = 'A'
                AND (
                  (:includeMoto = 1 AND UPPER(TRIM(pl.PLN_DESCRIPCION)) = 'MOTO')
                  OR (:includeCarro = 1 AND UPPER(TRIM(pl.PLN_DESCRIPCION)) = 'CARRO')
                )
                AND (
                  :jornadaId = 0
                  OR (:jornadaId = 1 AND UPPER(pl.PLN_NOMBRE_PLAN) LIKE '%MATUTIN%')
                  OR (:jornadaId = 2 AND UPPER(pl.PLN_NOMBRE_PLAN) LIKE '%VESPERTIN%')
                  OR (:jornadaId = 5 AND UPPER(pl.PLN_NOMBRE_PLAN) LIKE '%NOCTURN%')
                  OR (:jornadaId = 3 AND (
                    UPPER(pl.PLN_NOMBRE_PLAN) LIKE '%SABAD%'
                    OR UPPER(pl.PLN_NOMBRE_PLAN) LIKE '%FIN DE SEMANA%'
                  ))
                  OR (:jornadaId = 4 AND (
                    UPPER(pl.PLN_NOMBRE_PLAN) LIKE '%DOMINGO%'
                    OR UPPER(pl.PLN_NOMBRE_PLAN) LIKE '%FIN DE SEMANA%'
                  ))
                )
                AND NOT EXISTS (
                  SELECT 1
                  FROM INFRA_DEV.CB_PAGO p
                  WHERE p.LR_CARNE = :carne
                    AND p.PLN_PLAN = pl.PLN_PLAN
                    AND p.PAG_ESTADO IN ('C', 'A')
                )
            ) candidato
            ORDER BY candidato.MONTO DESC, candidato.ID_A_PAGAR DESC
            FETCH FIRST 1 ROWS ONLY
          `, {
            replacements: {
              carne: carneLimpio,
              jornadaId,
              includeMoto,
              includeCarro,
            },
          });

          if (deudaPlanes.length > 0) {
            deudas.push(deudaPlanes[0]);
          }
        }
      }
    }

    // Deudas de MULTA: multas asignadas que no tienen pago completado
    const [deudaMultas] = await sequelize.query(`
      SELECT 
        um.EMU_USUARIO_MULTA AS ID_A_PAGAR,
        m.MUL_DESCRIPCION AS DESCRIPCION,
        m.MUL_MONTO_TOTAL AS MONTO,
        'P' AS PAG_ESTADO,
        'MULTA' AS TIPO
      FROM INFRA_DEV.CB_USUARIO_MULTA um
      JOIN INFRA_DEV.CB_MULTA m ON um.MUL_MULTA = m.MUL_MULTA
      JOIN INFRA_DEV.LR_VEHICULO v ON um.VEH_ID_VEHICULO = v.VEH_ID_VEHICULO
      WHERE v.LR_CARNE = :carne
        AND um.EMU_ESTADO_MULTA IN ('A', 'P')
        AND NOT EXISTS (
          SELECT 1 FROM INFRA_DEV.CB_PAGO p 
          WHERE p.EMU_USUARIO_MULTA = um.EMU_USUARIO_MULTA 
            AND p.PAG_ESTADO IN ('C', 'A')
        )
    `, { replacements: { carne: carneLimpio } });

    // Pagos Completados Históricos
    const [pagosHistoricos] = await sequelize.query(`
      SELECT 
        p.PAG_PAGO AS ID_A_PAGAR,
        NVL(pl.PLN_NOMBRE_PLAN, NVL(m.MUL_DESCRIPCION, 'Tarifa Administrativa - Vehiculo Extra')) AS DESCRIPCION,
        p.PAG_MONTO_TOTAL AS MONTO,
        'C' AS PAG_ESTADO,
        CASE WHEN p.EMU_USUARIO_MULTA IS NOT NULL THEN 'MULTA' ELSE 'PLAN' END AS TIPO
      FROM INFRA_DEV.CB_PAGO p
      LEFT JOIN INFRA_DEV.CB_PLAN_PARQUEO pl ON p.PLN_PLAN = pl.PLN_PLAN
      LEFT JOIN INFRA_DEV.CB_USUARIO_MULTA um ON p.EMU_USUARIO_MULTA = um.EMU_USUARIO_MULTA
      LEFT JOIN INFRA_DEV.CB_MULTA m ON um.MUL_MULTA = m.MUL_MULTA
      WHERE p.LR_CARNE = :carne 
        AND p.PAG_ESTADO IN ('C', 'A')
    `, { replacements: { carne: carneLimpio } });

    return [...deudas, ...deudaMultas, ...pagosHistoricos];
  }

  /**
   * Obtiene todos los pagos con info de usuario, plan y multa (para panel admin).
   * Retorna las llaves que espera DashboardAdmin.tsx:
   * PAG_PAGO, CARNE_USUARIO, NOMBRE, CONCEPTO, PAG_MONTO_TOTAL, PAG_ESTADO, FECHA
   */
  static async getAll() {
    const [rows] = await sequelize.query(`
      SELECT p.PAG_PAGO, p.LR_CARNE AS CARNE_USUARIO, u.LR_NOMBRES || ' ' || u.LR_APELLIDOS as NOMBRE, 
             NVL(pl.PLN_NOMBRE_PLAN, m.MUL_DESCRIPCION) AS CONCEPTO, 
             p.PAG_MONTO_TOTAL, p.PAG_ESTADO, 
             TO_CHAR(p.PAG_FECHA_PAGO, 'DD/MM/YYYY HH24:MI') as FECHA
      FROM INFRA_DEV.CB_PAGO p
      LEFT JOIN INFRA_DEV.LR_USUARIO u ON p.LR_CARNE = u.LR_CARNE
      LEFT JOIN INFRA_DEV.CB_PLAN_PARQUEO pl ON p.PLN_PLAN = pl.PLN_PLAN
      LEFT JOIN INFRA_DEV.CB_USUARIO_MULTA um ON p.EMU_USUARIO_MULTA = um.EMU_USUARIO_MULTA
      LEFT JOIN INFRA_DEV.CB_MULTA m ON um.MUL_MULTA = m.MUL_MULTA
      ORDER BY p.PAG_FECHA_PAGO DESC
    `);
    return rows;
  }

  /**
   * Aprueba un pago cambiando su estado a 'C' (Completado).
   */
  static async aprobar(idPago) {
    await Pago.update(
      { PAG_ESTADO: 'C' },
      { where: { PAG_PAGO: idPago } }
    );
  }
}

module.exports = PagoStore;
