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
const { responseBody } = require("../../../utilities/customResponse");
const { Files } = require("../../files/query");
const { distributorMapping, Account } = require("../query");
const { Distributor } = require("./query");
const { getUniqueId } = require("../../../utilities/uniqueId");
const { Notification } = require("../../notification/query");
const { NotificationMessage } = require("../../notification/notificationMessage");
const { UserModal } = require("../../user/query");

// get all distributors
exports.getDistributorMapping = async (req, res) => {
  try {
    let { searchField, pageNumber = 1 } = req.body;
    let { territory_mapping2__c, sfid, profile__c, name__c } = req.payload;

    let territory2Status = territory_mapping2__c ? true : false;

    let response = profile__c === USER_HIERARCHY.Finance_user ?
      await Distributor.getDistributorsForFinanceTeam(pageNumber, searchField) :
      await Distributor.getDistributorsWithinTerritory(
        sfid,
        pageNumber,
        territory2Status,
        profile__c,
        searchField
      );

    return res.json(
      responseBody(
        MESSAGE.FETCHSUCCESS,
        API_END_POINT.GET_DISTRIBUTOR_MAPPING_DETAILS,
        false,
        response.rows
      )
    );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(
        responseBody(
          error.message,
          API_END_POINT.GET_DISTRIBUTOR_MAPPING_DETAILS
        )
      );
  }
};

// get distributors information by id
exports.getDistributorMappingById = async (req, res) => {
  try {
    const { herokuId } = req.body;

    if (!herokuId) {
      return res
        .status(404)
        .json(
          responseBody(
            MESSAGE.MISSINGPARAMS,
            API_END_POINT.GET_DISTRIBUTOR_MAPPING_DETAILS_BY_ID
          )
        );
    }

    let distributorDetails = await Distributor.getDistributorById(herokuId);

    let Proprietor_Details_Response = await Distributor.getProprietorDetailById(herokuId);

    let Company_Details__Response = await Distributor.getCompanyDetailById(herokuId);

    let Product_Of_Interest_Response = await Distributor.getProductInterestById(herokuId);

    let Sister_Company_Details_Response = await Distributor.getSisterCompanyDetailById(herokuId);

    let Major_Crops_Response = await Distributor.getMajorCropDetailById(herokuId);

    let Material_Dispatch_Destination_Response = await Distributor.getMaterialDispatchDestinationDetailById(herokuId);

    let Files_Response = await Files.getAccountsFileDetailById(herokuId);

    let Approval_Response = await Distributor.getApprovalDetailById(herokuId);

    return res.json(
      responseBody(
        MESSAGE.FETCHSUCCESS,
        API_END_POINT.GET_DISTRIBUTOR_MAPPING_DETAILS_BY_ID,
        false,
        {
          ...distributorDetails.rows[0],
          Proprietor_Details__c: Proprietor_Details_Response.rows,
          Company_Details__c: Company_Details__Response.rows,
          Product_Of_Interest__c: Product_Of_Interest_Response.rows,
          Sister_Company_Details__c: Sister_Company_Details_Response.rows,
          Major_Crops__c: Major_Crops_Response.rows,
          Material_Dispatch_Destination__c: Material_Dispatch_Destination_Response.rows,
          Files__c: Files_Response.rows,
          Approval__c: Approval_Response.rows,
        }
      )
    );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(
        responseBody(
          error.message,
          API_END_POINT.GET_DISTRIBUTOR_MAPPING_DETAILS_BY_ID
        )
      );
  }
};

// get all the depots for a distributor
exports.getDepotsForDistributor = async (req, res) => {
  try {
    const { territory_mapping2__c, profile__c, sfid } = req.payload;
    let territory2Status = territory_mapping2__c ? true : false;

    // getting all the states for the distributor within the regionS
    let states = await Distributor.getStateQry(
      profile__c,
      territory2Status,
      sfid
    );

    let depotResponse = {};

    // if states found, get depots within the states
    if (states.rowCount) {
      depotResponse = await Distributor.getDepotsForStates(states.rows);
    }

    return res.json(responseBody(
      MESSAGE.FETCHSUCCESS,
      API_END_POINT.GET_DEPOTS_FOR_DISTRIBUTOR,
      false,
      depotResponse.rows || []
    ));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(
        responseBody(error.message, API_END_POINT.GET_DEPOTS_FOR_DISTRIBUTOR)
      );
  }
};
// const sendNotification = async (fcmTokens, { header, message }) => {
//   try {
//     let response = await firebaseAdmin.messaging().sendEachForMulticast({
//       tokens: fcmTokens,
//       notification: {
//         title: header,
//         body: message,
//       },
//     });
//     console.log("checking notification status", response.responses[0].success);
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// };
// const distributorCreationNotification = async (
//   saleRepresentative,
//   ownerSfid,profile__c
// ) => {
//   try {
//     let managerData = await distributor.managerDataQuery(profile__c,ownerSfid);
//     if (managerData.rows.length > 0) {
//       let { managername, managersfid } = managerData.rows[0];
//       let message = NotificationMessage.distributorMappingMessage(
//         managername,
//         saleRepresentative
//       );

//       let notificationHeader = 'Distributor Mapping';
//       let notificationid = await Notification.insertNotification(
//         NOTIFICATION_FOR.SPECIFIC,
//         message,
//         ownerSfid,
//         managersfid,
//         notificationHeader,
//       );
//       return notificationid;
//     }
//     return false;
//   } catch (error) {
//     throw error;
//   }
// };
// const triggerNotification = async (notificationId) => {
//   try {
//     // from notificationId get the notification
//     const notification = await Notification.notificationById(notificationId);

//     let fcmTokens = [];

//     // if for all get all the logged in users fcm token
//     if (notification && notification.messageFor === NOTIFICATION_FOR.ALL) {
//       // TO BE DONE: confirmation required if
//     }
//     // if for specific then check if user is logged in and then get the fcm token for that user
//     else if (
//       notification.rowCount &&
//       notification.rows[0].messageFor === NOTIFICATION_FOR.SPECIFIC
//     ) {
//       const user = await Notification.notificationSpecific(notification.rows[0].to);
//       if (user.rowCount && user.rows[0].fcm_token__c && user.rows[0].loginStatus) {
//         fcmTokens.push(user.rows[0].fcm_token__c);
//       }
//     }
//     // if for farmers then check if user is logged in and then get the fcm token for all farmers
//     else if (
//       notification &&
//       notification.messageFor === NOTIFICATION_FOR.FARMERS
//     ) {
//       const user = await Notification.notificationFarmer();
//       // if(user && user.attributes.fcm_token__c){
//       //     fcmTokens.push(user.attributes.fcm_token__c);
//       // }
//     }

