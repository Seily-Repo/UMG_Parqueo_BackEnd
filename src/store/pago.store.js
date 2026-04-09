const Pago = require("../model/pago.model");

class PagosStore {
  // Obtener todos los pagos
  static async getAll() {
    return await Pago.findAll({
      order: [["PAG_PAGO", "ASC"]],
    });
  }

  // Obtener pago por ID
  static async getById(id) {
    return await Pago.findByPk(id);
  }

  // Crear pago
  static async create(data) {
    return await Pago.create({
      PAG_PAGO: data.PAG_PAGO,
      EST_CARNE: data.EST_CARNE,
      PLN_PLAN: data.PLN_PLAN,
      FPG_FORMA_PAGO: data.FPG_FORMA_PAGO,
      MUL_MULTA: data.MUL_MULTA,
      PAG_FECHA_PAGO: data.PAG_FECHA_PAGO,
      PAG_MONTO_TOTAL: data.PAG_MONTO_TOTAL,
      PAG_ESTADO: data.PAG_ESTADO,
      PAG_FECHA_CREACION: data.PAG_FECHA_CREACION,
      STRIPE_PAYMENT_INTENT_ID: data.STRIPE_PAYMENT_INTENT_ID,
    });
  }

  // Actualizar pago
  static async update(id, data) {
    return await Pago.update(
      {
        PAG_PAGO: data.PAG_PAGO,
        EST_CARNE: data.EST_CARNE,
        PLN_PLAN: data.PLN_PLAN,
        FPG_FORMA_PAGO: data.FPG_FORMA_PAGO,
        MUL_MULTA: data.MUL_MULTA,
        PAG_FECHA_PAGO: data.PAG_FECHA_PAGO,
        PAG_MONTO_TOTAL: data.PAG_MONTO_TOTAL,
        PAG_ESTADO: data.PAG_ESTADO,
        STRIPE_PAYMENT_INTENT_ID: data.STRIPE_PAYMENT_INTENT_ID,
      },
      {
        where: { PAG_PAGO: id },
      },
    );
  }

  // Eliminar pago
  static async delete(id) {
    return await Pago.destroy({
      where: { PAG_PAGO: id },
    });
  }
}

module.exports = PagosStore;
