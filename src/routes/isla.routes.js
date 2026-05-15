const express = require('express');
const router = express.Router();
const IslaController = require('../controllers/isla.controller');
//const { verificarToken } = require('../middleware/jwt.middleware'); 

router.post('/',  IslaController.createIsla);

router.get('/',  IslaController.getAllIslas);

router.get('/:id/espacios',  IslaController.getDetalleIsla);

router.put('/:id/anular',  IslaController.anularIsla);

module.exports = router;