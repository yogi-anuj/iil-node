const { API_END_POINT, MESSAGE } = require("../../utilities/constants");
const { responseBody } = require("../../utilities/customResponse");

exports.getDistributorsForOrder = async(req, res) => {
    try {
        let {serachField,pageNumber=1}=req.body;
        let { territory_mapping2__c, sfid, profile__c } = req.payload;

        let territory2Status = territory_mapping2__c ? true : false;
        const currentUser= req.payload;
        if(!currentUser){
          console.error(MESSAGE.UNAUTHORIZEDACCESS,API_END_POINT.GET_DISTRIBUTORS_FOR_ORDER)  ;
          }
          




    
        


        
    } catch (error) {
        console.error(error);
        return responseBody(error.message, API_END_POINT.GET_DISTRIBUTORS_FOR_ORDER);
    }
}