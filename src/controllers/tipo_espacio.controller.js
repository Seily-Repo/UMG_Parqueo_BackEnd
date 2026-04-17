const TipoEspacioStore = require('../store/tipo_espacio.store');
const ParqueoStore = require('../store/parqueo.store');
const EspacioStore = require('../store/espacio.store'); 

const sendResponse = (res, status, success, message, details = null) => {
    return res.status(status).json({ success, status, message, details });
};

// Regla 6: Limpieza de caracteres basura y especiales
const limpiarTexto = (texto) => {
    if (!texto) return "";
    return texto.trim().replace(/[^a-zA-Z0-9 ]/g, "").toUpperCase();
};

exports.crearTipoEspacio = async (req, res) => {
    try {
        let { TES_NOMBRE, TES_CAPACIDAD_MAX_TIPO, PQ_Parqueo } = req.body;

        // Limpieza y Validación de nombre
        TES_NOMBRE = limpiarTexto(TES_NOMBRE);
        if (!TES_NOMBRE) return sendResponse(res, 400, false, "El nombre es obligatorio y no debe contener caracteres especiales.");

        // Regla 4: Solo números enteros
        if (!Number.isInteger(TES_CAPACIDAD_MAX_TIPO) || TES_CAPACIDAD_MAX_TIPO <= 0) {
            return sendResponse(res, 400, false, "La capacidad debe ser un número entero mayor a cero.");
        }

        // Validación de existencia de Parqueo
        const parqueo = await ParqueoStore.getById(PQ_Parqueo);
        if (!parqueo) return sendResponse(res, 404, false, "El parqueo especificado no existe.");

        // Validación de Duplicados (No repetir "MOTOS" en el mismo parqueo)
        const duplicado = await TipoEspacioStore.findDuplicate(TES_NOMBRE, PQ_Parqueo);
        if (duplicado) return sendResponse(res, 409, false, `Operación rechazada: Ya existe el tipo '${TES_NOMBRE}' en este parqueo.`);

        // Regla 5: Validaciones de capacidad
        if (TES_CAPACIDAD_MAX_TIPO > parqueo.PQ_Capacidad) {
            return sendResponse(res, 409, false, `La capacidad del tipo excede la capacidad total del parqueo (${parqueo.PQ_Capacidad}).`);
        }

        const sumaActual = await TipoEspacioStore.getSumCapacidadByParqueo(PQ_Parqueo);
        if ((sumaActual + TES_CAPACIDAD_MAX_TIPO) > parqueo.PQ_Capacidad) {
            const restante = parqueo.PQ_Capacidad - sumaActual;
            return sendResponse(res, 409, false, `Capacidad excedida. Espacio disponible restante en el parqueo: ${restante}`);
        }

        const nuevoTipo = await TipoEspacioStore.create({ TES_NOMBRE, TES_CAPACIDAD_MAX_TIPO, PQ_Parqueo });
        return sendResponse(res, 201, true, "Tipo de espacio creado exitosamente", nuevoTipo);

    } catch (error) {
        return sendResponse(res, 500, false, "Error al crear tipo de espacio", error.message);
    }
};

exports.getAllTipos = async (req, res) => {
    try {
        const tipos = await TipoEspacioStore.getAll();
        return sendResponse(res, 200, true, "Listado general obtenido", tipos);
    } catch (error) {
        return sendResponse(res, 500, false, "Error al obtener tipos", error.message);
    }
};

exports.listarEspaciosPorTipoYEstado = async (req, res) => {
    try {
        const { idTipo } = req.params;
        const { estado } = req.query; // Puede ser 1 o 0

        // Validar que el tipo existe
        const tipo = await TipoEspacioStore.getById(idTipo);
        if (!tipo) return sendResponse(res, 404, false, "El tipo de espacio no existe.");

        // Llamamos al store de ESPACIOS (necesitarás este método en espacio.store)
        const espacios = await EspacioStore.getByTipoYEstado(idTipo, estado);
        
        return sendResponse(res, 200, true, `Espacios de tipo ${tipo.TES_NOMBRE} filtrados correctamente.`, espacios);
    } catch (error) {
        return sendResponse(res, 500, false, "Error al filtrar espacios.", error.message);
    }
};

