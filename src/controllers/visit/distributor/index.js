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
const { distributor, distributorVisit } = require("../distributor/query");
const { distributorVisits } = require("../query");
const { getUniqueId } = require("../../../utilities/uniqueId");

exports.addDistributorVisit = async (req, res) => {
  try {
    const { sfid } = req.payload;
    const {
      Account__c,
      At_Shop__c,
      Current_Inventories__c,
      Market_Insights__c,
      Collection_Target_Discussion__c,
      Distributor_Shop_Name__c,
      Mobile__c,
      Sales_Target_Discussion__c,
      Focus_Product_Discussion__c,
      Market_Development__c,
      Distributor_Feedback__c,
      Complaint_Issues__c,
      Comments__c,
      ID_Type__c,
      picture__c,
      product__c,
      Geo_Location__Longitude__s,
      Geo_Location__Latitude__s,
      Contact_person__c,
    } = req.body;

    if (!(Geo_Location__Longitude__s && Geo_Location__Latitude__s)) {
      return res
        .status(500)
        .json(
          responseBody(
            MESSAGE.TURN_ON_LOCATION,
            API_END_POINT.ADD_AGRIEXPERT_VISIT
          )
        );
    }

    if (
      !(
        Account__c &&
        At_Shop__c &&
        // Current_Inventories__c &&
        Market_Insights__c &&
        Collection_Target_Discussion__c &&
        Sales_Target_Discussion__c &&
        Focus_Product_Discussion__c &&
        Market_Development__c &&
        Distributor_Feedback__c &&
        // Geo_Location__Latitude__s &&
        // Geo_Location__Longitude__s &&
        Mobile__c
      )
    ) {
      return res.status.json(
        responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.ADD_DISTRIBUTOR_VISIT)
      );
    }
    const uniqueId = getUniqueId();
    const values = [
      At_Shop__c,
      Account__c,
      Mobile__c,
      Distributor_Shop_Name__c,
      Current_Inventories__c,
      Market_Insights__c,
      Collection_Target_Discussion__c,
      Sales_Target_Discussion__c,
      Focus_Product_Discussion__c,
      Market_Development__c,
      Distributor_Feedback__c,
      Comments__c,
      Geo_Location__Latitude__s,
      Geo_Location__Longitude__s,
      sfid,
      uniqueId,
      Contact_person__c,
      RECORD_TYPES.DISTRIBUTOR_VISIT,
    ];
    const result = await distributorVisit.addDistributorVisitDetails(values);

    console.log(API_END_POINT.ADD_DISTRIBUTOR_VISIT, " ========> DATA 1");
    if (result) {
      for (let product of product__c) {
        const { quantity, name, unit, sfid } = product;
        const inserted = distributorVisit.insertProductDetails(
          sfid,
          quantity,
          unit,
          uniqueId
        );

        console.log(API_END_POINT.ADD_DISTRIBUTOR_VISIT, " ========> DATA 2");
      }
    }
    insertLeaderBoard(
      SCORE.VISIT.DISTRIBUTOR.SCORE,
      SCORE.VISIT.DISTRIBUTOR.NAME,
      sfid
    );

    return res.json(
      responseBody(
        `Distributor Visit ${MESSAGE.INSERTED_SUCCESS}`,
        API_END_POINT.ADD_DISTRIBUTOR_VISIT
      )
    );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(responseBody(error.message, API_END_POINT.ADD_DISTRIBUTOR_VISIT));
  }
};
exports.getDistributorVisit = async (req, res) => {
  try {
    let {
      searchField,
      pageNumber = 1,
      pageLimit = 20,
      distributorId = "",
    } = req.body;
    const { sfid } = req.payload;
    const result = await distributorVisits.getDistributorVisitDetails(searchField,
      distributorId,
      sfid,
      pageNumber,
      pageLimit);
    return res.json(
      responseBody(
        MESSAGE.FETCHSUCCESS,
        API_END_POINT.GET_DISTRIBUTOR_VISIT,
        result.rows
      )
    );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(responseBody(error.message, API_END_POINT.GET_DISTRIBUTOR_VISIT));
  }
};
exports.getDistributorVisitById = async (req, res) => {
  try {
    const { herokuId } = req.body;
    const {sfid}=req.payload;

    if (!herokuId) {
      return res
        .status(500)
        .json(
          responseBody(
            MESSAGE.MISSINGPARAMS,
            API_END_POINT.GET_DISTRIBUTOR_VISIT_BY_ID
          )
        );
    }

    const result = await distributorVisits.getDistributorVisitDetailsById(sfid,herokuId)
    return res.json(responseBody(
      MESSAGE.FETCHSUCCESS,
      API_END_POINT.GET_DISTRIBUTOR_VISIT_BY_ID,
      result.rows[0] || {}
    ));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(
        responseBody(error.message, API_END_POINT.GET_DISTRIBUTOR_VISIT_BY_ID)
      );
  }
};
