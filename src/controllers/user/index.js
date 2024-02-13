const { API_END_POINT, MESSAGE } = require("../../utilities/constants");
const { responseBody } = require("../../utilities/customResponse");
// const moment = require('moment-timezone');

// controller to assign area manager to a user
exports.getAreaManager = async (req, res) => {
    try {
        const {sfid, name__c} = req.payload;

        return res.json(responseBody(MESSAGE.FETCHSUCCESS, API_END_POINT.ASSIGN_TO, false, [{name__c, sfid}]));

    } catch (error) {
        console.error(error.message);
        return res.status(500).json(responseBody(error.message, API_END_POINT.ASSIGN_TO));
    }
}