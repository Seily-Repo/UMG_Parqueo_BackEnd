const SemestreStore = require('../store/semestre.store');

exports.getAllSemestres = async (req, res) => {
    try {
        const semestres = await SemestreStore.getAll();
        res.status(200).json(semestres);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los semestres', error: error.message });
    }
};

exports.getSemestreById = async (req, res) => {
    try {
        const semestre = await SemestreStore.getById(req.params.id);
        if (!semestre) {
            return res.status(404).json({ message: 'Semestre no encontrado' });
        }
        res.status(200).json(semestre);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el semestre', error: error.message });
    }
};

exports.createSemestre = async (req, res) => {
    try {
        await SemestreStore.create(req.body);
        res.status(201).json({ message: 'Semestre creado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el semestre', error: error.message });
    }
};

exports.updateSemestre = async (req, res) => {
    try {
        const rowsAffected = await SemestreStore.update(req.params.id, req.body);
        if (rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Semestre no encontrado para actualizar' });
        }
        res.status(200).json({ message: 'Semestre actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el semestre', error: error.message });
    }
};

exports.deleteSemestre = async (req, res) => {
    try {
        const rowsDeleted = await SemestreStore.delete(req.params.id);
        if (rowsDeleted === 0) {
            return res.status(404).json({ message: 'Semestre no encontrado para eliminar' });
        }
        res.status(200).json({ message: 'Semestre eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el semestre', error: error.message });
    }
};