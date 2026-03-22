const express = require('express');
const router = express.Router();
const asignacionController = require('../controllers/asignacion.controller');

router.get('/', asignacionController.getAllAsignaciones);
router.post('/', asignacionController.createAsignacion);
router.put('/anular/:id', asignacionController.anularAsignacion);

module.exports = router;