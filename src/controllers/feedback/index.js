const { API_END_POINT, MESSAGE, USER_HIERARCHY } = require("../../utilities/constants");
const { responseBody } = require("../../utilities/customResponse");
const { getUniqueId } = require("../../utilities/uniqueId");
const { feedback } = require("./query");

// get all the feedbacks
exports.getAllFeedback = async (req, res) => {
    try {
        const { pageNumber } = req.body;
        const { territory_mapping2__c, profile__c, sfid } = req.payload;

        let territory2Status = territory_mapping2__c ? true : false;

        let response = await feedback.getFeedback(profile__c, sfid, territory2Status, pageNumber);

        return res.json(responseBody(MESSAGE.FETCHSUCCESS, API_END_POINT.GET_FEEDBACK, false, response.rows));
    } catch (error) {
        console.error(error);
        return res.status(500).json(responseBody(error.message, API_END_POINT.GET_FEEDBACK));
    }
}

// add new feedbacks
exports.addNewFeedback = async (req, res) => {
    try {
        const { Complaint_Type__c, Subject__c, Description__c, accountId, userType } = req.body;
        const { sfid } = req.payload;

        if (!(Complaint_Type__c && Subject__c && Description__c && userType && accountId)) {
            return res.status(401).json(responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.ADD_FEEDBACK));
        }

        const uniqueId = getUniqueId();

        let isDistributor = userType.toLowerCase() === "distributor" ? true : false

        let response = await feedback.addNewFeedback(Complaint_Type__c, Subject__c, Description__c, isDistributor, accountId, uniqueId, sfid);

        if (!response.rowCount) {
            return res.status(401).json(responseBody(`Feedback ${MESSAGE.INSERTED_FAIL}`, API_END_POINT.ADD_FEEDBACK));
        }

        return res.json(responseBody(`Feedback ${MESSAGE.INSERTED_SUCCESS}`, API_END_POINT.ADD_FEEDBACK, false, uniqueId));
    } catch (error) {
        console.error(error);
        return res.status(500).json(responseBody(error.message, API_END_POINT.ADD_FEEDBACK));
    }
}

exports.updateFeedbackStatus = async (req, res) => {
    try {
        const { profile__c } = req.payload;

        if (profile__c != USER_HIERARCHY.VP_user) {
            return res.status(401).json(responseBody(MESSAGE.UNAUTHORIZEDACCESS, API_END_POINT.UPDATE_FEEDBACK_STATUS));
        }

        const {feedbackStatus, herokuId} = req.body;
        
        const response = await feedback.updateFeedbackStatus(feedbackStatus, herokuId);
        
        if(!response.rowCount){
            return res.status(401).json(responseBody(MESSAGE.UPDATEFAIL, API_END_POINT.UPDATE_FEEDBACK_STATUS));
        }

        return res.json(responseBody(MESSAGE.UPDATESUCCESS, API_END_POINT.UPDATE_FEEDBACK_STATUS, false));
    } catch (error) {
        console.error(error);
        return res.status(500).json(responseBody(error.message, API_END_POINT.UPDATE_FEEDBACK_STATUS));
    }
}