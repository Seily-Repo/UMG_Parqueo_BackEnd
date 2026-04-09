const express = require("express");
const router = express.Router();
const estudianteController = require("../controllers/estudiante.controller");

// Rutas CRUD básicas
router.get("/", estudianteController.getAllEstudiantes);
router.get("/carne/:carne", estudianteController.getEstudianteByCarne);
router.post("/", estudianteController.createEstudiante);
router.put("/carne/:carne", estudianteController.updateEstudiante);
router.delete("/carne/:carne", estudianteController.deleteEstudiante);

module.exports = router;
