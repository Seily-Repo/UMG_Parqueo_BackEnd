const axios = require('axios'); 

class PagoService {
    static async validarPagoEnAPI(correlativo, authHeader) {
        try {
            const baseUrl = process.env.COBROS_API_BASE_URL || 'http://localhost:3000'; 
           console.log(`Validando pago para correlativo: ${correlativo} con authHeader: ${authHeader}`);
            const urlpago = `${baseUrl}/verify/${correlativo}`;
            console.log(`URL de pago construida: ${urlpago}`);
            const respuesta = await axios.get(urlpago, {
                headers: {
                    'Authorization': authHeader
                }
            });
            console.log("Respuesta del módulo de pagos:", respuesta.data);
            return respuesta.data;
        } catch (error) {
            console.error("Error al validar pago:", error.message);
            if (error.response && error.response.status === 404) {
                return null;
            }
            throw new Error("Error al comunicarse con el módulo de pagos.");
        }
    }
}

module.exports = PagoService;