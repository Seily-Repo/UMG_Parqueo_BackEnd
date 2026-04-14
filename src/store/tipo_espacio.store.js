const TipoEspacio = require('../model/tipo_espacio.model');
const Espacio = require('../model/espacio.model'); // Importante para la Regla #3
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');

class TipoEspacioStore {
    // 1. Obtener todos
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

    // 4. Buscar duplicados (Útil para evitar "MOTOS" dos veces en el mismo parqueo)
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

    // 5. Sumatoria de capacidades (Regla #5 del Controller)
    static async getSumCapacidadByParqueo(parqueoId) {
        const suma = await TipoEspacio.sum('TES_CAPACIDAD_MAX_TIPO', {
            where: { PQ_Parqueo: parqueoId }
        });
        return suma || 0;
    }

    // 6. Crear
    static async create(data) {
        return await TipoEspacio.create({
            TES_NOMBRE: data.TES_NOMBRE,
            TES_CAPACIDAD_MAX_TIPO: data.TES_CAPACIDAD_MAX_TIPO,
            PQ_Parqueo: data.PQ_Parqueo
        });
    }

    // 7. Actualizar
        static async update(id, data) {
            return await TipoEspacio.update(data, {
                where: { TES_ESPACIO: id }
            });
        }

        /**
         * 8. Eliminar en Cascada (Regla #3)
         * Usamos una transacción para asegurar que se borren los espacios Y el tipo.
         */
        static async deleteConLiberacion(id) {
        const t = await sequelize.transaction();
        try {
            // PASO 1: Ponemos los espacios en 1 (Disponible)
            // El TES_ESPACIO se pondrá en NULL automáticamente por la BD al borrar el tipo
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
}

module.exports = TipoEspacioStore;