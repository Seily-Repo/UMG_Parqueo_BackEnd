const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Pago = sequelize.define('Pago', {
    id_pago: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false
    },
    id_estudiante: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    id_plan: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    fecha_pago: {
        type: DataTypes.DATE,
        allowNull: false
    },
    monto_pagado: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    referencia_banco: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    tarjeta_mask: {
        type: DataTypes.STRING(4),
        allowNull: true
    },
    id_multa: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    id_vehiculo_estudiante: {
        type: DataTypes.BIGINT,
        allowNull: true
    }
}, {
    tableName: 'PAR_PAGO',
    timestamps: false
});

});
