const ParqueoStore = require('../store/parqueo.store');
const ResponseHandler = require('../utils/responseHandler');

// ======================
// VALIDACIÓN
// ======================
function validateParqueo(data) {
    const errors = [];

    const nombre = data.PQ_Nombre?.trim();
    const direccion = data.PQ_Direccion?.trim();

    if (!nombre || !/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s#.-]+$/.test(nombre)) {
        errors.push('Nombre inválido');
    }

    if (!direccion || !/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s,#.-]+$/.test(direccion)) {
        errors.push('Dirección inválida');
    }

    if (
        data.PQ_Capacidad === undefined ||
        !Number.isInteger(data.PQ_Capacidad) ||
        data.PQ_Capacidad <= 0
    ) {
        errors.push('Capacidad inválida');
    }

    return errors;
}

// ======================
// CREATE
// ======================
exports.createParqueo = async (req, res) => {
    try {
        const body = {
            PQ_Nombre: req.body.PQ_Nombre?.trim(),
            PQ_Direccion: req.body.PQ_Direccion?.trim(),
            PQ_Capacidad: req.body.PQ_Capacidad
        };

        const errors = validateParqueo(body);
        if (errors.length) {
            return ResponseHandler.error(res, 'Datos inválidos', 400, errors);
        }

        const exists = await ParqueoStore.existsByName(body.PQ_Nombre);

        if (exists) {
            return ResponseHandler.error(res, 'Ya existe un parqueo con ese nombre', 409);
        }

        const nuevo = await ParqueoStore.create(body);

        return ResponseHandler.success(res, nuevo, 'Creado correctamente', 201);

    } catch (error) {
        return ResponseHandler.error(res, 'Error al crear', 500, error.message);
    }
};

// ======================
// GET ALL (solo activos)
// ======================
exports.getAllParqueos = async (req, res) => {
    try {
        const data = await ParqueoStore.getAll(); // debe filtrar estado=1

        return ResponseHandler.success(res, data, 'OK');

    } catch (error) {
        return ResponseHandler.error(res, 'Error', 500);
    }
};

// ======================
// GET BY ID (solo activos)
// ======================
exports.getParqueoById = async (req, res) => {
    try {
        const data = await ParqueoStore.getById(req.params.id);

        if (!data) {
            return ResponseHandler.error(res, 'No encontrado o inactivo', 404);
        }

        return ResponseHandler.success(res, data, 'OK');

    } catch (error) {
        return ResponseHandler.error(res, 'Error', 500);
    }
};

// ======================
// UPDATE
// ======================
exports.updateParqueo = async (req, res) => {
    try {
        const body = {
            PQ_Nombre: req.body.PQ_Nombre?.trim(),
            PQ_Direccion: req.body.PQ_Direccion?.trim(),
            PQ_Capacidad: req.body.PQ_Capacidad
        };

        const rows = await ParqueoStore.update(req.params.id, body);

        if (!rows || rows[0] === 0) {
            return ResponseHandler.error(res, 'No encontrado', 404);
        }

        return ResponseHandler.success(res, null, 'Actualizado');

    } catch (error) {
        return ResponseHandler.error(res, 'Error', 500);
    }
};

// ======================
// DELETE LÓGICO
// ======================
exports.deleteParqueo = async (req, res) => {
    try {
        const result = await ParqueoStore.delete(req.params.id);

        if (!result) {
            return ResponseHandler.error(res, 'No encontrado o ya eliminado', 404);
        }

        return ResponseHandler.success(res, null, 'Eliminado lógicamente');

    } catch (error) {
        return ResponseHandler.error(res, 'Error', 500);
    }
};

// ======================
// RESTORE (REACTIVAR)
// ======================
exports.restoreParqueo = async (req, res) => {
    try {
        const result = await ParqueoStore.restore(req.params.id);

        if (!result) {
            return ResponseHandler.error(res, 'No se pudo restaurar (no existe o ya está activo)', 404);
        }

        return ResponseHandler.success(res, null, 'Parqueo restaurado');

    } catch (error) {
        return ResponseHandler.error(res, 'Error', 500);
    }
};
// ======================
// ver inactivos (solo admin)
// ======================
exports.getAllParqueosAdmin = async (req, res) => {
    try {
        const data = await ParqueoStore.getAllWithDeleted();
        return ResponseHandler.success(res, data, 'OK (incluye eliminados)');
    } catch (error) {
        return ResponseHandler.error(res, 'Error', 500);
    }
};

exports.restoreParqueo = async (req, res) => {
    try {
        const ok = await ParqueoStore.restore(req.params.id);

        if (!ok) {
            return ResponseHandler.error(res, 'No se pudo restaurar o ya está activo', 404);
        }

        return ResponseHandler.success(res, null, 'Parqueo restaurado');

    } catch (error) {
        return ResponseHandler.error(res, 'Error', 500);
    }
};