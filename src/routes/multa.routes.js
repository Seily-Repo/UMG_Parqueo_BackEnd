const express = require('express');
const router = express.Router();
const multaController = require('../controllers/multa.controller');

router.get('/', multaController.getAllMultas);
router.get('/:id', multaController.getMultaById);
router.post('/', multaController.createMulta);
router.put('/:id', multaController.updateMulta);
router.delete('/:id', multaController.deleteMulta);

module.exports = router;