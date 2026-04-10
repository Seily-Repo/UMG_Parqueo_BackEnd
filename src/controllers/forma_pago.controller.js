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
    const id = req.params.FPG_FORMA_PAGO;
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ 
        message: "No se permiten letras o caracteres especiales, solo números" 
      });
    }
    const forma = await FormaPagoStore.getById(id);

    if (!forma) {
      return res.status(404).json({ message: "Forma de pago no encontrada" });
    }

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
    /*
    Estados de Forma de Pago:
      A: Activo
      I: Inactivo
    */
    const { FPG_FORMA_PAGO, FPG_NOMBRE_FORMA, FPG_ESTADO } = req.body;

    if (!FPG_FORMA_PAGO || !FPG_NOMBRE_FORMA || !FPG_ESTADO) {
      return res.status(400).json({ 
        message: "Todos los campos son obligatorios (ID, Nombre y Estado)" 
      });
    }

    if (!/^\d+$/.test(FPG_FORMA_PAGO)) {
      return res.status(400).json({ 
        message: "El ID debe ser exclusivamente numérico" 
      });
    }

    const existeId = await FormaPagoStore.getById(FPG_FORMA_PAGO);
    if (existeId) {
      return res.status(400).json({ 
        message: "El ID de forma de pago ya existe" 
      });
    }

    const todasLasFormas = await FormaPagoStore.getAll();
    const nombreDuplicado = todasLasFormas.find(
      f => f.FPG_NOMBRE_FORMA.toUpperCase() === FPG_NOMBRE_FORMA.toUpperCase()
    );

    if (nombreDuplicado) {
      return res.status(400).json({ 
        message: `Ya existe una forma de pago con el nombre: ${FPG_NOMBRE_FORMA}` 
      });
    }

    const estadosPermitidos = ['A', 'I'];
    if (!estadosPermitidos.includes(FPG_ESTADO)) {
      return res.status(400).json({ 
        message: "Estado no válido. Solo se permite 'A' (Activo) o 'I' (Inactivo) en mayúsculas." 
      });
    }

    const nuevaForma = await FormaPagoStore.create(req.body);
    
    res.status(201).json({ 
      message: "Creado exitosamente", 
      data: nuevaForma 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error al crear la forma de pago", 
      error: error.message 
    });
  }
};

exports.updateFormaPago = async (req, res) => {
  try {
    const id = req.params.FPG_FORMA_PAGO;
    const estado = req.body.FPG_ESTADO || req.body.FPG_estado;

    if (estado !== undefined) {
      const estadosPermitidos = ['A', 'I'];
      if (!estadosPermitidos.includes(estado)) {
        return res.status(400).json({ 
          message: "Estado no válido. Solo se permite 'A' (Activo) o 'I' (Inactivo)." 
        });
      }
    }

    const [rowsAffected] = await FormaPagoStore.update(id, req.body);

    if (rowsAffected === 0) {
      return res.status(404).json({ message: "No encontrado para actualizar" });
    }

    res.status(200).json({ message: "Actualizado correctamente" });

  } catch (error) {
    res.status(500).json({ 
      message: "Error al actualizar", 
      error: error.message 
    });
  }
};