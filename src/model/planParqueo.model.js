
// IMPORTAR CONEXIÓN A LA BASE DE DATOS
const getConnection = require("../db");



// CLASE PLAN PARQUEO
class PlanParqueo {

// METODO: CREAR PLAN PARQUEO INSERT
    static async crear(data) {
        const connection = await getConnection();

        const result = await connection.execute(
            `INSERT INTO PLAN_PARQUEO
            (PLA_ID_PLAN, PLA_DESCRIPCION, PLA_PRECIO, PLA_ESTADO)
            VALUES (:id, :descripcion, :precio, :estado)`,
            {
                id: data.PLA_ID_PLAN,
                descripcion: data.PLA_DESCRIPCION,
                precio: data.PLA_PRECIO,
                estado: data.PLA_ESTADO
            },
            { autoCommit: true }
        );

        await connection.close();
        return result;
    }

// METODO: OBTENER TODOS LOS PLANES SELECT
    static async obtenerTodos() {
        const connection = await getConnection();

        const result = await connection.execute(
            `SELECT * FROM PLAN_PARQUEO`
        );

        await connection.close();
        return result.rows;
    }
    
    


//  // METODO: ACTUALIZAR PLAN PARQUEO UPDATE
    static async actualizar(id, data) {
        const connection = await getConnection();

        const result = await connection.execute(
            `UPDATE PLAN_PARQUEO
            SET PLA_DESCRIPCION = :descripcion,
                PLA_PRECIO = :precio,
                PLA_ESTADO = :estado
            WHERE PLA_ID_PLAN = :id`,
            {
                descripcion: data.PLA_DESCRIPCION,
                precio: data.PLA_PRECIO,
                estado: data.PLA_ESTADO,
                id: id
            },
            { autoCommit: true }
        );

        await connection.close();
        return result;
    }

}