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

    const [vehiculos] = await sequelize.query(
      `SELECT * FROM INFRA_DEV.LR_VEHICULO WHERE LR_CARNE = :carne AND VEH_ACTIVO = 1 ORDER BY VEH_ID_VEHICULO ASC`,
      { replacements: { carne: carneLimpio } }
    );

    const [pagosCompletados] = await sequelize.query(
      `SELECT * FROM INFRA_DEV.CB_PAGO WHERE LR_CARNE = :carne AND PAG_ESTADO IN ('C', 'A')`,
      { replacements: { carne: carneLimpio } }
    );

    let deudas = [];

    if (vehiculos.length > 0) {
      const primerVehiculo = vehiculos[0];
      const tienePagoPlan = pagosCompletados.some(p => p.PLN_PLAN != null);
      
      if (!tienePagoPlan) {
        // Filtrar plan por tipo de vehículo del primero
        const esMoto = primerVehiculo.VEH_TIPO_VEHICULO === 'MOTOCICLETA';
        const [planes] = await sequelize.query(
          `SELECT * FROM INFRA_DEV.CB_PLAN_PARQUEO 
           WHERE PLN_ESTADO_REGISTRO = 'A' 
           AND UPPER(PLN_NOMBRE_PLAN) LIKE :tipo 
           ORDER BY PLN_PLAN ASC`,
          { replacements: { tipo: esMoto ? '%MOTO%' : '%CARRO%' } }
        );
        
        if (planes.length > 0) {
          deudas.push({
            ID_A_PAGAR: planes[0].PLN_PLAN,
            DESCRIPCION: planes[0].PLN_NOMBRE_PLAN,
            MONTO: planes[0].PLN_PRECIO,
            PAG_ESTADO: 'P',
            TIPO: 'PLAN'
          });
        }
      }

      // Vehículos extras (tarifa de 50.00)
      const pagosTarifaExtra = pagosCompletados.filter(p => p.PAG_MONTO_TOTAL == 50).length;
      const vehiculosExtra = vehiculos.length - 1;
      
      if (vehiculosExtra > pagosTarifaExtra) {
        const extrasAPagar = vehiculosExtra - pagosTarifaExtra;
        for (let i = 0; i < extrasAPagar; i++) {
          deudas.push({
            ID_A_PAGAR: null,
            DESCRIPCION: `Tarifa Administrativa - Vehículo Extra ${vehiculos[1 + pagosTarifaExtra + i].VEH_PLACA}`,
            MONTO: 50,
            PAG_ESTADO: 'P',
            TIPO: 'PLAN' // El frontend lo maneja como 'PLAN' para el redireccionamiento simple
          });
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
        AND um.EMU_ESTADO_MULTA = 'P'
        AND NOT EXISTS (
          SELECT 1 FROM INFRA_DEV.CB_PAGO p 
          WHERE p.EMU_USUARIO_MULTA = um.EMU_USUARIO_MULTA 
            AND p.PAG_ESTADO IN ('C', 'A')
        )
    `, { replacements: { carne: carneLimpio } });

    return [...deudas, ...deudaMultas];
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
