const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UsuarioStore = require('../store/usuario.store');
const { limpiarCarne, formatearCarne } = require('../utils/helpers');
const { enviarCorreoRegistro } = require('../utils/email.util');

/**
 * POST /api/auth/registro
 */
exports.registro = async (req, res) => {
  try {
    const { creadoPorAdmin, ...datos } = req.body;
    console.log("🚀 [REGISTRO] React envió estos datos:", datos);

    const salt = await bcrypt.genSalt(10);
    const contrasenaEncriptada = await bcrypt.hash(datos.password, salt);
    const esAdmin = (creadoPorAdmin === true || creadoPorAdmin === 'true');

    console.log("🚀 [REGISTRO] Carné formateado para Oracle:", limpiarCarne(datos.carne));

    await UsuarioStore.crear(datos, contrasenaEncriptada, esAdmin);

    // Enviar correo de bienvenida (no bloquea la respuesta si falla)
    enviarCorreoRegistro(datos, esAdmin);

    res.status(200).json({ mensaje: "Registro exitoso." });
  } catch (err) {
    console.error("❌ [ERROR FATAL EN REGISTRO]:", err);
    if (err.errorNum === 1 || (err.message && err.message.includes('ORA-00001'))) {
      return res.status(400).json({ error: "Carné o correo ya registrado." });
    }
    res.status(500).json({ error: "Error de servidor", detalle: err.message });
  }
};

/**
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { carne, correo_institucional, correo_electronico, password } = req.body;
    const identificadorCorreo = correo_institucional || correo_electronico || null;

    console.log(`🔐 [LOGIN] Intentando con -> Carné: ${limpiarCarne(carne)} | Correo: ${identificadorCorreo}`);

    const rows = await UsuarioStore.findForLogin(carne, identificadorCorreo);

    console.log("🔍 [LOGIN] Resultados encontrados en la DB:", rows);

    if (rows.length === 0) return res.status(401).json({ error: "Carné o contraseña incorrectos." });
    const usuario = rows[0];

    if (!usuario.CONTRASENA) return res.status(401).json({ error: "Este usuario no tiene contraseña registrada." });

    const contrasenaValida = await bcrypt.compare(password, usuario.CONTRASENA);
    if (!contrasenaValida) {
      console.log("❌ [LOGIN] Las contraseñas no coinciden (Hash vs Texto)");
      return res.status(401).json({ error: "Carné o contraseña incorrectos." });
    }

    const carneFormateado = formatearCarne(usuario.CARNE);

    // Mapeo de rol numérico al string que exige el middleware oficial de cobros-back
    const ROLES_MAP = { 1: 'ADMINISTRADOR', 2: 'USUARIO' };
    const rolTexto = ROLES_MAP[usuario.ID_ROL] || 'USUARIO';

    const token = jwt.sign(
      { carne: carneFormateado, rol: rolTexto },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    console.log("✅ [LOGIN] Login Exitoso. Entrando al Dashboard...");

    res.status(200).json({
      mensaje: "Login exitoso",
      token: token,
      usuario: {
        carne: carneFormateado,
        nombres: usuario.NOMBRES,
        apellidos: usuario.APELLIDOS,
        correo_institucional: usuario.CORREO_INSTITUCIONAL,
        telefono: usuario.TELEFONO,
        id_jornada: usuario.ID_JORNADA,
        rol: rolTexto,
        requiereCambioPass: usuario.REQUIERE_CAMBIO === 1
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Error de servidor", detalle: err.message });
  }
};

/**
 * PUT /api/auth/cambiar-password
 */
exports.cambiarPassword = async (req, res) => {
  try {
    const { carne, nuevaPassword } = req.body;
    const salt = await bcrypt.genSalt(10);
    const contrasenaEncriptada = await bcrypt.hash(nuevaPassword, salt);

    await UsuarioStore.cambiarPassword(carne, contrasenaEncriptada);
    res.status(200).json({ mensaje: "Contraseña actualizada exitosamente." });
  } catch (err) {
    res.status(500).json({ error: "Error interno del servidor", detalle: err.message });
  }
};
