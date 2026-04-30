const express = require("express");
const router = express.Router();
const pagoController = require("../controllers/pago.controller");

// Rutas CRUD básicas
router.get("/", pagoController.getAllPagos);
router.get("/verify/:pi", pagoController.verifyPayment);
router.get("/:id", pagoController.getPagoById);
router.post("/", pagoController.createPago);
router.put("/:id", pagoController.updatePago);

module.exports = router;
