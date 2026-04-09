const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const EstudianteMulta = sequelize.define(
  "EstudianteMulta",
  {
    EMU_ESTUDIANTE_MULTA: {
      type: DataTypes.NUMBER(15),
      primaryKey: true,
      allowNull: false,
    },
    MUL_MULTA: {
      type: DataTypes.NUMBER(15),
      allowNull: false,
    },
    EST_CARNE: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    EMU_ESTADO_MULTA: {
      type: DataTypes.CHAR(1),
      allowNull: false,
    },
    EMU_CREADO_POR: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    EMU_FECHA_CREACION: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    EMU_MODIFICADO_POR: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    EMU_FECHA_MODIFICACION: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "PAR_ESTUDIANTE_MULTA",
    timestamps: false,
  },
);

module.exports = EstudianteMulta;
