const FormaPago = require('../model/forma_pago.model');

class FormaPagoStore {
    
    static async getAll() {
        return await FormaPago.findAll({
            order: [['FPG_id_forma_pago', 'ASC']]
        });
    }

    static async getById(id) {
        return await FormaPago.findByPk(id);
    }

    static async create(data) {
        return await FormaPago.create({
            FPG_id_forma_pago: data.FPG_id_forma_pago,
            FPG_nombre_forma: data.FPG_nombre_forma,
            FPG_estado: data.FPG_estado
        });
    }

    static async update(id, data) {
        return await FormaPago.update({
            FPG_nombre_forma: data.FPG_nombre_forma,
            FPG_estado: data.FPG_estado
        }, {
            where: { FPG_id_forma_pago: id }
        });
    }

    static async delete(id) {
        return await FormaPago.destroy({
            where: { FPG_id_forma_pago: id }
        });
    }
}

module.exports = FormaPagoStore;