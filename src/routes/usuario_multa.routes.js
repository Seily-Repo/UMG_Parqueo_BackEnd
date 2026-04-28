const express = require("express");
const router = express.Router();
const usuarioMultaController = require("../controllers/usuario_multa.controller");

// GET todos los registros
router.get("/", usuarioMultaController.getAllUsuarioMulta);

// GET por placa/vehículo
router.get("/vehiculo/:VEH_ID_VEHICULO", usuarioMultaController.getUsuarioMultaByVehiculo);

// POST crear nuevo registro
router.post("/", usuarioMultaController.createUsuarioMulta);

// PUT actualizar registro
router.put("/:EMU_USUARIO_MULTA", usuarioMultaController.updateUsuarioMulta);

module.exports = router;
