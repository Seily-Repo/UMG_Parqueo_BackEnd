const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PlanParqueo = sequelize.define('PlanParqueo', {

    PLN_PLAN: {
        type: DataTypes.DECIMAL(10, 2),
        primaryKey: true,
        allowNull: false
    },

    PLN_NAME: {
        type: DataTypes.STRING(255),
        allowNull: false
    },

    PLN_DESCRIPCION: {
        type: DataTypes.STRING(50),
        allowNull: false
    },

    PLN_PRECIO: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },

    PLN_ESTADO: {
        type: DataTypes.CHAR(1),
        allowNull: false
    },

    PLN_MONEDA: {
        type: DataTypes.STRING(3),
        allowNull: false
    },


}, {
    tableName: 'PLAN_PARQUEO',
    timestamps: false
});

module.exports = PlanParqueo;