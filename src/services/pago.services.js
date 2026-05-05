const axios = require('axios'); 

class PagoService {
    static async validarPagoEnAPI(correlativo) {
        try {
            const baseUrl = process.env.COBROS_API_BASE_URL || process.env.URL_PAGOS; 
            
            const urlpago = `${baseUrl}/verify/${correlativo}`;
            
            const respuesta = await axios.get(urlpago);
            
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