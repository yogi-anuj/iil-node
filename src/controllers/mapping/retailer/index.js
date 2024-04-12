
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
const { getUniqueId } = require("../../../utilities/uniqueId");
const { retailerMapping, Account } = require("../query");
const { Retailer } = require("./query");

// onboard new retailers information
exports.addRetailerMappingDetails = async (req, res) => {
  try {
    const { sfid } = req.payload;
    const {
      Pincode__c,
      Mobile__c,
      Retailer_Shop_Name__c,
      Contact_Person__c,
      Contact_Person_Designation__c,
      PAN_No__c,
      GSTIN_no__c,
      At_the_shop__c,
      State__c,
      Other_State__c,
      District__c,
      Other_District__c,
      Sub_District__c,
      Other_Sub_District__c,
      Village__c,
      Other_Village__c,
      Address__c,
      Pesticide_Fertilizer_License__c,
      License_Number__c,
      Pesticide_License_Expiry_date__c,
      Preferred_Distributor__c,
      Second_Preferred_Distributor__c,
      Is_retailer_a_farmer__c,
      Pesticides_License__c,
      Retailer_category__c,
      IIL_Category__c,
      Agri_implements_turnover__c,
      Pesticide_Sale__c,
      Seed_Sales__c,
      Fertilizer_Salles__c,
      IIL_business__c,
      picture__c,
      Geo_Location__Latitude__s,
      Geo_Location__Longitude__s,
      Retailer_Range__c,
      City_c,
      Others_c,
      ID_Proof_c,
      Shop_Front_Pic_c,
      Counter_Front_Pic_c,
      Interested_in_Dealer_Board_c,
      Image_of_Pest_Lic_c,
    } = req.body;
    
    // checking geo locaiton
    if (!(Geo_Location__Latitude__s && Geo_Location__Longitude__s)) {
      return res.status(404).json(responseBody(MESSAGE.GEOLOCATION_MISSING, API_END_POINT.ADD_RETAILER_MAPPING_DETAILS));
    }

    if (
      !(
        Mobile__c &&
        Retailer_Shop_Name__c &&
        Contact_Person__c &&
        At_the_shop__c &&
        State__c &&
        District__c &&
        Sub_District__c &&
        Village__c &&
        Address__c &&
        Pesticide_Sale__c &&
        Seed_Sales__c &&
        Fertilizer_Salles__c &&
        IIL_business__c &&
        Is_retailer_a_farmer__c
      )
    ) {
      return res.status(404).json(responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.ADD_RETAILER_MAPPING_DETAILS));
    }

    // before inserting retailer information checking the retailer mobile number already exists
    const checkRes = await Account.getAccountDetailsByMobileAndAccountType(Mobile__c, RECORD_TYPES.RETAILER);

    if (checkRes.rowCount) {
      return res.status(404).json(responseBody(MESSAGE.MOBILE_DUPLICATE, API_END_POINT.ADD_RETAILER_MAPPING_DETAILS));
    }

    const values = [
      Mobile__c,
      Pincode__c,
      Retailer_Range__c,
      Geo_Location__Latitude__s,
      Geo_Location__Longitude__s,
      Retailer_Shop_Name__c,
      Contact_Person__c,
      Contact_Person_Designation__c,
      PAN_No__c || '',
      GSTIN_no__c || '',
      At_the_shop__c,
      State__c,
      Other_State__c || '',
      District__c,
      Other_District__c || '',
      Sub_District__c,
      Other_Sub_District__c || '',
      Village__c,
      Other_Village__c || '',
      Address__c,
      Pesticide_Fertilizer_License__c,
      License_Number__c,
      Pesticide_License_Expiry_date__c || null,
      Preferred_Distributor__c,
      Second_Preferred_Distributor__c || '',
      Is_retailer_a_farmer__c,
      Pesticides_License__c,
      Retailer_category__c,
      Agri_implements_turnover__c,
      Pesticide_Sale__c,
      Seed_Sales__c,
      Fertilizer_Salles__c,
      IIL_business__c,
      IIL_Category__c,
      Shop_Front_Pic_c,
      Counter_Front_Pic_c,
      Interested_in_Dealer_Board_c,
      Image_of_Pest_Lic_c,
      City_c,
      Others_c,
      ID_Proof_c,
      picture__c,
      RECORD_TYPES.RETAILER,
      getUniqueId(),
      Retailer_Shop_Name__c,
      sfid
    ]

    await Retailer.insertRetailerDetails(values);

    return res.json(responseBody(
      `Retailer ${MESSAGE.INSERTED_SUCCESS}`,
      API_END_POINT.ADD_RETAILER_MAPPING_DETAILS,
      false,
      {}
    ));

  }
  catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(
        responseBody(
          error.message,
          API_END_POINT.ADD_RETAILER_MAPPING_DETAILS
        )
      );

  }

};

