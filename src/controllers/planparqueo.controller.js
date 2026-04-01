async function crearPlan(req, res) {

    let connection;

    try {

        connection = await getConnection();

        const { PLA_ID_PLAN, PLA_DESCRIPCION, PLA_PRECIO, PLA_ESTADO } = req.body;

        await connection.execute(
            `
            INSERT INTO PLAN_PARQUEO
            (PLA_ID_PLAN, PLA_DESCRIPCION, PLA_PRECIO, PLA_ESTADO)
            VALUES
            (:id, :descripcion, :precio, :estado)
            `,
            {
                id: PLA_ID_PLAN,
                descripcion: PLA_DESCRIPCION,
                precio: PLA_PRECIO,
                estado: PLA_ESTADO
            },
            { autoCommit: true }
        );

        res.json({
            mensaje: "Plan creado correctamente"
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
}

async function obtenerPlanes(req, res) {

    let connection;

    try {

        connection = await getConnection();

        const result = await connection.execute(
            `
            SELECT *
            FROM PLAN_PARQUEO
            `
        );

        res.json(result.rows);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
}

