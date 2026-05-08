const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Multa = sequelize.define(
  "Multa",
  {
    MUL_MULTA: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    MUL_MONTO_TOTAL: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    MUL_DESCRIPCION: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    MUL_DIAS_VENCIMIENTO: { 
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    MUL_CREADOR_POR: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'ADMIN',
      field: 'MUL_CREADOR_POR',
    },
    MUL_FECHA_CREACION: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    MUL_MODIFICADO_POR: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    MUL_FECHA_MODIFICACION: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    MUL_ESTADO_REGISTRO: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: 'A',
    },
  },
  {
    tableName: "CB_MULTA",
    timestamps: false,
  }
);

module.exports = Multa;