//     let notificationBody = {
//       header: notification.rows[0].header || "IIL 360",
//       message: notification.rows[0].message || "Checking for updates",
//     };
//     // send notification only if it finds any fcm token
//     fcmTokens.length > 0 &&
//       (await sendNotification(fcmTokens, notificationBody));

//     // for testing purpose
//     // await sendNotification();
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// };

// const distributorMappingApprovalFinance = async (
//   sfid,
//   saleRepresentativeSfid,
//   distributorName,
//   approvalStatus
// ) => {
//   try {
//     let message = distributor.distributorApprovalMessage(
//       distributorName,
//       approvalStatus
//     );

//     // notification insertion inside parse
//     //const NotificationObj = Parse.Object.extend('Notifications');
//     //const notification = new NotificationObj();
//     //notification.set('messageFor', NOTIFICATION_FOR.SPECIFIC);
//     //notification.set('message', message);
//     //notification.set('from',sfid);
//     // notification.set('to', saleRepresentativeSfid);
//     // notification.set('header', 'Distributor Mapping');
//     //let savedNotification = await notification.save(null, { useMasterKey: true });
//     let notificationid = await Notification.insertNotification(
//       NOTIFICATION_FOR.SPECIFIC,
//       message,
//       sfid,
//       saleRepresentativeSfid
//     );
//     return notificationid;
//   } catch (error) {
//     throw error;
//   }
// };

// const updateDistributorDataForFinance = async (
//   body,
//   sfid,
//   saleRepresentativeSfid,
//   distributorName
// ) => {
//   try {
//     const {
//       Comments__c = "",
//       isApproved,

//       herokuId,
//     } = body;
//     const values = [
//       herokuId,
//       getUniqueId(),
//       Comments__c || "",
//       "L4",
//       sfid,
//       isApproved === "Yes" ? STATUS.APPROVED : STATUS.REJECTED,
//     ];
//     approvalInsertResponse = await distributor.approveQry(values);
//     approvalUpdateResponse = await distributor.updateDistributorQry(
//       isApproved,
//       herokuId
//     );
//     let approvalStatus =
//       isApproved === "Yes" ? STATUS.APPROVED : STATUS.REJECTED;
//     let notificationId = await distributorMappingApprovalFinance(
//       sfid,
//       saleRepresentativeSfid,
//       distributorName,
//       approvalStatus.toLocaleLowerCase() || ""
//     );
//     notificationId && (await triggerNotification(notificationId));

//     return {
//       message: "Distributor Mapping updated successfully",
//       status: true,
//     };
//   } catch (error) {
//     throw error;
//   }
// };

