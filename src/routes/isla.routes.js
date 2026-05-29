const express = require('express');
const router = express.Router();
const IslaController = require('../controllers/isla.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

router.post('/', verifyToken, checkRole(['ADMINISTRADOR']), IslaController.createIsla);

router.get('/', verifyToken, checkRole(['ADMINISTRADOR', 'USUARIO']), IslaController.getAllIslas);

router.get('/:id/espacios', verifyToken, checkRole(['ADMINISTRADOR', 'USUARIO']), IslaController.getDetalleIsla);

router.put('/:id/anular', verifyToken, checkRole(['ADMINISTRADOR']), IslaController.anularIsla);

module.exports = router;