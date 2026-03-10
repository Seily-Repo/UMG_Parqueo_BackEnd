const express = require('express');
const router = express.Router();
const { testget } = require('../controllers/test.controllers');

/**
 * @openapi
 * /test:
 *   get:
 *     tags:
 *       - Test
 *     summary: Endpoint de prueba
 *     description: Retorna información de prueba
 *     responses:
 *       200:
 *         description: Respuesta exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Endpoint funcionando"
 */
router.get('/', testget);

module.exports = router;
