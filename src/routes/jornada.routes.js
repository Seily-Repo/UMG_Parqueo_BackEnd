const express = require('express');
const router = express.Router();
const jornadaController = require('../controllers/jornada.controller');

// Definición de rutas limpia y estándar
router.get('/', jornadaController.getAllJornadas);
router.get('/:id', jornadaController.getJornadaById);
router.post('/', jornadaController.createJornada);
router.put('/:id', jornadaController.updateJornada);
router.delete('/:id', jornadaController.deleteJornada);

module.exports = router;