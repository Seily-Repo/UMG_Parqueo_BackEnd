const Espacio = require('../model/espacio.model');

class EspacioStore {
    static async getAll() {
        return await Espacio.findAll({ 
            order: [['ES_Espacio', 'ASC']] 
        });
    }

     static async getById(id) {
        return await Espacio.findByPk(id); 
    }

    static async getByParqueoId(parqueoId) {
        return await Espacio.findAll({ 
            where: { PQ_Parqueo: parqueoId },
            order: [['ES_Numero', 'ASC']]
        });
    }

    static async create(data) {
        return await Espacio.create({
            ES_Numero: data.ES_Numero,
            ES_Estado: data.ES_Estado,
            PQ_Parqueo: data.PQ_Parqueo
        });
    }

    static async update(id, data) {
        return await Espacio.update({
            ES_Numero: data.ES_Numero,
            ES_Estado: data.ES_Estado,
            PQ_Parqueo: data.PQ_Parqueo
        }, {
            where: { ES_Espacio: id }
        });
    }

    static async delete(id) {
        return await Espacio.destroy({
            where: { ES_Espacio: id }
        });
    }

   static async getEspaciosLibres(parqueoId, semestre, jornada) {
        const asignacionesActivas = await Asignacion.findAll({
            attributes: ['ES_Espacio'], 
            where: {
                SM_Semestre: semestre,
                JD_Jornada: jornada,
                AS_Estado: 1 
            }
        });

        const espaciosOcupadosIds = asignacionesActivas.map(a => a.ES_Espacio);

        return await Espacio.findAll({
            where: {
                PQ_Parqueo: parqueoId,
                ES_Estado: 1, 
                ES_Espacio: {
                    [Op.notIn]: espaciosOcupadosIds.length > 0 ? espaciosOcupadosIds : [0] 
                }
            },
            order: [['ES_Numero', 'ASC']]
        });
    }
}
    


module.exports = EspacioStore;