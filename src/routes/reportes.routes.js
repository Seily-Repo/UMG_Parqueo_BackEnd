const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportes.controller');
const authMiddleware = require('../middlewares/authMiddleware');

//financieros
router.get('/reporte-financiero', authMiddleware.verifyToken, authMiddleware.checkRole(['ADMINISTRADOR']), reportesController.getReporteFinanciero);
router.get('/pagos-aceptados', authMiddleware.verifyToken, authMiddleware.checkRole(['ADMINISTRADOR']), reportesController.getPagosAceptados);

//administrativos
router.get('/reporte-administrativo', authMiddleware.verifyToken, authMiddleware.checkRole(['ADMINISTRADOR']), reportesController.getReporteAdministrativo);
router.get('/excel', authMiddleware.verifyToken, authMiddleware.checkRole(['ADMINISTRADOR']), reportesController.createExcel);
router.get('/pdf', authMiddleware.verifyToken, authMiddleware.checkRole(['ADMINISTRADOR']), reportesController.createPDF);

router.get('/dashboard', authMiddleware.verifyToken, authMiddleware.checkRole(['ADMINISTRADOR']), reportesController.getReporteGerencial); //gerenciales 1
router.get('/ingresos-mensuales', authMiddleware.verifyToken, authMiddleware.checkRole(['ADMINISTRADOR']), reportesController.getIngresosMensuales);//gerenciales 2
router.get('/distribucion-facultades', authMiddleware.verifyToken, authMiddleware.checkRole(['ADMINISTRADOR']), reportesController.getDistribucionFacultades);//gerenciales 3

module.exports = router;