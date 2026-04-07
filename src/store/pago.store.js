const Pago = require('../model/pago.model');

class PagosStore {

    // Obtener todos los pagos
    static async getAll() {
        return await Pago.findAll({
            order: [['id_pago', 'ASC']]
        });
    }

    // Obtener pago por ID
    static async getById(id) {
        return await Pago.findByPk(id);
    }

    // Crear pago
    static async create(data) {
        return await Pago.create({
            id_pago: data.id_pago,
            id_estudiante: data.id_estudiante,
            id_plan: data.id_plan,
            fecha_pago: data.fecha_pago,
            monto_pagado: data.monto_pagado,
            referencia_banco: data.referencia_banco,
            tarjeta_mask: data.tarjeta_mask,
            id_multa: data.id_multa,
            id_vehiculo_estudiante: data.id_vehiculo_estudiante
        });
    }

    // Actualizar pago
    static async update(id, data) {
        return await Pago.update({
            id_estudiante: data.id_estudiante,
            id_plan: data.id_plan,
            fecha_pago: data.fecha_pago,
            monto_pagado: data.monto_pagado,
            referencia_banco: data.referencia_banco,
            tarjeta_mask: data.tarjeta_mask,
            id_multa: data.id_multa,
            id_vehiculo_estudiante: data.id_vehiculo_estudiante
        }, {
            where: { id_pago: id }
        });
    }

    // Eliminar pago
    static async delete(id) {
        return await Pago.destroy({
            where: { id_pago: id }
        });
    }
}

module.exports = PagosStore;