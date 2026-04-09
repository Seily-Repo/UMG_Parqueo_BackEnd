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
        unique: 'compositeIndex', 
        field: 'ES_NUMERO'
    },
    ES_Estado: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0, // 0: Disponible, 1: Ocupado
        validate: {
            isIn: [[0, 1]]
        },
        field: 'ES_ESTADO'
    },
    TES_ESPACIO: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: 'compositeIndex',
        references: {
            model: TipoEspacio,
            key: 'TES_ESPACIO'
        },
        field: 'TES_ESPACIO'
    }
}, {
    tableName: 'DP_ESPACIO',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['ES_NUMERO', 'TES_ESPACIO'] // Unicidad por Tipo
        }
    ]
});

// Relación TipoEspacio -> Espacio
TipoEspacio.hasMany(Espacio, { foreignKey: 'TES_ESPACIO' });
Espacio.belongsTo(TipoEspacio, { foreignKey: 'TES_ESPACIO' });

module.exports = Espacio;