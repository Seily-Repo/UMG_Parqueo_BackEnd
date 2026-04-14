const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const TipoEspacio = require('./tipo_espacio.model');

const Espacio = sequelize.define('Espacio', {
    ES_Espacio: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        field: 'ES_ESPACIO'
    },
    ES_Numero: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'ES_NUMERO'
    },
    ES_Estado: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            isIn: [[0, 1]] // 1: Disponible, 0: Ocupado
        },
        field: 'ES_ESTADO'
    },
    TES_ESPACIO: {
        type: DataTypes.BIGINT,
        allowNull: true, // Crucial para que no se borre el registro
        references: {
            model: TipoEspacio,
            key: 'TES_ESPACIO'
        },
        field: 'TES_ESPACIO'
    }
}, {
    tableName: 'DP_ESPACIO',
    timestamps: false
});

TipoEspacio.hasMany(Espacio, { 
    foreignKey: 'TES_ESPACIO',
    onDelete: 'SET NULL', 
    hooks: true 
});

Espacio.belongsTo(TipoEspacio, { 
    foreignKey: 'TES_ESPACIO',
    onDelete: 'SET NULL'
});

module.exports = Espacio;