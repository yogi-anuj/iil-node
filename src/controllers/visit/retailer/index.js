const { MESSAGE, API_END_POINT , RECORD_TYPES, SCORE,OBJECTKEYNAME} = require("../../../utilities/constants");
const { formatDate } = require("../../../utilities/customDate");
const { responseBody } = require("../../../utilities/customResponse");
const { getUniqueId } = require("../../../utilities/uniqueId");
const { insertLeaderBoard } = require("../../leaderboard");
const { farmerVisits, Product } = require("../query");
const { farmerVisit, retailerVisit } = require("./query");
exports.addRetailersVisit=async(req,res)=>{
    try{
        const {
            Mobile__c,
            Order__c,
            Product__c,
            Qty__c,
            Feedback__c,
            Account__c,
            // picture__c,
            last_visit_date,
            At_Shop__c,
            High_moving_IIL_products__c,
            Comments__c,
            Geo_Location__Latitude__s,
            Geo_Location__Longitude__s,
            Contact_person__c,
            Retailer_Shop_name__c,
            Pesticides_License_Number__c,
          } = req.body;
          const {sfid}=req.payload;
      
          if (!(Geo_Location__Latitude__s && Geo_Location__Longitude__s)) {
            return res.status(500).json(responseBody(MESSAGE.TURN_ON_LOCATION, API_END_POINT.ADD_AGRIEXPERT_VISIT));
          }
      
          if (
            !(
              Mobile__c &&
              Comments__c &&
              At_Shop__c &&
              Account__c
              // Geo_Location__Longitude__s &&
              // Geo_Location__Latitude__s
            )
          ) {
            return res.status(500).json(responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.ADD_RETAILER_VISIT));
          }
      
          //${OBJECTKEYNAME.HIGH_MOVING_IIL_PRODUCTS__C},  '${High_moving_IIL_products__c}',
          const uniqueId = getUniqueId();
          const values=[
            Mobile__c,
          Order__c,
          Product__c,
          Qty__c,
          Feedback__c,
          At_Shop__c,
          Account__c,
          last_visit_date,
          Comments__c,
          Geo_Location__Latitude__s,
          Geo_Location__Longitude__s,
          sfid,
         
          uniqueId,
          Contact_person__c,
          Retailer_Shop_name__c,
          Pesticides_License_Number__c,
          RECORD_TYPES.RETAILER_VISIT
          ]
          const result = await retailerVisit.insertRetailerVisit(values);
    if (result) {
        let insertData=[];
      for (let product of High_moving_IIL_products__c) {
        const { quantity, name, unit, sfid, otherBrandName } = product;
        insertData.push([
           sfid,
           quantity,
           unit,
           otherBrandName,
            getUniqueId(),
              uniqueId,
          ]);
       
        
      }
      const Inserted = await retailerVisit.insertProductDetails(insertData);
        console.log(API_END_POINT.ADD_DISTRIBUTOR_VISIT, ' ========> DATA 2');
    }
    insertLeaderBoard(SCORE.VISIT.RETAILER.SCORE, SCORE.VISIT.RETAILER.NAME, sfid)

    return res.json(responseBody(
      `Retailer visit ${MESSAGE.INSERTED_SUCCESS}`,
      API_END_POINT.ADD_RETAILER_VISIT
    ));

    }
    catch(error){
        console.log(API_END_POINT.ADD_RETAILER_VISIT, ' error ========>', error);
    return res.status(500).json(responseBody(error.message, API_END_POINT.ADD_RETAILER_VISIT));
    }

};
exports.getRetailerVisit=async(req,res)=>{
    try{
        let { searchField } = req.body;
        const {sfid}=req.payload;
        const result = await retailerVisit.getRetailers(searchField,sfid)
        return res.json(responseBody(MESSAGE.FETCHSUCCESS, API_END_POINT.GET_RETAILER_VISIT, result.rows));


    }
    catch(error){
        console.error(error);
    return res.json(responseBody(error.message, API_END_POINT.GET_RETAILER_VISIT));

    }
};
exports.getRetailerVisitById=async(req,res)=>{
    try{
        const { herokuId } = req.body;

    if (!herokuId) {
      return res.json(responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.GET_RETAILER_VISIT_BY_ID));
    }
    const {sfid}=req.payload;

    

    const result = await retailerVisit.getRetailersById(sfid,herokuId)
    return res.json(responseBody(
      MESSAGE.FETCHSUCCESS,
      API_END_POINT.GET_RETAILER_VISIT_BY_ID,
      result.rows[0] || {}
    ));

    }
    catch(error){
        console.error(error);
    return res.status(500).json(responseBody(error.message, API_END_POINT.GET_RETAILER_VISIT_BY_ID));
    }
};
exports.updateRetailerById=async()=>{
    try{
        const {
            Mobile__c,
            Order__c,
            Product__c,
            Qty__c,
            Feedback__c,
            // picture__c,
            last_visit_date,
            At_Shop__c,
            High_moving_IIL_products__c,
            Comments__c,
            Geo_Location__Latitude__s,
            Geo_Location__Longitude__s,
            Contact_person__c,
            Retailer_Shop_name__c,
            Pesticides_License_Number__c,
            herokuId,
          } = req.body;
      
          if (!(Geo_Location__Latitude__s && Geo_Location__Longitude__s)) {
            return res.json(responseBody(MESSAGE.TURN_ON_LOCATION, API_END_POINT.UPDATE_RETAILER_VISIT_BY_ID));
          }
      
          if (
            !(
              Mobile__c &&
              Comments__c &&
              At_Shop__c &&
              herokuId
            )
          ) {
            return res.json(responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.UPDATE_RETAILER_VISIT_BY_ID));
          }
          const fieldUpdates = {
            [OBJECTKEYNAME.MOBILE__C]: Mobile__c,
            [OBJECTKEYNAME.ORDER__C]: Order__c,
            [OBJECTKEYNAME.PRODUCT__C]: Product__c,
            [OBJECTKEYNAME.Qty__c]: Qty__c,
            [OBJECTKEYNAME.FEEDBACK__C]: Feedback__c,
            [OBJECTKEYNAME.AT_SHOP__C]: At_Shop__c,
            [OBJECTKEYNAME.LAST_VISIT_DATE__C]: last_visit_date,
            [OBJECTKEYNAME.COMMENTS__C]: Comments__c,
            [OBJECTKEYNAME.Geo_Location__Longitude__s]: Geo_Location__Longitude__s,
            [OBJECTKEYNAME.Geo_Location__Latitude__s]: Geo_Location__Latitude__s,
            [OBJECTKEYNAME.CONTACT_PERSON__C]: Contact_person__c,
            [OBJECTKEYNAME.RETAILER_SHOP_NAME__C]: Retailer_Shop_name__c,
            [OBJECTKEYNAME.PESTICIDES_LICENSE_NUMBER__C]: Pesticides_License_Number__c,
          };
         

    const values = Object.values(fieldUpdates);
    values.push(herokuId); // Add the herokuId value

    const updatedRes = await retailerVisit.updateRetailerById(fieldUpdates, values);
    if (updatedRes) {
        // delete previous product data
        
        
        await Product.deleteProduct(herokuId);
  
        let insertData = [];
        for (let product of High_moving_IIL_products__c) {
          const { quantity, unit, sfid, otherBrandName } = product;
  
          insertData.push([
            sfid,
            quantity,
            unit,
            otherBrandName,
            getUniqueId(),
            herokuId,
          ]);
        }
        const qry = format(
          `INSERT INTO ${SCHEMA.SALESFORCE.NEW_PRODUCT__C} (
              ${OBJECTKEYNAME.PRODUCT__C},
              ${OBJECTKEYNAME.QUANTITY__C},
              ${OBJECTKEYNAME.UNIT__C},
              ${OBJECTKEYNAME.OTHER_BRAND__C},
              ${OBJECTKEYNAME.HEROKU_ID__C},
              ${OBJECTKEYNAME.VISIT__C__HEROKU_ID__C})
                VALUES %L returning *
                `,
          insertData
        );
        await client.query(qry);
      }
  
      return res.json(responseBody(
        `Retailer visit ${MESSAGE.UPDATESUCCESS}`,
        API_END_POINT.UPDATE_RETAILER_VISIT_BY_ID
      ));

    }
    catch(error){
        console.log(API_END_POINT.UPDATE_RETAILER_VISIT_BY_ID, error);
    return res.json(responseBody(error.message, API_END_POINT.UPDATE_RETAILER_VISIT_BY_ID));
    }

}