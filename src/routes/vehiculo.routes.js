const express = require('express');
const router = express.Router();
const vehiculoCtrl = require('../controllers/vehiculo.controller');

/**
 * @swagger
 * tags:
 *   name: Vehículos
 *   description: Gestión de vehículos de estudiantes
 */

/**
 * @swagger
 * /api/vehiculos/{carne}:
 *   get:
 *     tags: [Vehículos]
 *     summary: Obtiene vehículos activos de un estudiante
 *     parameters:
 *       - in: path
 *         name: carne
 *         required: true
 *         schema:
 *           type: string
 *         description: Carné del estudiante (con o sin guiones)
 *     responses:
 *       200:
 *         description: Lista de vehículos del estudiante
 */
router.get('/:carne', vehiculoCtrl.getByCarne);

/**
 * @swagger
 * /api/vehiculos:
 *   post:
 *     tags: [Vehículos]
 *     summary: Registra un nuevo vehículo
 *     description: Registra el vehículo sin crear pago. Retorna plan_id para que el frontend lo envíe a cobros-dev.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [carne_usuario, placa]
 *             properties:
 *               carne_usuario:
 *                 type: string
 *                 example: "0905-23-12345"
 *               tipo_vehiculo:
 *                 type: string
 *                 enum: [AUTOMOVIL, MOTOCICLETA, CAMIONETA, OTRO]
 *                 example: "AUTOMOVIL"
 *               placa:
 *                 type: string
 *                 example: "P-123ABC"
 *               marca:
 *                 type: string
 *               modelo:
 *                 type: string
 *               color:
 *                 type: string
 *               plan_id:
 *                 type: integer
 *                 description: ID del plan de parqueo seleccionado
 *     responses:
 *       200:
 *         description: Vehículo registrado. Retorna plan_id para cobros-dev.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 plan_id:
 *                   type: integer
 *       400:
 *         description: Placa duplicada o tipo de vehículo inválido
 */
router.post('/', vehiculoCtrl.registrar);

module.exports = router;
