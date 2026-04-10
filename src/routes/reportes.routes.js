const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportes.controller');

router.get('/reporte-financiero', reportesController.getReporteFinanciero);
router.get('/reporte-administrativo', reportesController.getReporteAdministrativo);
router.get('/reporte-gerencial', reportesController.getReporteGerencial);

module.exports = router;