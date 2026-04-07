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
        const { id } = req.params;
        //console.log("este es el valor de id para obtener una multa: ", id);
        if (isNaN(Number(id))) {
            return res.status(400).json({
                message: 'Error de validación: El ID debe ser un valor numérico.'
            });
        }

        const multa = await MultaStore.getById(id);
        
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
        const { MUL_id_multa, MUL_descripcion } = req.body;

        if (isNaN(Number(MUL_id_multa))) {
            return res.status(400).json({
                message: 'Error de validación: El ID de la multa debe ser un número válido.'
            });
        }

        const existente = await MultaStore.getById(MUL_id_multa);
        if (existente) {
            return res.status(400).json({
                message: 'El ID de la multa ya existe en el sistema'
            });
        }

        const existeDesc = await MultaStore.getByDescripcion(MUL_descripcion);
        if (existeDesc) {
            return res.status(400).json({
                message: 'Ya existe una multa con esa misma descripción'
            });
        }

        const multa = await MultaStore.create(req.body);
        res.status(201).json({
            message: 'Multa creada exitosamente',
            data: multa
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error interno al procesar la solicitud',
            error: error.message
        });
    }
};

exports.updateMulta = async (req, res) => {
    try {
        const { id } = req.params;
        const { MUL_descripcion, MUL_monto_total, MUL_monto_base } = req.body;

        if (isNaN(Number(id))) {
            return res.status(400).json({
                message: 'Error: El ID en la URL debe ser un valor numérico'
            });
        }

        const multaExistente = await MultaStore.getById(id);
        if (!multaExistente) {
            return res.status(404).json({
                message: 'Multa no encontrada para actualizar'
            });
        }

        if (MUL_descripcion) {
            const multaConMismoNombre = await MultaStore.getByDescripcion(MUL_descripcion);
            
            if (multaConMismoNombre && multaConMismoNombre.MUL_id_multa != id) {
                return res.status(400).json({
                    message: 'Error: Ya existe otra multa con esa misma descripción'
                });
            }
        }

        //validar monto total
        if (MUL_monto_total && isNaN(Number(MUL_monto_total))) {
            return res.status(400).json({ message: 'El monto total debe ser numérico' });
        }
        //validar monto base
        if (MUL_monto_base && isNaN(Number(MUL_monto_base))) {
            return res.status(400).json({ message: 'El monto base debe ser numérico' });
        }
        //validar impuesto
        if (req.body.MUL_impuesto && isNaN(Number(req.body.MUL_impuesto))) {
            return res.status(400).json({ message: 'El impuesto debe ser numérico' });
        }

        const dataUpdate = {
            ...req.body,
            MUL_modificado_por: req.body.MUL_modificado_por || 'system',
            MUL_direccion_ip: req.ip || req.body.MUL_direccion_ip
        };

        const rowsAffected = await MultaStore.update(id, dataUpdate);
        
        if (rowsAffected[0] === 0) {
            return res.status(400).json({
                message: 'No se realizaron cambios en la multa o los datos son idénticos'
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
