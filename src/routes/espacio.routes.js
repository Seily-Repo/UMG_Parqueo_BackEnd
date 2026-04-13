const express = require('express');
const router = express.Router();
const espacioController = require('../controllers/espacio.controller');

// 1. Obtener todos los espacios físicos
router.get('/', espacioController.getAllEspacios);

// 2. Obtener espacios filtrados por su TIPO (Motos, Carros, etc.)
router.get('/tipo/:tipoId', espacioController.getEspaciosByTipo);

// 3. Consultar disponibilidad dinámica (Libres por jornada/semestre)
router.get('/disponibilidad/libres', espacioController.getLibres);

// 4. NUEVO: Obtener el conteo de espacios disponibles (Estado 1) para el Front
router.get('/count-disponibles/:tipoId', espacioController.getMetricasDisponibilidad);

// 5. CRUD básico
router.post('/', espacioController.createEspacio);
router.put('/:id', espacioController.updateEspacio);
router.delete('/:id', espacioController.deleteEspacio);

module.exports = router;