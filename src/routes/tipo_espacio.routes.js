const express = require('express');
const router = express.Router();
const tipoEspacioController = require('../controllers/tipo_espacio.controller');

// 1. Obtener todos los tipos de espacio (General)
router.get('/', tipoEspacioController.getAllTipos);

// 2. Crear nuevo tipo (Con validación de basura, duplicados y cálculo de porcentaje)
router.post('/', tipoEspacioController.crearTipoEspacio);

//3. Listar espacios de un tipo específico filtrados por estado (query param ?estado=1)
router.get('/:idTipo/espacios', tipoEspacioController.listarEspaciosPorTipoYEstado);

// 4. Editar tipo de espacio (Actualiza nombre a MAYÚSCULAS o recalcula porcentaje)
router.put('/:id', tipoEspacioController.updateTipoEspacio);

// 5. Eliminar tipo de espacio (Elimina el tipo y LIBERA todos los espacios vinculados)
router.delete('/:id', tipoEspacioController.deleteTipoEspacio);

module.exports = router;