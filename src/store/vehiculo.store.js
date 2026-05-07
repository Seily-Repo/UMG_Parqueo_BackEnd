const Vehiculo = require('../model/vehiculo.model');
const { limpiarCarne } = require('../utils/helpers');

class VehiculoStore {
  /**
   * Obtiene los vehículos activos de un usuario por carné.
   * Retorna las llaves que espera Dashboard.tsx:
   * ID_VEHICULO, TIPO_VEHICULO, PLACA, MARCA, MODELO, COLOR, ACTIVO
   */
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

    await Vehiculo.create({
      LR_CARNE: carneLimpio,
      VEH_TIPO_VEHICULO: tipoLimpio,
      VEH_PLACA: placaLimpia,
      VEH_MARCA: datos.marca || null,
      VEH_MODELO: datos.modelo || null,
      VEH_COLOR: datos.color || null,
      VEH_ACTIVO: 1,
    });
    return true;
  }
}

module.exports = VehiculoStore;
