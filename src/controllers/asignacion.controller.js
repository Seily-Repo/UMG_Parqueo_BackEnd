const AsignacionStore = require("../store/asignacion.store");
const EspacioStore = require("../store/espacio.store");
const PagoStore = require("../store/pago.store");

exports.createAsignacion = async (req, res) => {
  try {
    const { ES_Espacio, id_ciclo, id_jornada, carne_usuario, correlativo } = req.body;

    if (!ES_Espacio || !id_ciclo || !id_jornada || !carne_usuario || !correlativo) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Faltan datos obligatorios para la asignación.",
        details: "Se requiere ES_Espacio, id_ciclo, id_jornada, carne_usuario y correlativo de pago.",
      });
    }

    const numeroRegex = /^[0-9]+$/;
    if (
      !numeroRegex.test(String(ES_Espacio)) ||
      !numeroRegex.test(String(id_ciclo)) ||
      !numeroRegex.test(String(id_jornada))
    ) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Error: Datos inválidos.",
        details: "Los campos de Espacio, Ciclo y Jornada deben ser estrictamente números (0-9)."
      });
    }

    if (ES_Espacio <= 0 || id_ciclo <= 0 || id_jornada <= 0) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Valores de identificador inválidos.",
        details: "Los IDs no pueden ser menores o iguales a cero.",
      });
    }

    const carneRegex = /^[0-9]{4}-[0-9]{2}-[0-9]{3,5}$/;
    if (!carneRegex.test(carne_usuario)) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Formato de carné inválido.",
        details: "El carné solo debe contener números y guiones.",
      });
    }

    if (req.usuarioAuth && req.usuarioAuth.carne !== carne_usuario) {
      return res.status(403).json({
        success: false,
        status: 403,
        message: "Acción no permitida.",
        details: "No puedes solicitar una asignación de parqueo para un carné distinto al de tu sesión actual."
      });
    }
    const infoPago = await PagoStore.getByCorrelativo(correlativo);
    
    if (!infoPago) {
      return res.status(404).json({ 
        success: false, 
        status: 404, 
        message: "Correlativo de pago no encontrado en el sistema." 
      });
    }

    if (infoPago.LR_CARNE !== carne_usuario) {
      return res.status(403).json({ 
        success: false, 
        status: 403, 
        message: "Este recibo de pago pertenece a otro estudiante." 
      });
    }

    if (infoPago.PAG_ESTADO !== 1) { 
      return res.status(402).json({ 
        success: false, 
        status: 402, 
        message: "El pago asociado a este correlativo no está aprobado." 
      });
    }

    const reciboYaUsado = await AsignacionStore.checkPagoUsado(infoPago.PAG_PAGO);
    if (reciboYaUsado) {
      return res.status(409).json({ 
        success: false, 
        status: 409, 
        message: "Este pago ya fue canjeado por un parqueo anteriormente." 
      });
    }
    const espacioFisico = await EspacioStore.getById(ES_Espacio);
    if (!espacioFisico) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "El espacio de parqueo indicado no existe en el sistema.",
        details: null,
      });
    }

    const estado = Number(espacioFisico.ES_Estado);
    if (estado === 0) {
      return res.status(409).json({
        success: false,
        status: 409,
        message: "El espacio ya está ocupado o inhabilitado.",
        details: null,
      });
    }

    const usuarioOcupado = await AsignacionStore.checkUsuarioOcupado(
      carne_usuario,
      id_ciclo,
      id_jornada,
    );
    if (usuarioOcupado) {
      return res.status(409).json({
        success: false,
        status: 409,
        message: "El usuario ya cuenta con un espacio asignado para este ciclo y jornada.",
        details: null,
      });
    }

    const espacioOcupado = await AsignacionStore.checkDisponibilidad(
      ES_Espacio,
      id_ciclo,
      id_jornada,
    );
    if (espacioOcupado) {
      return res.status(409).json({
        success: false,
        status: 409,
        message: "Operación rechazada: El espacio ya está ocupado por otra persona.",
        details: { disponible: false },
      });
    }

    req.body.AS_Estado = 1;
    req.body.PAG_PAGO = infoPago.PAG_PAGO;
    const nuevaAsignacion = await AsignacionStore.create(req.body);
    
    const io = req.app.get("socketio");
    if (io) {
      io.emit("espacioOcupado", {
        ES_Espacio: ES_Espacio,
        mensaje: `El espacio ${ES_Espacio} acaba de ser reservado.`,
      });
    }

    const datosVoucher = {
      id_asignacion: nuevaAsignacion.AS_Asignacion,
      carne: carne_usuario,
      espacio_asignado: ES_Espacio,
      fecha_asignacion: new Date().toLocaleDateString(),
      estado: "VALIDADO",
      instrucciones: "Presente este comprobante en Secretaría de su Facultad para reclamar su TAG/Marbete."
    };

    res.status(201).json({
      success: true,
      status: 201,
      message: "¡Asignación creada exitosamente! Presente su voucher en Secretaría.",
      details: { 
        disponible: true, 
        voucher: datosVoucher 
      },
    });

  } catch (error) {
    if (error.message.includes('ORA-02291')) {
      if (error.message.includes('FK_ASIG_USUARIO')) {
        return res.status(404).json({
          success: false,
          status: 404,
          message: "Usuario no encontrado.",
          details: "El carné proporcionado no existe en el registro principal de usuarios."
        });
      }
      if (error.message.includes('FK_ASIG_PAGO')) {
        return res.status(404).json({
          success: false,
          status: 404,
          message: "Pago no válido.",
          details: "El ID de pago proporcionado no existe en la base de datos."
        });
      }
    }

    res.status(500).json({
      success: false,
      status: 500,
      message: "Error interno al procesar la asignación.",
      details: error.message,
    });
  }
};

