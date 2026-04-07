const PlanParqueoStore = require('../store/Plan_Parqueo.store');

/* OBTENER TODOS */
exports.obtenerPlanes = async (req, res) => {
    try {
        const planes = await PlanParqueoStore.getAll();

        res.status(200).json(planes);

    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener los planes',
            error: error.message
        });
    }
};

/* OBTENER POR ID */
exports.obtenerPlanPorId = async (req, res) => {
    try {

        const plan = await PlanParqueoStore.getById(req.params.id);

        if (!plan) {
            return res.status(404).json({
                message: 'Plan no encontrado'
            });
        }

        res.status(200).json(plan);

    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener el plan',
            error: error.message
        });
    }
};

/* CREAR */
exports.crearPlan = async (req, res) => {
    try {

        const existente = await PlanParqueoStore.getById(req.body.PLA_ID_PLAN);

        if (existente) {
            return res.status(400).json({
                message: 'El ID del plan ya existe'
            });
        }

        const plan = await PlanParqueoStore.create(req.body);

        res.status(201).json({
            message: 'Plan creado exitosamente',
            data: plan
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error al crear el plan',
            error: error.message
        });
    }
};

/* ACTUALIZAR */
exports.actualizarPlan = async (req, res) => {
    try {

        const rowsAffected = await PlanParqueoStore.update(
            req.params.id,
            req.body
        );

        if (rowsAffected === 0) {
            return res.status(404).json({
                message: 'Plan no encontrado para actualizar'
            });
        }

        res.status(200).json({
            message: 'Plan actualizado exitosamente'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar el plan',
            error: error.message
        });
    }
};

/* ELIMINAR */
exports.eliminarPlan = async (req, res) => {
    try {

        const rowsDeleted = await PlanParqueoStore.delete(req.params.id);

        if (rowsDeleted === 0) {
            return res.status(404).json({
                message: 'Plan no encontrado para eliminar'
            });
        }

        res.status(200).json({
            message: 'Plan eliminado exitosamente'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar el plan',
            error: error.message
        });
    }
};