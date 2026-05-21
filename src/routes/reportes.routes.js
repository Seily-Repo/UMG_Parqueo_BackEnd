const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportes.controller');

//financieros
router.get('reporte-financiero', reportesController.getReporteFinanciero);
router.get('pagos-aceptados', reportesController.getPagosAceptados);

//administrativos
router.get('reporte-administrativo', reportesController.getReporteAdministrativo);
router.get('excel', reportesController.createExcel);
router.get('pdf', reportesController.createPDF);

router.get('dashboard', reportesController.getReporteGerencial); //gerenciales 1
router.get('ingresos-mensuales', reportesController.getIngresosMensuales);//gerenciales 2
router.get('distribucion-facultades', reportesController.getDistribucionFacultades);//gerenciales 3

module.exports = router;