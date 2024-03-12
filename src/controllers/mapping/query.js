const { update } = require("parse-server/lib/rest");
const { client } = require("../../middleware/database/database");
const {
  USER_HIERARCHY,
  SCHEMA,
  OBJECTKEYNAME,
  RECORD_TYPES,
  RECORDS_PER_PAGE,
} = require("../../utilities/constants");
const { updateAttendanceStatus } = require("../attendance");

const Account = {
  updateAccount:async(fieldUpdates,values)=>{
    try{
        const updateQuery = `UPDATE ${SCHEMA.SALESFORCE.ACCOUNT}
    SET
      ${Object.keys(fieldUpdates)
        .map((fieldName, index) => `${fieldName} = $${index + 1}`)
        .join(',\n')}
    WHERE
      ${OBJECTKEYNAME.HEROKU_ID__C} = $${values.length}
  `;

   await client.query(updateQuery,values);

    }
    catch(error){
        throw error;

    }

  },
  deleteAccountById: async (herokuId) => {
    try {
      const dltQry = `DELETE FROM ${SCHEMA.SALESFORCE.ACCOUNT} WHERE ${OBJECTKEYNAME.HEROKU_ID__C} = '${herokuId}'`;
      return await client.query(dltQry);
    } catch (error) {
      throw error;
    }
  },
  deleteCropById:async(herokuId)=>{
    try{
      const deleteQuery = `DELETE FROM ${SCHEMA.SALESFORCE.CROP__C}  WHERE ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C} = '${herokuId}'`;
      await client.query(deleteQuery);


    }
    catch(error){
      throw error;
    }
  },  
  getAccountDetailsByMobile: async (mobile__c, accountType) => {
    try {
      const checkMobileQry = `
      SELECT ${OBJECTKEYNAME.MOBILE__C} FROM ${SCHEMA.SALESFORCE.ACCOUNT} WHERE ${OBJECTKEYNAME.MOBILE__C} = '${mobile__c}' AND ${OBJECTKEYNAME.RECORD_TYPE_ID} = '${accountType}'
    `;
      return await client.query(checkMobileQry);
    } catch (error) {
      throw error;
    }
  },
  getAllAccountDetailsByMobile:async(mobile__c)=>{
    try{
      let queryDuplicate = `SELECT * FROM ${SCHEMA.SALESFORCE.ACCOUNT} WHERE ${OBJECTKEYNAME.MOBILE__C} = '${mobile__c}' LIMIT 1`;
         return await client.query(queryDuplicate);


    }
    catch(error){
      throw error;

    }
   

  },
  getAccountDetailById: async (herokuId) => {
    try {
      const getQry = `
      SELECT * FROM ${SCHEMA.SALESFORCE.ACCOUNT} WHERE ${OBJECTKEYNAME.HEROKU_ID__C} = '${herokuId}'
    `;
      return await client.query(getQry);
    } catch (error) {
      throw error;
    }
  },
  getAccountIdByMobile:async(mobile__c,herokuId)=>{
    try{
      const checkDuplicateMobileQry = `
      SELECT ${OBJECTKEYNAME.HEROKU_ID__C} FROM ${SCHEMA.SALESFORCE.ACCOUNT} WHERE ${OBJECTKEYNAME.MOBILE__C} = '${mobile__c}' AND ${OBJECTKEYNAME.HEROKU_ID__C} != '${herokuId}'
    `;
    return await client.query(checkDuplicateMobileQry);

    }
    catch(error){
      throw error;
    }
  }
};


