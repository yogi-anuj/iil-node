const { responseBody } = require("../../../utilities/customResponse");
const {
  API_END_POINT,
  MESSAGE,
  SCORE,
  USER_HIERARCHY,
  OBJECTKEYNAME,
  AGRI_EXPERT_TYPE,
  NOTIFICATION_FOR,
  firebaseAdmin,
  STATUS,
  DISTRIBUTOR_APPROVAL_STATUS,
  RECORD_TYPES,
} = require("../../../utilities/constants");
const { distributor, distributorVisit } = require("../distributor/query");
const { distributorVisits } = require("../query");
const { getUniqueId } = require("../../../utilities/uniqueId");
const { insertLeaderBoard } = require("../../leaderboard");
const { AgriExpert } = require("./query");
exports.addAgriExpertVisit=async(req,res)=>{
    try{
        let { type_of_agri_expert__c, category_type__c, account__c, mobile__c, email__c, product_disscussion__c, new_products_discussion__c, focus_products_discussion__c, approach_for_trial__c, results_of_trial__c, comments__c, feedback__c, discussion__c, geo_location__longitude__s, geo_location__latitude__s, last_visit_date__c } = req.body;
        const {sfid}=req.payload;

    if (!(geo_location__latitude__s && geo_location__longitude__s)) {
      return res.status(500).json(responseBody(MESSAGE.TURN_ON_LOCATION, API_END_POINT.ADD_AGRIEXPERT_VISIT));
    }

    if (!(account__c && type_of_agri_expert__c)) {
      return res.status(500).json(responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.ADD_AGRIEXPERT_VISIT));
    }
    if (type_of_agri_expert__c === AGRI_EXPERT_TYPE.INFLUENCER && !(product_disscussion__c && focus_products_discussion__c && comments__c)) {
      return res.status(500).json(responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.ADD_AGRIEXPERT_VISIT));
    } else if (type_of_agri_expert__c === AGRI_EXPERT_TYPE.GOVT_DEPT && !comments__c) {
      return res.status(500).json(responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.ADD_AGRIEXPERT_VISIT));
    }

    const uniqueId = getUniqueId();
    

    const values = [
      category_type__c,
      type_of_agri_expert__c,
      last_visit_date__c,
      email__c,
      account__c,
      mobile__c,
      product_disscussion__c,
      new_products_discussion__c,
      focus_products_discussion__c,
      approach_for_trial__c,
      results_of_trial__c,
      comments__c,
      feedback__c,
      geo_location__latitude__s,
      geo_location__longitude__s,
      currentUser.attributes.sfid,
      uniqueId,
      RECORD_TYPES.AGRI_EXPERT_VISIT
    ];

    const result = await AgriExpert.addAgriExpertVisitDetails(values);
    insertLeaderBoard(SCORE.VISIT.AGRIEXPERT.SCORE,SCORE.VISIT.AGRIEXPERT.NAME,sfid)

    return res.json(responseBody(
      `Agri Expert Visit ${MESSAGE.INSERTED_SUCCESS}`,
      API_END_POINT.ADD_AGRIEXPERT_VISIT
    ));


    }
    catch(error){
        console.log(error);
    }
    
};
exports.getAgriExpertVisit=async(req,res)=>{
    try{
        let {searchField}=req.body;
        let {sfid}=req.payload;
          const response = await AgriExpert.getAgriExpertVisitors(searchField,sfid);
      
          return res.json(responseBody(MESSAGE.FETCHSUCCESS, API_END_POINT.GET_AGRIEXPERT_VISIT, response.rows));

    }
    catch(error){
        console.log(error);
        return res.status(500)
        .json(responseBody(error.message,API_END_POINT.ADD_AGRIEXPERT_VISIT))
       

    }
}
exports.getAgriExpertVisitById=async(req,res)=>{
    try{
        let { herokuId } = req.body;

    if (!herokuId) {
      return res.status(500).json(responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.GET_AGRIEXPERT_VISIT_BY_ID));
    }

    let response = await AgriExpert.getAgriExpertVisitorsById(herokuId);

    const cropResponse = await AgriExpert.getCropsById(herokuId);

    if (response.rows[0] == undefined) {
      
      let newResponse = await AgriExpert.getAccountDetails(herokuId);

      let obj = {
        "heroku_id__c": "",
        "category_type__c": "",
        "type_of_agri_expert__c": "",
        "email__c": "",
        "mobile__c": "",
        "product_disscussion__c": "",
        "new_products_discussion__c": "",
        "focus_product_discussion__c": "",
        "approach_for_trial__c": "",
        "results_of_trial__c": "",
        "comments__c": "",
        "feedback__c": "",
        "last_visit_date__c": "",
        "createddate": "",
        ...newResponse.rows[0],
        "crop__c": cropResponse.rows
      }
      return res.json(responseBody(MESSAGE.FETCHSUCCESS, API_END_POINT.GET_AGRIEXPERT_VISIT_BY_ID, obj));
    }

    return res.json(responseBody(MESSAGE.FETCHSUCCESS, API_END_POINT.GET_AGRIEXPERT_VISIT_BY_ID, {...response.rows[0], "crop__c": cropResponse.rows}));

    }
    catch(error){
        console.error(error);
    return res.status(500).json(responseBody(error.message, API_END_POINT.GET_AGRIEXPERT_VISIT_BY_ID));
        
    }
};
exports.getAgriExpertVisitById=async(req,res)=>{
    try{
        const { mobile__c } = req.body;
        const {sfid}=req.payload;
        
    
        var lastVisitResponse = await AgriExpert.getAgriExpertLastVisitDetails(mobile__c,sfid);
    
        return res.json(responseBody('Agri Expert Last Visit Date', API_END_POINT.GET_AGRIEXPERT_LAST_VISIT_BY_ID, lastVisitResponse.rows.length > 0 && lastVisitResponse.rows[0] || { 'last_visit_date': '' }));


    }
    catch(error){
        console,log(error);
        return res.status(500)
        .json(responseBody(error.message,API_END_POINT.GET_AGRIEXPERT_LAST_VISIT_BY_ID));
    }
}
