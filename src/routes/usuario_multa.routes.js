const express = require("express");
const router = express.Router();
const usuarioMultaController = require("../controllers/usuario_multa.controller");

router.get("/", usuarioMultaController.getAllUsuarioMulta);
router.get("/vehiculo/:VEH_ID_VEHICULO", usuarioMultaController.getUsuarioMultaByVehiculo);
router.post("/", usuarioMultaController.createUsuarioMulta);
router.put("/:EMU_USUARIO_MULTA", usuarioMultaController.updateUsuarioMulta);

module.exports = router;
