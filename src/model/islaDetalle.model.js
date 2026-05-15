const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const IslaDetalle = sequelize.define('IslaDetalle', {
    ID_DETALLE: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    IS_ISLA: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'IS_ISLA'
    },
    ES_ESPACIO: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'ES_ESPACIO'
    }
}, {
    tableName: 'DP_ISLA_DETALLE',
    freezeTableName: true,
    timestamps: false
});

module.exports = IslaDetalle;