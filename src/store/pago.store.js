const { sequelize } = require('../config/db');
const { Pago } = require('../model/catalogos.model');
const { limpiarCarne, formatearCarne } = require('../utils/helpers');

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

    // Deudas de PLAN: vehículos registrados que aún no tienen un pago 'C' (completado) en CB_PAGO
    const [deudaPlanes] = await sequelize.query(`
      SELECT 
        pl.PLN_PLAN AS ID_A_PAGAR,
        pl.PLN_NOMBRE_PLAN AS DESCRIPCION,
        pl.PLN_PRECIO AS MONTO,
        'P' AS PAG_ESTADO,
        'PLAN' AS TIPO
      FROM INFRA_DEV.LR_VEHICULO v
      JOIN INFRA_DEV.CB_PLAN_PARQUEO pl ON pl.PLN_ESTADO_REGISTRO = 'A'
      WHERE v.LR_CARNE = :carne 
        AND v.VEH_ACTIVO = 1
        AND NOT EXISTS (
          SELECT 1 FROM INFRA_DEV.CB_PAGO p 
          WHERE p.LR_CARNE = v.LR_CARNE 
            AND p.PLN_PLAN = pl.PLN_PLAN 
            AND p.PAG_ESTADO IN ('C', 'A')
        )
      FETCH FIRST 1 ROWS ONLY
    `, { replacements: { carne: carneLimpio } });

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
        AND um.EMU_ESTADO_MULTA = 'P'
        AND NOT EXISTS (
          SELECT 1 FROM INFRA_DEV.CB_PAGO p 
          WHERE p.EMU_USUARIO_MULTA = um.EMU_USUARIO_MULTA 
            AND p.PAG_ESTADO IN ('C', 'A')
        )
    `, { replacements: { carne: carneLimpio } });

    return [...deudaPlanes, ...deudaMultas];
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
