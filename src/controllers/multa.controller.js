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
    const { MUL_MULTA } = req.params;
    //console.log("este es el valor de id para obtener una multa: ", id);
    if (isNaN(Number(MUL_MULTA))) {
      return res.status(400).json({
        message: "Error de validación: El ID debe ser un valor numérico.",
      });
    }

    const multa = await MultaStore.getById(MUL_MULTA);

    if (!multa) {
      return res.status(404).json({
        message: "Multa no encontrada",
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
    const { MUL_MULTA, MUL_DESCRIPCION } = req.body;

    if (isNaN(Number(MUL_MULTA))) {
      return res.status(400).json({
        message:
          "Error de validación: El ID de la multa debe ser un número válido.",
      });
    }

    const existente = await MultaStore.getById(MUL_MULTA);
    if (existente) {
      return res.status(400).json({
        message: "El ID de la multa ya existe en el sistema",
      });
    }

    const existeDesc = await MultaStore.getByDescripcion(MUL_DESCRIPCION);
    if (existeDesc) {
      return res.status(400).json({
        message: "Ya existe una multa con esa misma descripción",
      });
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
    //console.log("este es el valor de descripcion para obtener una multa: ", MUL_DESCRIPCION);
    const multa = await MultaStore.getByDescripcion(descripcion);
    if (isNaN(Number(descripcion)) || !descripcion) {
      return res.status(400).json({
        message:
          "Error de validación: La descripción debe ser un valor de texto",
      });
    }

    if (!multa) {
      return res.status(404).json({
        message: "Multa no encontrada",
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

exports.updateMulta = async (req, res) => {
  try {
    const { id } = req.params;
    const { MUL_DESCRIPCION, MUL_MONTO_TOTAL } = req.body;

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

    if (MUL_DESCRIPCION) {
      const multaConMismoNombre =
        await MultaStore.getByDescripcion(MUL_DESCRIPCION);

      if (multaConMismoNombre && multaConMismoNombre.MUL_id_multa != id) {
        return res.status(400).json({
          message: "Error: Ya existe otra multa con esa misma descripción",
        });
      }
    }

    //validar monto total
    if (MUL_MONTO_TOTAL && isNaN(Number(MUL_MONTO_TOTAL))) {
      return res
        .status(400)
        .json({ message: "El monto total debe ser numérico" });
    }

    const dataUpdate = {
      ...req.body,
      MUL_MODIFICADO_POR: req.body.MUL_MODIFICADO_POR || "system",
      MUL_FECHA_MODIFICACION: req.body.MUL_FECHA_MODIFICACION || new Date(),
    };

    const rowsAffected = await MultaStore.update(id, dataUpdate);

    if (rowsAffected[0] === 0) {
      return res.status(400).json({
        message:
          "No se realizaron cambios en la multa o los datos son idénticos",
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
