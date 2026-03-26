const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const FormaPago = sequelize.define('FormaPago', {
    FPG_id_forma_pago: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    FPG_nombre_forma: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    FPG_estado: {
        type: DataTypes.CHAR(1),
        allowNull: false
    }
}, {
    tableName: 'PAR_FORMAS_PAGO',
    timestamps: false
});

module.exports = FormaPago;