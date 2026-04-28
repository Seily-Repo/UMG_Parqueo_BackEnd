const express = require("express");
const router = express.Router();
const usuarioMorosoController = require("../controllers/usuario_moroso.controller");

router.get("/", usuarioMorosoController.getAllUsuarioMoroso);
router.get("/carne/:carne", usuarioMorosoController.getUsuarioMorosoByCarne);
router.post("/", usuarioMorosoController.createUsuarioMoroso);
router.put("/:MOR_USUARIO_MOROSO", usuarioMorosoController.updateUsuarioMoroso);

module.exports = router;
