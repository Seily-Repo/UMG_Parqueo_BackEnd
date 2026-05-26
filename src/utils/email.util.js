const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

/**
 * Envía el correo de bienvenida al registrar un usuario.
 * @param {Object} datos - Datos del usuario registrado
 * @param {boolean} esAdmin - Si el registro fue creado por un administrador
 */
async function enviarCorreoRegistro(datos, esAdmin) {
  try {
    const primerNombre = datos.nombres.split(' ')[0];

    const mailOptions = {
      from: `"Parqueo UMG" <${process.env.EMAIL_USER}>`,
      to: datos.correo_electronico,
      subject: '🚗 ¡Bienvenido al Sistema de Parqueo UMG!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #002b5c; color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0; font-size: 24px;">Parqueo UMG</h2>
          </div>
          <div style="padding: 20px; color: #333;">
            <h3 style="color: #00529b; font-size: 20px;">¡Hola, ${primerNombre}!</h3>
            <p style="font-size: 16px;">Tu cuenta para el <strong>Sistema de Control de Parqueo</strong> ha sido creada.</p>
            
            <div style="background-color: #f8f9fa; border-left: 4px solid #00b4d8; padding: 15px; margin-top: 20px; border-radius: 4px;">
              <p style="margin: 5px 0; font-size: 16px;"><strong>Tu Carné de Acceso:</strong> <span style="color: #00529b;">${datos.carne}</span></p>
              
              ${esAdmin ? `
              <p style="margin: 5px 0; font-size: 16px;"><strong>Contraseña Temporal:</strong> <span style="color: #d32f2f;">${datos.password}</span></p>
              <p style="color: #666; font-size: 14px; margin-top: 10px;">(Por tu seguridad, te recomendamos cambiar esta contraseña al iniciar sesión por primera vez).</p>
              <div style="text-align: center; margin-top: 25px;">
                <a href="http://10.0.40.10/" style="background-color: #00b4d8; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Ir al Login</a>
              </div>
              ` : ''}
              
            </div>
          </div>
        </div>
      `
    };

    // 🚀 ENVIAMOS EL CORREO EN SEGUNDO PLANO SIN BLOQUEAR LA RESPUESTA HTTP
    transporter.sendMail(mailOptions).then(() => {
      console.log("✉️ [REGISTRO] Correo HTML enviado con éxito en segundo plano");
    }).catch((errEmail) => {
      console.error("❌ [EMAIL ERROR] Falló el correo en segundo plano:", errEmail);
    });
    
    // Devolvemos true inmediatamente sin esperar
    return true;
  } catch (errSync) {
    console.error("❌ [EMAIL ERROR] Error síncrono al preparar correo:", errSync);
    return false;
  }
}

/**
 * Envía el correo con el enlace de recuperación de contraseña.
 * @param {string} correo - Correo del usuario
 * @param {string} primerNombre - Primer nombre del usuario
 * @param {string} token - JWT de recuperación
 */
async function enviarCorreoRecuperacion(correo, primerNombre, token) {
  try {
    const enlace = `http://localhost:3000/reset-password?token=${token}`;

    const mailOptions = {
      from: `"Parqueo UMG" <${process.env.EMAIL_USER}>`,
      to: correo,
      subject: '🔒 Recuperación de Contraseña - Parqueo UMG',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #002b5c; color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0; font-size: 24px;">Parqueo UMG</h2>
          </div>
          <div style="padding: 20px; color: #333;">
            <h3 style="color: #00529b; font-size: 20px;">¡Hola, ${primerNombre}!</h3>
            <p style="font-size: 16px;">Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en el <strong>Sistema de Control de Parqueo</strong>.</p>
            
            <div style="background-color: #f8f9fa; border-left: 4px solid #00b4d8; padding: 15px; margin-top: 20px; border-radius: 4px; text-align: center;">
              <p style="font-size: 16px; margin-bottom: 20px;">Haz clic en el siguiente botón para cambiar tu contraseña. Este enlace expira en 15 minutos.</p>
              
              <a href="${enlace}" style="background-color: #00529b; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Restablecer mi Contraseña</a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">Si tú no realizaste esta solicitud, puedes ignorar este correo. Tu cuenta sigue estando segura.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("✉️ [RECUPERACIÓN] Correo HTML enviado con éxito");
    return true;
  } catch (errEmail) {
    console.error("❌ [EMAIL ERROR] Falló el correo de recuperación:", errEmail);
    return false;
  }
}

module.exports = { transporter, enviarCorreoRegistro, enviarCorreoRecuperacion };
