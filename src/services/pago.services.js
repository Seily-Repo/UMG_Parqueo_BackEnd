const axios = require('axios'); 
require('dotenv').config();

class PagoService {
    static async validarPagoEnAPI(correlativo) {
        try {
            const baseUrl = process.env.COBROS_API_BASE_URL || 'http://localhost:3000'; 
            const urlpago = `${baseUrl}/verify/${correlativo}`;
            
            const respuesta = await axios.get(urlpago, {
                headers: {
                    'Authorization': `Bearer ${process.env.COBROS_API_TOKEN}`
                }
            });

            console.log(baseUrl);
            console.log(respuesta);

            return respuesta.data; 

        } catch (error) {
            if (error.response && error.response.status === 404) {
                return null;
            }
            throw new Error("Error al comunicarse con el módulo de pagos.");
        }
    }
}

module.exports = PagoService;