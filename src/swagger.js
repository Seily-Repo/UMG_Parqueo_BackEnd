const swaggerJSDoc = require('swagger-jsdoc');
const { PORT } = require('./config/config');
const options = {
  definition: {
    openapi: '3.0.0',
    info: { 
      title: 'UMG Parqueos API - Módulo de Asignaciones', 
      version: '1.0.0', 
      description: 'Backend para control de Disponibilidad y Asignación de Parqueos.\n\n**Nota sobre Tiempo Real:**\nEste servidor utiliza `socket.io`. El frontend puede conectarse a la raíz del servidor para escuchar actualizaciones del mapa en tiempo real.' 
    },
    servers: [
      { 
        url: `http://localhost:${PORT}`, 
        description: 'Servidor local' 
      },
    ],
    components: {
      schemas: {
        Parqueo: {
          type: 'object',
          required: ['PQ_Nombre', 'PQ_Direccion', 'PQ_Capacidad'],
          properties: {
            PQ_Parqueo: { type: 'integer', readOnly: true },
            PQ_Nombre: { type: 'string', example: 'Parqueo Central' },
            PQ_Direccion: { type: 'string', example: 'Campus Central UMG' },
            PQ_Capacidad: { type: 'integer', example: 150 }
          }
        },
        Espacio: {
          type: 'object',
          required: ['ES_Numero', 'ES_Estado', 'PQ_Parqueo'],
          properties: {
            ES_Espacio: { type: 'integer', readOnly: true },
            ES_Numero: { type: 'integer', example: 101 },
            ES_Estado: { type: 'integer', example: 1 },
            PQ_Parqueo: { type: 'integer', example: 1 }
          }
        },
        Asignacion: {
          type: 'object',
          required: ['US_Identificacion', 'ES_Espacio', 'SM_Semestre', 'JD_Jornada'],
          properties: {
            AS_Asignacion: { type: 'integer', readOnly: true },
            AS_FechaAsignacion: { type: 'string', format: 'date-time', readOnly: true },
            AS_Estado: { type: 'integer', readOnly: true, example: 1 },
            US_Identificacion: { type: 'integer', example: 1 },
            ES_Espacio: { type: 'integer', example: 1 },
            SM_Semestre: { type: 'integer', example: 1 },
            JD_Jornada: { type: 'integer', example: 1 }
          }
        }
      }
    },
    paths: {
      '/api/parqueos': {
        get: { tags: ['Parqueos'], summary: 'Obtiene todos los parqueos', responses: { '200': { description: 'Ok' } } },
        post: {
          tags: ['Parqueos'],
          summary: 'Crea un parqueo',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Parqueo' } } } },
          responses: { '201': { description: 'Creado' } }
        }
      },
      '/api/parqueos/{id}': {
        get: { tags: ['Parqueos'], summary: 'Obtiene un parqueo por ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Ok' } } },
        delete: { tags: ['Parqueos'], summary: 'Elimina un parqueo', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Eliminado' } } }
      },

      '/api/espacios': {
        get: { 
          tags: ['Espacios'], 
          summary: 'Obtiene todos los espacios registrados', 
          responses: { '200': { description: 'Lista de espacios obtenida' } } 
        },
        post: {
          tags: ['Espacios'],
          summary: 'Crea un nuevo espacio',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Espacio' } } } },
          responses: { '201': { description: 'Espacio creado' } }
        }
      },
      '/api/espacios/parqueo/{parqueoId}': {
        get: {
          tags: ['Espacios'],
          summary: 'Obtiene los espacios asociados a un parqueo específico',
          parameters: [{ name: 'parqueoId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'Lista de espacios del parqueo' } }
        }
      },
      '/api/espacios/{id}': {
        put: {
          tags: ['Espacios'],
          summary: 'Actualiza un espacio por ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Espacio' } } } },
          responses: { '200': { description: 'Espacio actualizado' } }
        },
        delete: {
          tags: ['Espacios'],
          summary: 'Elimina un espacio por ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'Espacio eliminado' } }
        }
      },

      '/api/asignacion': {
        get: { tags: ['Asignaciones'], summary: 'Obtiene todas las asignaciones', responses: { '200': { description: 'Ok' } } },
        post: {
          tags: ['Asignaciones'],
          summary: 'Asigna un espacio (Valida disponibilidad)',
          description: 'Si la asignación es exitosa, el servidor emite un evento de Socket.io llamado `espacioOcupado`.',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Asignacion' } } } },
          responses: { 
            '201': { description: 'Asignación exitosa' },
            '409': { description: 'Espacio ocupado' }
          }
        }
      },
      '/api/asignacion/anular/{id}': {
        put: {
          tags: ['Asignaciones'],
          summary: 'Anula una asignación (Cambia estado a 0)',
          description: 'Al anular, el servidor emite un evento de Socket.io llamado `espacioLiberado`.',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'Anulado correctamente' } }
        }
      }
    }
  },
  apis: [] 
};

module.exports = swaggerJSDoc(options);