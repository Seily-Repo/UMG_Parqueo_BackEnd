const EspacioStore = require('../store/espacio.store');
const TipoEspacio = require('../model/tipo_espacio.model'); 
const Asignacion = require('../model/asignacion.model'); 

const sendResponse = (res, status, success, message, details = null) => {
    return res.status(status).json({ success, status, message, details });
};

exports.createEspacio = async (req, res) => { 
    try {
        const { ES_Numero, TES_ESPACIO } = req.body;

        // 1. Validar que el Tipo de Espacio exista y obtener su capacidad máxima
        const tipo = await TipoEspacio.findByPk(TES_ESPACIO);
        if (!tipo) {
            return sendResponse(res, 404, false, "El tipo de espacio especificado no existe.", null);
        }

        // 2. Contar cuántos espacios ya están registrados para este tipo
        const conteoActual = await EspacioStore.countByTipo(TES_ESPACIO);

        // 3. VALIDACIÓN DE TOPE: No superar la capacidad máxima definida por el porcentaje
        if (conteoActual >= tipo.TES_CAPACIDAD_MAX_TIPO) {
            return sendResponse(res, 409, false, 
                `Operación rechazada: Se ha alcanzado la capacidad máxima (${tipo.TES_CAPACIDAD_MAX_TIPO}) para el tipo ${tipo.TES_NOMBRE}.`, 
                { capacidadMaxima: tipo.TES_CAPACIDAD_MAX_TIPO, conteoActual }
            );
        }

        // 4. Crear el espacio
        const nuevoEspacio = await EspacioStore.create(req.body);
        return sendResponse(res, 201, true, 'Espacio creado exitosamente', nuevoEspacio);

    } catch (error) { 
        // Capturar errores de unicidad (ES_Numero + TES_ESPACIO)
        if (error.name === 'SequelizeUniqueConstraintError') {
            return sendResponse(res, 409, false, "El número de espacio ya existe para este tipo de categoría.", error.message);
        }
        return sendResponse(res, 500, false, 'Error al crear espacio', error.message); 
    }
};

exports.getAllEspacios = async (req, res) => { 
    try {
        const espacios = await EspacioStore.getAll();
        return sendResponse(res, 200, true, 'Listado de espacios obtenido', espacios);
    } catch (error) { 
        return sendResponse(res, 500, false, 'Error al obtener espacios', error.message); 
    }
};

exports.updateEspacio = async (req, res) => { 
    try {
        const { id } = req.params;
        const actualizado = await EspacioStore.update(id, req.body);
        
        if (!actualizado) {
            return sendResponse(res, 404, false, 'No se encontró el espacio para actualizar', null);
        }

        return sendResponse(res, 200, true, 'Espacio actualizado exitosamente');
    } catch (error) { 
        return sendResponse(res, 500, false, 'Error al actualizar espacio', error.message); 
    }
};

exports.deleteEspacio = async (req, res) => { 
    try {
        await EspacioStore.delete(req.params.id);
        return sendResponse(res, 200, true, 'Espacio eliminado exitosamente');
    } catch (error) { 
        return sendResponse(res, 500, false, 'Error al eliminar espacio', error.message); 
    }
};


exports.getEspaciosByTipo = async (req, res) => { 
    try {
        const { tipoId } = req.params;
        const espacios = await EspacioStore.getByTipoId(tipoId);
        res.status(200).json({
            success: true,
            status: 200,
            message: "Espacios obtenidos por tipo",
            details: espacios
        });
    } catch (error) { 
        res.status(500).json({ success: false, message: 'Error al obtener espacios', error: error.message }); 
    }
};

exports.getLibres = async (req, res) => {
    try {
        const { tipoEspacioId, semestre, jornada } = req.query;
        
        if (!tipoEspacioId || !semestre || !jornada) {
            return sendResponse(res, 400, false, 'Faltan parámetros (tipoEspacioId, semestre, jornada)');
        }

        const espaciosLibres = await EspacioStore.getEspaciosLibres(tipoEspacioId, semestre, jornada);
        
        return res.status(200).json({
            success: true,
            status: 200,
            message: 'Consulta de disponibilidad realizada',
            total_libres: espaciosLibres.length,
            data: espaciosLibres
        });
    } catch (error) {
        return sendResponse(res, 500, false, 'Error al consultar disponibilidad', error.message);
    }
};

exports.getMetricasDisponibilidad = async (req, res) => {
    try {
        const { tipoId } = req.params;
        const disponibles = await EspacioStore.contarDisponibles(tipoId);
        
        return sendResponse(res, 200, true, "Conteo de disponibilidad obtenido", {
            tipoEspacioId: parseInt(tipoId),
            disponibles: disponibles
        });
    } catch (error) {
        return sendResponse(res, 500, false, 'Error al obtener métricas', error.message);
    }
};
