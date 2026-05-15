const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Isla = sequelize.define('Isla', {
    IS_ISLA: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true 
    },
    PQ_PARQUEO: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'PQ_PARQUEO'
    },
    IS_NOMBRE: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'IS_NOMBRE'
    },
    IS_CAPACIDAD: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'IS_CAPACIDAD'
    },
    IS_DESCRIPCION: {
        type: DataTypes.STRING,
        allowNull: true, 
        field: 'IS_DESCRIPCION'
    },

    IS_ESTADO: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        field: 'IS_ESTADO'
    }
}, {
    tableName: 'DP_ISLAS',
    freezeTableName: true,
    timestamps: false
});

module.exports = Isla;