const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'UMG Parqueos - Backend API',
      version: '1.0.0',
      description: 'Acá podras encontrar todos los endpoints necesarios para interactuar con el backend de UMG Parqueos.',
    },
    servers: [
      { url: 'http://localhost:4000', description: 'Servidor local' },
      // Si tu app corre en otro host en producción cambia aquí o usa variable de entorno
    ],
  },
  // Archivos donde buscar JSDoc comments con @swagger (usa rutas relativas)
  apis: [
    path.join(__dirname, '/routes/*.js')
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
