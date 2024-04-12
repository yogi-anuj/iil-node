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


const { distributor } = require("../distributor/query");
const { getUniqueId } = require("../../../utilities/uniqueId");
const { Farmer, agriExperts } = require("./query");
const { farmerMapping, Account, agriExpertMapping } = require("../query");

// get companies for agri expert
exports.getComapniesName = async (req, res) => {
  try {
    let transformedArr = COMPANIES.sort().map(item => ({ ['name__c']: item, sfid: item }));
    return res.json(responseBody(MESSAGE.FETCHSUCCESS, API_END_POINT.GET_COMPANIES_NAME, false, transformedArr));
  }
  catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(
        responseBody(error.message, API_END_POINT.GET_COMPANIES_NAME)
      );
  }
};

// onboard new agri expert
exports.addAgriExpertMappingDetails = async (req, res) => {
  try {
    const { sfid } = req.payload;

    const {
      Mobile__c,
      Name,
      Type_of_Agri_Expert__c,
      Designation_Profile__c,
      State__c,
      City__c,
      Address__c,
      Crop__c,
      Firm_Name__c,
      District__c,
      Sub_District__c,
      Other_Sub_District__c,
      Village__c,
      Other_Village__c,
      Prop_Parternership__c,
      Contact_Person__c,
      Total_Annual_Turnover_in_Lacs_IIL__c,
      Name_Of_Department__c,
      Pesticide_Sale__c,
      Fertilizer_Salles__c,
      Seed_Sales__c,
      Brands_Promoted__c,
      No_of_Retailers__c,
      Working_With__c,
      Territory_Looking__c,
      No_of_Distributors__c,
      Business_Value__c,
      Experience__c,
      No_of_Farmers_associated_with_him__c,
      At_the_shop__c,
      company_1_brand__c,
      company_2_brand__c,
      company_3_brand__c,
      company_4_brand__c,
      company_5_brand__c,
      Geo_Location__Latitude__s,
      Geo_Location__Longitude__s,
      First_Mobile__c,
      Pincode__c,
    } = req.body;

    // checking geo locaiton
    if (!(Geo_Location__Latitude__s && Geo_Location__Longitude__s)) {
      return res.status(404).json(responseBody(MESSAGE.GEOLOCATION_MISSING, API_END_POINT.ADD_AGRI_EXPERT_MAPPING_DETAILS));
    }

    if (!(Mobile__c && Name && Type_of_Agri_Expert__c && State__c && Address__c)) {
      return res.status(404).json(responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.ADD_AGRI_EXPERT_MAPPING_DETAILS));
    }

    if (
      Type_of_Agri_Expert__c == AGRI_EXPERT_TYPE.COMPETITOR_DISTRIBUTOR &&
      !(
        Firm_Name__c &&
        City__c &&
        District__c &&
        Sub_District__c &&
        Village__c &&
        Brands_Promoted__c
      )
    ) {
      return res.status(404).json(responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.ADD_AGRI_EXPERT_MAPPING_DETAILS));
    } else if (
      Type_of_Agri_Expert__c == AGRI_EXPERT_TYPE.COMPETITOR_EMPLOYEES &&
      !(Working_With__c && Territory_Looking__c && Business_Value__c && Experience__c)
    ) {
      return res.status(404).json(responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.ADD_AGRI_EXPERT_MAPPING_DETAILS));
    } else if (
      (Type_of_Agri_Expert__c == AGRI_EXPERT_TYPE.GOVT_DEPT ||
        Type_of_Agri_Expert__c == AGRI_EXPERT_TYPE.INFLUENCER) &&
      !(Village__c && City__c && District__c)
    ) {
      return res.status(404).json(responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.ADD_AGRI_EXPERT_MAPPING_DETAILS));
    }

    const checkingUser = await Account.getAllAccountDetailsByMobile(Mobile__c);

    if (checkingUser.rowCount) {
      return res.status(404).json(responseBody(MESSAGE.MOBILE_DUPLICATE, API_END_POINT.ADD_AGRI_EXPERT_MAPPING_DETAILS));
    }

    var uniqueId = getUniqueId();
    const values = [
      Mobile__c,
      First_Mobile__c,
      Name,
      Type_of_Agri_Expert__c,
      Designation_Profile__c || '',
      State__c,
      City__c,
      Address__c,
      Firm_Name__c,
      District__c,
      Sub_District__c,
      Other_Sub_District__c,
      Village__c,
      Other_Village__c,
      Name_Of_Department__c || '',
      Prop_Parternership__c || '',
      Contact_Person__c || '',
      Total_Annual_Turnover_in_Lacs_IIL__c || '',
      company_1_brand__c || '',
      company_2_brand__c || '',
      company_3_brand__c || '',
      company_4_brand__c || '',
      company_5_brand__c || '',
      Pesticide_Sale__c || 0,
      Fertilizer_Salles__c || 0,
      Seed_Sales__c || 0,
      Brands_Promoted__c || '',
      No_of_Retailers__c || 0,
      Working_With__c || '',
      Territory_Looking__c || '',
      No_of_Distributors__c || 0,
      Business_Value__c || 0,
      Experience__c || 0,
      No_of_Farmers_associated_with_him__c || 0,
      At_the_shop__c || '',
      Pincode__c || '',
      RECORD_TYPES.AGRI_EXPERT,
      sfid,
      uniqueId,
      Geo_Location__Longitude__s,
      Geo_Location__Latitude__s
    ]
    const result = await agriExperts.insertAgriExpertDetails(values);

    if (result.rowCount && Crop__c.length != 0) {
      let insertData = [];

      for (let index = 0; index < Crop__c.length; index++) {
        const cropName = Crop__c[index].crop;
        insertData.push([
          cropName,
          uniqueId,
          getUniqueId()
        ]);
      }
      await agriExperts.insertCropDetails(insertData);
    }
    return res.json(responseBody(
      `Agri expert ${MESSAGE.INSERTED_SUCCESS}`,
      API_END_POINT.ADD_AGRI_EXPERT_MAPPING_DETAILS,
      false,
    ));
  }
  catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(
        responseBody(
          error.message,
          API_END_POINT.ADD_AGRI_EXPERT_MAPPING_DETAILS
        )
      );

  }
};

