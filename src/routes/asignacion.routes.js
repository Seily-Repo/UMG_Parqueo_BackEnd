const express = require('express');
const router = express.Router();
const asignacionController = require('../controllers/asignacion.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

router.get('/',verifyToken, checkRole(['USUARIO', 'ADMINISTRADOR']), asignacionController.getAllAsignaciones);
router.post('/',verifyToken, checkRole(['USUARIO', 'ADMINISTRADOR']), asignacionController.createAsignacion);
router.delete('/anular/:id',verifyToken, checkRole(['ADMINISTRADOR']), asignacionController.anularAsignacion);
router.put('/cambiar/:id', verifyToken, checkRole(['USUARIO', 'ADMINISTRADOR']), asignacionController.updateAsignacion);
router.get('/disponibilidad/ocupados', verifyToken, checkRole(['USUARIO', 'ADMINISTRADOR']), asignacionController.getEspaciosOcupados);
router.get('/disponibilidad/libres', verifyToken, checkRole(['USUARIO', 'ADMINISTRADOR']), asignacionController.getEspaciosLibres);

module.exports = router;