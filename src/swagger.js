const swaggerJSDoc = require('swagger-jsdoc');
const { PORT } = require('./config/config');

const options = {
  definition: {
    openapi: '3.0.0',
    info: { 
      title: 'UMG Parqueos API - Sistema de Disponibilidad', 
      version: '1.1.0', 
      description: 'Backend para control de Disponibilidad, Tipos de Espacio y Asignaciones.\n\n**Nota sobre Tiempo Real:**\nEste servidor utiliza `socket.io`. El frontend puede conectarse a la raíz del servidor para escuchar actualizaciones del mapa en tiempo real.\n\n**Lógica de Capacidad:**\n1. Los tipos de espacio se crean basados en un porcentaje del parqueo.\n2. No se pueden crear más espacios físicos que los permitidos por el tipo.' 
    },
    servers: [
      { 
        url: `http://localhost:${PORT}`, 
        description: 'Servidor local' 
      },
    ],
    components: {
      schemas: {
        // Esquema de Respuesta General
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            status: { type: 'integer' },
            message: { type: 'string' },
            details: { type: 'object', nullable: true }
          }
        },
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
        TipoEspacio: {
          type: 'object',
          required: ['TES_NOMBRE', 'porcentaje', 'PQ_Parqueo'],
          properties: {
            TES_ESPACIO: { type: 'integer', readOnly: true },
            TES_NOMBRE: { type: 'string', example: 'Motos' },
            TES_CAPACIDAD_MAX_TIPO: { type: 'integer', readOnly: true, description: 'Calculado automáticamente (Parqueo Capacidad * Porcentaje)' },
            PQ_Parqueo: { type: 'integer', example: 1 },
            porcentaje: { type: 'integer', example: 20, description: 'Porcentaje de la capacidad total del parqueo' }
          }
        },
        Espacio: {
          type: 'object',
          required: ['ES_Numero', 'TES_ESPACIO'],
          properties: {
            ES_Espacio: { type: 'integer', readOnly: true },
            ES_Numero: { type: 'integer', example: 101 },
            ES_Estado: { type: 'integer', example: 0, description: '0: Disponible, 1: Ocupado' },
            TES_ESPACIO: { type: 'integer', example: 1, description: 'ID del Tipo de Espacio al que pertenece' }
          }
        },
  Asignacion: {
          type: 'object',
          required: ['carne_usuario', 'ES_Espacio', 'id_ciclo', 'id_jornada'],
          properties: {
            AS_Asignacion: { 
              type: 'integer', 
              readOnly: true, 
              description: 'ID autogenerado de la asignación' 
            },
            AS_FechaAsignacion: { 
              type: 'string', 
              format: 'date-time', 
              readOnly: true,
              description: 'Fecha y hora en que se realizó la asignación'
            },
            AS_Estado: { 
              type: 'integer', 
              readOnly: true, 
              example: 1, 
              description: '1: Activa, 0: Anulada' 
            },
            carne_usuario: { 
              type: 'string', 
              example: '2026-01-001', 
              description: 'Carné del estudiante o identificación del usuario'
            },
            ES_Espacio: { 
              type: 'integer', 
              example: 1, 
              description: 'ID único del espacio físico'
            },
            id_ciclo: { 
              type: 'integer', 
              example: 1, 
              description: 'ID del ciclo/semestre correspondiente'
            },
            id_jornada: { 
              type: 'integer', 
              example: 1, 
              description: 'ID de la jornada (Matutina, Nocturna, etc.)'
            }
          }
        }
      }
      
    },
    paths: {
      // --- PARQUEOS ---
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

      // --- TIPO ESPACIOS ---
      '/api/tipo-espacios': {
        get: { tags: ['Tipo Espacio'], summary: 'Lista todos los tipos de espacio', responses: { '200': { description: 'Ok' } } },
        post: {
          tags: ['Tipo Espacio'],
          summary: 'Crea un tipo de espacio (Calcula capacidad por porcentaje)',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/TipoEspacio' } } } },
          responses: { 
            '201': { description: 'Creado exitosamente' },
            '409': { description: 'La sumatoria de tipos excede la capacidad del parqueo' }
          }
        }
      },
      '/api/tipo-espacios/parqueo/{idParqueo}': {
        get: {
          tags: ['Tipo Espacio'],
          summary: 'Obtiene los tipos de espacio asociados a un parqueo',
          parameters: [{ name: 'idParqueo', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'Ok' } }
        }
      },

      // --- ESPACIOS ---
      '/api/espacios': {
        get: { tags: ['Espacios'], summary: 'Obtiene todos los espacios registrados', responses: { '200': { description: 'Ok' } } },
        post: {
          tags: ['Espacios'],
          summary: 'Crea un nuevo espacio (Valida tope del Tipo)',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Espacio' } } } },
          responses: { 
            '201': { description: 'Espacio creado' },
            '409': { description: 'Capacidad máxima del tipo alcanzada' }
          }
        }
      },
      '/api/espacios/tipo/{tipoId}': {
        get: {
          tags: ['Espacios'],
          summary: 'Obtiene espacios por su Tipo',
          parameters: [{ name: 'tipoId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'Ok' } }
        }
      },
      '/api/espacios/disponibilidad/libres': {
        get: {
          tags: ['Espacios'],
          summary: 'Consulta espacios libres por semestre y jornada',
          parameters: [
            { name: 'tipoEspacioId', in: 'query', required: true, schema: { type: 'integer' } },
            { name: 'semestre', in: 'query', required: true, schema: { type: 'integer' } },
            { name: 'jornada', in: 'query', required: true, schema: { type: 'integer' } }
          ],
          responses: { '200': { description: 'Lista de espacios disponibles' } }
        }
      },
      '/api/espacios/{id}': {
        put: {
          tags: ['Espacios'],
          summary: 'Actualiza un espacio por ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Espacio' } } } },
          responses: { '200': { description: 'Actualizado' } }
        },
        delete: {
          tags: ['Espacios'],
          summary: 'Elimina un espacio',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'Eliminado' } }
        }
      },

      // --- ASIGNACIONES ---
      '/api/asignacion': {
        get: { 
          tags: ['Asignaciones'], 
          summary: 'Obtiene todas las asignaciones',
          parameters: [
            { name: 'id_ciclo', in: 'query', schema: { type: 'integer' }, description: 'Filtrar por ciclo' },
            { name: 'estado', in: 'query', schema: { type: 'integer' }, description: 'Filtrar por estado (1 o 0)' }
          ],
          responses: { '200': { description: 'Ok', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } } 
        },
        post: {
          tags: ['Asignaciones'],
          summary: 'Asigna un espacio (Valida disponibilidad y estado del usuario)',
          requestBody: { 
            required: true, 
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Asignacion' } } } 
          },
          responses: { 
            '201': { description: '¡Asignación creada exitosamente!' },
            '404': { description: 'El espacio de parqueo indicado no existe.' },
            '409': { description: 'Conflicto: El usuario ya tiene asignación o el espacio está ocupado.' }
          }
        }
      },
      '/api/asignacion/anular/{id}': {
        put: {
          tags: ['Asignaciones'],
          summary: 'Anula una asignación (Libera el espacio en tiempo real)',
          parameters: [{ 
            name: 'id', 
            in: 'path', 
            required: true, 
            schema: { type: 'integer' },
            description: 'ID de la asignación (AS_Asignacion)'
          }],
          responses: { 
            '200': { description: 'Asignación anulada correctamente' },
            '404': { description: 'Asignación no encontrada' }
          }
        }
      }
    }
  },
  apis: [] 
};

module.exports = swaggerJSDoc(options);