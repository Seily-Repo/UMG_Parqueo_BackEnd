const EstudianteMultaStore = require('../store/estudiante_multa.store');

exports.getAllEstudianteMulta = async (req, res) => {
    try {
        const estudianteMulta = await EstudianteMultaStore.getAll();
        res.status(200).json(estudianteMulta);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener los registros',
            error: error.message
        });
    }
};

exports.getEstudianteMultaById = async (req, res) => {
    try {
        const { multa_id, estudiante_id } = req.params;
        const estudianteMulta = await EstudianteMultaStore.getById(multa_id, estudiante_id);
        
        if (!estudianteMulta) {
            return res.status(404).json({
                message: 'Registro no encontrado'
            });
        }
        res.status(200).json(estudianteMulta);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener el registro',
            error: error.message
        });
    }
};

exports.getEstudianteMultasByEstudianteId = async (req, res) => {
    try {
        const { estudiante_id } = req.params;
        const estudianteMulta = await EstudianteMultaStore.getByEstudianteId(estudiante_id);
        res.status(200).json(estudianteMulta);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener los registros del estudiante',
            error: error.message
        });
    }
};

exports.getEstudianteMultasByMultaId = async (req, res) => {
    try {
        const { multa_id } = req.params;
        const estudianteMulta = await EstudianteMultaStore.getByMultaId(multa_id);
        res.status(200).json(estudianteMulta);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener los registros de la multa',
            error: error.message
        });
    }
};

exports.createEstudianteMulta = async (req, res) => {
    try {
        const { MUL_id_multa, EST_id_estudiante, EMU_estado_multa, EMU_creado_por } = req.body;
        
        if (!MUL_id_multa || !EST_id_estudiante || !EMU_estado_multa || !EMU_creado_por) {
            return res.status(400).json({
                message: 'Faltan campos obligatorios (multa, estudiante, estado, creador)'
            });
        }

        const estudianteMulta = await EstudianteMultaStore.create(req.body);
        res.status(201).json(estudianteMulta);
    } catch (error) {
        res.status(500).json({
            message: 'Error al crear el registro',
            error: error.message
        });
    }
};

exports.updateEstudianteMulta = async (req, res) => {
    try {
        const { multa_id, estudiante_id } = req.params;
        const [affectedRows] = await EstudianteMultaStore.update(multa_id, estudiante_id, req.body);
        
        if (affectedRows === 0) {
            return res.status(404).json({ 
                message: 'Registro no encontrado para actualizar' 
            });
        }

        res.status(200).json({ 
            message: 'Actualizado correctamente' 
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar el registro',
            error: error.message
        });
    }
};

exports.deleteEstudianteMulta = async (req, res) => {
    try {
        const { multa_id, estudiante_id } = req.params;
        const deletedRows = await EstudianteMultaStore.delete(multa_id, estudiante_id);
        
        if (deletedRows === 0) {
            return res.status(404).json({ 
                message: 'Registro no encontrado para eliminar' 
            });
        }

        res.status(200).json({ 
            message: 'Eliminado correctamente' 
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar el registro',
            error: error.message
        });
    }
};