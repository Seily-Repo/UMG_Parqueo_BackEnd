const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: { 
      title: 'UMG Parqueos API', 
      version: '1.0.0', 
      description: 'Backend con IDs Automáticos (Identity) y CRUD funcional con Sequelize y Oracle' 
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
          required: ['PQ_Nombre','PQ_Direccion','PQ_Capacidad'],
          properties: {
            PQ_Parqueo: { 
              type: 'integer', 
              description: 'Generado automáticamente por Oracle',
              readOnly: true // 🛡️ Bloquea el envío en POST/PUT
            },
            PQ_Nombre: { type: 'string' },
            PQ_Direccion: { type: 'string' },
            PQ_Capacidad: { type: 'integer' }
          }
        },

        Jornada: {
          type: 'object',
          required: ['JD_TipoJornada', 'JD_Descripcion'],
          properties: {
            JD_Jornada: { 
              type: 'integer', 
              description: 'Generado automáticamente por Oracle',
              readOnly: true // 🛡️ Bloquea el envío en POST/PUT
            },
            JD_TipoJornada: { type: 'string', example: 'Matutina' },
            JD_Descripcion: { type: 'string', example: 'Lunes a Viernes 07:00 - 12:00' }
          }
        },

        Espacio: {
          type: 'object',
          required: ['ES_Numero','ES_Estado','PQ_Parqueo'],
          properties: {
            ES_Espacio: { type: 'integer', readOnly: true },
            ES_Numero: { type: 'integer' },
            ES_Estado: { type: 'integer' },
            PQ_Parqueo: { type: 'integer' }
          }
        },

        Semestre: {
          type: 'object',
          required: ['SM_ANO','SM_Periodo'],
          properties: {
            SM_Semestre: { type: 'integer', readOnly: true },
            SM_ANO: { type: 'integer' },
            SM_Periodo: { type: 'integer' }
          }
        },

        Usuario: {
          type: 'object',
          required: ['US_Identificacion','US_Nombre','US_Apellido','US_Email','US_Pass'],
          properties: {
            US_Identificacion: { type: 'integer' }, // Este suele ser DPI/Cédula, podrías dejarlo editable
            US_Nombre: { type: 'string' },
            US_Apellido: { type: 'string' },
            US_Email: { type: 'string' },
            US_Telefono: { type: 'integer' },
            US_Pass: { type: 'string' }
          }
        },

        Vehiculo: {
          type: 'object',
          required: ['VH_Placa','VH_Marca','VH_Modelo','US_Identificacion'],
          properties: {
            VH_Vehiculo: { type: 'integer', readOnly: true },
            VH_Placa: { type: 'string' },
            VH_Marca: { type: 'string' },
            VH_Modelo: { type: 'string' },
            US_Identificacion: { type: 'integer' }
          }
        }
      }
    },

    paths: {
      '/api/parqueos': {
        get: { tags:['Parqueos'], summary:'Obtiene todos los parqueos', responses:{'200':{description:'Lista'}} },
        post: {
          tags:['Parqueos'],
          summary:'Crea parqueo (El ID se ignora)',
          requestBody:{
            required:true,
            content:{'application/json':{schema:{$ref:'#/components/schemas/Parqueo'}}}
          },
          responses:{'201':{description:'Creado'}}
        }
      },

      '/api/jornadas': {
        get: { 
          tags:['Jornadas'], 
          summary:'Lista todas las jornadas', 
          responses:{'200':{description:'Lista de jornadas'}} 
        },
        post: {
          tags:['Jornadas'],
          summary:'Crear nueva jornada (El ID se ignora)',
          requestBody:{
            required:true,
            content:{'application/json':{schema:{$ref:'#/components/schemas/Jornada'}}}
          },
          responses:{'201':{description:'Creado'}}
        }
      },
      '/api/jornadas/{id}': {
        get: {
          tags: ['Jornadas'],
          summary: 'Obtiene una jornada por ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'Ok' }, '404': { description: 'No encontrado' } }
        },
        put: {
          tags: ['Jornadas'],
          summary: 'Actualiza una jornada (No permite cambiar el ID)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Jornada' } } }
          },
          responses: { '200': { description: 'Actualizado' } }
        },
        delete: {
          tags: ['Jornadas'],
          summary: 'Elimina una jornada',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'Eliminado' } }
        }
      },

      '/api/espacios': {
        get:{ tags:['Espacios'], summary:'Lista espacios', responses:{'200':{description:'Lista'}}},
        post:{
          tags:['Espacios'],
          summary:'Crear espacio',
          requestBody:{
            required:true,
            content:{'application/json':{schema:{$ref:'#/components/schemas/Espacio'}}}
          },
          responses:{'201':{description:'Creado'}}
        }
      },

      '/api/semestres': {
        get:{ tags:['Semestres'], summary:'Lista semestres', responses:{'200':{description:'Lista'}}},
        post:{
          tags:['Semestres'],
          summary:'Crear semestre',
          requestBody:{
            required:true,
            content:{'application/json':{schema:{$ref:'#/components/schemas/Semestre'}}}
          },
          responses:{'201':{description:'Creado'}}
        }
      },

      '/api/usuario': {
        get:{ tags:['Usuarios'], summary:'Lista usuarios', responses:{'200':{description:'Lista'}}},
        post:{
          tags:['Usuarios'],
          summary:'Crear usuario',
          requestBody:{
            required:true,
            content:{'application/json':{schema:{$ref:'#/components/schemas/Usuario'}}}
          },
          responses:{'201':{description:'Creado'}}
        }
      },

      '/api/vehiculo': {
        get:{ tags:['Vehiculos'], summary:'Lista vehículos', responses:{'200':{description:'Lista'}}},
        post:{
          tags:['Vehiculos'],
          summary:'Crear vehículo',
          requestBody:{
            required:true,
            content:{'application/json':{schema:{$ref:'#/components/schemas/Vehiculo'}}}
          },
          responses:{'201':{description:'Creado'}}
        }
      }
    }
  },
  apis: [] 
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;