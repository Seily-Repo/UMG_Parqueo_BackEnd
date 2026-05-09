const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Parqueo UMG - API REST',
      version: '1.0.0',
      description: 'API para el Sistema de Control de Parqueo UMG. Gestiona usuarios, vehículos, catálogos, multas y administración.',
    },
    servers: [
      { url: '/', description: 'Servidor de Pruebas (Nginx)' },
      { url: 'http://localhost:3001', description: 'Servidor Local (Desarrollo)' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido del endpoint /api/auth/login'
        }
      }
    }
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
