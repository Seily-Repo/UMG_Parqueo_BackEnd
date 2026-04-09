const TipoEspacio = require('../model/tipo_espacio.model');
const { sequelize } = require('../config/db');

class TipoEspacioStore {
    // 1. Obtener todos los tipos de espacio
    static async getAll() {
        return await TipoEspacio.findAll({
            order: [['TES_ESPACIO', 'ASC']]
        });
    }

    // 2. Obtener un tipo por ID (Útil para validar capacidades)
    static async getById(id) {
        return await TipoEspacio.findByPk(id);
    }

    // 3. Obtener tipos por Parqueo
    static async getByParqueoId(parqueoId) {
        return await TipoEspacio.findAll({
            where: { PQ_Parqueo: parqueoId },
            order: [['TES_NOMBRE', 'ASC']]
        });
    }

    // 4. SUMATORIA: Obtener la capacidad total ya repartida en un parqueo
    // Este método es vital para que el Controller no permita exceder PQ_Capacidad
    static async getSumCapacidadByParqueo(parqueoId) {
        return await TipoEspacio.sum('TES_CAPACIDAD_MAX_TIPO', {
            where: { PQ_Parqueo: parqueoId }
        }) || 0;
    }

    // 5. Crear el tipo con la capacidad ya calculada en el Controller
    static async create(data) {
        return await TipoEspacio.create({
            TES_NOMBRE: data.TES_NOMBRE,
            TES_CAPACIDAD_MAX_TIPO: data.TES_CAPACIDAD_MAX_TIPO,
            PQ_Parqueo: data.PQ_Parqueo
        });
    }

    // 6. Actualizar (Ojo: Si se actualiza, el Controller debería re-validar porcentajes)
    static async update(id, data) {
        return await TipoEspacio.update({
            TES_NOMBRE: data.TES_NOMBRE,
            TES_CAPACIDAD_MAX_TIPO: data.TES_CAPACIDAD_MAX_TIPO,
            PQ_Parqueo: data.PQ_Parqueo
        }, {
            where: { TES_ESPACIO: id }
        });
    }

    // 7. Eliminar
    static async delete(id) {
        return await TipoEspacio.destroy({
            where: { TES_ESPACIO: id }
        });
    }
}

module.exports = TipoEspacioStore;