const distributorMapping = {
  // all distributors
  getDistributorMapping: async (
    userSfid,
    pageNumber,
    territory2Status,
    profile,
    searchField
  ) => {
    try {
      let qry = `
                SELECT
                ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SFID},
                ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.MOBILE__C},
                ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.PINCODE__C},
                ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.Distributor_Approval_Status__c},
                ${OBJECTKEYNAME.Firm_Name__c},
                ${OBJECTKEYNAME.GSTIN_NO__C},
                ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.OWNER__C},
                ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.HEROKU_ID__C},
                TO_CHAR(${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.CREATED_DATE}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.CREATED_DATE},
                TO_CHAR(${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.LAST_MODIFIED_DATE}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.LAST_MODIFIED_DATE},
                ${OBJECTKEYNAME.SUB_DISTRICT_NAME__C}
                FROM
                ${SCHEMA.SALESFORCE.USER}`;
      if (profile === USER_HIERARCHY.VP_user) {
        qry += `
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as VpRegion ON VpRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as ZmRegion ON ZmRegion.${OBJECTKEYNAME.Cluster_region__c} = VpRegion.${OBJECTKEYNAME.SFID}
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as RmRegion ON RmRegion.${OBJECTKEYNAME.Zm_Region__c} = ZmRegion.${OBJECTKEYNAME.SFID}
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.Rm_Region__c} = RmRegion.${OBJECTKEYNAME.SFID}
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
                INNER JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
                INNER JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
                `;
      } else if (profile === USER_HIERARCHY.ZM__user) {
        qry += `
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as ZmRegion ON ZmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as RmRegion ON RmRegion.${OBJECTKEYNAME.Zm_Region__c} = ZmRegion.${OBJECTKEYNAME.SFID}
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.Rm_Region__c} = RmRegion.${OBJECTKEYNAME.SFID}
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
                INNER JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
                INNER JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
                `;
      } else if (profile === USER_HIERARCHY.RM__user) {
        qry += `
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as RmRegion ON RmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.Rm_Region__c} = RmRegion.${OBJECTKEYNAME.SFID}
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
                INNER JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
                INNER JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
                `;
      } else if (profile === USER_HIERARCHY.AM__user) {
        qry += `
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
                INNER JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
                INNER JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
                `;
      } else if (profile === USER_HIERARCHY.SI__user) {
        qry += `
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} ON ${SCHEMA.SALESFORCE.TERRITORY__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
                INNER JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = ${SCHEMA.SALESFORCE.TERRITORY__C}.${OBJECTKEYNAME.SFID}
                INNER JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
                `;
      }
      qry += `WHERE
                ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.SFID} = '${userSfid}'
                AND
                ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.RECORD_TYPE} = '${RECORD_TYPES.DISTRIBUTOR}'
                AND
                ${SCHEMA.SALESFORCE.ACCOUNT}._hc_err IS NULL
            `;
      if (searchField && searchField.length > 2) {
        qry += `
                AND
                (CAST(${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.MOBILE__C} AS TEXT) iLIKE '${searchField}%' OR ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.Firm_Name__c} iLIKE '${searchField}%' OR ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.GSTIN_NO__C} iLIKE '${searchField}%' OR ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SUB_DISTRICT_NAME__C} iLIKE '${searchField}%')
                `;
      }
      if (territory2Status) {
        qry += `
                UNION
                SELECT
                ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SFID},
                ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.MOBILE__C},
                ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.PINCODE__C},
                ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.Distributor_Approval_Status__c},
                ${OBJECTKEYNAME.Firm_Name__c},
                ${OBJECTKEYNAME.GSTIN_NO__C},
                ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.OWNER__C},
                ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.HEROKU_ID__C},
                TO_CHAR(${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.CREATED_DATE}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.CREATED_DATE},
                TO_CHAR(${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.LAST_MODIFIED_DATE}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.LAST_MODIFIED_DATE},
                ${OBJECTKEYNAME.SUB_DISTRICT_NAME__C}
                FROM
                ${SCHEMA.SALESFORCE.USER}`;
        if (profile === USER_HIERARCHY.VP_user) {
          qry += `
                    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as VpRegion ON VpRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping2__c}
                    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as ZmRegion ON ZmRegion.${OBJECTKEYNAME.Cluster_region__c} = VpRegion.${OBJECTKEYNAME.SFID}
                    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as RmRegion ON RmRegion.${OBJECTKEYNAME.Zm_Region__c} = ZmRegion.${OBJECTKEYNAME.SFID}
                    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.Rm_Region__c} = RmRegion.${OBJECTKEYNAME.SFID}
                    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
                    INNER JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
                    INNER JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
                    `;
        } else if (profile === USER_HIERARCHY.ZM__user) {
          qry += `
                    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as ZmRegion ON ZmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping2__c}
                    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as RmRegion ON RmRegion.${OBJECTKEYNAME.Zm_Region__c} = ZmRegion.${OBJECTKEYNAME.SFID}
                    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.Rm_Region__c} = RmRegion.${OBJECTKEYNAME.SFID}
                    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
                    INNER JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
                    INNER JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
                    `;
        } else if (profile === USER_HIERARCHY.RM__user) {
          qry += `
                    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as RmRegion ON RmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping2__c}
                    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.Rm_Region__c} = RmRegion.${OBJECTKEYNAME.SFID}
                    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
                    INNER JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
                    INNER JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
                    `;
        } else if (profile === USER_HIERARCHY.AM__user) {
          qry += `
                    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping2__c}
                    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
                    INNER JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
                    INNER JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
                    `;
        } else if (profile === USER_HIERARCHY.SI__user) {
          qry += `
                    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} ON ${SCHEMA.SALESFORCE.TERRITORY__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping2__c}
                    INNER JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = ${SCHEMA.SALESFORCE.TERRITORY__C}.${OBJECTKEYNAME.SFID}
                    INNER JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
                    `;
        }
        qry += `WHERE
                ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.SFID} = '${userSfid}'
                AND
                ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.RECORD_TYPE} = '${RECORD_TYPES.DISTRIBUTOR}'
                AND
                ${SCHEMA.SALESFORCE.ACCOUNT}._hc_err IS NULL
                `;
      }
      if (searchField && searchField.length > 2) {
        qry += `
                AND
                (CAST(${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.MOBILE__C} AS TEXT) iLIKE '${searchField}%' OR ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.Firm_Name__c} iLIKE '${searchField}%' OR ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.GSTIN_NO__C} iLIKE '${searchField}%' OR ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SUB_DISTRICT_NAME__C} iLIKE '${searchField}%')
                `;
      }
      qry += `
                ORDER BY ${OBJECTKEYNAME.LAST_MODIFIED_DATE} DESC
                OFFSET (${pageNumber} - 1) * ${RECORDS_PER_PAGE}
                LIMIT ${RECORDS_PER_PAGE}
            `;
      return client.query(qry);
    } catch (error) {
      throw error;
    }
  },

  // distributor by id
  getDistributorById: async (herokuId) => {
    try {
      const getQry = `
            SELECT 
            ${OBJECTKEYNAME.Firm_Name__c},
            ${OBJECTKEYNAME.ADDRESS__C},
            ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.STATE__C},
            ${OBJECTKEYNAME.Other_State__c},
            ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.DISTRICT__C},
            ${OBJECTKEYNAME.Other_District__c},
            ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C},
            ${OBJECTKEYNAME.Others_Sub_District__c},
            ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C},
            ${OBJECTKEYNAME.Other_Village__c},
            ${OBJECTKEYNAME.CITY__C},
            ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.PINCODE__C},
            ${OBJECTKEYNAME.Telephone__c},
            ${OBJECTKEYNAME.MOBILE__C},
            ${OBJECTKEYNAME.Is_Mobile_Linked__c},
            ${OBJECTKEYNAME.Is_Mobile_Whatsapp__c},
            ${OBJECTKEYNAME.Alternate_Mobile__c},
            ${OBJECTKEYNAME.EMAIL__C},
            ${OBJECTKEYNAME.Establishment_Year__c},
            ${OBJECTKEYNAME.NATURE_OF_FIRMS__C},
            ${OBJECTKEYNAME.Business_Type__c},
            ${OBJECTKEYNAME.Shop_Office__c},
            ${OBJECTKEYNAME.Godown_Area__c},
            ${OBJECTKEYNAME.Godown_Facility__c},
            ${OBJECTKEYNAME.Total_Employees__c},
            ${OBJECTKEYNAME.Total_Vehicles__c},
            ${OBJECTKEYNAME.GSTIN_NO__C},
            TO_CHAR(${OBJECTKEYNAME.GSTIN_Registration_Date__c}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.GSTIN_Registration_Date__c},
            ${OBJECTKEYNAME.INST_LICENSE_NO__C},
            TO_CHAR(${OBJECTKEYNAME.INST_LIC_Registration_Date__c}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.INST_LIC_Registration_Date__c},
            TO_CHAR(${OBJECTKEYNAME.INST_LIC_Registration_Validity__c}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.INST_LIC_Registration_Validity__c},
            ${OBJECTKEYNAME.FERT_LICENSE_NO__C},
            TO_CHAR(${OBJECTKEYNAME.FERT_LIC_Registration_Date__c}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.FERT_LIC_Registration_Date__c},
            TO_CHAR(${OBJECTKEYNAME.FERT_LIC_Registration_Validity__c}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.FERT_LIC_Registration_Validity__c},
            ${OBJECTKEYNAME.DD_Cheque_Online_Ref_No__c},
            TO_CHAR(${OBJECTKEYNAME.DATE__C}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.DATE__C},
            ${OBJECTKEYNAME.Bank_Name__c},
            ${OBJECTKEYNAME.Amount__c},
            ${OBJECTKEYNAME.Bankers_Name__c},
            ${OBJECTKEYNAME.Bankers_Address__c},
            ${OBJECTKEYNAME.Cash_Credit_Limit__c},
            ${OBJECTKEYNAME.Deposit_Others__c},
            ${OBJECTKEYNAME.PESTICIDE_TURNOVER__C},
            ${OBJECTKEYNAME.FERTILIZERS_TURNOVER__C},
            ${OBJECTKEYNAME.SEEDS_OTHER_TURNOVER__C},
            ${OBJECTKEYNAME.Product_Others__c},
            ${OBJECTKEYNAME.Is_Income_Tax_Assessee},
            ${OBJECTKEYNAME.PAN_NO__C},
            ${OBJECTKEYNAME.Total_Annual_Turnover__c},
            ${OBJECTKEYNAME.Capital_Employed__c},
            ${OBJECTKEYNAME.Annual_Income__c},
            ${OBJECTKEYNAME.Expected_IIL_Investment__c},
            ${OBJECTKEYNAME.Expected_1_Year_Turnover_With_IIL_c},
            ${OBJECTKEYNAME.Expected_Next_Year_Turnover_With_IIL_c},
            ${OBJECTKEYNAME.Proposed_Payment_Terms},
            ${OBJECTKEYNAME.Payment_Credit_Limit__c},
            ${OBJECTKEYNAME.Total_Retailers__c},
            ${OBJECTKEYNAME.Total_Districts_Covered__c},
            ${OBJECTKEYNAME.Total_Villages_Covered__c},
            ${OBJECTKEYNAME.Area_Specification__c},
            ${OBJECTKEYNAME.Major_Crops__c},
            ${OBJECTKEYNAME.Dealer_Credit__c},
            ${OBJECTKEYNAME.Dealer_Credit_Days__c},
            ${OBJECTKEYNAME.Transporter_Name_1__c},
            ${OBJECTKEYNAME.Transporter_Name_2__c},
            ${OBJECTKEYNAME.Transporter_Name_3__c},
            ${OBJECTKEYNAME.Material_Dispatch_Destination__c},
            ${OBJECTKEYNAME.Depot_Distance__c},
            ${OBJECTKEYNAME.Other_Dealer_Info__c},
            ${OBJECTKEYNAME.Party_Credibility__c},
            ${OBJECTKEYNAME.Is_Party_Visited_Personally__c},
            ${OBJECTKEYNAME.Distributor_Approval_Status__c},
            ${OBJECTKEYNAME.Credit_Period_Specify_No_of_Days__c},
            ${OBJECTKEYNAME.Creditibility_in_Market_for_Managers_O__c},
            ${OBJECTKEYNAME.Credit_Limit_Specify_Amount__c},
            ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.NAME},
            ${OBJECTKEYNAME.RECORD_TYPE},
            ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.HEROKU_ID__C},
            ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.OWNER__C},
            ${SCHEMA.SALESFORCE.DISTRICT__C}.${OBJECTKEYNAME.DISTRICT_NAME__C}, 
            ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SUB_DISTRICT_NAME__C}, 
            ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.VILLAGE_NAME__C}, 
            ${SCHEMA.SALESFORCE.STATE__C}.${OBJECTKEYNAME.NAME__C} as state_name__c
            FROM ${SCHEMA.SALESFORCE.ACCOUNT}
            INNER JOIN ${SCHEMA.SALESFORCE.STATE__C} ON ${SCHEMA.SALESFORCE.STATE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.STATE__C}
            INNER JOIN ${SCHEMA.SALESFORCE.DISTRICT__C} ON ${SCHEMA.SALESFORCE.DISTRICT__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.DISTRICT__C}
            INNER JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C}
            INNER JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
            WHERE 
            ${OBJECTKEYNAME.RECORD_TYPE} = '${RECORD_TYPES.DISTRIBUTOR}'
            AND
            ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.HEROKU_ID__C} = '${herokuId}'
        `;

      return await client.query(getQry);
    } catch (error) {
      throw error;
    }
  },
  // Proprietor detail by id
  getProprietorDetailById: async (herokuId) => {
    try {
      const Proprietor_Details_Qry = `
            SELECT 
            ${OBJECTKEYNAME.NAME},
            ${OBJECTKEYNAME.Permanent_Address__c},
            ${OBJECTKEYNAME.Present_Address__c},
            ${OBJECTKEYNAME.Father_Husband_Name__c},
            ${OBJECTKEYNAME.Business_Owner_Mobile__c},
            ${OBJECTKEYNAME.Business_Owner_Email__c}
            FROM ${SCHEMA.SALESFORCE.Detail_of_Proprietor__c}
            WHERE ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C} = '${herokuId}'
            `;
      return await client.query(Proprietor_Details_Qry);
    } catch (error) {
      throw error;
    }
  },
  // company details by id
  getCompanyDetailById: async (herokuId) => {
    try {
      const Company_Details__Qry = `
            SELECT 
            ${OBJECTKEYNAME.Company_Existing_Business__c},
            ${OBJECTKEYNAME.Total_Dealing_Years__c},
            ${OBJECTKEYNAME.Major_Product__c},
            ${OBJECTKEYNAME.Annual_Turnover__c},
            ${OBJECTKEYNAME.Total_Dealers__c},
            ${OBJECTKEYNAME.Total_Credit_Days__c},
            ${OBJECTKEYNAME.Cash_Or_Credit__c}
            FROM ${SCHEMA.SALESFORCE.Retail_of_Business__c}
            WHERE ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C} = '${herokuId}'
            `;
      return await client.query(Company_Details__Qry);
    } catch (error) {
      throw error;
    }
  },
  // product of interest by id
  getProductInterestById: async (herokuId) => {
    try {
      const Product_Of_Interest__Qry = `
            SELECT 
            ${OBJECTKEYNAME.Product_Name__c},
            ${OBJECTKEYNAME.Other_Products__c},
            ${OBJECTKEYNAME.Products_Unit__c},
            ${OBJECTKEYNAME.Current_Fiscal_Year__c},
            CAST(${OBJECTKEYNAME.QUANTITY__C} AS VARCHAR) as ${OBJECTKEYNAME.QUANTITY__C},
            ${OBJECTKEYNAME.Next_Fiscal_Year__c}
            FROM ${SCHEMA.SALESFORCE.Product_of_Interest__c}
            WHERE ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C} = '${herokuId}'
            `;
      return await client.query(Product_Of_Interest__Qry);
    } catch (error) {
      throw error;
    }
  },
  // sister company details by id
  getSisterCompanyDetailById: async (herokuId) => {
    try {
      const Sister_Company_Details_Qry = `
            SELECT 
            ${OBJECTKEYNAME.NAME},
            ${OBJECTKEYNAME.Sister_Company_Address__c},
            ${OBJECTKEYNAME.Sister_Company_Turnover__c}
            FROM ${SCHEMA.SALESFORCE.Sister_Company__c}
            WHERE ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C} = '${herokuId}'
            `;
      return await client.query(Sister_Company_Details_Qry);
    } catch (error) {
      throw error;
    }
  },
  // approval details by id
  getApprovalDetailById: async (herokuId) => {
    try {
      const Approval_Qry = `
            SELECT 
            DISTINCT ON (${OBJECTKEYNAME.Rejection_Level__c})
            COALESCE(${OBJECTKEYNAME.COMMENTS__C}, '') as ${OBJECTKEYNAME.COMMENTS__C},
            ${OBJECTKEYNAME.Rejection_Level__c},
            ${OBJECTKEYNAME.OWNER__C},
            TO_CHAR(${OBJECTKEYNAME.CREATED_DATE}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.CREATED_DATE},
            ${OBJECTKEYNAME.STATUS__C}
            FROM ${SCHEMA.SALESFORCE.APPROVAL__C}
            WHERE ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C} = '${herokuId}' AND ${OBJECTKEYNAME.Rejection_Level__c} IS NOT NULL
            ORDER BY ${OBJECTKEYNAME.Rejection_Level__c}, ${OBJECTKEYNAME.CREATED_DATE} DESC
            LIMIT 1
            `;

      return await client.query(Approval_Qry);
    } catch (error) {
      throw error;
    }
  },
};

