const PagoStore = require("../store/pago.store");
const PlanParqueoStore = require("../store/plan_parqueo.store");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const FormaPagoStore = require("../store/forma_pago.store");
const EstudianteStore = require("../store/estudiante.store");
const emailUtil = require("../utils/email.util");

// Obtener todos los pagos
exports.getAllPagos = async (req, res) => {
  try {
    const pagos = await PagoStore.getAll();
    res.status(200).json(pagos);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los pagos",
      error: error.message,
    });
  }
};

// Obtener pago por ID de
exports.getPagoById = async (req, res) => {
  try {
    const pago = await PagoStore.getById(req.params.id);

    if (!pago) {
      return res.status(404).json({
        message: "Pago no encontrado",
      });
    }

    res.status(200).json(pago);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener el pago",
      error: error.message,
    });
  }
};

// Verificar el estado de un pago en Stripe mediante su PI
// GET /api/pagos/verify/:pi - Para que disponibilidad verifique si el pago.
exports.verifyPayment = async (req, res) => {
  try {
    const { pi } = req.params;

    if (!pi || !pi.startsWith("pi_")) {
      return res.status(400).json({
        message: `Se requiere un ID de pago de Stripe válido (empieza con pi_). Valor recibido: "${pi}"`,
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(pi);

    if (!paymentIntent) {
      return res.status(404).json({
        message: "Intento de pago no encontrado en Stripe",
      });
    }

    res.status(200).json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      created: paymentIntent.created,
      metadata: paymentIntent.metadata,
      amount_received: paymentIntent.amount_received,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error al verificar el estado del pago",
      error: error.message,
    });
  }
};

// Crear pago
exports.createPago = async (req, res) => {
  try {
    // VALIDACIONES
    const {
      EST_CARNE,
      EST_NOMBRE_COMPLETO,
      EST_EMAIL,
      PLN_PLAN,
      FPG_FORMA_PAGO,
    } = req.body;

    // Validación 1: campos obligatorios
    if (!EST_CARNE || !PLN_PLAN || !FPG_FORMA_PAGO) {
      return res.status(400).json({
        message: "Faltan campos obligatorios",
      });
    }

    // Upsert (Crear o Actualizar) Estudiante localmente
    const estudianteExistente = await EstudianteStore.getByCarne(EST_CARNE);
    let nombreEstudiante = EST_NOMBRE_COMPLETO || "Estudiante";

    if (estudianteExistente) {
      // Usar los valores recibidos o los que ya estaban
      nombreEstudiante =
        EST_NOMBRE_COMPLETO || estudianteExistente.EST_NOMBRE_COMPLETO;
      const correoEstudiante = EST_EMAIL || estudianteExistente.EST_EMAIL;

      // Actualizar si mandaron datos nuevos
      if (EST_NOMBRE_COMPLETO || EST_EMAIL) {
        await EstudianteStore.update(EST_CARNE, {
          EST_NOMBRE_COMPLETO: nombreEstudiante,
          EST_EMAIL: correoEstudiante,
        });
      }
    } else {
      // Si no existe lo creamos obligatorio
      if (!EST_NOMBRE_COMPLETO || !EST_EMAIL) {
        return res.status(400).json({
          message:
            "Para estudiantes nuevos, es obligatorio enviar EST_NOMBRE_COMPLETO y EST_EMAIL",
        });
      }
      await EstudianteStore.create({
        EST_CARNE,
        EST_NOMBRE_COMPLETO,
        EST_EMAIL,
        EST_FECHA_CREACION: new Date(),
      });
    }

    // Obtener el precio del plan automáticamente
    const plan = await PlanParqueoStore.getById(PLN_PLAN);
    if (!plan) {
      return res.status(404).json({
        message: "Plan de parqueo no encontrado",
      });
    }
    const PAG_MONTO_TOTAL = plan.PLN_PRECIO;
    req.body.PAG_MONTO_TOTAL = PAG_MONTO_TOTAL;
    // Validación 2: monto mayor a 0
    if (PAG_MONTO_TOTAL <= 0) {
      return res.status(400).json({
        message: "El monto pagado debe ser mayor a 0",
      });
    }

    // 1. Llenar los datos automáticos a insertar
    req.body.PAG_ESTADO = "P"; // Pendiente ("P")
    req.body.PAG_FECHA_CREACION = new Date();
    req.body.PAG_FECHA_PAGO = new Date(); // Fecha temporal para poder insertar en BD, se actualizará luego
    req.body.STRIPE_PAYMENT_INTENT_ID = "P"; // Se actualizará luego con el ID de Stripe

    // 2. Crear en base de datos para obtener el ID autogenerado
    const pago = await PagoStore.create(req.body);

    // Obtener Metadatos para enviar a Stripe de otras tablas
    // Obtener Metadatos para enviar a Stripe de otras tablas
    const formaPago = await FormaPagoStore.getById(FPG_FORMA_PAGO);

    const metadatos = {
      EST_NOMBRE_COMPLETO: nombreEstudiante,
      PLN_NAME: plan.PLN_NAME,
      FPG_DESCRIPCION: formaPago.FPG_DESCRIPCION,
    };

    // 3. Crear el Payment Intent en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(PAG_MONTO_TOTAL * 100), // Stripe usa centavos
      currency: "GTQ",
      metadata: {
        PAG_PAGO: pago.PAG_PAGO.toString(),
        EST_CARNE: EST_CARNE.toString(),
        ...metadatos,
      },
    });

    // 4. Actualizar el registro con el ID del Payment Intent
    await PagoStore.update(pago.PAG_PAGO, {
      STRIPE_PAYMENT_INTENT_ID: paymentIntent.id,
    });

    // Actualizamos el objeto local para la respuesta
    pago.STRIPE_PAYMENT_INTENT_ID = paymentIntent.id;

    res.status(201).json({
      message: "Pago iniciado exitosamente",
      data: pago,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error al crear el pago",
      error: error.message,
    });
  }
};

