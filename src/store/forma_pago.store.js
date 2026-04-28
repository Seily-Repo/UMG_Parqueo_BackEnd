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
      FPG_NOMBRE_FORMA: data.FPG_NOMBRE_FORMA,
      FPG_ESTADO_REGISTRO: 'A',
    });
  }

  static async updateEstado(id, nuevoEstado) {
    return await FormaPago.update(
      {
        FPG_ESTADO_REGISTRO: nuevoEstado,
      },
      {
        where: { FPG_FORMA_PAGO: id },
      }
    );
  }
}

module.exports = FormaPagoStore;