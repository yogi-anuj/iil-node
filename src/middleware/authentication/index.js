const { user } = require("../../controllers/authenticate/query");
const { responseBody } = require("../../utilities/customResponse");
const { validateSignature } = require("../../utilities/sessionTokens");

module.exports = async (req, res, next) => {
    const token = req.header("x-auth-token");

    if (!token) {
        return res.status(401).json(responseBody("No token, authorization denied", 'Authentication'));
    }
    
    try {
        // validate token
        let data = await validateSignature(token);
        
        if (!data) {
            return res.status(403).json(responseBody("Unauthorized", 'Authentication'));
        }
        
        // check if the token sent exists in the database for that user
        const checkTokenExists = await user.checkTokenExistence(data.sfid, token);

        if(!checkTokenExists){
            return res.status(403).json(responseBody("Unauthorized", 'Authentication'));
        }
        
        req.payload = data;
        next();
    } catch (err) {
        return res.status(401).json(responseBody("Invalid token.", 'Authentication'));
    }
}


