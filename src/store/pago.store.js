const Pago = require("../model/Pago.model");

class PagosStore {
  // Obtener todos los pagos
  static async getAll() {
    return await Pago.findAll({
      order: [["PAG_PAGO", "ASC"]],
    });
  }

  // Obtener pago por ID
  static async getById(id) {
    return await Pago.findOne({
      where: { PAG_PAGO: id },
    });
  }

  // Obtener pago por ID de Stripe
  static async getByPi(pi) {
    return await Pago.findOne({
      where: { STRIPE_PAYMENT_INTENT_ID: pi },
    });
  }

  // Obtener pagos por carné
  static async getByCarne(carne) {
    return await Pago.findAll({
      where: { LR_CARNE: carne },
      order: [["PAG_FECHA_CREACION", "DESC"]],
    });
  }

  // Crear pago
  static async create(data) {
    return await Pago.create({
      PAG_PAGO: data.PAG_PAGO,
      LR_CARNE: data.LR_CARNE,
      PLN_PLAN: data.PLN_PLAN,
      FPG_FORMA_PAGO: data.FPG_FORMA_PAGO,
      EMU_USUARIO_MULTA: data.EMU_USUARIO_MULTA,
      PAG_FECHA_PAGO: data.PAG_FECHA_PAGO,
      PAG_MONTO_TOTAL: data.PAG_MONTO_TOTAL,
      PAG_ESTADO: data.PAG_ESTADO,
      PAG_FECHA_CREACION: data.PAG_FECHA_CREACION,
      STRIPE_PAYMENT_INTENT_ID: data.STRIPE_PAYMENT_INTENT_ID,
      PAG_ESTADO_REGISTRO: data.PAG_ESTADO_REGISTRO,
    });
  }

  // Actualizar pago
  static async update(id, data) {
    return await Pago.update(data, {
      where: { PAG_PAGO: id },
    });
  }

}

module.exports = PagosStore;
