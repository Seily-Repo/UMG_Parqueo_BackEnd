const VehiculoStore = require('../store/vehiculo.store');
const PagoStore = require('../store/pago.store');

/**
 * GET /api/vehiculos/:carne
 */
exports.getByPlaca = async (req, res) => {
  try {
    const vehiculo = await VehiculoStore.getByPlaca(req.params.placa);
    if (!vehiculo) return res.status(404).json({ error: "Vehículo no encontrado" });
    res.status(200).json(vehiculo);
  } catch (err) {
    res.status(500).json({ error: "Error de servidor", detalle: err.message });
  }
};

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

    if (!plan_id) {
      const planInfo = await PagoStore.getPlanActivo(carne_usuario);
      if (!planInfo.activo) {
        return res.status(400).json({ error: "Debe seleccionar un plan de parqueo." });
      }
    }

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

    if (err.errorNum === 2) {
      return res.status(400).json({ error: err.message });
    }

    res.status(500).json({ error: err.message || "Error al registrar el vehículo" });
  }
};

/**
 * PUT /api/vehiculos/:id/desactivar
 */
exports.desactivar = async (req, res) => {
  try {
    const id = req.params.id;
    // Verificar si tiene multas pendientes o activas
    const tieneMultas = await VehiculoStore.tieneMultasActivas(id);
    if (tieneMultas) {
      return res.status(400).json({ error: "No se puede eliminar. El vehículo tiene multas pendientes." });
    }
    
    await VehiculoStore.desactivar(id);
    res.status(200).json({ mensaje: "Vehículo eliminado con éxito" });
  } catch (err) {
    console.error("❌ Error al desactivar vehículo:", err);
    res.status(500).json({ error: "Error de servidor", detalle: err.message });
  }
};
