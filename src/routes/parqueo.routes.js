const express = require('express');
const router = express.Router();
const parqueoController = require('../controllers/parqueo.controller');
const { verifyToken, checkRole } = require('../middlewares/jwt.middleware');

router.get('/', verifyToken, checkRole(['ESTUDIANTE','ADMINISTRADOR']), parqueoController.getAllParqueos);
router.get('/:id', verifyToken, checkRole(['ADMINISTRADOR']), parqueoController.getParqueoById);
router.post('/', verifyToken, checkRole(['ADMINISTRADOR']), parqueoController.createParqueo);
router.put('/:id', verifyToken, checkRole(['ADMINISTRADOR']), parqueoController.updateParqueo);
router.delete('/:id', verifyToken, checkRole(['ADMINISTRADOR']), parqueoController.deleteParqueo);
router.put('/:id/restore', verifyToken, checkRole(['ADMINISTRADOR']), parqueoController.restoreParqueo);
// ======================
// ADMIN (ver todo)
// ======================
router.get('/admin/all', verifyToken, checkRole(['ADMINISTRADOR']), parqueoController.getAllParqueosAdmin);

module.exports = router;