const nodemailer = require("nodemailer");
require("dotenv").config();

// Configuración del transporter usando las variables de entorno para Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Contraseña de Aplicación de Gmail
  },
});

/**
 * Plantilla HTML básica y moderna para notificación de multa
 */
const generarHtmlMulta = (
  carnet,
  nombre,
  placa,
  motivo,
  monto,
  fecha
) => {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f4f5f7; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        
        <div style="text-align: right; color: #333; font-size: 13px; margin-bottom: 20px;">
          Notificación de Infracción
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 26px; font-weight: bold; letter-spacing: 1px;">
            <span style="color: #4aa0d5;">MI</span> <span style="color: #1a365d;">UMG</span>
          </div>
        </div>

        <h2 style="color: #d9534f; font-weight: normal; font-size: 22px; margin-bottom: 15px;">Aviso de Multa de Parqueo</h2>

        <p style="color: #555555; font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
          Estimado/a <strong>${nombre}</strong>, se ha registrado una infracción de parqueo asociada a tu vehículo. A continuación, los detalles:
        </p>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #555555;">
          <tbody>
            <tr>
              <td style="padding: 12px 15px 12px 0; border-top: 1px solid #eeeeee; width: 40%; text-align: right; font-weight: bold;">Estudiante</td>
              <td style="padding: 12px 0; border-top: 1px solid #eeeeee; width: 60%;">${nombre + " (" + carnet + ")"}</td>
            </tr>
            <tr>
              <td style="padding: 12px 15px 12px 0; border-top: 1px solid #eeeeee; text-align: right; font-weight: bold;">Vehículo (Placa)</td>
              <td style="padding: 12px 0; border-top: 1px solid #eeeeee;">${placa}</td>
            </tr>
            <tr>
              <td style="padding: 12px 15px 12px 0; border-top: 1px solid #eeeeee; text-align: right; font-weight: bold;">Motivo</td>
              <td style="padding: 12px 0; border-top: 1px solid #eeeeee;">${motivo}</td>
            </tr>
            <tr>
              <td style="padding: 12px 15px 12px 0; border-top: 1px solid #eeeeee; text-align: right; font-weight: bold;">Fecha y Hora</td>
              <td style="padding: 12px 0; border-top: 1px solid #eeeeee;">${fecha}</td>
            </tr>
            <tr>
              <td style="padding: 12px 15px 12px 0; border-top: 1px solid #eeeeee; border-bottom: 1px solid #eeeeee; text-align: right; font-weight: bold;">Monto de Multa</td>
              <td style="padding: 12px 0; border-top: 1px solid #eeeeee; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #d9534f;">Q${monto}</td>
            </tr>
          </tbody>
        </table>

        <p style="color: #555555; font-size: 14px; line-height: 1.6; margin-top: 25px;">
          Te recordamos que puedes realizar el pago en el portal MI UMG o en las cajas autorizadas. Evita cargos adicionales o restricciones en tu ingreso.
        </p>

        <p style="color: #777777; font-size: 13px; line-height: 1.6; margin-top: 35px;">
          Si consideras que esto es un error, puedes escribir a <a href="mailto:soporte@umg.edu.gt" style="color: #4aa0d5; text-decoration: none;">soporte@umg.edu.gt</a> o llamar al 
          <a href="tel:+50224111800" style="color: #4aa0d5; text-decoration: none;">2411 1800 ext. 1223</a>.
        </p>

        <p style="color: #999999; font-size: 12px; text-align: center; margin-top: 40px;">
          © 2026 Universidad Mariano Gálvez de Guatemala
        </p>

      </div>
    </div>
  `;
};

/**
 * Enviar correo de notificación de multa
 */
exports.enviarCorreoMulta = async (
  emailDestino,
  carnet,
  nombre,
  placa,
  motivo,
  monto
) => {
  try {
    const fechaFormat = new Date().toLocaleString("es-GT", {
      timeZone: "America/Guatemala",
    });
    const htmlBody = generarHtmlMulta(
      carnet,
      nombre,
      placa,
      motivo,
      monto,
      fechaFormat
    );

    const mailOptions = {
      from: `"Universidad Mariano Galvez de Guatemala" <${process.env.SMTP_USER}>`,
      to: emailDestino,
      subject: "[miUMG] Notificación de Multa de Parqueo",
      html: htmlBody,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Correo de multa enviado exitosamente: " + info.response);
    return true;
  } catch (error) {
    console.error("Error al enviar el correo de multa:", error);
    // No lanzamos excepcion para no botar la solicitud
    return false;
  }
};
