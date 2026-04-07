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

        PlanParqueo: {
  type: 'object',
  required: [
    'PLA_id_plan_parqueo',
    'PLA_nombre',
    'PLA_precio',
    'PLA_creado_por'
  ],
  properties: {

    PLA_id_plan_parqueo: {
      type: 'integer',
      description: 'ID del plan de parqueo'
    },

    PLA_nombre: {
      type: 'string',
      description: 'Nombre del plan'
    },

    PLA_precio: {
      type: 'number',
      format: 'decimal',
      description: 'Precio del plan'
    },

    PLA_descripcion: {
      type: 'string',
      description: 'Descripción del plan'
    },

    PLA_creado_por: {
      type: 'string',
      description: 'Usuario que creó el plan'
    },

    PLA_fecha_creacion: {
      type: 'string',
      format: 'date-time',
      description: 'Fecha de creación'
    }

  },

  example: {
    PLA_id_plan_parqueo: 1,
    PLA_nombre: 'Plan Mensual',
    PLA_precio: 150.00,
    PLA_descripcion: 'Plan mensual de parqueo',
    PLA_creado_por: 'admin',
    PLA_fecha_creacion: '2024-01-01T10:00:00Z'
  }
},

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
        },

        Multa: {
          type: 'object',
          required: ['MUL_id_multa', 'MUL_monto_total', 'MUL_monto_base', 'MUL_impuesto', 'MUL_descripcion', 'MUL_fecha', 'MUL_fecha_vencimiento', 'MUL_creado_por'],
          properties: {
            MUL_id_multa: {
              type: 'integer',
              format: 'int64',
              description: 'ID único de la multa'
            },
            MUL_monto_total: {
              type: 'number',
              format: 'decimal',
              description: 'Monto total de la multa'
            },
            MUL_monto_base: {
              type: 'number',
              format: 'decimal',
              description: 'Monto base de la multa'
            },
            MUL_impuesto: {
              type: 'number',
              format: 'decimal',
              description: 'Impuesto aplicado a la multa'
            },
            MUL_descripcion: {
              type: 'string',
              maxLength: 100,
              description: 'Descripción de la multa'
            },
            MUL_fecha: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de la multa'
            },
            MUL_fecha_vencimiento: {
              type: 'string',
              format: 'date',
              description: 'Fecha de vencimiento de la multa'
            },
            MUL_creado_por: {
              type: 'string',
              maxLength: 50,
              description: 'Usuario que creó la multa'
            },
            MUL_fecha_creacion: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación de la multa'
            },
            MUL_modificado_por: {
              type: 'string',
              maxLength: 50,
              description: 'Usuario que modificó la multa'
            },
            MUL_fecha_modificacion: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de modificación de la multa'
            }
          },
          example: {
            MUL_id_multa: 1,
            MUL_monto_total: 150.00,
            MUL_monto_base: 120.00,
            MUL_impuesto: 30.00,
            MUL_descripcion: 'Multa por estacionamiento indebido',
            MUL_fecha: '2023-10-01T10:00:00Z',
            MUL_fecha_vencimiento: '2023-10-15',
            MUL_creado_por: 'admin',
            MUL_fecha_creacion: '2023-10-01T10:00:00Z'
          }
        },

        EstudianteMulta: {
          type: 'object',
          required: ['MUL_id_multa', 'EST_ID_ESTUDIANTE'],
          properties: {
            MUL_id_multa: {
              type: 'integer',
              format: 'int64',
              description: 'ID de la multa'
            },
            EST_ID_ESTUDIANTE: {
              type: 'integer',
              description: 'ID del estudiante'
            },
            EM_monto_pagado: {
              type: 'number',
              format: 'decimal',
              description: 'Monto pagado del total de la multa'
            },
            EM_monto_restante: {
              type: 'number',
              format: 'decimal',
              description: 'Monto restante a pagar'
            },
            EM_fecha_pago: {
              type: 'string',
              format: 'date',
              description: 'Fecha del pago'
            },
            EM_estado: {
              type: 'string',
              enum: ['pendiente', 'parcial', 'pagada'],
              description: 'Estado de la multa para el estudiante'
            },
            EM_fecha_creacion: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación del registro'
            },
            EM_fecha_modificacion: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última modificación'
            }
          },
          example: {
            MUL_id_multa: 1,
            EST_ID_ESTUDIANTE: 1001,
            EM_monto_pagado: 50.00,
            EM_monto_restante: 100.00,
            EM_fecha_pago: '2023-10-05',
            EM_estado: 'parcial',
            EM_fecha_creacion: '2023-10-01T10:00:00Z'
          }
        },
        FormaPago: {
          type: 'object',
          required: ['FPG_id_forma_pago', 'FPG_nombre_forma', 'FPG_estado'],
          properties: {
            FPG_id_forma_pago: {
              type: 'integer',
              description: 'ID único de la forma de pago'
            },
            FPG_nombre_forma: {
              type: 'string',
              maxLength: 50,
              description: 'Nombre de la forma de pago'
            },
            FPG_estado: {
              type: 'string',
              maxLength: 1,
              description: 'Estado de la forma de pago (A=Activo, I=Inactivo)'
            }
          },
          example: {
            FPG_id_forma_pago: 1,
            FPG_nombre_forma: 'Efectivo',
            FPG_estado: 'A'
          }
        }

      },
    
        Pago: {
          type: 'object',
          required: ['id_pago', 'id_estudiante', 'id_plan', 'fecha_pago', 'monto_pagado'],
          properties: {
            id_pago: { type: 'integer' },
            id_estudiante: { type: 'integer' },
            id_plan: { type: 'integer' },
            fecha_pago: { type: 'string', format: 'date-time' },
            monto_pagado: { type: 'number' },
            referencia_banco: { type: 'string' },
            tarjeta_mask: { type: 'string' },
            id_multa: { type: 'integer' },
            id_vehiculo_estudiante: { type: 'integer' }
          },
          example: {
            id_pago: 1,
            id_estudiante: 1001,
            id_plan: 2,
            fecha_pago: '2024-03-01T10:00:00Z',
            monto_pagado: 250.00,
            referencia_banco: 'REF123456',
            tarjeta_mask: '1234',
            id_multa: null,
            id_vehiculo_estudiante: 10
          }
        }
    },

    paths: {

      '/api/plan-parqueo': {

  get: {
    tags: ['Plan Parqueo'],
    summary: 'Obtiene todos los planes de parqueo',
    responses: {
      '200': {
        description: 'Lista obtenida correctamente',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/PlanParqueo'
              }
            }
          }
        }
      }
    }
  },

  post: {
    tags: ['Plan Parqueo'],
    summary: 'Crea un nuevo plan de parqueo',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/PlanParqueo'
          }
        }
      }
    },
    responses: {
      '201': {
        description: 'Plan creado correctamente'
      }
    }
  }

},

