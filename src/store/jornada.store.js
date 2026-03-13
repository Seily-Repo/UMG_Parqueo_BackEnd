const { getConnection } = require('./test.store');
const oracledb = require('oracledb');

async function list() {
    let conn = await getConnection();
    try {
        const result = await conn.execute(`SELECT * FROM DP_JORNADA`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        return result.rows;
    } finally {
        if (conn) await conn.close();
    }
}

async function add(data) {
    let conn = await getConnection();
    try {
        const sql = `INSERT INTO DP_JORNADA (JD_TipoJornada, JD_Descripcion) VALUES (:tipo, :descripcion)`;
        await conn.execute(sql, data, { autoCommit: true });
        return { message: "Jornada creada exitosamente", data };
    } finally {
        if (conn) await conn.close();
    }
}

async function update(id, data) {
    let conn = await getConnection();
    try {
        const sql = `UPDATE DP_JORNADA SET JD_TipoJornada = :tipo, JD_Descripcion = :descripcion WHERE JD_Jornada = :id`;
        await conn.execute(sql, { ...data, id }, { autoCommit: true });
        return { id, ...data };
    } finally {
        if (conn) await conn.close();
    }
}

async function remove(id) {
    let conn = await getConnection();
    try {
        await conn.execute(`DELETE FROM DP_JORNADA WHERE JD_Jornada = :id`, [id], { autoCommit: true });
        return { deletedId: id };
    } finally {
        if (conn) await conn.close();
    }
}

async function getById(id) {
    let conn = await getConnection();
    try {
        // El :id es un placeholder que Oracle entiende
        const result = await conn.execute(
            `SELECT * FROM DP_JORNADA WHERE JD_JORNADA = :id`, 
            [id]
        );
        
        // Retornamos solo la primera fila (si existe)
        return result.rows[0]; 
    } catch (err) {
        throw err;
    } finally {
        if (conn) await conn.close();
    }
}

module.exports = { list, add, update, remove, getById};