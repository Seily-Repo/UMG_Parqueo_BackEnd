const PagoStore = require('../store/pago.store');

/**
 * GET /api/pagos/lista-pendiente/:carne
 */
exports.getListaPendientes = async (req, res) => {
  try {
    const pagos = await PagoStore.getListaPendientes(req.params.carne);
    res.status(200).json(pagos);
  } catch (err) {
    res.status(500).json({ error: "Error de servidor", detalle: err.message });
  }
};

/**
 * GET /api/pagos/plan-activo/:carne
 */
exports.getPlanActivo = async (req, res) => {
  try {
    const plan = await PagoStore.getPlanActivo(req.params.carne);
    res.status(200).json(plan);
  } catch (err) {
    res.status(500).json({ error: "Error de servidor", detalle: err.message });
  }
};
