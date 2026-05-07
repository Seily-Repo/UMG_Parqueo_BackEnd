const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Usuario = sequelize.define('Usuario', {
  LR_CARNE: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
  LR_NOMBRES: { type: DataTypes.STRING(100), allowNull: false },
  LR_APELLIDOS: { type: DataTypes.STRING(100), allowNull: false },
  LR_CORREO_INSTITUCIONAL: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  LR_CONTRASENA: { type: DataTypes.STRING(255), allowNull: false },
  LR_TELEFONO: { type: DataTypes.STRING(20), allowNull: true },
  MUN_ID_MUNICIPIO: { type: DataTypes.INTEGER, allowNull: true },
  LR_ZONA: { type: DataTypes.INTEGER, allowNull: true },
  LR_NOMENCLATURA: { type: DataTypes.STRING(100), allowNull: true },
  CAT_ID_CATEGORIA: { type: DataTypes.INTEGER, allowNull: true },
  SEC_ID_SEDE: { type: DataTypes.INTEGER, allowNull: true },
  FAC_ID_FACULTAD: { type: DataTypes.INTEGER, allowNull: true },
  CIC_ID_CICLO: { type: DataTypes.INTEGER, allowNull: true },
  SEC_ID_SECCION: { type: DataTypes.INTEGER, allowNull: true },
  JOR_ID_JORNADA: { type: DataTypes.INTEGER, allowNull: true },
  ROL_ID_ROL: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 2 },
  LR_ACTIVO: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  LR_REQUIERE_CAMBIO_PASS: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
}, {
  tableName: 'LR_USUARIO',
  schema: 'INFRA_DEV',
  timestamps: false,
  freezeTableName: true,
});

module.exports = Usuario;
