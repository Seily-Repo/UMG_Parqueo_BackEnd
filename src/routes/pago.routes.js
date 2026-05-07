const express = require('express');
const router = express.Router();
const pagoCtrl = require('../controllers/pago.controller');

/**
 * @swagger
 * tags:
 *   name: Pagos (Estudiante)
 *   description: Consulta de pagos pendientes del estudiante
 */

/**
 * @swagger
 * /api/pagos/lista-pendiente/{carne}:
 *   get:
 *     tags: [Pagos (Estudiante)]
 *     summary: Obtiene pagos pendientes de un estudiante
 *     parameters:
 *       - in: path
 *         name: carne
 *         required: true
 *         schema:
 *           type: string
 *         description: Carné del estudiante
 *     responses:
 *       200:
 *         description: Lista de pagos pendientes con descripción, monto y tipo
 */
router.get('/lista-pendiente/:carne', pagoCtrl.getListaPendientes);

module.exports = router;
