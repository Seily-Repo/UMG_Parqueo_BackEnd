const Asignacion = require('../model/asignacion.model');

class AsignacionStore {
    static async checkDisponibilidad(espacio, semestre, jornada) {
        return await Asignacion.findOne({
            where: {
                ES_Espacio: espacio,
                SM_Semestre: semestre,
                JD_Jornada: jornada,
                AS_Estado: 1 
            }
        });
    }

    static async create(data) {
        return await Asignacion.create({
            US_Identificacion: data.US_Identificacion,
            ES_Espacio: data.ES_Espacio,
            SM_Semestre: data.SM_Semestre,
            JD_Jornada: data.JD_Jornada,
            AS_Estado: 1 
        });
    }

    static async getAll() {
        return await Asignacion.findAll();
    }

    static async anular(id) {
        return await Asignacion.update(
            { AS_Estado: 0 },
            { where: { AS_Asignacion: id } }
        );
    }

    static async checkUsuarioOcupado(usuario, semestre, jornada) {
        return await Asignacion.findOne({
            where: {
                US_Identificacion: usuario,
                SM_Semestre: semestre,
                JD_Jornada: jornada,
                AS_Estado: 1
            }
        });
    }

   
}


module.exports = AsignacionStore;