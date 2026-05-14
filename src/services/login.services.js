const axios = require('axios');

class LoginService {
    static async consultarVehiculoAPI(placa, token) {
        try {
            const baseUrl = process.env.LOGIN_API_BASE_URL; 
            const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
            const urlPlaca = `${cleanBaseUrl}/${placa}`;
            const config = {};
            if (token) {
                config.headers = { 'Authorization': `Bearer ${token}` };
            }

            const respuesta = await axios.get(urlPlaca, config);
            return respuesta.data;
        } catch (error) {
            if (error.response) {
                if (error.response.status === 404) {
                    return null; // Placa no encontrada
                }
                if (error.response.status === 400) {
                    throw new Error("Placa Inválida");
                }
            } else if (error.request) {
                // No se pudo conectar a la API (timeout, rechazado, etc)
                throw new Error("No se pudo conectar a login");
            }
            
            throw new Error("Error al comunicarse con el módulo de login.");
        }
    }
}

module.exports = LoginService;
