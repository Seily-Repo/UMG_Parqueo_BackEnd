const { getConnection } = require('./test.store');
const oracledb = require('oracledb');

async function list() {
    let conn = await getConnection();
    try {
        const result = await conn.execute(`SELECT * FROM DP_ASIGNACION`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        return result.rows;
    } finally {
        if (conn) await conn.close();
    }
}

async function add(data) {
    let conn = await getConnection();
    try {
        const sql = `INSERT INTO DP_ASIGNACION (AS_Estado, US_Identificacion, ES_Espacio, SM_Semestre, JD_Jornada) 
                     VALUES (:estado, :usuarioId, :espacioId, :semestreId, :jornadaId)`;
        await conn.execute(sql, data, { autoCommit: true });
        return { message: "Asignación creada exitosamente", data };
    } finally {
        if (conn) await conn.close();
    }
}

async function update(id, data) {
    let conn = await getConnection();
    try {
        const sql = `UPDATE DP_ASIGNACION SET AS_Estado = :estado, US_Identificacion = :usuarioId, 
                     ES_Espacio = :espacioId, SM_Semestre = :semestreId, JD_Jornada = :jornadaId 
                     WHERE AS_Asignacion = :id`;
        await conn.execute(sql, { ...data, id }, { autoCommit: true });
        return { id, ...data };
    } finally {
        if (conn) await conn.close();
    }
}

async function remove(id) {
    let conn = await getConnection();
    try {
        await conn.execute(`DELETE FROM DP_ASIGNACION WHERE AS_Asignacion = :id`, [id], { autoCommit: true });
        return { deletedId: id };
    } finally {
        if (conn) await conn.close();
    }
}

async function getById(id) {
    let conn = await getConnection();
    try {
        // Asegúrate de que ID_ASIGNACION sea el nombre real en tu tabla
        const result = await conn.execute(
            `SELECT * FROM DP_ASIGNACION WHERE AS_ASIGNACION = :id`, 
            [id]
        );
        
        return result.rows[0]; // Retorna la fila encontrada
    } catch (err) {
        throw err;
    } finally {
        if (conn) await conn.close();
    }
}

module.exports = { list, add, update, remove, getById };