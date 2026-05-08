const express = require('express');
const router = express.Router();
const tipoEspacioController = require('../controllers/tipo_espacio.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

// 1. Obtener todos los tipos de espacio (General)
router.get('/', verifyToken, checkRole(['ESTUDIANTE','ADMINISTRADOR']), tipoEspacioController.getAllTipos);

// 2. Crear nuevo tipo (Con validación de basura, duplicados y cálculo de porcentaje)
router.post('/', verifyToken, checkRole(['ADMINISTRADOR']), tipoEspacioController.crearTipoEspacio);

// 3. Listar espacios de un tipo específico filtrados por estado (query param ?estado=1)
router.get('/:idTipo/espacios', verifyToken, checkRole(['ADMINISTRADOR']), tipoEspacioController.listarEspaciosPorTipoYEstado);

// 4. Editar tipo de espacio (Actualiza nombre o capacidad máxima)
router.put('/:id', verifyToken, checkRole(['ADMINISTRADOR']), tipoEspacioController.updateTipoEspacio);

/**
 * 5. Inactivar tipo de espacio (BORRADO LÓGICO)
 * Cambia TES_ESTADO a 0.
 * Validación: Falla si hay espacios con ES_Estado = 0 (Ocupados).
 */
router.put('/:id/estado', verifyToken, checkRole(['ADMINISTRADOR']), tipoEspacioController.updateEstadoTipo);

/**
 * 6. Eliminar tipo de espacio (BORRADO FÍSICO)
 * Elimina el registro y LIBERA los espacios vinculados (poniéndolos en NULL y estado 1).
 * Validación: Falla si hay espacios con ES_Estado = 0 (Ocupados).
 */
router.delete('/:id', verifyToken, checkRole(['ADMINISTRADOR']), tipoEspacioController.deleteTipoEspacio);

module.exports = router;