const PagoStore = require("../store/pago.store");
const PlanParqueoStore = require("../store/plan_parqueo.store");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const FormaPagoStore = require("../store/forma_pago.store");
const usuarioStore = require("../store/usuario.store");
const emailUtil = require("../utils/email.util");
const UsuarioMultaStore = require("../store/usuario_multa.store");
const MultaStore = require("../store/multa.store");

const PAG_ACEPTADO = "A";
const PAG_PENDIENTE = "P";
const PAG_CANCELADO = "C";
const EMU_MULTA_PAGADA = "C";

const normalizeCarne = (carne) =>
  carne ? String(carne).replace(/-/g, "") : null;

const usuarioPuedeVerPago = (req, pago) => {
  if (req.user.rol === "ADMINISTRADOR") return true;
  const carnePago = normalizeCarne(pago.LR_CARNE);
  return carnePago && carnePago === normalizeCarne(req.user.carne);
};

const toPagoJson = (pago) => (pago?.toJSON ? pago.toJSON() : pago);

const buildIdempotencyKey = (req, { LR_CARNE, EMU_USUARIO_MULTA, PLN_PLAN }) => {
  const headerKey = req.headers["idempotency-key"];
  if (headerKey && String(headerKey).trim()) {
    return String(headerKey).trim().slice(0, 255);
  }
  if (EMU_USUARIO_MULTA) {
    return `pago-multa-${EMU_USUARIO_MULTA}-${LR_CARNE}`.slice(0, 255);
  }
  return `pago-plan-${PLN_PLAN}-${LR_CARNE}`.slice(0, 255);
};

const sendPagoResponse = (
  res,
  statusCode,
  { message, data, clientSecret, reused = false },
) => {
  res.status(statusCode).json({
    message,
    data,
    clientSecret,
    reused,
  });
};

/**
 * Resuelve un pago activo existente: ya pagado, reutilizar PI pendiente, o invalidar cancelado.
 */
const resolveExistingActivePago = async (existingPago) => {
  const pago = toPagoJson(existingPago);

  if (pago.PAG_ESTADO === PAG_ACEPTADO) {
    return { action: "already_paid", pago };
  }

  const piId = pago.STRIPE_PAYMENT_INTENT_ID;

  if (!piId || piId === PAG_PENDIENTE) {
    return { action: "orphan_pending", pago };
  }

  if (!piId.startsWith("pi_")) {
    return { action: "orphan_pending", pago };
  }

  try {
    const pi = await stripe.paymentIntents.retrieve(piId);

    if (pi.status === "succeeded") {
      await PagoStore.update(pago.PAG_PAGO, { PAG_ESTADO: PAG_ACEPTADO });
      pago.PAG_ESTADO = PAG_ACEPTADO;
      return { action: "already_paid", pago };
    }

    if (pi.status === "canceled") {
      await PagoStore.update(pago.PAG_PAGO, { PAG_ESTADO: PAG_CANCELADO });
      return { action: "expired", pago: null };
    }

    return {
      action: "reuse",
      pago,
      clientSecret: pi.client_secret,
    };
  } catch (err) {
    console.log("No se pudo recuperar PI existente:", err.message);
    await PagoStore.update(pago.PAG_PAGO, { PAG_ESTADO: PAG_CANCELADO });
    return { action: "expired", pago: null };
  }
};

const createStripePaymentIntent = async ({
  amount,
  LR_CARNE,
  pagoId,
  metadatos,
  idempotencyKey,
}) => {
  return stripe.paymentIntents.create(
    {
      amount: Math.round(amount * 100),
      currency: "GTQ",
      metadata: {
        PAG_PAGO: pagoId.toString(),
        LR_CARNE: LR_CARNE.toString(),
        ...metadatos,
      },
    },
    { idempotencyKey },
  );
};

const attachPaymentIntentToPago = async (pago, paymentIntent) => {
  await PagoStore.update(pago.PAG_PAGO, {
    STRIPE_PAYMENT_INTENT_ID: paymentIntent.id,
  });
  const updated = toPagoJson(pago);
  updated.STRIPE_PAYMENT_INTENT_ID = paymentIntent.id;
  return updated;
};

