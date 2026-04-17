const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Parqueo = require('./parqueo.model');

const TipoEspacio = sequelize.define('TipoEspacio', {
    TES_ESPACIO: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        field: 'TES_ESPACIO'
    },
    TES_NOMBRE: {
        type: DataTypes.STRING(17),
        allowNull: false,
        field: 'TES_NOMBRE'
    },
    TES_CAPACIDAD_MAX_TIPO: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'TES_CAPACIDAD_MAX_TIPO'
    },
    TES_ESTADO: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1, // 1: Activo, 0: Inactivo
        field: 'TES_ESTADO'
    },
    PQ_Parqueo: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: Parqueo,
            key: 'PQ_Parqueo'
        },
        field: 'PQ_PARQUEO'
    }
}, {
    tableName: 'DP_TIPO_ESPACIO',
    timestamps: false
});

// Relación Parqueo -> TipoEspacio
Parqueo.hasMany(TipoEspacio, { foreignKey: 'PQ_Parqueo' });
TipoEspacio.belongsTo(Parqueo, { foreignKey: 'PQ_Parqueo' });

module.exports = TipoEspacio;