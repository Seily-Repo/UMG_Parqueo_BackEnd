const EspacioStore = require('../store/espacio.store');
const TipoEspacioStore = require('../store/tipo_espacio.store');
const ParqueoStore = require('../store/parqueo.store');

const sendResponse = (res, status, success, message, details = null) => {
    return res.status(status).json({ success, status, message, details });
};

// --- 1. INSERTAR (Con numeración automática y llenado de huecos) ---
exports.createEspacio = async (req, res) => { 
    try {
        const { TES_ESPACIO } = req.body;

        // Validar existencia del tipo
        const tipo = await TipoEspacioStore.getById(TES_ESPACIO);
        if (!tipo) return sendResponse(res, 404, false, "El tipo de espacio no existe.");

        // REGLA #2: Validación de Tope por Tipo
        const conteoActual = await EspacioStore.countByTipo(TES_ESPACIO);
        if (conteoActual >= tipo.TES_CAPACIDAD_MAX_TIPO) {
            return sendResponse(res, 409, false, 
                `Capacidad máxima alcanzada para ${tipo.TES_NOMBRE} (${tipo.TES_CAPACIDAD_MAX_TIPO}).`
            );
        }

        // REGLA #1: Generación de número automático (Busca huecos primero)
        const proximoNumero = await EspacioStore.findNextAvailableNumber(tipo.PQ_Parqueo);

        // Crear el espacio con el número calculado
        const nuevoEspacio = await EspacioStore.create({
            ES_Numero: proximoNumero,
            TES_ESPACIO: TES_ESPACIO
        });

        return sendResponse(res, 201, true, 'Espacio creado exitosamente', nuevoEspacio);

    } catch (error) { 
        return sendResponse(res, 500, false, 'Error al crear espacio', error.message); 
    }
};

// --- 3. ACTUALIZAR (Edición Dual: Solo Estado o Campos Completos) ---
exports.updateEspacio = async (req, res) => { 
    try {
        const { id } = req.params;
        const { ES_Estado, TES_ESPACIO, soloEstado } = req.body;

        const espacioActual = await EspacioStore.getById(id);
        if (!espacioActual) return sendResponse(res, 404, false, 'No se encontró el espacio');

        // CASO A: Solo editar estado (Regla #3 parte 1)
        if (soloEstado) {
            if (![0, 1].includes(ES_Estado)) return sendResponse(res, 400, false, "Estado inválido");
            await EspacioStore.updateEstado(id, ES_Estado);
            return sendResponse(res, 200, true, 'Estado del espacio actualizado');
        }

        // CASO B: Editar todos los campos (Regla #3 parte 2)
        const dataUpdate = { ...req.body };
        
        // Si cambia de Tipo de Espacio, validar capacidad del nuevo tipo
        if (TES_ESPACIO && TES_ESPACIO !== espacioActual.TES_ESPACIO) {
            const nuevoTipo = await TipoEspacioStore.getById(TES_ESPACIO);
            if (!nuevoTipo) return sendResponse(res, 404, false, "El nuevo tipo no existe");

            const conteoNuevoTipo = await EspacioStore.countByTipo(TES_ESPACIO);
            if (conteoNuevoTipo >= nuevoTipo.TES_CAPACIDAD_MAX_TIPO) {
                return sendResponse(res, 409, false, "Capacidad máxima del tipo destino alcanzada");
            }
        }

        // Bloqueamos la edición manual del número de parqueo o número de espacio 
        // para mantener la integridad de la numeración automática
        delete dataUpdate.ES_Numero; 

        await EspacioStore.update(id, dataUpdate);
        return sendResponse(res, 200, true, 'Espacio actualizado exitosamente');

    } catch (error) { 
        return sendResponse(res, 500, false, 'Error al actualizar espacio', error.message); 
    }
};

// --- 4. ELIMINAR (Regla #4) ---
exports.deleteEspacio = async (req, res) => { 
    try {
        const id = req.params.id;
        const espacio = await EspacioStore.getById(id);
        if (!espacio) return sendResponse(res, 404, false, 'Espacio no encontrado');

        await EspacioStore.delete(id);
        return sendResponse(res, 200, true, `Espacio #${espacio.ES_Numero} eliminado. El número queda libre.`);
    } catch (error) { 
        return sendResponse(res, 500, false, 'Error al eliminar espacio', error.message); 
    }
};

