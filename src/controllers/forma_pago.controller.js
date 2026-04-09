const FormaPagoStore = require("../store/forma_pago.store");

exports.getAllFormasPago = async (req, res) => {
  try {
    const formas = await FormaPagoStore.getAll();
    res.status(200).json(formas);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener formas de pago",
      error: error.message,
    });
  }
};

exports.getFormaPagoById = async (req, res) => {
  try {
    const forma = await FormaPagoStore.getById(req.params.FPG_FORMA_PAGO);
    if (!forma)
      return res.status(404).json({ message: "Forma de pago no encontrada" });
    res.status(200).json(forma);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener la forma de pago",
      error: error.message,
    });
  }
};

exports.createFormaPago = async (req, res) => {
  try {
    const existente = await FormaPagoStore.getById(req.body.FPG_FORMA_PAGO);
    if (existente)
      return res
        .status(400)
        .json({ message: "El ID de forma de pago ya existe" });

    const nuevaForma = await FormaPagoStore.create(req.body);
    res.status(201).json({ message: "Creado exitosamente", data: nuevaForma });
  } catch (error) {
    res.status(500).json({ message: "Error al crear", error: error.message });
  }
};

exports.updateFormaPago = async (req, res) => {
  try {
    const [rowsAffected] = await FormaPagoStore.update(
      req.params.FPG_FORMA_PAGO,
      req.body,
    );
    if (rowsAffected === 0)
      return res.status(404).json({ message: "No encontrado para actualizar" });
    res.status(200).json({ message: "Actualizado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al actualizar", error: error.message });
  }
};

exports.deleteFormaPago = async (req, res) => {
  try {
    const [rowsAffected] = await FormaPagoStore.delete(
      req.params.FPG_FORMA_PAGO,
    );
    if (rowsAffected === 0)
      return res.status(404).json({ message: "No encontrado para eliminar" });
    res.status(200).json({ message: "Eliminado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar", error: error.message });
  }
};
