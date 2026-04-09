const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Pago = sequelize.define(
  "Pago",
  {
    PAG_PAGO: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
    },
    EST_CARNE: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    PLN_PLAN: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    FPG_FORMA_PAGO: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    MUL_MULTA: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    PAG_FECHA_PAGO: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    PAG_MONTO_TOTAL: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    PAG_ESTADO: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    PAG_FECHA_CREACION: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    STRIPE_PAYMENT_INTENT_ID: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: "PAR_PAGO",
    timestamps: false,
  },
);

module.exports = Pago;
