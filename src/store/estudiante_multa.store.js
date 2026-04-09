const EstudianteMulta = require("../model/estudiante_multa.model");

class EstudianteMultaStore {
  static async getAll() {
    return await EstudianteMulta.findAll({
      order: [["EMU_ESTUDIANTE_MULTA", "ASC"]],
    });
  }

  static async getByEstudianteCarne(EST_CARNE) {
    return await EstudianteMulta.findAll({
      where: { EST_CARNE: EST_CARNE },
    });
  }

  static async create(data) {
    return await EstudianteMulta.create({
      EMU_ESTUDIANTE_MULTA: data.EMU_ESTUDIANTE_MULTA,
      MUL_MULTA: data.MUL_MULTA,
      EST_CARNE: data.EST_CARNE,
      EMU_ESTADO_MULTA: data.EMU_ESTADO_MULTA,
      EMU_CREADO_POR: data.EMU_CREADO_POR,
      EMU_MODIFICADO_POR: null,
      EMU_FECHA_MODIFICACION: null,
    });
  }

  static async update(EMU_ESTUDIANTE_MULTA, data) {
    return await EstudianteMulta.update(
      {
        EMU_ESTADO_MULTA: data.EMU_ESTADO_MULTA,
        EMU_MODIFICADO_POR: data.EMU_MODIFICADO_POR,
        EMU_FECHA_MODIFICACION: new Date(),
      },
      {
        where: {
          EMU_ESTUDIANTE_MULTA: EMU_ESTUDIANTE_MULTA,
        },
      },
    );
  }
}

module.exports = EstudianteMultaStore;
