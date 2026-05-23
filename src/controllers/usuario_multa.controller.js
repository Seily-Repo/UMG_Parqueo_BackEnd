const UsuarioMultaStore = require("../store/usuario_multa.store");
const { enviarCorreoMulta } = require("../utils/email_multa.util");
const { sequelize } = require("../config/db");

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

exports.getUsuarioMultaByCarne = async (req, res) => {
  try {
    const { carne } = req.params;

    if (!carne) {
      return res.status(400).json({
        message: "El parámetro carne es requerido",
      });
    }

    const registros = await UsuarioMultaStore.getByCarneWithMulta(carne);

    if (!registros || registros.length === 0) {
      return res.status(404).json({
        message: "No se encontraron multas para el estudiante indicado",
      });
    }

    const result = registros.map(formatMulta);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los registros de Usuario Multa por carné",
      error: error.message,
    });
  }
};

exports.getUsuarioMultaById = async (req, res) => {
  try {
    const { EMU_USUARIO_MULTA } = req.params;

    if (!EMU_USUARIO_MULTA) {
      return res.status(400).json({
        message: "El parámetro EMU_USUARIO_MULTA es requerido",
      });
    }

    const carneFilter =
      req.user.rol === "ADMINISTRADOR" ? null : req.user.carne;

    const registro = await UsuarioMultaStore.getByIdWithMulta(
      EMU_USUARIO_MULTA,
      carneFilter,
    );

    if (!registro) {
      const message =
        req.user.rol === "ADMINISTRADOR"
          ? "No se encontró el registro de Usuario Multa indicado"
          : "No se encontró el registro de Usuario Multa o no tienes permiso para consultarlo";
      return res.status(404).json({ message });
    }

    res.status(200).json(formatMulta(registro));
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener el registro de Usuario Multa",
      error: error.message,
    });
  }
};

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

    // Enviar notificación de multa por correo
    try {
      const query = `
        SELECT V.VEH_PLACA, U.LR_CARNE, U.LR_NOMBRES, U.LR_APELLIDOS, U.LR_CORREO_INSTITUCIONAL, M.MUL_DESCRIPCION, M.MUL_MONTO_TOTAL
        FROM LR_VEHICULO V
        INNER JOIN LR_USUARIO U ON V.LR_CARNE = U.LR_CARNE
        INNER JOIN CB_MULTA M ON M.MUL_MULTA = :mul_multa
        WHERE V.VEH_ID_VEHICULO = :veh_id
      `;
      const [infoVehiculo] = await sequelize.query(query, {
        replacements: { mul_multa: MUL_MULTA, veh_id: VEH_ID_VEHICULO },
        type: sequelize.QueryTypes.SELECT
      });

      console.log("Datos del vehiculo obtenidos para el correo:", infoVehiculo);

      if (infoVehiculo && infoVehiculo.LR_CORREO_INSTITUCIONAL) {
        const nombreCompleto = `${infoVehiculo.LR_NOMBRES} ${infoVehiculo.LR_APELLIDOS}`;
        console.log(`Intentando enviar correo a: ${infoVehiculo.LR_CORREO_INSTITUCIONAL}`);
        
        await enviarCorreoMulta(
          infoVehiculo.LR_CORREO_INSTITUCIONAL,
          infoVehiculo.LR_CARNE,
          nombreCompleto,
          infoVehiculo.VEH_PLACA,
          infoVehiculo.MUL_DESCRIPCION,
          infoVehiculo.MUL_MONTO_TOTAL
        );
      } else {
        console.log("No se envió el correo: No se encontró información del vehículo o el usuario no tiene correo institucional.");
      }
    } catch (errCorreo) {
      console.error("Error al obtener datos para el correo de multa:", errCorreo);
    }

    res.status(201).json(formatMulta(registro));
  } catch (error) {
    res.status(500).json({
      message: "Error al crear el registro de Usuario Multa",
      error: error.message,
    });
  }
};

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
