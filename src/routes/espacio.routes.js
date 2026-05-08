const express = require('express');
const router = express.Router();
const espacioController = require('../controllers/espacio.controller');
const { verifyToken, checkRole } = require('../middlewares/jwt.middleware');

// 1. Listados
router.get('/', verifyToken, checkRole(['ADMINISTRADOR']), espacioController.getAllEspacios);
router.get('/tipo/:tipoId', verifyToken, checkRole(['ADMINISTRADOR']), espacioController.getEspaciosByTipo); // Ya definida arriba
router.get('/parqueo/:id', verifyToken, checkRole(['ADMINISTRADOR']), espacioController.getParqueoById);

// 2. Disponibilidad
router.get('/disponibilidad/avanzada', verifyToken, checkRole(['ADMINISTRADOR']), espacioController.getDisponibilidadAvanzada);
router.get('/metricas/:tipoId', verifyToken, checkRole(['ADMINISTRADOR']), espacioController.getMetricasDisponibilidad); // Ya definida arriba

// 3. CRUD
router.post('/', verifyToken, checkRole(['ADMINISTRADOR']), espacioController.createEspacio);
router.put('/:id', verifyToken, checkRole(['ADMINISTRADOR']), espacioController.updateEspacio);
router.delete('/:id', verifyToken, checkRole(['ADMINISTRADOR']), espacioController.deleteEspacio);
router.put('/:id/estado', verifyToken, checkRole(['ADMINISTRADOR']), espacioController.updateEstadoEspacio);

module.exports = router;