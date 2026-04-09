const express = require('express');
const router = express.Router();
const espacioController = require('../controllers/espacio.controller');

// Obtener todos los espacios físicos
router.get('/', espacioController.getAllEspacios);

// Obtener espacios filtrados por su TIPO (Motos, Carros, etc.)
router.get('/tipo/:tipoId', espacioController.getEspaciosByTipo); // Cambiado para coincidir con la jerarquía

// Consultar disponibilidad (Libres)
router.get('/disponibilidad/libres', espacioController.getLibres);

// CRUD básico
router.post('/', espacioController.createEspacio);
router.put('/:id', espacioController.updateEspacio);
router.delete('/:id', espacioController.deleteEspacio);

module.exports = router;