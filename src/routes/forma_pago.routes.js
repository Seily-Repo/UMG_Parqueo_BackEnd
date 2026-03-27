const express = require('express');
const router = express.Router();
const fpgController = require('../controllers/forma_pago.controller');

router.get('/', fpgController.getAllFormasPago);
router.get('/:id', fpgController.getFormaPagoById);
router.post('/', fpgController.createFormaPago);
router.put('/:id', fpgController.updateFormaPago);

module.exports = router;