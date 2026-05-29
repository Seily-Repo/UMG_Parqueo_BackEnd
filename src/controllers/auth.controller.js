const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UsuarioStore = require('../store/usuario.store');
const { limpiarCarne, formatearCarne } = require('../utils/helpers');
const { enviarCorreoRegistro, enviarCorreoRecuperacion } = require('../utils/email.util');

/**
 * POST /api/auth/registro
 */
exports.registro = async (req, res) => {
  try {
    const { creadoPorAdmin, ...datos } = req.body;
    console.log("🚀 [REGISTRO] React envió estos datos:", datos);

    // [LOG-007] Validación de Campos Obligatorios
    if (!datos.carne || !datos.nombres || !datos.apellidos || !datos.correo_electronico || !datos.password) {
      return res.status(400).json({ error: "Los campos carné, nombres, apellidos, correo electrónico y contraseña son obligatorios." });
    }

    // [LOG-001 & LOG-006 & LOG-008] Normalización y validación del correo electrónico
    datos.correo_electronico = datos.correo_electronico.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@miumg\.edu\.gt$/;
    if (!emailRegex.test(datos.correo_electronico)) {
      return res.status(400).json({ error: "El correo debe tener un formato válido y terminar en @miumg.edu.gt" });
    }

    // [LOG-005] Fuerza de Contraseña
    if (datos.password.length < 8) {
      return res.status(400).json({ error: "La contraseña debe tener un mínimo de 8 caracteres." });
    }

    // Verificación preventiva de duplicados (Carné o Correo)
    const existeUsuario = await UsuarioStore.findForLogin(datos.carne, datos.correo_electronico);
    if (existeUsuario && existeUsuario.length > 0) {
      return res.status(400).json({ error: "El carné o correo ya se encuentran registrados." });
    }

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
    // [LOG-009] Manejo de Errores de Carné/Correo Duplicado
    if (err.name === 'SequelizeUniqueConstraintError' || err.errorNum === 1 || (err.message && err.message.includes('ORA-00001'))) {
      return res.status(400).json({ error: "El carné o correo ya se encuentran registrados." });
    }
    res.status(500).json({ error: "Error de servidor", detalle: err.message });
  }
};

/**
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    let { carne, correo_institucional, correo_electronico, password } = req.body;

    // [LOG-001 & LOG-006 & LOG-008] Normalización y validación en Login
    if (correo_institucional) correo_institucional = correo_institucional.toLowerCase().trim();
    if (correo_electronico) correo_electronico = correo_electronico.toLowerCase().trim();

    const identificadorCorreo = correo_institucional || correo_electronico || null;

    if (identificadorCorreo) {
      const emailRegex = /^[^\s@]+@miumg\.edu\.gt$/;
      if (!emailRegex.test(identificadorCorreo)) {
        return res.status(400).json({ error: "El correo debe terminar en @miumg.edu.gt" });
      }
    }

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
    // Ignorando roles de invitado (LOG-003)
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

/**
 * POST /api/auth/recuperar-password
 * [LOG-002] Cascarón de endpoint para recuperar contraseña
 */
exports.recuperarPassword = async (req, res) => {
  try {
    let { correo_electronico } = req.body;

    if (!correo_electronico) {
      return res.status(400).json({ error: "El correo electrónico es requerido." });
    }

    correo_electronico = correo_electronico.toLowerCase().trim();

    // Verificación de formato y dominio
    const emailRegex = /^[^\s@]+@miumg\.edu\.gt$/;
    if (!emailRegex.test(correo_electronico)) {
      return res.status(400).json({ error: "El correo debe tener un formato válido y terminar en @miumg.edu.gt" });
    }

    const rows = await UsuarioStore.findForLogin(null, correo_electronico);

    if (rows.length > 0) {
      const usuario = rows[0];
      const primerNombre = usuario.NOMBRES ? usuario.NOMBRES.split(' ')[0] : 'Usuario';
      
      const tokenRecuperacion = jwt.sign(
        { carne: usuario.CARNE, correo: correo_electronico, proposito: 'recuperacion' },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      // Enviar correo de forma asíncrona
      enviarCorreoRecuperacion(correo_electronico, primerNombre, tokenRecuperacion);
    }

    res.status(200).json({ mensaje: "Si el correo está registrado, se enviarán instrucciones." });

  } catch (err) {
    res.status(500).json({ error: "Error de servidor", detalle: err.message });
  }
};

/**
 * POST /api/auth/reset-password
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, nuevaPassword } = req.body;
    if (!token || !nuevaPassword) {
      return res.status(400).json({ error: "Faltan datos obligatorios." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "El enlace es inválido o ha expirado." });
    }

    if (decoded.proposito !== 'recuperacion') {
      return res.status(401).json({ error: "Token inválido para esta operación." });
    }

    const salt = await bcrypt.genSalt(10);
    const contrasenaEncriptada = await bcrypt.hash(nuevaPassword, salt);

    await UsuarioStore.cambiarPassword(decoded.carne, contrasenaEncriptada);
    res.status(200).json({ mensaje: "Contraseña restablecida exitosamente." });
  } catch (err) {
    res.status(500).json({ error: "Error de servidor", detalle: err.message });
  }
};
