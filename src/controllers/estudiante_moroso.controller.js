const EstudianteMorosoStore = require("../store/estudiante_moroso.store");

const regexCarne = /^\d{4}-\d{2}-\d+$/;

exports.getAllEstudianteMoroso = async (req, res) => {
  try {
    const morosos = await EstudianteMorosoStore.getAll();
    res.status(200).json(morosos);
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
    res.status(200).json(morosos);
  } catch (error) {
    res.status(500).json({
      message: 'Error al buscar el estudiante moroso por carné',
      error: error.message,
    });
  }
};

exports.getEstudianteMorosoById = async (req, res) => {
  try {
    const { MOR_BLACKLIST_LOG } = req.params;
    const moroso = await EstudianteMorosoStore.getById(MOR_BLACKLIST_LOG);

    if (!moroso) {
      return res.status(404).json({
        message: 'Estudiante moroso no encontrado',
      });
    }

    res.status(200).json(moroso);
  } catch (error) {
    res.status(500).json({
      message: 'Error al buscar el estudiante moroso por ID',
      error: error.message,
    });
  }
};

exports.createEstudianteMoroso = async (req, res) => {
  try {
    const {
      MOR_BLACKLIST_LOG,
      EST_CARNE,
      MOR_FECHA_AGREGADO,
      MOR_MOTIVO,
      MOR_ESTADO,
    } = req.body;

    if (!MOR_BLACKLIST_LOG || !EST_CARNE || !MOR_FECHA_AGREGADO || !MOR_ESTADO) {
      return res.status(400).json({
        message:
          'Faltan campos obligatorios. Se requieren MOR_BLACKLIST_LOG, EST_CARNE, MOR_FECHA_AGREGADO y MOR_ESTADO.',
      });
    }

    if (!regexCarne.test(EST_CARNE)) {
      return res.status(400).json({
        message: 'Formato de carné inválido. Ej: 5190-23-202034',
      });
    }

    const moroso = await EstudianteMorosoStore.create({
      MOR_BLACKLIST_LOG,
      EST_CARNE,
      MOR_FECHA_AGREGADO,
      MOR_MOTIVO,
      MOR_ESTADO,
    });

    res.status(201).json({
      message: 'Estudiante moroso creado exitosamente',
      data: moroso,
    });
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

    if (!EST_CARNE && !MOR_FECHA_AGREGADO && MOR_MOTIVO === undefined && !MOR_ESTADO) {
      return res.status(400).json({
        message:
          'Debe enviar al menos uno de los campos a actualizar: EST_CARNE, MOR_FECHA_AGREGADO, MOR_MOTIVO o MOR_ESTADO.',
      });
    }

    if (EST_CARNE && !regexCarne.test(EST_CARNE)) {
      return res.status(400).json({
        message: 'Formato de carné inválido. Ej: 5190-23-202034',
      });
    }

    const [updatedRows] = await EstudianteMorosoStore.update(MOR_BLACKLIST_LOG, {
      EST_CARNE,
      MOR_FECHA_AGREGADO,
      MOR_MOTIVO,
      MOR_ESTADO,
    });

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
