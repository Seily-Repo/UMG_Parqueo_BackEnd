const Multa = require("../model/multa.model");

class MultaStore {
  static async getAll() {
    return await Multa.findAll({
      order: [["MUL_MULTA", "ASC"]],
    });
  }

  static async getById(MUL_MULTA) {
    return await Multa.findOne({
      where: { MUL_MULTA: MUL_MULTA },
    });
  }

  static async getByDescripcion(MUL_DESCRIPCION) {
    return await Multa.findOne({
      where: { MUL_DESCRIPCION: MUL_DESCRIPCION },
    });
  }

  static async create(data) {
    return await Multa.create({
      MUL_MULTA: data.MUL_MULTA,
      MUL_MONTO_TOTAL: data.MUL_MONTO_TOTAL,
      MUL_DESCRIPCION: data.MUL_DESCRIPCION,
      MUL_FECHA: data.MUL_FECHA,
      MUL_FECHA_VENCIMIENTO: data.MUL_FECHA_VENCIMIENTO,
      MUL_CREADO_POR: data.MUL_CREADO_POR,
      MUL_FECHA_CREACION: data.MUL_FECHA_CREACION || new Date(),
      MUL_MODIFICADO_POR: data.MUL_MODIFICADO_POR,
      MUL_FECHA_MODIFICACION: data.MUL_FECHA_MODIFICACION,
    });
  }

  static async update(id, data) {
    return await Multa.update(
      {
        MUL_MONTO_TOTAL: data.MUL_MONTO_TOTAL,
        MUL_DESCRIPCION: data.MUL_DESCRIPCION,
        MUL_FECHA_VENCIMIENTO: data.MUL_FECHA_VENCIMIENTO,
        MUL_MODIFICADO_POR: data.MUL_MODIFICADO_POR,
        MUL_FECHA_MODIFICACION: new Date(), // Se actualiza automáticamente al editar
      },
      {
        where: { MUL_MULTA: id },
      },
    );
  }
}

module.exports = MultaStore;
