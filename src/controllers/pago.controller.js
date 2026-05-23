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
const EMU_MULTA_ACEPTADA = "A";
const EMU_MULTA_CANCELADA = "C";

const normalizeCarne = (carne) => {
  if (carne == null || carne === "") return null;
  return String(carne).replace(/-/g, "").trim();
};

const usuarioPuedeVerPago = (req, pago) => {
  if (req.user.rol === "ADMINISTRADOR") return true;
  const carnePago = normalizeCarne(pago.LR_CARNE);
  return carnePago && carnePago === normalizeCarne(req.user.carne);
};

const toPagoJson = (pago) => (pago?.toJSON ? pago.toJSON() : pago);

/** Una clave por fila CB_PAGO evita reutilizar un PaymentIntent ya cobrado en Stripe. */
const buildStripeIdempotencyKey = (
  pagoId,
  { EMU_USUARIO_MULTA, PLN_PLAN, LR_CARNE },
) => {
  if (EMU_USUARIO_MULTA) {
    return `pi-multa-${EMU_USUARIO_MULTA}-pag-${pagoId}`.slice(0, 255);
  }
  return `pi-plan-${PLN_PLAN}-${LR_CARNE}-pag-${pagoId}`.slice(0, 255);
};

const sendPagoResponse = (
  res,
  statusCode,
  { message, data, clientSecret, reused = false, alreadyPaid = false },
) => {
  res.status(statusCode).json({
    message,
    data,
    clientSecret,
    reused,
    alreadyPaid,
  });
};

const respondAlreadyPaid = (res, message, pago) => {
  return sendPagoResponse(res, 200, {
    message,
    data: toPagoJson(pago),
    clientSecret: null,
    reused: true,
    alreadyPaid: true,
  });
};

const pagoLocks = new Map();
const acquirePagoLock = async (lockKey) => {
  const maxWait = 15000;
  const start = Date.now();
  while (pagoLocks.has(lockKey)) {
    if (Date.now() - start > maxWait) {
      throw new Error("Tiempo de espera agotado al procesar el pago.");
    }
    await new Promise((resolve) => setTimeout(resolve, 80));
  }
  pagoLocks.set(lockKey, true);
};

const releasePagoLock = (lockKey) => {
  pagoLocks.delete(lockKey);
};

/** Solo cuenta como pagado si Stripe confirma succeeded (evita A falsos en BD). */
const validarPagoAceptadoEnStripe = async (pago, { cancelInvalid = false } = {}) => {
  const row = toPagoJson(pago);
  if (!row || row.PAG_ESTADO !== PAG_ACEPTADO) return null;

  const piId = row.STRIPE_PAYMENT_INTENT_ID;
  if (!piId?.startsWith("pi_")) {
    if (cancelInvalid) {
      await PagoStore.update(row.PAG_PAGO, { PAG_ESTADO: PAG_CANCELADO });
    }
    return null;
  }

  try {
    const pi = await stripe.paymentIntents.retrieve(piId);
    if (pi.status === "succeeded") {
      return row;
    }
  } catch (err) {
    console.log("Pago A sin PI válido en Stripe:", err.message);
  }

  if (cancelInvalid) {
    await PagoStore.update(row.PAG_PAGO, { PAG_ESTADO: PAG_CANCELADO });
  }
  return null;
};

/**
 * Resuelve un pago activo existente: ya pagado, reutilizar PI pendiente, o invalidar cancelado.
 */
