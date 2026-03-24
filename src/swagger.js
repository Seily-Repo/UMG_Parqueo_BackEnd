const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: { 
      title: 'UMG Sistema de Cobros API', 
      version: '1.0.0', 
      description: 'API REST para gestión de cobros a estudiantes' 
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Servidor local' },
    ],

    components: {
      schemas: {

        Estudiante: {
          type: 'object',
          required: ['EST_ID_ESTUDIANTE', 'EST_CARNE', 'EST_NOMBRE_COMPLETO'],
          properties: {
            EST_ID_ESTUDIANTE: { 
              type: 'integer',
              description: 'ID único del estudiante'
            },
            EST_CARNE: { 
              type: 'string',
              description: 'Carné del estudiante (único)'
            },
            EST_NOMBRE_COMPLETO: { 
              type: 'string',
              description: 'Nombre completo del estudiante'
            }
          },
          example: {
            EST_ID_ESTUDIANTE: 1001,
            EST_CARNE: 'UMG202401001',
            EST_NOMBRE_COMPLETO: 'Juan Pérez García'
          }
        }

      }
    },

    paths: {

      '/api/estudiantes': {
        get: { 
          tags: ['Estudiantes'], 
          summary: 'Obtiene todos los estudiantes',
          responses: {
            '200': {
              description: 'Lista de estudiantes obtenida correctamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Estudiante' }
                  }
                }
              }
            },
            '500': { description: 'Error al obtener los estudiantes' }
          }
        },
        post: {
          tags: ['Estudiantes'],
          summary: 'Crea un nuevo estudiante',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Estudiante' }
              }
            }
          },
          responses: {
            '201': { description: 'Estudiante creado exitosamente' },
            '400': { description: 'La carné del estudiante ya existe' },
            '500': { description: 'Error al crear el estudiante' }
          }
        }
      },

      '/api/estudiantes/{id}': {
        get: {
          tags: ['Estudiantes'],
          summary: 'Obtiene un estudiante por ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'ID del estudiante',
              schema: { type: 'integer' }
            }
          ],
          responses: {
            '200': {
              description: 'Estudiante obtenido correctamente',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Estudiante' }
                }
              }
            },
            '404': { description: 'Estudiante no encontrado' },
            '500': { description: 'Error al obtener el estudiante' }
          }
        },
        put: {
          tags: ['Estudiantes'],
          summary: 'Actualiza un estudiante',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'ID del estudiante',
              schema: { type: 'integer' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Estudiante' }
              }
            }
          },
          responses: {
            '200': { description: 'Estudiante actualizado exitosamente' },
            '400': { description: 'La carné del estudiante ya existe' },
            '404': { description: 'Estudiante no encontrado para actualizar' },
            '500': { description: 'Error al actualizar el estudiante' }
          }
        },
        delete: {
          tags: ['Estudiantes'],
          summary: 'Elimina un estudiante',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'ID del estudiante',
              schema: { type: 'integer' }
            }
          ],
          responses: {
            '200': { description: 'Estudiante eliminado exitosamente' },
            '404': { description: 'Estudiante no encontrado para eliminar' },
            '500': { description: 'Error al eliminar el estudiante' }
          }
        }
      },

      '/api/estudiantes/carne/{carne}': {
        get: {
          tags: ['Estudiantes'],
          summary: 'Obtiene un estudiante por carné',
          parameters: [
            {
              name: 'carne',
              in: 'path',
              required: true,
              description: 'Carné del estudiante',
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': {
              description: 'Estudiante obtenido correctamente',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Estudiante' }
                }
              }
            },
            '404': { description: 'Estudiante no encontrado por carné' },
            '500': { description: 'Error al buscar el estudiante' }
          }
        }
      }

    }

  },

  apis: []
};

  const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;