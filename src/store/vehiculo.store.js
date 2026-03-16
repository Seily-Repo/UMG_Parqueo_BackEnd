const Vehiculo = require('../model/vehiculo.model');

class VehiculoStore {

    static async getAll() {
        return await Vehiculo.findAll({
            order: [['VH_Vehiculo', 'ASC']]
        });
    }

    static async getById(id) {
        return await Vehiculo.findByPk(id);
    }

    static async create(data) {
        return await Vehiculo.create({
            VH_Vehiculo: data.VH_Vehiculo,
            VH_Placa: data.VH_Placa,
            VH_Marca: data.VH_Marca,
            VH_Modelo: data.VH_Modelo,
            US_Identificacion: data.US_Identificacion
        });
    }

    static async update(id, data) {
        return await Vehiculo.update({
            VH_Placa: data.VH_Placa,
            VH_Marca: data.VH_Marca,
            VH_Modelo: data.VH_Modelo,
            US_Identificacion: data.US_Identificacion
        }, {
            where: { VH_Vehiculo: id }
        });
    }

    static async delete(id) {
        return await Vehiculo.destroy({
            where: { VH_Vehiculo: id }
        });
    }
}

module.exports = VehiculoStore;