exports.getRetailers = async (req, res) => {
  try {
    const result = await Retailer.getRetailerDetails();
    return res.json(responseBody(MESSAGE.FETCHSUCCESS, API_END_POINT.GET_RETAILERS, result.rows));
  }
  catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(
        responseBody(
          error.message,
          API_END_POINT.GET_RETAILERS
        )
      );

  }

};

// get all retailers details
exports.getRetailerMappingDetails = async (req, res) => {
  try {
    let { searchField, pageNumber = 1 } = req.body;
    const { territory_mapping2__c, sfid, profile__c } = req.payload;

    let territory2Status = territory_mapping2__c ? true : false;

    let response = await Retailer.getAllRetailersByTerritory(
      sfid,
      pageNumber,
      territory2Status,
      profile__c,
      searchField
    );
    
    return res.json(responseBody(MESSAGE.FETCHSUCCESS, API_END_POINT.GET_RETAILER_MAPPING_DETAILS, false, response.rows || []));
  }
  catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(
        responseBody(error.message, API_END_POINT.GET_RETAILER_MAPPING_DETAILS)
      );
  }

};

// get retailers information by id
exports.getRetailerMappingDetailsById = async (req, res) => {
  try {
    const { herokuId } = req.body;
    const response = await Retailer.getRetailerById(herokuId);

    return res.json(responseBody(
      MESSAGE.FETCHSUCCESS,
      API_END_POINT.GET_RETAILER_MAPPING_DETAILS_BY_ID,
      false,
      response.rows[0] || {}
    ));
  }
  catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(
        responseBody(error.message, API_END_POINT.GET_RETAILER_MAPPING_DETAILS_BY_ID)
      );

  }

};

