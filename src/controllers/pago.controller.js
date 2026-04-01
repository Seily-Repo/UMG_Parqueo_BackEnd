const PagoStore = require('../store/pago.store');

// Obtener todos los pagos
exports.getAllPagos = async (req, res) => {
    try {
        const pagos = await PagoStore.getAll();
        res.status(200).json(pagos);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener los pagos',
            error: error.message
        });
    }
};

// Obtener pago por ID
exports.getPagoById = async (req, res) => {
    try {
        const pago = await PagoStore.getById(req.params.id);

        if (!pago) {
            return res.status(404).json({
                message: 'Pago no encontrado'
            });
        }

        res.status(200).json(pago);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener el pago',
            error: error.message
        });
    }
};

// Crear pago
exports.createPago = async (req, res) => {
    try {
        const pago = await PagoStore.create(req.body);

        res.status(201).json({
            message: 'Pago creado exitosamente',
            data: pago
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error al crear el pago',
            error: error.message
        });
    }
};

// Actualizar pago
exports.updatePago = async (req, res) => {
    try {
        const rowsAffected = await PagoStore.update(req.params.id, req.body);

        if (rowsAffected[0] === 0) {
            return res.status(404).json({
                message: 'Pago no encontrado para actualizar'
            });
        }

        res.status(200).json({
            message: 'Pago actualizado exitosamente'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar el pago',
            error: error.message
        });
    }
};

// Eliminar pago
exports.deletePago = async (req, res) => {
    try {
        const rowsDeleted = await PagoStore.delete(req.params.id);

        if (rowsDeleted === 0) {
            return res.status(404).json({
                message: 'Pago no encontrado para eliminar'
            });
        }

        res.status(200).json({
            message: 'Pago eliminado exitosamente'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar el pago',
            error: error.message
        });
    }
};