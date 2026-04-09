const Estudiante = require("../model/estudiante.model");

class EstudianteStore {
  static async getAll() {
    return await Estudiante.findAll({
      order: [["EST_CARNE", "ASC"]],
    });
  }

  static async getByCarne(carne) {
    return await Estudiante.findOne({
      where: { EST_CARNE: carne },
    });
  }

  static async create(data) {
    return await Estudiante.create({
      EST_CARNE: data.EST_CARNE,
      EST_NOMBRE_COMPLETO: data.EST_NOMBRE_COMPLETO,
      EST_EMAIL: data.EST_EMAIL,
      EST_FECHA_CREACION: data.EST_FECHA_CREACION,
    });
  }

  static async update(carne, data) {
    return await Estudiante.update(
      {
        EST_NOMBRE_COMPLETO: data.EST_NOMBRE_COMPLETO,
        EST_EMAIL: data.EST_EMAIL,
      },
      {
        where: { EST_CARNE: carne },
      },
    );
  }

  static async delete(carne) {
    return await Estudiante.destroy({
      where: { EST_CARNE: carne },
    });
  }
}

module.exports = EstudianteStore;