'/api/plan-parqueo/{id}': {

  get: {
    tags: ['Plan Parqueo'],
    summary: 'Obtiene un plan por ID',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: {
          type: 'integer'
        }
      }
    ],
    responses: {
      '200': {
        description: 'Plan encontrado',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/PlanParqueo'
            }
          }
        }
      }
    }
  },

  put: {
    tags: ['Plan Parqueo'],
    summary: 'Actualiza un plan',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: {
          type: 'integer'
        }
      }
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/PlanParqueo'
          }
        }
      }
    },
    responses: {
      '200': {
        description: 'Plan actualizado'
      }
    }
  },

  delete: {
    tags: ['Plan Parqueo'],
    summary: 'Elimina un plan',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: {
          type: 'integer'
        }
      }
    ],
    responses: {
      '200': {
        description: 'Plan eliminado'
      }
    }
  }

},

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
      },
      '/api/multa': {
        get: {
          tags: ['Multas'],
          summary: 'Obtiene todas las multas',
          responses: {
            '200': {
              description: 'Lista de multas obtenida correctamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Multa' }
                  }
                }
              }
            },
            '500': { description: 'Error al obtener las multas' }
          }
        },
        post: {
          tags: ['Multas'],
          summary: 'Crea una nueva multa',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Multa' }
              }
            }
          },
          responses: {
            '201': { description: 'Multa creada exitosamente' },
            '400': { description: 'El ID de la multa ya existe' },
            '500': { description: 'Error al crear la multa' }
          }
        }
      },

      '/api/multa/{id}': {
        get: {
          tags: ['Multas'],
          summary: 'Obtiene una multa por ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'ID de la multa',
              schema: { type: 'integer', format: 'int64' }
            }
          ],
          responses: {
            '200': {
              description: 'Multa obtenida correctamente',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Multa' }
                }
              }
            },
            '404': { description: 'Multa no encontrada' },
            '500': { description: 'Error al obtener la multa' }
          }
        },
        put: {
          tags: ['Multas'],
          summary: 'Actualiza una multa',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'ID de la multa',
              schema: { type: 'integer', format: 'int64' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Multa' }
              }
            }
          },
          responses: {
            '200': { description: 'Multa actualizada exitosamente' },
            '404': { description: 'Multa no encontrada para actualizar' },
            '500': { description: 'Error al actualizar la multa' }
          }
        },
      },

      '/api/forma_pago': {
        get: {
          tags: ['Formas de Pago'],
          summary: 'Obtiene todas las formas de pago',
          responses: {
            '200': {
              description: 'Lista de formas de pago obtenida correctamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/FormaPago' }
                  }
                }
              }
            },
            '500': { description: 'Error al obtener las formas de pago' }
          }
        },
        post: {
          tags: ['Formas de Pago'],
          summary: 'Crea una nueva forma de pago',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/FormaPago' }
              }
            }
          },
          responses: {
            '201': { description: 'Forma de pago creada exitosamente' },
            '400': { description: 'El ID de forma de pago ya existe' },
            '500': { description: 'Error al crear la forma de pago' }
          }
        }
      },

      '/api/forma_pago/{id}': {
        get: {
          tags: ['Formas de Pago'],
          summary: 'Obtiene una forma de pago por ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'ID de la forma de pago',
              schema: { type: 'integer' }
            }
          ],
          responses: {
            '200': { description: 'Multa eliminada exitosamente' },
            '404': { description: 'Multa no encontrada para eliminar' },
            '500': { description: 'Error al eliminar la multa' }  
    }
  }
      },
      '/api/pago': {
  get: {
    tags: ['Pagos'],
    summary: 'Obtiene todos los pagos',
    responses: {
      '200': {
        description: 'Lista de pagos',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: { $ref: '#/components/schemas/Pago' }
            }
            '200': {
              description: 'Forma de pago obtenida correctamente',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/FormaPago' }
                }
              }
            },
            '404': { description: 'Forma de pago no encontrada' },
            '500': { description: 'Error al obtener la forma de pago' }
          }
        },
        put: {
          tags: ['Formas de Pago'],
          summary: 'Actualiza una forma de pago',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'ID de la forma de pago',
              schema: { type: 'integer' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/FormaPago' }
              }
            }
          },
          responses: {
            '200': { description: 'Forma de pago actualizada exitosamente' },
            '404': { description: 'Forma de pago no encontrada para actualizar' },
            '500': { description: 'Error al actualizar la forma de pago' }
          }
        }
      },

      '/api/estudiante_multa': {
        get: {
          tags: ['Estudiante-Multa'],
          summary: 'Obtiene todas las relaciones estudiante-multa',
          responses: {
            '200': {
              description: 'Lista de relaciones estudiante-multa obtenida correctamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/EstudianteMulta' }
                  }
                }
              }
            },
            '500': { description: 'Error al obtener los registros' }
          }
        },
        post: {
          tags: ['Estudiante-Multa'],
          summary: 'Crea una nueva relación estudiante-multa',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/EstudianteMulta' }
              }
            }
          },
          responses: {
            '201': {
              description: 'Relación estudiante-multa creada exitosamente',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/EstudianteMulta' }
                }
              }
            },
            '500': { description: 'Error al crear el registro' }
          }
        }
      },

      '/api/estudiante_multa/estudiante/{estudiante_id}': {
        get: {
          tags: ['Estudiante-Multa'],
          summary: 'Obtiene todas las multas de un estudiante',
          parameters: [
            {
              name: 'estudiante_id',
              in: 'path',
              required: true,
              description: 'ID del estudiante',
              schema: { type: 'integer' }
            }
          ],
          responses: {
            '200': {
              description: 'Lista de multas del estudiante obtenida correctamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/EstudianteMulta' }
                  }
                }
              }
            },
            '500': { description: 'Error al obtener por estudiante' }
          }
        }
      },

      '/api/estudiante_multa/{EMU_ID_EST_MULTA}': {
        put: {
          tags: ['Estudiante-Multa'],
          summary: 'Actualiza un registro estudiante-multa por ID',
          parameters: [
            {
              name: 'EMU_ID_EST_MULTA',
              in: 'path',
              required: true,
              description: 'ID del registro de estudiante-multa',
              schema: { type: 'integer' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/EstudianteMulta' }
              }
            }
          },
          responses: {
            '200': { description: 'Registro actualizado correctamente' },
            '404': { description: 'Registro no encontrado' },
            '500': { description: 'Error al actualizar el registro' }
          }
        },
        delete: {
          tags: ['Estudiante-Multa'],
          summary: 'Elimina un registro estudiante-multa por ID',
          parameters: [
            {
              name: 'EMU_ID_EST_MULTA',
              in: 'path',
              required: true,
              description: 'ID del registro de estudiante-multa',
              schema: { type: 'integer' }
            }
          ],
          responses: {
            '200': { description: 'Registro eliminado correctamente' },
            '404': { description: 'Registro no encontrado' },
            '500': { description: 'Error al eliminar el registro' }
          }
        }
      },
      '500': { description: 'Error al obtener los pagos' }
    }
  },
  post: {
    tags: ['Pagos'],
    summary: 'Crea un pago',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Pago' }
        }
      }
    },
    responses: {
      '201': { description: 'Pago creado exitosamente' },
      '500': { description: 'Error al crear el pago' }
    }
  }
},

'/api/pago/{id}': {
  get: {
    tags: ['Pagos'],
    summary: 'Obtiene un pago por ID',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        description: 'ID del pago',
        schema: { type: 'integer' }
      }
    ],
    responses: {
      '200': {
        description: 'Pago obtenido correctamente',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Pago' }
          }
        }
      },
      '404': { description: 'Pago no encontrado' },
      '500': { description: 'Error al obtener el pago' }
    }
  },
  put: {
    tags: ['Pagos'],
    summary: 'Actualiza un pago',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        description: 'ID del pago',
        schema: { type: 'integer' }
      }
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Pago' }
        }
      }
    },
    responses: {
      '200': { description: 'Pago actualizado exitosamente' },
      '404': { description: 'Pago no encontrado para actualizar' },
      '500': { description: 'Error al actualizar el pago' }
    }
  },
  delete: {
    tags: ['Pagos'],
    summary: 'Elimina un pago',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        description: 'ID del pago',
        schema: { type: 'integer' }
      }
    ],
    responses: {
      '200': { description: 'Pago eliminado exitosamente' },
      '404': { description: 'Pago no encontrado para eliminar' },
      '500': { description: 'Error al eliminar el pago' }
    }
  }
}

    }

  },
  apis: []
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;