// get all agri experts based on the territorys
exports.getAgriExpertMappingDetails = async (req, res) => {
  try {
    let { searchField, pageNumber = 1, recordType } = req.body;
    let { territory_mapping2__c, sfid, profile__c } = req.payload;

    let territory2Status = territory_mapping2__c ? true : false;

    let response = await agriExperts.getAllAgriExpertsByTerritory(
      sfid,
      pageNumber,
      territory2Status,
      profile__c,
      searchField,
      recordType
    );
    return res.json(
      responseBody(
        MESSAGE.FETCHSUCCESS,
        API_END_POINT.GET_AGRI_EXPERT_MAPPING_DETAILS,
        false,
        response.rows || []
      )
    );
  }
  catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(
        responseBody(
          error.message,
          API_END_POINT.GET_AGRI_EXPERT_MAPPING_DETAILS
        )
      );

  }
};

// get agri expert by id
exports.getAgriExpertMappingDetailsById = async (req, res) => {
  try {
    const { herokuId } = req.body;
    const response = await agriExperts.getAgriExpertDetailsById(herokuId);
    const cropResponse = await agriExperts.getCropDetails(herokuId);
    return res.json(responseBody(
      MESSAGE.FETCHSUCCESS,
      API_END_POINT.GET_AGRI_EXPERT_MAPPING_DETAILS_BY_ID,
      false,
      {
        ...response.rows[0] || {},
        crop__c: cropResponse.rows || [],
      }
    ));


  }
  catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(
        responseBody(
          error.message,
          API_END_POINT.GET_AGRI_EXPERT_MAPPING_DETAILS_BY_ID
        )
      );
  }

};

