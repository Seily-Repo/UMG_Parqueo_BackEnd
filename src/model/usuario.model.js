const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Usuario = sequelize.define(
  "Usuario",
  {
    LR_CARNE: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    LR_NOMBRES: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    LR_APELLIDOS: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    LR_CORREO_INSTITUCIONAL: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "LR_USUARIO",
    timestamps: false,
  },
);

module.exports = Usuario;
