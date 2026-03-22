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
            where: { PQ_Parqueo: parqueoId } 
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
}

module.exports = EspacioStore;