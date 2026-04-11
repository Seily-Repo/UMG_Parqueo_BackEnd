const Espacio = require('../model/espacio.model');
const { Op } = require('sequelize');

class EspacioStore {
    // 1. Obtener todos los espacios ordenados
    static async getAll() {
        return await Espacio.findAll({ 
            order: [['ES_Espacio', 'ASC']] 
        });
    }

    // 2. Buscar por ID único
    static async getById(id) {
        return await Espacio.findByPk(id); 
    }

    // 3. CAMBIO CLAVE: Ahora buscamos por Tipo de Espacio
    static async getByTipoId(tipoEspacioId) {
        return await Espacio.findAll({ 
            where: { TES_ESPACIO: tipoEspacioId },
            order: [['ES_Numero', 'ASC']]
        });
    }

    // 4. NUEVO: Necesario para la validación de capacidad en el Controller
    static async countByTipo(tipoEspacioId) {
        return await Espacio.count({
            where: { TES_ESPACIO: tipoEspacioId }
        });
    }

    // 5. Crear con la nueva referencia TES_ESPACIO
    static async create(data) {
        return await Espacio.create({
            ES_Numero: data.ES_Numero,
            ES_Estado: data.ES_Estado || 0, // Por defecto disponible
            TES_ESPACIO: data.TES_ESPACIO // Referencia al Tipo
        });
    }

    // 6. Actualizar
    static async update(id, data) {
        return await Espacio.update({
            ES_Numero: data.ES_Numero,
            ES_Estado: data.ES_Estado,
            TES_ESPACIO: data.TES_ESPACIO
        }, {
            where: { ES_Espacio: id }
        });
    }

    // 7. Eliminar
    static async delete(id) {
        return await Espacio.destroy({
            where: { ES_Espacio: id }
        });
    }

     static async updateEstado(id, estado) {
    return await Espacio.update(
      { ES_Estado: estado },
      { where: { ES_Espacio: id } }
    );
  }

    /**
     * Lógica de disponibilidad:
     * Filtra espacios que NO estén en la lista de asignaciones ocupadas 
     * para una jornada y semestre específicos.
     */
    static async getEspaciosLibres(tipoEspacioId, semestre, jornada) {
        // Nota: Asegúrate de importar el modelo Asignacion aquí o pasarlo como parámetro
        const asignacionesActivas = await Asignacion.findAll({
            attributes: ['ES_Espacio'], 
            where: {
                SM_Semestre: semestre,
                JD_Jornada: jornada,
                AS_Estado: 1 
            }
        });

        const espaciosOcupadosIds = asignacionesActivas.map(a => a.ES_Espacio);

        return await Espacio.findAll({
            where: {
                TES_ESPACIO: tipoEspacioId,
                ES_Estado: 0, // Solo los que están marcados como Disponibles en la tabla base
                ES_Espacio: {
                    [Op.notIn]: espaciosOcupadosIds.length > 0 ? espaciosOcupadosIds : [0] 
                }
            },
            order: [['ES_Numero', 'ASC']]
        });
        
    }
}

module.exports = EspacioStore;