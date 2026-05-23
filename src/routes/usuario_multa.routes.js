const express = require("express");
const router = express.Router();
const usuarioMultaController = require("../controllers/usuario_multa.controller");
const { checkRole, checkOwnership } = require('../middlewares/auth.middleware');

// Rutas de ADMINISTRADOR
router.get("/", checkRole(['ADMINISTRADOR']), usuarioMultaController.getAllUsuarioMulta);
router.get("/vehiculo/:VEH_ID_VEHICULO", checkRole(['ADMINISTRADOR']), usuarioMultaController.getUsuarioMultaByVehiculo);
router.post("/", checkRole(['ADMINISTRADOR']), usuarioMultaController.createUsuarioMulta);
router.put("/:EMU_USUARIO_MULTA", checkRole(['ADMINISTRADOR']), usuarioMultaController.updateUsuarioMulta);

// Ruta para que ADMINISTRADOR y USUARIO vean las multas por carné. USUARIO solo puede ver el suyo.
router.get("/carne/:carne", checkRole(['ADMINISTRADOR', 'USUARIO']), checkOwnership('carne'), usuarioMultaController.getUsuarioMultaByCarne);

// Detalle de una multa de usuario (incluye MUL_DESCRIPCION y MUL_MONTO_TOTAL). USUARIO solo ve las suyas.
router.get("/:EMU_USUARIO_MULTA", checkRole(['ADMINISTRADOR', 'USUARIO']), usuarioMultaController.getUsuarioMultaById);

module.exports = router;
