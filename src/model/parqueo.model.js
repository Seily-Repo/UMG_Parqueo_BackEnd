const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Parqueo = sequelize.define('Parqueo', {
    PQ_Parqueo: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        field: 'PQ_PARQUEO'
    },

    PQ_Nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'PQ_NOMBRE',
        validate: {
            notEmpty: { msg: 'El nombre no puede estar vacío' }
        }
    },

    PQ_Direccion: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'PQ_DIRECCION',
        validate: {
            notEmpty: { msg: 'La dirección no puede estar vacía' }
        }
    },

    PQ_Capacidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'PQ_CAPACIDAD',
        validate: {
            isInt: { msg: 'La capacidad debe ser un número entero' },
            min: { args: [1], msg: 'La capacidad debe ser mayor a 0' }
        }
    },

    estado: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        field: 'PQ_ESTADO', // ✔ OK
        comment: '1=Activo, 0=Inactivo'
    }

}, {
    tableName: 'DP_PARQUEO',
    timestamps: false,

    // ✔ SOLO ACTIVOS POR DEFECTO
    defaultScope: {
        where: { estado: 1 }
    },

    scopes: {
        all: {
            where: {}
        },
        activos: {
            where: { estado: 1 }
        },
        inactivos: {
            where: { estado: 0 }
        }
    }
});


// ============================
// MÉTODOS CORREGIDOS
// ============================

// ✔ activos
Parqueo.findActivos = async () => {
    return await Parqueo.scope('activos').findAll();
};

// ✔ todos (INCLUYE eliminados)
Parqueo.findTodos = async () => {
    return await Parqueo.scope('all').findAll();
};

// ✔ por ID activo
Parqueo.findActivoById = async (id) => {
    return await Parqueo.findOne({
        where: { PQ_Parqueo: id }
    });
};

// ============================
// SOFT DELETE CORREGIDO
// ============================
Parqueo.softDelete = async (id) => {
    return await Parqueo.update(
        { estado: 0 },
        {
            where: {
                PQ_Parqueo: id,
                estado: 1 // ✔ evita doble update innecesario
            }
        }
    );
};

// ============================
// RESTORE CORREGIDO
// ============================
Parqueo.restore = async (id) => {
    const parqueo = await Parqueo.findOne({
        where: { PQ_Parqueo: id }
    });

    if (!parqueo) return false;

    parqueo.estado = 1;
    await parqueo.save();

    return true;
};

module.exports = Parqueo;