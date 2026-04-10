const express = require("express");
const router = express.Router();
const estudianteMorosoController = require("../controllers/estudiante_moroso.controller");

router.get("/", estudianteMorosoController.getAllEstudianteMoroso);
router.get("/carne/:carne", estudianteMorosoController.getEstudianteMorosoByCarne);
router.get("/:MOR_BLACKLIST_LOG", estudianteMorosoController.getEstudianteMorosoById);
router.post("/", estudianteMorosoController.createEstudianteMoroso);
router.put("/:MOR_BLACKLIST_LOG", estudianteMorosoController.updateEstudianteMoroso);

module.exports = router;
