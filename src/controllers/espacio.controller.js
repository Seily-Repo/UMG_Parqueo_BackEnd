const EspacioStore = require('../store/espacio.store');

exports.getAllEspacios = async (req, res) => { 
    try {
        const espacios = await EspacioStore.getAll();
        res.status(200).json(espacios);
    } catch (error) { 
        res.status(500).json({ message: 'Error al obtener espacios', error: error.message }); 
    }
};

exports.getEspaciosByParqueo = async (req, res) => { 
    try {
        const espacios = await EspacioStore.getByParqueoId(req.params.parqueoId);
        res.status(200).json(espacios);
    } catch (error) { 
        res.status(500).json({ message: 'Error al obtener espacios del parqueo', error: error.message }); 
    }
};

exports.createEspacio = async (req, res) => { 
    try {
        await EspacioStore.create(req.body);
        res.status(201).json({ message: 'Espacio creado exitosamente' });
    } catch (error) { 
        res.status(500).json({ message: 'Error al crear espacio', error: error.message }); 
    }
};

exports.updateEspacio = async (req, res) => { 
    try {
        await EspacioStore.update(req.params.id, req.body);
        res.status(200).json({ message: 'Espacio actualizado exitosamente' });
    } catch (error) { 
        res.status(500).json({ message: 'Error al actualizar espacio', error: error.message }); 
    }
};

exports.deleteEspacio = async (req, res) => { 
    try {
        await EspacioStore.delete(req.params.id);
        res.status(200).json({ message: 'Espacio eliminado exitosamente' });
    } catch (error) { 
        res.status(500).json({ message: 'Error al eliminar espacio', error: error.message }); 
    }
exports.getLibres = async (req, res) => {
    try {
        const { parqueoId, semestre, jornada } = req.query;
        
        if (!parqueoId || !semestre || !jornada) {
            return res.status(400).json({ message: 'Faltan parámetros de búsqueda (parqueoId, semestre, jornada)' });
        }

        const espaciosLibres = await EspacioStore.getEspaciosLibres(parqueoId, semestre, jornada);
        
        res.status(200).json({
            total_libres: espaciosLibres.length,
            data: espaciosLibres
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al consultar disponibilidad', error: error.message });
    }
};

};