// onboard new distributors
exports.addDistributorsMappingDetails = async (req, res) => {
  // initializing herokuid so that it is accessible in catch block
  let herokuId = getUniqueId();
  try {
    const { profile__c, sfid, name__c } = req.payload;

    // restricting other profiles to onboard new distributors
    if (!(profile__c === USER_HIERARCHY.SI__user || profile__c === USER_HIERARCHY.AM__user || profile__c === USER_HIERARCHY.VP_user)) {
      return res
        .status(404)
        .json(
          responseBody(
            MESSAGE.UNAUTHORIZEDACCESS,
            API_END_POINT.ADD_DISTRIBUTOR_MAPPING_DETAILS
          )
        );
    }

    const {
      Firm_Name__c,
      Address__c,
      State__c,
      Other_State__c,
      District__c,
      Other_District__c,
      Sub_District__c,
      Other_Sub_District__c,
      Village__c,
      Other_Village__c,
      City__c,
      Pincode__c,
      Telephone__c,
      Mobile__c,
      Is_Mobile_Linked__c,
      Is_Mobile_Whatsapp__c,
      Alternate_Mobile__c,
      Email__c,
      Establishment_Year__c,
      Nature_of_Firms__c,
      other_nature_of_Firms__c,
      Business_Type__c,

      Proprietor_Details__c,

      Shop_Office__c,
      Godown_Area__c,
      Godown_Facility__c,
      Total_Employees__c,
      Total_Vehicles__c,
      GSTIN_no__c,
      GSTIN_applied__c,
      GSTIN_Registration_Date__c,
      INST_LIC_NO__c,
      INST_LIC_Registration_Date__c,
      INST_LIC_Registration_Validity__c,
      FERT_LIC_NO__c,
      FERT_LIC_Registration_Date__c,
      FERT_LIC_Registration_Validity__c,

      DD_Cheque_Online_Ref_No__c,
      Date__c,
      Bank_Name__c,
      Amount__c,
      Bankers_Name__c,
      Bankers_Address__c,
      Cash_Credit_Limit__c,
      Deposit_Others__c,
      Deposit_Total__c,

      Pesticides__c,
      Fertilizers__c,
      Seeds__c,
      Product_Others__c,
      Product_Total__c,
      Is_Income_Tax_Assessee,
      PAN_No__c,
      Company_Details__c,
      Total_Annual_Turnover__c,
      Capital_Employed__c,
      Annual_Income__c,
      Expected_IIL_Investment__c,
      Expected_1_Year_Turnover_With_IIL_c,
      Expected_Next_Year_Turnover_With_IIL_c,
      Proposed_Payment_Terms,
      Payment_Credit_Limit__c,
      Total_Retailers__c,
      Total_Districts_Covered__c,
      Total_Villages_Covered__c,
      Area_Specification__c,
      Major_Crops__c,

      Product_Of_Interest__c,
      Sister_Company_Details__c,

      Dealer_Credit__c,
      Dealer_Credit_Days__c,
      Transporter_Name_1__c,
      Transporter_Name_2__c,
      Transporter_Name_3__c,
      Material_Dispatch_Destination__c,
      Depot_Distance__c,
      Other_Dealer_Info__c,
      Party_Credibility__c,
      Is_Party_Visited_Personally__c,

      Files__c,

      Geo_Location__Latitude__s,
      Geo_Location__Longitude__s,
    } = req.body;

    // checking geo locaiton
    if (!(Geo_Location__Latitude__s && Geo_Location__Longitude__s)) {
      return res.status(404).json(responseBody(MESSAGE.GEOLOCATION_MISSING, API_END_POINT.ADD_DISTRIBUTOR_MAPPING_DETAILS));
    }

    if (
      !(
        Firm_Name__c &&
        Address__c &&
        State__c &&
        District__c &&
        Sub_District__c &&
        Village__c &&
        City__c &&
        Pincode__c &&
        Mobile__c &&
        Is_Mobile_Linked__c &&
        Is_Mobile_Whatsapp__c &&
        Email__c &&
        Establishment_Year__c &&
        Nature_of_Firms__c &&
        Business_Type__c &&

        // ----------- proprietor details ---------
        Shop_Office__c &&
        Godown_Area__c &&
        Godown_Facility__c &&
        Total_Employees__c &&
        Total_Vehicles__c &&
        INST_LIC_NO__c &&
        INST_LIC_Registration_Date__c &&
        DD_Cheque_Online_Ref_No__c &&
        Date__c &&
        Bank_Name__c &&
        Pesticides__c &&
        Product_Total__c &&
        Is_Income_Tax_Assessee &&
        PAN_No__c &&

        // -------------- existing company details --------
        Annual_Income__c &&
        Expected_1_Year_Turnover_With_IIL_c &&
        typeof (Proposed_Payment_Terms) == 'number' &&
        typeof (Payment_Credit_Limit__c) == 'number' &&
        Total_Retailers__c &&
        Total_Districts_Covered__c &&
        Total_Villages_Covered__c &&
        Area_Specification__c &&

        // ---------- interested products -----------
        // -------- sister company --------
        Material_Dispatch_Destination__c
      )
    ) {
      return res
        .status(404)
        .json(
          responseBody(
            MESSAGE.MISSINGPARAMS + " from distributor",
            API_END_POINT.ADD_DISTRIBUTOR_MAPPING_DETAILS
          )
        );
    }

    // if applied for gst then gst field is non mandatory
    if (GSTIN_applied__c === false && !GSTIN_no__c) {
      return res
        .status(404)
        .json(
          responseBody(
            MESSAGE.MISSINGPARAMS + " from distributor",
            API_END_POINT.ADD_DISTRIBUTOR_MAPPING_DETAILS
          )
        );
    }

    // if the belows fields are in array
    if (
      !(
        Array.isArray(Proprietor_Details__c) &&
        Array.isArray(Company_Details__c) &&
        Array.isArray(Product_Of_Interest__c)
      )
    ) {
      return res
        .status(400)
        .json(
          responseBody(
            MESSAGE.INVALID_DATA_TYPE,
            API_END_POINT.ADD_DISTRIBUTOR_MAPPING_DETAILS
          )
        );
    }

    // checking if the array contains data
    if (
      !(
        Proprietor_Details__c.length != 0 &&
        Company_Details__c.length != 0 &&
        Product_Of_Interest__c.length != 0
      )
    ) {
      return res
        .status(404)
        .json(
          responseBody(
            MESSAGE.MISSINGPARAMS,
            API_END_POINT.ADD_DISTRIBUTOR_MAPPING_DETAILS
          )
        );
    }

    // checking unique email id for distributor
    if (Email__c) {
      const checkEmailRes = await Account.getAccountDetailByEmail(Email__c);
      if (checkEmailRes.rowCount) {
        return res
          .status(400)
          .json(
            responseBody(
              MESSAGE.EMAIL_DUPLICATE,
              API_END_POINT.ADD_DISTRIBUTOR_MAPPING_DETAILS
            )
          );
      }
    }

    // checking unique mobile for distributor
    if (Mobile__c) {
      const checkMobileRes = await Account.getAccountDetailsByMobileAndAccountType(Mobile__c, RECORD_TYPES.DISTRIBUTOR);
      if (checkMobileRes.rowCount) {
        return res
          .status(400)
          .json(
            responseBody(
              MESSAGE.MOBILE_DUPLICATE,
              API_END_POINT.ADD_DISTRIBUTOR_MAPPING_DETAILS
            )
          );
      }
    }

    const values = [
      Firm_Name__c,
      Firm_Name__c,
      Address__c,
      State__c,
      Other_State__c,
      District__c,
      Other_District__c,
      Sub_District__c,
      Other_Sub_District__c,
      Village__c,
      Other_Village__c,
      City__c,
      Pincode__c,
      Telephone__c,
      Mobile__c,
      Is_Mobile_Linked__c,
      Is_Mobile_Whatsapp__c,
      Alternate_Mobile__c,
      Email__c,
      Establishment_Year__c,
      Nature_of_Firms__c,
      other_nature_of_Firms__c,
      Business_Type__c,
      Shop_Office__c,
      Godown_Area__c,
      Godown_Facility__c,
      Total_Employees__c,
      Total_Vehicles__c,
      GSTIN_no__c,
      GSTIN_applied__c,
      GSTIN_Registration_Date__c,
      INST_LIC_NO__c,
      INST_LIC_Registration_Date__c,
      INST_LIC_Registration_Validity__c,
      FERT_LIC_NO__c,
      FERT_LIC_Registration_Date__c,
      FERT_LIC_Registration_Validity__c,
      DD_Cheque_Online_Ref_No__c,
      Date__c,
      Bank_Name__c,
      Amount__c,
      Bankers_Name__c,
      Bankers_Address__c,
      Cash_Credit_Limit__c,
      Deposit_Others__c,
      Pesticides__c,
      Fertilizers__c,
      Seeds__c,
      Product_Others__c,
      Is_Income_Tax_Assessee,
      PAN_No__c,
      Total_Annual_Turnover__c,
      Capital_Employed__c,
      Annual_Income__c,
      Expected_IIL_Investment__c,
      Expected_1_Year_Turnover_With_IIL_c,
      Expected_Next_Year_Turnover_With_IIL_c,
      Proposed_Payment_Terms,
      Payment_Credit_Limit__c,
      Total_Retailers__c,
      Total_Districts_Covered__c,
      Total_Villages_Covered__c,
      Area_Specification__c,
      Dealer_Credit__c,
      Dealer_Credit_Days__c,
      Transporter_Name_1__c,
      Transporter_Name_2__c,
      Transporter_Name_3__c,
      Depot_Distance__c,
      Other_Dealer_Info__c,
      Party_Credibility__c,
      Is_Party_Visited_Personally__c,
      Material_Dispatch_Destination__c,
      DISTRIBUTOR_APPROVAL_STATUS.SENT_FOR_APPROVAL_L2,
      Geo_Location__Latitude__s,
      Geo_Location__Longitude__s,
      RECORD_TYPES.DISTRIBUTOR,
      herokuId,
      sfid,
    ];
    const insertQueryRes = await Distributor.insertQuery(values);

    // if record is inserted then insert the other array type records
    if (insertQueryRes.rowCount) {

      if (Proprietor_Details__c.length > 0) {
        let insertData = [];
        for (let index = 0; index < Proprietor_Details__c.length; index++) {
          let {
            Business_Owner_Name__c = '',
            Permanent_Address__c = '',
            Present_Address__c = '',
            Father_Husband_Name__c = '',
            Business_Owner_Mobile__c = '',
            Business_Owner_Email__c = '',
          } = Proprietor_Details__c[index];

          if (
            !(
              Business_Owner_Name__c &&
              Permanent_Address__c &&
              Present_Address__c &&
              Father_Husband_Name__c &&
              Business_Owner_Mobile__c &&
              Business_Owner_Email__c
            )
          ) {
            await Distributor.deleteDistributorDetailByHerokuId(herokuId);
            return res
              .status(404)
              .json(
                responseBody(
                  "Proprietor Details missing params",
                  API_END_POINT.ADD_DISTRIBUTOR_MAPPING_DETAILS
                )
              );
          }
          insertData.push([
            Business_Owner_Name__c,
            Permanent_Address__c,
            Present_Address__c,
            Father_Husband_Name__c,
            Business_Owner_Mobile__c,
            Business_Owner_Email__c,
            herokuId,
            getUniqueId(),
          ]);
        }
        await Distributor.insertProprietorDetails(insertData);
      }

      if (Company_Details__c.length > 0) {
        let insertData = [];
        for (let index = 0; index < Company_Details__c.length; index++) {
          let {
            Company_Existing_Business__c = '',
            Total_Dealing_Years__c = '',
            Major_Product__c = '',
            Annual_Turnover__c = '',
            Total_Dealers__c = '',
            Total_Credit_Years__c = '',
            Cash_Or_Credit__c = '',
          } = Company_Details__c[index];
          if (
            !(
              Company_Existing_Business__c &&
              Total_Dealing_Years__c &&
              Major_Product__c &&
              Annual_Turnover__c &&
              Total_Dealers__c
            )
          ) {
            await Distributor.deleteDistributorDetailByHerokuId(herokuId);
            // await distributor.deletePropertie(herokuId);
            return res
              .status(404)
              .json(
                responseBody(
                  "Company Details missing params",
                  API_END_POINT.ADD_DISTRIBUTOR_MAPPING_DETAILS
                )
              );
          }
          insertData.push([
            Company_Existing_Business__c,
            Total_Dealing_Years__c,
            Major_Product__c,
            Annual_Turnover__c,
            Total_Dealers__c,
            Total_Credit_Years__c,
            Cash_Or_Credit__c,
            herokuId,
            getUniqueId(),
          ]);
        }
        await Distributor.insertCompanyDetails(insertData);
      }

      if (Product_Of_Interest__c.length > 0) {
        let insertData = [];
        for (let index = 0; index < Product_Of_Interest__c.length; index++) {
          let {
            Product_Name__c = '',
            Other_Products__c = '',
            Products_Unit__c = '',
            Current_Fiscal_Year__c = '',
            Next_Fiscal_Year__c = '',
            Next_Fiscal_Year_Unit__c = '',
            Next_Fiscal_Year_Quantity__c = '',
            Quantity__c = '',
          } = Product_Of_Interest__c[index];
          if (
            !(
              Product_Name__c &&
              Quantity__c &&
              Products_Unit__c &&
              Current_Fiscal_Year__c &&
              Next_Fiscal_Year_Unit__c &&
              Next_Fiscal_Year_Quantity__c &&
              Next_Fiscal_Year__c
            )
          ) {
            await Distributor.deleteDistributorDetailByHerokuId(herokuId);
            // await distributor.deletePropertie(herokuId);
            // await distributor.deleteCompanyDetails(herokuId);
            return res
              .status(404)
              .json(
                responseBody(
                  "Product of interest missing params",
                  API_END_POINT.ADD_DISTRIBUTOR_MAPPING_DETAILS
                )
              );
          }
          insertData.push([
            Product_Name__c,
            Other_Products__c,
            Products_Unit__c,
            Current_Fiscal_Year__c,
            Next_Fiscal_Year__c,
            Next_Fiscal_Year_Unit__c,
            Next_Fiscal_Year_Quantity__c,
            Number(Quantity__c),
            herokuId,
            getUniqueId(),
          ]);
        }

        await Distributor.insertProductOfInterest(insertData);
      }

      if (Sister_Company_Details__c.length > 0) {
        let insertData = [];
        for (let index = 0; index < Sister_Company_Details__c.length; index++) {
          let {
            Sister_Company__c = '',
            Sister_Company_Address__c = '',
            Sister_Company_Turnover__c = '',
          } = Sister_Company_Details__c[index];

          insertData.push([
            Sister_Company__c,
            Sister_Company_Address__c,
            Sister_Company_Turnover__c,
            herokuId,
            getUniqueId(),
          ]);
        }
        await Distributor.insertSisterCompanyDetails(insertData);
      }

      if (Material_Dispatch_Destination__c.length > 0) {
        let insertData = [];
        for (let index = 0; index < Material_Dispatch_Destination__c.length; index++) {
          let {
            depot_name__c = '',
          } = Material_Dispatch_Destination__c[index];
          insertData.push([
            depot_name__c,
            herokuId,
            getUniqueId(),
          ]);
        }
        await Distributor.insertMaterialDispatchDestination(insertData);
      }

      if (Major_Crops__c.length > 0) {
        let insertData = [];
        for (let index = 0; index < Major_Crops__c.length; index++) {
          let { crop_Name__c = '' } = Major_Crops__c[index];
          insertData.push([crop_Name__c, herokuId, getUniqueId()]);
        }
        await Distributor.insertCrop(insertData);
      }

      if (Files__c.length > 0) {
        let insertData = [];
        for (let index = 0; index < Files__c.length; index++) {
          let { fileName = "", url = "" } = Files__c[index];
          if (!(fileName && url)) {
            await Distributor.deleteDistributorDetailByHerokuId(herokuId);
            // await distributor.deletePropertie(herokuId);
            // await distributor.deleteCompanyDetails(herokuId);
            // await distributor.deleteProductOfInterest(herokuId);
            // await distributor.deleteSisterCompanyDetails(herokuId);
            return res.status(404).json(
              responseBody(
                "Files missing params",
                API_END_POINT.ADD_DISTRIBUTOR_MAPPING_DETAILS
              )
            )
          }
          insertData.push([fileName, url, herokuId, getUniqueId()]);
        }
        await Files.insertMultipleAccountFiles(insertData);
      }

      approvalResponse = await Distributor.insertPendingApprovalRecords(herokuId, sfid, getUniqueId());
    }

    // let saleRepresentative = name__c;
    // let notificationId = await distributorCreationNotification(
    //   saleRepresentative,
    //   sfid,
    //   profile__c
    // );
    // notificationId && (await triggerNotification(notificationId));
    return res
      .json(
        responseBody(
          `Distributor ${MESSAGE.INSERTED_SUCCESS}`,
          API_END_POINT.ADD_DISTRIBUTOR_MAPPING_DETAILS,
          false,
          {}
        )
      );
  } catch (error) {
    console.error(error);
    await Distributor.deleteDistributorDetailByHerokuId(herokuId);
    // await distributor.deletePropertie(herokuId);
    // await distributor.deleteCompanyDetails(herokuId);
    // await distributor.deleteProductOfInterest(herokuId);
    // await distributor.deleteSisterCompanyDetails(herokuId);
    // await distributor.deleteFilesDetails(herokuId);
    return res
      .status(500)
      .json(
        responseBody(
          error.message,
          API_END_POINT.ADD_DISTRIBUTOR_MAPPING_DETAILS
        )
      );
  }
};

