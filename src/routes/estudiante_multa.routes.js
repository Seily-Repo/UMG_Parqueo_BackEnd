const express = require("express");
const router = express.Router();
const estudianteMultaController = require("../controllers/estudiante_multa.controller");

// Rutas CRUD básicas
router.get("/", estudianteMultaController.getAllEstudianteMulta);
router.get("/carne/:EST_CARNE", estudianteMultaController.getEstudianteMultaByEstudianteCarne,);
router.post("/", estudianteMultaController.createEstudianteMulta);
router.put("/:EMU_ESTUDIANTE_MULTA", estudianteMultaController.updateEstudianteMulta,);

module.exports = router;
