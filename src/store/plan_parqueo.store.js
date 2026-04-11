const PlanParqueo = require('../model/plan_parqueo.model');

class PlanParqueoStore {

    // Obtener todos los PLANes
    static async getAll() {
        return await PlanParqueo.findAll({
            order: [['PLN_PLAN', 'ASC']]
        });
    }

    // Obtener un PLAN por ID
    static async getById(id) {
        return await PlanParqueo.findByPk(id);
    }

    // Crear un nuevo PLAN
    static async create(data) {
        return await PlanParqueo.create({
            PLN_PLAN: data.PLN_PLAN,
            PLN_NAME: data.PLN_NAME,
            PLN_DESCRIPCION: data.PLN_DESCRIPCION,
            PLN_PRECIO: data.PLN_PRECIO,
            PLN_ESTADO: data.PLN_ESTADO,
            PLN_MONEDA: data.PLN_MONEDA
        });
    }

    // Actualizar un PLAN existente
    static async update(id, data) {
        return await PlanParqueo.update({
            PLN_NAME: data.PLN_NAME,
            PLN_DESCRIPCION: data.PLN_DESCRIPCION,
            PLN_PRECIO: data.PLN_PRECIO,
            PLN_ESTADO: data.PLN_ESTADO,
            PLN_MONEDA: data.PLN_MONEDA
        }, {
            where: { PLN_PLAN: id }
        });
    }

    // Eliminar un PLAN
    static async delete(id) {
        return await PlanParqueo.destroy({
            where: { PLN_PLAN: id }
        });
    }

}

module.exports = PlanParqueoStore;