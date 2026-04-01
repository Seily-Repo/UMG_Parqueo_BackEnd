const express = require('express');
const router = express.Router();
const estudianteController = require('../controllers/estudiante.controller');

// Rutas CRUD básicas
router.get('/', estudianteController.getAllEstudiantes);
router.get('/:id', estudianteController.getEstudianteById);
router.get('/carne/:carne', estudianteController.getEstudianteByCarne);
router.post('/', estudianteController.createEstudiante);
router.put('/:id', estudianteController.updateEstudiante);
router.delete('/:id', estudianteController.deleteEstudiante);

module.exports = router;