const updateDistributorDataForVP = async (body, sfid) => {
  try {
    const { Comments__c = "", isApproved, herokuId } = body;
    const values = [
      herokuId,
      getUniqueId(),
      Comments__c || "",
      "L3",
      sfid,
      isApproved === "Yes" ? STATUS.APPROVED : STATUS.REJECTED,
    ];

    approvalInsertResponse = await distributor.approveQry(values);

    approvalUpdateResponse = await distributor.updateInsertQry(
      Comments__c,
      isApproved,
      herokuId
    );
    return {
      message: "Distributor Mapping updated successfully",
      status: true,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const updateDistributorDataForSI = async (body, sfid) => {
  try {
    const {
      Firm_Name__c,
      Address__c,
      State__c,
      Other_State__c,
      District__c,
      Other_District__c,
      Sub_District__c,
      Other_Sub_District__c,
      Village__c,
      Other_Village__c,
      City__c,
      Pincode__c,
      Telephone__c,
      Mobile__c,
      Is_Mobile_Linked__c,
      Is_Mobile_Whatsapp__c,
      Alternate_Mobile__c,
      Email__c,
      Establishment_Year__c,
      Nature_of_Firms__c,
      other_nature_of_Firms__c,
      Business_Type__c,

      Proprietor_Details__c,

      Shop_Office__c,
      Godown_Area__c,
      Godown_Facility__c,
      Total_Employees__c,
      Total_Vehicles__c,
      GSTIN_no__c,
      GSTIN_applied__c,
      GSTIN_Registration_Date__c,
      INST_LIC_NO__c,
      INST_LIC_Registration_Date__c,
      INST_LIC_Registration_Validity__c,
      FERT_LIC_NO__c,
      FERT_LIC_Registration_Date__c,
      FERT_LIC_Registration_Validity__c,

      DD_Cheque_Online_Ref_No__c,
      Date__c,
      Bank_Name__c,
      Amount__c,
      Bankers_Name__c,
      Bankers_Address__c,
      Cash_Credit_Limit__c,
      Deposit_Others__c,
      // Deposit_Total__c,

      Pesticides__c,
      Fertilizers__c,
      Seeds__c,
      Product_Others__c,
      // Product_Total__c,
      Is_Income_Tax_Assessee,
      PAN_No__c,
      Company_Details__c,
      Total_Annual_Turnover__c,
      Capital_Employed__c,
      Annual_Income__c,
      Expected_IIL_Investment__c,
      Expected_1_Year_Turnover_With_IIL_c,
      Expected_Next_Year_Turnover_With_IIL_c,
      Proposed_Payment_Terms,
      Payment_Credit_Limit__c,
      Total_Retailers__c,
      Total_Districts_Covered__c,
      Total_Villages_Covered__c,
      Area_Specification__c,
      Major_Crops__c,

      Product_Of_Interest__c,
      Sister_Company_Details__c,

      Dealer_Credit__c,
      Dealer_Credit_Days__c,
      Transporter_Name_1__c,
      Transporter_Name_2__c,
      Transporter_Name_3__c,
      Material_Dispatch_Destination__c,
      Depot_Distance__c,
      Other_Dealer_Info__c,
      Party_Credibility__c,
      Is_Party_Visited_Personally__c,

      Files__c,
      Comments__c,
      herokuId,
    } = body;

    const fieldUpdates = {
      [OBJECTKEYNAME.Firm_Name__c]: Firm_Name__c,
      [OBJECTKEYNAME.NAME]: Firm_Name__c,
      [OBJECTKEYNAME.ADDRESS__C]: Address__c,
      [OBJECTKEYNAME.STATE__C]: State__c,
      [OBJECTKEYNAME.Other_State__c]: Other_State__c,
      [OBJECTKEYNAME.DISTRICT__C]: District__c,
      [OBJECTKEYNAME.Other_District__c]: Other_District__c,
      [OBJECTKEYNAME.SUB_DISTRICT__C]: Sub_District__c,
      [OBJECTKEYNAME.Others_Sub_District__c]: Other_Sub_District__c,
      [OBJECTKEYNAME.VILLAGE__C]: Village__c,
      [OBJECTKEYNAME.Other_Village__c]: Other_Village__c,
      [OBJECTKEYNAME.CITY__C]: City__c,
      [OBJECTKEYNAME.PINCODE__C]: Pincode__c,
      [OBJECTKEYNAME.Telephone__c]: Telephone__c,
      [OBJECTKEYNAME.MOBILE__C]: Mobile__c,
      [OBJECTKEYNAME.Is_Mobile_Linked__c]: Is_Mobile_Linked__c,
      [OBJECTKEYNAME.Is_Mobile_Whatsapp__c]: Is_Mobile_Whatsapp__c,
      [OBJECTKEYNAME.Alternate_Mobile__c]: Alternate_Mobile__c,
      [OBJECTKEYNAME.EMAIL__C]: Email__c,
      [OBJECTKEYNAME.Establishment_Year__c]: Establishment_Year__c,
      [OBJECTKEYNAME.NATURE_OF_FIRMS__C]: Nature_of_Firms__c,
      [OBJECTKEYNAME.Other_NATURE_OF_FIRMS__C]: other_nature_of_Firms__c,
      [OBJECTKEYNAME.Business_Type__c]: Business_Type__c,
      [OBJECTKEYNAME.Shop_Office__c]: Shop_Office__c,
      [OBJECTKEYNAME.Godown_Area__c]: Godown_Area__c,
      [OBJECTKEYNAME.Godown_Facility__c]: Godown_Facility__c,
      [OBJECTKEYNAME.Total_Employees__c]: Total_Employees__c,
      [OBJECTKEYNAME.Total_Vehicles__c]: Total_Vehicles__c,
      [OBJECTKEYNAME.GSTIN_NO__C]: GSTIN_no__c,
      [OBJECTKEYNAME.GSTIN_APPLIED__C]: GSTIN_applied__c,
      [OBJECTKEYNAME.GSTIN_Registration_Date__c]: GSTIN_Registration_Date__c,
      [OBJECTKEYNAME.INST_LICENSE_NO__C]: INST_LIC_NO__c,
      [OBJECTKEYNAME.INST_LIC_Registration_Date__c]: INST_LIC_Registration_Date__c,
      [OBJECTKEYNAME.INST_LIC_Registration_Validity__c]: INST_LIC_Registration_Validity__c,
      [OBJECTKEYNAME.FERT_LICENSE_NO__C]: FERT_LIC_NO__c,
      [OBJECTKEYNAME.FERT_LIC_Registration_Date__c]: FERT_LIC_Registration_Date__c,
      [OBJECTKEYNAME.FERT_LIC_Registration_Validity__c]: FERT_LIC_Registration_Validity__c,
      [OBJECTKEYNAME.DD_Cheque_Online_Ref_No__c]: DD_Cheque_Online_Ref_No__c,
      [OBJECTKEYNAME.DATE__C]: Date__c,
      [OBJECTKEYNAME.Bank_Name__c]: Bank_Name__c,
      [OBJECTKEYNAME.Amount__c]: Amount__c,
      [OBJECTKEYNAME.Bankers_Name__c]: Bankers_Name__c,
      [OBJECTKEYNAME.Bankers_Address__c]: Bankers_Address__c,
      [OBJECTKEYNAME.Cash_Credit_Limit__c]: Cash_Credit_Limit__c,
      [OBJECTKEYNAME.Deposit_Others__c]: Deposit_Others__c,
      [OBJECTKEYNAME.PESTICIDE_TURNOVER__C]: Pesticides__c,
      [OBJECTKEYNAME.FERTILIZERS_TURNOVER__C]: Fertilizers__c,
      [OBJECTKEYNAME.SEEDS_OTHER_TURNOVER__C]: Seeds__c,
      [OBJECTKEYNAME.Product_Others__c]: Product_Others__c,
      [OBJECTKEYNAME.Is_Income_Tax_Assessee]: Is_Income_Tax_Assessee,
      [OBJECTKEYNAME.PAN_NO__C]: PAN_No__c,
      [OBJECTKEYNAME.Total_Annual_Turnover__c]: Total_Annual_Turnover__c,
      [OBJECTKEYNAME.Capital_Employed__c]: Capital_Employed__c,
      [OBJECTKEYNAME.Annual_Income__c]: Annual_Income__c,
      [OBJECTKEYNAME.Expected_IIL_Investment__c]: Expected_IIL_Investment__c,
      [OBJECTKEYNAME.Expected_1_Year_Turnover_With_IIL_c]: Expected_1_Year_Turnover_With_IIL_c,
      [OBJECTKEYNAME.Expected_Next_Year_Turnover_With_IIL_c]: Expected_Next_Year_Turnover_With_IIL_c,
      [OBJECTKEYNAME.Proposed_Payment_Terms]: Proposed_Payment_Terms,
      [OBJECTKEYNAME.Payment_Credit_Limit__c]: Payment_Credit_Limit__c,
      [OBJECTKEYNAME.Total_Retailers__c]: Total_Retailers__c,
      [OBJECTKEYNAME.Total_Districts_Covered__c]: Total_Districts_Covered__c,
      [OBJECTKEYNAME.Total_Villages_Covered__c]: Total_Villages_Covered__c,
      [OBJECTKEYNAME.Area_Specification__c]: Area_Specification__c,
      // [OBJECTKEYNAME.Major_Crops__c]: Major_Crops__c,
      [OBJECTKEYNAME.Dealer_Credit__c]: Dealer_Credit__c,
      [OBJECTKEYNAME.Dealer_Credit_Days__c]: Dealer_Credit_Days__c,
      [OBJECTKEYNAME.Transporter_Name_1__c]: Transporter_Name_1__c,
      [OBJECTKEYNAME.Transporter_Name_2__c]: Transporter_Name_2__c,
      [OBJECTKEYNAME.Transporter_Name_3__c]: Transporter_Name_3__c,
      [OBJECTKEYNAME.Material_Dispatch_Destination__c]: Material_Dispatch_Destination__c,
      [OBJECTKEYNAME.Depot_Distance__c]: Depot_Distance__c,
      [OBJECTKEYNAME.Other_Dealer_Info__c]: Other_Dealer_Info__c,
      [OBJECTKEYNAME.Party_Credibility__c]: Party_Credibility__c,
      [OBJECTKEYNAME.Is_Party_Visited_Personally__c]: Is_Party_Visited_Personally__c,
      [OBJECTKEYNAME.Distributor_Approval_Status__c]: DISTRIBUTOR_APPROVAL_STATUS.SENT_FOR_APPROVAL_L2,
    };

    const values = Object.values(fieldUpdates);
    values.push(herokuId); // Add the herokuId value
    const updateQuery = await Account.updateAccount(values, fieldUpdates);

    if (updateQuery) {
      if (Proprietor_Details__c.length > 0) {
        // before inserting delete the old records
        deletedRecords = await Distributor.deleteProprietorByAccountId(herokuId);

        let insertData = [];
        for (let index = 0; index < Proprietor_Details__c.length; index++) {
          let {
            Business_Owner_Name__c = '',
            Permanent_Address__c = '',
            Present_Address__c = '',
            Father_Husband_Name__c = '',
            Business_Owner_Mobile__c = '',
            Business_Owner_Email__c = '',
          } = Proprietor_Details__c[index];
          if (
            !(
              Business_Owner_Name__c &&
              Permanent_Address__c &&
              Present_Address__c &&
              Father_Husband_Name__c &&
              Business_Owner_Mobile__c &&
              Business_Owner_Email__c
            )
          ) {
            return {
              message: "Proprietor Details missing params",
              status: false,
            };
          }
          insertData.push([
            Business_Owner_Name__c,
            Permanent_Address__c,
            Present_Address__c,
            Father_Husband_Name__c,
            Business_Owner_Mobile__c,
            Business_Owner_Email__c,
            herokuId,
            getUniqueId(),
          ]);
        }
        insertPropertieorRes = await Distributor.insertProprietorDetails(insertData);
      }
      if (Company_Details__c.length > 0) {
        // before inserting delete the old records
        deletedRecords = await Distributor.deleteCompanyDetails(herokuId);

        let insertData = [];
        for (let index = 0; index < Company_Details__c.length; index++) {
          let {
            Company_Existing_Business__c = '',
            Total_Dealing_Years__c = '',
            Major_Product__c = '',
            Annual_Turnover__c = '',
            Total_Dealers__c = '',
            Total_Credit_Years__c = '',
            Cash_Or_Credit__c = '',
          } = Company_Details__c[index];
          if (
            !(
              (
                Company_Existing_Business__c &&
                Total_Dealing_Years__c &&
                Major_Product__c &&
                Annual_Turnover__c &&
                Total_Dealers__c
              )
            )
          ) {
            return { message: "Company Details missing params", status: false };
          }
          insertData.push([
            Company_Existing_Business__c,
            Total_Dealing_Years__c,
            Major_Product__c,
            Annual_Turnover__c,
            Total_Dealers__c,
            Total_Credit_Years__c,
            Cash_Or_Credit__c,
            herokuId,
            getUniqueId(),
          ]);
        }
        await Distributor.insertCompanyDetails(insertData);
      }
      if (Product_Of_Interest__c.length > 0) {
        // before inserting delete the old records
        deletedRecords = await Distributor.deleteProductOfInterest(herokuId);

        let insertData = [];
        for (let index = 0; index < Product_Of_Interest__c.length; index++) {
          let {
            Product_Name__c = '',
            Other_Products__c = '',
            Products_Unit__c = '',
            Current_Fiscal_Year__c = '',
            Next_Fiscal_Year__c = '',
            Next_Fiscal_Year_Quantity__c = '',
            Next_Fiscal_Year_Unit__c = '',
            Quantity__c = '',
          } = Product_Of_Interest__c[index];
          if (
            !(
              Product_Name__c &&
              // Other_Products__c &&
              Products_Unit__c &&
              Current_Fiscal_Year__c &&
              Next_Fiscal_Year_Quantity__c &&
              Next_Fiscal_Year_Unit__c &&
              Next_Fiscal_Year__c
            )
          ) {
            return {
              message: "Product of interest missing params",
              status: false,
            };
          }
          insertData.push([
            Product_Name__c,
            Other_Products__c,
            Products_Unit__c,
            Current_Fiscal_Year__c,
            Next_Fiscal_Year_Quantity__c,
            Next_Fiscal_Year_Unit__c,
            Number(Quantity__c),
            Next_Fiscal_Year__c,
            herokuId,
            getUniqueId(),
          ]);
        }
        await Distributor.insertProductOfInterest(insertData);
      }
      if (Sister_Company_Details__c.length > 0) {
        // before inserting delete the old records
        deletedRecords = await Distributor.deleteSisterCompanyDetails(herokuId);

        let insertData = [];
        for (let index = 0; index < Sister_Company_Details__c.length; index++) {
          let {
            Sister_Company__c = '',
            Sister_Company_Address__c = '',
            Sister_Company_Turnover__c = '',
          } = Sister_Company_Details__c[index];

          insertData.push([
            Sister_Company__c,
            Sister_Company_Address__c,
            Sister_Company_Turnover__c,
            herokuId,
            getUniqueId(),
          ]);
        }
        await Distributor.insertSisterCompanyDetails(insertData);
      }
      if (Material_Dispatch_Destination__c.length > 0) {
        // before inserting delete the old records
        deletedRecords = await Distributor.deleteMaterialDispatchDestination(herokuId);
        let insertData = [];
        for (let index = 0; index < Material_Dispatch_Destination__c.length; index++) {
          let {
            depot_name__c = '',
          } = Material_Dispatch_Destination__c[index];

          insertData.push([
            depot_name__c,
            herokuId,
            getUniqueId(),
          ]);
        }
        await Distributor.insertMaterialDispatchDestination(insertData);
      }
      if (Major_Crops__c.length > 0) {
        // before inserting delete the old records
        deletedRecords = await Distributor.deleteMajorCrops(herokuId);
        let insertData = [];
        for (let index = 0; index < Major_Crops__c.length; index++) {
          let { crop_Name__c = '' } = Major_Crops__c[index];
          insertData.push([crop_Name__c, herokuId, getUniqueId()]);
        }
        await Distributor.insertCrop(insertData);
      }
      if (Files__c.length > 0) {
        // before inserting delete the old records
        deletedRecords = await Files.deleteAccountFileDetailById(herokuId);
        let insertData = [];
        for (let index = 0; index < Files__c.length; index++) {
          let { fileName = '', url = '' } = Files__c[index];
          if (!(fileName && url)) {
            return { message: 'Files missing params', status: false };
          }
          insertData.push([fileName, url, herokuId, getUniqueId()]);
        }
        await Files.insertMultipleAccountFiles(insertData);
      }

      const values = [
        herokuId,
        getUniqueId(),
        Comments__c || '',
        '',
        sfid,
        STATUS.PENDING
      ]
      approvalResponse = await Distributor.approveQry(values);

      // also set the hierarchy level based on the value of isApproved

      return {
        message: "Distributor Mapping updated successfully",
        status: true,
      };
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const updateDistributorDataForFinance = async (body, sfid) => {
  try {
    const {
      Comments__c = '',
      isApproved,

      herokuId,
    } = body;

    // also set the hierarchy level based on the value of isApproved
    const values = [
      herokuId,
      getUniqueId(),
      Comments__c || "",
      "L4",
      sfid,
      isApproved === "Yes" ? STATUS.APPROVED : STATUS.REJECTED,
    ];
    approvalResponse = await Distributor.approveQry(values);


    if (approvalResponse) {
      // after approval record is inserted update the distributors approval status
      const accountFieldUpdates = {
        [OBJECTKEYNAME.Distributor_Approval_Status__c]: isApproved === 'Yes' ? DISTRIBUTOR_APPROVAL_STATUS.APPROVED_BY_L4 : DISTRIBUTOR_APPROVAL_STATUS.REJECTED_BY_L4,
      }
      const accountValues = Object.values(accountFieldUpdates);
      accountValues.push(herokuId); // Add the herokuId value

      await Account.updateAccount(accountFieldUpdates, accountValues);

      return {
        message: "Distributor Mapping updated successfully",
        status: true,
      };
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const updateDistributorDataForRM = async (body, sfid) => {
  try {
    const {
      Credit_Period_Specify_No_of_Days__c = "",
      Creditibility_in_Market_for_Managers_O__c = "",
      Credit_Limit_Specify_Amount__c,

      Comments__c = "",
      isApproved,

      herokuId,
    } = body;

    // also set the hierarchy level based on the value of isApproved
    const values = [
      herokuId,
      getUniqueId(),
      Comments__c || "",
      "L2",
      sfid,
      isApproved === "Yes" ? STATUS.APPROVED : STATUS.REJECTED,
    ];
    approvalResponse = await Distributor.approveQry(values);


    if (approvalResponse) {
      // after approval record is inserted update the distributors approval status
      const accountFieldUpdates = {
        [OBJECTKEYNAME.Credit_Period_Specify_No_of_Days__c]: Credit_Period_Specify_No_of_Days__c,
        [OBJECTKEYNAME.Creditibility_in_Market_for_Managers_O__c]: Creditibility_in_Market_for_Managers_O__c,
        [OBJECTKEYNAME.Credit_Limit_Specify_Amount__c]: Credit_Limit_Specify_Amount__c,
        [OBJECTKEYNAME.Distributor_Approval_Status__c]: isApproved === 'Yes' ? DISTRIBUTOR_APPROVAL_STATUS.APPROVED_BY_L2 : DISTRIBUTOR_APPROVAL_STATUS.REJECTED_BY_L2,
      }
      const accountValues = Object.values(accountFieldUpdates);
      accountValues.push(herokuId); // Add the herokuId value

      await Account.updateAccount(accountFieldUpdates, accountValues);

      return {
        message: "Distributor Mapping updated successfully",
        status: true,
      };
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// update distribuotr details
exports.updateDistributorMappingDetailsById = async (req, res) => {
  try {
    let { profile__c, sfid } = req.payload;

    const paramsData = req.body;

    if (!paramsData.herokuId) {
      return res.status(404).json(responseBody(
        MESSAGE.MISSINGPARAMS,
        API_END_POINT.UPDATE_DISTRIBUTOR_MAPPING_DETAILS_BY_ID
      ));
    }

    // if profile not found from token, get it from user profile
    if (!profile__c) {
      const user = await UserModal.getUserBySfid(sfid);
      if (user.rowCount) {
        profile__c = user.rows[0].profile__c;
      } else {
        return res.status(404).json(responseBody(
          MESSAGE.UNAUTHORIZEDACCESS,
          API_END_POINT.UPDATE_DISTRIBUTOR_MAPPING_DETAILS_BY_ID
        ));
      }
    }

    // restrict other profiles to update distrributors data
    if (
      !(
        profile__c === USER_HIERARCHY.SI__user ||
        profile__c === USER_HIERARCHY.AM__user ||
        profile__c === USER_HIERARCHY.RM__user ||
        profile__c === USER_HIERARCHY.VP_user ||
        profile__c === USER_HIERARCHY.Finance_user
      )
    ) {
      return res.status(404).json(responseBody(
        MESSAGE.UNAUTHORIZEDACCESS,
        API_END_POINT.UPDATE_DISTRIBUTOR_MAPPING_DETAILS_BY_ID
      ));
    }

    // check if distributor's record already exists
    const checkDistributor = await Account.getAccountDetailById(paramsData.herokuId);

    if (checkDistributor.rowCount === 0) {
      return res.status(404).json(responseBody(
        "Distributor not found",
        API_END_POINT.UPDATE_DISTRIBUTOR_MAPPING_DETAILS_BY_ID
      ));
    }

    // checking if the status is already updated by VP profile
    if (profile__c === USER_HIERARCHY.VP_user) {
      if (checkDistributor.rows[0].distributor_approval_status__c == DISTRIBUTOR_APPROVAL_STATUS.APPROVED_BY_L3) {
        return res.status(404).json(responseBody(
          "Distributor already approved from VP",
          API_END_POINT.UPDATE_DISTRIBUTOR_MAPPING_DETAILS_BY_ID
        ));
      }
    }

    // checking if the status is already updated by Finance profile
    if (profile__c === USER_HIERARCHY.Finance_user) {
      if (checkDistributor.rows[0].distributor_approval_status__c == DISTRIBUTOR_APPROVAL_STATUS.APPROVED_BY_L4) {
        return res.status(404).json(responseBody(
          "Distributor already approved from finance team",
          API_END_POINT.UPDATE_DISTRIBUTOR_MAPPING_DETAILS_BY_ID
        ));
      }
    }

    let updateQry;
    let distributorName = checkDistributor.rows[0].firm_name__c;
    let saleRepresentativeSfid = checkDistributor.rows[0].owner__c;
    if (profile__c == USER_HIERARCHY.VP_user) {
      if (checkDistributor.rows[0].distributor_approval_status__c.toLocaleLowerCase() == DISTRIBUTOR_APPROVAL_STATUS.APPROVED_BY_L2.toLocaleLowerCase()) {

        // insert new approval record
        const { Comments__c = "", isApproved, herokuId } = paramsData;
        const approvalValues = [
          herokuId,
          getUniqueId(),
          Comments__c || "",
          "L3",
          sfid,
          isApproved === "Yes" ? STATUS.APPROVED : STATUS.REJECTED,
        ];
        approvalInsertResponse = await Distributor.approveQry(approvalValues);

        // after approval record is inserted update the distributors approval status
        const accountFieldUpdates = {
          [OBJECTKEYNAME.Distributor_Approval_Status__c]: isApproved === 'Yes' ? DISTRIBUTOR_APPROVAL_STATUS.APPROVED_BY_L3 : DISTRIBUTOR_APPROVAL_STATUS.REJECTED_BY_L3
        }
        const accountValues = Object.values(accountFieldUpdates);
        accountValues.push(herokuId); // Add the herokuId value

        await Account.updateAccount(accountFieldUpdates, accountValues);
      }
    } else {
      switch (checkDistributor.rows[0].distributor_approval_status__c.toLocaleLowerCase()) {
        case DISTRIBUTOR_APPROVAL_STATUS.REJECTED_BY_L2.toLocaleLowerCase():
        case DISTRIBUTOR_APPROVAL_STATUS.REJECTED_BY_L3.toLocaleLowerCase():
        case DISTRIBUTOR_APPROVAL_STATUS.REJECTED_BY_L4.toLocaleLowerCase():
          updateQry = await updateDistributorDataForSI(paramsData, sfid);
          break;
        case DISTRIBUTOR_APPROVAL_STATUS.SENT_FOR_APPROVAL_L2.toLocaleLowerCase():
        case DISTRIBUTOR_APPROVAL_STATUS.APPROVED_BY_L2.toLocaleLowerCase():
          updateQry = await updateDistributorDataForRM(paramsData, sfid);
          break;
        case DISTRIBUTOR_APPROVAL_STATUS.APPROVED_BY_L3.toLocaleLowerCase():
          updateQry = await updateDistributorDataForFinance(
            paramsData,
            sfid,
          );
          break;
        default:
          break;
      }
    }

    if (updateQry && updateQry.status) {
      return res.json(responseBody(
        updateQry.message,
        API_END_POINT.UPDATE_DISTRIBUTOR_MAPPING_DETAILS_BY_ID,
        false,
      ));
    }
    return res.status(404).json(responseBody(
      updateQry.message,
      API_END_POINT.UPDATE_DISTRIBUTOR_MAPPING_DETAILS_BY_ID
    ));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(
        responseBody(
          error.message,
          API_END_POINT.UPDATE_DISTRIBUTOR_MAPPING_DETAILS_BY_ID
        )
      );
  }
};
exports.getDistributors = async (req, res) => {
  try {
    const { loginUser } = req.body;
    const { sfid } = req.payload;
    const recordTypes = await Distributor.getDistributors(loginUser, sfid);
    //await pool.query('COMMIT');
    return res.status(200).json(responseBody(
      MESSAGE.FETCHSUCCESS,
      API_END_POINT.GET_DISTRIBUTORS,
      false,
      recordTypes.rows
    ));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(responseBody(error.message, API_END_POINT.GET_DISTRIBUTORS));
  }
};
