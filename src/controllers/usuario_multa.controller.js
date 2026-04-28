const UsuarioMultaStore = require("../store/usuario_multa.store");

const estadoMap = {
  a: "A",
  activa: "A",
  p: "P",
  pendiente: "P",
  c: "C",
  cancelada: "C",
};

const normalizeEstado = (value) => {
  if (!value) return null;
  return estadoMap[String(value).trim().toLowerCase()] || null;
};

const formatDateTime = (value) => {
  if (!value) return value;
  const date = new Date(value);
  const pad = (num) => String(num).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const formatMulta = (record) => {
  if (!record) return record;
  const data = typeof record.toJSON === "function" ? record.toJSON() : { ...record };
  return {
    ...data,
    EMU_FECHA_CREACION: formatDateTime(data.EMU_FECHA_CREACION),
    EMU_FECHA_MODIFICACION: formatDateTime(data.EMU_FECHA_MODIFICACION),
  };
};

// GET /api/usuario_multa
exports.getAllUsuarioMulta = async (req, res) => {
  try {
    const registros = await UsuarioMultaStore.getAll();
    const result = Array.isArray(registros)
      ? registros.map(formatMulta)
      : formatMulta(registros);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los registros de Usuario Multa",
      error: error.message,
    });
  }
};

// GET /api/usuario_multa/vehiculo/:VEH_ID_VEHICULO
exports.getUsuarioMultaByVehiculo = async (req, res) => {
  try {
    const { VEH_ID_VEHICULO } = req.params;

    if (!VEH_ID_VEHICULO) {
      return res.status(400).json({
        message: "El parámetro VEH_ID_VEHICULO es requerido",
      });
    }

    const registros = await UsuarioMultaStore.getByVehiculo(VEH_ID_VEHICULO);

    if (!registros || (Array.isArray(registros) && registros.length === 0)) {
      return res.status(404).json({
        message: "No se encontraron multas para el vehículo indicado",
      });
    }

    const result = Array.isArray(registros)
      ? registros.map(formatMulta)
      : formatMulta(registros);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los registros de Usuario Multa por vehículo",
      error: error.message,
    });
  }
};

// POST /api/usuario_multa
exports.createUsuarioMulta = async (req, res) => {
  try {
    const { MUL_MULTA, VEH_ID_VEHICULO, EMU_ESTADO_MULTA, EMU_CREADO_POR } = req.body;

    if (!MUL_MULTA || !VEH_ID_VEHICULO || !EMU_ESTADO_MULTA) {
      return res.status(400).json({
        message: "Los campos MUL_MULTA, VEH_ID_VEHICULO y EMU_ESTADO_MULTA son obligatorios",
      });
    }

    const estado = normalizeEstado(EMU_ESTADO_MULTA);
    if (!estado) {
      return res.status(400).json({
        message: "EMU_ESTADO_MULTA inválido. Se aceptan: A / Activa, P / Pendiente, C / Cancelada",
      });
    }

    const registro = await UsuarioMultaStore.create({
      MUL_MULTA,
      VEH_ID_VEHICULO,
      EMU_ESTADO_MULTA: estado,
      EMU_CREADO_POR: EMU_CREADO_POR || "ADMIN",
    });

    res.status(201).json(formatMulta(registro));
  } catch (error) {
    res.status(500).json({
      message: "Error al crear el registro de Usuario Multa",
      error: error.message,
    });
  }
};

// PUT /api/usuario_multa/:EMU_USUARIO_MULTA
exports.updateUsuarioMulta = async (req, res) => {
  try {
    const { EMU_USUARIO_MULTA } = req.params;
    const { EMU_ESTADO_MULTA, EMU_MODIFICADO_POR, EMU_ESTADO_REGISTRO } = req.body;

    if (!EMU_ESTADO_MULTA && !EMU_ESTADO_REGISTRO) {
      return res.status(400).json({
        message: "Se requiere al menos EMU_ESTADO_MULTA o EMU_ESTADO_REGISTRO para actualizar",
      });
    }

    if (!EMU_MODIFICADO_POR) {
      return res.status(400).json({
        message: "El campo EMU_MODIFICADO_POR es requerido",
      });
    }

    const updateData = { EMU_MODIFICADO_POR };

    if (EMU_ESTADO_MULTA) {
      const estado = normalizeEstado(EMU_ESTADO_MULTA);
      if (!estado) {
        return res.status(400).json({
          message: "EMU_ESTADO_MULTA inválido. Se aceptan: A / Activa, P / Pendiente, C / Cancelada",
        });
      }
      updateData.EMU_ESTADO_MULTA = estado;
    }

    if (EMU_ESTADO_REGISTRO) {
      updateData.EMU_ESTADO_REGISTRO = EMU_ESTADO_REGISTRO;
    }

    const [affectedRows] = await UsuarioMultaStore.update(EMU_USUARIO_MULTA, updateData);

    if (affectedRows === 0) {
      return res.status(404).json({
        message: "No se encontró el registro de Usuario Multa para actualizar",
      });
    }

    res.status(200).json({
      message: "Registro de Usuario Multa actualizado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el registro de Usuario Multa",
      error: error.message,
    });
  }
};
