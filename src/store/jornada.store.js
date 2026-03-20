const Jornada = require('../model/jornada.model');

// Equivale a list()
exports.getAllJornadas = async (req, res) => {
    try {
        const jornadas = await Jornada.findAll();
        res.status(200).json(jornadas);
    } catch (error) {
        res.status(500).json({ message: 'Error al listar jornadas', error: error.message });
    }
};

// Equivale a getById()
exports.getJornadaById = async (req, res) => {
    try {
        const { id } = req.params;
        const jornada = await Jornada.findByPk(id); // findByPk busca por Primary Key
        if (!jornada) return res.status(404).json({ message: 'Jornada no encontrada' });
        res.status(200).json(jornada);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener jornada', error: error.message });
    }
};

// Equivale a add()
exports.createJornada = async (req, res) => {
    try {
        // data: { JD_TipoJornada, JD_Descripcion }
        const nuevaJornada = await Jornada.create(req.body); 
        res.status(201).json({ message: "Jornada creada exitosamente", data: nuevaJornada });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear jornada', error: error.message });
    }
};

// Equivale a update()
exports.updateJornada = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Jornada.update(req.body, {
            where: { JD_Jornada: id }
        });
        
        if (updated === 0) return res.status(404).json({ message: 'Jornada no encontrada' });
        res.status(200).json({ message: 'Jornada actualizada', id, data: req.body });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar jornada', error: error.message });
    }
};

// Equivale a remove()
exports.deleteJornada = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Jornada.destroy({
            where: { JD_Jornada: id }
        });
        
        if (deleted === 0) return res.status(404).json({ message: 'Jornada no encontrada' });
        res.status(200).json({ message: 'Jornada eliminada', deletedId: id });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar jornada', error: error.message });
    }
};