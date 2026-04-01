const PlanParqueo = require('../model/planParqueo.model');

class PlanParqueoStore {

    // Obtener todos los planes
    static async getAll() {
        return await PlanParqueo.findAll({
            order: [['PLA_ID_PLAN', 'ASC']]
        });
    }

    // Obtener un plan por ID
    static async getById(id) {
        return await PlanParqueo.findByPk(id);
    }

    // Crear un nuevo plan
    static async create(data) {
        return await PlanParqueo.create({
            PLA_ID_PLAN: data.PLA_ID_PLAN,
            PLA_DESCRIPCION: data.PLA_DESCRIPCION,
            PLA_PRECIO: data.PLA_PRECIO,
            PLA_ESTADO: data.PLA_ESTADO
        });
    }

    // Actualizar un plan existente
    static async update(id, data) {
        return await PlanParqueo.update({
            PLA_DESCRIPCION: data.PLA_DESCRIPCION,
            PLA_PRECIO: data.PLA_PRECIO,
            PLA_ESTADO: data.PLA_ESTADO
        }, {
            where: { PLA_ID_PLAN: id }
        });
    }

    // Eliminar un plan
    static async delete(id) {
        return await PlanParqueo.destroy({
            where: { PLA_ID_PLAN: id }
        });
    }

}

module.exports = PlanParqueoStore;