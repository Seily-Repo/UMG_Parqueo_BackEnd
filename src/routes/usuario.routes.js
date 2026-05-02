const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuario.controller");

// Rutas CRUD básicas
router.get("/", usuarioController.getAllUsuarios);
router.get("/carne/:carne", usuarioController.getUsuarioByCarne);

module.exports = router;