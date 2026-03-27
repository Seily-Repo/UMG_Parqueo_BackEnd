const EstudianteMulta = require('../model/estudiante_multa.model');

class EstudianteMultaStore {
    
    static async getAll() {
        return await EstudianteMulta.findAll({
            order: [['EMU_ID_EST_MULTA', 'ASC']]
        });
    }

    static async getByEstudianteId(ESTUDIANTE_ID) {
        return await EstudianteMulta.findAll({
            where: { EST_ID_ESTUDIANTE: ESTUDIANTE_ID }
        });
    }

    static async create(data) {
        return await EstudianteMulta.create({
            EMU_ID_EST_MULTA: data.EMU_ID_EST_MULTA,
            MUL_ID_MULTA: data.MUL_ID_MULTA,
            EST_ID_ESTUDIANTE: data.EST_ID_ESTUDIANTE,
            EMU_ESTADO_MULTA: data.EMU_ESTADO_MULTA,
            EMU_CREADO_POR: data.EMU_CREADO_POR,
            EMU_FECHA_CREACION: data.EMU_FECHA_CREACION || new Date(),
            EMU_MODIFICADO_POR: data.EMU_MODIFICADO_POR || null,
            EMU_FECHA_MODIFICACION: data.EMU_FECHA_MODIFICACION || null,
            EMU_DIRECCION_IP: data.EMU_DIRECCION_IP || null
        });
    }

    static async update(EMU_ID_EST_MULTA, data) {
        return await EstudianteMulta.update({
            EMU_ESTADO_MULTA: data.EMU_ESTADO_MULTA,
            EMU_MODIFICADO_POR: data.EMU_MODIFICADO_POR,
            EMU_FECHA_MODIFICACION: data.EMU_FECHA_MODIFICACION || new Date(),
            EMU_DIRECCION_IP: data.EMU_DIRECCION_IP
        }, {
            where: { 
                EMU_ID_EST_MULTA: EMU_ID_EST_MULTA
            }
        });
    }

    static async delete(EMU_ID_EST_MULTA) {
        return await EstudianteMulta.destroy({
            where: { 
                EMU_ID_EST_MULTA: EMU_ID_EST_MULTA
            }
        });
    }
}

module.exports = EstudianteMultaStore;