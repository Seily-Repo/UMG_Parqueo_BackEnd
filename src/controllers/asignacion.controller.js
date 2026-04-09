const AsignacionStore = require('../store/asignacion.store');
const EspacioStore = require('../store/espacio.store'); 

exports.createAsignacion = async (req, res) => {
    try {
        const { ES_Espacio, SM_Semestre, JD_Jornada, US_Identificacion } = req.body;

        if (!ES_Espacio || !SM_Semestre || !JD_Jornada || !US_Identificacion) {
            return res.status(400).json({ 
                success: false,
                status: 400,
                message: 'Faltan datos obligatorios para la asignación.',
                details: 'Se requiere ES_Espacio, SM_Semestre, JD_Jornada y US_Identificacion.'
            });
        }

        if (isNaN(ES_Espacio) || isNaN(SM_Semestre) || isNaN(JD_Jornada) || isNaN(US_Identificacion)) {
            return res.status(400).json({ 
                success: false,
                status: 400,
                message: 'Formato de datos inválido.',
                details: 'Todos los identificadores deben ser valores numéricos.'
            });
        }

        if (ES_Espacio <= 0 || SM_Semestre <= 0 || JD_Jornada <= 0 || US_Identificacion <= 0) {
            return res.status(400).json({ 
                success: false,
                status: 400,
                message: 'Valores de identificador inválidos.',
                details: 'Los IDs no pueden ser menores o iguales a cero.'
            });
        }

        /* habilitar cuanto este la asignacion de usuarios
        const usuarioExiste = await asignacion.usuario(Identificacion);
        if (!usuarioExiste) {
            return res.status(404).json({ 
                success: false,
                status: 404,
                message: 'El usuario indicado no se encuentra registrado.',
                details: `No se encontró ningún estudiante o catedrático con el ID: ${US_Identificacion}`
            });
        } */


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

        const usuarioOcupado = await AsignacionStore.checkUsuarioOcupado(US_Identificacion, SM_Semestre, JD_Jornada);
        if (usuarioOcupado) {
            return res.status(409).json({ 
                success: false,
                status: 409,
                message: 'El usuario ya cuenta con un espacio asignado para este semestre y jornada.',
                details: null
            });
        }

        const espacioOcupado = await AsignacionStore.checkDisponibilidad(ES_Espacio, SM_Semestre, JD_Jornada);
        if (espacioOcupado) {
            return res.status(409).json({ 
                success: false,
                status: 409,
                message: 'Operación rechazada: El espacio ya está ocupado por otra persona.',
                data: { disponible: false }
            });
        }

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
        const {SM_Semestre, estado} = req.query;
        
        const asignaciones = await AsignacionStore.getAll(SM_Semestre,estado);
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