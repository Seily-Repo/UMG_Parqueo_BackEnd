const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Pago = sequelize.define(
  "Pago",
  {
    PAG_PAGO: {
      type: DataTypes.NUMBER(15),
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      field: "PAG_PAGO",
    },
    LR_CARNE: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    PLN_PLAN: {
      type: DataTypes.NUMBER(10),
      allowNull: true,
    },
    FPG_FORMA_PAGO: {
      type: DataTypes.NUMBER(10),
      allowNull: false,
    },
    EMU_USUARIO_MULTA: {
      type: DataTypes.NUMBER(15),
      allowNull: true,
    },
    PAG_FECHA_PAGO: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    PAG_MONTO_TOTAL: {
      type: DataTypes.NUMBER(12, 2),
      allowNull: false,
    },
    PAG_ESTADO: {
      type: DataTypes.CHAR(1),
      allowNull: false,
    },
    PAG_FECHA_CREACION: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    STRIPE_PAYMENT_INTENT_ID: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    PAG_ESTADO_REGISTRO: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      field: "PAG_ESTADO_REGISTRO",
    },
  },
  {
    tableName: "CB_PAGO",
    timestamps: false,
    freezeTableName: true,
  },
);

module.exports = Pago;
