const Espacio = require('../model/espacio.model');
const TipoEspacio = require('../model/tipo_espacio.model');
const Asignacion = require('../model/asignacion.model');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');

class EspacioStore {

    // 1. REGLA: Obtener el siguiente número disponible (Lógica de huecos)
    static async findNextAvailableNumber(parqueoId) {
        // Obtenemos todos los números ocupados en ese parqueo específico
        const espacios = await Espacio.findAll({
            include: [{
                model: TipoEspacio,
                where: { PQ_Parqueo: parqueoId },
                required: true
            }],
            attributes: ['ES_Numero'],
            order: [['ES_Numero', 'ASC']]
        });

        const numeros = espacios.map(e => e.ES_Numero);
        
        // Buscamos el primer hueco disponible (Empezando desde 1)
        let proximoNumero = 1;
        for (let num of numeros) {
            if (num === proximoNumero) {
                proximoNumero++;
            } else if (num > proximoNumero) {
                // Encontramos un salto (ej. tenemos 1 y 3, el hueco es 2)
                return proximoNumero;
            }
        }
        // Si no hay huecos, devolvemos el último + 1
        return proximoNumero;
    }

    // 2. REGLA: Contar espacios por tipo (Para validar capacidad máxima)
    static async countByTipo(tipoEspacioId) {
        return await Espacio.count({
            where: { TES_ESPACIO: tipoEspacioId }
        });
    }

    // 3. Crear nuevo espacio
    static async create(data) {
        return await Espacio.create({
            ES_Numero: data.ES_Numero,
            TES_ESPACIO: data.TES_ESPACIO,
            ES_Estado: 1 // Siempre disponible al nacer
        });
    }

    // 4. Actualizar General
    static async update(id, data) {
        return await Espacio.update(data, {
            where: { ES_Espacio: id }
        });
    }

    // 5. REGLA 3: Actualizar solo el estado
    static async updateEstado(id, estado) {
        return await Espacio.update(
            { ES_Estado: estado },
            { where: { ES_Espacio: id } }
        );
    }

    // 6. REGLA 4: Eliminar espacio físico
    static async delete(id) {
        return await Espacio.destroy({
            where: { ES_Espacio: id }
        });
    }

    // 7. Buscar por ID con su Tipo
    static async getById(id) {
        return await Espacio.findByPk(id, {
            include: [{ model: TipoEspacio }]
        });
    }

    // 8. Listar todos los espacios
    static async getAll() {
        return await Espacio.findAll({
            order: [['ES_Numero', 'ASC']],
            include: [{ model: TipoEspacio }]
        });
    }

    // 9. REGLA 6: Disponibilidad por jornada y semestre
    static async getDisponibilidadAvanzada(semestreId, jornadaId, estado = null) {
        // Buscamos las asignaciones que bloquean espacios para ese periodo
        const asignacionesActivas = await Asignacion.findAll({
            attributes: ['ES_Espacio'],
            where: {
                id_ciclo: semestreId,
                id_jornada: jornadaId,
                AS_Estado: 1 // Solo asignaciones vigentes
            }
        });

        const ocupadosIds = asignacionesActivas.map(a => a.ES_Espacio);

        const filtro = {};
        if (estado !== null) {
            // Filtro manual de estado si se requiere (0 u 1)
            filtro.ES_Estado = estado;
        }

        // Si buscamos disponibles (Estado 1), excluimos los que tienen asignación
        if (estado == 1 || estado === null) {
            filtro.ES_Espacio = { [Op.notIn]: ocupadosIds.length > 0 ? ocupadosIds : [-1] };
        }

        return await Espacio.findAll({
            where: filtro,
            include: [{ model: TipoEspacio }],
            order: [['ES_Numero', 'ASC']]
        });
    }

    // 10. Listar espacios por tipo y estado (Filtro simple)
    static async getByTipoYEstado(tipoId, estado) {
        const whereClause = { TES_ESPACIO: tipoId };
        if (estado !== undefined && estado !== "") {
            whereClause.ES_Estado = estado;
        }
        return await Espacio.findAll({
            where: whereClause,
            order: [['ES_Numero', 'ASC']]
        });
    }
}

module.exports = EspacioStore;