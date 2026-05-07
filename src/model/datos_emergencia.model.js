const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const DatosEmergencia = sequelize.define('DatosEmergencia', {
  DAE_ID_EMERGENCIA: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
  LR_CARNE: { type: DataTypes.INTEGER, allowNull: false },
  DAE_NOMBRE_CONTACTO: { type: DataTypes.STRING(100), allowNull: true },
  DAE_TELEFONO_CONTACTO: { type: DataTypes.STRING(20), allowNull: true },
}, {
  tableName: 'LR_DATOS_EMERGENCIA',
  schema: 'INFRA_DEV',
  timestamps: false,
  freezeTableName: true,
});

module.exports = DatosEmergencia;