const retailerMapping = {
  checkQuery: async (Mobile__c) => {
    try {
      const checkQry = `
      SELECT  ${OBJECTKEYNAME.MOBILE__C} FROM ${SCHEMA.SALESFORCE.ACCOUNT} WHERE ${OBJECTKEYNAME.MOBILE__C} = '${Mobile__c}' AND ${OBJECTKEYNAME.RECORD_TYPE_ID} = '${RECORD_TYPES.RETAILER}'
    `;

      return await client.query(checkQry);
    } catch (error) {
      throw error;
    }
  },
  getAllRetailersByTerritory: async (
    userSfid,
    pageNumber,
    territory2Status,
    profile,
    searchField
  ) => {
    try {
      let qry = `
      SELECT
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SFID},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.MOBILE__C},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.PINCODE__C},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.Other_Village__c},
      ${OBJECTKEYNAME.RETAILER_SHOP_NAME__C},
      ${OBJECTKEYNAME.RETAILER_CATEGORY__C},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.HEROKU_ID__C},
      TO_CHAR(${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.CREATED_DATE}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.CREATED_DATE},
      TO_CHAR(${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.LAST_MODIFIED_DATE}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.LAST_MODIFIED_DATE},
      ${OBJECTKEYNAME.VILLAGE_NAME__C}
      FROM
      ${SCHEMA.SALESFORCE.USER}`
      if (profile === USER_HIERARCHY.VP_user) {
        qry += `
        LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as VpRegion ON VpRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
        LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as ZmRegion ON ZmRegion.${OBJECTKEYNAME.Cluster_region__c} = VpRegion.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as RmRegion ON RmRegion.${OBJECTKEYNAME.Zm_Region__c} = ZmRegion.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.Rm_Region__c} = RmRegion.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
               `;
      } else if (profile === USER_HIERARCHY.ZM__user) {
        qry += `
        LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as ZmRegion ON ZmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
        LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as RmRegion ON RmRegion.${OBJECTKEYNAME.Zm_Region__c} = ZmRegion.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.Rm_Region__c} = RmRegion.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
                `;
      } else if (profile === USER_HIERARCHY.RM__user) {
        qry += `
        LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as RmRegion ON RmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
        LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.Rm_Region__c} = RmRegion.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
                `;
      } else if (profile === USER_HIERARCHY.AM__user) {
        qry += `
        LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
        LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
                `;
      } else if (profile === USER_HIERARCHY.SI__user) {
        qry += `
        LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} ON ${SCHEMA.SALESFORCE.TERRITORY__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
        LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = ${SCHEMA.SALESFORCE.TERRITORY__C}.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
                `;
      }
      qry += `WHERE
      ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.SFID} = '${userSfid}'
    AND
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.RECORD_TYPE} = '${RECORD_TYPES.RETAILER}'
    AND
    ${SCHEMA.SALESFORCE.ACCOUNT}._hc_err IS NULL
            `;
      if (searchField && searchField.length > 2) {
        qry += `
        AND
        (CAST(${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.MOBILE__C} AS TEXT) iLIKE '${searchField}%' OR ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.RETAILER_SHOP_NAME__C} iLIKE '${searchField}%' OR ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.VILLAGE_NAME__C} iLIKE '${searchField}%')
                `;
      }
      if (territory2Status) {
        qry += `
        UNION
    SELECT
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SFID},
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.MOBILE__C},
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.PINCODE__C},
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.Other_Village__c},
    ${OBJECTKEYNAME.RETAILER_SHOP_NAME__C},
    ${OBJECTKEYNAME.RETAILER_CATEGORY__C},
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.HEROKU_ID__C},
    TO_CHAR(${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.CREATED_DATE}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.CREATED_DATE},
    TO_CHAR(${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.LAST_MODIFIED_DATE}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.LAST_MODIFIED_DATE},
    ${OBJECTKEYNAME.VILLAGE_NAME__C}
    FROM
    ${SCHEMA.SALESFORCE.USER}
                `;
        if (profile === USER_HIERARCHY.VP_user) {
          qry += `
          LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as VpRegion ON VpRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping2__c}
          LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as ZmRegion ON ZmRegion.${OBJECTKEYNAME.Cluster_region__c} = VpRegion.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as RmRegion ON RmRegion.${OBJECTKEYNAME.Zm_Region__c} = ZmRegion.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.Rm_Region__c} = RmRegion.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
                    `;
        } else if (profile === USER_HIERARCHY.ZM__user) {
          qry += `
          LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as ZmRegion ON ZmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping2__c}
          LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as RmRegion ON RmRegion.${OBJECTKEYNAME.Zm_Region__c} = ZmRegion.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.Rm_Region__c} = RmRegion.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
                    `;
        } else if (profile === USER_HIERARCHY.RM__user) {
          qry += `
          LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as RmRegion ON RmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping2__c}
          LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.Rm_Region__c} = RmRegion.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
                    `;
        } else if (profile === USER_HIERARCHY.AM__user) {
          qry += `
          LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping2__c}
          LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
                    `;
        } else if (profile === USER_HIERARCHY.SI__user) {
          qry += `
          LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} ON ${SCHEMA.SALESFORCE.TERRITORY__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping2__c}
          LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = ${SCHEMA.SALESFORCE.TERRITORY__C}.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
                    `;
        }
        qry += `
        WHERE
        ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.SFID} = '${userSfid}'
        AND
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.RECORD_TYPE} = '${RECORD_TYPES.RETAILER}'
        AND
        ${SCHEMA.SALESFORCE.ACCOUNT}._hc_err IS NULL
                `;
      }
      if (searchField && searchField.length > 2) {
        qry += `
        AND
        (CAST(${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.MOBILE__C} AS TEXT) iLIKE '${searchField}%' OR ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.RETAILER_SHOP_NAME__C} iLIKE '${searchField}%' OR ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.VILLAGE_NAME__C} iLIKE '${searchField}%')
                `;
      }
      qry += `
      ORDER BY ${OBJECTKEYNAME.LAST_MODIFIED_DATE} DESC
      OFFSET (${pageNumber} - 1) * ${RECORDS_PER_PAGE}
      LIMIT ${RECORDS_PER_PAGE}
            `;
      // console.log("chcking qry", qry);
      return client.query(qry);
    } catch (error) {
      throw error;
    }
  },
};
const agriExpertMapping={
  getAllAgriExpertsByTerritory: async (
    userSfid,
    pageNumber,
    territory2Status,
    profile,
    searchField,
    recordType
  ) => {
    try {
      let qry = `
      SELECT
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SFID},
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.MOBILE__C},
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.PINCODE__C},
    ${OBJECTKEYNAME.LAST_NAME} as agri_expert_name,
    ${OBJECTKEYNAME.TYPE_OF_AGRI_EXPERT__C},
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.HEROKU_ID__C},
    TO_CHAR(${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.CREATED_DATE}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.CREATED_DATE},
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.LAST_MODIFIED_DATE},
    ${OBJECTKEYNAME.VILLAGE_NAME__C}
    FROM
    ${SCHEMA.SALESFORCE.USER}
            `;
      if (profile === USER_HIERARCHY.VP_user) {
        qry += `
        LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as VpRegion ON VpRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
        LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as ZmRegion ON ZmRegion.${OBJECTKEYNAME.Zm_Region__c} = VpRegion.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as RmRegion ON RmRegion.${OBJECTKEYNAME.Rm_Region__c} = ZmRegion.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.Amr_Region__c} = RmRegion.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Si_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
               `;
      } else if (profile === USER_HIERARCHY.ZM__user) {
        qry += `
        LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as ZmRegion ON ZmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
    LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as RmRegion ON RmRegion.${OBJECTKEYNAME.Zm_Region__c} = ZmRegion.${OBJECTKEYNAME.SFID}
    LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.Rm_Region__c} = RmRegion.${OBJECTKEYNAME.SFID}
    LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
    LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
    LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
    LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
                `;
      } else if (profile === USER_HIERARCHY.RM__user) {
        qry += `
        LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as RmRegion ON RmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
        LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.Rm_Region__c} = RmRegion.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
                `;
      } else if (profile === USER_HIERARCHY.AM__user) {
        qry += `
        LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
        LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
                `;
      } else if (profile === USER_HIERARCHY.SI__user) {
        qry += `
        LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} ON ${SCHEMA.SALESFORCE.TERRITORY__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
        LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = ${SCHEMA.SALESFORCE.TERRITORY__C}.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
                `;
      }
      qry += ` WHERE
      ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.SFID} = '${userSfid}'
      AND
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.RECORD_TYPE} = '${RECORD_TYPES.AGRI_EXPERT}'
      AND
      ${SCHEMA.SALESFORCE.ACCOUNT}._hc_err IS NULL
            `;
      if(recordType){
        qry+=`
        AND
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.TYPE_OF_AGRI_EXPERT__C} = '${recordType}'
        `;
      }
      if (searchField && searchField.length > 2) {
        qry += `
        AND
    (CAST(${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.MOBILE__C} AS TEXT) iLIKE '${searchField}%' OR ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.LAST_NAME} iLIKE '${searchField}%' OR ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.VILLAGE_NAME__C} iLIKE '${searchField}%')
                `;
      }
      if (territory2Status) {
        qry += `
        UNION
      SELECT
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SFID},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.MOBILE__C},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.PINCODE__C},
      ${OBJECTKEYNAME.LAST_NAME} as agri_expert_name,
      ${OBJECTKEYNAME.TYPE_OF_AGRI_EXPERT__C},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.HEROKU_ID__C},
      TO_CHAR(${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.CREATED_DATE}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.CREATED_DATE},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.LAST_MODIFIED_DATE},
      ${OBJECTKEYNAME.VILLAGE_NAME__C}
      FROM
      ${SCHEMA.SALESFORCE.USER}
                `;
        if (profile === USER_HIERARCHY.VP_user) {
          qry += `
          LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as VpRegion ON VpRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping2__c}
          LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as ZmRegion ON ZmRegion.${OBJECTKEYNAME.Zm_Region__c} = VpRegion.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as RmRegion ON RmRegion.${OBJECTKEYNAME.Rm_Region__c} = ZmRegion.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.Amr_Region__c} = RmRegion.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Si_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
                    `;
        } else if (profile === USER_HIERARCHY.ZM__user) {
          qry += `
          LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as ZmRegion ON ZmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping2__c}
    LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as RmRegion ON RmRegion.${OBJECTKEYNAME.Zm_Region__c} = ZmRegion.${OBJECTKEYNAME.SFID}
    LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.Rm_Region__c} = RmRegion.${OBJECTKEYNAME.SFID}
    LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
    LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
    LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
    LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
                    `;
        } else if (profile === USER_HIERARCHY.RM__user) {
          qry += `
          LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as RmRegion ON RmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping2__c}
          LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.Rm_Region__c} = RmRegion.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
                    `;
        } else if (profile === USER_HIERARCHY.AM__user) {
          qry += `
          LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping2__c}
          LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
                    `;
        } else if (profile === USER_HIERARCHY.SI__user) {
          qry += `
          LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} ON ${SCHEMA.SALESFORCE.TERRITORY__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping2__c}
          LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = ${SCHEMA.SALESFORCE.TERRITORY__C}.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
          LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
                    `;
        }
        qry += `
        WHERE
        ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.SFID} = '${userSfid}'
        AND
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.RECORD_TYPE} = '${RECORD_TYPES.AGRI_EXPERT}'
        AND
        ${SCHEMA.SALESFORCE.ACCOUNT}._hc_err IS NULL
                `;
      }
      if (recordType) {
        qry += `
          AND
          ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.TYPE_OF_AGRI_EXPERT__C} = '${recordType}'
        `;
      }
      if (searchField && searchField.length > 2) {
        qry += `
        AND
        (CAST(${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.MOBILE__C} AS TEXT) iLIKE '${searchField}%' OR ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.LAST_NAME} iLIKE '${searchField}%' OR ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.VILLAGE_NAME__C} iLIKE '${searchField}%')
              
                `;
      }
      qry += `
      ORDER BY ${OBJECTKEYNAME.LAST_MODIFIED_DATE} DESC
      OFFSET (${pageNumber} - 1) * ${RECORDS_PER_PAGE}
      LIMIT ${RECORDS_PER_PAGE}
            `;
      // console.log("chcking qry", qry);
      return client.query(qry);
    } catch (error) {
      throw error;
    }
  },


};


