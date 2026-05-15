const IslaDetalle = require('../model/islaDetalle.model');

class IslaDetalleStore {
    static async create(id_isla, id_espacio) {
        return await IslaDetalle.create({
            IS_ISLA: id_isla,
            ES_ESPACIO: id_espacio
        });
    }

   
    static async bulkCreate(dataArray) {
        return await IslaDetalle.bulkCreate(dataArray);
    }

    static async getByIsla(id_isla) {
        return await IslaDetalle.findAll({
            where: { IS_ISLA: id_isla },
            order: [['ES_ESPACIO', 'ASC']] 
        });
    }

    static async deleteByIsla(id_isla) {
        return await IslaDetalle.destroy({
            where: { IS_ISLA: id_isla }
        });
    }
}

module.exports = IslaDetalleStore;