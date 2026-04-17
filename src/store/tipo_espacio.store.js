const TipoEspacio = require('../model/tipo_espacio.model');
const Espacio = require('../model/espacio.model'); 
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');

class TipoEspacioStore {
    // 1. Obtener todos (Solo los activos por defecto para el front)
    static async getAll() {
        return await TipoEspacio.findAll({
            order: [['TES_ESPACIO', 'ASC']]
        });
    }

    // 2. Por ID
    static async getById(id) {
        return await TipoEspacio.findByPk(id);
    }

    // 3. Por Parqueo
    static async getByParqueoId(parqueoId) {
        return await TipoEspacio.findAll({
            where: { PQ_Parqueo: parqueoId },
            order: [['TES_NOMBRE', 'ASC']]
        });
    }

    // 4. Buscar duplicados
    static async findDuplicate(nombre, parqueoId, excludeId = null) {
        const whereClause = {
            TES_NOMBRE: nombre,
            PQ_Parqueo: parqueoId
        };
        if (excludeId) {
            whereClause.TES_ESPACIO = { [Op.ne]: excludeId };
        }
        return await TipoEspacio.findOne({ where: whereClause });
    }

    // 5. Sumatoria de capacidades
    static async getSumCapacidadByParqueo(parqueoId) {
        const suma = await TipoEspacio.sum('TES_CAPACIDAD_MAX_TIPO', {
            where: { 
                PQ_Parqueo: parqueoId,
                TES_ESTADO: 1 // Solo sumamos los que están activos físicamente
            }
        });
        return suma || 0;
    }

    // 6. Crear
    static async create(data) {
        return await TipoEspacio.create({
            TES_NOMBRE: data.TES_NOMBRE,
            TES_CAPACIDAD_MAX_TIPO: data.TES_CAPACIDAD_MAX_TIPO,
            PQ_Parqueo: data.PQ_Parqueo,
            TES_ESTADO: 1 // Siempre inicia activo
        });
    }

    // 7. Actualizar (Sirve para datos generales e inactivación lógica)
    static async update(id, data) {
        return await TipoEspacio.update(data, {
            where: { TES_ESPACIO: id }
        });
    }

    /**
     * 8. Eliminar en Cascada (Regla #3)
     * Modificada para asegurar que los espacios queden libres.
     */
    static async deleteConLiberacion(id) {
        const t = await sequelize.transaction();
        try {
            // PASO 1: Ponemos los espacios en 1 (Disponible)
            await Espacio.update(
                { ES_Estado: 1 }, 
                { 
                    where: { TES_ESPACIO: id },
                    transaction: t 
                }
            );

            // PASO 2: Borramos el tipo
            const resultado = await TipoEspacio.destroy({
                where: { TES_ESPACIO: id },
                transaction: t
            });

            await t.commit();
            return resultado;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    /**
     * 9. Conteo de espacios ocupados (NECESARIO PARA EL CONTROLLER)
     * Verifica si hay vehículos parqueados actualmente.
     */
    static async countOcupadosByTipo(tesId) {
        return await Espacio.count({
            where: {
                TES_ESPACIO: tesId,
                ES_Estado: 0 // 0 = Ocupado
            }
        });
    }
}

module.exports = TipoEspacioStore;