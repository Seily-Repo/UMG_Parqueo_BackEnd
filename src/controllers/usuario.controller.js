const UsuarioStore = require("../store/usuario.store");

exports.getAllUsuarios = async (req, res) => {
  try {
    const usuarios = await UsuarioStore.getAll();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los usuarios",
      error: error.message,
    });
  }
};

exports.getUsuarioByCarne = async (req, res) => {
  try {
    const carneNormalizado = req.params.carne ? req.params.carne.replace(/-/g, '') : null;
    const usuario = await UsuarioStore.getByCarne(carneNormalizado);
    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado por carné",
      });
    }
    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({
      message: "Error al buscar el usuario",
      error: error.message,
    });
  }
};

exports.createUsuario = async (req, res) => {
  try {
    if (!req.body.EST_CARNE || !regexCarne.test(req.body.EST_CARNE)) {
      return res.status(400).json({
        message:
          "Formato de carné inválido. Debe incluir guiones (ej. 5190-23-202034)",
      });
    }

    // Validar que la carné sea única
    const existente = await UsuarioStore.getByCarne(req.body.EST_CARNE);
    if (existente) {
      return res.status(400).json({
        message: "El carné del usuario ya existe",
      });
    }

    //Validar que el nombre no incluya numeros solo letras con espacios y acentos
    if (
      !req.body.LR_NOMBRES ||
      !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(req.body.LR_NOMBRES)
    ) {
      return res.status(400).json({
        message: "El nombre del usuario es inválido",
      });
    }

    //Validar que el apellido no incluya numeros solo letras con espacios y acentos
    if (
      !req.body.LR_APELLIDOS ||
      !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(req.body.LR_APELLIDOS)
    ) {
      return res.status(400).json({
        message: "El apellido del usuario es inválido",
      });
    }

    //Validar que el correo del Estudiante sea correcto
    if (
      !req.body.LR_CORREO_INSTITUCIONAL ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.LR_CORREO_INSTITUCIONAL)
    ) {
      return res.status(400).json({
        message: "El correo del usuario es inválido",
      });
    }


    const usuario = await UsuarioStore.create(req.body);
    res.status(201).json({
      message: "Usuario creado exitosamente",
      data: usuario,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear el estudiante",
      error: error.message,
    });
  }
};

exports.updateUsuario = async (req, res) => {
  try {
    if (!regexCarne.test(req.params.carne)) {
      return res.status(400).json({
        message: "Formato de carné inválido en la URL. (ej. 5190-23-202034)",
      });
    }

    const usuario = await UsuarioStore.getByCarne(req.params.carne);
    if (!usuario) {
      return res
        .status(404)
        .json({ message: "Usuario no encontrado para actualizar" });
    }

    // Validar que la carné sea única si se está actualizando
    if (req.body.LR_CARNE) {
      if (!regexCarne.test(req.body.LR_CARNE)) {
        return res.status(400).json({
          message:
            "Formato de carné inválido en el cuerpo. (ej. 5190-23-202034)",
        });
      }

      const existente = await UsuarioStore.getByCarne(req.body.LR_CARNE);
      if (existente && existente.LR_CARNE !== req.params.carne) {
        return res.status(400).json({
          message: "El carné del usuario ya existe",
        });
      }
    }

    await UsuarioStore.update(req.params.carne, req.body);

    res.status(200).json({
      message: "Usuario actualizado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el estudiante",
      error: error.message,
    });
  }
};