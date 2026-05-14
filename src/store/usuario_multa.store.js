const UsuarioMulta = require("../model/usuario_multa.model");
const { sequelize } = require("../config/db");


class UsuarioMultaStore {
  static async getAll() {
    return await UsuarioMulta.findAll({
      order: [["EMU_USUARIO_MULTA", "ASC"]],
    });
  }

  static async getByVehiculo(VEH_ID_VEHICULO) {
    return await UsuarioMulta.findAll({
      where: { VEH_ID_VEHICULO },
      order: [["EMU_USUARIO_MULTA", "ASC"]],
    });
  }

  static async getById(EMU_USUARIO_MULTA) {
    return await UsuarioMulta.findOne({
      where: { EMU_USUARIO_MULTA },
    });
  }

  static async create(data) {
    return await UsuarioMulta.create({
      MUL_MULTA: data.MUL_MULTA,
      VEH_ID_VEHICULO: data.VEH_ID_VEHICULO,
      EMU_ESTADO_MULTA: data.EMU_ESTADO_MULTA,
      EMU_CREADO_POR: data.EMU_CREADO_POR || "ADMIN",
      EMU_FECHA_CREACION: data.EMU_FECHA_CREACION || new Date(),
      EMU_MODIFICADO_POR: data.EMU_MODIFICADO_POR,
      EMU_FECHA_MODIFICACION: data.EMU_FECHA_MODIFICACION,
      EMU_ESTADO_REGISTRO: data.EMU_ESTADO_REGISTRO || "A",
    });
  }

  static async update(EMU_USUARIO_MULTA, data) {
    return await UsuarioMulta.update(
      {
        EMU_ESTADO_MULTA: data.EMU_ESTADO_MULTA,
        EMU_MODIFICADO_POR: data.EMU_MODIFICADO_POR,
        EMU_FECHA_MODIFICACION: new Date(),
        EMU_ESTADO_REGISTRO: data.EMU_ESTADO_REGISTRO,
      },
      {
        where: { EMU_USUARIO_MULTA },
      }
    );
  }
}

module.exports = UsuarioMultaStore;
