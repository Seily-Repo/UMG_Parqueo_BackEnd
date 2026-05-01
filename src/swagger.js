const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "UMG Sistema de Cobros API",
      version: "1.0.0",
      description: "API REST para gestión de cobros a estudiantes",
    },
    servers: [
      { 
        url: "/api/cobros", 
        description: "Servidor Dev (vía Nginx)" 
      },
      { 
        url: "http://localhost:3000", 
        description: "Ejecución Local" 
      }
    ],

    // Componentes
    components: {
      schemas: {
       // PlanParqueo
        PlanParqueo: {
        type: "object",
        required: [
          "PLN_NOMBRE_PLAN",
          "PLN_DESCRIPCION",
          "PLN_PRECIO",
          "PLN_ESTADO_REGISTRO",
          "PLN_MONEDA",
            ],

           properties: {

           PLN_NOMBRE_PLAN: {
           type: "string",
           description: "Nombre del plan",
           enum: [
              "VESPERTINA",
              "NOCTURNA",
              "SÁBADO",
              "DOMINGO"
              ],
              example: "VESPERTINA"
              },

              PLN_PRECIO: {
              type: "number",
              format: "decimal",
              description: "Precio del plan",
              minimum: 0.01,
              example: 150.00
              },

              PLN_DESCRIPCION: {
              type: "string",
              description: "Tipo de vehículo",
              enum: [
              "CARRO",
              "MOTO"
              ],

              example: "CARRO"
              },

              PLN_ESTADO_REGISTRO: {
              type: "string",
              description: "Estado del plan",
              enum: [
                "A",
                "I"
               ],
                example: "A"
              },

              PLN_MONEDA: {
              type: "string",
              description: "Moneda del plan",
              enum: [
              "GTQ"
              ],
              example: "GTQ"
              }

             },

              example: {
              PLN_NOMBRE_PLAN: "VESPERTINA",
              PLN_PRECIO: 150.00,
              PLN_DESCRIPCION: "CARRO",
              PLN_ESTADO_REGISTRO: "A",
             PLN_MONEDA: "GTQ"
             }

            },

        // Estudiante
        Usuario: {
          type: "object",
          required: [
            "LR_CARNE",
            "LR_NOMBRE_COMPLETO",
            "LR_CORREO_INSTITUCIONAL",
            "LR_FECHA_CREACION",
          ],
          properties: {
            LR_CARNE: {
              type: "string",
              description: "Carné del estudiante (único)",
            },
            LR_NOMBRE_COMPLETO: {
              type: "string",
              description: "Nombre completo del estudiante",
            },
            LR_CORREO_INSTITUCIONAL: {
              type: "string",
              description: "Correo electrónico del estudiante",
            },
            LR_FECHA_CREACION: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación del estudiante",
            },
          },
          example: {
            LR_CARNE: "5190-23-202034",
            LR_NOMBRE_COMPLETO: "Juan Pérez García",
            LR_CORREO_INSTITUCIONAL: "[EMAIL_ADDRESS]",
            LR_FECHA_CREACION: "2024-01-01T10:00:00Z",
          },
        },
        // Multa
        Multa: {
          type: "object",
          required: [
            "MUL_MONTO_TOTAL",
            "MUL_DESCRIPCION",
            "MUL_DIAS_VENCIMIENTO",
            "MUL_ESTADO_REGISTRO"
          ],
          properties: {
            MUL_MULTA: {
              type: "integer",
              format: "int64",
              description: "ID único de la multa (Generado automáticamente por Oracle)",
              readOnly: true,
            },
            MUL_MONTO_TOTAL: {
              type: "number",
              format: "decimal",
              description: "Monto total de la multa (NUMBER 10,2)",
            },
            MUL_DESCRIPCION: {
              type: "string",
              maxLength: 100,
              description: "Descripción de la multa",
            },
            MUL_DIAS_VENCIMIENTO: {
              type: "integer",
              description: "Cantidad de días para el vencimiento de la multa",
            },
            MUL_CREADO_POR: {
              type: "string",
              maxLength: 50,
              description: "Usuario que creó el registro",
              default: "ADMIN"
            },
            MUL_FECHA_CREACION: {
              type: "string",
              format: "date-time",
              description: "Fecha y hora de creación",
            },
            MUL_MODIFICADO_POR: {
              type: "string",
              maxLength: 50,
              description: "Usuario que realizó la última modificación",
              nullable: true
            },
            MUL_FECHA_MODIFICACION: {
              type: "string",
              format: "date-time",
              description: "Fecha de la última modificación",
              nullable: true
            },
            MUL_ESTADO_REGISTRO: {
              type: "string",
              maxLength: 1,
              description: "Estado del registro (A = Activo, I = Inactivo)",
              enum: ["A", "I"],
              default: "A"
            },
          },
          example: {
            MUL_MONTO_TOTAL: "250.50",
            MUL_DESCRIPCION: "Vehículo obstruyendo rampa de acceso",
            MUL_DIAS_VENCIMIENTO: "15",
            MUL_CREADO_POR: "ADMIN",
            MUL_ESTADO_REGISTRO: "A"
          },
        },
        // UsuarioMulta
        UsuarioMulta: {
          type: "object",
          required: [
            "MUL_MULTA",
            "VEH_ID_VEHICULO",
            "EMU_ESTADO_MULTA",
          ],
          properties: {
            EMU_USUARIO_MULTA: {
              type: "integer",
              format: "int64",
              description: "ID único del registro (autogenerado por la BD)",
            },
            MUL_MULTA: {
              type: "integer",
              format: "int64",
              description: "ID de la multa (FK a CB_MULTA)",
            },
            VEH_ID_VEHICULO: {
              type: "string",
              maxLength: 15,
              description: "Identificador del vehículo (FK a CB_VEHICULO)",
            },
            EMU_ESTADO_MULTA: {
              type: "string",
              maxLength: 1,
              enum: ["A", "P", "C"],
              description: "Estado de la multa (A=Activa, P=Pendiente, C=Cancelada)",
            },
            EMU_CREADO_POR: {
              type: "string",
              maxLength: 50,
              default: "ADMIN",
              description: "Usuario que creó el registro",
            },
            EMU_FECHA_CREACION: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación del registro (automático)",
            },
            EMU_MODIFICADO_POR: {
              type: "string",
              maxLength: 50,
              description: "Usuario que realizó la última modificación",
            },
            EMU_FECHA_MODIFICACION: {
              type: "string",
              format: "date-time",
              description: "Fecha de última modificación del registro (automático)",
            },
            EMU_ESTADO_REGISTRO: {
              type: "string",
              maxLength: 1,
              enum: ["A", "I"],
              default: "A",
              description: "Estado del registro (A=Activo, I=Inactivo)",
            },
          },
          example: {
            EMU_USUARIO_MULTA: 1,
            MUL_MULTA: 1,
            VEH_ID_VEHICULO: "P-123ABC",
            EMU_ESTADO_MULTA: "A",
            EMU_CREADO_POR: "ADMIN",
            EMU_FECHA_CREACION: "2024-01-01T10:00:00Z",
            EMU_MODIFICADO_POR: "admin",
            EMU_FECHA_MODIFICACION: "2024-01-05T15:30:00Z",
            EMU_ESTADO_REGISTRO: "A",
          },
        },
        // UsuarioMoroso
        UsuarioMoroso: {
          type: "object",
          required: ["LR_CARNE", "MOR_MOTIVO"],
          properties: {
            MOR_USUARIO_MOROSO: {
              type: "integer",
              format: "int64",
              description: "ID único del registro de usuario moroso (autogenerado)",
            },
            LR_CARNE: {
              type: "string",
              maxLength: 20,
              description: "Carné del usuario",
            },
            MOR_FECHA_AGREGADO: {
              type: "string",
              description: "Fecha y hora en que se añadió a la lista de morosos (DD/MM/YYYY HH:mm:ss)",
            },
            MOR_MOTIVO: {
              type: "string",
              maxLength: 100,
              description: "Motivo por el cual el usuario fue marcado como moroso",
            },
            MOR_MODIFICADO_POR: {
              type: "string",
              maxLength: 50,
              description: "Usuario que realizó la última modificación",
            },
            MOR_FECHA_MODIFICACION: {
              type: "string",
              description: "Fecha y hora de la última modificación",
            },
            MOR_ESTADO_MOROSO: {
              type: "string",
              maxLength: 1,
              enum: ["A", "I", "S"],
              description: "Estado del registro de morosidad (A=Activo, I=Inactivo, S=Suspendido)",
            },
            MOR_ESTADO_REGISTRO: {
              type: "string",
              maxLength: 1,
              enum: ["A", "I", "S"],
              description: "Estado del registro (A=Activo, I=Inactivo, S=Suspendido)",
            },
          },
          example: {
            LR_CARNE: "5190-23-202034",
            MOR_MOTIVO: "Pago atrasado",
            MOR_ESTADO_MOROSO: "A",
            MOR_ESTADO_REGISTRO: "A",
          },
        },
        // FormaPago
        FormaPago: {
          type: "object",
          required: ["FPG_NOMBRE_FORMA", "FPG_ESTADO_REGISTRO"],
          properties: {
            FPG_FORMA_PAGO: {
              type: "integer",
              format: "int64",
              description: "ID único de la forma de pago (Generado por secuencia en Oracle)",
              readOnly: true,
            },
            FPG_NOMBRE_FORMA: {
              type: "string",
              maxLength: 50,
              description: "Nombre descriptivo de la forma de pago (Ej: Efectivo, Tarjeta)",
            },
            FPG_ESTADO_REGISTRO: {
              type: "string",
              maxLength: 1,
              description: "Estado del registro (A = Activo, I = Inactivo)",
              enum: ["A", "I"],
              default: "A",
            },
          },
          example: {
            FPG_NOMBRE_FORMA: "Efectivo",
            FPG_ESTADO_REGISTRO: "A",
          },
        },
        // Pago
        Pago: {
          type: "object",
          required: ["LR_CARNE", "PLN_PLAN", "FPG_FORMA_PAGO"],
          properties: {
            LR_CARNE: {
              type: "string",
              description: "Carné del estudiante",
            },
            PLN_PLAN: {
              type: "integer",
              description: "ID del plan",
            },
            FPG_FORMA_PAGO: {
              type: "integer",
              description: "ID de la forma de pago",
            },
            EMU_USUARIO_MULTA: {
              type: "integer",
              description: "ID de la multa (opcional)",
            },
            PAG_FECHA_PAGO: {
              type: "string",
              format: "date-time",
              description: "Fecha del pago",
            },
            PAG_MONTO_TOTAL: {
              type: "number",
              description: "Monto total del pago",
            },
            PAG_ESTADO: {
              type: "string",
              maxLength: 1,
              description:
                "Estado del pago (Generado automáticamente: P=Pendiente, A=Aceptado, C=Cancelado)",
            },
            PAG_FECHA_CREACION: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación del pago (Automático)",
            },
            STRIPE_PAYMENT_INTENT_ID: {
              type: "string",
              description: "ID de la transacción de Stripe (Automático)",
            },
            PAG_ESTADO_REGISTRO: {
              type: "string",
              maxLength: 1,
              description: "Estado del registro",
            },
          },
          example: {
            LR_CARNE: "5190-23-202034",
            PLN_PLAN: 1,
            FPG_FORMA_PAGO: 1,
            EMU_USUARIO_MULTA: null,
            PAG_ESTADO_REGISTRO: "A",
          },
        },
      },
    },

    paths: {

      // Rutas de Plan Parqueo
      "/api/plan_parqueo": {

        get: {
          tags: ["Plan Parqueo"],
          summary: "Obtiene todos los planes de parqueo",

          responses: {
            200: {
              description: "Lista obtenida correctamente",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/PlanParqueo",
                    },
                  },
                },
              },
            },

            500: {
              description: "Error del servidor",
            },

          },

        },

        post: {
          tags: ["Plan Parqueo"],
          summary: "Crea un nuevo plan de parqueo",

          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PlanParqueo",
                },
              },
            },
          },

          responses: {

            201: {
              description: "Plan creado correctamente",
            },

            400: {
              description: "Datos inválidos",
            },

            500: {
              description: "Error del servidor",
            },

          },

        },

      },

      // Rutas de Plan Parqueo por ID
      "/api/plan_parqueo/{id}": {

        get: {
          tags: ["Plan Parqueo"],
          summary: "Obtiene un plan por ID",

          parameters: [
            {
              name: "id",
              in: "path",
              description: "ID del plan de parqueo",
              required: true,
              schema: {
                type: "integer",
              },
            },
          ],

          responses: {

            200: {
              description: "Plan encontrado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/PlanParqueo",
                  },
                },
              },
            },

            404: {
              description: "Plan no encontrado",
            },

            500: {
              description: "Error del servidor",
            },

          },

        },

        put: {
          tags: ["Plan Parqueo"],
          summary: "Actualiza un plan",

          parameters: [
            {
              name: "id",
              in: "path",
              description: "ID del plan de parqueo",
              required: true,
              schema: {
                type: "integer",
              },
            },
          ],

          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PlanParqueo",
                },
              },
            },
          },

          responses: {

            200: {
              description: "Plan actualizado correctamente",
            },

            400: {
              description: "Datos inválidos",
            },

            404: {
              description: "Plan no encontrado",
            },

            500: {
              description: "Error del servidor",
            },

          },

        },

      },
      // Rutas de Estudiantes
      "/api/usuario": {
        get: {
          tags: ["Usuario"],
          summary: "Obtiene todos los usuarios",
          responses: {
            200: {
              description: "Lista de usuarios obtenida correctamente",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Usuario" },
                  },
                },
              },
            },
            500: { description: "Error al obtener los usuarios" },
          },
        },
        post: {
          tags: ["Usuario"],
          summary: "Crea un nuevo usuario",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Usuario" },
              },
            },
          },
          responses: {
            201: { description: "Usuario creado exitosamente" },
            400: { description: "La carné del estudiante ya existe" },
            500: { description: "Error al crear el estudiante" },
          },
        },
      },
      // Rutas de Estudiantes por Carne
      "/api/usuario/carne/{carne}": {
        get: {
          tags: ["Usuario"],
          summary: "Obtiene un usuario por carné",
          parameters: [
            {
              name: "carne",
              in: "path",
              required: true,
              description: "Carné del estudiante",
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Estudiante obtenido correctamente",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Usuario" },
                },
              },
            },
            404: { description: "Estudiante no encontrado por carné" },
            500: { description: "Error al buscar el estudiante" },
          },
        },
        put: {
          tags: ["Usuario"],
          summary: "Actualiza un usuario",
          parameters: [
            {
              name: "carne",
              in: "path",
              required: true,
              description: "Carné del estudiante",
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Usuario" },
              },
            },
          },
          responses: {
            200: { description: "Usuario actualizado exitosamente" },
            404: { description: "Estudiante no encontrado" },
            500: { description: "Error al actualizar el estudiante" },
          },
        },
      },

      // Rutas de Usuario Moroso
      "/api/usuario_moroso": {
        get: {
          tags: ["Usuario Moroso"],
          summary: "Obtiene todos los usuarios morosos",
          responses: {
            200: {
              description: "Lista de usuarios morosos obtenida correctamente",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/UsuarioMoroso" },
                  },
                },
              },
            },
            500: { description: "Error al obtener los usuarios morosos" },
          },
        },
        post: {
          tags: ["Usuario Moroso"],
          summary: "Crea un nuevo registro de usuario moroso",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UsuarioMoroso" },
                example: {
                  LR_CARNE: "5190-23-202034",
                  MOR_MOTIVO: "Pago atrasado",
                  MOR_ESTADO_MOROSO: "A",
                  MOR_ESTADO_REGISTRO: "A",
                },
              },
            },
          },
          responses: {
            201: {
              description: "Registro de usuario moroso creado exitosamente",
            },
            400: {
              description: "Faltan campos obligatorios o el formato es incorrecto",
            },
            500: {
              description: "Error al crear el registro de usuario moroso",
            },
          },
        },
      },

      "/api/usuario_moroso/carne/{carne}": {
        get: {
          tags: ["Usuario Moroso"],
          summary: "Obtiene los registros morosos de un usuario por carné",
          parameters: [
            {
              name: "carne",
              in: "path",
              required: true,
              description: "Carné del usuario",
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Registros morosos obtenidos correctamente",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/UsuarioMoroso" },
                  },
                },
              },
            },
            400: { description: "Formato de carné inválido" },
            500: { description: "Error al buscar registros morosos" },
          },
        },
      },

      "/api/usuario_moroso/{MOR_USUARIO_MOROSO}": {
        put: {
          tags: ["Usuario Moroso"],
          summary: "Actualiza un registro de usuario moroso",
          parameters: [
            {
              name: "MOR_USUARIO_MOROSO",
              in: "path",
              required: true,
              description: "ID del registro de usuario moroso",
              schema: { type: "integer", format: "int64" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    MOR_MOTIVO: { type: "string", maxLength: 100 },
                    MOR_MODIFICADO_POR: { type: "string", maxLength: 50 },
                    MOR_ESTADO_MOROSO: {
                      type: "string",
                      maxLength: 1,
                      enum: ["A", "I", "S"],
                    },
                    MOR_ESTADO_REGISTRO: {
                      type: "string",
                      maxLength: 1,
                      enum: ["A", "I", "S"],
                    },
                  },
                  example: {
                    MOR_MOTIVO: "Pago parcial recibido",
                    MOR_MODIFICADO_POR: "admin",
                    MOR_ESTADO_MOROSO: "A",
                    MOR_ESTADO_REGISTRO: "A",
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Registro moroso actualizado exitosamente" },
            400: { description: "Solicitud inválida o formato incorrecto" },
            404: {
              description: "Registro moroso no encontrado para actualizar",
            },
            500: { description: "Error al actualizar el registro moroso" },
          },
        },
      },

      // Rutas de Multas
      "/api/multa": {
        get: {
          tags: ["Multas"],
          summary: "Obtiene todas las multas",
          responses: {
            200: {
              description: "Lista de multas obtenida correctamente",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Multa" },
                  },
                },
              },
            },
            500: { description: "Error al obtener las multas" },
          },
        },
        post: {
          tags: ["Multas"],
          summary: "Crea una nueva multa",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Multa" },
              },
            },
          },
          responses: {
            201: { description: "Multa creada exitosamente" },
            400: { description: "El ID de la multa ya existe" },
            500: { description: "Error al crear la multa" },
          },
        },
      },

      // Rutas de Multas por ID
      "/api/multa/{id}": {
        get: {
          tags: ["Multas"],
          summary: "Obtiene una multa por ID",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "ID de la multa",
              schema: { type: "integer", format: "int64" },
            },
          ],
          responses: {
            200: {
              description: "Multa obtenida correctamente",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Multa" },
                },
              },
            },
            404: { description: "Multa no encontrada" },
            500: { description: "Error al obtener la multa" },
          },
        },
        put: {
          tags: ["Multas"],
          summary: "Actualiza una multa",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "ID de la multa",
              schema: { type: "integer", format: "int64" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Multa" },
              },
            },
          },
          responses: {
            200: { description: "Multa actualizada exitosamente" },
            404: { description: "Multa no encontrada para actualizar" },
            500: { description: "Error al actualizar la multa" },
          },
        },
      },
      // Rutas de Formas de Pago
      "/api/forma_pago": {
        get: {
          tags: ["Formas de Pago"],
          summary: "Obtiene todas las formas de pago",
          responses: {
            200: {
              description: "Lista de formas de pago obtenida correctamente",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/FormaPago" },
                  },
                },
              },
            },
            500: { description: "Error al obtener las formas de pago" },
          },
        },
        post: {
          tags: ["Formas de Pago"],
          summary: "Crea una nueva forma de pago",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/FormaPago" },
              },
            },
          },
          responses: {
            201: { description: "Forma de pago creada exitosamente" },
            400: { description: "El ID de forma de pago ya existe" },
            500: { description: "Error al crear la forma de pago" },
          },
        },
      },

      // Rutas de Formas de Pago por ID
      "/api/forma_pago/{id}": {
        get: {
          tags: ["Formas de Pago"],
          summary: "Obtiene una forma de pago por ID",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "ID de la forma de pago",
              schema: { type: "integer" },
            },
          ],
          responses: {
            200: { description: "Forma de pago obtenida correctamente" },
            404: { description: "Forma de pago no encontrada" },
            500: { description: "Error al obtener la forma de pago" },
          },
        },
        put: {
          tags: ["Formas de Pago"],
          summary: "Actualiza una forma de pago",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "ID de la forma de pago",
              schema: { type: "integer" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/FormaPago" },
              },
            },
          },
          responses: {
            200: { description: "Forma de pago actualizada exitosamente" },
            404: { description: "Forma de pago no encontrada para actualizar" },
            500: { description: "Error al actualizar la forma de pago" },
          },
        },
      },

      // Rutas de Pagos
      "/api/pago": {
        get: {
          tags: ["Pagos"],
          summary: "Obtiene todos los pagos",
          responses: {
            200: {
              description: "Lista de pagos",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Pago" },
                  },
                },
              },
            },
            500: { description: "Error al obtener los pagos" },
          },
        },
        post: {
          tags: ["Pagos"],
          summary: "Inicia un pago procesado por Stripe",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Pago" },
              },
            },
          },
          responses: {
            201: {
              description: "Pago iniciado exitosamente en estado Pendiente",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Pago iniciado exitosamente",
                      },
                      data: { $ref: "#/components/schemas/Pago" },
                      clientSecret: {
                        type: "string",
                        description:
                          "Llave cliente de Stripe para procesar el pago visiblemente",
                        example: "pi_3MtwBwLkdIwHu7ix28a3tqPc_secret_...",
                      },
                    },
                  },
                },
              },
            },
            400: { description: "Faltan campos obligatorios" },
            500: { description: "Error al crear el pago local o en Stripe" },
          },
        },
      },

      // Ruta Pago por Payment ID de Stripe

      "/api/pago/verify/{pi}": {
        get: {
          tags: ["Pagos"],
          summary: "Verifica el estado de un pago por su Payment ID de Stripe",
          parameters: [
            {
              name: "pi",
              in: "path",
              required: true,
              description: "Payment ID de Stripe",
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Pago verificado exitosamente",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Pago verificado exitosamente",
                      },
                      data: { $ref: "#/components/schemas/Pago" },
                    },
                  },
                },
              },
            },
            404: { description: "Pago no encontrado" },
            500: { description: "Error al verificar el pago" },
          },
        },
      },

      // Webhook Stripe
      "/api/webhook": {
        post: {
          tags: ["Pagos"],
          summary: "Recibe eventos de notificación asíncrona de Stripe",
          description:
            "No llamar a este endpoint desde la interfaz web, está destinado a uso del Backend de Stripe.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  description: "Firma Raw del evento de Stripe",
                },
              },
            },
          },
          responses: {
            200: { description: "Evento manejado con éxito" },
            400: { description: "Firma (signature) inválida" },
            500: { description: "Error procesando webhook" },
          },
        },
      },

      // Rutas de Pagos por ID
      "/api/pago/{id}": {
        get: {
          tags: ["Pagos"],
          summary: "Obtiene un pago por ID",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "ID del pago",
              schema: { type: "integer" },
            },
          ],
          responses: {
            200: {
              description: "Pago obtenido correctamente",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Pago" },
                },
              },
            },
            404: { description: "Pago no encontrado" },
            500: { description: "Error al obtener el pago" },
          },
        },
        put: {
          tags: ["Pagos"],
          summary: "Actualiza un pago",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "ID del pago",
              schema: { type: "integer" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Pago" },
              },
            },
          },
          responses: {
            200: { description: "Pago actualizado exitosamente" },
            404: { description: "Pago no encontrado para actualizar" },
            500: { description: "Error al actualizar el pago" },
          },
        },
      },

      // Rutas de Usuario Multa
      "/api/usuario_multa": {
        get: {
          tags: ["Usuario Multa"],
          summary: "Obtiene todos los registros de usuario-multa",
          responses: {
            200: {
              description: "Lista de registros de usuario-multa obtenida correctamente",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/UsuarioMulta" },
                  },
                },
              },
            },
            500: { description: "Error al obtener los registros de usuario-multa" },
          },
        },
        post: {
          tags: ["Usuario Multa"],
          summary: "Crea un nuevo registro de usuario-multa",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["MUL_MULTA", "VEH_ID_VEHICULO", "EMU_ESTADO_MULTA"],
                  properties: {
                    MUL_MULTA: {
                      type: "integer",
                      format: "int64",
                      description: "ID de la multa (FK a CB_MULTA)",
                    },
                    VEH_ID_VEHICULO: {
                      type: "string",
                      maxLength: 15,
                      description: "Identificador del vehículo (FK a CB_VEHICULO)",
                    },
                    EMU_ESTADO_MULTA: {
                      type: "string",
                      maxLength: 1,
                      enum: ["A", "P", "C"],
                      description: "Estado de la multa (A=Activa, P=Pendiente, C=Cancelada)",
                    },
                    EMU_CREADO_POR: {
                      type: "string",
                      maxLength: 50,
                      description: "Usuario que crea el registro (por defecto: ADMIN)",
                    },
                  },
                  example: {
                    MUL_MULTA: 1,
                    VEH_ID_VEHICULO: "P-123ABC",
                    EMU_ESTADO_MULTA: "A",
                    EMU_CREADO_POR: "ADMIN",
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description:
                "Registro de usuario-multa creado exitosamente. EMU_FECHA_CREACION y EMU_ESTADO_REGISTRO se asignan automáticamente.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/UsuarioMulta" },
                },
              },
            },
            400: { description: "Faltan campos obligatorios o EMU_ESTADO_MULTA inválido" },
            500: { description: "Error al crear el registro de usuario-multa" },
          },
        },
      },

      // Rutas de Usuario Multa por ID
      "/api/usuario_multa/{EMU_USUARIO_MULTA}": {
        put: {
          tags: ["Usuario Multa"],
          summary: "Actualiza el estado de un registro de usuario-multa",
          parameters: [
            {
              name: "EMU_USUARIO_MULTA",
              in: "path",
              required: true,
              description: "ID del registro de usuario-multa",
              schema: { type: "integer", format: "int64" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["EMU_MODIFICADO_POR"],
                  properties: {
                    EMU_ESTADO_MULTA: {
                      type: "string",
                      maxLength: 1,
                      enum: ["A", "P", "C"],
                      description: "Nuevo estado de la multa (A=Activa, P=Pendiente, C=Cancelada)",
                    },
                    EMU_MODIFICADO_POR: {
                      type: "string",
                      maxLength: 50,
                      description: "Usuario que realiza la modificación",
                    },
                    EMU_ESTADO_REGISTRO: {
                      type: "string",
                      maxLength: 1,
                      enum: ["A", "I"],
                      description: "Estado del registro (A=Activo, I=Inactivo)",
                    },
                  },
                  example: {
                    EMU_ESTADO_MULTA: "C",
                    EMU_MODIFICADO_POR: "admin",
                    EMU_ESTADO_REGISTRO: "A",
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Registro de usuario-multa actualizado correctamente" },
            400: { description: "Campos requeridos faltantes o EMU_ESTADO_MULTA inválido" },
            404: { description: "Registro de usuario-multa no encontrado para actualizar" },
            500: { description: "Error al actualizar el registro" },
          },
        },
      },

      // Ruta de Usuario Multa por Vehículo
      "/api/usuario_multa/vehiculo/{VEH_ID_VEHICULO}": {
        get: {
          tags: ["Usuario Multa"],
          summary: "Obtiene todas las multas asociadas a un vehículo",
          parameters: [
            {
              name: "VEH_ID_VEHICULO",
              in: "path",
              required: true,
              description: "Identificador del vehículo",
              schema: { type: "string", maxLength: 15 },
            },
          ],
          responses: {
            200: {
              description: "Lista de multas del vehículo obtenida correctamente",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/UsuarioMulta" },
                  },
                },
              },
            },
            404: { description: "No se encontraron multas para el vehículo indicado" },
            500: { description: "Error al obtener los registros por vehículo" },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
