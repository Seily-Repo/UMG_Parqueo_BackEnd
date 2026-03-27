const MultaStore = require('../store/multa.store');

exports.getAllMultas = async (req, res) => {
    try {
        const multas = await MultaStore.getAll();
        res.status(200).json(multas);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener las multas',
            error: error.message
        });
    }
};

exports.getMultaById = async (req, res) => {
    try {
        const multa = await MultaStore.getById(req.params.id);
        if (!multa) {
            return res.status(404).json({
                message: 'Multa no encontrada'
            });
        }
        res.status(200).json(multa);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener la multa',
            error: error.message
        });
    }
};

exports.createMulta = async (req, res) => {
    try {
        const existente = await MultaStore.getById(req.body.MUL_id_multa);
        if (existente) {
            return res.status(400).json({
                message: 'El ID de la multa ya existe'
            });
        }

        const multa = await MultaStore.create(req.body);
        res.status(201).json({
            message: 'Multa creada exitosamente',
            data: multa
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al crear la multa',
            error: error.message
        });
    }
};

exports.updateMulta = async (req, res) => {
    try {
        const dataUpdate = {
            ...req.body,
            MUL_direccion_ip: req.ip || req.body.MUL_direccion_ip
        };

        const rowsAffected = await MultaStore.update(req.params.id, dataUpdate);
        
        if (rowsAffected[0] === 0) {
            return res.status(404).json({
                message: 'Multa no encontrada para actualizar'
            });
        }
        res.status(200).json({
            message: 'Multa actualizada exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar la multa',
            error: error.message
        });
    }
};
