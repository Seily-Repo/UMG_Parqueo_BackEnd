
const Jornada = require('../model/jornada.model');

exports.getAllJornadas = async (req, res) => {
    try {
        const jornadas = await Jornada.findAll();
        res.status(200).json(jornadas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getJornadaById = async (req, res) => {
    try {
        const jornada = await Jornada.findByPk(req.params.id);
        if (!jornada) return res.status(404).json({ message: 'No encontrado' });
        res.status(200).json(jornada);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createJornada = async (req, res) => {
    try {
        const { JD_TipoJornada, JD_Descripcion } = req.body;

        const nuevaJornada = await Jornada.create({
            JD_TipoJornada,
            JD_Descripcion
        });

        res.status(201).json({
            message: "Jornada creada exitosamente",
            data: nuevaJornada
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error al crear la jornada',
            error: error.message 
        });
    }
};

exports.updateJornada = async (req, res) => {
    try {
        const { id } = req.params;

        const { JD_TipoJornada, JD_Descripcion } = req.body;

        const datosLimpios = { JD_TipoJornada, JD_Descripcion };

        const [updatedRows] = await Jornada.update(datosLimpios, {
            where: { JD_Jornada: id }
        });

        if (updatedRows === 0) {
            return res.status(404).json({ message: 'No se encontró la jornada para actualizar.' });
        }

        res.status(200).json({ 
            message: 'Jornada actualizada exitosamente', 
            data: datosLimpios 
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteJornada = async (req, res) => {
    try {
        await Jornada.destroy({ where: { JD_Jornada: req.params.id } });
        res.status(200).json({ message: 'Eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};