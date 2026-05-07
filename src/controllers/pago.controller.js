const PagoStore = require("../store/pago.store");
const PlanParqueoStore = require("../store/plan_parqueo.store");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const FormaPagoStore = require("../store/forma_pago.store");
const usuarioStore = require("../store/usuario.store");
const emailUtil = require("../utils/email.util");
const UsuarioMultaStore = require("../store/usuario_multa.store");
const MultaStore = require("../store/multa.store");

// Obtener todos los pagos
exports.getAllPagos = async (req, res) => {
  try {
    const pagos = await PagoStore.getAll();

    if (!pagos) {
      return res.status(404).json({
        message: "No se encontraron pagos",
      });
    }

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

    let pagoResponse = pago.toJSON ? pago.toJSON() : pago;

    if (pagoResponse.STRIPE_PAYMENT_INTENT_ID && pagoResponse.STRIPE_PAYMENT_INTENT_ID.startsWith('pi_')) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(pagoResponse.STRIPE_PAYMENT_INTENT_ID);
        if (paymentIntent && paymentIntent.metadata) {
          pagoResponse.metadatos = paymentIntent.metadata;
        }
      } catch (stripeErr) {
        console.log("Error al obtener metadata de Stripe", stripeErr.message);
      }
    }

    res.status(200).json(pagoResponse);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener el pago",
      error: error.message,
    });
  }
};

// Obtener pagos por carné (solo el suyo o si es ADMINISTRADOR)
exports.getPagosByCarne = async (req, res) => {
  try {
    const pagos = await PagoStore.getByCarne(req.params.carne);

    if (!pagos || pagos.length === 0) {
      return res.status(404).json({
        message: "No se encontraron pagos para este usuario",
      });
    }

    res.status(200).json(pagos);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los pagos",
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
      metadata: paymentIntent.metadata,
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
    // 1. EXTRAER CARNÉ DEL TOKEN JWT POR SEGURIDAD
    // Si es ADMIN y quiere pagar por otro, permitimos que mande el LR_CARNE en el body, sino usamos el suyo.
    let LR_CARNE = req.user.carne;
    if (req.user.rol === "ADMININISTRADOR" && req.body.LR_CARNE) {
      LR_CARNE = req.body.LR_CARNE;
    }
    
    // Lo guardamos de vuelta en el body por si otras funciones lo necesitan
    req.body.LR_CARNE = LR_CARNE;

    const {
      PLN_PLAN,
      FPG_FORMA_PAGO,
    } = req.body;

    // Validación 1: campos obligatorios
    if (!LR_CARNE || !FPG_FORMA_PAGO || !PLN_PLAN) {
      return res.status(400).json({
        message: "Faltan campos obligatorios (Plan y Forma de Pago)",
      });
    }

    // 2. VALIDACIÓN CONTRA LA BASE DE DATOS COMPARTIDA
    const usuario = await usuarioStore.getByCarne(LR_CARNE);
    if (!usuario) {
      return res.status(404).json({
        message: "El usuario autenticado no existe en la base de datos compartida",
      });
    }

    // 3. Obtener datos para Stripe (priorizando lo de la BD compartida)
    const nombreEstudiante = usuario.LR_NOMBRES;
    const apellidosEstudiante = usuario.LR_APELLIDOS;
    const correoEstudiante = usuario.LR_CORREO_INSTITUCIONAL;

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
    
    // Valida que la forma de pago sea tarjeta de debito o credito, si la forma de pago no tiene la palabra Tarjeta insertar en Stripe
    if (!formaPago.FPG_NOMBRE_FORMA.includes("Tarjeta")){
      return res.status(400).json({
        message: "Forma de pago no valida",
      });
    }

    // Stripe solo acepta strings en metadata; convertir todos los valores
    const metadatos = {
      LR_NOMBRES: (nombreEstudiante ?? "").toString(),
      LR_APELLIDOS: (apellidosEstudiante ?? "").toString(),
      LR_CORREO_INSTITUCIONAL: (correoEstudiante ?? "").toString(),
      PLN_NOMBRE_PLAN: (plan.PLN_NOMBRE_PLAN ?? "").toString(),
      FPG_NOMBRE_FORMA: (formaPago.FPG_NOMBRE_FORMA ?? "").toString(),
      PAG_MONTO_TOTAL: PAG_MONTO_TOTAL.toString(),
    };

    if (req.body.EMU_USUARIO_MULTA) {
      const usuarioMulta = await UsuarioMultaStore.getById(req.body.EMU_USUARIO_MULTA);
      if (usuarioMulta) {
        metadatos.MUL_PLACAS = (usuarioMulta.VEH_ID_VEHICULO ?? "").toString();
        const multa = await MultaStore.getById(usuarioMulta.MUL_MULTA);
        if (multa) {
          metadatos.MUL_DESCRIPCION = (multa.MUL_DESCRIPCION ?? "").toString();
        }
      }
    }

    // 3. Crear el Payment Intent en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(PAG_MONTO_TOTAL * 100), // Stripe usa centavos
      currency: "GTQ",
      metadata: {
        PAG_PAGO: pago.PAG_PAGO.toString(),
        LR_CARNE: LR_CARNE.toString(),
        ...metadatos, // todos los valores ya son strings
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
        const carnetStripe = paymentIntent.metadata.LR_CARNE;
        if (carnetStripe) {
          const estud = await usuarioStore.getByCarne(carnetStripe);
          if (estud && estud.LR_CORREO_INSTITUCIONAL) {
            await emailUtil.enviarCorreoPago(
              estud.LR_CORREO_INSTITUCIONAL,
              estud.LR_CARNE,
              estud.LR_NOMBRES + " " + estud.LR_APELLIDOS,
              paymentIntent.metadata.PLN_NOMBRE_PLAN,
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