const resolveExistingActivePago = async (existingPago) => {
  const pago = toPagoJson(existingPago);

  if (pago.PAG_ESTADO === PAG_ACEPTADO) {
    const valido = await validarPagoAceptadoEnStripe(pago, {
      cancelInvalid: true,
    });
    if (valido) {
      return { action: "already_paid", pago: valido };
    }
    return { action: "expired", pago: null };
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
      return {
        action: "already_paid",
        pago,
        stripeStatus: "succeeded",
      };
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

/** Ignora Idempotency-Key del cliente (pago-plan-X-carne) y reintenta si Stripe rechaza la clave. */
const createStripePaymentIntentSafe = async (params) => {
  const { idempotencyKey, ...rest } = params;
  try {
    return await createStripePaymentIntent({ ...rest, idempotencyKey });
  } catch (err) {
    const esIdempotencia =
      err?.type === "StripeIdempotencyError" ||
      err?.rawType === "idempotency_error";
    if (!esIdempotencia) throw err;

    const fallbackKey = `${idempotencyKey}-r${Date.now()}`.slice(0, 255);
    console.warn(
      `Stripe idempotency conflict (${idempotencyKey}), reintento con ${fallbackKey}`,
    );
    return await createStripePaymentIntent({
      ...rest,
      idempotencyKey: fallbackKey,
    });
  }
};

const buildPagoPayload = (reqBody, PAG_MONTO_TOTAL) => ({
  LR_CARNE: reqBody.LR_CARNE,
  PLN_PLAN: reqBody.PLN_PLAN ?? null,
  EMU_USUARIO_MULTA: reqBody.EMU_USUARIO_MULTA ?? null,
  FPG_FORMA_PAGO: reqBody.FPG_FORMA_PAGO,
  PAG_MONTO_TOTAL,
  PAG_ESTADO: PAG_PENDIENTE,
  PAG_FECHA_CREACION: new Date(),
  PAG_FECHA_PAGO: new Date(),
  STRIPE_PAYMENT_INTENT_ID: PAG_PENDIENTE,
  PAG_ESTADO_REGISTRO: "A",
});

const attachPaymentIntentToPago = async (
  pago,
  paymentIntent,
  pagoPayload,
  { onlyMissing = false } = {},
) => {
  await PagoStore.completePagoRecord(
    pago.PAG_PAGO,
    {
      ...pagoPayload,
      STRIPE_PAYMENT_INTENT_ID: paymentIntent.id,
    },
    { onlyMissing },
  );
  const updated = await PagoStore.getById(pago.PAG_PAGO);
  return toPagoJson(updated);
};

const cancelPagosPendientesDuplicados = async (pago, reqBody) => {
  await PagoStore.cancelDuplicatePending({
    keepPagoId: pago.PAG_PAGO,
    LR_CARNE: reqBody.LR_CARNE,
    PLN_PLAN: reqBody.PLN_PLAN ?? null,
    EMU_USUARIO_MULTA: reqBody.EMU_USUARIO_MULTA ?? null,
  });
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
    EMU_ESTADO_MULTA: EMU_MULTA_ACEPTADA,
    EMU_MODIFICADO_POR: "STRIPE_WEBHOOK",
  });
};

const enviarCorreoPagoExitoso = async (paymentIntent) => {
  const carnetStripe = paymentIntent.metadata?.LR_CARNE;
  if (!carnetStripe) return;

  const estud = await usuarioStore.getByCarne(carnetStripe);
  if (!estud?.LR_CORREO_INSTITUCIONAL) return;

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
};

const confirmarPagoExitoso = async (pagoId, paymentIntent, pagoExistente) => {
  const actualDb = toPagoJson(
    pagoExistente?.PAG_PAGO
      ? await PagoStore.getById(pagoExistente.PAG_PAGO)
      : await PagoStore.getById(pagoId),
  );

  if (actualDb?.PAG_ESTADO === PAG_ACEPTADO) {
    return { alreadyDone: true };
  }

  const updates = { PAG_ESTADO: PAG_ACEPTADO };
  if (!actualDb?.PAG_FECHA_PAGO) {
    updates.PAG_FECHA_PAGO = new Date(paymentIntent.created * 1000);
  }
  await PagoStore.update(pagoId, updates);

  const emuId =
    paymentIntent.metadata?.EMU_USUARIO_MULTA ||
    actualDb?.EMU_USUARIO_MULTA ||
    pagoExistente?.EMU_USUARIO_MULTA;
  await marcarMultaComoPagada(emuId);
  await enviarCorreoPagoExitoso(paymentIntent);

  await PagoStore.cancelDuplicatePending({
    keepPagoId: pagoId,
    LR_CARNE:
      paymentIntent.metadata?.LR_CARNE ||
      actualDb?.LR_CARNE ||
      pagoExistente?.LR_CARNE,
    PLN_PLAN: actualDb?.PLN_PLAN ?? pagoExistente?.PLN_PLAN ?? null,
    EMU_USUARIO_MULTA:
      paymentIntent.metadata?.EMU_USUARIO_MULTA ||
      actualDb?.EMU_USUARIO_MULTA ||
      pagoExistente?.EMU_USUARIO_MULTA ||
      null,
  });

  return { alreadyDone: false };
};

