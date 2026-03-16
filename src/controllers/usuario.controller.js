const UsuarioStore = require('../store/usuario.store');

exports.getAllUsuarios = async (req, res) => {
    try {
        const usuarios = await UsuarioStore.getAll();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUsuarioById = async (req, res) => {
    try {
        const usuario = await UsuarioStore.getById(req.params.id);
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createUsuario = async (req, res) => {
    try {
        const usuario = await UsuarioStore.create(req.body);
        res.status(201).json(usuario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateUsuario = async (req, res) => {
    try {
        await UsuarioStore.update(req.params.id, req.body);
        res.json({ message: "Usuario actualizado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteUsuario = async (req, res) => {
    try {
        await UsuarioStore.delete(req.params.id);
        res.json({ message: "Usuario eliminado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};