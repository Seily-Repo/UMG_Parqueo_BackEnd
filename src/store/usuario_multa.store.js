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

  static async getByCarneWithMulta(carne) {
    const query = `
      SELECT M.*, CB.MUL_DESCRIPCION, CB.MUL_MONTO_TOTAL
      FROM CB_USUARIO_MULTA M
      INNER JOIN LR_VEHICULO V ON M.VEH_ID_VEHICULO = V.VEH_ID_VEHICULO
      INNER JOIN CB_MULTA CB ON M.MUL_MULTA = CB.MUL_MULTA
      WHERE V.LR_CARNE = :carne
      ORDER BY M.EMU_USUARIO_MULTA ASC
    `;
    return sequelize.query(query, {
      replacements: { carne },
      type: sequelize.QueryTypes.SELECT,
    });
  }

  static async getByIdWithMulta(EMU_USUARIO_MULTA, carne = null) {
    const query = `
      SELECT M.*, CB.MUL_DESCRIPCION, CB.MUL_MONTO_TOTAL
      FROM CB_USUARIO_MULTA M
      INNER JOIN CB_MULTA CB ON M.MUL_MULTA = CB.MUL_MULTA
      INNER JOIN LR_VEHICULO V ON M.VEH_ID_VEHICULO = V.VEH_ID_VEHICULO
      WHERE M.EMU_USUARIO_MULTA = :id
      ${carne ? "AND V.LR_CARNE = :carne" : ""}
    `;
    const replacements = { id: EMU_USUARIO_MULTA };
    if (carne) replacements.carne = carne;
    const rows = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });
    return rows[0] || null;
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
