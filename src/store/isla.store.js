const Isla = require('../model/isla.model');

class IslaStore {
  static async create(data) {
        return await Isla.create({
            PQ_PARQUEO: data.PQ_PARQUEO,
            IS_NOMBRE: data.IS_NOMBRE, 
            IS_CAPACIDAD: data.IS_CAPACIDAD,
            IS_DESCRIPCION: data.IS_DESCRIPCION,
            IS_ESTADO: 1 
        });
    }

    static async getById(id) {
        return await Isla.findByPk(id);
    }

    static async getAll(id_parqueo, estado) {
        const queryOptions = {
            where: {},
            order: [['IS_NOMBRE', 'ASC']]
        };

        if (id_parqueo) {
            queryOptions.where.PQ_PARQUEO = id_parqueo;
        }

        if (estado !== undefined) {
            queryOptions.where.IS_ESTADO = estado;
        }

        return await Isla.findAll(queryOptions);
    }

    static async anular(id) {
        const isla = await Isla.findByPk(id);
        if (!isla) return null;
        await isla.update({ IS_ESTADO: 0 });
        return isla;
    }

    static async update(id, data) {
        const isla = await Isla.findByPk(id);
        if (!isla) return null;
        await isla.update(data);
        return isla;
    }
    static async habilitar(id) {
        const isla = await Isla.findByPk(id);
        if (!isla) return null;
        await isla.update({ IS_ESTADO: 1 });
        return isla;
    }
}

module.exports = IslaStore;