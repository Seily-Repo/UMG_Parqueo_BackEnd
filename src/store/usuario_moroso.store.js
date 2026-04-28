const UsuarioMoroso = require("../model/usuario_moroso.model");

class UsuarioMorosoStore {
  static async getAll() {
    return await UsuarioMoroso.findAll({
      order: [["MOR_USUARIO_MOROSO", "ASC"]],
    });
  }

  static async getByCarne(LR_CARNE) {
    return await UsuarioMoroso.findAll({
      where: { LR_CARNE },
    });
  }

  static async getById(MOR_USUARIO_MOROSO) {
    return await UsuarioMoroso.findOne({
      where: { MOR_USUARIO_MOROSO },
    });
  }

  static async create(data) {
    return await UsuarioMoroso.create({
      LR_CARNE: data.LR_CARNE,
      MOR_FECHA_AGREGADO: data.MOR_FECHA_AGREGADO,
      MOR_MOTIVO: data.MOR_MOTIVO,
      MOR_MODIFICADO_POR: data.MOR_MODIFICADO_POR,
      MOR_FECHA_MODIFICACION: data.MOR_FECHA_MODIFICACION,
      MOR_ESTADO_MOROSO: data.MOR_ESTADO_MOROSO,
      MOR_ESTADO_REGISTRO: data.MOR_ESTADO_REGISTRO,
    });
  }

  static async update(MOR_USUARIO_MOROSO, data) {
    return await UsuarioMoroso.update(
      {
        MOR_MOTIVO: data.MOR_MOTIVO,
        MOR_MODIFICADO_POR: data.MOR_MODIFICADO_POR,
        MOR_FECHA_MODIFICACION: data.MOR_FECHA_MODIFICACION,
        MOR_ESTADO_MOROSO: data.MOR_ESTADO_MOROSO,
        MOR_ESTADO_REGISTRO: data.MOR_ESTADO_REGISTRO,
      },
      {
        where: { MOR_USUARIO_MOROSO },
      },
    );
  }
}

module.exports = UsuarioMorosoStore;
