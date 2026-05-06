const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportes.controller');

router.get('/reporte-financiero', reportesController.getReporteFinanciero);
router.get('/reporte-administrativo', reportesController.getReporteAdministrativo);


router.get('/dashboard', reportesController.getReporteGerencial); //gerenciales 1
router.get('/ingresos-mensuales', reportesController.getIngresosMensuales);//gerenciales 2
router.get('/distribucion-facultades', reportesController.getDistribucionFacultades);//gerenciales 3

module.exports = router;