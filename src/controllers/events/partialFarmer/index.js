const { responseBody } = require("../../../utilities/customResponse");
const {
    API_END_POINT,
    COMPANIES,
    MESSAGE,
    AGRI_EXPERT_TYPE,
    USER_HIERARCHY,
    OBJECTKEYNAME,
    NOTIFICATION_FOR,
    firebaseAdmin,
    STATUS,
    DISTRIBUTOR_APPROVAL_STATUS,
    RECORD_TYPES,
  } = require("../../../utilities/constants");
const { FarmerForEvent } = require("./query");
const { Account } = require("../../mapping/query");
const { getUniqueId } = require("../../../utilities/uniqueId");

  exports.addFarmerForEvent=async(req,res)=>{
    try{
        const {
            mobile,
            pincode__c,
            farmerName,
            state_sfid__c,
            district_sfid__c,
            sub_district_sfid__c,
            village_sfid__c,
            eventId
        } = req.params;
        const {sfid}=req.payload;

        if (!(mobile && farmerName && eventId && state_sfid__c && district_sfid__c && sub_district_sfid__c && village_sfid__c)) {
            return costomError(MESSAGE.MISSINGPARAMS, API_END_POINT.ADD_FARMER_FOR_EVENT);
        }
        const response=await Account.getAccountDetailsByMobileAndAccountType(mobile, RECORD_TYPES.FARMER);
        if(response.rows){
            return res.status(500).json(responseBody(MESSAGE.ACCOUNT_ALREADY_EXIST,API_END_POINT.ADD_FARMER_FOR_EVENT));
        }
        const uniqueId=getUniqueId();
        const values=[
            mobile,
            pincode__c,
            farmerName,
            farmerName,
            state_sfid__c,
            district_sfid__c,
            sub_district_sfid__c,village_sfid__c,
            village_sfid__c,
             true,
            RECORD_TYPES.FARMER,
            sfid,
            uniqueId,
            eventId
]
const result=await FarmerForEvent.addFarmerForEventDetails(values);

        const insertedRowId = result.rows[0].heroku_id__c;
        if (insertedRowId) {
           
            return res.json(responseBody(`Farmer event ${MESSAGE.INSERTED_SUCCESS}`, API_END_POINT.ADD_FARMER_FOR_EVENT));
        }
        return res.status(500).json(responseBody(MESSAGE.INSERTED_FAIL, API_END_POINT.ADD_FARMER_FOR_EVENT));

    }
    catch(error){
        console.log(error);
        return res.status(500).json(error.message,API_END_POINT.ADD_FARMER_FOR_EVENT);

    }
  };
  exports.getFarmerForEvent=async(req,res)=>{
    try{
        const {eventId,searchField}=req.body;
        if(!eventId){
            return res.status(500).json(responseBody(MESSAGE.MISSINGPARAMS,API_END_POINT.GET_FARMER_FOR_EVENT))
        }
        const result=await FarmerForEvent.getFarmerForEventByEventId(eventId,searchField);
        return res.json(responseBody("Done", API_END_POINT.GET_FARMER_FOR_EVENT, result.rows));

    }
    catch(error){
        console.log(error);
        return res.status(500).json(responseBody(error.message,API_END_POINT.GET_FARMER_FOR_EVENT));
        
    }
  };
  exports.getPartialFarmers=async(req,res)=>{
    try{
        const {searchField,pageNumber=1}=req.body;
        const{territory_mapping2__c, sfid, profile__c, name__c}=req.payload;
        const territory2Status=territory_mapping2__c?true:false;


    }
    catch(error){
        console.log(error);
        return res.status(500).json(responseBody(error.message,API_END_POINT.GET_PARTIAL_FARMERS))
    }
  }