const buildStripeMetadata = ({
  nombreEstudiante,
  apellidosEstudiante,
  correoEstudiante,
  formaPago,
  PAG_MONTO_TOTAL,
  plan,
  usuarioMulta,
  multa,
  EMU_USUARIO_MULTA,
}) => {
  const metadatos = {
    LR_NOMBRES: (nombreEstudiante ?? "").toString(),
    LR_APELLIDOS: (apellidosEstudiante ?? "").toString(),
    LR_CORREO_INSTITUCIONAL: (correoEstudiante ?? "").toString(),
    FPG_NOMBRE_FORMA: (formaPago.FPG_NOMBRE_FORMA ?? "").toString(),
    PAG_MONTO_TOTAL: PAG_MONTO_TOTAL.toString(),
  };

  if (plan) {
    metadatos.PLN_NOMBRE_PLAN = (plan.PLN_NOMBRE_PLAN ?? "").toString();
  }

  if (EMU_USUARIO_MULTA) {
    metadatos.EMU_USUARIO_MULTA = EMU_USUARIO_MULTA.toString();
    if (usuarioMulta) {
      metadatos.MUL_PLACAS = (usuarioMulta.VEH_ID_VEHICULO ?? "").toString();
    }
    if (multa) {
      metadatos.MUL_DESCRIPCION = (multa.MUL_DESCRIPCION ?? "").toString();
    }
  }

  return metadatos;
};

const marcarMultaComoPagada = async (emuUsuarioMulta) => {
  if (!emuUsuarioMulta) return;
  await UsuarioMultaStore.update(emuUsuarioMulta, {
    EMU_ESTADO_MULTA: EMU_MULTA_PAGADA,
    EMU_MODIFICADO_POR: "STRIPE_WEBHOOK",
  });
};

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

