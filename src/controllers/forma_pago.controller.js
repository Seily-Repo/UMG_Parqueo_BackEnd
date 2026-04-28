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
  //console.log("dato", req.params);
  try {
    const { FPG_FORMA_PAGO } = req.params; 
    
    if (!/^\d+$/.test(FPG_FORMA_PAGO)) {
      return res.status(400).json({ 
        message: "No se permiten letras o caracteres especiales, solo números" 
      });
    }
    const forma = await FormaPagoStore.getById(FPG_FORMA_PAGO);

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
    const { FPG_NOMBRE_FORMA } = req.body;

    if (!FPG_NOMBRE_FORMA) {
      return res.status(400).json({ 
        message: "El nombre de la forma de pago es obligatorio." 
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
  //console.log("datos ", req.params);
  try {
    const { FPG_FORMA_PAGO } = req.params;
    const { FPG_ESTADO_REGISTRO } = req.body;

    if (!/^\d+$/.test(FPG_FORMA_PAGO)) {
        return res.status(400).json({ message: "El ID debe ser numérico" });
    }

    if (FPG_ESTADO_REGISTRO === undefined) {
      return res.status(400).json({ 
        message: "Debe proporcionar el campo FPG_ESTADO_REGISTRO para actualizar." 
      });
    }

    const estadosPermitidos = ['A', 'I'];
    if (!estadosPermitidos.includes(FPG_ESTADO_REGISTRO)) {
      return res.status(400).json({ 
        message: "Estado no válido. Solo se permite 'A' (Activo) o 'I' (Inactivo)." 
      });
    }

    const [rowsAffected] = await FormaPagoStore.updateEstado(FPG_FORMA_PAGO, FPG_ESTADO_REGISTRO);

    if (rowsAffected === 0) {
      return res.status(404).json({ message: "Forma de pago no encontrada para actualizar o el estado es el mismo" });
    }

    res.status(200).json({ message: "Estado actualizado correctamente" });

  } catch (error) {
    res.status(500).json({ 
      message: "Error al actualizar el estado", 
      error: error.message 
    });
  }
};