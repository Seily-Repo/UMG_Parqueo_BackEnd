const express = require("express");
const router = express.Router();
const pagoController = require("../controllers/pago.controller");
const { checkRole, checkOwnership } = require('../middlewares/auth.middleware');

// Rutas compartidas (rutas literales antes de /:id)
router.post("/", checkRole(["ADMINISTRADOR", "USUARIO"]), pagoController.createPago);
router.get(
  "/verify/:pi",
  checkRole(["ADMINISTRADOR", "USUARIO"]),
  pagoController.verifyPayment,
);
router.get(
  "/carne/:carne",
  checkRole(["ADMINISTRADOR", "USUARIO"]),
  checkOwnership("carne"),
  pagoController.getPagosByCarne,
);

// Rutas de ADMINISTRADOR
router.get("/", checkRole(["ADMINISTRADOR"]), pagoController.getAllPagos);

// Detalle / sincronización: USUARIO solo sus pagos (ownership en controller)
router.get(
  "/:id",
  checkRole(["ADMINISTRADOR", "USUARIO"]),
  pagoController.getPagoById,
);
router.put(
  "/:id",
  checkRole(["ADMINISTRADOR", "USUARIO"]),
  pagoController.updatePago,
);

module.exports = router;
