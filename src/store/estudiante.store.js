const Estudiante = require('../model/estudiante.model');

class EstudianteStore {
    
    static async getAll() {
        return await Estudiante.findAll({
            order: [['EST_ID_ESTUDIANTE', 'ASC']]
        });
    }

    static async getById(id) {
        return await Estudiante.findByPk(id);
    }

    static async getByCarne(carne) {
        return await Estudiante.findOne({
            where: { EST_CARNE: carne }
        });
    }

    static async create(data) {
        return await Estudiante.create({
            EST_ID_ESTUDIANTE: data.EST_ID_ESTUDIANTE,
            EST_CARNE: data.EST_CARNE,
            EST_NOMBRE_COMPLETO: data.EST_NOMBRE_COMPLETO
        });
    }

    static async update(id, data) {
        return await Estudiante.update({
            EST_CARNE: data.EST_CARNE,
            EST_NOMBRE_COMPLETO: data.EST_NOMBRE_COMPLETO
        }, {
            where: { EST_ID_ESTUDIANTE: id }
        });
    }

    static async delete(id) {
        return await Estudiante.destroy({
            where: { EST_ID_ESTUDIANTE: id }
        });
    }
}

module.exports = EstudianteStore;
