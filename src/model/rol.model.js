const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Rol = sequelize.define('Rol', {
  ROL_ID_ROL: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
  ROL_NOMBRE_ROL: { type: DataTypes.STRING(50), allowNull: false },
  ROL_ESTADO: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
}, {
  tableName: 'LR_ROL',
  schema: 'INFRA_DEV',
  timestamps: false,
  freezeTableName: true,
});

module.exports = Rol;
