const FormaPago = require("../model/forma_pago.model");

class FormaPagoStore {
  static async getAll() {
    return await FormaPago.findAll({
      order: [["FPG_FORMA_PAGO", "ASC"]],
    });
  }

  static async getById(id) {
    return await FormaPago.findByPk(id);
  }

  static async create(data) {
    return await FormaPago.create({
      FPG_FORMA_PAGO: data.FPG_FORMA_PAGO,
      FPG_NOMBRE_FORMA: data.FPG_NOMBRE_FORMA,
      FPG_ESTADO: data.FPG_ESTADO,
    });
  }

  static async update(id, data) {
    return await FormaPago.update(
      {
        FPG_NOMBRE_FORMA: data.FPG_NOMBRE_FORMA,
        FPG_ESTADO: data.FPG_ESTADO,
      },
      {
        where: { FPG_FORMA_PAGO: id },
      },
    );
  }

  static async delete(id) {
    return await FormaPago.destroy({
      where: { FPG_FORMA_PAGO: id },
    });
  }
}

module.exports = FormaPagoStore;
