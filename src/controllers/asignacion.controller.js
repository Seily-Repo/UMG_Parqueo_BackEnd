const store = require('../store/asignacion.store');

async function getAsignaciones() {
    return await store.list();
}

async function addAsignacion(body) {
    if (!body.usuarioId || !body.espacioId || !body.jornadaId) throw new Error('Faltan IDs de referencia');
    const data = {
        estado: body.estado || 1,
        usuarioId: body.usuarioId,
        espacioId: body.espacioId,
        semestreId: body.semestreId || null,
        jornadaId: body.jornadaId
    };
    return await store.add(data);
}

async function updateAsignacion(id, body) {
    return await store.update(id, body);
}

async function deleteAsignacion(id) {
    return await store.remove(id);
}


async function getAsignacion(id) {
    if (!id) throw new Error('El ID es necesario');
    return await store.getById(id);
}

module.exports = { getAsignaciones, addAsignacion, updateAsignacion, deleteAsignacion, getAsignacion };