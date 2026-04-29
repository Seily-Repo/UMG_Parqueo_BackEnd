const UsuarioMorosoStore = require("../store/usuario_moroso.store");

const regexCarne = /^\d{4}-\d{2}-\d+$/;
const validEstados = ["A", "I", "S"];

const formatDateTime = (value) => {
  if (!value) return value;
  const date = new Date(value);
  const pad = (num) => String(num).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const formatMoroso = (record) => {
  if (!record) return record;
  const data = typeof record.toJSON === "function" ? record.toJSON() : { ...record };
  return {
    ...data,
    MOR_FECHA_AGREGADO: formatDateTime(data.MOR_FECHA_AGREGADO),
  };
};

exports.getAllUsuarioMoroso = async (req, res) => {
  try {
    const morosos = await UsuarioMorosoStore.getAll();
    const result = Array.isArray(morosos)
      ? morosos.map(formatMoroso)
      : formatMoroso(morosos);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener los estudiantes morosos',
      error: error.message,
    });
  }
};

exports.getUsuarioMorosoByCarne = async (req, res) => {
  try {
    const { carne } = req.params;
    if (!regexCarne.test(carne)) {
      return res.status(400).json({
        message: 'Formato de carné inválido. Ej: 5190-23-202034',
      });
    }

    const morosos = await UsuarioMorosoStore.getByCarne(carne);
    const result = Array.isArray(morosos)
      ? morosos.map(formatMoroso)
      : formatMoroso(morosos);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error al buscar el estudiante moroso por carné',
      error: error.message,
    });
  }
};

exports.createUsuarioMoroso = async (req, res) => {
  try {
    const { LR_CARNE, MOR_MOTIVO, MOR_MODIFICADO_POR, MOR_ESTADO_MOROSO, MOR_ESTADO_REGISTRO } = req.body;

    if (!LR_CARNE || !MOR_MOTIVO) {
      return res.status(400).json({
        message: 'Faltan campos obligatorios. Se requieren LR_CARNE y MOR_MOTIVO.',
      });
    }

    // Validación de estado
    const estadoMoroso = MOR_ESTADO_MOROSO ? String(MOR_ESTADO_MOROSO).toUpperCase() : 'A';
    const estadoRegistro = MOR_ESTADO_REGISTRO ? String(MOR_ESTADO_REGISTRO).toUpperCase() : 'A';
    if (!['A', 'I', 'S'].includes(estadoMoroso)) {
      return res.status(400).json({
        message: 'MOR_ESTADO_MOROSO inválido. Solo se aceptan A (Activo), I (Inactivo) o S (Suspendido).',
      });
    }
    if (!['A', 'I', 'S'].includes(estadoRegistro)) {
      return res.status(400).json({
        message: 'MOR_ESTADO_REGISTRO inválido. Solo se aceptan A (Activo), I (Inactivo) o S (Suspendido).',
      });
    }

    const moroso = await UsuarioMorosoStore.create({
      LR_CARNE,
      MOR_FECHA_AGREGADO: new Date(),
      MOR_MOTIVO,
      MOR_MODIFICADO_POR,
      MOR_FECHA_MODIFICACION: null,
      MOR_ESTADO_MOROSO: estadoMoroso,
      MOR_ESTADO_REGISTRO: estadoRegistro,
    });

    res.status(201).json(formatMoroso(moroso));
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear el estudiante moroso',
      error: error.message,
    });
  }
};

exports.updateUsuarioMoroso = async (req, res) => {
  try {
    const { MOR_USUARIO_MOROSO } = req.params;
    const { MOR_MOTIVO, MOR_MODIFICADO_POR, MOR_ESTADO_MOROSO, MOR_ESTADO_REGISTRO } = req.body;

    if (!MOR_MOTIVO && !MOR_MODIFICADO_POR && !MOR_ESTADO_MOROSO && !MOR_ESTADO_REGISTRO) {
      return res.status(400).json({
        message: 'Debe enviar al menos uno de los campos a modificar: MOR_MOTIVO, MOR_MODIFICADO_POR, MOR_ESTADO_MOROSO o MOR_ESTADO_REGISTRO.',
      });
    }

    const updateData = {};
    if (MOR_MOTIVO !== undefined) updateData.MOR_MOTIVO = MOR_MOTIVO;
    if (MOR_MODIFICADO_POR !== undefined) updateData.MOR_MODIFICADO_POR = MOR_MODIFICADO_POR;
    updateData.MOR_FECHA_MODIFICACION = new Date();
    if (MOR_ESTADO_MOROSO !== undefined) updateData.MOR_ESTADO_MOROSO = MOR_ESTADO_MOROSO;
    if (MOR_ESTADO_REGISTRO !== undefined) updateData.MOR_ESTADO_REGISTRO = MOR_ESTADO_REGISTRO;

    const [updatedRows] = await UsuarioMorosoStore.update(MOR_USUARIO_MOROSO, updateData);

    if (updatedRows === 0) {
      return res.status(404).json({
        message: 'No se encontró el usuario moroso para actualizar.',
      });
    }

    res.status(200).json({ message: 'Usuario moroso actualizado correctamente.' });
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar el estudiante moroso',
      error: error.message,
    });
  }
};
