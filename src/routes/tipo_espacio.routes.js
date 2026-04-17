const express = require('express');
const router = express.Router();
const tipoEspacioController = require('../controllers/tipo_espacio.controller');

// 1. Obtener todos los tipos de espacio (General)
router.get('/', tipoEspacioController.getAllTipos);

// 2. Crear nuevo tipo (Con validación de basura, duplicados y cálculo de porcentaje)
router.post('/', tipoEspacioController.crearTipoEspacio);

// 3. Listar espacios de un tipo específico filtrados por estado (query param ?estado=1)
router.get('/:idTipo/espacios', tipoEspacioController.listarEspaciosPorTipoYEstado);

// 4. Editar tipo de espacio (Actualiza nombre o capacidad máxima)
router.put('/:id', tipoEspacioController.updateTipoEspacio);

/**
 * 5. Inactivar tipo de espacio (BORRADO LÓGICO)
 * Cambia TES_ESTADO a 0.
 * Validación: Falla si hay espacios con ES_Estado = 0 (Ocupados).
 */
router.put('/:id/estado', tipoEspacioController.updateEstadoTipo);

/**
 * 6. Eliminar tipo de espacio (BORRADO FÍSICO)
 * Elimina el registro y LIBERA los espacios vinculados (poniéndolos en NULL y estado 1).
 * Validación: Falla si hay espacios con ES_Estado = 0 (Ocupados).
 */
router.delete('/:id', tipoEspacioController.deleteTipoEspacio);

module.exports = router;