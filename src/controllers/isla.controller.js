const IslaStore = require("../store/isla.store");
const IslaDetalleStore = require("../store/islaDetalle.store");
const ParqueoStore = require("../store/parqueo.store");
const EspacioStore = require("../store/espacio.store"); 

exports.createIsla = async (req, res) => {
  try {
    // COMENTADO TEMPORALMENTE MIENTRAS PROBÁS SIN JWT
    /*
    if (req.user.rol !== 'ADMINISTRADOR') {
      return res.status(403).json({ success: false, status: 403, message: "Permisos insuficientes." });
    }
    */

    const { PQ_PARQUEO, IS_CAPACIDAD, IS_DESCRIPCION, espacios } = req.body;

    if (!PQ_PARQUEO || !IS_CAPACIDAD || !espacios) {
      return res.status(400).json({
        success: false, status: 400,
        message: "Faltan datos obligatorios para crear la isla."
      });
    }

    if (!Array.isArray(espacios) || espacios.length === 0) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Lista de espacios inválida.",
        details: "Debe enviar un arreglo válido con los IDs de los espacios que conformarán la isla."
      });
    }

    if (espacios.length !== Number(IS_CAPACIDAD)) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Discrepancia de capacidad.",
        details: `La capacidad indicada es ${IS_CAPACIDAD}, pero se enviaron ${espacios.length} espacios.`
      });
    }

    const parqueoExiste = await ParqueoStore.getById(PQ_PARQUEO);
    if (!parqueoExiste) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "Parqueo no encontrado.",
        details: `El parqueo con ID ${PQ_PARQUEO} no existe en el sistema.`
      });
    }

    const islasActuales = await IslaStore.getAll(PQ_PARQUEO);
    const cantidad = islasActuales.length; 
    const letra = String.fromCharCode(65 + cantidad); 
    const nombreGenerado = `ISLA ${letra}`;

    const nuevaIsla = await IslaStore.create({
      PQ_PARQUEO,
      IS_NOMBRE: nombreGenerado,
      IS_CAPACIDAD,
      IS_DESCRIPCION 
    });

    const detallesArray = espacios.map(id_espacio => {
      return { IS_ISLA: nuevaIsla.IS_ISLA, ES_ESPACIO: Number(id_espacio) };
    });
    
    await IslaDetalleStore.bulkCreate(detallesArray);

    res.status(201).json({
      success: true, status: 201,
      message: "¡Isla creada automáticamente con éxito!",
      details: {
        id_isla: nuevaIsla.IS_ISLA,
        nombre: nuevaIsla.IS_NOMBRE,
        descripcion: nuevaIsla.IS_DESCRIPCION
      },
    });

  } catch (error) {
    if (error.message && error.message.includes('ORA-02291')) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "Error de referencia en la base de datos.",
        details: "El parqueo indicado o alguno de los espacios no existe."
      });
    }

    res.status(500).json({
      success: false,
      status: 500,
      message: "Error interno al procesar la creación de la isla.",
      details: error.message,
    });
  }
};

exports.getAllIslas = async (req, res) => {
  try {
    const { id_parqueo, estado } = req.query;
    const islas = await IslaStore.getAll(id_parqueo, estado);

    res.status(200).json({
      success: true,
      status: 200,
      message: "Islas obtenidas correctamente.",
      details: islas,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 500,
      message: "Error al obtener el listado de islas.",
      details: error.message,
    });
  }
};

exports.getDetalleIsla = async (req, res) => {
  try {
    const { id } = req.params; 

    const numeroRegex = /^[0-9]+$/;
    if (!numeroRegex.test(String(id))) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Formato de ID inválido.",
        details: "El ID de la isla debe ser numérico."
      });
    }

    const detalles = await IslaDetalleStore.getByIsla(id);

    if (!detalles || detalles.length === 0) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "Isla vacía o no encontrada.",
        details: null
      });
    }

    const espaciosCompletos = await Promise.all(detalles.map(async (detalle) => {
      const espacioFisico = await EspacioStore.getById(detalle.ES_ESPACIO);
      
      return {
        id_detalle: detalle.ID_DETALLE,
        id_espacio: detalle.ES_ESPACIO,
        tipo: espacioFisico ? espacioFisico.TES_ESPACIO : 'Desconocido', 
        estado_fisico: espacioFisico ? espacioFisico.ES_Estado : null
      };
    }));

    res.status(200).json({
      success: true,
      status: 200,
      message: `Se encontraron ${espaciosCompletos.length} espacios en la isla.`,
      details: espaciosCompletos, 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 500,
      message: "Error al obtener los espacios de la isla.",
      details: error.message,
    });
  }
};

exports.anularIsla = async (req, res) => {
  try {
    // COMENTADO TEMPORALMENTE MIENTRAS PROBÁS SIN JWT
    /*
    if (req.user.rol !== 'ADMINISTRADOR') {
      return res.status(403).json({
        success: false,
        status: 403,
        message: "Permisos insuficientes.",
        details: "Esta acción está restringida únicamente para usuarios con rol de Administrador."
      });
    }
    */

    const { id } = req.params;
    const islaAnulada = await IslaStore.anular(id);

    if (!islaAnulada) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "Isla no encontrada.",
        details: null,
      });
    }

    res.status(200).json({
      success: true,
      status: 200,
      message: "Isla inhabilitada correctamente.",
      details: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 500,
      message: "Error al inhabilitar la isla.",
      details: error.message,
    });
  }
};