const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const UsuarioMulta = sequelize.define(
  "UsuarioMulta",
  {
    EMU_USUARIO_MULTA: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    MUL_MULTA: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "CB_MULTA",
        key: "MUL_MULTA",
      },
    },
    VEH_ID_VEHICULO: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    EMU_ESTADO_MULTA: {
      type: DataTypes.CHAR(1),
      allowNull: false,
    },
    EMU_CREADO_POR: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'ADMINISTRADOR',
    },
    EMU_FECHA_CREACION: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    EMU_MODIFICADO_POR: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    EMU_FECHA_MODIFICACION: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    EMU_ESTADO_REGISTRO: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: 'A',
    },
  },
  {
    tableName: "CB_USUARIO_MULTA",
    timestamps: false,
  },
);

module.exports = UsuarioMulta;
