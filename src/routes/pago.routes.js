const express = require("express");
const router = express.Router();
const pagoController = require("../controllers/pago.controller");
const { checkRole, checkOwnership } = require('../middlewares/auth.middleware');

// Rutas de ADMINISTRADOR
router.get("/", checkRole(['ADMINISTRADOR']), pagoController.getAllPagos);
router.get("/:id", checkRole(['ADMINISTRADOR']), pagoController.getPagoById);
router.put("/:id", checkRole(['ADMINISTRADOR']), pagoController.updatePago);

// Rutas compartidas (ADMINISTRADOR y USUARIO)
router.post("/", checkRole(['ADMINISTRADOR', 'USUARIO']), pagoController.createPago);
router.get("/verify/:pi", checkRole(['ADMINISTRADOR', 'USUARIO']), pagoController.verifyPayment);

// Ruta para que USUARIO vea solo sus pagos
router.get("/carne/:carne", checkRole(['ADMINISTRADOR', 'USUARIO']), checkOwnership('carne'), pagoController.getPagosByCarne);

module.exports = router;
