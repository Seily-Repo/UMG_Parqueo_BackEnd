const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const EstudianteMulta = sequelize.define('EstudianteMulta', {
    EMU_ID_EST_MULTA: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false
    },
    MUL_ID_MULTA: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    EST_ID_ESTUDIANTE: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    EMU_ESTADO_MULTA: {
        type: DataTypes.CHAR(1),
        allowNull: false
    },
    EMU_CREADO_POR: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    EMU_FECHA_CREACION: {
        type: DataTypes.DATE,
        allowNull: false
    },
    EMU_MODIFICADO_POR: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    EMU_FECHA_MODIFICACION: {
        type: DataTypes.DATE,
        allowNull: true
    },
    EMU_DIRECCION_IP: {
        type: DataTypes.STRING(50),
        allowNull: true
    }
}, {
    tableName: 'PAR_ESTUDIANTE_MULTA',
    timestamps: false
});

module.exports = EstudianteMulta;