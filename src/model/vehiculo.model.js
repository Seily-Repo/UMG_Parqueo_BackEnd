const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Vehiculo = sequelize.define('Vehiculo', {
    VH_Vehiculo: {
        type: DataTypes.BIGINT,
        primaryKey: true
    },
    VH_Placa: {
        type: DataTypes.STRING
    },
    VH_Marca: {
        type: DataTypes.STRING
    },
    VH_Modelo: {
        type: DataTypes.STRING
    },
    US_Identificacion: {
        type: DataTypes.BIGINT
    }
}, {
    tableName: 'DP_VEHICULO',
    timestamps: false
});

module.exports = Vehiculo;