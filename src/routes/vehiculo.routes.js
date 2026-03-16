const express = require('express');
const router = express.Router();
const vehiculoController = require('../controllers/vehiculo.controller');

router.get('/', vehiculoController.getAllVehiculos);
router.get('/:id', vehiculoController.getVehiculoById);
router.post('/', vehiculoController.createVehiculo);
router.put('/:id', vehiculoController.updateVehiculo);
router.delete('/:id', vehiculoController.deleteVehiculo);

module.exports = router;