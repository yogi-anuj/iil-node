const { API_END_POINT, MESSAGE, VALIDATE } = require("../../utilities/constants");
const { responseBody } = require("../../utilities/customResponse");
const { Files } = require("../files/query");
const { distributorMapping, Account } = require("./query");

// get all distributors
exports.getDistributorMapping = async(req, res) => {
    try {
        let { searchField, pageNumber = 1 } = req.body;
        let { territory_mapping2__c, sfid, profile__c } = req.payload;

        let territory2Status = territory_mapping2__c ? true : false;

        let response = await distributorMapping.getDistributorMapping(sfid, pageNumber, territory2Status, profile__c, searchField);

        return res.json(responseBody(MESSAGE.FETCHSUCCESS, API_END_POINT.GET_DISTRIBUTOR_MAPPING_DETAILS, false, response.rows));
    } catch (error) {
        console.error(error);
        return res.status(500).json(responseBody(error.message, API_END_POINT.GET_DISTRIBUTOR_MAPPING_DETAILS));
    }
}

// get distributors information by id
exports.getDistributorMappingById = async (req, res) => {
    try {
        const { herokuId } = req.body;
        
        if(!herokuId){
            return res.status(404).json(responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.GET_DISTRIBUTOR_MAPPING_DETAILS_BY_ID));
        }

        let distributorDetails = await distributorMapping.getDistributorById(herokuId);
        let Proprietor_Details_Response = await distributorMapping.getProprietorDetailById(herokuId);
        let Company_Details__Response = await distributorMapping.getCompanyDetailById(herokuId);
        let Product_Of_Interest_Response = await distributorMapping.getProductInterestById(herokuId);
        let Sister_Company_Details_Response = await distributorMapping.getSisterCompanyDetailById(herokuId);
        let Files_Response = await Files.getAccountsFileDetailById(herokuId);
        let Approval_Response = await distributorMapping.getApprovalDetailById(herokuId);

        return res.json(responseBody(MESSAGE.FETCHSUCCESS, API_END_POINT.GET_DISTRIBUTOR_MAPPING_DETAILS_BY_ID, false, 
            {
                ...distributorDetails.rows[0],
                "Proprietor_Details__c": Proprietor_Details_Response.rows,
                "Company_Details__c": Company_Details__Response.rows,
                "Product_Of_Interest__c": Product_Of_Interest_Response.rows,
                "Sister_Company_Details__c": Sister_Company_Details_Response.rows,
                "Files__c": Files_Response.rows,
                "Approval__c": Approval_Response.rows,
            }
        ));
    } catch (error) {
        console.error(error);
        return res.status(500).json(responseBody(error.message, API_END_POINT.GET_DISTRIBUTOR_MAPPING_DETAILS_BY_ID));
    }
}

// validate fields like mobile, aadhar, mobile in event, gst, pan, fertilizer no, insecticide no, etc...
exports.validateFields = async(req, res) => {
    try {
        const { eventName, data, recordTypeId } = req.body;
        
        if (!(eventName && data)) {
            return res.status(404).json(responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.VALIDATE_FIELD));
        }

        let response;
        switch (eventName.toLowerCase()) {
            case VALIDATE.MOBILE:
                response = await Account.getAllAccountDetailsByMobile(data, recordTypeId);
                break;
        
            default:
                break;
        }
        
        return res.json(responseBody(MESSAGE.FETCHSUCCESS, API_END_POINT.VALIDATE_FIELD, false, response.rows));
    } catch (error) {
        console.error(error);
        return res.status(500).json(responseBody(error.message, API_END_POINT.VALIDATE_FIELD))
    }
}