// Actualizar pago
exports.updatePago = async (req, res) => {
  try {
    // VALIDACIÓN
    const { PAG_MONTO_TOTAL } = req.body;

    if (PAG_MONTO_TOTAL !== undefined && PAG_MONTO_TOTAL <= 0) {
      return res.status(400).json({
        message: "El monto pagado debe ser mayor a 0",
      });
    }
    const rowsAffected = await PagoStore.update(req.params.id, req.body);

    if (rowsAffected[0] === 0) {
      return res.status(404).json({
        message: "Pago no encontrado para actualizar",
      });
    }

    res.status(200).json({
      message: "Pago actualizado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el pago",
      error: error.message,
    });
  }
};

// Eliminar pago
exports.deletePago = async (req, res) => {
  try {
    const rowsDeleted = await PagoStore.delete(req.params.id);

    if (rowsDeleted === 0) {
      return res.status(404).json({
        message: "Pago no encontrado para eliminar",
      });
    }

    res.status(200).json({
      message: "Pago eliminado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar el pago",
      error: error.message,
    });
  }
};

// Webhook de Stripe para confirmar el pago asíncronamente
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(" Error Webhook Stripe:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar el evento
  try {
    const paymentIntent = event.data.object;
    if (!paymentIntent.metadata || !paymentIntent.metadata.PAG_PAGO) {
      console.log("No hay metadata asociada al payment intent, ignorando.");
      return res.send();
    }

    const pagoId = paymentIntent.metadata.PAG_PAGO;

    switch (event.type) {
      case "payment_intent.succeeded":
        // La fecha de pago se actualizará cuando stripe confirme el pago
        const PAG_FECHA_PAGO = new Date(paymentIntent.created * 1000);
        await PagoStore.update(pagoId, { PAG_ESTADO: "A", PAG_FECHA_PAGO }); // Aceptado y Fecha del cobro
        console.log(
          `Pago ${pagoId} actualizado a Aceptado (A) y fecha actualizada`,
        );

        // Enviar correo electrónico
        const carnetStripe = paymentIntent.metadata.EST_CARNE;
        if (carnetStripe) {
          const estud = await EstudianteStore.getByCarne(carnetStripe);
          if (estud && estud.EST_EMAIL) {
            await emailUtil.enviarCorreoPago(
              estud.EST_EMAIL,
              estud.EST_CARNE,
              estud.EST_NOMBRE_COMPLETO,
              paymentIntent.metadata.PLN_NAME || "Plan UMG",
              paymentIntent.amount / 100, // Stripe devuelve el monto en centavos
              paymentIntent.id,
            );
          }
        }
        break;

      case "payment_intent.payment_failed":
        await PagoStore.update(pagoId, { PAG_ESTADO: "C" }); // Cancelado
        console.log(`Pago ${pagoId} actualizado a Cancelado (C)`);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.send();
  } catch (error) {
    console.error("Error al actualizar la BD desde el Webhook:", error);
    res.status(500).send("Error interno en el Webhook");
  }
};
