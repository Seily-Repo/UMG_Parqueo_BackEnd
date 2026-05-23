const Vehiculo = require('../model/vehiculo.model');
const { UsuarioMulta, Multa } = require('../model/catalogos.model');
const { sequelize } = require('../config/db');
const { limpiarCarne } = require('../utils/helpers');

class MultaStore {
  /**
   * Asigna una multa a un usuario: crea CB_USUARIO_MULTA.
   * NO inserta en CB_PAGO — eso lo hace cobros-dev.
   * Retorna el EMU_USUARIO_MULTA generado y el monto de la multa.
   */
  static async asignar(carne, placa, idMulta) {
    const carneLimpio = limpiarCarne(carne);

    const t = await sequelize.transaction();
    try {
      // Buscar vehículo por placa y carné
      const vehiculo = await Vehiculo.findOne({
        where: { LR_CARNE: carneLimpio, VEH_PLACA: placa.toUpperCase() },
        raw: true,
        transaction: t,
      });

      if (!vehiculo) {
        await t.rollback();
        return { error: "No se encontró el vehículo con esa placa asignado a este carné." };
      }

      // Insertar en CB_USUARIO_MULTA
      const nuevaMulta = await UsuarioMulta.create({
        MUL_MULTA: parseInt(idMulta),
        VEH_ID_VEHICULO: vehiculo.VEH_ID_VEHICULO,
        EMU_ESTADO_MULTA: 'A',
      }, { transaction: t });

      // Obtener monto de la multa
      const multa = await Multa.findOne({
        where: { MUL_MULTA: parseInt(idMulta) },
        raw: true,
        transaction: t,
      });

      await t.commit();
      return {
        idUsuarioMulta: nuevaMulta.EMU_USUARIO_MULTA,
        monto: multa.MUL_MONTO_TOTAL,
      };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
}

module.exports = MultaStore;
