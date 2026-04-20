const Parqueo = require('../model/parqueo.model');

class ParqueoStore {

    // ======================
    // GET ALL (SOLO ACTIVOS)
    // ======================
    async getAll() {
        return await Parqueo.findAll({
            where: { estado: 1 }
        });
    }

    // ======================
    // GET ALL ADMIN (INCLUYE ELIMINADOS)
    // ======================
    async getAllWithDeleted() {
        // 🔥 importante: ignora defaultScope si existe
        return await Parqueo.scope(null).findAll();
    }

    // ======================
    // GET BY ID (SOLO ACTIVOS)
    // ======================
    async getById(id) {
        return await Parqueo.findOne({
            where: {
                PQ_Parqueo: id,
                estado: 1
            }
        });
    }

    // ======================
    // GET BY ID ADMIN (INCLUYE INACTIVOS)
    // ======================
    async getByIdWithDeleted(id) {
        return await Parqueo.scope(null).findOne({
            where: {
                PQ_Parqueo: id
            }
        });
    }

    // ======================
    // EXISTS BY NAME (SOLO ACTIVOS)
    // ======================
    async existsByName(nombre) {
        const data = await Parqueo.findOne({
            where: {
                PQ_Nombre: nombre,
                estado: 1
            }
        });

        return !!data;
    }

    // ======================
    // CREATE
    // ======================
    async create(data) {
        return await Parqueo.create({
            PQ_Nombre: data.PQ_Nombre,
            PQ_Direccion: data.PQ_Direccion,
            PQ_Capacidad: data.PQ_Capacidad,
            estado: 1
        });
    }

    // ======================
    // UPDATE (SOLO ACTIVOS)
    // ======================
    async update(id, data) {
        return await Parqueo.update(
            {
                PQ_Nombre: data.PQ_Nombre,
                PQ_Direccion: data.PQ_Direccion,
                PQ_Capacidad: data.PQ_Capacidad
            },
            {
                where: {
                    PQ_Parqueo: id,
                    estado: 1
                }
            }
        );
    }

    // ======================
    // DELETE LÓGICO
    // ======================
    async delete(id) {
        const parqueo = await Parqueo.findOne({
            where: {
                PQ_Parqueo: id,
                estado: 1
            }
        });

        if (!parqueo) return false;

        await Parqueo.update(
            { estado: 0 },
            {
                where: {
                    PQ_Parqueo: id
                }
            }
        );

        return true;
    }

    // ======================
    // RESTORE (REACTIVAR)
    // ======================
async restore(id) {
    const result = await Parqueo.update(
        { estado: 1 },
        {
            where: { PQ_Parqueo: id, estado: 0 }
        }
    );

    // result = [rowsAffected]
    if (result[0] === 0) {
        return false;
    }

    return true;
}
}
module.exports = new ParqueoStore();