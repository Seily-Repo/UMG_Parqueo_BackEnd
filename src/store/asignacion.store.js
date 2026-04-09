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

 // Asegúrate de importar los operadores de tu ORM al inicio de tu archivo
// const { Op } = require('sequelize'); 

static async getAll(semestre, estado, limite = 50, pagina = 1) {
    const queryOptions = {
        where: {},
        limit: parseInt(limite),
        offset: (parseInt(pagina) - 1) * parseInt(limite),
        order: [['AS_FechaAsignacion', 'DESC']]
    };
    if (semestre) {
        queryOptions.where.SM_Semestre = semestre;
    }
        if (estado !== undefined) {
        queryOptions.where.AS_Estado = estado;
    }
    return await Asignacion.findAll(queryOptions);
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