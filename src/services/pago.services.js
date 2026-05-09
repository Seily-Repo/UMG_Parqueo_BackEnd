const axios = require('axios'); 
require('dotenv').config();

class PagoService {
    static async validarPagoEnAPI(correlativo) {
        if (!correlativo) {
            throw new Error("El parámetro 'correlativo' es obligatorio.");
        }

        const token = process.env.COBROS_API_TOKEN;
        if (!token) {
            console.warn("⚠️ ADVERTENCIA: COBROS_API_TOKEN no está definido en el archivo .env");
        }

        try {
            const baseUrl = process.env.COBROS_API_BASE_URL || 'http://localhost:3000'; 
            const urlpago = `${baseUrl}/verify/${correlativo}`;
            
            const respuesta = await axios.get(urlpago, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                timeout: 5000 
            });

            console.log(`[PagoService] Solicitud exitosa a: ${urlpago}`);
            console.log(`[PagoService] Datos recibidos:`, respuesta.data);

            return respuesta.data; 

        } catch (error) {
            if (error.response) {
                if (error.response.status === 404) {
                    console.log(`[PagoService] Pago no encontrado (404) para correlativo: ${correlativo}`);
                    return null;
                }
                console.error(`[PagoService] Error del servidor de pagos (${error.response.status}):`, error.response.data);
            } else if (error.request) {
                console.error(`[PagoService] No se obtuvo respuesta de la API de pagos:`, error.message);
            } else {
                console.error(`[PagoService] Error interno al preparar la solicitud:`, error.message);
            }

            throw new Error(`Error al comunicarse con el módulo de pagos: ${error.message}`);
        }
    }
}

module.exports = PagoService;