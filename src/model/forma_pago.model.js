const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const FormaPago = sequelize.define(
  "FormaPago",
  {
    FPG_FORMA_PAGO: {
      type: DataTypes.INTEGER(10),
      primaryKey: true,
      allowNull: false,
    },
    FPG_NOMBRE_FORMA: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    FPG_ESTADO: {
      type: DataTypes.STRING(1),
      allowNull: false,
    },
  },
  {
    tableName: "PAR_FORMAS_PAGO",
    timestamps: false,
  },
);

module.exports = FormaPago;
