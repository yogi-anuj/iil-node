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

// onboard new farmer accounts
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

    // checking geo locaiton
    if (!(Geo_Location__Latitude__s && Geo_Location__Longitude__s)) {
      return res.status(404).json(responseBody(MESSAGE.GEOLOCATION_MISSING, API_END_POINT.ADD_FARMER_MAPPING_DETAILS));
    }

    // checking mandatory fields
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

    // check if the account already exists
    const checkRes = await Account.getAccountDetailsByMobileAndAccountType(Mobile__c, RECORD_TYPES.FARMER);
    if (checkRes.rowCount) {
      // checking duplicate email
      if (checkRes.rows[0][OBJECTKEYNAME.EMAIL__C] == Email__c) {
        return res
          .status(404)
          .json(
            responseBody(
              MESSAGE.EMAIL_DUPLICATE,
              API_END_POINT.ADD_FARMER_MAPPING_DETAILS
            )
          );
      }
      // checking duplicate mobile
      if (checkRes.rows[0][OBJECTKEYNAME.MOBILE__C] == Mobile__c) {
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

    const famerHerokuId = getUniqueId();

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
      Method__c || '',
      From_where__c || '',
      Name_of_Rertailer_1__c || '',
      Name_of_Rertailer_2__c || '',
      Name_of_Rertailer_3__c || '',
      Others1 || '',
      Others2 || '',
      Others3 || '',
      InfluncerName || '',
      OtherAgriexpert || '',
      InfluncerMobileNumber || '',
      Advice_from_influencer__c || '',
      Farmer_Category__c || '',
      Farmer_Range__c || '',
      ID_Type__c || '',
      picture__c || '',
      Profile_Picture__c || '',
      RECORD_TYPES.FARMER,
      Farmer_Name__c,
      Pincode__c,
      famerHerokuId,
      sfid,
    ];

    const result = await Farmer.insertFarmerDetails(values);

    // if successful then insert crop data
    if (result.rowCount && result.rows[0].heroku_id__c) {
      try {
        let insertData = [];
        for (let index = 0; index < crop__c.length; index++) {
          const { cropName = '', session = '', acreage = 0, agri_inputs_exp_per_acre = 0, irrigation__c = '', other_irrigation__c = '' } = crop__c[index]
          insertData.push([
            session,
            cropName,
            acreage,
            agri_inputs_exp_per_acre,
            famerHerokuId,
            getUniqueId(),
            irrigation__c,
            other_irrigation__c,
          ]);
        }
        await Farmer.insertCropDetails(insertData);
      } catch (error) {
        console.log(error);
        // while inserting crop details any error occurs then delete the farmer details
        await Account.deleteAccountById(famerHerokuId);
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
          false,
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

// get all the farmers within the territory
exports.getFarmerMappingDetails = async (req, res) => {
  try {
    let { searchField, pageNumber = 1 } = req.body;
    let { territory_mapping2__c, sfid, profile__c, name__c } = req.payload;

    let territory2Status = territory_mapping2__c ? true : false;
    let response = await Farmer.getAllFarmersByTerritory(
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

// get farmer details by heroku id
exports.getFarmerMappingDetailsById = async (req, res) => {
  try {
    const { herokuId } = req.body;

    const response = await Farmer.getFarmerById(herokuId);

    const cropResponse = await Farmer.getFarmerCrops(herokuId);
    return res.json(
      responseBody(
        MESSAGE.FETCHSUCCESS,
        API_END_POINT.GET_FARMER_MAPPING_DETAILS_BY_ID,
        false,
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

// update farmer details by id
exports.updateFarmerMappingDetailsById = async (req, res) => {

  try {
    const { sfid } = req.payload;
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

    // checking geo locaiton
    if (!(Geo_Location__Latitude__s && Geo_Location__Longitude__s)) {
      return res.status(404).json(responseBody(MESSAGE.GEOLOCATION_MISSING, API_END_POINT.UPDATE_FARMER_MAPPING_DETAILS_BY_ID));
    }

    // checking mandatory fields
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

    if (Mobile__c) {
      const checkMobileRes = await Account.getAccountIdByMobile(Mobile__c, herokuId);
      if (
        checkMobileRes.rowCount &&
        checkMobileRes.rows[0][OBJECTKEYNAME.MOBILE__C]
      ) {
        return res
          .status(400)
          .json(
            responseBody(
              MESSAGE.MOBILE_DUPLICATE,
              API_END_POINT.UPDATE_FARMER_MAPPING_DETAILS_BY_ID
            )
          );
      }
    }

    const getQryResponse = await Account.getAccountDetailById(herokuId);

    if (!getQryResponse.rowCount) {
      return res.status(404).json(responseBody(MESSAGE.DATA_NOT_FOUND, API_END_POINT.UPDATE_FARMER_MAPPING_DETAILS_BY_ID));
    }

    const fieldUpdates = {
      [OBJECTKEYNAME.MOBILE__C]: Mobile__c,
      [OBJECTKEYNAME.PINCODE__C]: Pincode__c,
      [OBJECTKEYNAME.Other_specify__c]: Other_specify__c,
      [OBJECTKEYNAME.FARMER_NAME__C]: Farmer_Name__c,
      [OBJECTKEYNAME.Geo_Location__Latitude__s]: Geo_Location__Latitude__s,
      [OBJECTKEYNAME.Geo_Location__Longitude__s]: Geo_Location__Longitude__s,
      [OBJECTKEYNAME.DATE_OF_BIRTH__C]: Date_of_Birth__c || '',
      [OBJECTKEYNAME.EMAIL__C]: Email__c || '',
      [OBJECTKEYNAME.FATHER_NAME__C]: Father_Name__c || '',
      [OBJECTKEYNAME.TOTAL_CROP_ACREAGE__C]: Total_Crop_Acreage__c || '',
      [OBJECTKEYNAME.NUMBER_OF_FIELDS__C]: Number_of_fields__c || '',
      [OBJECTKEYNAME.ARE_YOU_ON_FIELD__C]: Are_you_on_field__c || '',
      [OBJECTKEYNAME.STATE__C]: State__c,
      [OBJECTKEYNAME.DISTRICT__C]: District__c,
      [OBJECTKEYNAME.SUB_DISTRICT__C]: Sub_District__c,
      [OBJECTKEYNAME.Others_Sub_District__c]: Other_Sub_District__c || '',
      [OBJECTKEYNAME.VILLAGE__C]: Village__c,
      [OBJECTKEYNAME.Other_Village__c]: Other_Village__c || '',
      [OBJECTKEYNAME.METHOD__C]: Method__c || '',
      [OBJECTKEYNAME.FROM_WHERE__C]: From_where__c || '',
      [OBJECTKEYNAME.NAME_OF_RETAILER_1__C]: Name_of_Rertailer_1__c || '',
      [OBJECTKEYNAME.NAME_OF_RETAILER_2__C]: Name_of_Rertailer_2__c || '',
      [OBJECTKEYNAME.NAME_OF_RETAILER_3__C]: Name_of_Rertailer_3__c || '',
      [OBJECTKEYNAME.OTHER_1]: Others1 || '',
      [OBJECTKEYNAME.OTHER_2]: Others2 || '',
      [OBJECTKEYNAME.OTHER_3]: Others3 || '',
      [OBJECTKEYNAME.INFLUENCER_NAME__C]: InfluncerName || '',
      [OBJECTKEYNAME.OTHER_AGRIEXPERT__C]: OtherAgriexpert || '',
      [OBJECTKEYNAME.INFLUENCER_MOBILE__C]: InfluncerMobileNumber || '',
      [OBJECTKEYNAME.ADVICE_FROM_INFLUENCER__C]: Advice_from_influencer__c || '',
      [OBJECTKEYNAME.Farmer_Category__c]: Farmer_Category__c || '',
      [OBJECTKEYNAME.Farmer_Range__c]: Farmer_Range__c || '',
      [OBJECTKEYNAME.ID_TYPE__C]: ID_Type__c || '',
      [OBJECTKEYNAME.PICTURE__C]: picture__c || '',
      [OBJECTKEYNAME.PROFILE_PICTURE__C]: Profile_Picture__c || '',
      [OBJECTKEYNAME.LAST_NAME]: Farmer_Name__c || '',
      [OBJECTKEYNAME.IS_PARTIAL_FARMER__c]: false,
      [OBJECTKEYNAME.Last_Modified_By_Id]: sfid,
    };

    const values = Object.values(fieldUpdates);
    values.push(herokuId); // Add the herokuId value
    await Account.updateAccount(fieldUpdates, values);


    if (crop__c.length > 0) {

      // delete all the previous crops data and insert new crop data
      await Account.deleteCropById(herokuId);

      let insertData = [];

      for (let index = 0; index < crop__c.length; index++) {
        const { cropName = '', session = '', acreage = 0, agri_inputs_exp_per_acre = 0, irrigation__c = '', other_irrigation__c = '' } = crop__c[index]
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
      // insert new crop data
      await Farmer.insertCropDetails(insertData);
    }
    return res.json(responseBody(
      'Farmer successfully updated',
      API_END_POINT.UPDATE_FARMER_MAPPING_DETAILS_BY_ID,
      false,
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
