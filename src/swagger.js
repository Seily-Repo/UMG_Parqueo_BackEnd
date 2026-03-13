const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: { 
        title: 'UMG Parqueos API', 
        version: '1.0.0', 
        description: 'Backend con IDs Automáticos y CRUD funcional' 
    },
    servers: [{ url: 'http://localhost:4000' }],
    paths: {
      // --- ASIGNACIÓN ---
      '/asignacion': {
        get: { summary: 'Listar todas las asignaciones', tags: ['Asignación'], responses: { 200: { description: 'OK' } } },
        post: {
          summary: 'Crear asignación',
          tags: ['Asignación'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    estado: { type: 'number', example: 1 },
                    usuarioId: { type: 'number' },
                    espacioId: { type: 'number' },
                    semestreId: { type: 'number' },
                    jornadaId: { type: 'number' }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Creado' } }
        }
      },
      '/asignacion/{id}': {
        get: {
          summary: 'Obtener asignación por ID',
          tags: ['Asignación'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'number' } }],
          responses: { 
            200: { description: 'OK' },
            404: { description: 'No encontrado' }
          }
        },
        put: {
          summary: 'Actualizar asignación',
          tags: ['Asignación'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'number' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    estado: { type: 'number' },
                    usuarioId: { type: 'number' },
                    espacioId: { type: 'number' },
                    semestreId: { type: 'number' },
                    jornadaId: { type: 'number' }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'Actualizado' } }
        },
        delete: {
          summary: 'Eliminar asignación',
          tags: ['Asignación'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'number' } }],
          responses: { 200: { description: 'Eliminado' } }
        }
      },
      // --- JORNADA ---
      '/jornada': {
        get: { summary: 'Listar jornadas', tags: ['Jornada'], responses: { 200: { description: 'OK' } } },
        post: {
          summary: 'Crear jornada',
          tags: ['Jornada'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    tipo: { type: 'string', example: 'MATUTINA' },
                    descripcion: { type: 'string', example: 'Lunes a Viernes' }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Creado' } }
        }
      },
      '/jornada/{id}': {
        get: {
          summary: 'Obtener jornada por ID',
          tags: ['Jornada'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'number' } }],
          responses: { 
            200: { description: 'OK' },
            404: { description: 'No encontrado' }
          }
        },
        put: {
          summary: 'Actualizar jornada',
          tags: ['Jornada'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'number' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    tipo: { type: 'string' },
                    descripcion: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'Actualizado' } }
        },
        delete: {
          summary: 'Eliminar jornada',
          tags: ['Jornada'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'number' } }],
          responses: { 200: { description: 'Eliminado' } }
        }
      }
    }
  },
  apis: []
};

module.exports = swaggerJSDoc(options);