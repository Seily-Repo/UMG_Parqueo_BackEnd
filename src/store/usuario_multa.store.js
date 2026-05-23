const UsuarioMulta = require("../model/usuario_multa.model");
const { sequelize } = require("../config/db");

const ENRICHED_SELECT = `
  SELECT M.*,
         CB.MUL_DESCRIPCION, CB.MUL_MONTO_TOTAL,
         V.VEH_PLACA, V.VEH_TIPO_VEHICULO, V.VEH_MARCA, V.VEH_MODELO,
         U.LR_CARNE, U.LR_NOMBRES, U.LR_APELLIDOS, U.LR_CORREO_INSTITUCIONAL
`;

const ENRICHED_JOINS = `
  FROM CB_USUARIO_MULTA M
  INNER JOIN LR_VEHICULO V ON M.VEH_ID_VEHICULO = V.VEH_ID_VEHICULO
  INNER JOIN LR_USUARIO U ON V.LR_CARNE = U.LR_CARNE
  INNER JOIN CB_MULTA CB ON M.MUL_MULTA = CB.MUL_MULTA
`;

class UsuarioMultaStore {
  static async getAll() {
    const query = `
      ${ENRICHED_SELECT}
      ${ENRICHED_JOINS}
      ORDER BY M.EMU_USUARIO_MULTA ASC
    `;
    return sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
  }

  static async getByVehiculo(VEH_ID_VEHICULO) {
    const query = `
      ${ENRICHED_SELECT}
      ${ENRICHED_JOINS}
      WHERE M.VEH_ID_VEHICULO = :vehId
      ORDER BY M.EMU_USUARIO_MULTA ASC
    `;
    return sequelize.query(query, {
      replacements: { vehId: VEH_ID_VEHICULO },
      type: sequelize.QueryTypes.SELECT,
    });
  }

  static async getById(EMU_USUARIO_MULTA) {
    return await UsuarioMulta.findOne({
      where: { EMU_USUARIO_MULTA },
    });
  }

  static async getByCarneWithMulta(carne) {
    const query = `
      ${ENRICHED_SELECT}
      ${ENRICHED_JOINS}
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
      ${ENRICHED_SELECT}
      ${ENRICHED_JOINS}
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
      },
    );
  }
}

module.exports = UsuarioMultaStore;
