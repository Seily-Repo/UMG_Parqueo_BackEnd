const Vehiculo = require('../model/vehiculo.model');
const { limpiarCarne } = require('../utils/helpers');
const { sequelize } = require('../config/db');
const PagoStore = require('./pago.store');

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

    // Verificar límite de 3 vehículos
    const vehiculosActivosPrevios = await Vehiculo.count({ where: { LR_CARNE: carneLimpio, VEH_ACTIVO: 1 } });
    if (vehiculosActivosPrevios >= 3) {
      const error = new Error("Has alcanzado el límite máximo de 3 vehículos registrados.");
      error.errorNum = 2; // O un código personalizado
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

    // La deuda de plan se calcula en lista-pendiente; cobros-dev crea el único CB_PAGO al pagar.
    // Cancelamos pendientes viejos de plan para no duplicar filas (ej. moto Q150 + carro Q350).
    await PagoStore.cancelarPagosPlanPendientesObsoletos(carneLimpio);

    return true;
  }

  /**
   * Verifica si el vehículo tiene multas activas pendientes de pago
   */
  static async tieneMultasActivas(idVehiculo) {
    const query = `
      SELECT COUNT(*) AS conteo
      FROM INFRA_DEV.CB_USUARIO_MULTA um
      WHERE um.VEH_ID_VEHICULO = :idVehiculo
        AND um.EMU_ESTADO_MULTA IN ('A', 'P')
        AND NOT EXISTS (
          SELECT 1 FROM INFRA_DEV.CB_PAGO p 
          WHERE p.EMU_USUARIO_MULTA = um.EMU_USUARIO_MULTA 
            AND p.PAG_ESTADO IN ('C', 'A')
        )
    `;
    const [result] = await sequelize.query(query, { replacements: { idVehiculo } });
    return result[0].CONTEO > 0;
  }

  /**
   * Borrado lógico del vehículo
   */
  static async desactivar(idVehiculo) {
    await Vehiculo.update({ VEH_ACTIVO: 0 }, { where: { VEH_ID_VEHICULO: idVehiculo } });
  }
}

module.exports = VehiculoStore;
