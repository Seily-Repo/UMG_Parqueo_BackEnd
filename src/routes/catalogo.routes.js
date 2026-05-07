const express = require('express');
const router = express.Router();
const catalogoCtrl = require('../controllers/catalogo.controller');

/**
 * @swagger
 * tags:
 *   name: Catálogos
 *   description: Endpoints de catálogos del sistema (facultades, sedes, ciclos, etc.)
 */

/**
 * @swagger
 * /api/facultades:
 *   get:
 *     tags: [Catálogos]
 *     summary: Obtiene todas las facultades
 *     responses:
 *       200:
 *         description: Lista de facultades
 *       500:
 *         description: Error interno
 */
router.get('/facultades', catalogoCtrl.getFacultades);

/**
 * @swagger
 * /api/sedes:
 *   get:
 *     tags: [Catálogos]
 *     summary: Obtiene todas las sedes/campus
 *     responses:
 *       200:
 *         description: Lista de sedes
 */
router.get('/sedes', catalogoCtrl.getSedes);

/**
 * @swagger
 * /api/ciclos:
 *   get:
 *     tags: [Catálogos]
 *     summary: Obtiene todos los ciclos/semestres
 *     responses:
 *       200:
 *         description: Lista de ciclos
 */
router.get('/ciclos', catalogoCtrl.getCiclos);

/**
 * @swagger
 * /api/secciones:
 *   get:
 *     tags: [Catálogos]
 *     summary: Obtiene todas las secciones
 *     responses:
 *       200:
 *         description: Lista de secciones
 */
router.get('/secciones', catalogoCtrl.getSecciones);

/**
 * @swagger
 * /api/jornadas:
 *   get:
 *     tags: [Catálogos]
 *     summary: Obtiene las jornadas activas
 *     responses:
 *       200:
 *         description: Lista de jornadas
 */
router.get('/jornadas', catalogoCtrl.getJornadas);

/**
 * @swagger
 * /api/departamentos:
 *   get:
 *     tags: [Catálogos]
 *     summary: Obtiene todos los departamentos
 *     responses:
 *       200:
 *         description: Lista de departamentos
 */
router.get('/departamentos', catalogoCtrl.getDepartamentos);

/**
 * @swagger
 * /api/planes:
 *   get:
 *     tags: [Catálogos]
 *     summary: Obtiene los planes de parqueo activos
 *     responses:
 *       200:
 *         description: Lista de planes con precio
 */
router.get('/planes', catalogoCtrl.getPlanes);

/**
 * @swagger
 * /api/roles:
 *   get:
 *     tags: [Catálogos]
 *     summary: Obtiene los roles del sistema
 *     responses:
 *       200:
 *         description: Lista de roles
 */
router.get('/roles', catalogoCtrl.getRoles);

/**
 * @swagger
 * /api/municipios/{id_depto}:
 *   get:
 *     tags: [Catálogos]
 *     summary: Obtiene municipios por departamento
 *     parameters:
 *       - in: path
 *         name: id_depto
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del departamento
 *     responses:
 *       200:
 *         description: Lista de municipios del departamento
 */
router.get('/municipios/:id_depto', catalogoCtrl.getMunicipios);

module.exports = router;
