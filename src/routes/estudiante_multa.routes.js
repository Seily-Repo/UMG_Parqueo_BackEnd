const express = require('express');
const router = express.Router();
const estudianteMultaController = require('../controllers/estudiante_multa.controller'); 

// Rutas CRUD básicas
router.get('/', estudianteMultaController.getAllEstudianteMulta);
router.get('/estudiante/:EST_ID_ESTUDIANTE', estudianteMultaController.getEstudianteMultaByEstudianteId);
router.post('/', estudianteMultaController.createEstudianteMulta);
router.put('/:EMU_ID_EST_MULTA', estudianteMultaController.updateEstudianteMulta);
router.delete('/:EMU_ID_EST_MULTA', estudianteMultaController.deleteEstudianteMulta);

module.exports = router;