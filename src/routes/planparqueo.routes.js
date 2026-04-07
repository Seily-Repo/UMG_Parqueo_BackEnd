const express = require('express');
const router = express.Router();
const controller = require('../controllers/Plan_Parqueo.controller');

router.get('/', controller.obtenerPlanes);
router.get('/:id', controller.obtenerPlanPorId);
router.post('/', controller.crearPlan);
router.put('/:id', controller.actualizarPlan);
router.delete('/:id', controller.eliminarPlan);

module.exports = router;