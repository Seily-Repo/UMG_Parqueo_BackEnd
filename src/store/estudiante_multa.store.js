const EstudianteMulta = require("../model/estudiante_multa.model");

class EstudianteMultaStore {
  static async getAll() {
    return await EstudianteMulta.findAll({
      order: [["EMU_ID_EST_MULTA", "ASC"]],
    });
  }

  static async getByEstudianteCarne(EST_CARNE_ESTUDIANTE) {
    return await EstudianteMulta.findAll({
      where: { EST_CARNE_ESTUDIANTE: EST_CARNE_ESTUDIANTE },
    });
  }

  static async create(data) {
    return await EstudianteMulta.create({
      EMU_ID_EST_MULTA: data.EMU_ID_EST_MULTA,
      MUL_ID_MULTA: data.MUL_ID_MULTA,
      EST_CARNE_ESTUDIANTE: data.EST_CARNE_ESTUDIANTE,
      EST_ID_ESTUDIANTE: data.EST_ID_ESTUDIANTE,
      EMU_ESTADO_MULTA: data.EMU_ESTADO_MULTA,
      EMU_CREADO_POR: data.EMU_CREADO_POR,
      EMU_MODIFICADO_POR: null,
      EMU_FECHA_MODIFICACION: null,
    });
  }

  static async update(EMU_ID_EST_MULTA, data) {
    return await EstudianteMulta.update(
      {
        EMU_ESTADO_MULTA: data.EMU_ESTADO_MULTA,
        EMU_MODIFICADO_POR: data.EMU_MODIFICADO_POR,
        EMU_FECHA_MODIFICACION: new Date(),
      },
      {
        where: {
          EMU_ID_EST_MULTA: EMU_ID_EST_MULTA,
        },
      },
    );
  }
}

module.exports = EstudianteMultaStore;
