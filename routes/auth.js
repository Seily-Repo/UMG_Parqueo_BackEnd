const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { connectToDB } = require('../db');

// Ruta para Registrar un usuario nuevo
router.post('/registro', async (req, res) => {
    // Aquí recibiremos los datos del formulario de React
    const { carne, id_rol, nombres, apellidos, correo_electronico, password } = req.body;

    try {
        // 1. Aquí encriptaremos la contraseña
        // 2. Aquí haremos el INSERT a Oracle 21c
        
        res.status(201).json({ mensaje: "Usuario registrado simulado con éxito" });
    } catch (error) {
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// Ruta para el Login
router.post('/login', async (req, res) => {
    const { correo_electronico, password } = req.body;

    try {
        // 1. Aquí buscaremos el correo en Oracle
        // 2. Aquí compararemos la contraseña con bcrypt
        
        res.status(200).json({ mensaje: "Login simulado con éxito" });
    } catch (error) {
        res.status(500).json({ error: "Error en el servidor" });
    }
});

module.exports = router;