// Obtener pago por ID
exports.getPagoById = async (req, res) => {
  try {
    const pago = await PagoStore.getById(req.params.id);

    if (!pago) {
      return res.status(404).json({
        message: "Pago no encontrado",
      });
    }

    if (!usuarioPuedeVerPago(req, pago)) {
      return res.status(403).json({
        message:
          "Acceso denegado. Solo puedes consultar tus propios pagos.",
      });
    }

    let pagoResponse = toPagoJson(pago);

    if (pagoResponse.STRIPE_PAYMENT_INTENT_ID?.startsWith("pi_")) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          pagoResponse.STRIPE_PAYMENT_INTENT_ID,
        );
        if (paymentIntent?.metadata) {
          pagoResponse.metadatos = paymentIntent.metadata;
        }
        if (
          pagoResponse.PAG_ESTADO === PAG_PENDIENTE &&
          paymentIntent.client_secret
        ) {
          pagoResponse.clientSecret = paymentIntent.client_secret;
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

exports.getPagosByCarne = async (req, res) => {
  try {
    const carneNormalizado = req.params.carne
      ? req.params.carne.replace(/-/g, "")
      : null;
    const pagos = await PagoStore.getByCarne(carneNormalizado);

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

exports.createPago = async (req, res) => {
  try {
    let LR_CARNE = req.user.carne;
    if (req.user.rol === "ADMINISTRADOR" && req.body.LR_CARNE) {
      LR_CARNE = req.body.LR_CARNE;
    }

    if (LR_CARNE) {
      LR_CARNE = LR_CARNE.replace(/-/g, "");
    }

    req.body.LR_CARNE = LR_CARNE;

    const { PLN_PLAN, FPG_FORMA_PAGO, EMU_USUARIO_MULTA } = req.body;

    if (PLN_PLAN && EMU_USUARIO_MULTA) {
      return res.status(400).json({
        message:
          "No se puede pagar un plan y una multa al mismo tiempo. Proporcione solo uno.",
      });
    }

    if (!PLN_PLAN && !EMU_USUARIO_MULTA) {
      return res.status(400).json({
        message: "Debe proporcionar un PLN_PLAN o un EMU_USUARIO_MULTA.",
      });
    }

    if (!FPG_FORMA_PAGO) {
      return res.status(400).json({
        message: "La forma de pago (FPG_FORMA_PAGO) es obligatoria.",
      });
    }

    const formaPago = await FormaPagoStore.getById(FPG_FORMA_PAGO);
    if (!formaPago?.FPG_NOMBRE_FORMA?.includes("Tarjeta")) {
      return res.status(400).json({
        message: "Forma de pago no valida",
      });
    }

    const usuario = await usuarioStore.getByCarne(LR_CARNE);
    if (!usuario) {
      return res.status(404).json({
        message:
          "El usuario autenticado no existe en la base de datos compartida",
      });
    }

    let PAG_MONTO_TOTAL = 0;
    let plan = null;
    let usuarioMulta = null;
    let multa = null;

    if (EMU_USUARIO_MULTA) {
      const carneMulta =
        req.user.rol === "ADMINISTRADOR" ? null : LR_CARNE;
      usuarioMulta = await UsuarioMultaStore.getById(
        EMU_USUARIO_MULTA,
        carneMulta,
      );
      if (!usuarioMulta) {
        const message =
          req.user.rol === "ADMINISTRADOR"
            ? "Registro de multa de usuario no encontrado"
            : "Registro de multa no encontrado o no te pertenece";
        return res.status(404).json({ message });
      }
      if (usuarioMulta.EMU_ESTADO_MULTA === EMU_MULTA_PAGADA) {
        return res.status(409).json({
          message: "Esta multa ya fue pagada.",
        });
      }
      multa = await MultaStore.getById(usuarioMulta.MUL_MULTA);
      if (!multa) {
        return res.status(404).json({ message: "La multa especificada no existe" });
      }
      PAG_MONTO_TOTAL = Number(multa.MUL_MONTO_TOTAL);
    } else {
      plan = await PlanParqueoStore.getById(PLN_PLAN);
      if (!plan) {
        return res.status(404).json({
          message: "Plan de parqueo no encontrado",
        });
      }
      PAG_MONTO_TOTAL = Number(plan.PLN_PRECIO);
    }

    if (PAG_MONTO_TOTAL <= 0) {
      return res.status(400).json({
        message: "El monto pagado debe ser mayor a 0",
      });
    }

    const idempotencyKey = buildIdempotencyKey(req, {
      LR_CARNE,
      EMU_USUARIO_MULTA,
      PLN_PLAN,
    });

    const existingPago = EMU_USUARIO_MULTA
      ? await PagoStore.findActiveByUsuarioMulta(EMU_USUARIO_MULTA)
      : await PagoStore.findActiveByPlanAndCarne(PLN_PLAN, LR_CARNE);

    if (existingPago) {
      const resolved = await resolveExistingActivePago(existingPago);

      if (resolved.action === "already_paid") {
        return res.status(409).json({
          message: EMU_USUARIO_MULTA
            ? "Esta multa ya tiene un pago registrado."
            : "Este plan ya tiene un pago registrado para tu carné.",
          data: resolved.pago,
        });
      }

      if (resolved.action === "reuse") {
        return sendPagoResponse(res, 200, {
          message: "Pago pendiente existente reutilizado",
          data: resolved.pago,
          clientSecret: resolved.clientSecret,
          reused: true,
        });
      }

      if (resolved.action === "orphan_pending") {
        const metadatos = buildStripeMetadata({
          nombreEstudiante: usuario.LR_NOMBRES,
          apellidosEstudiante: usuario.LR_APELLIDOS,
          correoEstudiante: usuario.LR_CORREO_INSTITUCIONAL,
          formaPago,
          PAG_MONTO_TOTAL,
          plan,
          usuarioMulta,
          multa,
          EMU_USUARIO_MULTA,
        });

        const paymentIntent = await createStripePaymentIntent({
          amount: PAG_MONTO_TOTAL,
          LR_CARNE,
          pagoId: resolved.pago.PAG_PAGO,
          metadatos,
          idempotencyKey,
        });

        const pagoActualizado = await attachPaymentIntentToPago(
          resolved.pago,
          paymentIntent,
        );

        return sendPagoResponse(res, 200, {
          message: "Pago pendiente existente reutilizado",
          data: pagoActualizado,
          clientSecret: paymentIntent.client_secret,
          reused: true,
        });
      }
    }

    req.body.PAG_MONTO_TOTAL = PAG_MONTO_TOTAL;
    req.body.PAG_ESTADO = PAG_PENDIENTE;
    req.body.PAG_FECHA_CREACION = new Date();
    req.body.PAG_FECHA_PAGO = new Date();
    req.body.STRIPE_PAYMENT_INTENT_ID = PAG_PENDIENTE;
    req.body.PAG_ESTADO_REGISTRO = "A";

    const pago = await PagoStore.create(req.body);

    const metadatos = buildStripeMetadata({
      nombreEstudiante: usuario.LR_NOMBRES,
      apellidosEstudiante: usuario.LR_APELLIDOS,
      correoEstudiante: usuario.LR_CORREO_INSTITUCIONAL,
      formaPago,
      PAG_MONTO_TOTAL,
      plan,
      usuarioMulta,
      multa,
      EMU_USUARIO_MULTA,
    });

    const paymentIntent = await createStripePaymentIntent({
      amount: PAG_MONTO_TOTAL,
      LR_CARNE,
      pagoId: pago.PAG_PAGO,
      metadatos,
      idempotencyKey,
    });

    const pagoActualizado = await attachPaymentIntentToPago(pago, paymentIntent);

    return sendPagoResponse(res, 201, {
      message: "Pago iniciado exitosamente",
      data: pagoActualizado,
      clientSecret: paymentIntent.client_secret,
      reused: false,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error al crear el pago",
      error: error.message,
    });
  }
};

exports.updatePago = async (req, res) => {
  try {
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

  try {
    const paymentIntent = event.data.object;
    if (!paymentIntent.metadata?.PAG_PAGO) {
      console.log("No hay metadata asociada al payment intent, ignorando.");
      return res.send();
    }

    const pagoId = paymentIntent.metadata.PAG_PAGO;
    const pagoExistente = await PagoStore.getById(pagoId);

    switch (event.type) {
      case "payment_intent.succeeded": {
        if (pagoExistente?.PAG_ESTADO === PAG_ACEPTADO) {
          console.log(`Pago ${pagoId} ya estaba aceptado (idempotente).`);
          return res.send();
        }

        const PAG_FECHA_PAGO = new Date(paymentIntent.created * 1000);
        await PagoStore.update(pagoId, {
          PAG_ESTADO: PAG_ACEPTADO,
          PAG_FECHA_PAGO,
        });
        console.log(
          `Pago ${pagoId} actualizado a Aceptado (A) y fecha actualizada`,
        );

        const emuId =
          paymentIntent.metadata.EMU_USUARIO_MULTA ||
          pagoExistente?.EMU_USUARIO_MULTA;
        await marcarMultaComoPagada(emuId);

        const carnetStripe = paymentIntent.metadata.LR_CARNE;
        if (carnetStripe) {
          const estud = await usuarioStore.getByCarne(carnetStripe);
          if (estud?.LR_CORREO_INSTITUCIONAL) {
            const concepto =
              paymentIntent.metadata.PLN_NOMBRE_PLAN ||
              paymentIntent.metadata.MUL_DESCRIPCION ||
              "Pago de parqueo";
            await emailUtil.enviarCorreoPago(
              estud.LR_CORREO_INSTITUCIONAL,
              estud.LR_CARNE,
              `${estud.LR_NOMBRES} ${estud.LR_APELLIDOS}`,
              concepto,
              paymentIntent.amount / 100,
              paymentIntent.id,
            );
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        if (pagoExistente?.PAG_ESTADO === PAG_CANCELADO) {
          console.log(`Pago ${pagoId} ya estaba cancelado (idempotente).`);
          return res.send();
        }
        await PagoStore.update(pagoId, { PAG_ESTADO: PAG_CANCELADO });
        console.log(`Pago ${pagoId} actualizado a Cancelado (C)`);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.send();
  } catch (error) {
    console.error("Error al actualizar la BD desde el Webhook:", error);
    res.status(500).send("Error interno en el Webhook");
  }
};
