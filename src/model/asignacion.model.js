const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Asignacion = sequelize.define('Asignacion', {
    AS_Asignacion: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    AS_FechaAsignacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'AS_FECHAASIGNACION'
    },
    AS_Estado: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        field: 'AS_ESTADO'
    },
    carne_usuario: { 
        type: DataTypes.INTEGER,
        field: 'LR_CARNE_USUARIO'
    },
    ES_Espacio: { 
        type: DataTypes.BIGINT,
        field: 'ES_ESPACIO'
    },
    id_ciclo: { 
        type: DataTypes.INTEGER,
        field: 'LR_ID_CICLO'
    },
    id_jornada: { 
        type: DataTypes.INTEGER,
        field: 'LR_ID_JORNADA' 
    },
    AS_Correlativo: { 
        type: DataTypes.STRING,
        field: 'AS_CORRELATIVO'
    }
}, {
    tableName: 'DP_ASIGNACION',
    freezeTableName: true,
    timestamps: false
});

module.exports = Asignacion;