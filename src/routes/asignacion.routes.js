const express = require('express');
const router = express.Router();
const asignacionController = require('../controllers/asignacion.controller');

router.get('/', asignacionController.getAllAsignaciones);
router.post('/', asignacionController.createAsignacion);
router.delete('/anular/:id', asignacionController.anularAsignacion);
router.put('/asignacion/cambiar/:id',  asignacionController.updateAsignacion);
router.get('/disponibilidad/ocupados', asignacionController.getEspaciosOcupados);
router.get('/disponibilidad/libres', asignacionController.getEspaciosLibres);

module.exports = router;