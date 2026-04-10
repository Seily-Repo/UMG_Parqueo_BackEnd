const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
    dialect: 'oracle',
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dialectOptions: {
        connectString: process.env.DB_CONNECTION_STRING
    },
    pool: {
        max: 10,
        min: 2,
        acquire: 30000,
        idle: 10000
    },
    logging: false,
    quoteIdentifiers: false
});

async function initialize() {
    try {
        await sequelize.authenticate();
        console.log('Conexión a Oracle DB iniciada exitosamente con Sequelize.');
    } catch (err) {
        console.error('Error al conectarse a la base de datos:', err.message);
        process.exit(1);
    }
}

async function close() {
    try {
        await sequelize.close();
        console.log('Conexiones cerradas de forma segura.');
    } catch (err) {
        console.error('Error al cerrar la conexión:', err.message);
    }
}

module.exports = { sequelize, initialize, close };