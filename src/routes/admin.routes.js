const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/admin.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Panel de administración (requiere JWT con rol Admin)
 */

/**
 * @swagger
 * /api/admin/usuarios:
 *   get:
 *     tags: [Admin]
 *     summary: Lista todos los usuarios del sistema
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios con rol y estado
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: No tiene permisos de administrador
 */
router.get('/usuarios', verifyToken, checkRole(['ADMINISTRADOR']), adminCtrl.getUsuarios);

/**
 * @swagger
 * /api/admin/usuarios/{carne}:
 *   put:
 *     tags: [Admin]
 *     summary: Actualiza datos de un usuario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: carne
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombres:
 *                 type: string
 *               apellidos:
 *                 type: string
 *               correo_institucional:
 *                 type: string
 *               telefono:
 *                 type: string
 *               id_rol:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Usuario actualizado
 */
router.put('/usuarios/:carne', verifyToken, checkRole(['ADMINISTRADOR']), adminCtrl.updateUsuario);

/**
 * @swagger
 * /api/admin/usuarios/{carne}/estado:
 *   put:
 *     tags: [Admin]
 *     summary: Activa o desactiva un usuario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: carne
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nuevoEstado:
 *                 type: integer
 *                 enum: [0, 1]
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.put('/usuarios/:carne/estado', verifyToken, checkRole(['ADMINISTRADOR']), adminCtrl.cambiarEstadoUsuario);

/**
 * @swagger
 * /api/admin/estadisticas:
 *   get:
 *     tags: [Admin]
 *     summary: Obtiene estadísticas generales (carros, motos, ingresos)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Objeto con carros, motos e ingresos totales
 */
router.get('/estadisticas', verifyToken, checkRole(['ADMINISTRADOR']), adminCtrl.getEstadisticas);

/**
 * @swagger
 * /api/admin/pagos:
 *   get:
 *     tags: [Admin]
 *     summary: Lista todos los pagos del sistema
 *     responses:
 *       200:
 *         description: Lista de pagos con usuario, concepto y estado
 */
router.get('/pagos', verifyToken, checkRole(['ADMINISTRADOR']), adminCtrl.getPagos);

/**
 * @swagger
 * /api/admin/pagos/{id}/aprobar:
 *   put:
 *     tags: [Admin]
 *     summary: Aprueba un pago pendiente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pago aprobado
 */
router.put('/pagos/:id/aprobar', verifyToken, checkRole(['ADMINISTRADOR']), adminCtrl.aprobarPago);

/**
 * @swagger
 * /api/admin/multas-catalogo:
 *   get:
 *     tags: [Admin]
 *     summary: Obtiene catálogo de multas disponibles
 *     responses:
 *       200:
 *         description: Lista de multas activas
 */
router.get('/multas-catalogo', verifyToken, checkRole(['ADMINISTRADOR']), adminCtrl.getMultasCatalogo);

/**
 * @swagger
 * /api/admin/multas:
 *   post:
 *     tags: [Admin]
 *     summary: Asigna una multa a un vehículo/usuario
 *     description: Crea registro en CB_USUARIO_MULTA. No crea pago — retorna datos para cobros-dev.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [carne, placa, id_multa]
 *             properties:
 *               carne:
 *                 type: string
 *                 example: "0905-23-12345"
 *               placa:
 *                 type: string
 *                 example: "P-123ABC"
 *               id_multa:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Multa asignada. Retorna EMU_USUARIO_MULTA y monto.
 *       404:
 *         description: Vehículo no encontrado para el carné
 */
router.post('/multas', verifyToken, checkRole(['ADMINISTRADOR']), adminCtrl.asignarMulta);

/**
 * @swagger
 * /api/admin/reportes:
 *   get:
 *     tags: [Admin]
 *     summary: Obtiene reportes generales (demografía, ingresos, morosos)
 *     responses:
 *       200:
 *         description: Objeto con demografía, ingresosPorPlan y morosos
 */
router.get('/reportes', verifyToken, checkRole(['ADMINISTRADOR']), adminCtrl.getReportes);

module.exports = router;
