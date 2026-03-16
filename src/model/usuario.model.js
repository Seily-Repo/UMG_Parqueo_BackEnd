const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Usuario = sequelize.define('Usuario', {
    US_Identificacion: {
        type: DataTypes.BIGINT,
        primaryKey: true
    },
    US_Nombre: {
        type: DataTypes.STRING
    },
    US_Apellido: {
        type: DataTypes.STRING
    },
    US_Email: {
        type: DataTypes.STRING
    },
    US_Telefono: {
        type: DataTypes.BIGINT
    },
    US_Pass: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'DP_USUARIO',
    timestamps: false
});

module.exports = Usuario;