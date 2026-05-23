const { Op } = require("sequelize");
const UsuarioMulta = require("../model/usuario_multa.model");
const Multa = require("../model/multa.model");
const { sequelize } = require("../config/db");

const MULTA_AS = "Multa";

UsuarioMulta.belongsTo(Multa, {
  foreignKey: "MUL_MULTA",
  targetKey: "MUL_MULTA",
  as: MULTA_AS,
});

const MULTA_INCLUDE = {
  model: Multa,
  as: MULTA_AS,
  attributes: ["MUL_DESCRIPCION", "MUL_MONTO_TOTAL"],
  required: true,
};

const defaultOrder = [["EMU_USUARIO_MULTA", "ASC"]];

const vehiculosPorCarne = (carne) =>
  sequelize.literal(
    "(SELECT VEH_ID_VEHICULO FROM LR_VEHICULO WHERE LR_CARNE = :carne)",
  );

class UsuarioMultaStore {
  static async getAll() {
    return await UsuarioMulta.findAll({
      include: [MULTA_INCLUDE],
      order: defaultOrder,
    });
  }

  static async getByVehiculo(VEH_ID_VEHICULO) {
    return await UsuarioMulta.findAll({
      where: { VEH_ID_VEHICULO },
      include: [MULTA_INCLUDE],
      order: defaultOrder,
    });
  }

  static async getByCarne(carne) {
    return await UsuarioMulta.findAll({
      where: {
        VEH_ID_VEHICULO: {
          [Op.in]: vehiculosPorCarne(carne),
        },
      },
      include: [MULTA_INCLUDE],
      replacements: { carne },
      order: defaultOrder,
    });
  }

  static async getById(EMU_USUARIO_MULTA, carne = null) {
    const where = { EMU_USUARIO_MULTA };
    const options = {
      where,
      include: [MULTA_INCLUDE],
    };

    if (carne) {
      where.VEH_ID_VEHICULO = {
        [Op.in]: vehiculosPorCarne(carne),
      };
      options.replacements = { carne };
    }

    return await UsuarioMulta.findOne(options);
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
      },
    );
  }
}

module.exports = UsuarioMultaStore;
