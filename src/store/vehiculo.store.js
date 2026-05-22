const Vehiculo = require('../model/vehiculo.model');
const { Pago, PlanParqueo } = require('../model/catalogos.model');
const { limpiarCarne } = require('../utils/helpers');
const { sequelize } = require('../config/db');

class VehiculoStore {
  /**
   * Obtiene los vehículos activos de un usuario por carné.
   * Retorna las llaves que espera Dashboard.tsx:
   * ID_VEHICULO, TIPO_VEHICULO, PLACA, MARCA, MODELO, COLOR, ACTIVO
   */
  static async getByPlaca(placa) {
    const placaLimpia = placa.trim().toUpperCase();
    const row = await Vehiculo.findOne({
      where: { VEH_PLACA: placaLimpia, VEH_ACTIVO: 1 },
      raw: true,
    });
    if (!row) return null;
    return {
      ID_VEHICULO: row.VEH_ID_VEHICULO,
      CARNE: row.LR_CARNE, // ¡Este es el dato de oro que necesitamos!
      TIPO_VEHICULO: row.VEH_TIPO_VEHICULO,
      PLACA: row.VEH_PLACA,
      MARCA: row.VEH_MARCA,
      MODELO: row.VEH_MODELO
    };
  }

  static async getByCarne(carne) {
    const carneLimpio = limpiarCarne(carne);
    const rows = await Vehiculo.findAll({
      where: { LR_CARNE: carneLimpio, VEH_ACTIVO: 1 },
      order: [['VEH_ID_VEHICULO', 'ASC']],
      raw: true,
    });
    return rows.map(r => ({
      ID_VEHICULO: r.VEH_ID_VEHICULO,
      TIPO_VEHICULO: r.VEH_TIPO_VEHICULO,
      PLACA: r.VEH_PLACA,
      MARCA: r.VEH_MARCA,
      MODELO: r.VEH_MODELO,
      COLOR: r.VEH_COLOR,
      ACTIVO: r.VEH_ACTIVO,
    }));
  }

  /**
   * Registra un nuevo vehículo.
   * NO inserta en CB_PAGO para evitar duplicados con cobros-dev.
   */
  static async crear(datos) {
    const carneLimpio = limpiarCarne(datos.carne_usuario);
    const placaLimpia = datos.placa ? datos.placa.trim().toUpperCase() : '';
    const tipoLimpio = datos.tipo_vehiculo
      ? datos.tipo_vehiculo.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      : 'AUTOMOVIL';

    // Verificar si la placa ya existe para devolver un error claro
    const placaExistente = await Vehiculo.findOne({ where: { VEH_PLACA: placaLimpia }, raw: true });
    if (placaExistente) {
      const error = new Error("Esta placa ya se encuentra registrada en el sistema.");
      error.errorNum = 1; // Usado por el controlador para detectarlo
      throw error;
    }

    const [maxResult] = await sequelize.query(
      'SELECT NVL(MAX(VEH_ID_VEHICULO), 0) + 1 AS NEXT_ID FROM INFRA_DEV.LR_VEHICULO',
      { type: sequelize.QueryTypes.SELECT }
    );

    await Vehiculo.create({
      VEH_ID_VEHICULO: maxResult.NEXT_ID,
      LR_CARNE: carneLimpio,
      VEH_TIPO_VEHICULO: tipoLimpio,
      VEH_PLACA: placaLimpia,
      VEH_MARCA: datos.marca || null,
      VEH_MODELO: datos.modelo || null,
      VEH_COLOR: datos.color || null,
      VEH_ACTIVO: 1,
    });

    // Guardar el plan seleccionado como deuda pendiente (para que no se pierda al salir)
    const vehiculosActivos = await Vehiculo.count({ where: { LR_CARNE: carneLimpio, VEH_ACTIVO: 1 } });
    
    // Si es el primer vehículo y eligió un plan
    if (vehiculosActivos === 1 && datos.plan_id) {
      const planElegido = await PlanParqueo.findOne({ where: { PLN_PLAN: datos.plan_id }, raw: true });
      if (planElegido) {
        const [maxPago] = await sequelize.query('SELECT NVL(MAX(PAG_PAGO), 0) + 1 AS NEXT_ID FROM INFRA_DEV.CB_PAGO', { type: sequelize.QueryTypes.SELECT });
        await Pago.create({
          PAG_PAGO: maxPago.NEXT_ID,
          LR_CARNE: carneLimpio,
          PLN_PLAN: datos.plan_id,
          PAG_MONTO_TOTAL: planElegido.PLN_PRECIO,
          PAG_ESTADO: 'P'
        });
      }
    } else if (vehiculosActivos > 1) {
      // Vehículo extra (Tarifa Administrativa Q.50)
      const [maxPago] = await sequelize.query('SELECT NVL(MAX(PAG_PAGO), 0) + 1 AS NEXT_ID FROM INFRA_DEV.CB_PAGO', { type: sequelize.QueryTypes.SELECT });
      await Pago.create({
        PAG_PAGO: maxPago.NEXT_ID,
        LR_CARNE: carneLimpio,
        PAG_MONTO_TOTAL: 50,
        PAG_ESTADO: 'P'
      });
    }

    return true;
  }
}

module.exports = VehiculoStore;
