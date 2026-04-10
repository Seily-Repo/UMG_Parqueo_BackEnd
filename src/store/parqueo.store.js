const ParqueoStore = require('../store/parqueo.store');
const ResponseHandler = require('../utils/responseHandler');

// Obtener todos los parqueos
exports.getAllParqueos = async (req, res) => { 
    try {
        const parqueos = await ParqueoStore.getAll();
        return ResponseHandler.success(
            res,
            parqueos,
            'Parqueos obtenidos correctamente'
        );
    } catch (error) { 
        return ResponseHandler.error(
            res,
            'Error al obtener los parqueos',
            500,
            error.message
        );
    }
};

// Obtener parqueo por ID
exports.getParqueoById = async (req, res) => {
    try {
        const parqueo = await ParqueoStore.getById(req.params.id);

        if (!parqueo) {
            return ResponseHandler.error(
                res,
                'Parqueo no encontrado',
                404
            );
        }

        return ResponseHandler.success(
            res,
            parqueo,
            'Parqueo encontrado'
        );
    } catch (error) {
        return ResponseHandler.error(
            res,
            'Error al obtener el parqueo',
            500,
            error.message
        );
    }
};

// Crear parqueo
exports.createParqueo = async (req, res) => { 
    try {
        const nuevoParqueo = await ParqueoStore.create(req.body);

        return ResponseHandler.success(
            res,
            nuevoParqueo,
            'Parqueo creado exitosamente',
            201
        );
    } catch (error) { 
        return ResponseHandler.error(
            res,
            'Error al crear el parqueo',
            500,
            error.message
        );
    }
};

// Actualizar parqueo
exports.updateParqueo = async (req, res) => { 
    try {
        const rowsAffected = await ParqueoStore.update(req.params.id, req.body);

        if (rowsAffected[0] === 0) {
            return ResponseHandler.error(
                res,
                'Parqueo no encontrado para actualizar',
                404
            );
        }

        return ResponseHandler.success(
            res,
            null,
            'Parqueo actualizado exitosamente'
        );
    } catch (error) { 
        return ResponseHandler.error(
            res,
            'Error al actualizar el parqueo',
            500,
            error.message
        );
    }
};

// Eliminar parqueo
exports.deleteParqueo = async (req, res) => { 
    try {
        const rowsDeleted = await ParqueoStore.delete(req.params.id);

        if (rowsDeleted === 0) {
            return ResponseHandler.error(
                res,
                'Parqueo no encontrado para eliminar',
                404
            );
        }

        return ResponseHandler.success(
            res,
            null,
            'Parqueo eliminado exitosamente'
        );
    } catch (error) { 
        return ResponseHandler.error(
            res,
            'Error al eliminar el parqueo',
            500,
            error.message
        );
    }
};