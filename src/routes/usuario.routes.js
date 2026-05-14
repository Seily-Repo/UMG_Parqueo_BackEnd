const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuario.controller");
const { checkRole, checkOwnership } = require('../middlewares/auth.middleware');

// Rutas CRUD básicas
// Permitimos que ADMIN y USUARIO entren, pero USUARIO solo puede ver su propio carné
router.get("/carne/:carne", checkRole(['ADMINISTRADOR', 'USUARIO']), checkOwnership('carne'), usuarioController.getUsuarioByCarne);

// Añadimos la consulta por placa
router.get("/vehiculo/placa/:placa", checkRole(['ADMINISTRADOR']), usuarioController.getVehiculoByPlaca);

module.exports = router;