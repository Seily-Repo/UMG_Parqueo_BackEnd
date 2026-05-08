const express = require('express');
const router = express.Router();
const asignacionController = require('../controllers/asignacion.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

router.get('/',verifyToken, checkRole(['ESTUDIANTE', 'ADMINISTRADOR']), asignacionController.getAllAsignaciones);
router.post('/',verifyToken, checkRole(['ESTUDIANTE', 'ADMINISTRADOR']), asignacionController.createAsignacion);
router.delete('/anular/:id',verifyToken, checkRole(['ADMINISTRADOR']), asignacionController.anularAsignacion);
router.put('/cambiar/:id', verifyToken, checkRole(['ESTUDIANTE', 'ADMINISTRADOR']), asignacionController.updateAsignacion);
router.get('/disponibilidad/ocupados', verifyToken, checkRole(['ESTUDIANTE', 'ADMINISTRADOR']), asignacionController.getEspaciosOcupados);
router.get('/disponibilidad/libres', verifyToken, checkRole(['ESTUDIANTE', 'ADMINISTRADOR']), asignacionController.getEspaciosLibres);

module.exports = router;