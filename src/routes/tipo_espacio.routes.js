const express = require('express');
const router = express.Router();
const tipoEspacioController = require('../controllers/tipo_espacio.controller');

// Obtener todos
router.get('/', tipoEspacioController.getAllTipos);

// Crear nuevo tipo (con cálculo de porcentaje)
router.post('/', tipoEspacioController.crearTipoEspacio);

// Listar por parqueo
router.get('/parqueo/:idParqueo', tipoEspacioController.listarTiposPorParqueo);

// --- COMENTA ESTAS LÍNEAS PARA EVITAR EL CRASH ---
// router.put('/:id', tipoEspacioController.updateTipoEspacio); // Línea 15: Aquí es donde truena
// router.delete('/:id', tipoEspacioController.deleteTipoEspacio);

module.exports = router;