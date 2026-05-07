const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Vehiculo = sequelize.define('Vehiculo', {
  VEH_ID_VEHICULO: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  LR_CARNE: { type: DataTypes.INTEGER, allowNull: false },
  VEH_TIPO_VEHICULO: { type: DataTypes.STRING(20), allowNull: false },
  VEH_PLACA: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  VEH_MARCA: { type: DataTypes.STRING(50), allowNull: true },
  VEH_MODELO: { type: DataTypes.STRING(50), allowNull: true },
  VEH_COLOR: { type: DataTypes.STRING(30), allowNull: true },
  VEH_ACTIVO: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
}, {
  tableName: 'LR_VEHICULO',
  schema: 'INFRA_DEV',
  timestamps: false,
  freezeTableName: true,
});

module.exports = Vehiculo;