// update agri expert data by id
exports.updateAgriExpertMappingDetailsById = async (req, res) => {
  try {
    const { sfid } = req.payload;
    const {
      herokuId,
      Mobile__c,
      Name,
      Type_of_Agri_Expert__c,
      Designation_Profile__c,
      State__c,
      City__c,
      Address__c,
      Crop__c,
      Firm_Name__c,
      District__c,
      Sub_District__c,
      Other_Sub_District__c,
      Village__c,
      Other_Village__c,
      Prop_Parternership__c,
      Name_Of_Department__c,
      Contact_Person__c,
      Total_Annual_Turnover_in_Lacs_IIL__c,
      Pesticide_Sale__c,
      Fertilizer_Salles__c,
      Seed_Sales__c,
      Brands_Promoted__c,
      No_of_Retailers__c,
      Working_With__c,
      Territory_Looking__c,
      No_of_Distributors__c,
      Business_Value__c,
      Experience__c,
      No_of_Farmers_associated_with_him__c,
      At_the_shop__c,
      company_1_brand__c,
      company_2_brand__c,
      company_3_brand__c,
      company_4_brand__c,
      company_5_brand__c,
      Geo_Location__Latitude__s,
      Geo_Location__Longitude__s,
      First_Mobile__c,
      Pincode__c,
    } = req.body;

    if (!(Mobile__c && Name && Type_of_Agri_Expert__c && State__c && Address__c && herokuId)) {
      return res.status(404).json(responseBody(
        MESSAGE.MISSINGPARAMS,
        API_END_POINT.UPDATE_AGRI_EXPERT_MAPPING_DETAILS_BY_ID
      ));
    }

    if (
      Type_of_Agri_Expert__c == AGRI_EXPERT_TYPE.COMPETITOR_DISTRIBUTOR &&
      !(
        Firm_Name__c &&
        City__c &&
        District__c &&
        Sub_District__c &&
        Village__c &&
        Brands_Promoted__c
      )
    ) {
      return res.status(404).json(responseBody(
        MESSAGE.MISSINGPARAMS,
        API_END_POINT.UPDATE_AGRI_EXPERT_MAPPING_DETAILS_BY_ID
      ));
    } else if (
      Type_of_Agri_Expert__c == AGRI_EXPERT_TYPE.COMPETITOR_EMPLOYEES &&
      !(Working_With__c && Territory_Looking__c && Business_Value__c && Experience__c)
    ) {
      return res.status(404).json(responseBody(
        MESSAGE.MISSINGPARAMS,
        API_END_POINT.UPDATE_AGRI_EXPERT_MAPPING_DETAILS_BY_ID
      ));
    } else if (
      (Type_of_Agri_Expert__c == AGRI_EXPERT_TYPE.GOVT_DEPT ||
        Type_of_Agri_Expert__c == AGRI_EXPERT_TYPE.INFLUENCER) &&
      !(Village__c && City__c && District__c)
    ) {
      return res.status(404).json(responseBody(
        MESSAGE.MISSINGPARAMS,
        API_END_POINT.UPDATE_AGRI_EXPERT_MAPPING_DETAILS_BY_ID
      ));
    }

    // checking duplicate mobile for that account
    if (Mobile__c) {
      const checkDuplicateMobile = await Account.getAccountIdByMobile(Mobile__c, herokuId)
      if (checkDuplicateMobile.rowCount) {
        return res.status(404).json(responseBody(
          MESSAGE.MOBILE_DUPLICATE,
          API_END_POINT.UPDATE_AGRI_EXPERT_MAPPING_DETAILS_BY_ID
        ));
      }
    }

    const getQryResponse = await Account.getAccountDetailById(herokuId);
    if (!getQryResponse.rowCount) {
      return res.status(404).json(responseBody(
        MESSAGE.DATA_NOT_FOUND,
        API_END_POINT.UPDATE_AGRI_EXPERT_MAPPING_DETAILS_BY_ID
      ));
    }

    const fieldUpdates = {
      [OBJECTKEYNAME.MOBILE__C]: Mobile__c,
      [OBJECTKEYNAME.First_Mobile__c]: First_Mobile__c,
      [OBJECTKEYNAME.LAST_NAME]: Name,
      [OBJECTKEYNAME.TYPE_OF_AGRI_EXPERT__C]: Type_of_Agri_Expert__c,
      [OBJECTKEYNAME.DESIGNATION_PROFILE__C]: Designation_Profile__c,
      [OBJECTKEYNAME.STATE__C]: State__c,
      [OBJECTKEYNAME.CITY__C]: City__c,
      [OBJECTKEYNAME.ADDRESS__C]: Address__c,
      [OBJECTKEYNAME.Firm_Name__c]: Firm_Name__c,
      [OBJECTKEYNAME.DISTRICT__C]: District__c,
      [OBJECTKEYNAME.SUB_DISTRICT__C]: Sub_District__c,
      [OBJECTKEYNAME.Others_Sub_District__c]: Other_Sub_District__c,
      [OBJECTKEYNAME.VILLAGE__C]: Village__c,
      [OBJECTKEYNAME.Other_Village__c]: Other_Village__c,
      [OBJECTKEYNAME.Name_Of_Department__c]: Name_Of_Department__c,
      [OBJECTKEYNAME.Prop_Parternership__c]: Prop_Parternership__c,
      [OBJECTKEYNAME.CONTACT_PERSON__C]: Contact_Person__c,
      [OBJECTKEYNAME.Total_Annual_Turnover_in_Lacs_IIL__c]: Total_Annual_Turnover_in_Lacs_IIL__c,
      [OBJECTKEYNAME.Company_1_Brand__c]: company_1_brand__c,
      [OBJECTKEYNAME.Company_2_Brand__c]: company_2_brand__c,
      [OBJECTKEYNAME.Company_3_Brand__c]: company_3_brand__c,
      [OBJECTKEYNAME.Company_4_Brand__c]: company_4_brand__c,
      [OBJECTKEYNAME.Company_5_Brand__c]: company_5_brand__c,
      [OBJECTKEYNAME.PESTICIDE_SALE__C]: Pesticide_Sale__c,
      [OBJECTKEYNAME.FERTILIZE_SALLES__C]: Fertilizer_Salles__c,
      [OBJECTKEYNAME.SEED_SALES__C]: Seed_Sales__c,
      [OBJECTKEYNAME.Brands_Promoted__c]: Brands_Promoted__c,
      [OBJECTKEYNAME.No_of_Retailers__c]: No_of_Retailers__c,
      [OBJECTKEYNAME.Working_With__c]: Working_With__c,
      [OBJECTKEYNAME.Territory_Looking__c]: Territory_Looking__c,
      [OBJECTKEYNAME.No_of_Distributors__c]: No_of_Distributors__c,
      [OBJECTKEYNAME.Business_Value__c]: Business_Value__c,
      [OBJECTKEYNAME.Experience__c]: Experience__c,
      [OBJECTKEYNAME.No_of_Farmers_associated_with_him__c]: No_of_Farmers_associated_with_him__c,
      [OBJECTKEYNAME.AT_THE_SHOP__C]: At_the_shop__c,
      [OBJECTKEYNAME.PINCODE__C]: Pincode__c,
      [OBJECTKEYNAME.Geo_Location__Longitude__s]: Geo_Location__Longitude__s,
      [OBJECTKEYNAME.Geo_Location__Latitude__s]: Geo_Location__Latitude__s,
      [OBJECTKEYNAME.Last_Modified_By_Id]: sfid,
    };


    const values = Object.values(fieldUpdates);
    values.push(herokuId); // Add the herokuId value

    if (await Account.updateAccount(fieldUpdates, values)) {
      await Account.deleteCropById(herokuId);
    }

    if (Crop__c.length != 0) {
      let insertData = [];
      for (let index = 0; index < Crop__c.length; index++) {
        const cropName = Crop__c[index].crop;
        insertData.push([
          cropName,
          herokuId,
          getUniqueId()
        ]);
      }
      await agriExperts.insertCropDetails(insertData);
    }

    // await Account.updateAccount(fieldUpdates, values)

    return res.json(responseBody(
      'Agri expert updated successfully',
      API_END_POINT.UPDATE_AGRI_EXPERT_MAPPING_DETAILS_BY_ID,
      false,
    ));
  }
  catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(
        responseBody(
          error.message,
          API_END_POINT.UPDATE_AGRI_EXPERT_MAPPING_DETAILS_BY_ID
        )
      );

  }
}