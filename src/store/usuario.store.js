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

}

module.exports = UsuarioStore;
