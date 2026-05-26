const Usuario = require('../model/usuario.model');
const DatosEmergencia = require('../model/datos_emergencia.model');
const Rol = require('../model/rol.model');
const { sequelize } = require('../config/db');
const { limpiarCarne, formatearCarne } = require('../utils/helpers');

class UsuarioStore {
  /**
   * Busca un usuario por carné numérico o correo para login
   */
  static async findForLogin(carne, correo) {
    const carneLimpio = limpiarCarne(carne);
    const rows = await Usuario.findAll({
      where: sequelize.literal(
        `(LR_CARNE = ${carneLimpio || 0} OR LR_CORREO_INSTITUCIONAL = '${(correo || 'N/A').replace(/'/g, "''")}') AND LR_ACTIVO = 1`
      ),
      raw: true,
    });
    // Mapear a las llaves que espera auth.controller
    return rows.map(r => ({
      CARNE: r.LR_CARNE,
      NOMBRES: r.LR_NOMBRES,
      APELLIDOS: r.LR_APELLIDOS,
      CORREO_INSTITUCIONAL: r.LR_CORREO_INSTITUCIONAL,
      TELEFONO: r.LR_TELEFONO,
      CONTRASENA: r.LR_CONTRASENA,
      ID_ROL: r.ROL_ID_ROL,
      ID_JORNADA: r.JOR_ID_JORNADA,
      REQUIERE_CAMBIO: r.LR_REQUIERE_CAMBIO_PASS,
    }));
  }

  /**
   * Registra un nuevo usuario con datos de emergencia en una transacción.
   */
  static async crear(datos, contrasenaEncriptada, esAdmin) {
    const carneLimpio = limpiarCarne(datos.carne);
    const requiereCambio = esAdmin ? 1 : 0;

    const t = await sequelize.transaction();
    try {
      await Usuario.create({
        LR_CARNE: carneLimpio,
        LR_NOMBRES: datos.nombres,
        LR_APELLIDOS: datos.apellidos,
        LR_CORREO_INSTITUCIONAL: datos.correo_electronico,
        LR_CONTRASENA: contrasenaEncriptada,
        LR_TELEFONO: datos.telefonos || null,
        MUN_ID_MUNICIPIO: datos.id_municipio ? parseInt(datos.id_municipio) : null,
        LR_ZONA: datos.zona ? parseInt(datos.zona) : null,
        LR_NOMENCLATURA: datos.nomenclatura || 'N/A',
        CAT_ID_CATEGORIA: datos.id_rol ? parseInt(datos.id_rol) : 1,
        SEC_ID_SEDE: datos.id_sede ? parseInt(datos.id_sede) : 1,
        FAC_ID_FACULTAD: datos.id_facultad ? parseInt(datos.id_facultad) : null,
        CIC_ID_CICLO: datos.id_ciclo ? parseInt(datos.id_ciclo) : null,
        SEC_ID_SECCION: datos.id_seccion ? parseInt(datos.id_seccion) : null,
        JOR_ID_JORNADA: datos.id_jornada ? parseInt(datos.id_jornada) : 1,
        // [LOG-003] Se ignora la creación de cuentas de invitado. Por defecto el rol es 2 (USUARIO)
        ROL_ID_ROL: (esAdmin && datos.id_rol) ? parseInt(datos.id_rol) : 2,
        LR_ACTIVO: 1,
        LR_REQUIERE_CAMBIO_PASS: requiereCambio,
      }, { transaction: t });
      console.log("✅ [REGISTRO] Usuario insertado en LR_USUARIO");

      // Generar ID para datos de emergencia
      const [maxResult] = await sequelize.query(
        'SELECT NVL(MAX(DAE_ID_EMERGENCIA), 0) + 1 AS NEXT_ID FROM INFRA_DEV.LR_DATOS_EMERGENCIA',
        { transaction: t, type: sequelize.QueryTypes.SELECT }
      );
      await DatosEmergencia.create({
        DAE_ID_EMERGENCIA: maxResult.NEXT_ID,
        LR_CARNE: carneLimpio,
        DAE_NOMBRE_CONTACTO: datos.emergencia_nombre || 'Pendiente',
        DAE_TELEFONO_CONTACTO: datos.emergencia_telefono || '00000000',
      }, { transaction: t });
      console.log("✅ [REGISTRO] Datos de emergencia insertados");

      await t.commit();
      console.log("💾 [REGISTRO] COMMIT EJECUTADO CORRECTAMENTE");
      return true;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  /**
   * Actualiza la contraseña de un usuario.
   */
  static async cambiarPassword(carne, nuevaPasswordHash) {
    const carneLimpio = limpiarCarne(carne);
    await Usuario.update(
      { LR_CONTRASENA: nuevaPasswordHash, LR_REQUIERE_CAMBIO_PASS: 0 },
      { where: { LR_CARNE: carneLimpio } }
    );
  }

  /**
   * Obtiene la lista de usuarios con nombre de rol (para panel admin).
   * Retorna las llaves EXACTAS que espera DashboardAdmin.tsx:
   * CARNE, NOMBRES, APELLIDOS, NOMBRE, CORREO, TELEFONO, ID_ROL, ROL, ESTADO
   */
  static async getAll() {
    const [rows] = await sequelize.query(
      `SELECT u.LR_CARNE as CARNE, u.LR_NOMBRES as NOMBRES, u.LR_APELLIDOS as APELLIDOS, 
              u.LR_NOMBRES || ' ' || u.LR_APELLIDOS AS NOMBRE, 
              u.LR_CORREO_INSTITUCIONAL AS CORREO, u.LR_TELEFONO as TELEFONO, u.ROL_ID_ROL as ID_ROL,
              r.ROL_NOMBRE_ROL AS ROL, CASE WHEN u.LR_ACTIVO = 1 THEN 'Activo' ELSE 'Inactivo' END AS ESTADO
       FROM INFRA_DEV.LR_USUARIO u JOIN INFRA_DEV.LR_ROL r ON u.ROL_ID_ROL = r.ROL_ID_ROL 
       ORDER BY u.LR_FECHA_REGISTRO DESC`
    );
    return rows;
  }

  /**
   * Actualiza los datos de un usuario (admin).
   */
  static async update(carne, datos) {
    const carneLimpio = limpiarCarne(carne);
    await Usuario.update({
      LR_NOMBRES: datos.nombres,
      LR_APELLIDOS: datos.apellidos,
      LR_CORREO_INSTITUCIONAL: datos.correo_institucional,
      LR_TELEFONO: datos.telefono || null,
      ROL_ID_ROL: parseInt(datos.id_rol),
    }, { where: { LR_CARNE: carneLimpio } });
  }

  /**
   * Cambia el estado activo/inactivo de un usuario.
   */
  static async cambiarEstado(carne, nuevoEstado) {
    const carneLimpio = limpiarCarne(carne);
    await Usuario.update(
      { LR_ACTIVO: nuevoEstado },
      { where: { LR_CARNE: carneLimpio } }
    );
  }
}

module.exports = UsuarioStore;
