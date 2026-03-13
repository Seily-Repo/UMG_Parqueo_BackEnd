const express = require('express');
const router = express.Router();
const controller = require('../controllers/jornada.controller');
const response = require('../utils/response.utils');

router.get('/', (req, res) => {
    controller.getJornadas()
        .then(data => response.success(req, res, data, 200))
        .catch(err => response.error(req, res, 'Error', 500, err.message));
});

router.post('/', (req, res) => {
    controller.addJornada(req.body)
        .then(data => response.success(req, res, data, 201))
        .catch(err => response.error(req, res, 'Error', 400, err.message));
});

router.put('/:id', (req, res) => {
    controller.updateJornada(req.params.id, req.body)
        .then(data => response.success(req, res, data, 200))
        .catch(err => response.error(req, res, 'Error', 400, err.message));
});

router.delete('/:id', (req, res) => {
    controller.deleteJornada(req.params.id)
        .then(data => response.success(req, res, data, 200))
        .catch(err => response.error(req, res, 'Error', 400, err.message));
});

router.get('/:id', function (req, res) {
    // req.params.id captura lo que pongas en la URL (ej: /jornada/5)
    controller.getJornada(req.params.id)
        .then((data) => {
            if (!data) {
                response.error(req, res, 'No se encontró el registro', 404);
            } else {
                response.success(req, res, data, 200);
            }
        })
        .catch((e) => {
            response.error(req, res, 'Error interno', 500, e);
        });
});

module.exports = router;