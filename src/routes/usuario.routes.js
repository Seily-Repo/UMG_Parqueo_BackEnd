const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuario.controller");

// Rutas CRUD básicas
router.get("/", usuarioController.getAllUsuarios);
router.get("/carne/:carne", usuarioController.getUsuarioByCarne);
router.post("/", usuarioController.createUsuario);
router.put("/carne/:carne", usuarioController.updateUsuario);

module.exports = router;