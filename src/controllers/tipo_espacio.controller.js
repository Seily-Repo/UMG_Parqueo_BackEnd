const TipoEspacio = require('../model/tipo_espacio.model');
const Parqueo = require('../model/parqueo.model');

/**
 * Crea un nuevo Tipo de Espacio calculando su capacidad por porcentaje
 */
exports.crearTipoEspacio = async (req, res) => {
    try {
        const { TES_NOMBRE, porcentaje, PQ_Parqueo } = req.body;

        // 1. Validar que el Parqueo exista
        const parqueo = await Parqueo.findByPk(PQ_Parqueo);
        if (!parqueo) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "Operación rechazada: El parqueo especificado no existe.",
                details: `PQ_Parqueo ${PQ_Parqueo} not found.`
            });
        }

        // 2. Calcular capacidad basada en porcentaje
        const capacidadCalculada = Math.floor(parqueo.PQ_Capacidad * (porcentaje / 100));

        if (capacidadCalculada <= 0) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "El porcentaje asignado resulta en una capacidad de 0 espacios.",
                details: null
            });
        }

        // 3. Validar sumatoria de tipos para no exceder la capacidad total del parqueo
        const sumatoriaActual = await TipoEspacio.sum('TES_CAPACIDAD_MAX_TIPO', {
            where: { PQ_Parqueo: PQ_Parqueo }
        }) || 0;

        if ((sumatoriaActual + capacidadCalculada) > parqueo.PQ_Capacidad) {
            return res.status(409).json({
                success: false,
                status: 409,
                message: "Operación rechazada: La sumatoria de capacidades por tipo excede la capacidad total del parqueo.",
                details: {
                    capacidadParqueo: parqueo.PQ_Capacidad,
                    disponible: parqueo.PQ_Capacidad - sumatoriaActual,
                    intentoAsignar: capacidadCalculada
                }
            });
        }

        // 4. Crear el registro
        const nuevoTipo = await TipoEspacio.create({
            TES_NOMBRE,
            TES_CAPACIDAD_MAX_TIPO: capacidadCalculada,
            PQ_Parqueo
        });

        return res.status(201).json({
            success: true,
            status: 201,
            message: "Tipo de espacio creado exitosamente.",
            details: nuevoTipo
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Error interno del servidor.",
            details: error.message
        });
    }
};

/**
 * Listar tipos de espacio por Parqueo
 */
exports.listarTiposPorParqueo = async (req, res) => {
    try {
        const { idParqueo } = req.params;
        const tipos = await TipoEspacio.findAll({
            where: { PQ_Parqueo: idParqueo }
        });

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Listado de tipos de espacio obtenido.",
            details: tipos
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Error al obtener los tipos de espacio.",
            details: error.message
        });
    }
};

/**
 * Obtener todos los tipos de espacio (General)
 */
exports.getAllTipos = async (req, res) => {
    try {
        const tipos = await TipoEspacio.findAll();
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Todos los tipos de espacio obtenidos.",
            details: tipos
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Error al obtener tipos.",
            details: error.message
        });
    }
};