const { Op } = require("sequelize");
const Pago = require("../model/Pago.model");

const ESTADOS_ACTIVOS = ["P", "A"];

class PagosStore {
  static async getAll() {
    return await Pago.findAll({
      order: [["PAG_PAGO", "ASC"]],
    });
  }

  static async getById(id) {
    return await Pago.findOne({
      where: { PAG_PAGO: id },
    });
  }

  static async getByPi(pi) {
    return await Pago.findOne({
      where: { STRIPE_PAYMENT_INTENT_ID: pi },
    });
  }

  static async getByCarne(carne) {
    return await Pago.findAll({
      where: { LR_CARNE: carne },
      order: [["PAG_FECHA_CREACION", "DESC"]],
    });
  }

  /** Pago pendiente o aceptado para una multa (idempotencia). */
  static async findActiveByUsuarioMulta(EMU_USUARIO_MULTA) {
    return await Pago.findOne({
      where: {
        EMU_USUARIO_MULTA,
        PAG_ESTADO: { [Op.in]: ESTADOS_ACTIVOS },
        PAG_ESTADO_REGISTRO: "A",
      },
      order: [["PAG_FECHA_CREACION", "DESC"]],
    });
  }

  /** Pago pendiente o aceptado para un plan + carné (idempotencia). */
  static async findActiveByPlanAndCarne(PLN_PLAN, LR_CARNE) {
    return await Pago.findOne({
      where: {
        PLN_PLAN,
        LR_CARNE,
        PAG_ESTADO: { [Op.in]: ESTADOS_ACTIVOS },
        PAG_ESTADO_REGISTRO: "A",
      },
      order: [["PAG_FECHA_CREACION", "DESC"]],
    });
  }

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

  static async update(id, data) {
    return await Pago.update(data, {
      where: { PAG_PAGO: id },
    });
  }
}

module.exports = PagosStore;
