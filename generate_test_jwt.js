require('dotenv').config();
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;

const payloadAdmin = {
  carne: '00000000000',
  rol: 'ADMINISTRADOR'
};

const payloadUsuario = {
  carne: '51902317607',
  rol: 'USUARIO'
};

// Para generar los tokens de prueba, ejecutar en la terminal:
// node generate_test_jwt.js

// Generamos los tokens
const tokenAdmin = jwt.sign(payloadAdmin, secret, { expiresIn: '1h' });
const tokenUsuario = jwt.sign(payloadUsuario, secret, { expiresIn: '1h' });

console.log('======================================================');
console.log('TOKENS DE PRUEBA GENERADOS EXITOSAMENTE');
console.log('======================================================');
console.log('\n--- TOKEN DE ADMIN ---');
console.log(tokenAdmin);
console.log('\n------------------------------------------------------');
console.log('\n--- TOKEN DE USUARIO ---');
console.log(tokenUsuario);
console.log('\n======================================================');
