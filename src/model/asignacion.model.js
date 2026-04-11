const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Asignacion = sequelize.define('Asignacion', {
    AS_Asignacion: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    AS_FechaAsignacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    AS_Estado: {
        type: DataTypes.INTEGER,
        defaultValue: 1 
    },
    carne_usuario: { type: DataTypes.STRING },
    ES_Espacio: { type: DataTypes.BIGINT },
    id_ciclo: { type: DataTypes.INTEGER },
    id_jornada: { type: DataTypes.INTEGER }
}, {
    tableName: 'DP_ASIGNACION',
    freezeTableName: true,
    timestamps: false
});

module.exports = Asignacion;