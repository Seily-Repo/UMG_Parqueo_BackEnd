const EstudianteMorosoStore = require("../store/estudiante_moroso.store");

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

exports.getAllEstudianteMoroso = async (req, res) => {
  try {
    const morosos = await EstudianteMorosoStore.getAll();
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

exports.getEstudianteMorosoByCarne = async (req, res) => {
  try {
    const { carne } = req.params;
    if (!regexCarne.test(carne)) {
      return res.status(400).json({
        message: 'Formato de carné inválido. Ej: 5190-23-202034',
      });
    }

    const morosos = await EstudianteMorosoStore.getByCarne(carne);
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

exports.createEstudianteMoroso = async (req, res) => {
  try {
    const { EST_CARNE, MOR_MOTIVO, MOR_ESTADO } = req.body;

    if (!EST_CARNE || !MOR_MOTIVO || !MOR_ESTADO) {
      return res.status(400).json({
        message:
          'Faltan campos obligatorios. Se requieren EST_CARNE, MOR_MOTIVO y MOR_ESTADO.',
      });
    }

    if (!regexCarne.test(EST_CARNE)) {
      return res.status(400).json({
        message: 'Formato de carné inválido. Ej: 5190-23-202034',
      });
    }

    const estado = String(MOR_ESTADO).toUpperCase();
    if (!validEstados.includes(estado)) {
      return res.status(400).json({
        message:
          'MOR_ESTADO inválido. Solo se aceptan A (Activo), I (Inactivo) o S (Suspendido).',
      });
    }

    const moroso = await EstudianteMorosoStore.create({
      EST_CARNE,
      MOR_FECHA_AGREGADO: new Date(),
      MOR_MOTIVO,
      MOR_ESTADO: estado,
    });

    res.status(201).json(formatMoroso(moroso));
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear el estudiante moroso',
      error: error.message,
    });
  }
};

exports.updateEstudianteMoroso = async (req, res) => {
  try {
    const { MOR_BLACKLIST_LOG } = req.params;
    const { EST_CARNE, MOR_FECHA_AGREGADO, MOR_MOTIVO, MOR_ESTADO } = req.body;

    if (EST_CARNE !== undefined) {
      return res.status(400).json({
        message: 'EST_CARNE no se puede modificar en la actualización del registro moroso.',
      });
    }

    if (MOR_FECHA_AGREGADO !== undefined) {
      return res.status(400).json({
        message: 'MOR_FECHA_AGREGADO se actualiza automáticamente y no debe enviarse en la solicitud.',
      });
    }

    if (MOR_MOTIVO === undefined && MOR_ESTADO === undefined) {
      return res.status(400).json({
        message:
          'Debe enviar al menos uno de los campos a modificar: MOR_MOTIVO o MOR_ESTADO.',
      });
    }

    const updateData = { MOR_FECHA_AGREGADO: new Date() };

    if (MOR_MOTIVO !== undefined) {
      updateData.MOR_MOTIVO = MOR_MOTIVO;
    }

    if (MOR_ESTADO !== undefined) {
      const estado = String(MOR_ESTADO).toUpperCase();
      if (!validEstados.includes(estado)) {
        return res.status(400).json({
          message:
            'MOR_ESTADO inválido. Solo se aceptan A (Activo), I (Inactivo) o S (Suspendido).',
        });
      }
      updateData.MOR_ESTADO = estado;
    }

    const [updatedRows] = await EstudianteMorosoStore.update(MOR_BLACKLIST_LOG, updateData);

    if (updatedRows === 0) {
      return res.status(404).json({
        message: 'No se encontró el estudiante moroso para actualizar',
      });
    }

    res.status(200).json({
      message: 'Estudiante moroso actualizado exitosamente',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar el estudiante moroso',
      error: error.message,
    });
  }
};
