const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PlanParqueo = sequelize.define('PlanParqueo', {

    PLA_ID_PLAN: {
        type: DataTypes.DECIMAL(10, 2),
        primaryKey: true,
        allowNull: false
    },

    PLA_DESCRIPCION: {
        type: DataTypes.STRING(50),
        allowNull: false
    },

    PLA_PRECIO: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },

    PLA_ESTADO: {
        type: DataTypes.CHAR(1),
        allowNull: false
    }

}, {
    tableName: 'PLAN_PARQUEO',
    timestamps: false
});

module.exports = PlanParqueo;