exports.updateTipoEspacio = async (req, res) => {
    try {
        const { id } = req.params;
        let { TES_NOMBRE, TES_CAPACIDAD_MAX_TIPO } = req.body;

        const tipoActual = await TipoEspacioStore.getById(id);
        if (!tipoActual) return sendResponse(res, 404, false, "Tipo de espacio no encontrado.");

        const dataUpdate = {};

        if (TES_NOMBRE) {
            TES_NOMBRE = limpiarTexto(TES_NOMBRE);
            const duplicado = await TipoEspacioStore.findDuplicate(TES_NOMBRE, tipoActual.PQ_Parqueo, id);
            if (duplicado) return sendResponse(res, 409, false, `El nombre '${TES_NOMBRE}' ya está en uso.`);
            dataUpdate.TES_NOMBRE = TES_NOMBRE;
        }

        if (TES_CAPACIDAD_MAX_TIPO !== undefined) {
            if (!Number.isInteger(TES_CAPACIDAD_MAX_TIPO)) return sendResponse(res, 400, false, "La capacidad debe ser entera.");
            
            const parqueo = await ParqueoStore.getById(tipoActual.PQ_Parqueo);
            const sumaOtros = (await TipoEspacioStore.getSumCapacidadByParqueo(tipoActual.PQ_Parqueo)) - tipoActual.TES_CAPACIDAD_MAX_TIPO;

            if ((sumaOtros + TES_CAPACIDAD_MAX_TIPO) > parqueo.PQ_Capacidad) {
                return sendResponse(res, 409, false, "La nueva capacidad excede el límite total del parqueo.");
            }
            dataUpdate.TES_CAPACIDAD_MAX_TIPO = TES_CAPACIDAD_MAX_TIPO;
        }

        await TipoEspacioStore.update(id, dataUpdate);
        return sendResponse(res, 200, true, "Tipo de espacio actualizado correctamente.");
    } catch (error) {
        return sendResponse(res, 500, false, "Error al actualizar", error.message);
    }
};

exports.deleteTipoEspacio = async (req, res) => {
    try {
        const { id } = req.params;
        const tipo = await TipoEspacioStore.getById(id);
        
        if (!tipo) return sendResponse(res, 404, false, "El tipo de espacio no existe.");

        // --- VALIDACIÓN: Espacios ocupados (Estado 0) ---
        const ocupados = await EspacioStore.countOcupadosByTipo(id);
        if (ocupados > 0) {
            return sendResponse(res, 409, false, 
                `No se puede eliminar. Hay ${ocupados} espacios actualmente OCUPADOS bajo este tipo.`);
        }

        // Si está limpio, procedemos
        await TipoEspacioStore.deleteConLiberacion(id);

        return sendResponse(res, 200, true, 
            `El tipo '${tipo.TES_NOMBRE}' ha sido eliminado. Los espacios asociados ahora no tienen tipo y están en estado DISPONIBLE.`);
    } catch (error) {
        return sendResponse(res, 500, false, "Error al eliminar el tipo.", error.message);
    }
};

exports.updateEstadoTipo = async (req, res) => {
    try {
        const { id } = req.params;
        const { nuevoEstado } = req.body; // El front envía { "nuevoEstado": 0 }

        const tipo = await TipoEspacioStore.getById(id);
        if (!tipo) return sendResponse(res, 404, false, "El tipo de espacio no existe.");

        // Solo validamos ocupación si se intenta INACTIVAR (estado 0)
        if (nuevoEstado === 0) {
            const ocupados = await EspacioStore.countOcupadosByTipo(id);
            if (ocupados > 0) {
                return sendResponse(res, 409, false, 
                    `No se puede inactivar. Tiene ${ocupados} espacios ocupados.`);
            }
        }

        await TipoEspacioStore.update(id, { TES_ESTADO: nuevoEstado });

        return sendResponse(res, 200, true, `Estado del tipo '${tipo.TES_NOMBRE}' actualizado a ${nuevoEstado}.`);
    } catch (error) {
        return sendResponse(res, 500, false, "Error al actualizar estado.", error.message);
    }

};