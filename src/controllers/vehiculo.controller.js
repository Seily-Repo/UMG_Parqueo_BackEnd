const VehiculoStore = require('../store/vehiculo.store');

/**
 * GET /api/vehiculos/:carne
 */
exports.getByCarne = async (req, res) => {
  try {
    const vehiculos = await VehiculoStore.getByCarne(req.params.carne);
    res.status(200).json(vehiculos);
  } catch (err) {
    res.status(500).json({ error: "Error de servidor", detalle: err.message });
  }
};

/**
 * POST /api/vehiculos
 * Registra el vehículo y retorna el plan_id al frontend.
 * El frontend debe luego llamar a cobros-dev para crear el pago.
 */
exports.registrar = async (req, res) => {
  try {
    const { carne_usuario, tipo_vehiculo, placa, marca, modelo, color, plan_id } = req.body;

    await VehiculoStore.crear(req.body);

    res.status(200).json({
      mensaje: "Vehículo registrado exitosamente",
      plan_id: plan_id || null
    });
  } catch (err) {
    console.error("❌ Error al guardar vehículo:", err);

    if (err.errorNum === 1 || (err.message && err.message.includes('ORA-00001'))) {
      return res.status(400).json({ error: "¡Ups! Esta placa ya se encuentra registrada en el sistema." });
    }
    if (err.message && err.message.includes('CHK_TIPO_VEHICULO')) {
      return res.status(400).json({ error: "Tipo de vehículo no válido (Debe ser AUTOMOVIL, MOTOCICLETA, CAMIONETA u OTRO)." });
    }

    res.status(500).json({ error: "Error interno", detalle: err.message });
  }
};
