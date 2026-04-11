
const PlanParqueoStore = require('../store/plan_parqueo.store');

class PlanParqueoController {

    // Obtener todos los planes
    static async obtenerPlanes(req, res) {
        try {
            const planes = await PlanParqueoStore.getAll();
            res.status(200).json(planes);
        } catch (error) {
            res.status(500).json({
                message: 'Error al obtener los planes',
                error: error.message
            });
        }
    }

    // Obtener plan por ID
    static async obtenerPlanPorId(req, res) {
        try {

            const id = req.params.id;

            if (!id) {
                return res.status(400).json({
                    message: 'El ID es obligatorio'
                });
            }

            const plan = await PlanParqueoStore.getById(id);

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
    }

    // Crear plan
    static async crearPlan(req, res) {


        try {


            const {
                PLN_PLAN,
                PLN_NAME,
                PLN_DESCRIPCION,
                PLN_PRECIO,
                PLN_ESTADO,
                PLN_MONEDA
            } = req.body;
            // Se elimina el campo PLN_PLAN porque es autogenerado
            delete req.body.PLN_PLAN;
            /* VALIDACIONES */

/*             if (!PLN_PLAN) {
                return res.status(400).json({
                    message: 'El ID del plan es obligatorio'
                });
            } */

            if (!PLN_NAME || PLN_NAME.trim() === '') {
                return res.status(400).json({
                    message: 'El nombre del plan es obligatorio'
                });
            }

            if (!PLN_DESCRIPCION || PLN_DESCRIPCION.trim() === '') {
                return res.status(400).json({
                    message: 'La descripción es obligatoria'
                });
            }

            if (!PLN_PRECIO || PLN_PRECIO <= 0) {
                return res.status(400).json({
                    message: 'El precio debe ser mayor a 0'
                });
            }

            if (!PLN_ESTADO) {
                return res.status(400).json({
                    message: 'El estado es obligatorio'
                });
            }

            if (PLN_ESTADO !== 'A' && PLN_ESTADO !== 'I') {
                return res.status(400).json({
                    message: 'El estado debe ser A o I'
                });
            }

            if (!PLN_MONEDA || PLN_MONEDA.trim() === '') {
                return res.status(400).json({
                    message: 'La moneda es obligatoria'
                });
            }

            const monedasValidas = ['GTQ', 'USD', 'EUR'];

            if (!monedasValidas.includes(PLN_MONEDA)) {
                return res.status(400).json({
                    message: 'La moneda debe ser GTQ, USD o USD o EUR'
                });
            }

            /* VERIFICAR SI YA EXISTE */

            const existe = await PlanParqueoStore.getById(PLN_PLAN);

            if (existe) {
                return res.status(400).json({
                    message: 'El plan ya existe'
                });
            }
            

            const nuevoPlan = await PlanParqueoStore.create(req.body);

            res.status(201).json({
                message: 'Plan creado correctamente',
                data: nuevoPlan
            });

        } catch (error) {
            console.log("Error al crear el plan:", error);
            res.status(500).json({
                message: 'Error al crear el plan',
                error: error.message
            });
        }
    }

    // Actualizar plan
    static async actualizarPlan(req, res) {
        try {

            const id = req.params.id;

            const {
                PLN_NAME,
                PLN_DESCRIPCION,
                PLN_PRECIO,
                PLN_ESTADO,
                PLN_MONEDA
            } = req.body;

            /* VALIDAR ID */

            if (!id) {
                return res.status(400).json({
                    message: 'El ID es obligatorio'
                });
            }

            /* VALIDACIONES */

            if (!PLN_NAME || PLN_NAME.trim() === '') {
                return res.status(400).json({
                    message: 'El nombre del plan es obligatorio'
                });
            }

            if (!PLN_DESCRIPCION || PLN_DESCRIPCION.trim() === '') {
                return res.status(400).json({
                    message: 'La descripción es obligatoria'
                });
            }

            if (!PLN_PRECIO || PLN_PRECIO <= 0) {
                return res.status(400).json({
                    message: 'El precio debe ser mayor a 0'
                });
            }

            if (!PLN_ESTADO) {
                return res.status(400).json({
                    message: 'El estado es obligatorio'
                });
            }

            if (PLN_ESTADO !== 'A' && PLN_ESTADO !== 'I') {
                return res.status(400).json({
                    message: 'El estado debe ser A o I'
                });
            }

            if (!PLN_MONEDA || PLN_MONEDA.trim() === '') {
                return res.status(400).json({
                    message: 'La moneda es obligatoria'
                });
            }

            const monedasValidas = ['GTQ', 'USD', 'EUR'];

            if (!monedasValidas.includes(PLN_MONEDA)) {
                return res.status(400).json({
                    message: 'La moneda debe ser GTQ, USD o EUR'
                });
            }

            /* VERIFICAR SI EXISTE */

            const existe = await PlanParqueoStore.getById(id);

            if (!existe) {
                return res.status(404).json({
                    message: 'Plan no encontrado'
                });
            }

            const rowsAffected = await PlanParqueoStore.update(id, req.body);

            res.status(200).json({
                message: 'Plan actualizado correctamente',
                rowsAffected
            });

        } catch (error) {
            res.status(500).json({
                message: 'Error al actualizar el plan',
                error: error.message
            });
        }
    }

    // Eliminar plan
    static async eliminarPlan(req, res) {
        try {

            const id = req.params.id;

            if (!id) {
                return res.status(400).json({
                    message: 'El ID es obligatorio'
                });
            }

            const existe = await PlanParqueoStore.getById(id);

            if (!existe) {
                return res.status(404).json({
                    message: 'Plan no encontrado'
                });
            }

            const rowsDeleted = await PlanParqueoStore.delete(id);

            res.status(200).json({
                message: 'Plan eliminado correctamente',
                rowsDeleted
            });

        } catch (error) {
            res.status(500).json({
                message: 'Error al eliminar el plan',
                error: error.message
            });
        }
    }

}

module.exports = PlanParqueoController;