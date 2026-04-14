const express = require('express');
const router = express.Router();
const espacioController = require('../controllers/espacio.controller');

// 1. Listados
router.get('/', espacioController.getAllEspacios);
router.get('/tipo/:tipoId', espacioController.getEspaciosByTipo); // Ya definida arriba
router.get('/parqueo/:id', espacioController.getParqueoById);

// 2. Disponibilidad
router.get('/disponibilidad/avanzada', espacioController.getDisponibilidadAvanzada);
router.get('/metricas/:tipoId', espacioController.getMetricasDisponibilidad); // Ya definida arriba

// 3. CRUD
router.post('/', espacioController.createEspacio);
router.put('/:id', espacioController.updateEspacio);
router.delete('/:id', espacioController.deleteEspacio);

module.exports = router;