const AsignacionStore = require('../store/asignacion.store');
const EspacioStore = require('../store/espacio.store'); 

exports.createAsignacion = async (req, res) => {
    try {
        const { ES_Espacio, id_ciclo, id_jornada, carne_usuario } = req.body;

        if (!ES_Espacio || !id_ciclo || !id_jornada || !carne_usuario) {
            return res.status(400).json({ 
                success: false,
                status: 400,
                message: 'Faltan datos obligatorios para la asignación.',
                details: 'Se requiere ES_Espacio, id_ciclo, id_jornada y carne_usuario.'
            });
        }

        if (isNaN(ES_Espacio) || isNaN(id_ciclo) || isNaN(id_jornada)) {
            return res.status(400).json({ 
                success: false,
                status: 400,
                message: 'Formato de datos numéricos inválido.',
                details: 'Los campos de espacio, ciclo y jornada deben ser números.'
            });
        }

        if (ES_Espacio <= 0 || id_ciclo <= 0 || id_jornada <= 0) {
            return res.status(400).json({ 
                success: false,
                status: 400,
                message: 'Valores de identificador inválidos.',
                details: 'Los IDs no pueden ser menores o iguales a cero.'
            });
        }

        const espacioFisico = await EspacioStore.getById(ES_Espacio);
        if (!espacioFisico) {
            return res.status(404).json({ 
                success: false,
                status: 404,
                message: 'El espacio de parqueo indicado no existe en el sistema.',
                details: null
            });
        }
        if (espacioFisico.ES_Estado === 0) {
            return res.status(409).json({ 
                success: false,
                status: 409,
                message: 'El espacio está inhabilitado o en mantenimiento.',
                details: null
            });
        }

        const usuarioOcupado = await AsignacionStore.checkUsuarioOcupado(carne_usuario, id_ciclo, id_jornada);
        if (usuarioOcupado) {
            return res.status(409).json({ 
                success: false,
                status: 409,
                message: 'El usuario ya cuenta con un espacio asignado para este ciclo y jornada.',
                details: null
            });
        }

        const espacioOcupado = await AsignacionStore.checkDisponibilidad(ES_Espacio, id_ciclo, id_jornada);
        if (espacioOcupado) {
            return res.status(409).json({ 
                success: false,
                status: 409,
                message: 'Operación rechazada: El espacio ya está ocupado por otra persona.',
                data: { disponible: false }
            });
        }

        req.body.AS_Estado = 1;

        await AsignacionStore.create(req.body);
        
        const io = req.app.get('socketio');
        if (io) {
            io.emit('espacioOcupado', { 
                ES_Espacio: ES_Espacio,
                mensaje: `El espacio ${ES_Espacio} acaba de ser reservado.`
            });
        }
        
        res.status(201).json({ 
            success: true,
            status: 201,
            message: '¡Asignación creada exitosamente!',
            data: { disponible: true }
        });

    } catch (error) {
        res.status(500).json({ 
            success: false,
            status: 500,
            message: 'Error interno al procesar la asignación.',
            details: error.message 
        });
    }
};

exports.getAllAsignaciones = async (req, res) => {
    try {
        const { id_ciclo, estado } = req.query;
        
        const asignaciones = await AsignacionStore.getAll(id_ciclo, estado);
        res.status(200).json({
            success: true,
            status: 200,
            message: 'Asignaciones obtenidas correctamente.',
            data: asignaciones
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            status: 500,
            message: 'Error al obtener asignaciones.',
            details: error.message 
        });
    }
};

exports.anularAsignacion = async (req, res) => {
    try {
        const rowsAffected = await AsignacionStore.anular(req.params.id);
        if (rowsAffected[0] === 0) {
            return res.status(404).json({ 
                success: false,
                status: 404,
                message: 'Asignación no encontrada.',
                details: null
            });
        }

        const io = req.app.get('socketio');
        if (io) {
            io.emit('espacioLiberado', { 
                AS_Asignacion: req.params.id,
                mensaje: `Una asignación fue anulada. Revisa el mapa de disponibilidad.`
            });
        }

        res.status(200).json({ 
            success: true,
            status: 200,
            message: 'Asignación anulada (El espacio vuelve a estar disponible).',
            details: null 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            status: 500,
            message: 'Error al anular asignación.',
            details: error.message 
        });
    }
};