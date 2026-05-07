const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Facultad = sequelize.define('Facultad', {
  FAC_ID_FACULTAD: { type: DataTypes.INTEGER, primaryKey: true },
  FAC_NOMBRE_FACULTAD: { type: DataTypes.STRING(100), allowNull: false },
}, { tableName: 'LR_FACULTAD', schema: 'INFRA_DEV', timestamps: false, freezeTableName: true });

const Sede = sequelize.define('Sede', {
  SEC_ID_SEDE: { type: DataTypes.INTEGER, primaryKey: true },
  SEC_NOMBRE_SEDE: { type: DataTypes.STRING(100), allowNull: false },
}, { tableName: 'LR_SEDE_CAMPUS', schema: 'INFRA_DEV', timestamps: false, freezeTableName: true });

const Ciclo = sequelize.define('Ciclo', {
  CIC_ID_CICLO: { type: DataTypes.INTEGER, primaryKey: true },
  CIC_NOMBRE_CICLO: { type: DataTypes.STRING(50), allowNull: false },
}, { tableName: 'LR_CICLO_SEMESTRE', schema: 'INFRA_DEV', timestamps: false, freezeTableName: true });

const Seccion = sequelize.define('Seccion', {
  SEC_ID_SECCION: { type: DataTypes.INTEGER, primaryKey: true },
  SEC_NOMBRE_SECCION: { type: DataTypes.STRING(50), allowNull: false },
}, { tableName: 'LR_SECCION', schema: 'INFRA_DEV', timestamps: false, freezeTableName: true });

const Jornada = sequelize.define('Jornada', {
  JOR_ID_JORNADA: { type: DataTypes.INTEGER, primaryKey: true },
  JOR_NOMBRE_JORNADA: { type: DataTypes.STRING(50), allowNull: false },
  JOR_ACTIVO: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
}, { tableName: 'LR_JORNADA', schema: 'INFRA_DEV', timestamps: false, freezeTableName: true });

const Departamento = sequelize.define('Departamento', {
  DEP_ID_DEPARTAMENTO: { type: DataTypes.INTEGER, primaryKey: true },
  DEP_NOMBRE_DEPARTAMENTO: { type: DataTypes.STRING(100), allowNull: false },
}, { tableName: 'LR_DEPARTAMENTO', schema: 'INFRA_DEV', timestamps: false, freezeTableName: true });

const Municipio = sequelize.define('Municipio', {
  MUN_ID_MUNICIPIO: { type: DataTypes.INTEGER, primaryKey: true },
  MUN_NOMBRE_MUNICIPIO: { type: DataTypes.STRING(100), allowNull: false },
  DEP_ID_DEPARTAMENTO: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'LR_MUNICIPIO', schema: 'INFRA_DEV', timestamps: false, freezeTableName: true });

const PlanParqueo = sequelize.define('PlanParqueo', {
  PLN_PLAN: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  PLN_NOMBRE_PLAN: { type: DataTypes.STRING(50), allowNull: false },
  PLN_DESCRIPCION: { type: DataTypes.STRING(200), allowNull: true },
  PLN_PRECIO: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  PLN_ESTADO_REGISTRO: { type: DataTypes.CHAR(1), allowNull: false, defaultValue: 'A' },
}, { tableName: 'CB_PLAN_PARQUEO', schema: 'INFRA_DEV', timestamps: false, freezeTableName: true });

const Multa = sequelize.define('Multa', {
  MUL_MULTA: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  MUL_DESCRIPCION: { type: DataTypes.STRING(100), allowNull: false },
  MUL_MONTO_TOTAL: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  MUL_ESTADO_REGISTRO: { type: DataTypes.CHAR(1), allowNull: false, defaultValue: 'A' },
}, { tableName: 'CB_MULTA', schema: 'INFRA_DEV', timestamps: false, freezeTableName: true });

const UsuarioMulta = sequelize.define('UsuarioMulta', {
  EMU_USUARIO_MULTA: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  MUL_MULTA: { type: DataTypes.INTEGER, allowNull: false },
  VEH_ID_VEHICULO: { type: DataTypes.INTEGER, allowNull: false },
  EMU_ESTADO_MULTA: { type: DataTypes.CHAR(1), allowNull: false, defaultValue: 'P' },
}, { tableName: 'CB_USUARIO_MULTA', schema: 'INFRA_DEV', timestamps: false, freezeTableName: true });

const Pago = sequelize.define('Pago', {
  PAG_PAGO: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  LR_CARNE: { type: DataTypes.INTEGER, allowNull: false },
  PLN_PLAN: { type: DataTypes.INTEGER, allowNull: true },
  FPG_FORMA_PAGO: { type: DataTypes.INTEGER, allowNull: true },
  EMU_USUARIO_MULTA: { type: DataTypes.INTEGER, allowNull: true },
  PAG_FECHA_PAGO: { type: DataTypes.DATE, allowNull: true },
  PAG_MONTO_TOTAL: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  PAG_ESTADO: { type: DataTypes.CHAR(1), allowNull: false, defaultValue: 'P' },
  STRIPE_PAYMENT_INTENT_ID: { type: DataTypes.STRING(255), allowNull: true },
}, { tableName: 'CB_PAGO', schema: 'INFRA_DEV', timestamps: false, freezeTableName: true });

// Asociaciones
const Vehiculo = require('./vehiculo.model');
Pago.belongsTo(PlanParqueo, { foreignKey: 'PLN_PLAN', as: 'plan' });
Pago.belongsTo(UsuarioMulta, { foreignKey: 'EMU_USUARIO_MULTA', as: 'usuarioMulta' });
UsuarioMulta.belongsTo(Multa, { foreignKey: 'MUL_MULTA', as: 'multa' });
UsuarioMulta.belongsTo(Vehiculo, { foreignKey: 'VEH_ID_VEHICULO', as: 'vehiculo' });

module.exports = {
  Facultad, Sede, Ciclo, Seccion, Jornada,
  Departamento, Municipio, PlanParqueo,
  Multa, UsuarioMulta, Pago
};
