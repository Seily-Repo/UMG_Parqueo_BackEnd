const Usuario = require('../model/usuario.model');

class UsuarioStore {

    static async getAll() {
        return await Usuario.findAll({
            order: [['US_Identificacion', 'ASC']]
        });
    }

    static async getById(id) {
        return await Usuario.findByPk(id);
    }

    static async create(data) {
        return await Usuario.create({
            US_Identificacion: data.US_Identificacion,
            US_Nombre: data.US_Nombre,
            US_Apellido: data.US_Apellido,
            US_Email: data.US_Email,
            US_Telefono: data.US_Telefono,
            US_Pass: data.US_Pass
        });
    }

    static async update(id, data) {
        return await Usuario.update({
            US_Nombre: data.US_Nombre,
            US_Apellido: data.US_Apellido,
            US_Email: data.US_Email,
            US_Telefono: data.US_Telefono,
            US_Pass: data.US_Pass
        }, {
            where: { US_Identificacion: id }
        });
    }

    static async delete(id) {
        return await Usuario.destroy({
            where: { US_Identificacion: id }
        });
    }
}

module.exports = UsuarioStore;