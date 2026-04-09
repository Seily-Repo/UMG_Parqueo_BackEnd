const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Estudiante = sequelize.define(
  "Estudiante",
  {
    EST_CARNE: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    EST_NOMBRE_COMPLETO: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    EST_EMAIL: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    EST_FECHA_CREACION: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "PAR_ESTUDIANTE",
    timestamps: false,
  },
);

module.exports = Estudiante;
