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
          properties: {
            PQ_Parqueo: { type: 'integer', readOnly: true },
            PQ_Nombre: { type: 'string', example: 'Parqueo Central' },
            PQ_Direccion: { type: 'string', example: 'Campus Central UMG' },
            PQ_Capacidad: { type: 'integer', example: 150 },

            estado: {
              type: 'integer',
              example: 1,
              readOnly: true,
              description: '1=Activo, 0=Inactivo (eliminación lógica)'
            }
          }
        },
        ParqueoCreate: {
          type: 'object',
          required: ['PQ_Nombre', 'PQ_Direccion', 'PQ_Capacidad'],
          properties: {
            PQ_Nombre: { type: 'string', example: 'Parqueo Central' },
            PQ_Direccion: { type: 'string', example: 'Campus Central UMG' },
            PQ_Capacidad: { type: 'integer', example: 150 }
          }
        },
        TipoEspacio: {
          type: 'object',
          required: ['TES_NOMBRE', 'TES_CAPACIDAD_MAX_TIPO', 'PQ_Parqueo'],
          properties: {
            TES_ESPACIO: { type: 'integer', readOnly: true },
            TES_NOMBRE: { type: 'string', example: 'MOTOS', description: 'Nombre limpio sin caracteres especiales.' },
            TES_CAPACIDAD_MAX_TIPO: { type: 'integer', example: 30, description: 'Cantidad entera de espacios permitidos.' },
            TES_ESTADO: { type: 'integer', example: 1, description: '1: Activo, 0: Inactivo (Borrado Lógico).' },
            PQ_Parqueo: { type: 'integer', example: 1 }
          }
        },
        Espacio: {
          type: 'object',
          required: ['TES_ESPACIO'],
          properties: {
            ES_Espacio: { type: 'integer', readOnly: true },
            ES_Numero: { type: 'integer', example: 1, description: 'Generado automáticamente buscando huecos en la numeración.' },
            ES_Estado: { type: 'integer', example: 1, description: '1: Disponible, 0: Ocupado/Mantenimiento' },
            TES_ESPACIO: { type: 'integer', example: 1 }
          }
        },
        Asignacion: {
          type: 'object',
          required: ['carne_usuario', 'ES_Espacio', 'id_ciclo', 'id_jornada'],
          properties: {
            AS_Asignacion: { type: 'integer', readOnly: true },
            AS_FechaAsignacion: { type: 'string', format: 'date-time', readOnly: true },
            AS_Estado: { type: 'integer', readOnly: true, example: 1, description: '1: Activa, 0: Anulada' },
            carne_usuario: { type: 'string', example: '2026-01-001' },
            ES_Espacio: { type: 'integer', example: 1 },
            id_ciclo: { type: 'integer', example: 1 },
            id_jornada: { type: 'integer', example: 1 }
          }
        }
      }
    },
    paths: {
      // --- PARQUEOS ---
'/api/parqueos': {

        get: { 
          tags: ['Parqueos'], 
          summary: 'Obtiene todos los parqueos activos (estado=1)', 
          description: 'Solo retorna parqueos activos. Los inactivos están ocultos por eliminación lógica.',
          responses: { '200': { description: 'Ok' } } 
        },

        post: {
          tags: ['Parqueos'],
          summary: 'Crea un parqueo (activo por defecto)',
          description: 'Se crea con estado=1 automáticamente.',
          requestBody: { 
            required: true, 
            content: { 
              'application/json': { 
                schema: { 
                  $ref: '#/components/schemas/ParqueoCreate' 
                } 
              } 
            } 
          },
          responses: { 
            '201': { description: 'Parqueo creado' },
            '409': { description: 'Ya existe parqueo con ese nombre' }
          }
        }
      },

      '/api/parqueos/{id}': {

        get: { 
          tags: ['Parqueos'], 
          summary: 'Obtiene parqueo por ID (solo activos)', 
          description: 'Retorna 404 si no existe o está inactivo',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ], 
          responses: { 
            '200': { description: 'Ok' }, 
            '404': { description: 'No encontrado o inactivo' } 
          } 
        },

        put: {
          tags: ['Parqueos'],
          summary: 'Actualiza parqueo',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ParqueoCreate'
                }
              }
            }
          },
          responses: {
            '200': { description: 'Actualizado' },
            '404': { description: 'No encontrado' }
          }
        },

        delete: { 
          tags: ['Parqueos'], 
          summary: 'Eliminación lógica de parqueo (estado=0)', 
          description: 'No elimina de la BD, solo cambia estado a 0.',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
          ], 
          responses: { 
            '200': { description: 'Eliminado lógicamente' },
            '404': { description: 'No encontrado' }
          } 
        }
      },
      '/api/parqueos/{id}/restore': {
  put: {
    tags: ['Parqueos'],
    summary: 'Restaura un parqueo eliminado lógicamente (estado=1)',
    description: 'Reactiva un parqueo que fue desactivado (estado=0).',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer' }
      }
    ],
    responses: {
      '200': { description: 'Parqueo restaurado correctamente' },
      '404': { description: 'No existe o ya está activo' }
    }
  }
},
'/api/parqueos/admin/all': {
  get: {
    tags: ['Parqueos'],
    summary: 'Ver todos los parqueos (admin)',
    description: 'Incluye activos e inactivos',
    responses: { '200': { description: 'OK' } }
  }
},
      // --- TIPO ESPACIOS ---
      '/api/tipo-espacios': {
        get: { tags: ['Tipo Espacio'], summary: 'Lista todos los tipos de espacio', responses: { '200': { description: 'Ok' } } },
        post: {
          tags: ['Tipo Espacio'],
          summary: 'Crea un tipo (Valida capacidad entera y sumatoria total)',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/TipoEspacio' } } } },
          responses: { 
            '201': { description: 'Creado exitosamente' },
            '400': { description: 'Caracteres inválidos o capacidad no entera' },
            '409': { description: 'Capacidad excede el límite del parqueo' }
          }
        }
      },
      '/api/tipo-espacios/{idTipo}/espacios': {
        get: {
          tags: ['Tipo Espacio'],
          summary: 'Listar espacios físicos por Tipo y Estado',
          parameters: [
            { name: 'idTipo', in: 'path', required: true, schema: { type: 'integer' } },
            { name: 'estado', in: 'query', required: false, schema: { type: 'integer', enum: [0, 1] }, description: '1: Disponible, 0: Ocupado' }
          ],
          responses: { '200': { description: 'Listado obtenido' } }
        }
      },
      '/api/tipo-espacios/{id}': {
        put: {
          tags: ['Tipo Espacio'],
          summary: 'Actualiza nombre o capacidad de un tipo',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { TES_NOMBRE: { type: 'string' }, TES_CAPACIDAD_MAX_TIPO: { type: 'integer' } } } } } },
          responses: { '200': { description: 'Actualizado' } }
        },
        delete: {
          tags: ['Tipo Espacio'],
          summary: 'Eliminar tipo (Físico)',
          description: 'Elimina el tipo y libera espacios asociados. Falla si hay espacios ocupados (Estado 0).',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 
            '200': { description: 'Tipo eliminado y espacios liberados' },
            '409': { description: 'Conflicto: Existen espacios ocupados vinculados a este tipo' }
          }
        }
      },
      '/api/tipo-espacios/{id}/estado': {
        put: {
          tags: ['Tipo Espacio'],
          summary: 'Actualizar estado del tipo (Activar/Desactivar)',
          description: 'Permite cambiar el TES_ESTADO. Si se envía 0, valida que no haya espacios ocupados.',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    nuevoEstado: { type: 'integer', enum: [0, 1], example: 0 }
                  }
                }
              }
            }
          },
          responses: { 
            '200': { description: 'Estado actualizado' },
            '409': { description: 'Conflicto: Hay espacios ocupados' }
          }
        }
      },

      // --- ESPACIOS ---
      '/api/espacios': {
        get: { tags: ['Espacios'], summary: 'Obtiene todos los espacios registrados', responses: { '200': { description: 'Ok' } } },
        post: {
          tags: ['Espacios'],
          summary: 'Crea un espacio (Auto-numeración y validación de tope)',
          description: 'No requiere ES_Numero. El sistema busca el primer hueco disponible en el parqueo.',
          requestBody: { 
            required: true, 
            content: { 'application/json': { schema: { type: 'object', properties: { TES_ESPACIO: { type: 'integer', example: 1 } } } } } 
          },
          responses: { 
            '201': { description: 'Espacio creado exitosamente' },
            '404': { description: 'El tipo de espacio no existe' },
            '409': { description: 'Capacidad máxima del tipo alcanzada' }
          }
        }
      },
      '/api/espacios/tipo/{tipoId}': {
        get: {
          tags: ['Espacios'],
          summary: 'Obtiene espacios por su Tipo',
          parameters: [
            { name: 'tipoId', in: 'path', required: true, schema: { type: 'integer' } },
            { name: 'estado', in: 'query', schema: { type: 'integer', enum: [0, 1] }, description: '1: Libre, 0: Ocupado' }
          ],
          responses: { '200': { description: 'Ok' } }
        }
      },
      '/api/espacios/metricas/{tipoId}': {
        get: {
          tags: ['Espacios'],
          summary: 'Métricas de disponibilidad por tipo',
          parameters: [{ name: 'tipoId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'Conteo exitoso' } }
        }
      },
      '/api/espacios/disponibilidad/avanzada': {
        get: {
          tags: ['Espacios'],
          summary: 'Disponibilidad por semestre y jornada',
          description: 'Cruza espacios físicos con asignaciones activas para el periodo seleccionado.',
          parameters: [
            { name: 'semestre', in: 'query', required: true, schema: { type: 'integer' }, description: 'ID del Ciclo/Semestre' },
            { name: 'jornada', in: 'query', required: true, schema: { type: 'integer' }, description: 'ID de la Jornada' },
            { name: 'estado', in: 'query', schema: { type: 'integer', enum: [0, 1] }, description: 'Filtrar por estado del espacio físico' }
          ],
          responses: { '200': { description: 'Ok' } }
        }
      },
      '/api/espacios/parqueo/{id}': {
        get: {
          tags: ['Espacios'],
          summary: 'Obtiene un parqueo por ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'Ok' } }
        }
      },
      '/api/espacios/{id}': {
        put: {
          tags: ['Espacios'],
          summary: 'Actualiza un espacio (Edición Dual)',
          description: 'Si se envía "soloEstado: true", solo se actualiza ES_Estado. De lo contrario, valida cambios de tipo y capacidad.',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: { 
            required: true, 
            content: { 
              'application/json': { 
                schema: { 
                  type: 'object',
                  properties: {
                    ES_Estado: { type: 'integer', example: 1 },
                    TES_ESPACIO: { type: 'integer', example: 2 },
                    soloEstado: { type: 'boolean', example: true }
                  }
                } 
              } 
            } 
          },
          responses: { '200': { description: 'Actualizado' }, '409': { description: 'Capacidad máxima del nuevo tipo alcanzada' } }
        },
        delete: {
          tags: ['Espacios'],
          summary: 'Elimina un espacio físico',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'Eliminado' } }
        }
      },

      '/api/espacios/{id}/estado': {
        put: {
          tags: ['Espacios'],
          summary: 'Cambiar estado físico (Ocupado/Libre)',
          description: 'Actualiza ES_Estado. Si se intenta liberar (1), valida que el Tipo de Espacio no esté desactivado.',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    nuevoEstado: { type: 'integer', enum: [0, 1], example: 0 }
                  }
                }
              }
            }
          },
          responses: { 
            '200': { description: 'Estado actualizado correctamente' },
            '409': { description: 'Conflicto: El tipo de espacio asociado está inactivo' }
          }
        }
      },

      // --- ASIGNACIONES ---
      '/api/asignacion': {
        get: { 
          tags: ['Asignaciones'], 
          summary: 'Obtiene todas las asignaciones',
          parameters: [
            { name: 'id_ciclo', in: 'query', schema: { type: 'integer' } },
            { name: 'estado', in: 'query', schema: { type: 'integer' } }
          ],
          responses: { '200': { description: 'Ok' } } 
        },
        post: {
          tags: ['Asignaciones'],
          summary: 'Asigna un espacio (Valida disponibilidad y estado)',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Asignacion' } } } },
          responses: { 
            '201': { description: 'Asignación creada' },
            '409': { description: 'Conflicto: Espacio ocupado o usuario con asignación activa' }
          }
        }
      },
      '/api/asignacion/anular/{id}': {
        put: {
          tags: ['Asignaciones'],
          summary: 'Anula una asignación (Libera el espacio)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'Anulada' } }
        }
      }
    }
  },
  apis: []
};
module.exports = swaggerJSDoc(options);