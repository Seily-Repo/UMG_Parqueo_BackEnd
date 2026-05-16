const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');
const rateLimit = require('express-rate-limit'); // [LOG-004] Importación de limite de peticiones

// [LOG-004] Configuración del limitador de tasa para protección contra Brute Force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Límite de 5 intentos por IP
  message: { error: 'Demasiados intentos de inicio de sesión, por favor intente de nuevo después de 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Registro, Login y gestión de contraseñas
 */

/**
 * @swagger
 * /api/auth/registro:
 *   post:
 *     tags: [Autenticación]
 *     summary: Registra un nuevo usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [carne, nombres, apellidos, correo_electronico, password]
 *             properties:
 *               carne:
 *                 type: string
 *                 example: "0905-23-12345"
 *               nombres:
 *                 type: string
 *                 example: "Juan Carlos"
 *               apellidos:
 *                 type: string
 *                 example: "Pérez López"
 *               correo_electronico:
 *                 type: string
 *                 example: "jperez@miumg.edu.gt"
 *               password:
 *                 type: string
 *                 example: "MiContraseña123"
 *               telefonos:
 *                 type: string
 *               id_municipio:
 *                 type: integer
 *               zona:
 *                 type: integer
 *               nomenclatura:
 *                 type: string
 *               id_sede:
 *                 type: integer
 *               id_facultad:
 *                 type: integer
 *               id_ciclo:
 *                 type: integer
 *               id_seccion:
 *                 type: integer
 *               id_jornada:
 *                 type: integer
 *               id_rol:
 *                 type: integer
 *               creadoPorAdmin:
 *                 type: boolean
 *               emergencia_nombre:
 *                 type: string
 *               emergencia_telefono:
 *                 type: string
 *     responses:
 *       200:
 *         description: Registro exitoso
 *       400:
 *         description: Carné o correo ya registrado
 *       500:
 *         description: Error del servidor
 */
router.post('/registro', authCtrl.registro);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Autenticación]
 *     summary: Inicia sesión y retorna JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               carne:
 *                 type: string
 *                 example: "0905-23-12345"
 *               correo_electronico:
 *                 type: string
 *                 example: "jperez@miumg.edu.gt"
 *               password:
 *                 type: string
 *                 example: "MiContraseña123"
 *     responses:
 *       200:
 *         description: Login exitoso con token JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     carne:
 *                       type: string
 *                     nombres:
 *                       type: string
 *                     apellidos:
 *                       type: string
 *                     rol:
 *                       type: integer
 *                     requiereCambioPass:
 *                       type: boolean
 *       401:
 *         description: Credenciales incorrectas
 */
// [LOG-004] Implementación del loginLimiter en la ruta de login (COMENTADO TEMPORALMENTE PARA PRUEBAS)
router.post('/login', /* loginLimiter, */ authCtrl.login);

/**
 * @swagger
 * /api/auth/cambiar-password:
 *   put:
 *     tags: [Autenticación]
 *     summary: Cambia la contraseña de un usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [carne, nuevaPassword]
 *             properties:
 *               carne:
 *                 type: string
 *               nuevaPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 */
router.put('/cambiar-password', authCtrl.cambiarPassword);

/**
 * @swagger
 * /api/auth/recuperar-password:
 *   post:
 *     tags: [Autenticación]
 *     summary: Verifica existencia del correo para enviar enlace de recuperación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [correo_electronico]
 *             properties:
 *               correo_electronico:
 *                 type: string
 *                 example: "jperez@miumg.edu.gt"
 *     responses:
 *       200:
 *         description: Solicitud procesada correctamente
 *       400:
 *         description: Correo inválido
 */
// [LOG-002] Preparación para Recuperación: Nuevo endpoint para recuperar password
router.post('/recuperar-password', authCtrl.recuperarPassword);

module.exports = router;
