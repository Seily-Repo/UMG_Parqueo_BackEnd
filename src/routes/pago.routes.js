const express = require("express");
const router = express.Router();
const pagoController = require("../controllers/pago.controller");

// Rutas CRUD básicas
router.get("/", pagoController.getAllPagos);
router.get("/:id", pagoController.getPagoById);
router.post("/", pagoController.createPago);
router.put("/:id", pagoController.updatePago);
router.delete("/:id", pagoController.deletePago);

module.exports = router;
