const oracledb = require('oracledb');
require('dotenv').config();

async function connectToDB() {
    try {
        const connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECTION_STRING
        });
        console.log("[OK] Conectado a la Base de Datos Oracle 21c");
        return connection;
    } catch (err) {
        console.error("[ERROR] Error conectando a Oracle:", err);
    }
}

module.exports = { connectToDB };