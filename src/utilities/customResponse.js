
// custom response body
const responseBody = (message, location, errorStatus = true, data) => {
    return {
        result: {
            hasError: errorStatus,
            message: message,
            location: location,
            data: data || {},
        }
    };
}

module.exports = { responseBody }