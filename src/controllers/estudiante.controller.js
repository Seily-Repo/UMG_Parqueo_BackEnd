const EstudianteStore = require('../store/estudiante.store');

exports.getAllEstudiantes = async (req, res) => {
    try {
        const estudiantes = await EstudianteStore.getAll();
        res.status(200).json(estudiantes);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener los estudiantes',
            error: error.message
        });
    }
};

exports.getEstudianteById = async (req, res) => {
    try {
        const estudiante = await EstudianteStore.getById(req.params.id);
        if (!estudiante) {
            return res.status(404).json({
                message: 'Estudiante no encontrado'
            });
        }
        res.status(200).json(estudiante);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener el estudiante',
            error: error.message
        });
    }
};

exports.getEstudianteByCarne = async (req, res) => {
    try {
        const estudiante = await EstudianteStore.getByCarne(req.params.carne);
        if (!estudiante) {
            return res.status(404).json({
                message: 'Estudiante no encontrado por carné'
            });
        }
        res.status(200).json(estudiante);
    } catch (error) {
        res.status(500).json({
            message: 'Error al buscar el estudiante',
            error: error.message
        });
    }
};

exports.createEstudiante = async (req, res) => {
    try {
        // Validar que la carné sea única
        const existente = await EstudianteStore.getByCarne(req.body.EST_CARNE);
        if (existente) {
            return res.status(400).json({
                message: 'La carné del estudiante ya existe'
            });
        }

        const estudiante = await EstudianteStore.create(req.body);
        res.status(201).json({
            message: 'Estudiante creado exitosamente',
            data: estudiante
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al crear el estudiante',
            error: error.message
        });
    }
};

exports.updateEstudiante = async (req, res) => {
    try {
        // Validar que la carné sea única si se está actualizando
        if (req.body.EST_CARNE) {
            const existente = await EstudianteStore.getByCarne(req.body.EST_CARNE);
            if (existente && existente.EST_ID_ESTUDIANTE !== parseInt(req.params.id)) {
                return res.status(400).json({
                    message: 'La carné del estudiante ya existe'
                });
            }
        }

        const rowsAffected = await EstudianteStore.update(req.params.id, req.body);
        if (rowsAffected[0] === 0) {
            return res.status(404).json({
                message: 'Estudiante no encontrado para actualizar'
            });
        }
        res.status(200).json({
            message: 'Estudiante actualizado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar el estudiante',
            error: error.message
        });
    }
};

exports.deleteEstudiante = async (req, res) => {
    try {
        const rowsDeleted = await EstudianteStore.delete(req.params.id);
        if (rowsDeleted === 0) {
            return res.status(404).json({
                message: 'Estudiante no encontrado para eliminar'
            });
        }
        res.status(200).json({
            message: 'Estudiante eliminado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar el estudiante',
            error: error.message
        });
    }
};