// update retailers information by id
exports.updateRetailerMappingDetailsById = async (req, res) => {
  try {
    const { sfid } = req.payload;
    const {
      Mobile__c,
      Pincode__c,
      Retailer_Shop_Name__c,
      Contact_Person__c,
      Contact_Person_Designation__c,
      PAN_No__c,
      GSTIN_no__c,
      At_the_shop__c,
      State__c,
      Other_State__c,
      District__c,
      Other_District__c,
      Sub_District__c,
      Other_Sub_District__c,
      Village__c,
      Other_Village__c,
      Address__c,
      Pesticide_Fertilizer_License__c,
      License_Number__c,
      Pesticide_License_Expiry_date__c,
      Preferred_Distributor__c,
      Second_Preferred_Distributor__c,
      Is_retailer_a_farmer__c,
      Pesticides_License__c,
      Retailer_category__c,
      IIL_Category__c,
      Agri_implements_turnover__c,
      Pesticide_Sale__c,
      Seed_Sales__c,
      Fertilizer_Salles__c,
      IIL_business__c,
      picture__c,
      Geo_Location__Latitude__s,
      Geo_Location__Longitude__s,
      Retailer_Range__c,
      City_c,
      Others_c,
      ID_Proof_c,
      Shop_Front_Pic_c,
      Counter_Front_Pic_c,
      Interested_in_Dealer_Board_c,
      Image_of_Pest_Lic_c,
      herokuId,
    } = req.body;

    // checking geo locaiton
    if (!(Geo_Location__Latitude__s && Geo_Location__Longitude__s)) {
      return res.status(404).json(responseBody(MESSAGE.GEOLOCATION_MISSING, API_END_POINT.UPDATE_RETAILER_MAPPING_DETAILS_BY_ID));
    }

    if (
      !(
        Mobile__c &&
        Retailer_Shop_Name__c &&
        Contact_Person__c &&
        At_the_shop__c &&
        State__c &&
        District__c &&
        Sub_District__c &&
        Village__c &&
        Address__c &&
        Pesticide_Sale__c &&
        Seed_Sales__c &&
        Fertilizer_Salles__c &&
        IIL_business__c &&
        Is_retailer_a_farmer__c
      )
    ) {
      return res.status(404).json(responseBody(
        MESSAGE.MISSINGPARAMS,
        API_END_POINT.UPDATE_RETAILER_MAPPING_DETAILS_BY_ID
      ));
    }
    if (Mobile__c) {
      let checkDuplicateMobile = await Retailer.mobileQuery(herokuId, Mobile__c);
      if (checkDuplicateMobile.rowCount) {
        return res.status(404).json(responseBody(
          MESSAGE.MOBILE_DUPLICATE,
          API_END_POINT.UPDATE_RETAILER_MAPPING_DETAILS_BY_ID
        ));
      }
    }

    const getQryResponse = await Account.getAccountDetailById(herokuId);
    if (!getQryResponse.rowCount) {
      return res.status(404).json(responseBody(
        MESSAGE.DATA_NOT_FOUND,
        API_END_POINT.UPDATE_RETAILER_MAPPING_DETAILS_BY_ID
      ));
    }
    const fieldsToUpdate = {
      [OBJECTKEYNAME.MOBILE__C]: Mobile__c,
      [OBJECTKEYNAME.PINCODE__C]: Pincode__c,
      [OBJECTKEYNAME.Retailer_Range__c]: Retailer_Range__c,
      [OBJECTKEYNAME.Geo_Location__Latitude__s]: Geo_Location__Latitude__s,
      [OBJECTKEYNAME.Geo_Location__Longitude__s]: Geo_Location__Longitude__s,
      [OBJECTKEYNAME.RETAILER_SHOP_NAME__C]: Retailer_Shop_Name__c || '',
      [OBJECTKEYNAME.NAME]: Retailer_Shop_Name__c || '',
      [OBJECTKEYNAME.CONTACT_PERSON__C]: Contact_Person__c || '',
      [OBJECTKEYNAME.CONTACT_PERSON_DESIGNATION__C]: Contact_Person_Designation__c || '',
      [OBJECTKEYNAME.PAN_NO__C]: PAN_No__c,
      [OBJECTKEYNAME.GSTIN_NO__C]: GSTIN_no__c,
      [OBJECTKEYNAME.AT_THE_SHOP__C]: At_the_shop__c,
      [OBJECTKEYNAME.STATE__C]: State__c,
      [OBJECTKEYNAME.Other_State__c]: Other_State__c || '',
      [OBJECTKEYNAME.DISTRICT__C]: District__c,
      [OBJECTKEYNAME.Other_District__c]: Other_District__c || '',
      [OBJECTKEYNAME.SUB_DISTRICT__C]: Sub_District__c,
      [OBJECTKEYNAME.Others_Sub_District__c]: Other_Sub_District__c || '',
      [OBJECTKEYNAME.VILLAGE__C]: Village__c,
      [OBJECTKEYNAME.Other_Village__c]: Other_Village__c || '',
      [OBJECTKEYNAME.ADDRESS__C]: Address__c || '',
      [OBJECTKEYNAME.PESTICIDE_FERTILIZER_LICENSE__C]: Pesticide_Fertilizer_License__c,
      [OBJECTKEYNAME.LICENSE_NUMBER__C]: License_Number__c,
      [OBJECTKEYNAME.PESTICIDE_LICENSE_EXPIRY_DATE__C]: Pesticide_License_Expiry_date__c || null,
      [OBJECTKEYNAME.PREFERRED_DISTRIBUTOR__C]: Preferred_Distributor__c || '',
      [OBJECTKEYNAME.SECOND_PREFERRED_DISTRIBUTOR__C]: Second_Preferred_Distributor__c || '',
      [OBJECTKEYNAME.IS_RETAILER_A_FARMER__C]: Is_retailer_a_farmer__c,
      [OBJECTKEYNAME.PESTICIDE_LICENSE__C]: Pesticides_License__c,
      [OBJECTKEYNAME.RETAILER_CATEGORY__C]: Retailer_category__c,
      [OBJECTKEYNAME.AGRI_IMPLIMENTS_TURNOVER__C]: Agri_implements_turnover__c || 0,
      [OBJECTKEYNAME.PESTICIDE_SALE__C]: Pesticide_Sale__c || 0,
      [OBJECTKEYNAME.SEED_SALES__C]: Seed_Sales__c || 0,
      [OBJECTKEYNAME.FERTILIZE_SALLES__C]: Fertilizer_Salles__c || 0,
      [OBJECTKEYNAME.IIL_BUSINESS__C]: IIL_business__c || 0,
      [OBJECTKEYNAME.IIL_CATEGORY__C]: IIL_Category__c || '',
      [OBJECTKEYNAME.Shop_Front_Pic__c]: Shop_Front_Pic_c || '',
      [OBJECTKEYNAME.Counter_Front_Pic__c]: Counter_Front_Pic_c || '',
      [OBJECTKEYNAME.Interested_in_Dealer_Board__c]: Interested_in_Dealer_Board_c,
      [OBJECTKEYNAME.Image_of_Pest_Lic__c]: Image_of_Pest_Lic_c || '',
      [OBJECTKEYNAME.CITY__C]: City_c || '',
      [OBJECTKEYNAME.Others__c]: Others_c,
      [OBJECTKEYNAME.ID_Proof__c]: ID_Proof_c || '',
      [OBJECTKEYNAME.PICTURE__C]: picture__c,
      [OBJECTKEYNAME.Last_Modified_By_Id]: sfid
    };
    const values = Object.values(fieldsToUpdate);
    values.push(herokuId); // Add the herokuId value
    if (await Account.updateAccount(fieldsToUpdate, values)) {
      return res.json(responseBody(
        'Retailer successfully updated',
        API_END_POINT.UPDATE_RETAILER_MAPPING_DETAILS_BY_ID,
        false
      ));
    }
    return res.status(404).json(responseBody(
      'Retailer updation failed',
      API_END_POINT.UPDATE_RETAILER_MAPPING_DETAILS_BY_ID
    ));
  }
  catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(
        responseBody(error.message, API_END_POINT.UPDATE_RETAILER_MAPPING_DETAILS_BY_ID)
      );

  }
}