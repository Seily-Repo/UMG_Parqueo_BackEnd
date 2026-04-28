const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const UsuarioMoroso = sequelize.define('UsuarioMoroso', {
    MOR_USUARIO_MOROSO: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    LR_CARNE: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'LR_USUARIO',
            key: 'LR_CARNE',
        },
    },
    MOR_FECHA_AGREGADO: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    MOR_MOTIVO: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    MOR_MODIFICADO_POR: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    MOR_FECHA_MODIFICACION: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    MOR_ESTADO_MOROSO: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        defaultValue: 'A',
    },
    MOR_ESTADO_REGISTRO: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        defaultValue: 'A',
    },
}, {
    tableName: 'CB_USUARIO_MOROSO',
    timestamps: false,
});

module.exports = UsuarioMoroso;