const syncPagoUsuarioDesdeStripe = async (req, res, pago) => {
  const pagoData = toPagoJson(pago);
  const piId = pagoData.STRIPE_PAYMENT_INTENT_ID;

  if (!piId?.startsWith("pi_")) {
    return res.status(400).json({
      message:
        "El pago no tiene un Payment Intent de Stripe válido para sincronizar.",
    });
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(piId);
  const piPerteneceAlPago =
    paymentIntent.metadata?.PAG_PAGO === String(pagoData.PAG_PAGO);

  if (paymentIntent.status === "canceled") {
    await PagoStore.update(pagoData.PAG_PAGO, { PAG_ESTADO: PAG_CANCELADO });
    const actualizado = await PagoStore.getById(pagoData.PAG_PAGO);
    return res.status(409).json({
      message: "El intento de pago fue cancelado en Stripe.",
      data: toPagoJson(actualizado),
      stripeStatus: paymentIntent.status,
    });
  }

  const debeConfirmar =
    req.body?.confirmar === true || req.query?.confirmar === "true";

  if (
    paymentIntent.status === "succeeded" &&
    debeConfirmar &&
    piPerteneceAlPago
  ) {
    const actualDb = await PagoStore.getById(pagoData.PAG_PAGO);
    if (actualDb?.PAG_ESTADO === PAG_PENDIENTE) {
      await confirmarPagoExitoso(
        pagoData.PAG_PAGO,
        paymentIntent,
        actualDb,
      );
    }
    const actualizado = await PagoStore.getById(pagoData.PAG_PAGO);
    return res.status(200).json({
      message: "Pago confirmado exitosamente",
      data: toPagoJson(actualizado),
      stripeStatus: paymentIntent.status,
      confirmado: actualizado?.PAG_ESTADO === PAG_ACEPTADO,
    });
  }

  const actualizado = await PagoStore.getById(pagoData.PAG_PAGO);
  const estadoDb = actualizado?.PAG_ESTADO || pagoData.PAG_ESTADO;

  return res.status(200).json({
    message:
      paymentIntent.status === "succeeded" && estadoDb !== PAG_ACEPTADO
        ? "Pago autorizado en Stripe; envíe confirmar=true tras completar la pasarela."
        : estadoDb === PAG_ACEPTADO
          ? "Pago ya registrado como aceptado."
          : "Pago pendiente en Stripe",
    data: toPagoJson(actualizado) || pagoData,
    clientSecret:
      paymentIntent.status === "succeeded"
        ? null
        : paymentIntent.client_secret,
    stripeStatus: paymentIntent.status,
    confirmado: estadoDb === PAG_ACEPTADO,
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
  let lockKey = null;
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

    lockKey = EMU_USUARIO_MULTA
      ? `multa-${EMU_USUARIO_MULTA}`
      : `plan-${PLN_PLAN}-${LR_CARNE}`;
    await acquirePagoLock(lockKey);

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
      if (usuarioMulta.EMU_ESTADO_MULTA === EMU_MULTA_CANCELADA) {
        return res.status(409).json({
          message: "Esta multa está cancelada y no puede pagarse.",
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

    const pagoPayload = buildPagoPayload(req.body, PAG_MONTO_TOTAL);

    const pendingPago = EMU_USUARIO_MULTA
      ? await PagoStore.findPendingByUsuarioMulta(EMU_USUARIO_MULTA)
      : await PagoStore.findPendingByPlanAndCarne(PLN_PLAN, LR_CARNE);

    if (!EMU_USUARIO_MULTA && !pendingPago) {
      const planPagado = await PagoStore.findAcceptedByPlanAndCarne(
        PLN_PLAN,
        LR_CARNE,
      );
      const planPagadoReal = await validarPagoAceptadoEnStripe(planPagado, {
        cancelInvalid: true,
      });
      if (planPagadoReal) {
        return respondAlreadyPaid(
          res,
          "Este plan ya fue pagado para tu carné.",
          planPagadoReal,
        );
      }
    }

    if (EMU_USUARIO_MULTA && !pendingPago) {
      const multaPagada = await PagoStore.findAcceptedByUsuarioMulta(
        EMU_USUARIO_MULTA,
      );
      const multaPagadaReal = await validarPagoAceptadoEnStripe(multaPagada, {
        cancelInvalid: true,
      });
      if (multaPagadaReal) {
        return respondAlreadyPaid(
          res,
          "Esta multa ya fue pagada.",
          multaPagadaReal,
        );
      }
    }

    const existingPago =
      pendingPago ||
      (EMU_USUARIO_MULTA
        ? await PagoStore.findActiveByUsuarioMulta(EMU_USUARIO_MULTA)
        : await PagoStore.findActiveByPlanAndCarne(PLN_PLAN, LR_CARNE));

    if (existingPago) {
      const resolved = await resolveExistingActivePago(existingPago);

      if (resolved.action === "already_paid") {
        const aceptado = EMU_USUARIO_MULTA
          ? await PagoStore.findAcceptedByUsuarioMulta(EMU_USUARIO_MULTA)
          : await PagoStore.findAcceptedByPlanAndCarne(PLN_PLAN, LR_CARNE);
        return respondAlreadyPaid(
          res,
          EMU_USUARIO_MULTA
            ? "Esta multa ya fue pagada."
            : "Este plan ya fue pagado para tu carné.",
          aceptado || resolved.pago,
        );
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

        const paymentIntent = await createStripePaymentIntentSafe({
          amount: PAG_MONTO_TOTAL,
          LR_CARNE,
          pagoId: resolved.pago.PAG_PAGO,
          metadatos,
          idempotencyKey: buildStripeIdempotencyKey(resolved.pago.PAG_PAGO, {
            EMU_USUARIO_MULTA,
            PLN_PLAN,
            LR_CARNE,
          }),
        });

        const pagoActualizado = await attachPaymentIntentToPago(
          resolved.pago,
          paymentIntent,
          pagoPayload,
          { onlyMissing: true },
        );

        return sendPagoResponse(res, 200, {
          message: "Pago pendiente existente reutilizado",
          data: pagoActualizado,
          clientSecret: paymentIntent.client_secret,
          reused: true,
        });
      }
    }

    const pago = await PagoStore.create(pagoPayload);

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

    const paymentIntent = await createStripePaymentIntentSafe({
      amount: PAG_MONTO_TOTAL,
      LR_CARNE,
      pagoId: pago.PAG_PAGO,
      metadatos,
      idempotencyKey: buildStripeIdempotencyKey(pago.PAG_PAGO, {
        EMU_USUARIO_MULTA,
        PLN_PLAN,
        LR_CARNE,
      }),
    });

    const pagoActualizado = await attachPaymentIntentToPago(
      pago,
      paymentIntent,
      pagoPayload,
    );
    await cancelPagosPendientesDuplicados(pagoActualizado, req.body);

    return sendPagoResponse(res, 201, {
      message: "Pago iniciado exitosamente",
      data: pagoActualizado,
      clientSecret: paymentIntent.client_secret,
      reused: false,
    });
  } catch (error) {
    console.error("createPago:", error);
    const esStripe = error?.type?.startsWith?.("Stripe");
    const esIdempotencia =
      error?.type === "StripeIdempotencyError" ||
      error?.rawType === "idempotency_error";

    if (esIdempotencia) {
      return res.status(409).json({
        message:
          "Conflicto al iniciar el pago en Stripe. Recargue la página e intente de nuevo.",
        error: error.message,
      });
    }

    res.status(esStripe ? 400 : 500).json({
      message: "Error al crear el pago",
      error: error.message,
    });
  } finally {
    if (lockKey) releasePagoLock(lockKey);
  }
};

exports.updatePago = async (req, res) => {
  try {
    const pago = await PagoStore.getById(req.params.id);

    if (!pago) {
      return res.status(404).json({
        message: "Pago no encontrado",
      });
    }

    if (req.user.rol !== "ADMINISTRADOR") {
      if (!usuarioPuedeVerPago(req, pago)) {
        return res.status(403).json({
          message: "Acceso denegado. Solo puedes actualizar tus propios pagos.",
        });
      }
      return syncPagoUsuarioDesdeStripe(req, res, pago);
    }

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

  if (!endpointSecret) {
    console.error("STRIPE_WEBHOOK_SECRET no configurado en .env");
    return res.status(500).send("Webhook no configurado");
  }

  const payload = Buffer.isBuffer(req.body)
    ? req.body
    : Buffer.from(
        typeof req.body === "string" ? req.body : JSON.stringify(req.body),
      );

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
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
        const { alreadyDone } = await confirmarPagoExitoso(
          pagoId,
          paymentIntent,
          pagoExistente,
        );
        if (alreadyDone) {
          console.log(`Pago ${pagoId} ya estaba aceptado (idempotente).`);
        } else {
          console.log(
            `Pago ${pagoId} actualizado a Aceptado (A) y fecha actualizada`,
          );
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
