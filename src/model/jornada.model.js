const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Jornada = sequelize.define('Jornada', {
    JD_Jornada: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true 
    },
    JD_TipoJornada: {
        type: DataTypes.STRING(50)
    },
    JD_Descripcion: {
        type: DataTypes.STRING(100) 
    }
}, {
    tableName: 'DP_JORNADA', 
    schema: 'SYSTEM',       
    timestamps: false 
});

module.exports = Jornada;