const MultaStore = require("../store/multa.store");

exports.getAllMultas = async (req, res) => {
  try {
    const multas = await MultaStore.getAll();
    res.status(200).json(multas);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las multas",
      error: error.message,
    });
  }
};

exports.getMultaById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      return res.status(400).json({
        message: "Error de validación: El ID debe ser un valor numérico.",
      });
    }

    const multa = await MultaStore.getById(id);

    if (!multa) {
      return res.status(404).json({
        message: "Multa no encontrada o está inactiva",
      });
    }
    res.status(200).json(multa);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener la multa",
      error: error.message,
    });
  }
};

exports.createMulta = async (req, res) => {
  try {
    const { MUL_DESCRIPCION, MUL_MONTO_TOTAL, MUL_DIAS_VENCIMIENTO } = req.body;

    if (!MUL_DESCRIPCION || !MUL_MONTO_TOTAL || MUL_DIAS_VENCIMIENTO === undefined) {
      return res.status(400).json({
        message: "La descripción, el monto y los días de vencimiento son obligatorios.",
      });
    }

    
    const existeDesc = await MultaStore.getByDescripcion(MUL_DESCRIPCION);
    if (existeDesc && existeDesc.length > 0) {
        const exacta = existeDesc.find(m => m.MUL_DESCRIPCION.toUpperCase() === MUL_DESCRIPCION.toUpperCase());
        if (exacta) {
            return res.status(400).json({
                message: "Ya existe una multa con esa misma descripción exacta",
            });
        }
    }

    const multa = await MultaStore.create(req.body);
    res.status(201).json({
      message: "Multa creada exitosamente",
      data: multa,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error interno al procesar la solicitud",
      error: error.message,
    });
  }
};

exports.getMultaByDescripcion = async (req, res) => {
  try {
    const { descripcion } = req.params;

    if (!descripcion || descripcion.trim() === "") {
      return res.status(400).json({
        message: "Error de validación: Debe proporcionar una descripción para buscar",
      });
    }

    const multas = await MultaStore.getByDescripcion(descripcion);

    if (!multas || multas.length === 0) {
      return res.status(404).json({
        message: "No se encontraron multas con esa descripción",
      });
    }
    res.status(200).json(multas);
  } catch (error) {
    res.status(500).json({
      message: "Error al buscar la multa",
      error: error.message,
    });
  }
};

exports.updateMulta = async (req, res) => {
  try {
    const { id } = req.params;
    const { MUL_DESCRIPCION, MUL_MONTO_TOTAL, MUL_DIAS_VENCIMIENTO, MUL_MODIFICADO_POR } = req.body;

    if (isNaN(Number(id))) {
      return res.status(400).json({
        message: "Error: El ID en la URL debe ser un valor numérico",
      });
    }

    const multaExistente = await MultaStore.getById(id);
    if (!multaExistente) {
      return res.status(404).json({
        message: "Multa no encontrada para actualizar",
      });
    }

    if (MUL_DESCRIPCION && MUL_DESCRIPCION !== multaExistente.MUL_DESCRIPCION) {
      const coincidencias = await MultaStore.getByDescripcion(MUL_DESCRIPCION);
      const duplicada = coincidencias.find(m => 
        m.MUL_DESCRIPCION.toUpperCase() === MUL_DESCRIPCION.toUpperCase() && m.MUL_MULTA != id
      );
      
      if (duplicada) {
        return res.status(400).json({
          message: "Error: Ya existe otra multa activa con esa misma descripción",
        });
      }
    }

    if (MUL_MONTO_TOTAL && isNaN(Number(MUL_MONTO_TOTAL))) {
      return res.status(400).json({ message: "El monto total debe ser numérico" });
    }

    const rowsAffected = await MultaStore.update(id, req.body);

    if (rowsAffected[0] === 0) {
      return res.status(200).json({
        message: "No se realizaron cambios (los datos son idénticos a los actuales)",
      });
    }

    res.status(200).json({
      message: "Multa actualizada exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar la multa",
      error: error.message,
    });
  }
};