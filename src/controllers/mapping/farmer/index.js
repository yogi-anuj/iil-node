const { responseBody } = require("../../../utilities/customResponse");
const {
  API_END_POINT,
  MESSAGE,
  USER_HIERARCHY,
  OBJECTKEYNAME,
  NOTIFICATION_FOR,
  firebaseAdmin,
  STATUS,
  DISTRIBUTOR_APPROVAL_STATUS,
  RECORD_TYPES,
} = require("../../../utilities/constants");
const { distributor } = require("../distributor/query");
const { getUniqueId } = require("../../../utilities/uniqueId");
const { Farmer } = require("./query");
const { farmerMapping, Account } = require("../query");

exports.addFarmerMappingDetails = async (req, res) => {
  try {
    const { sfid } = req.payload;
    const {
      Mobile__c,
      Farmer_Name__c,
      Date_of_Birth__c,
      Email__c,
      Father_Name__c,
      Total_Crop_Acreage__c,
      Number_of_fields__c,
      Are_you_on_field__c,
      State__c,
      District__c,
      Sub_District__c,
      Other_Sub_District__c,
      Village__c,
      Other_Village__c,
      Method__c,
      From_where__c,
      Name_of_Rertailer_1__c,
      Others1,
      Name_of_Rertailer_2__c,
      Others2,
      Name_of_Rertailer_3__c,
      Others3,
      Advice_from_influencer__c,
      ID_Type__c,
      picture__c,
      Profile_Picture__c,
      crop__c,
      Farmer_Category__c,
      Farmer_Range__c,
      InfluncerName,
      OtherAgriexpert,
      InfluncerMobileNumber,
      Geo_Location__Longitude__s,
      Geo_Location__Latitude__s,
      Pincode__c,
      Other_specify__c,
    } = req.body;
    if (
      !(
        Mobile__c &&
        Farmer_Name__c &&
        Total_Crop_Acreage__c &&
        Number_of_fields__c &&
        State__c &&
        District__c &&
        Sub_District__c &&
        Village__c &&
        Geo_Location__Latitude__s &&
        Geo_Location__Longitude__s &&
        crop__c
      )
    ) {
      return res
        .status(404)
        .json(
          responseBody(
            MESSAGE.MISSINGPARAMS,
            API_END_POINT.ADD_FARMER_MAPPING_DETAILS
          )
        );
    }
    const checkRes = await farmerMapping.checkQuery(Mobile__c);
    if (checkRes.rowCount) {
      if (checkRes.rows[0][OBJECTKEYNAME.EMAIL__C]) {
        return res
          .status(404)
          .json(
            responseBody(
              MESSAGE.EMAIL_DUPLICATE,
              API_END_POINT.ADD_FARMER_MAPPING_DETAILS
            )
          );
      }
      if (checkRes.rows[0][OBJECTKEYNAME.MOBILE__C]) {
        return res
          .status(404)
          .json(
            responseBody(
              "Farmer already exists",
              API_END_POINT.ADD_FARMER_MAPPING_DETAILS
            )
          );
      }
    }
    const values = [
      Mobile__c,
      Farmer_Name__c,
      Other_specify__c,
      Geo_Location__Latitude__s,
      Geo_Location__Longitude__s,
      Date_of_Birth__c,
      Email__c,
      Father_Name__c,
      Total_Crop_Acreage__c,
      Number_of_fields__c,
      Are_you_on_field__c,
      State__c,
      District__c,
      Sub_District__c,
      Other_Sub_District__c,
      Village__c,
      Other_Village__c,
      Method__c || "",
      From_where__c || "",
      Name_of_Rertailer_1__c || "",
      Name_of_Rertailer_2__c || "",
      Name_of_Rertailer_3__c || "",
      Others1 || "",
      Others2 || "",
      Others3 || "",
      InfluncerName || "",
      OtherAgriexpert || "",
      InfluncerMobileNumber || "",
      Advice_from_influencer__c || "",
      Farmer_Category__c || "",
      Farmer_Range__c || "",
      ID_Type__c || "",
      picture__c || "",
      Profile_Picture__c || "",
      RECORD_TYPES.FARMER,
      Farmer_Name__c,
      Pincode__c,
      getUniqueId(),
      sfid,
    ];

    const result = await Farmer.insertFarmerDetails(values);
    const insertedRowId = result.rows[0].heroku_id__c;
    
    if (insertedRowId) {
      try {
        let insertData = [];
        for (let index = 0; index < crop__c.length; index++) {
          const cropName = crop__c[index].crop || "";
          const session = crop__c[index].session || "";
          const acreage = crop__c[index].acreage || 0;
          const agri_inputs_exp_per_acre =
            crop__c[index].agri_inputs_exp_per_acre || 0;
          const irrigation__c = crop__c[index].irrigation__c || "";
          const other_irrigation__c = crop__c[index].other_irrigation__c || "";
          insertData.push([
            session,
            cropName,
            acreage,
            agri_inputs_exp_per_acre,
            insertedRowId,
            getUniqueId(),
            irrigation__c,
            other_irrigation__c,
          ]);
        }
        accountHerokuId = await Farmer.insertCropDetails(insertData);
      } catch (error) {
        console.log(error);
        await Account.deleteAccountById(insertedRowId);
        return res
          .status(404)
          .json(
            responseBody(
              MESSAGE.INSERTED_FAIL,
              API_END_POINT.ADD_FARMER_MAPPING_DETAILS
            )
          );
      }
    }
    return res
      .status(200)
      .json(
        responseBody(
          `Farmer ${MESSAGE.INSERTED_SUCCESS}`,
          API_END_POINT.ADD_FARMER_MAPPING_DETAILS,
          {}
        )
      );
  } catch (error) {
    console.log(
      API_END_POINT.ADD_FARMER_MAPPING_DETAILS,
      " error ========>",
      error
    );
    return res
      .status(500)
      .json(
        responseBody(error.message, API_END_POINT.ADD_FARMER_MAPPING_DETAILS)
      );
  }
};
exports.getFarmerMappingDetails = async (req, res) => {
  try {
    let { searchField, pageNumber = 1 } = req.body;
    let { territory_mapping2__c, sfid, profile__c, name__c } = req.payload;

    let territory2Status = territory_mapping2__c ? true : false;
    let response = await farmerMapping.getAllFarmersByTerritory(
      sfid,
      pageNumber,
      territory2Status,
      profile__c,
      searchField
    );
    return res.json(
      responseBody(
        MESSAGE.FETCHSUCCESS,
        API_END_POINT.GET_FARMER_MAPPING_DETAILS,
        false,
        response.rows || []
      )
    );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(
        responseBody(error.message, API_END_POINT.GET_FARMER_MAPPING_DETAILS)
      );
  }
};
exports.getFarmerMappingDetailsById = async (req, res) => {
  try {
    const { herokuId } = req.body;

    const response = await Farmer.getFarmerById(herokuId);

    const cropResponse = await Farmer.getFarmerCrops(herokuId);
    return res.json(
      responseBody(
        MESSAGE.FETCHSUCCESS,
        API_END_POINT.GET_FARMER_MAPPING_DETAILS_BY_ID,
        {
          ...response.rows[0],
          crop__c: cropResponse.rows,
        }
      )
    );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(
        responseBody(
          error.message,
          API_END_POINT.GET_FARMER_MAPPING_DETAILS_BY_ID
        )
      );
  }
};
exports.updateFarmerMappingDetailsById = async (req, res) => {
    
  try {
    const {sfid}=req.payload;
    const {
      Mobile__c,
      Farmer_Name__c,
      Other_specify__c,
      Date_of_Birth__c,
      Email__c,
      Father_Name__c,
      Total_Crop_Acreage__c,
      Number_of_fields__c,
      Are_you_on_field__c,
      State__c,
      District__c,
      Sub_District__c,
      Other_Sub_District__c,
      Village__c,
      Other_Village__c,
      Method__c,
      From_where__c,
      Name_of_Rertailer_1__c,
      Others1,
      Name_of_Rertailer_2__c,
      Others2,
      Name_of_Rertailer_3__c,
      Others3,
      Advice_from_influencer__c,
      ID_Type__c,
      picture__c,
      Profile_Picture__c,
      crop__c,
      Farmer_Category__c,
      Farmer_Range__c,
      InfluncerName,
      OtherAgriexpert,
      InfluncerMobileNumber,
      Geo_Location__Longitude__s,
      Geo_Location__Latitude__s,
      Pincode__c,
      herokuId,
    } = req.body;
    if (
      !(
        Mobile__c &&
        Farmer_Name__c &&
        Total_Crop_Acreage__c &&
        Number_of_fields__c &&
        State__c &&
        District__c &&
        Sub_District__c &&
        Village__c &&
        Geo_Location__Latitude__s &&
        Geo_Location__Longitude__s &&
        crop__c &&
        herokuId
      )
    ) {
      return res
        .status(404)
        .json(
          responseBody(
            MESSAGE.MISSINGPARAMS,
            API_END_POINT.UPDATE_FARMER_MAPPING_DETAILS_BY_ID
          )
        );
    }
    // if (Mobile__c) {
    //   const checkMobileRes = await Account.getAccountDetailsByMobile(
    //     Mobile__c, RECORD_TYPES.FARMER
    //   );
    //   if (
    //     checkMobileRes.rowCount &&
    //     checkMobileRes.rows[0][OBJECTKEYNAME.MOBILE__C]
    //   ) {
    //     return res
    //       .status(400)
    //       .json(
    //         responseBody(
    //           MESSAGE.MOBILE_DUPLICATE,
    //           API_END_POINT.UPDATE_FARMER_MAPPING_DETAILS_BY_ID
    //         )
    //       );
    //   }
    // }
    const getQryResponse = await Account.getAccountDetailById(herokuId);
      console.log("test is1")
      if (getQryResponse.rows.length === 0) {
      console.log("test is2")

      return res.status(404).json(responseBody(MESSAGE.DATA_NOT_FOUND, API_END_POINT.UPDATE_FARMER_MAPPING_DETAILS_BY_ID));
    }
    console.log("test is3")

    const fieldUpdates = {
        [OBJECTKEYNAME.MOBILE__C]: Mobile__c || getQryResponse.rows[0].mobile__c,
        [OBJECTKEYNAME.PINCODE__C]: Pincode__c || getQryResponse.rows[0].pincode__c,
        [OBJECTKEYNAME.Other_specify__c]: Other_specify__c || getQryResponse.rows[0].Other_specify__c,
        [OBJECTKEYNAME.FARMER_NAME__C]: Farmer_Name__c || getQryResponse.rows[0].farmer_name__c,
        [OBJECTKEYNAME.Geo_Location__Latitude__s]: Geo_Location__Latitude__s,
        [OBJECTKEYNAME.Geo_Location__Longitude__s]: Geo_Location__Longitude__s,
        [OBJECTKEYNAME.DATE_OF_BIRTH__C]: Date_of_Birth__c || getQryResponse.rows[0].date_of_birth__c || '',
        [OBJECTKEYNAME.EMAIL__C]: Email__c || getQryResponse.rows[0].email__c || '',
        [OBJECTKEYNAME.FATHER_NAME__C]: Father_Name__c || getQryResponse.rows[0].father_name__c || '',
        [OBJECTKEYNAME.TOTAL_CROP_ACREAGE__C]: Total_Crop_Acreage__c || getQryResponse.rows[0].total_crop_acreage__c || '',
        [OBJECTKEYNAME.NUMBER_OF_FIELDS__C]: Number_of_fields__c || getQryResponse.rows[0].number_of_fields__c || '',
        [OBJECTKEYNAME.ARE_YOU_ON_FIELD__C]: Are_you_on_field__c || getQryResponse.rows[0].are_you_on_field__c || '',
        [OBJECTKEYNAME.STATE__C]: State__c || getQryResponse.rows[0].state__c,
        [OBJECTKEYNAME.DISTRICT__C]: District__c || getQryResponse.rows[0].district__c,
        [OBJECTKEYNAME.SUB_DISTRICT__C]: Sub_District__c || getQryResponse.rows[0].sub_district__c,
        [OBJECTKEYNAME.Others_Sub_District__c]: Other_Sub_District__c || '',
        [OBJECTKEYNAME.VILLAGE__C]: Village__c || getQryResponse.rows[0].village__c,
        [OBJECTKEYNAME.Other_Village__c]: Other_Village__c || '',
        [OBJECTKEYNAME.METHOD__C]: Method__c || getQryResponse.rows[0].method__c || '',
        [OBJECTKEYNAME.FROM_WHERE__C]: From_where__c || getQryResponse.rows[0].from_where__c || '',
        [OBJECTKEYNAME.NAME_OF_RETAILER_1__C]: Name_of_Rertailer_1__c || getQryResponse.rows[0].name_of_retailer_1__c || '',
        [OBJECTKEYNAME.NAME_OF_RETAILER_2__C]: Name_of_Rertailer_2__c || getQryResponse.rows[0].name_of_retailer_2__c || '',
        [OBJECTKEYNAME.NAME_OF_RETAILER_3__C]: Name_of_Rertailer_3__c || getQryResponse.rows[0].name_of_retailer_3__c || '',
        [OBJECTKEYNAME.OTHER_1]: Others1 || getQryResponse.rows[0].others_1__c || '',
        [OBJECTKEYNAME.OTHER_2]: Others2 || getQryResponse.rows[0].others_2__c || '',
        [OBJECTKEYNAME.OTHER_3]: Others3 || getQryResponse.rows[0].others_3__c || '',
        [OBJECTKEYNAME.INFLUENCER_NAME__C]: InfluncerName || getQryResponse.rows[0].influencer_name_agriexpert__c || '',
        [OBJECTKEYNAME.OTHER_AGRIEXPERT__C]: OtherAgriexpert || getQryResponse.rows[0].other_agriexpert__c || '',
        [OBJECTKEYNAME.INFLUENCER_MOBILE__C]: InfluncerMobileNumber || getQryResponse.rows[0].influencer_mob_no__c || '',
        [OBJECTKEYNAME.ADVICE_FROM_INFLUENCER__C]: Advice_from_influencer__c || getQryResponse.rows[0].advice_from_influencer__c || '',
        [OBJECTKEYNAME.Farmer_Category__c]: Farmer_Category__c || getQryResponse.rows[0].farmer_category__c || '',
        [OBJECTKEYNAME.Farmer_Range__c]: Farmer_Range__c || getQryResponse.rows[0].farmer_range__c || '',
        [OBJECTKEYNAME.ID_TYPE__C]: ID_Type__c || getQryResponse.rows[0].id_type__c || '',
        [OBJECTKEYNAME.PICTURE__C]: picture__c || getQryResponse.rows[0].picture__c || '',
        [OBJECTKEYNAME.PROFILE_PICTURE__C]: Profile_Picture__c || getQryResponse.rows[0].profile_picture__c || '',
        [OBJECTKEYNAME.LAST_NAME]: Farmer_Name__c || getQryResponse.rows[0].lastname || '',
        [OBJECTKEYNAME.IS_PARTIAL_FARMER__c]: false,
        [OBJECTKEYNAME.Last_Modified_By_Id]: sfid,
      };
      const values = Object.values(fieldUpdates);
    values.push(herokuId); // Add the herokuId value
      await Account.updateAccount(fieldUpdates,values);


      if (crop__c.length > 0) {
        
        let vres=await Account.deleteCropById(herokuId);
  console.log("vres is", vres)
       
          let insertData = [];
          for (let index = 0; index < crop__c.length; index++) {
            const cropName = crop__c[index].crop || "";
            const session = crop__c[index].session || "";
            const acreage = crop__c[index].acreage || 0;
            const agri_inputs_exp_per_acre =
              crop__c[index].agri_inputs_exp_per_acre || 0;
            const irrigation__c = crop__c[index].irrigation__c || "";
            const other_irrigation__c = crop__c[index].other_irrigation__c || "";
            insertData.push([
              session,
              cropName,
              acreage,
              agri_inputs_exp_per_acre,
              herokuId,
              getUniqueId(),
              irrigation__c,
              other_irrigation__c,
            ]);
        }
        accountHerokuId = await Farmer.insertCropDetails(insertData);

         
        
      }
      return res.json(responseBody(
        'Farmer successfully updated',
        API_END_POINT.UPDATE_FARMER_MAPPING_DETAILS_BY_ID
      ));
  

  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(
        responseBody(
          error.message,
          API_END_POINT.UPDATE_FARMER_MAPPING_DETAILS_BY_ID
        )
      );
  }
};
