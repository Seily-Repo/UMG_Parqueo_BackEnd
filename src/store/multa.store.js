const Multa = require('../model/multa.model');

class MultaStore {
    
    static async getAll() {
        return await Multa.findAll({
            order: [['MUL_id_multa', 'ASC']]
        });
    }

    static async getById(id) {
        return await Multa.findByPk(id);
    }

    static async getByDescripcion(descripcion) {
        return await Multa.findOne({
            where: { MUL_descripcion: descripcion }
        });
    }

    static async create(data) {
        return await Multa.create({
            MUL_id_multa: data.MUL_id_multa,
            MUL_monto_total: data.MUL_monto_total,
            MUL_monto_base: data.MUL_monto_base,
            MUL_impuesto: data.MUL_impuesto,
            MUL_descripcion: data.MUL_descripcion,
            MUL_fecha: data.MUL_fecha,
            MUL_fecha_vencimiento: data.MUL_fecha_vencimiento,
            MUL_creado_por: data.MUL_creado_por,
            MUL_fecha_creacion: data.MUL_fecha_creacion || new Date(),
            MUL_direccion_ip: data.MUL_direccion_ip
        });
    }

    static async update(id, data) {
        return await Multa.update({
            MUL_monto_total: data.MUL_monto_total,
            MUL_monto_base: data.MUL_monto_base,
            MUL_impuesto: data.MUL_impuesto,
            MUL_descripcion: data.MUL_descripcion,
            MUL_fecha_vencimiento: data.MUL_fecha_vencimiento,
            MUL_modificado_por: data.MUL_modificado_por,
            MUL_fecha_modificacion: new Date(), // Se actualiza automáticamente al editar
            MUL_direccion_ip: data.MUL_direccion_ip
        }, {
            where: { MUL_id_multa: id }
        });
    }

}

module.exports = MultaStore;