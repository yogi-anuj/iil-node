const { MESSAGE, API_END_POINT , RECORD_TYPES, SCORE,OBJECTKEYNAME} = require("../../../utilities/constants");
const { formatDate } = require("../../../utilities/customDate");
const { responseBody } = require("../../../utilities/customResponse");
const { getUniqueId } = require("../../../utilities/uniqueId");
const { insertLeaderBoard } = require("../../leaderboard");
const { farmerVisits, Product } = require("../query");
const { farmerVisit } = require("./query");

exports.addFarmerVisit=async(req,res)=>{
    try{
        const {sfid}= req.payload;
        const {
            Mobile__c,
            Account__c,
            On_Field__c,
            crop__c,
            Pest_Type__c,
            pest_Name__c,
            Conversion__c,
            picture__c,
            other_brand__c,
            plot_area__c,
            comments__c,
            product_interested__c,
            feedback__c,
            Geo_Location__Longitude__s,
            Geo_Location__Latitude__s,
            Farmer_Name__c,
            Father_Name__c,
            brand__c,
            Email__c,
            FO_Name__c,
            Last_Visit_Brand,
            Last_Visit_Date__c,
           
          } = req.body;
      
          if (!(Geo_Location__Latitude__s && Geo_Location__Longitude__s)) {
            return res.status(500).json(responseBody(MESSAGE.TURN_ON_LOCATION, API_END_POINT.ADD_FARMER_VISIT));
          }
      
          if (
            !(
              brand__c &&
              plot_area__c &&
              comments__c &&
              product_interested__c &&
              Mobile__c &&
              Account__c &&
              On_Field__c &&
              pest_Name__c &&
              // Conversion__c &&
              // Product_Bought__c &&
              // Product_Bought_From__c &&
              // picture__c &&
              crop__c
              // Geo_Location__Longitude__s &&
              // Geo_Location__Latitude__s
            )
          ) {
            return res.status(500).json(responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.ADD_FARMER_VISIT));
          }
          
          const uniqueId =  getUniqueId();
          const values=[
            Account__c,
        Mobile__c,
        Last_Visit_Brand,
        Last_Visit_Date__c,
        other_brand__c,
        comments__c,
        feedback__c,
        On_Field__c,
        Conversion__c,
        Geo_Location__Longitude__s,
        Geo_Location__Latitude__s,
        sfid,
        uniqueId,
        FO_Name__c,
        Farmer_Name__c,
        Father_Name__c,
        Email__c || '',
        picture__c,
      RECORD_TYPES.FARMER_VISIT
          ]
       const result = await farmerVisit.insertFarmerVisit(values); 
       if(result){
        product_interested__c.push(...brand__c);
        for(let product of product_interested__c){
            let { quantity, name, unit, sfid = '', otherBrandName = '', isProduct = false } = product;
            await farmerVisit.insertProductDetails(sfid,name,quantity,unit,isProduct,otherBrandName,uniqueId);


        }
        for(let crop of crop__c){
            let { plot_area__c, Pest_Type__c, pest_Name__c, crop_Name__c } = crop;
            await farmerVisit.insertCropDetails(plot_area__c, Pest_Type__c, pest_Name__c, crop_Name__c,uniqueId);

        }
       }
       insertLeaderBoard(SCORE.VISIT.FARMER.SCORE,SCORE.VISIT.FARMER.NAME,sfid);
       return res.json(responseBody(
        `Farmer visit ${MESSAGE.INSERTED_SUCCESS}`,
        API_END_POINT.ADD_FARMER_VISIT
      ));
       


    }
    catch(error){
        console.log(API_END_POINT.ADD_FARMER_VISIT, ' error ========>', error);
    return res.status(500).json(responseBody(error.message, API_END_POINT.ADD_FARMER_VISIT));

    }
};
exports.getFarmerVisit=async(req,res)=>{
    try{
        const { searchField } = req.body;
        const {sfid}= req.payload;
        const result = await farmerVisits.getFarmerVisitDetails(searchField,sfid);
    return res.json(responseBody(MESSAGE.FETCHSUCCESS, API_END_POINT.GET_FARMER_VISIT, result.rows));

    }
    catch(error){
        console.error(error);
    return res.status(500).json(responseBody(error.message, API_END_POINT.GET_FARMER_VISIT));

    }
};
exports.getFarmerVisitById=async(req,res)=>{
    try{
        const { herokuId } = req.body;
        const {sfid}=req.payload;
        

        if (!herokuId) {
          return res.status(500)
          .json(responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.GET_FARMER_VISIT_BY_ID));
        }
       
    let qryBrandResponse = await farmerVisit.getBrandDetails(sfid,herokuId);
    
    const result = await farmerVisit.getFarmerVisitDetailsById(sfid,herokuId);

    if (!result.rows.length) {
      return res.status(500).json(responseBody(MESSAGE.DATA_NOT_FOUND, API_END_POINT.GET_FARMER_MAPPING_DETAILS_BY_ID));
    }
    const lastVisitResponse = result.rows.length && result.rows[0].account__c && await farmerVisit.lastVisitDetails(sfid,result) || {};
    const cropResponse = await farmerVisit.getCropDetails(herokuId);

    return res.json(responseBody(MESSAGE.FETCHSUCCESS, API_END_POINT.GET_FARMER_VISIT_BY_ID, {
      ...result.rows[0],
      ...lastVisitResponse.rows[0],
      brand__c: qryBrandResponse.rows.length && qryBrandResponse.rows[0].brand__c || "",
      crop__c: cropResponse.rows || []
    }));


    }
    catch(error){
        console.error(error);
    return res.status(500).json(responseBody(error.message, API_END_POINT.GET_FARMER_VISIT_BY_ID));
    }
};
exports.updateFarmerVisitById=async(req,res)=>{
    try{
        const {
            Mobile__c,
            On_Field__c,
            crop__c,
            Pest_Type__c,
            pest_Name__c,
            Conversion__c,
            picture__c,
            other_brand__c,
            plot_area__c,
            comments__c,
            product_interested__c,
            feedback__c,
            Geo_Location__Longitude__s,
            Geo_Location__Latitude__s,
            Farmer_Name__c,
            Father_Name__c,
            brand__c,
            Email__c,
            FO_Name__c,
            Last_Visit_Brand,
            Last_Visit_Date__c,
            herokuId,
          } = req.body;
      
          if (!(Geo_Location__Latitude__s && Geo_Location__Longitude__s)) {
            return res.status(500).json(responseBody(MESSAGE.TURN_ON_LOCATION, API_END_POINT.UPDATE_FARMER_VISIT_BY_ID));
          }
      
          if (
            !(
              Pest_Type__c &&
              brand__c &&
              plot_area__c &&
              comments__c &&
              product_interested__c &&
              Mobile__c &&
              On_Field__c &&
              pest_Name__c &&
              herokuId &&
              // Conversion__c &&
              // Product_Bought__c &&
              // Product_Bought_From__c &&
              // picture__c &&
              crop__c
              // Geo_Location__Longitude__s &&
              // Geo_Location__Latitude__s
            )
          ) {
            return res.status(500).json(responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.UPDATE_FARMER_VISIT_BY_ID));
          }
          const fieldUpdates = {
            [OBJECTKEYNAME.MOBILE__C]: Mobile__c,
            [OBJECTKEYNAME.Last_Visit_Brand]: Last_Visit_Brand,
            [OBJECTKEYNAME.LAST_VISIT_DATE__C]: Last_Visit_Date__c,
            [OBJECTKEYNAME.OTHER_BRAND__C]: other_brand__c,
            [OBJECTKEYNAME.Plot_Area__c]: plot_area__c,
            [OBJECTKEYNAME.COMMENTS__C]: comments__c,
            [OBJECTKEYNAME.FEEDBACK__C]: feedback__c,
            [OBJECTKEYNAME.ON_FIELD__C]: On_Field__c,
            [OBJECTKEYNAME.CROP__C]: crop__c,
            [OBJECTKEYNAME.PEST_TYPE__C]: Pest_Type__c,
            [OBJECTKEYNAME.PEST_NAME__C]: pest_Name__c,
            [OBJECTKEYNAME.CONVERSION__C]: Conversion__c,
            [OBJECTKEYNAME.Geo_Location__Longitude__s]: Geo_Location__Longitude__s,
            [OBJECTKEYNAME.Geo_Location__Latitude__s]: Geo_Location__Latitude__s,
            [OBJECTKEYNAME.FO_NAME__C]: FO_Name__c,
            [OBJECTKEYNAME.FARMER_NAME__C]: Farmer_Name__c,
            [OBJECTKEYNAME.FATHER_NAME__C]: Father_Name__c,
            [OBJECTKEYNAME.EMAIL__C]: Email__c,
            [OBJECTKEYNAME.PICTURE__C]: picture__c,
          };
      
          
      
          const values = Object.values(fieldUpdates);
          values.push(herokuId); // Add the herokuId value
      
          const updatedRes = await farmerVisit.updateFarmerVisitDetails(fieldUpdates, values);
          if (updatedRes) {
            product_interested__c.push(...brand__c);
            // delete previous product data
           
            await Product.deleteProduct(herokuId);
            // delete previous crop data
           
            await Product.deleteProduct(herokuId);
      
            let insertData = [];
            for (let product of product_interested__c) {
              let { quantity, name, unit, sfid = '', otherBrandName, isProduct = false } = product;
      
              insertData.push([
                sfid,
                name,
                quantity,
                unit,
                isProduct,
                otherBrandName,
                getUniqueId(),
                herokuId,
              ]);
            }
      
            await farmerVisit.updateProductData(insertData);
      
            let insertCropData = [];
            for (let crop of crop__c) {
              let { plot_area__c, Pest_Type__c, pest_Name__c, crop_Name__c } = crop;
      
              insertData.push([
                plot_area__c,
                Pest_Type__c,
                pest_Name__c,
                crop_Name__c,
                getUniqueId(),
                herokuId,
              ]);
            }
             await farmerVisit.updateCropData(insertCropData)
          }
      
          return res.json(responseBody(
            `Farmer visit ${MESSAGE.UPDATESUCCESS}`,
            API_END_POINT.UPDATE_FARMER_VISIT_BY_ID
          ));
      

    }
    catch(error){
        console.log(API_END_POINT.UPDATE_FARMER_VISIT_BY_ID, error);
    return res.status(500).json(responseBody(error.message, API_END_POINT.UPDATE_FARMER_VISIT_BY_ID));

    }
};
exports.getCropsForFarmer=async(req,res)=>{
    try{
        const { farmerHerokuId } = req.body;
    if (!farmerHerokuId) {
      return res.status(500).json(responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.GET_CROPS_FOR_FARMER));
    }
    const cropsResponse = await farmerVisit.getCropsById(farmerHerokuId);

    return res.json(responseBody(MESSAGE.FETCHSUCCESS, API_END_POINT.GET_CROPS_FOR_FARMER, cropsResponse.rows || []));


    }
    catch(error){
        console.log(API_END_POINT.GET_CROPS_FOR_FARMER, error);
    return res.status(500).json(responseBody(error.message, API_END_POINT.GET_CROPS_FOR_FARMER));
    }
}
