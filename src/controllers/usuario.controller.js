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