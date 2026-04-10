const PagoStore = require("../store/pago.store");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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

// Obtener pago por ID
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

// Crear pago
exports.createPago = async (req, res) => {
  try {
    // VALIDACIONES
    const {
      PAG_PAGO,
      EST_CARNE,
      PLN_PLAN,
      FPG_FORMA_PAGO,
      PAG_FECHA_PAGO,
      PAG_MONTO_TOTAL,
      PAG_ESTADO,
      PAG_FECHA_CREACION,
      STRIPE_PAYMENT_INTENT_ID,
    } = req.body;

    // Validación 1: campos obligatorios (STRIPE y ESTADO ya no son requeridos en el body del frontend)
    if (
      !PAG_PAGO ||
      !EST_CARNE ||
      !PLN_PLAN ||
      !FPG_FORMA_PAGO ||
      !PAG_FECHA_PAGO ||
      !PAG_MONTO_TOTAL
    ) {
      return res.status(400).json({
        message: "Faltan campos obligatorios",
      });
    }

    // Validación 2: monto mayor a 0
    if (PAG_MONTO_TOTAL <= 0) {
      return res.status(400).json({
        message: "El monto pagado debe ser mayor a 0",
      });
    }

    // 1. Crear el Payment Intent en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(PAG_MONTO_TOTAL * 100), // Stripe usa centavos
      currency: "GTQ",
      metadata: {
        PAG_PAGO: PAG_PAGO.toString(),
        EST_CARNE: EST_CARNE.toString(),
      },
    });

    // 2. Llenar los datos automáticos a insertar
    req.body.STRIPE_PAYMENT_INTENT_ID = paymentIntent.id;
    req.body.PAG_ESTADO = "P"; // Pendiente ("P")
    req.body.PAG_FECHA_CREACION = new Date();

    // 3. Crear en base de datos
    const pago = await PagoStore.create(req.body);

    res.status(201).json({
      message: "Pago iniciado exitosamente",
      data: pago,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
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
        await PagoStore.update(pagoId, { PAG_ESTADO: "A" }); // Aceptado
        console.log(`Pago ${pagoId} actualizado a Aceptado (A)`);
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
