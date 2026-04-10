class ResponseHandler {

    static success(res, data = null, message = 'Operación exitosa', status = 200) {
        return res.status(status).json({
            success: true,
            status,
            message,
            data
        });
    }

    static error(res, message = 'Error', status = 500, details = null) {
        return res.status(status).json({
            success: false,
            status,
            message,
            details
        });
    }

}

module.exports = ResponseHandler;