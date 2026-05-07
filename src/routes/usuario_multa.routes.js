const express = require("express");
const router = express.Router();
const usuarioMultaController = require("../controllers/usuario_multa.controller");
const { checkRole, checkOwnership } = require('../middlewares/auth.middleware');

// Rutas de ADMININISTRADOR
router.get("/", checkRole(['ADMINISTRADOR']), usuarioMultaController.getAllUsuarioMulta);
router.get("/vehiculo/:VEH_ID_VEHICULO", checkRole(['ADMINISTRADOR']), usuarioMultaController.getUsuarioMultaByVehiculo);
router.post("/", checkRole(['ADMINISTRADOR']), usuarioMultaController.createUsuarioMulta);
router.put("/:EMU_USUARIO_MULTA", checkRole(['ADMINISTRADOR']), usuarioMultaController.updateUsuarioMulta);

// Ruta para que ADMININISTRADOR y USUARIO vean las multas por carné. USUARIO solo puede ver el suyo.
router.get("/carne/:carne", checkRole(['ADMINISTRADOR', 'USUARIO']), checkOwnership('carne'), usuarioMultaController.getUsuarioMultaByCarne);

module.exports = router;
