const express = require('express');
const router = express.Router();
const IslaController = require('../controllers/isla.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

router.post('/', verifyToken, IslaController.createIsla);

router.get('/', verifyToken, checkRole(['ADMINISTRADOR']), IslaController.getAllIslas);

router.get('/:id/espacios', verifyToken, checkRole(['ADMINISTRADOR']), IslaController.getDetalleIsla);

router.put('/:id/anular', verifyToken, IslaController.anularIsla);

module.exports = router;