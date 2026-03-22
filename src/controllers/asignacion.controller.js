const AsignacionStore = require('../store/asignacion.store');
const EspacioStore = require('../store/espacio.store'); 

exports.createAsignacion = async (req, res) => {
    try {
        const { ES_Espacio, SM_Semestre, JD_Jornada, US_Identificacion } = req.body;

        if (!ES_Espacio || !SM_Semestre || !JD_Jornada || !US_Identificacion) {
            return res.status(400).json({ message: 'Faltan datos obligatorios para la asignación' });
        }

        const espacioFisico = await EspacioStore.getById(ES_Espacio);
        if (!espacioFisico) {
            return res.status(404).json({ message: 'El espacio de parqueo indicado no existe en el sistema.' });
        }
        if (espacioFisico.ES_Estado === 0) {
            return res.status(409).json({ message: 'El espacio está inhabilitado o en mantenimiento.' });
        }

        const usuarioOcupado = await AsignacionStore.checkUsuarioOcupado(US_Identificacion, SM_Semestre, JD_Jornada);
        if (usuarioOcupado) {
            return res.status(409).json({ 
                message: 'El usuario ya cuenta con un espacio asignado para este semestre y jornada.' 
            });
        }

        const espacioOcupado = await AsignacionStore.checkDisponibilidad(ES_Espacio, SM_Semestre, JD_Jornada);
        if (espacioOcupado) {
            return res.status(409).json({ 
                message: 'Operación rechazada: El espacio ya está ocupado por otra persona.',
                disponible: false
            });
        }

        await AsignacionStore.create(req.body);
        
        res.status(201).json({ 
            message: '¡Asignación creada exitosamente!',
            disponible: true
        });

    } catch (error) {
        res.status(500).json({ message: 'Error interno al procesar la asignación', error: error.message });
    }
};

exports.getAllAsignaciones = async (req, res) => {
    try {
        const asignaciones = await AsignacionStore.getAll();
        res.status(200).json(asignaciones);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener asignaciones', error: error.message });
    }
};

exports.anularAsignacion = async (req, res) => {
    try {
        const rowsAffected = await AsignacionStore.anular(req.params.id);
        if (rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Asignación no encontrada' });
        }
        res.status(200).json({ message: 'Asignación anulada (El espacio vuelve a estar disponible)' });
    } catch (error) {
        res.status(500).json({ message: 'Error al anular asignación', error: error.message });
    }
};