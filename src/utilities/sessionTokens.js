const jwt = require("jsonwebtoken");
const JWTSECRET = process.env.JWTSECRET;


const generateSignature = async (payload) => {
    return jwt.sign(payload, JWTSECRET, { expiresIn: "1w" });
}

const validateSignature = async (token) => {
    return jwt.verify(token, JWTSECRET);
}

module.exports = {
    generateSignature, validateSignature
}