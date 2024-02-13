const { API_END_POINT, MESSAGE } = require("../../utilities/constants");
const { responseBody } = require("../../utilities/customResponse");
const { picklist } = require("./query");

// controller to assign area manager to a user
exports.getPicklistData = async (req, res) => {
    try {

        const response = await picklist.getMasterPicklist();

        let result = {};
        response.rows.map(data => {
        if (!result[data.name_tag]) {
            result[data.name_tag] = [];
        }
        result[data.name_tag] = [
            ...result[data.name_tag],
            { name__c: data.name__c, agri_inputs_exp_per_acre: data.agri_inputs_exp_per_acre },
        ];
        });

        return res.json(responseBody(MESSAGE.FETCHSUCCESS, API_END_POINT.GET_PICKLIST_MASTER, false, result));

    } catch (error) {
        console.error(error.message);
        return res.status(500).json(responseBody(error.message, API_END_POINT.GET_PICKLIST_MASTER));
    }
}