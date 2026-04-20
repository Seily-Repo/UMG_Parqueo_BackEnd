const express = require('express');
const router = express.Router();
const parqueoController = require('../controllers/parqueo.controller');

router.get('/', parqueoController.getAllParqueos);
router.get('/:id', parqueoController.getParqueoById);
router.post('/', parqueoController.createParqueo);
router.put('/:id', parqueoController.updateParqueo);
router.delete('/:id', parqueoController.deleteParqueo);
router.put('/:id/restore', parqueoController.restoreParqueo);
// ======================
// ADMIN (ver todo)
// ======================
router.get('/admin/all', parqueoController.getAllParqueosAdmin);

module.exports = router;