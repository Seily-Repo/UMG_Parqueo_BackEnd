const VehiculoStore = require('../store/vehiculo.store');

exports.getAllVehiculos = async (req, res) => {
    try {
        const vehiculos = await VehiculoStore.getAll();
        res.json(vehiculos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getVehiculoById = async (req, res) => {
    try {
        const vehiculo = await VehiculoStore.getById(req.params.id);
        res.json(vehiculo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createVehiculo = async (req, res) => {
    try {
        const vehiculo = await VehiculoStore.create(req.body);
        res.status(201).json(vehiculo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateVehiculo = async (req, res) => {
    try {
        await VehiculoStore.update(req.params.id, req.body);
        res.json({ message: "Vehiculo actualizado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteVehiculo = async (req, res) => {
    try {
        await VehiculoStore.delete(req.params.id);
        res.json({ message: "Vehiculo eliminado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};