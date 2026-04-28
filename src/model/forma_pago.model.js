const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const FormaPago = sequelize.define(
  "FormaPago",
  {
    FPG_FORMA_PAGO: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    FPG_NOMBRE_FORMA: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    FPG_ESTADO_REGISTRO: { 
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: 'A',
    },
  },
  {
    tableName: "CB_FORMA_PAGO",
    timestamps: false,
  }
);

module.exports = FormaPago;