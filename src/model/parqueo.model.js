const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Parqueo = sequelize.define('Parqueo', {
    PQ_Parqueo: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },

    PQ_Nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El nombre no puede estar vacío'
            },
            is: {
                args: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                msg: 'El nombre solo debe contener letras y espacios'
            }
        }
    },

    PQ_Direccion: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'La dirección no puede estar vacía'
            },
            is: {
                args: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s,#.-]+$/,
                msg: 'La dirección contiene caracteres inválidos'
            }
        }
    },

    PQ_Capacidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'La capacidad es obligatoria'
            },
            isInt: {
                msg: 'La capacidad debe ser un número entero'
            },
            min: {
                args: [1],
                msg: 'La capacidad debe ser mayor a 0'
            }
        }
    }

}, {
    tableName: 'DP_PARQUEO',
    timestamps: false
});

module.exports = Parqueo;