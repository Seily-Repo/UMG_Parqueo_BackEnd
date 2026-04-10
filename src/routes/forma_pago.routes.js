const express = require("express");
const router = express.Router();
const fpgController = require("../controllers/forma_pago.controller");

router.get("/", fpgController.getAllFormasPago);
router.get("/:FPG_FORMA_PAGO", fpgController.getFormaPagoById);
router.post("/", fpgController.createFormaPago);
router.put("/:FPG_FORMA_PAGO", fpgController.updateFormaPago);

module.exports = router;