exports.updateEstadoEspacio = async (req, res) => {
    try {
        const { id } = req.params;
        const { nuevoEstado } = req.body; // 0: Ocupado, 1: Libre

        // 1. Validar que el espacio existe
        const espacio = await EspacioStore.getById(id);
        if (!espacio) {
            return sendResponse(res, 404, false, "El espacio físico no existe.");
        }

        // 2. VALIDACIÓN DE ORO: Si se intenta liberar (1), el Tipo debe estar Activo
        if (nuevoEstado === 1) {
            const tipo = await TipoEspacioStore.getById(espacio.TES_ESPACIO);
            
            // Si el tipo está desactivado (TES_ESTADO = 0), no permitimos liberar el espacio
            // para evitar que alguien use un parqueo de un tipo que "ya no existe" legalmente.
            if (tipo && tipo.TES_ESTADO === 0) {
                return sendResponse(res, 409, false, 
                    `No se puede marcar como LIBRE. El tipo '${tipo.TES_NOMBRE}' está desactivado.`);
            }
        }

        // 3. Actualizar el estado
        await EspacioStore.update(id, { ES_Estado: nuevoEstado });

        // Aquí podrías emitir un evento de Socket.io si lo tienes configurado:
        // io.emit('mapa-actualizado', { id, nuevoEstado });

        return sendResponse(res, 200, true, 
            `Espacio #${espacio.ES_Numero} actualizado a ${nuevoEstado === 0 ? 'OCUPADO' : 'LIBRE'}.`);

    } catch (error) {
        return sendResponse(res, 500, false, "Error al actualizar estado del espacio.", error.message);
    }
};

// --- 5 & 7. LISTADOS DE PARQUEO ---
exports.getParqueoById = async (req, res) => {
    try {
        const parqueo = await ParqueoStore.getById(req.params.id);
        if (!parqueo) return sendResponse(res, 404, false, "Parqueo no encontrado");
        return sendResponse(res, 200, true, "Parqueo obtenido", parqueo);
    } catch (error) {
        return sendResponse(res, 500, false, "Error", error.message);
    }
};

// --- 6. LISTAR DISPONIBLES / OCUPADOS POR JORNADA Y SEMESTRE ---
exports.getDisponibilidadAvanzada = async (req, res) => {
    try {
        const { semestre, jornada, estado } = req.query;
        
        if (!semestre || !jornada) {
            return sendResponse(res, 400, false, 'Faltan parámetros: semestre y jornada');
        }

        const espacios = await EspacioStore.getDisponibilidadAvanzada(semestre, jornada, estado);
        
        return res.status(200).json({
            success: true,
            total: espacios.length,
            data: espacios
        });
    } catch (error) {
        return sendResponse(res, 500, false, 'Error al consultar disponibilidad', error.message);
    }
};

// Otros listados básicos...
exports.getAllEspacios = async (req, res) => { 
    try {
        const espacios = await EspacioStore.getAll();
        return sendResponse(res, 200, true, 'Listado de espacios obtenido', espacios);
    } catch (error) { 
        return sendResponse(res, 500, false, 'Error al obtener espacios', error.message); 
    }
};

exports.getEspaciosByTipo = async (req, res) => { 
    try {
        const { tipoId } = req.params;
        const { estado } = req.query; 

        const estadoFiltro = (estado === '1' || estado === '0') ? parseInt(estado) : undefined;

        const espacios = await EspacioStore.getByTipoYEstado(tipoId, estadoFiltro);

        return sendResponse(res, 200, true, 'Listado por tipo obtenido', espacios);
    } catch (error) { 
        return sendResponse(res, 500, false, 'Error al obtener espacios por tipo', error.message); 
    }
};

// --- EXTRA: Métricas rápidas ---
exports.getMetricasDisponibilidad = async (req, res) => {
    try {
        const { tipoId } = req.params;
        const disponibles = await EspacioStore.countByTipo(tipoId); // O una lógica de conteo específica
        
        return sendResponse(res, 200, true, "Métricas obtenidas", {
            tipoId: parseInt(tipoId),
            totalRegistrados: disponibles
        });
    } catch (error) {
        return sendResponse(res, 500, false, 'Error al obtener métricas', error.message);
    }
};