const farmerMapping = {
  checkQuery: async (Mobile__c) => {
    try {
      const checkQry = `
      SELECT ${OBJECTKEYNAME.EMAIL__C}, ${OBJECTKEYNAME.MOBILE__C} FROM ${SCHEMA.SALESFORCE.ACCOUNT} WHERE ${OBJECTKEYNAME.MOBILE__C} = '${Mobile__c}' AND ${OBJECTKEYNAME.RECORD_TYPE_ID} = '${RECORD_TYPES.FARMER}'
    `;

      return await client.query(checkQry);
    } catch (error) {
      throw error;
    }
  },
  getAllFarmersByTerritory: async (
    userSfid,
    pageNumber,
    territory2Status,
    profile,
    searchField
  ) => {
    try {
      let qry = `
            SELECT
            ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SFID},
            ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.MOBILE__C},
            ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.PINCODE__C},
            ${OBJECTKEYNAME.FARMER_NAME__C},
            ${OBJECTKEYNAME.Farmer_Category__c},
            ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.HEROKU_ID__C},
            TO_CHAR(${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.CREATED_DATE}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.CREATED_DATE},
            ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.LAST_MODIFIED_DATE},
            ${OBJECTKEYNAME.VILLAGE_NAME__C}
            FROM
            ${SCHEMA.SALESFORCE.USER}`;
      if (profile === USER_HIERARCHY.VP_user) {
        qry += `
                LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as VpRegion ON VpRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
    LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as ZmRegion ON ZmRegion.${OBJECTKEYNAME.Cluster_region__c} = VpRegion.${OBJECTKEYNAME.SFID}
    LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as RmRegion ON RmRegion.${OBJECTKEYNAME.Zm_Region__c} = ZmRegion.${OBJECTKEYNAME.SFID}
    LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.Rm_Region__c} = RmRegion.${OBJECTKEYNAME.SFID}
    LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
    LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
    LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
    LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
               `;
      } else if (profile === USER_HIERARCHY.ZM__user) {
        qry += `
                LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as ZmRegion ON ZmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
    LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as RmRegion ON RmRegion.${OBJECTKEYNAME.Zm_Region__c} = ZmRegion.${OBJECTKEYNAME.SFID}
    LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.Rm_Region__c} = RmRegion.${OBJECTKEYNAME.SFID}
    LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
    LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
    LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
    LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
                `;
      } else if (profile === USER_HIERARCHY.RM__user) {
        qry += `
                LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as RmRegion ON RmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
                LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.Rm_Region__c} = RmRegion.${OBJECTKEYNAME.SFID}
                LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
                LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
                LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
                LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
                `;
      } else if (profile === USER_HIERARCHY.AM__user) {
        qry += `
                LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
    LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
    LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
    LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
    LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
                `;
      } else if (profile === USER_HIERARCHY.SI__user) {
        qry += `
                LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} ON ${SCHEMA.SALESFORCE.TERRITORY__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
    LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = ${SCHEMA.SALESFORCE.TERRITORY__C}.${OBJECTKEYNAME.SFID}
    LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
    LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
                `;
      }
      qry += `WHERE
                ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.SFID} = '${userSfid}'
                AND
                ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.RECORD_TYPE} = '${
        RECORD_TYPES.FARMER
      }'
                AND
                ${SCHEMA.SALESFORCE.ACCOUNT}.${
        OBJECTKEYNAME.IS_PARTIAL_FARMER__c
      } = '${false}'
                AND
                ${SCHEMA.SALESFORCE.ACCOUNT}._hc_err IS NULL
            `;
      if (searchField && searchField.length > 2) {
        qry += `
                AND
    (CAST(${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.MOBILE__C} AS TEXT) iLIKE '${searchField}%' OR ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.FARMER_NAME__C} iLIKE '${searchField}%' OR ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.VILLAGE_NAME__C} iLIKE '${searchField}%')
                `;
      }
      if (territory2Status) {
        qry += `
                UNION
      SELECT
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SFID},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.MOBILE__C},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.PINCODE__C},
      ${OBJECTKEYNAME.FARMER_NAME__C},
      ${OBJECTKEYNAME.Farmer_Category__c},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.HEROKU_ID__C},
      TO_CHAR(${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.CREATED_DATE}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.CREATED_DATE},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.LAST_MODIFIED_DATE},
      ${OBJECTKEYNAME.VILLAGE_NAME__C}
      FROM
      ${SCHEMA.SALESFORCE.USER}`;
        if (profile === USER_HIERARCHY.VP_user) {
          qry += `
                    LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as VpRegion ON VpRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping2__c}
                    LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as ZmRegion ON ZmRegion.${OBJECTKEYNAME.Cluster_region__c} = VpRegion.${OBJECTKEYNAME.SFID}
                    LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as RmRegion ON RmRegion.${OBJECTKEYNAME.Zm_Region__c} = ZmRegion.${OBJECTKEYNAME.SFID}
                    LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.Rm_Region__c} = RmRegion.${OBJECTKEYNAME.SFID}
                    LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
                    LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
                    LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
                    LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
                    `;
        } else if (profile === USER_HIERARCHY.ZM__user) {
          qry += `
                    LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as ZmRegion ON ZmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping2__c}
                    LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as RmRegion ON RmRegion.${OBJECTKEYNAME.Zm_Region__c} = ZmRegion.${OBJECTKEYNAME.SFID}
                    LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.Rm_Region__c} = RmRegion.${OBJECTKEYNAME.SFID}
                    LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
                    LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
                    LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
                    LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
                    `;
        } else if (profile === USER_HIERARCHY.RM__user) {
          qry += `
                    LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as RmRegion ON RmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping2__c}
                    LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.Rm_Region__c} = RmRegion.${OBJECTKEYNAME.SFID}
                    LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
                    LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
                    LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
                    LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
                    `;
        } else if (profile === USER_HIERARCHY.AM__user) {
          qry += `
                    LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping2__c}
                    LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
                    LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
                    LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
                    LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
                    `;
        } else if (profile === USER_HIERARCHY.SI__user) {
          qry += `
                    LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} ON ${SCHEMA.SALESFORCE.TERRITORY__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping2__c}
                    LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = ${SCHEMA.SALESFORCE.TERRITORY__C}.${OBJECTKEYNAME.SFID}
                    LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
                    LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
                    `;
        }
        qry += `
                WHERE
                ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.SFID} = '${userSfid}'
               AND
               ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.RECORD_TYPE} = '${
          RECORD_TYPES.FARMER
        }'
               AND
              ${SCHEMA.SALESFORCE.ACCOUNT}.${
          OBJECTKEYNAME.IS_PARTIAL_FARMER__c
        } = '${false}'
              AND
             ${SCHEMA.SALESFORCE.ACCOUNT}._hc_err IS NULL
                `;
      }
      if (searchField && searchField.length > 2) {
        qry += `
                AND
    (CAST(${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.MOBILE__C} AS TEXT) iLIKE '${searchField}%' OR ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.FARMER_NAME__C} iLIKE '${searchField}%' OR ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.VILLAGE_NAME__C} iLIKE '${searchField}%')
                `;
      }
      qry += `
            ORDER BY ${OBJECTKEYNAME.LAST_MODIFIED_DATE} DESC
            OFFSET (${pageNumber} - 1) * ${RECORDS_PER_PAGE}
            LIMIT ${RECORDS_PER_PAGE}
            `;
      // console.log("chcking qry", qry);
      return client.query(qry);
    } catch (error) {
      throw error;
    }
  },
};

module.exports = {
  distributorMapping,
  retailerMapping,
  farmerMapping,
  Account,
  agriExpertMapping
};
