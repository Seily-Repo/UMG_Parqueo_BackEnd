const Multa = require("../model/multa.model");
const { Op } = require("sequelize");

class MultaStore {
  static async getAll() {
    return await Multa.findAll({
      where: { MUL_ESTADO_REGISTRO: 'A' },
      order: [["MUL_MULTA", "ASC"]],
    });
  }

  static async getById(MUL_MULTA) {
    return await Multa.findOne({
      where: { 
        MUL_MULTA: MUL_MULTA,
        MUL_ESTADO_REGISTRO: 'A' 
      },
    });
  }

  static async getByDescripcion(MUL_DESCRIPCION) {
    return await Multa.findAll({
      where: {
        MUL_DESCRIPCION: {
          [Op.like]: `%${MUL_DESCRIPCION}%`
        },
        MUL_ESTADO_REGISTRO: 'A'
      },
    });
  }

  static async create(data) {
    return await Multa.create({
      MUL_MONTO_TOTAL: data.MUL_MONTO_TOTAL,
      MUL_DESCRIPCION: data.MUL_DESCRIPCION,
      MUL_DIAS_VENCIMIENTO: data.MUL_DIAS_VENCIMIENTO,
      MUL_CREADO_POR: data.MUL_CREADO_POR || 'ADMIN',
      MUL_FECHA_CREACION: new Date(),
      MUL_ESTADO_REGISTRO: 'A'
    });
  }

  static async update(id, data) {
    return await Multa.update(
      {
        MUL_MONTO_TOTAL: data.MUL_MONTO_TOTAL,
        MUL_DESCRIPCION: data.MUL_DESCRIPCION,
        MUL_DIAS_VENCIMIENTO: data.MUL_DIAS_VENCIMIENTO,
        MUL_MODIFICADO_POR: data.MUL_MODIFICADO_POR,
        MUL_FECHA_MODIFICACION: new Date(),
        MUL_ESTADO_REGISTRO: data.MUL_ESTADO_REGISTRO || 'A'
      },
      {
        where: { MUL_MULTA: id },
      },
    );
  }
}

module.exports = MultaStore;