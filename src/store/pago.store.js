const { Op } = require("sequelize");
const Pago = require("../model/Pago.model");

const ESTADOS_ACTIVOS = ["P", "A"];
const PAG_PENDIENTE = "P";
const PAG_CANCELADO = "C";

class PagosStore {
  static async getAll() {
    return await Pago.findAll({
      order: [["PAG_PAGO", "DESC"]],
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

  /** Pago pendiente o aceptado para una multa (incluye registros legacy incompletos). */
  static async findActiveByUsuarioMulta(EMU_USUARIO_MULTA) {
    return await Pago.findOne({
      where: {
        EMU_USUARIO_MULTA,
        PAG_ESTADO: { [Op.in]: ESTADOS_ACTIVOS },
      },
      order: [["PAG_PAGO", "DESC"]],
    });
  }

  static async findAcceptedByUsuarioMulta(EMU_USUARIO_MULTA) {
    return await Pago.findOne({
      where: {
        EMU_USUARIO_MULTA,
        PAG_ESTADO: "A",
      },
      order: [["PAG_PAGO", "DESC"]],
    });
  }

  /** Pago pendiente o aceptado para plan + carné (incluye registros legacy incompletos). */
  static async findActiveByPlanAndCarne(PLN_PLAN, LR_CARNE) {
    return await Pago.findOne({
      where: {
        PLN_PLAN,
        LR_CARNE,
        PAG_ESTADO: { [Op.in]: ESTADOS_ACTIVOS },
      },
      order: [["PAG_PAGO", "DESC"]],
    });
  }

  /** Solo pendientes; prioriza filas que ya tienen Payment Intent en Stripe. */
  static async findPendingByPlanAndCarne(PLN_PLAN, LR_CARNE) {
    const conPi = await Pago.findOne({
      where: {
        PLN_PLAN,
        LR_CARNE,
        PAG_ESTADO: PAG_PENDIENTE,
        EMU_USUARIO_MULTA: { [Op.is]: null },
        STRIPE_PAYMENT_INTENT_ID: { [Op.like]: "pi_%" },
      },
      order: [["PAG_PAGO", "DESC"]],
    });

    if (conPi) return conPi;

    return await Pago.findOne({
      where: {
        PLN_PLAN,
        LR_CARNE,
        PAG_ESTADO: PAG_PENDIENTE,
        EMU_USUARIO_MULTA: { [Op.is]: null },
      },
      order: [["PAG_PAGO", "DESC"]],
    });
  }

  static async findPendingByUsuarioMulta(EMU_USUARIO_MULTA) {
    const conPi = await Pago.findOne({
      where: {
        EMU_USUARIO_MULTA,
        PAG_ESTADO: PAG_PENDIENTE,
        STRIPE_PAYMENT_INTENT_ID: { [Op.like]: "pi_%" },
      },
      order: [["PAG_PAGO", "DESC"]],
    });

    if (conPi) return conPi;

    return await Pago.findOne({
      where: {
        EMU_USUARIO_MULTA,
        PAG_ESTADO: PAG_PENDIENTE,
      },
      order: [["PAG_PAGO", "DESC"]],
    });
  }

  static async findAcceptedByPlanAndCarne(PLN_PLAN, LR_CARNE) {
    return await Pago.findOne({
      where: {
        PLN_PLAN,
        LR_CARNE,
        PAG_ESTADO: "A",
        EMU_USUARIO_MULTA: { [Op.is]: null },
      },
      order: [["PAG_PAGO", "DESC"]],
    });
  }

  /** Todos los pagos aceptados de un plan (p. ej. cobros duplicados por vehículo). */
  static async findAllAcceptedByPlanAndCarne(PLN_PLAN, LR_CARNE) {
    return await Pago.findAll({
      where: {
        PLN_PLAN,
        LR_CARNE,
        PAG_ESTADO: "A",
        EMU_USUARIO_MULTA: { [Op.is]: null },
      },
      order: [["PAG_PAGO", "DESC"]],
    });
  }

  /** Deja un solo pago A por plan+carné; cancela aceptados duplicados. */
  static async cancelDuplicateAccepted({
    keepPagoId,
    LR_CARNE,
    PLN_PLAN = null,
    EMU_USUARIO_MULTA = null,
  }) {
    const where = {
      PAG_PAGO: { [Op.ne]: keepPagoId },
      LR_CARNE,
      PAG_ESTADO: "A",
    };

    if (PLN_PLAN != null) {
      where.PLN_PLAN = PLN_PLAN;
      where.EMU_USUARIO_MULTA = { [Op.is]: null };
    }

    if (EMU_USUARIO_MULTA != null) {
      where.EMU_USUARIO_MULTA = EMU_USUARIO_MULTA;
    }

    return await Pago.update({ PAG_ESTADO: PAG_CANCELADO }, { where });
  }

  /** Cancela otros pendientes del mismo concepto (evita duplicados en auditoría). */
  static async cancelDuplicatePending({
    keepPagoId,
    LR_CARNE,
    PLN_PLAN = null,
    EMU_USUARIO_MULTA = null,
  }) {
    const where = {
      PAG_PAGO: { [Op.ne]: keepPagoId },
      LR_CARNE,
      PAG_ESTADO: PAG_PENDIENTE,
    };

    if (PLN_PLAN != null) {
      where.PLN_PLAN = PLN_PLAN;
      where.EMU_USUARIO_MULTA = { [Op.is]: null };
    }

    if (EMU_USUARIO_MULTA != null) {
      where.EMU_USUARIO_MULTA = EMU_USUARIO_MULTA;
    }

    return await Pago.update({ PAG_ESTADO: PAG_CANCELADO }, { where });
  }

  /** Completa un registro huérfano; si onlyMissing=true no sobrescribe campos ya guardados. */
  static async completePagoRecord(pagoId, data, { onlyMissing = false } = {}) {
    if (!onlyMissing) {
      return await Pago.update(
        {
          LR_CARNE: data.LR_CARNE,
          PLN_PLAN: data.PLN_PLAN ?? null,
          EMU_USUARIO_MULTA: data.EMU_USUARIO_MULTA ?? null,
          FPG_FORMA_PAGO: data.FPG_FORMA_PAGO,
          PAG_MONTO_TOTAL: data.PAG_MONTO_TOTAL,
          PAG_ESTADO: data.PAG_ESTADO ?? PAG_PENDIENTE,
          PAG_FECHA_CREACION: data.PAG_FECHA_CREACION ?? new Date(),
          PAG_FECHA_PAGO: data.PAG_FECHA_PAGO ?? new Date(),
          STRIPE_PAYMENT_INTENT_ID: data.STRIPE_PAYMENT_INTENT_ID,
          PAG_ESTADO_REGISTRO: "A",
        },
        { where: { PAG_PAGO: pagoId } },
      );
    }

    const row = await Pago.findOne({ where: { PAG_PAGO: pagoId } });
    if (!row) return [0];

    const updates = { PAG_ESTADO_REGISTRO: "A" };

    if (!row.LR_CARNE && data.LR_CARNE) updates.LR_CARNE = data.LR_CARNE;
    if (row.PLN_PLAN == null && data.PLN_PLAN != null) {
      updates.PLN_PLAN = data.PLN_PLAN;
    }
    if (row.EMU_USUARIO_MULTA == null && data.EMU_USUARIO_MULTA != null) {
      updates.EMU_USUARIO_MULTA = data.EMU_USUARIO_MULTA;
    }
    if (!row.FPG_FORMA_PAGO && data.FPG_FORMA_PAGO) {
      updates.FPG_FORMA_PAGO = data.FPG_FORMA_PAGO;
    }
    if (
      (row.PAG_MONTO_TOTAL == null || Number(row.PAG_MONTO_TOTAL) <= 0) &&
      data.PAG_MONTO_TOTAL > 0
    ) {
      updates.PAG_MONTO_TOTAL = data.PAG_MONTO_TOTAL;
    }
    if (!row.PAG_FECHA_CREACION && data.PAG_FECHA_CREACION) {
      updates.PAG_FECHA_CREACION = data.PAG_FECHA_CREACION;
    }
    if (
      data.STRIPE_PAYMENT_INTENT_ID?.startsWith("pi_") &&
      (!row.STRIPE_PAYMENT_INTENT_ID ||
        row.STRIPE_PAYMENT_INTENT_ID === PAG_PENDIENTE ||
        !row.STRIPE_PAYMENT_INTENT_ID.startsWith("pi_"))
    ) {
      updates.STRIPE_PAYMENT_INTENT_ID = data.STRIPE_PAYMENT_INTENT_ID;
    }
    if (row.PAG_ESTADO == null && data.PAG_ESTADO) {
      updates.PAG_ESTADO = data.PAG_ESTADO;
    }

    if (Object.keys(updates).length <= 1) return [0];

    return await Pago.update(updates, { where: { PAG_PAGO: pagoId } });
  }

  static async create(data) {
    return await Pago.create({
      LR_CARNE: data.LR_CARNE,
      PLN_PLAN: data.PLN_PLAN,
      FPG_FORMA_PAGO: data.FPG_FORMA_PAGO,
      EMU_USUARIO_MULTA: data.EMU_USUARIO_MULTA,
      PAG_FECHA_PAGO: data.PAG_FECHA_PAGO,
      PAG_MONTO_TOTAL: data.PAG_MONTO_TOTAL,
      PAG_ESTADO: data.PAG_ESTADO,
      PAG_FECHA_CREACION: data.PAG_FECHA_CREACION,
      STRIPE_PAYMENT_INTENT_ID: data.STRIPE_PAYMENT_INTENT_ID,
      PAG_ESTADO_REGISTRO: data.PAG_ESTADO_REGISTRO || "A",
    });
  }

  static async update(id, data) {
    return await Pago.update(data, {
      where: { PAG_PAGO: id },
    });
  }
}

module.exports = PagosStore;
