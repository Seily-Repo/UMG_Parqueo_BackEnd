const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Estudiante = sequelize.define('Estudiante', {
    EST_ID_ESTUDIANTE: {
        type: DataTypes.DECIMAL(10, 2),
        primaryKey: true,
        allowNull: false
    },
    EST_CARNE: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    EST_NOMBRE_COMPLETO: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
}, {
    tableName: 'ESTUDIANTE',
    timestamps: false
});

module.exports = Estudiante;