exports.getAllAsignaciones = async (req, res) => {
  try {
    const { id_ciclo, estado } = req.query;

    const asignaciones = await AsignacionStore.getAll(id_ciclo, estado);
    res.status(200).json({
      success: true,
      status: 200,
      message: "Asignaciones obtenidas correctamente.",
      details: asignaciones,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 500,
      message: "Error al obtener asignaciones.",
      details: error.message,
    });
  }
};

exports.anularAsignacion = async (req, res) => {
  try {
    if (req.usuarioAuth && req.usuarioAuth.id_rol !== 1) {
      return res.status(403).json({
        success: false,
        status: 403,
        message: "Permisos insuficientes.",
        details: "Esta acción está restringida únicamente para usuarios con rol de Administrador."
      });
    }

    const asignacion = await AsignacionStore.anular(req.params.id);

    if (!asignacion) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "Asignación no encontrada.",
        details: null,
      });
    }

    const io = req.app.get("socketio");
    if (io) {
      io.emit("espacioLiberado", {
        ES_Espacio: asignacion.ES_Espacio, 
        mensaje: `El espacio ${asignacion.ES_Espacio} acaba de ser liberado.`,
      });
    }

    res.status(200).json({
      success: true,
      status: 200,
      message: "Asignación anulada (El espacio vuelve a estar disponible).",
      details: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 500,
      message: "Error al anular asignación.",
      details: error.message,
    });
  }
};

exports.updateAsignacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { ES_Espacio } = req.body; 

    if (!id || !ES_Espacio) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Datos incompletos.",
        details: "Se requiere el ID de la asignación y el nuevo ES_Espacio.",
      });
    }

    const numeroRegex = /^[0-9]+$/;
    if (!numeroRegex.test(String(id)) || !numeroRegex.test(String(ES_Espacio))) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Error: Datos inválidos.",
        details: "Los IDs deben ser estrictamente numéricos.",
      });
    }

    const asignacionActual = await AsignacionStore.getById(id);
    if (!asignacionActual) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "Asignación no encontrada.",
        details: null,
      });
    }

    if (asignacionActual.AS_Estado === 0) {
      return res.status(409).json({
        success: false,
        status: 409,
        message: "Operación rechazada.",
        details: "No puedes modificar una asignación que ya fue anulada.",
      });
    }

    if (Number(asignacionActual.ES_Espacio) === Number(ES_Espacio)) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Operación redundante.",
        details: "El nuevo espacio solicitado es el mismo que ya tienes asignado.",
      });
    }

    const espacioNuevoFisico = await EspacioStore.getById(ES_Espacio);
    if (!espacioNuevoFisico) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "El nuevo espacio de parqueo indicado no existe.",
        details: null,
      });
    }

    if (Number(espacioNuevoFisico.ES_Estado) === 0) {
      return res.status(409).json({
        success: false,
        status: 409,
        message: "El nuevo espacio se encuentra inhabilitado.",
        details: null,
      });
    }

    const espacioOcupado = await AsignacionStore.checkDisponibilidad(
      ES_Espacio,
      asignacionActual.id_ciclo,
      asignacionActual.id_jornada
    );

    if (espacioOcupado) {
      return res.status(409).json({
        success: false,
        status: 409,
        message: "Operación rechazada: El nuevo espacio ya está ocupado.",
        details: { disponible: false },
      });
    }

    const espacioViejo = asignacionActual.ES_Espacio;
    await AsignacionStore.updateEspacio(id, ES_Espacio);

    const io = req.app.get("socketio");
    if (io) {
      io.emit("espacioLiberado", {
        ES_Espacio: espacioViejo,
        mensaje: `El espacio ${espacioViejo} acaba de ser liberado por cambio de parqueo.`,
      });
      io.emit("espacioOcupado", {
        ES_Espacio: ES_Espacio,
        mensaje: `El espacio ${ES_Espacio} acaba de ser reservado por cambio de parqueo.`,
      });
    }

    res.status(200).json({
      success: true,
      status: 200,
      message: "¡Cambio de parqueo realizado exitosamente!",
      details: { espacio_anterior: espacioViejo, nuevo_espacio: ES_Espacio },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 500,
      message: "Error interno al procesar el cambio de parqueo.",
      details: error.message,
    });
  }
};

exports.getEspaciosOcupados = async (req, res) => {
  try {
    const { id_ciclo, id_jornada } = req.query;

    if (!id_ciclo || !id_jornada) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Faltan parámetros de búsqueda.",
        details: "Debes enviar id_ciclo e id_jornada por la URL (query params)."
      });
    }

    const ocupados = await AsignacionStore.getOcupadosPorJornada(id_ciclo, id_jornada);

    res.status(200).json({
      success: true,
      status: 200,
      message: `Se encontraron ${ocupados.length} espacios ocupados.`,
      details: ocupados
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 500,
      message: "Error al obtener espacios ocupados.",
      details: error.message,
    });
  }
};

exports.getEspaciosLibres = async (req, res) => {
  try {
    const { id_ciclo, id_jornada } = req.query;

    if (!id_ciclo || !id_jornada) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Faltan parámetros de búsqueda.",
        details: "Debes enviar id_ciclo e id_jornada por la URL (query params)."
      });
    }

    const ocupados = await AsignacionStore.getOcupadosPorJornada(id_ciclo, id_jornada);
    const idsOcupados = ocupados.map(a => Number(a.ES_Espacio));
    const libres = await EspacioStore.getLibres(idsOcupados);

    res.status(200).json({
      success: true,
      status: 200,
      message: `Se encontraron ${libres.length} espacios disponibles.`,
      details: libres
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 500,
      message: "Error al obtener espacios libres.",
      details: error.message,
    });
  }
};