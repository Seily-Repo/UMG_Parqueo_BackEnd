const CatalogoStore = require('../store/catalogo.store');

exports.getFacultades = async (req, res) => {
  try {
    const data = await CatalogoStore.getFacultades();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Error interno", detalle: err.message });
  }
};

exports.getSedes = async (req, res) => {
  try {
    const data = await CatalogoStore.getSedes();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Error interno", detalle: err.message });
  }
};

exports.getCiclos = async (req, res) => {
  try {
    const data = await CatalogoStore.getCiclos();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Error interno", detalle: err.message });
  }
};

exports.getSecciones = async (req, res) => {
  try {
    const data = await CatalogoStore.getSecciones();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Error interno", detalle: err.message });
  }
};

exports.getJornadas = async (req, res) => {
  try {
    const data = await CatalogoStore.getJornadas();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Error interno", detalle: err.message });
  }
};

exports.getDepartamentos = async (req, res) => {
  try {
    const data = await CatalogoStore.getDepartamentos();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Error interno", detalle: err.message });
  }
};

exports.getPlanes = async (req, res) => {
  try {
    const data = await CatalogoStore.getPlanes();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Error interno", detalle: err.message });
  }
};

exports.getRoles = async (req, res) => {
  try {
    const data = await CatalogoStore.getRoles();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Error interno", detalle: err.message });
  }
};

exports.getMunicipios = async (req, res) => {
  try {
    const idDepto = parseInt(req.params.id_depto);
    const data = await CatalogoStore.getMunicipios(idDepto);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Error interno", detalle: err.message });
  }
};
