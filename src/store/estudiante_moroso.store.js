const EstudianteMoroso = require("../model/estudiante_moroso.model");

class EstudianteMorosoStore {
  static async getAll() {
    return await EstudianteMoroso.findAll({
      order: [["MOR_BLACKLIST_LOG", "ASC"]],
    });
  }

  static async getByCarne(EST_CARNE) {
    return await EstudianteMoroso.findAll({
      where: { EST_CARNE },
    });
  }

  static async getById(MOR_BLACKLIST_LOG) {
    return await EstudianteMoroso.findOne({
      where: { MOR_BLACKLIST_LOG },
    });
  }

  static async create(data) {
    return await EstudianteMoroso.create({
      MOR_BLACKLIST_LOG: data.MOR_BLACKLIST_LOG,
      EST_CARNE: data.EST_CARNE,
      MOR_FECHA_AGREGADO: data.MOR_FECHA_AGREGADO,
      MOR_MOTIVO: data.MOR_MOTIVO,
      MOR_ESTADO: data.MOR_ESTADO,
    });
  }

  static async update(MOR_BLACKLIST_LOG, data) {
    return await EstudianteMoroso.update(
      {
        EST_CARNE: data.EST_CARNE,
        MOR_FECHA_AGREGADO: data.MOR_FECHA_AGREGADO,
        MOR_MOTIVO: data.MOR_MOTIVO,
        MOR_ESTADO: data.MOR_ESTADO,
      },
      {
        where: { MOR_BLACKLIST_LOG },
      },
    );
  }
}

module.exports = EstudianteMorosoStore;
