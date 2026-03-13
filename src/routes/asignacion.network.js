const express = require('express');
const router = express.Router();
const controller = require('../controllers/asignacion.controller');
const response = require('../utils/response.utils');

router.get('/', (req, res) => {
    controller.getAsignaciones()
        .then(data => response.success(req, res, data, 200))
        .catch(err => response.error(req, res, 'Error al listar', 500, err.message));
});

router.post('/', (req, res) => {
    controller.addAsignacion(req.body)
        .then(data => response.success(req, res, data, 201))
        .catch(err => response.error(req, res, 'Error al crear', 400, err.message));
});

router.put('/:id', (req, res) => {
    controller.updateAsignacion(req.params.id, req.body)
        .then(data => response.success(req, res, data, 200))
        .catch(err => response.error(req, res, 'Error al actualizar', 400, err.message));
});

router.delete('/:id', (req, res) => {
    controller.deleteAsignacion(req.params.id)
        .then(data => response.success(req, res, data, 200))
        .catch(err => response.error(req, res, 'Error al eliminar', 400, err.message));
});

router.get('/:id', function (req, res) {
    controller.getAsignacion(req.params.id)
        .then((data) => {
            if (!data) {
                response.error(req, res, 'Asignación no encontrada', 404);
            } else {
                response.success(req, res, data, 200);
            }
        })
        .catch((e) => {
            response.error(req, res, 'Error al buscar asignación', 500, e);
        });
});

module.exports = router;