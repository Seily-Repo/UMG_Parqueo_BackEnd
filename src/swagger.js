const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "UMG Sistema de Cobros API",
      version: "1.0.0",
      description: "API REST para gestión de cobros a estudiantes",
    },
    servers: [{ url: "http://localhost:3000", description: "Servidor local" }],

    // Componentes
    components: {
      schemas: {
        // PlanParqueo
        PlanParqueo: {
          type: "object",
          required: [
            "PLA_id_plan_parqueo",
            "PLA_nombre",
            "PLA_precio",
            "PLA_creado_por",
          ],
          properties: {
            PLA_id_plan_parqueo: {
              type: "integer",
              description: "ID del plan de parqueo",
            },

            PLA_nombre: {
              type: "string",
              description: "Nombre del plan",
            },

            PLA_precio: {
              type: "number",
              format: "decimal",
              description: "Precio del plan",
            },

            PLA_descripcion: {
              type: "string",
              description: "Descripción del plan",
            },

            PLA_creado_por: {
              type: "string",
              description: "Usuario que creó el plan",
            },

            PLA_fecha_creacion: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación",
            },
          },

          example: {
            PLA_id_plan_parqueo: 1,
            PLA_nombre: "Plan Mensual",
            PLA_precio: 150.0,
            PLA_descripcion: "Plan mensual de parqueo",
            PLA_creado_por: "admin",
            PLA_fecha_creacion: "2024-01-01T10:00:00Z",
          },
        },
        // Estudiante
        Estudiante: {
          type: "object",
          required: [
            "EST_CARNE",
            "EST_NOMBRE_COMPLETO",
            "EST_EMAIL",
            "EST_FECHA_CREACION",
          ],
          properties: {
            EST_CARNE: {
              type: "string",
              description: "Carné del estudiante (único)",
            },
            EST_NOMBRE_COMPLETO: {
              type: "string",
              description: "Nombre completo del estudiante",
            },
            EST_EMAIL: {
              type: "string",
              description: "Correo electrónico del estudiante",
            },
            EST_FECHA_CREACION: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación del estudiante",
            },
          },
          example: {
            EST_CARNE: "51902310007",
            EST_NOMBRE_COMPLETO: "Juan Pérez García",
            EST_EMAIL: "jperez@miumg.edu.gt",
            EST_FECHA_CREACION: "2024-01-01T10:00:00Z",
          },
        },
        // Multa
        Multa: {
          type: "object",
          required: [
            "MUL_id_multa",
            "MUL_monto_total",
            "MUL_monto_base",
            "MUL_impuesto",
            "MUL_descripcion",
            "MUL_fecha",
            "MUL_fecha_vencimiento",
            "MUL_creado_por",
          ],
          properties: {
            MUL_id_multa: {
              type: "integer",
              format: "int64",
              description: "ID único de la multa",
            },
            MUL_monto_total: {
              type: "number",
              format: "decimal",
              description: "Monto total de la multa",
            },
            MUL_monto_base: {
              type: "number",
              format: "decimal",
              description: "Monto base de la multa",
            },
            MUL_impuesto: {
              type: "number",
              format: "decimal",
              description: "Impuesto aplicado a la multa",
            },
            MUL_descripcion: {
              type: "string",
              maxLength: 100,
              description: "Descripción de la multa",
            },
            MUL_fecha: {
              type: "string",
              format: "date-time",
              description: "Fecha de la multa",
            },
            MUL_fecha_vencimiento: {
              type: "string",
              format: "date",
              description: "Fecha de vencimiento de la multa",
            },
            MUL_creado_por: {
              type: "string",
              maxLength: 50,
              description: "Usuario que creó la multa",
            },
            MUL_fecha_creacion: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación de la multa",
            },
            MUL_modificado_por: {
              type: "string",
              maxLength: 50,
              description: "Usuario que modificó la multa",
            },
            MUL_fecha_modificacion: {
              type: "string",
              format: "date-time",
              description: "Fecha de modificación de la multa",
            },
          },
          example: {
            MUL_id_multa: 1,
            MUL_monto_total: 150.0,
            MUL_monto_base: 120.0,
            MUL_impuesto: 30.0,
            MUL_descripcion: "Multa por estacionamiento indebido",
            MUL_fecha: "2023-10-01T10:00:00Z",
            MUL_fecha_vencimiento: "2023-10-15",
            MUL_creado_por: "admin",
            MUL_fecha_creacion: "2023-10-01T10:00:00Z",
          },
        },
        // EstudianteMulta
        EstudianteMulta: {
          type: "object",
          required: [
            "EMU_ID_EST_MULTA",
            "MUL_ID_MULTA",
            "EST_CARNE",
            "EMU_CREADO_POR",
          ],
          properties: {
            EMU_ID_EST_MULTA: {
              type: "integer",
              format: "int64",
              description: "ID único del registro de estudiante-multa",
            },
            MUL_ID_MULTA: {
              type: "integer",
              format: "int64",
              description: "ID de la multa",
            },
            EST_CARNE: {
              type: "integer",
              format: "int64",
              description: "Carné del estudiante",
            },
            EMU_ESTADO_MULTA: {
              type: "string",
              maxLength: 10,
              description:
                "Estado de la multa para el estudiante (Ej: Activa, Anulada, Pagada)",
            },
            EMU_CREADO_POR: {
              type: "string",
              maxLength: 50,
              description: "Usuario que creó el registro de estudiante-multa",
            },
            EMU_FECHA_CREACION: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación del registro",
            },
            EMU_MODIFICADO_POR: {
              type: "string",
              maxLength: 50,
              description: "Usuario que modificó el registro",
            },
            EMU_FECHA_MODIFICACION: {
              type: "string",
              format: "date-time",
              description: "Fecha de última modificación del registro",
            },
          },
          example: {
            EMU_ID_EST_MULTA: 10,
            MUL_ID_MULTA: 1,
            EST_CARNE: 51902321585,
            EMU_ESTADO_MULTA: "Activa",
            EMU_CREADO_POR: "Daniel",
            EMU_FECHA_CREACION: "2023-10-01T10:00:00Z",
            EMU_MODIFICADO_POR: "Luis",
            EMU_FECHA_MODIFICACION: "2023-10-05T15:30:00Z",
          },
        },
        // FormaPago
        FormaPago: {
          type: "object",
          required: ["FPG_id_forma_pago", "FPG_nombre_forma", "FPG_estado"],
          properties: {
            FPG_id_forma_pago: {
              type: "integer",
              description: "ID único de la forma de pago",
            },
            FPG_nombre_forma: {
              type: "string",
              maxLength: 50,
              description: "Nombre de la forma de pago",
            },
            FPG_estado: {
              type: "string",
              maxLength: 1,
              description: "Estado de la forma de pago (A=Activo, I=Inactivo)",
            },
          },
          example: {
            FPG_id_forma_pago: 1,
            FPG_nombre_forma: "Efectivo",
            FPG_estado: "A",
          },
        },
        // Pago
        Pago: {
          type: "object",
          required: [
            "PAG_PAGO",
            "EST_CARNE",
            "PLN_PLAN",
            "FPG_FORMA_PAGO",
            "MUL_MULTA",
            "PAG_FECHA_PAGO",
            "PAG_MONTO_TOTAL",
            "PAG_ESTADO",
            "PAG_FECHA_CREACION",
            "STRIPE_PAYMENT_INTENT_ID",
          ],
          properties: {
            PAG_PAGO: {
              type: "integer",
              description: "ID único del pago",
            },
            EST_CARNE: {
              type: "integer",
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
            MUL_MULTA: {
              type: "integer",
              description: "ID de la multa",
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
              type: "integer",
              description: "Estado del pago",
            },
            PAG_FECHA_CREACION: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación del pago",
            },
            STRIPE_PAYMENT_INTENT_ID: {
              type: "string",
              description: "ID de la transacción de Stripe",
            },
          },
          example: {
            PAG_PAGO: 1,
            EST_CARNE: "51902310027",
            PLN_PLAN: 1,
            FPG_FORMA_PAGO: 1,
            MUL_MULTA: null,
            PAG_FECHA_PAGO: "2024-03-01T10:00:00Z",
            PAG_MONTO_TOTAL: 250.0,
            PAG_ESTADO: "Pendiente",
            PAG_FECHA_CREACION: "2024-03-01T10:00:00Z",
            STRIPE_PAYMENT_INTENT_ID: "pi_123456789",
          },
        },
      },
    },

    paths: {
      // Rutas de Plan Parqueo
      "/api/plan-parqueo": {
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
          },
        },
      },

      // Rutas de Plan Parqueo por ID
      "/api/plan-parqueo/{id}": {
        get: {
          tags: ["Plan Parqueo"],
          summary: "Obtiene un plan por ID",
          parameters: [
            {
              name: "id",
              in: "path",
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
          },
        },
        put: {
          tags: ["Plan Parqueo"],
          summary: "Actualiza un plan",
          parameters: [
            {
              name: "id",
              in: "path",
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
              description: "Plan actualizado",
            },
          },
        },
        delete: {
          tags: ["Plan Parqueo"],
          summary: "Elimina un plan",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: {
                type: "integer",
              },
            },
          ],
          responses: {
            200: {
              description: "Plan eliminado",
            },
          },
        },
      },

      // Rutas de Estudiantes
      "/api/estudiantes": {
        get: {
          tags: ["Estudiantes"],
          summary: "Obtiene todos los estudiantes",
          responses: {
            200: {
              description: "Lista de estudiantes obtenida correctamente",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Estudiante" },
                  },
                },
              },
            },
            500: { description: "Error al obtener los estudiantes" },
          },
        },
        post: {
          tags: ["Estudiantes"],
          summary: "Crea un nuevo estudiante",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Estudiante" },
              },
            },
          },
          responses: {
            201: { description: "Estudiante creado exitosamente" },
            400: { description: "La carné del estudiante ya existe" },
            500: { description: "Error al crear el estudiante" },
          },
        },
      },
      // Rutas de Estudiantes por Carne
      "/api/estudiantes/carne/{carne}": {
        get: {
          tags: ["Estudiantes"],
          summary: "Obtiene un estudiante por carné",
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
                  schema: { $ref: "#/components/schemas/Estudiante" },
                },
              },
            },
            404: { description: "Estudiante no encontrado por carné" },
            500: { description: "Error al buscar el estudiante" },
          },
        },
        put: {
          tags: ["Estudiantes"],
          summary: "Actualiza un estudiante",
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
                schema: { $ref: "#/components/schemas/Estudiante" },
              },
            },
          },
          responses: {
            200: { description: "Estudiante actualizado exitosamente" },
            404: { description: "Estudiante no encontrado" },
            500: { description: "Error al actualizar el estudiante" },
          },
        },
        delete: {
          tags: ["Estudiantes"],
          summary: "Elimina un estudiante",
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
            200: { description: "Estudiante eliminado exitosamente" },
            404: { description: "Estudiante no encontrado" },
            500: { description: "Error al eliminar el estudiante" },
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
            200: { description: "Multa eliminada exitosamente" },
            404: { description: "Multa no encontrada para eliminar" },
            500: { description: "Error al eliminar la multa" },
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
                  200: {
                    description: "Forma de pago obtenida correctamente",
                    content: {
                      "application/json": {
                        schema: { $ref: "#/components/schemas/FormaPago" },
                      },
                    },
                  },
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
                  200: {
                    description: "Forma de pago actualizada exitosamente",
                  },
                  404: {
                    description: "Forma de pago no encontrada para actualizar",
                  },
                  500: { description: "Error al actualizar la forma de pago" },
                },
              },
            },
            500: { description: "Error al obtener los pagos" },
          },
        },
        post: {
          tags: ["Pagos"],
          summary: "Crea un pago",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Pago" },
              },
            },
          },
          responses: {
            201: { description: "Pago creado exitosamente" },
            500: { description: "Error al crear el pago" },
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
        delete: {
          tags: ["Pagos"],
          summary: "Elimina un pago",
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
            200: { description: "Pago eliminado exitosamente" },
            404: { description: "Pago no encontrado para eliminar" },
            500: { description: "Error al eliminar el pago" },
          },
        },
      },

      // Rutas de Estudiante-Multa
      "/api/estudiante_multa": {
        get: {
          tags: ["Estudiante-Multa"],
          summary: "Obtiene todas las relaciones estudiante-multa",
          responses: {
            200: {
              description:
                "Lista de relaciones estudiante-multa obtenida correctamente",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/EstudianteMulta",
                    },
                  },
                },
              },
            },
            500: { description: "Error al obtener los registros" },
          },
        },
        post: {
          tags: ["Estudiante-Multa"],
          summary: "Crea una nueva relación estudiante-multa",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: [
                    "EMU_ID_EST_MULTA",
                    "MUL_ID_MULTA",
                    "EST_CARNE_ESTUDIANTE",
                    "EST_ID_ESTUDIANTE",
                    "EMU_CREADO_POR",
                  ],
                  properties: {
                    EMU_ID_EST_MULTA: {
                      type: "integer",
                      format: "int64",
                    },
                    MUL_ID_MULTA: { type: "integer", format: "int64" },
                    EST_CARNE_ESTUDIANTE: {
                      type: "integer",
                      format: "int64",
                    },
                    EST_ID_ESTUDIANTE: { type: "integer" },
                    EMU_CREADO_POR: { type: "string", maxLength: 50 },
                  },
                  example: {
                    EMU_ID_EST_MULTA: 10,
                    MUL_ID_MULTA: 1,
                    EST_CARNE_ESTUDIANTE: 51902321585,
                    EST_ID_ESTUDIANTE: 1001,
                    EMU_CREADO_POR: "Daniel",
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description:
                "Relación estudiante-multa creada exitosamente. EMU_FECHA_CREACION se asigna automáticamente. El estado se asigna automáticamente como Activa",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/EstudianteMulta",
                  },
                },
              },
            },
            400: { description: "Faltan campos obligatorios" },
            500: { description: "Error al crear el registro" },
          },
        },
      },

      // Rutas de Estudiante-Multa por Carne
      "/api/estudiante_multa/carne/{EST_CARNE_ESTUDIANTE}": {
        get: {
          tags: ["Estudiante-Multa"],
          summary: "Obtiene todas las multas de un estudiante por carné",
          parameters: [
            {
              name: "EST_CARNE_ESTUDIANTE",
              in: "path",
              required: true,
              description: "Carné del estudiante",
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description:
                "Lista de multas del estudiante obtenida correctamente",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/EstudianteMulta",
                    },
                  },
                },
              },
            },
            500: { description: "Error al obtener por carné" },
          },
        },
      },

      // Rutas de Estudiante-Multa por ID
      "/api/estudiante_multa/{EMU_ID_EST_MULTA}": {
        put: {
          tags: ["Estudiante-Multa"],
          summary: "Actualiza el estado de la multa por ID",
          parameters: [
            {
              name: "EMU_ID_EST_MULTA",
              in: "path",
              required: true,
              description: "ID del registro de estudiante-multa",
              schema: { type: "integer" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["EMU_ESTADO_MULTA", "EMU_MODIFICADO_POR"],
                  properties: {
                    EMU_ESTADO_MULTA: { type: "string", maxLength: 10 },
                    EMU_MODIFICADO_POR: { type: "string", maxLength: 50 },
                  },
                  example: {
                    EMU_ESTADO_MULTA: "Cancelada",
                    EMU_MODIFICADO_POR: "Luis",
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description:
                "Registro actualizado correctamente. La fecha de modificación se actualiza automáticamente",
            },
            404: { description: "Registro no encontrado" },
            400: { description: "Solicitud inválida o faltan campos" },
            500: { description: "Error al actualizar el registro" },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
