const UsuarioStore = require("../store/usuario.store");
const LoginService = require("../services/login.services");

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

exports.getVehiculoByPlaca = async (req, res) => {
  try {
    const { placa } = req.params;
    const placaLimpiada = placa ? placa.replace(/[\s-]/g, '').toUpperCase() : '';

    if (!placaLimpiada) {
      return res.status(400).json({ error: "Placa Inválida" });
    }

    // Extraer token para pasarlo al servicio
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    const vehiculo = await LoginService.consultarVehiculoAPI(placaLimpiada, token);

    if (!vehiculo) {
      return res.status(404).json({ error: "Placa no encontrada" });
    }

    // Obtener información extra del estudiante
    let estudianteNombres = null;
    let estudianteApellidos = null;
    let estudianteCorreo = null;

    if (vehiculo.CARNE) {
      const usuario = await UsuarioStore.getByCarne(vehiculo.CARNE);
      if (usuario) {
        estudianteNombres = usuario.LR_NOMBRES;
        estudianteApellidos = usuario.LR_APELLIDOS;
        estudianteCorreo = usuario.LR_CORREO_INSTITUCIONAL;
      }
    }

    res.status(200).json({
      ...vehiculo,
      ESTUDIANTE_NOMBRE: estudianteNombres,
      ESTUDIANTE_APELLIDO: estudianteApellidos,
      ESTUDIANTE_CORREO: estudianteCorreo
    });
  } catch (error) {
    if (error.message.includes("Inválida")) {
      return res.status(400).json({ error: "Placa Inválida" });
    }
    if (error.message.includes("conectar a login")) {
      return res.status(503).json({ error: "No se pudo conectar a login" });
    }
    res.status(500).json({ error: "Error Interno", detalle: error.message });
  }
};