const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: { 
      title: 'UMG Parqueos API', 
      version: '1.0.0', 
      description: 'Backend para control de Disponibilidad de Parqueos.' 
    },
    servers: [
      { 
        url: 'http://localhost:4000', 
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
        Jornada: {
          type: 'object',
          required: ['JD_TipoJornada', 'JD_Descripcion'],
          properties: {
            JD_Jornada: { type: 'integer', readOnly: true },
            JD_TipoJornada: { type: 'string', example: 'Matutina' },
            JD_Descripcion: { type: 'string', example: 'Lunes a Viernes 07:00 - 12:00' }
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
        Semestre: {
          type: 'object',
          required: ['SM_ANO', 'SM_Periodo'],
          properties: {
            SM_Semestre: { type: 'integer', readOnly: true },
            SM_ANO: { type: 'integer', example: 2026 },
            SM_Periodo: { type: 'integer', example: 1 }
          }
        },
        Usuario: {
          type: 'object',
          required: ['US_Nombre', 'US_Apellido', 'US_Email', 'US_Pass'],
          properties: {
            US_Identificacion: { type: 'integer', readOnly: true },
            US_Nombre: { type: 'string', example: 'Juan' },
            US_Apellido: { type: 'string', example: 'Pérez' },
            US_Email: { type: 'string', example: 'jperez@miumg.edu.gt' },
            US_Telefono: { type: 'integer', example: 55551234 },
            US_Pass: { type: 'string', example: 'Password123' }
          }
        },
        Vehiculo: {
          type: 'object',
          required: ['VH_Placa', 'VH_Marca', 'VH_Modelo', 'US_Identificacion'],
          properties: {
            VH_Vehiculo: { type: 'integer', readOnly: true },
            VH_Placa: { type: 'string', example: 'P-123ABC' },
            VH_Marca: { type: 'string', example: 'Toyota' },
            VH_Modelo: { type: 'string', example: 'Corolla' },
            US_Identificacion: { type: 'integer', example: 1 }
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
      '/api/jornadas': {
        get: { tags: ['Jornadas'], summary: 'Obtiene todas las jornadas', responses: { '200': { description: 'Ok' } } },
        post: {
          tags: ['Jornadas'],
          summary: 'Crea una jornada',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Jornada' } } } },
          responses: { '201': { description: 'Creado' } }
        }
      },
      '/api/jornadas/{id}': {
        get: { tags: ['Jornadas'], summary: 'Obtiene una jornada por ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Ok' } } },
        delete: { tags: ['Jornadas'], summary: 'Elimina una jornada', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Eliminado' } } }
      },
      '/api/espacios': {
        get: { tags: ['Espacios'], summary: 'Obtiene los espacios', responses: { '200': { description: 'Ok' } } },
        post: {
          tags: ['Espacios'],
          summary: 'Crea un espacio',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Espacio' } } } },
          responses: { '201': { description: 'Creado' } }
        }
      },
      '/api/semestres': {
        get: { tags: ['Semestres'], summary: 'Obtiene semestres', responses: { '200': { description: 'Ok' } } },
        post: {
          tags: ['Semestres'],
          summary: 'Crea un semestre',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Semestre' } } } },
          responses: { '201': { description: 'Creado' } }
        }
      },
      '/api/semestres/{id}': {
        get: { tags: ['Semestres'], summary: 'Obtiene un semestre por ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Ok' } } },
        delete: { tags: ['Semestres'], summary: 'Elimina un semestre', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Eliminado' } } }
      },
      '/api/usuarios': {
        get: { tags: ['Usuarios'], summary: 'Obtiene usuarios', responses: { '200': { description: 'Ok' } } },
        post: {
          tags: ['Usuarios'],
          summary: 'Crea un usuario',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Usuario' } } } },
          responses: { '201': { description: 'Creado' } }
        }
      },
      '/api/usuarios/{id}': {
        get: { tags: ['Usuarios'], summary: 'Obtiene un usuario por ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Ok' } } },
        delete: { tags: ['Usuarios'], summary: 'Elimina un usuario', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Eliminado' } } }
      },
      '/api/vehiculos': {
        get: { tags: ['Vehiculos'], summary: 'Obtiene vehículos', responses: { '200': { description: 'Ok' } } },
        post: {
          tags: ['Vehiculos'],
          summary: 'Crea un vehículo',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Vehiculo' } } } },
          responses: { '201': { description: 'Creado' } }
        }
      },
      '/api/vehiculos/{id}': {
        get: { tags: ['Vehiculos'], summary: 'Obtiene un vehículo por ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Ok' } } },
        delete: { tags: ['Vehiculos'], summary: 'Elimina un vehículo', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Eliminado' } } }
      },
      '/api/asignacion': {
        get: { tags: ['asignacion'], summary: 'Obtiene todas las asignaciones', responses: { '200': { description: 'Ok' } } },
        post: {
          tags: ['asignacion'],
          summary: 'Asigna un espacio (Valida disponibilidad)',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Asignacion' } } } },
          responses: { 
            '201': { description: 'Asignación exitosa' },
            '409': { description: 'Espacio ocupado' }
          }
        }
      },
      '/api/asignacion/anular/{id}': {
        put: {
          tags: ['asignacion'],
          summary: 'Anula una asignación (Cambia estado a 0)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'Anulado correctamente' } }
        }
      }
    }
  },
  apis: [] 
};

module.exports = swaggerJSDoc(options);