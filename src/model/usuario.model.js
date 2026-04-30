const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Usuario = sequelize.define(
  "Usuario",
  {
    LR_CARNE: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    LR_NOMBRE_COMPLETO: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    LR_CORREO_INSTITUCIONAL: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    LR_ESTADO_REGISTRO: {
      type: DataTypes.CHAR(1),
      allowNull: false,
    },
  },
  {
    tableName: "LR_USUARIO",
    timestamps: false,
  },
);

module.exports = Usuario;
