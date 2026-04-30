const Usuario = require("../model/usuario.model");

class UsuarioStore {
  static async getAll() {
    return await Usuario.findAll({
      order: [["LR_CARNE", "ASC"]],
    });
  }

  static async getByCarne(carne) {
    return await Usuario.findOne({
      where: { LR_CARNE: carne },
    });
  }

  static async create(data) {
    return await Usuario.create({
      LR_CARNE: data.LR_CARNE,
      LR_NOMBRE_COMPLETO: data.LR_NOMBRE_COMPLETO,
      LR_CORREO_INSTITUCIONAL: data.LR_CORREO_INSTITUCIONAL,
      LR_ESTADO_REGISTRO: data.LR_ESTADO_REGISTRO,
    });
  }

  static async update(carne, data) {
    return await Usuario.update(
      {
        LR_NOMBRE_COMPLETO: data.LR_NOMBRE_COMPLETO,
        LR_CORREO_INSTITUCIONAL: data.LR_CORREO_INSTITUCIONAL,
      },
      {
        where: { LR_CARNE: carne },
      },
    );
  }

}

module.exports = UsuarioStore;
