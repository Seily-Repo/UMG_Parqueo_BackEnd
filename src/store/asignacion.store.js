const Asignacion = require('../model/asignacion.model');

class AsignacionStore {
    static async checkDisponibilidad(espacio, id_ciclo, id_jornada) {
        return await Asignacion.findOne({
            where: {
                ES_Espacio: espacio,
                id_ciclo: id_ciclo,
                id_jornada: id_jornada,
                AS_Estado: 1 
            }
        });
    }

    static async create(data) {
        return await Asignacion.create({
            carne_usuario: data.carne_usuario,
            ES_Espacio: data.ES_Espacio,
            id_ciclo: data.id_ciclo,
            id_jornada: data.id_jornada,
            AS_Estado: data.AS_Estado 
        });
    }

    static async getAll(id_ciclo, estado, limite = 50, pagina = 1) {
        const queryOptions = {
            where: {},
            limit: parseInt(limite),
            offset: (parseInt(pagina) - 1) * parseInt(limite),
            order: [['AS_FechaAsignacion', 'DESC']]
        };
        
        if (id_ciclo) {
            queryOptions.where.id_ciclo = id_ciclo;
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

    static async checkUsuarioOcupado(carne_usuario, id_ciclo, id_jornada) {
        return await Asignacion.findOne({
            where: {
                carne_usuario: carne_usuario,
                id_ciclo: id_ciclo,
                id_jornada: id_jornada,
                AS_Estado: 1
            }
        });
    }
}

module.exports = AsignacionStore;