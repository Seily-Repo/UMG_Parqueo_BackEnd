const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Multa = sequelize.define('Multa', {
    MUL_id_multa: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false
    },
    MUL_monto_total: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    MUL_monto_base: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    MUL_impuesto: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    MUL_descripcion: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    MUL_fecha: {
        type: DataTypes.DATE,
        allowNull: false
    },
    MUL_fecha_vencimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    MUL_creado_por: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    MUL_fecha_creacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    MUL_modificado_por: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    MUL_fecha_modificacion: {
        type: DataTypes.DATE,
        allowNull: true
    },
    MUL_direccion_ip: {
        type: DataTypes.STRING(50),
        allowNull: true
    }
}, {
    tableName: 'PAR_MULTA',
    timestamps: false
});

module.exports = Multa;