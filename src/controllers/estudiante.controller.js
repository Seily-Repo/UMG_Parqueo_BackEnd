const EstudianteStore = require("../store/estudiante.store");

const regexCarne = /^\d{4}-\d{2}-\d+$/;

exports.getAllEstudiantes = async (req, res) => {
  try {
    const estudiantes = await EstudianteStore.getAll();
    res.status(200).json(estudiantes);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los estudiantes",
      error: error.message,
    });
  }
};

exports.getEstudianteByCarne = async (req, res) => {
  try {
    if (!regexCarne.test(req.params.carne)) {
      return res
        .status(400)
        .json({ message: "Formato de carné inválido. (ej. 5190-23-202034)" });
    }

    const estudiante = await EstudianteStore.getByCarne(req.params.carne);
    if (!estudiante) {
      return res.status(404).json({
        message: "Estudiante no encontrado por carné",
      });
    }
    res.status(200).json(estudiante);
  } catch (error) {
    res.status(500).json({
      message: "Error al buscar el estudiante",
      error: error.message,
    });
  }
};

exports.createEstudiante = async (req, res) => {
  try {
    if (!req.body.EST_CARNE || !regexCarne.test(req.body.EST_CARNE)) {
      return res.status(400).json({
        message:
          "Formato de carné inválido. Debe incluir guiones (ej. 5190-23-202034)",
      });
    }

    // Validar que la carné sea única
    const existente = await EstudianteStore.getByCarne(req.body.EST_CARNE);
    if (existente) {
      return res.status(400).json({
        message: "El carné del estudiante ya existe",
      });
    }

    //Validar que el nombre no incluya numeros solo letras con espacios y acentos
    if (
      !req.body.EST_NOMBRE_COMPLETO ||
      !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(req.body.EST_NOMBRE_COMPLETO)
    ) {
      return res.status(400).json({
        message: "El nombre del estudiante es inválido",
      });
    }

    //Validar que el correo del Estudiante sea correcto
    if (
      !req.body.EST_EMAIL ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.EST_EMAIL)
    ) {
      return res.status(400).json({
        message: "El correo del estudiante es inválido",
      });
    }

    //Insertar fecha actual
    req.body.EST_FECHA_CREACION = new Date();

    const estudiante = await EstudianteStore.create(req.body);
    res.status(201).json({
      message: "Estudiante creado exitosamente",
      data: estudiante,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear el estudiante",
      error: error.message,
    });
  }
};

exports.updateEstudiante = async (req, res) => {
  try {
    if (!regexCarne.test(req.params.carne)) {
      return res.status(400).json({
        message: "Formato de carné inválido en la URL. (ej. 5190-23-202034)",
      });
    }

    const estudiante = await EstudianteStore.getByCarne(req.params.carne);
    if (!estudiante) {
      return res
        .status(404)
        .json({ message: "Estudiante no encontrado para actualizar" });
    }

    // Validar que la carné sea única si se está actualizando
    if (req.body.EST_CARNE) {
      if (!regexCarne.test(req.body.EST_CARNE)) {
        return res.status(400).json({
          message:
            "Formato de carné inválido en el cuerpo. (ej. 5190-23-202034)",
        });
      }

      const existente = await EstudianteStore.getByCarne(req.body.EST_CARNE);
      if (existente && existente.EST_CARNE !== req.params.carne) {
        return res.status(400).json({
          message: "El carné del estudiante ya existe",
        });
      }
    }

    await EstudianteStore.update(req.params.carne, req.body);

    res.status(200).json({
      message: "Estudiante actualizado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el estudiante",
      error: error.message,
    });
  }
};

exports.deleteEstudiante = async (req, res) => {
  try {
    if (!regexCarne.test(req.params.carne)) {
      return res
        .status(400)
        .json({ message: "Formato de carné inválido. (ej. 5190-23-202034)" });
    }

    const rowsDeleted = await EstudianteStore.delete(req.params.carne);
    if (rowsDeleted === 0) {
      return res.status(404).json({
        message: "Estudiante no encontrado para eliminar",
      });
    }

    res.status(200).json({
      message: "Estudiante eliminado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar el estudiante",
      error: error.message,
    });
  }
};
