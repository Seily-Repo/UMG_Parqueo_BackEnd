const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const EstudianteMoroso = sequelize.define('EstudianteMoroso', {
    MOR_BLACKLIST_LOG: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    EST_CARNE: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'PAR_ESTUDIANTE',
            key: 'EST_CARNE',
        },
    },
    MOR_FECHA_AGREGADO: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    MOR_MOTIVO: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    MOR_ESTADO: {
        type: DataTypes.STRING(1),
        allowNull: false,
    },
}, {
    tableName: 'PAR_ESTUDIANTE_MOROSO',
    timestamps: false,
});

module.exports = EstudianteMoroso;