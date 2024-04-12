const { client } = require("../../../middleware/database/database");
const { SCHEMA, OBJECTKEYNAME, USER_HIERARCHY, RECORD_TYPES, DISTRIBUTOR_APPROVAL_STATUS, STATUS, RECORDS_PER_PAGE } = require("../../../utilities/constants");
const format = require('pg-format');

const Distributor = {
  // get all the distributions within the territory of the user
  getDistributorsWithinTerritory: async (
    userSfid,
    pageNumber = 1,
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
                ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SAP_ID__c},
                ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.CITY__C},
                ${OBJECTKEYNAME.GSTIN_NO__C},
                ${OBJECTKEYNAME.GSTIN_APPLIED__C},
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
                ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SAP_ID__c},
                ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.CITY__C},
                ${OBJECTKEYNAME.GSTIN_NO__C},
                ${OBJECTKEYNAME.GSTIN_APPLIED__C},
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
      return await client.query(qry);
    } catch (error) {
      throw error;
    }
  },
  // get all the distributors for the finance
  getDistributorsForFinanceTeam: async (pageNumber, searchField) => {
    try {
      let qry = `
    SELECT
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SFID},
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.MOBILE__C},
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.PINCODE__C},
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.Distributor_Approval_Status__c},
    ${OBJECTKEYNAME.Firm_Name__c},
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SAP_ID__c},
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.CITY__C},
    ${OBJECTKEYNAME.GSTIN_NO__C},
    ${OBJECTKEYNAME.GSTIN_APPLIED__C},
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.OWNER__C},
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.HEROKU_ID__C},
    TO_CHAR(${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.CREATED_DATE}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.CREATED_DATE},
    TO_CHAR(${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.LAST_MODIFIED_DATE}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.LAST_MODIFIED_DATE},
    ${OBJECTKEYNAME.SUB_DISTRICT_NAME__C}
    FROM
    ${SCHEMA.SALESFORCE.ACCOUNT}
    INNER JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
    --INNER JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
    WHERE
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.RECORD_TYPE} = '${RECORD_TYPES.DISTRIBUTOR}'
    AND
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.Distributor_Approval_Status__c} = '${DISTRIBUTOR_APPROVAL_STATUS.APPROVED_BY_L3}'
    AND
    ${SCHEMA.SALESFORCE.ACCOUNT}._hc_err IS NULL
  `;
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
      return await client.query(qry);
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
      ${OBJECTKEYNAME.Other_NATURE_OF_FIRMS__C},
      ${OBJECTKEYNAME.Business_Type__c},
      ${OBJECTKEYNAME.Shop_Office__c},
      ${OBJECTKEYNAME.Godown_Area__c},
      ${OBJECTKEYNAME.Godown_Facility__c},
      ${OBJECTKEYNAME.Total_Employees__c},
      ${OBJECTKEYNAME.Total_Vehicles__c},
      ${OBJECTKEYNAME.GSTIN_NO__C},
      ${OBJECTKEYNAME.GSTIN_APPLIED__C},
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
      --${OBJECTKEYNAME.Major_Crops__c},
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
      ${OBJECTKEYNAME.Material_Dispatch_Destination__c},
      ${OBJECTKEYNAME.PLANT__C},
      ${OBJECTKEYNAME.SAP_ID__c},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.NAME},
      ${OBJECTKEYNAME.RECORD_TYPE},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.HEROKU_ID__C},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.OWNER__C},
      ${SCHEMA.SALESFORCE.DISTRICT__C}.${OBJECTKEYNAME.DISTRICT_NAME__C}, 
      ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SUB_DISTRICT_NAME__C}, 
      ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.VILLAGE_NAME__C}, 
      ${SCHEMA.SALESFORCE.STATE__C}.${OBJECTKEYNAME.NAME__C} as state_name__c
      FROM ${SCHEMA.SALESFORCE.ACCOUNT}
      LEFT JOIN ${SCHEMA.SALESFORCE.STATE__C} ON ${SCHEMA.SALESFORCE.STATE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.STATE__C}
      LEFT JOIN ${SCHEMA.SALESFORCE.DISTRICT__C} ON ${SCHEMA.SALESFORCE.DISTRICT__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.DISTRICT__C}
      LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C}
      LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
      WHERE 
      ${OBJECTKEYNAME.RECORD_TYPE} = '${RECORD_TYPES.DISTRIBUTOR}'
      AND
      (
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.HEROKU_ID__C} = '${herokuId}'
        OR
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SFID} = '${herokuId}'
      )
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
      WHERE 
      (
        ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C} = '${herokuId}'
        OR
        ${OBJECTKEYNAME.Distributor__c} = '${herokuId}'
      )
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
      WHERE
      (
        ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C} = '${herokuId}'
        OR
        ${OBJECTKEYNAME.Distributor__c} = '${herokuId}'
      )
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
      ${OBJECTKEYNAME.Next_Fiscal_Year_Quantity__c},
      ${OBJECTKEYNAME.Next_Fiscal_Year_Unit__c},
      CAST(${OBJECTKEYNAME.QUANTITY__C} AS VARCHAR) as ${OBJECTKEYNAME.QUANTITY__C},
      ${OBJECTKEYNAME.Next_Fiscal_Year__c}
      FROM ${SCHEMA.SALESFORCE.Product_of_Interest__c}
      WHERE 
      (
        ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C} = '${herokuId}'
        OR
        ${OBJECTKEYNAME.Distributor__c} = '${herokuId}'
      )
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
      WHERE 
      (
        ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C} = '${herokuId}'
        OR
        ${OBJECTKEYNAME.Distributor__c} = '${herokuId}'
      )
      `;
      return await client.query(Sister_Company_Details_Qry);
    } catch (error) {
      throw error;
    }
  },
  // major crop details by id
  getMajorCropDetailById: async (herokuId) => {
    try {
      const Major_Crops_Qry = `
      SELECT 
      ${OBJECTKEYNAME.CROP__C} as crop_Name__c
      FROM ${SCHEMA.SALESFORCE.CROP__C}
      WHERE ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C} = '${herokuId}'
    `
      return await client.query(Major_Crops_Qry);
    } catch (error) {
      throw error;
    }
  },
  // material dispatched details by id
  getMaterialDispatchDestinationDetailById: async (herokuId) => {
    try {
      const Material_Dispatch_Destination_Qry = `
      SELECT 
      ${OBJECTKEYNAME.NAME__C} as depot_name__c
      FROM ${SCHEMA.SALESFORCE.Destination_of_Dipatch_of_Material_Depot__c}
      WHERE ${OBJECTKEYNAME.Lookup_Account__r__Heroku_ID__c} = '${herokuId}'
    `
      return await client.query(Material_Dispatch_Destination_Qry);
    } catch (error) {
      throw error;
    }
  },
  getStateQry: async (profile__c, territory2Status, userSfid) => {
    try {
      let getStateQry = `
      SELECT
      DISTINCT ON (${SCHEMA.SALESFORCE.STATE__C}.${OBJECTKEYNAME.NAME})
      ${SCHEMA.SALESFORCE.STATE__C}.${OBJECTKEYNAME.NAME}
      FROM
      ${SCHEMA.SALESFORCE.USER}
      `;
      if (profile__c === USER_HIERARCHY.AM__user) {
        getStateQry += `
      INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
      INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
      INNER JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
      `;
      } else if (profile__c === USER_HIERARCHY.SI__user) {
        getStateQry += `
      INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} ON ${SCHEMA.SALESFORCE.TERRITORY__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
      INNER JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = ${SCHEMA.SALESFORCE.TERRITORY__C}.${OBJECTKEYNAME.SFID}
      `;
      }
      getStateQry += `
      INNER JOIN ${SCHEMA.SALESFORCE.DISTRICT__C} ON ${SCHEMA.SALESFORCE.DISTRICT__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.DISTRICT__C}
      INNER JOIN ${SCHEMA.SALESFORCE.STATE__C} ON ${SCHEMA.SALESFORCE.STATE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.DISTRICT__C}.${OBJECTKEYNAME.STATE__C}
      WHERE ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.SFID} = '${userSfid}'
      `;
      if (territory2Status) {
        getStateQry += `
        UNION
        SELECT
        DISTINCT ON (${SCHEMA.SALESFORCE.STATE__C}.${OBJECTKEYNAME.NAME})
        ${SCHEMA.SALESFORCE.STATE__C}.${OBJECTKEYNAME.NAME}
        FROM
        ${SCHEMA.SALESFORCE.USER}
        `;
        if (profile__c === USER_HIERARCHY.AM__user) {
          getStateQry += `
          INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping2__c}
          INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
          INNER JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
        `;
        } else if (profile__c === USER_HIERARCHY.SI__user) {
          getStateQry += `
          INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} ON ${SCHEMA.SALESFORCE.TERRITORY__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping2__c}
          INNER JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = ${SCHEMA.SALESFORCE.TERRITORY__C}.${OBJECTKEYNAME.SFID}
        `;
        }
        getStateQry += `
        INNER JOIN ${SCHEMA.SALESFORCE.DISTRICT__C} ON ${SCHEMA.SALESFORCE.DISTRICT__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.DISTRICT__C}
        INNER JOIN ${SCHEMA.SALESFORCE.STATE__C} ON ${SCHEMA.SALESFORCE.STATE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.DISTRICT__C}.${OBJECTKEYNAME.STATE__C}
        WHERE ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.SFID} = '${userSfid}'
      `;
      }
      return await client.query(getStateQry);
    } catch (error) {
      throw error;
    }
  },
  getDepotsForStates: async (states) => {
    try {
      let depotQry = `
      SELECT 
      ${OBJECTKEYNAME.SFID},
      ${OBJECTKEYNAME.Plant_description__c} as depot_region__c
      FROM ${SCHEMA.SALESFORCE.Plant_Master__c} WHERE ${OBJECTKEYNAME.Plant_region__c} IN (${states.map(stateCode => { return `'${stateCode.name}'` })})
      `;
      return await client.query(depotQry);
    } catch (error) {
      throw error;
    }
  },
  // insert distributor data
  insertQuery: async (values) => {
    try {
      let insertQuery = `INSERT INTO ${SCHEMA.SALESFORCE.ACCOUNT} 
    (
      ${OBJECTKEYNAME.Firm_Name__c},
      ${OBJECTKEYNAME.NAME},
      ${OBJECTKEYNAME.ADDRESS__C},
      ${OBJECTKEYNAME.STATE__C},
      ${OBJECTKEYNAME.Other_State__c},
      ${OBJECTKEYNAME.DISTRICT__C},
      ${OBJECTKEYNAME.Other_District__c},
      ${OBJECTKEYNAME.SUB_DISTRICT__C},
      ${OBJECTKEYNAME.Others_Sub_District__c},
      ${OBJECTKEYNAME.VILLAGE__C},
      ${OBJECTKEYNAME.Other_Village__c},
      ${OBJECTKEYNAME.CITY__C},
      ${OBJECTKEYNAME.PINCODE__C},
      ${OBJECTKEYNAME.Telephone__c},
      ${OBJECTKEYNAME.MOBILE__C},
      ${OBJECTKEYNAME.Is_Mobile_Linked__c},
      ${OBJECTKEYNAME.Is_Mobile_Whatsapp__c},
      ${OBJECTKEYNAME.Alternate_Mobile__c},
      ${OBJECTKEYNAME.EMAIL__C},
      ${OBJECTKEYNAME.Establishment_Year__c},
      ${OBJECTKEYNAME.NATURE_OF_FIRMS__C},
      ${OBJECTKEYNAME.Other_NATURE_OF_FIRMS__C},
      ${OBJECTKEYNAME.Business_Type__c},
      ${OBJECTKEYNAME.Shop_Office__c},
      ${OBJECTKEYNAME.Godown_Area__c},
      ${OBJECTKEYNAME.Godown_Facility__c},
      ${OBJECTKEYNAME.Total_Employees__c},
      ${OBJECTKEYNAME.Total_Vehicles__c},
      ${OBJECTKEYNAME.GSTIN_NO__C},
      ${OBJECTKEYNAME.GSTIN_APPLIED__C},
      ${OBJECTKEYNAME.GSTIN_Registration_Date__c},
      ${OBJECTKEYNAME.INST_LICENSE_NO__C},
      ${OBJECTKEYNAME.INST_LIC_Registration_Date__c},
      ${OBJECTKEYNAME.INST_LIC_Registration_Validity__c},
      ${OBJECTKEYNAME.FERT_LICENSE_NO__C},
      ${OBJECTKEYNAME.FERT_LIC_Registration_Date__c},
      ${OBJECTKEYNAME.FERT_LIC_Registration_Validity__c},
      ${OBJECTKEYNAME.DD_Cheque_Online_Ref_No__c},
      ${OBJECTKEYNAME.DATE__C},
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
      --${OBJECTKEYNAME.Major_Crops__c},
      ${OBJECTKEYNAME.Dealer_Credit__c},
      ${OBJECTKEYNAME.Dealer_Credit_Days__c},
      ${OBJECTKEYNAME.Transporter_Name_1__c},
      ${OBJECTKEYNAME.Transporter_Name_2__c},
      ${OBJECTKEYNAME.Transporter_Name_3__c},
      ${OBJECTKEYNAME.Depot_Distance__c},
      ${OBJECTKEYNAME.Other_Dealer_Info__c},
      ${OBJECTKEYNAME.Party_Credibility__c},
      ${OBJECTKEYNAME.Is_Party_Visited_Personally__c},
      ${OBJECTKEYNAME.Material_Dispatch_Destination__c},
      ${OBJECTKEYNAME.Distributor_Approval_Status__c},
      ${OBJECTKEYNAME.Geo_Location__Latitude__s},
      ${OBJECTKEYNAME.Geo_Location__Longitude__s},
      ${OBJECTKEYNAME.RECORD_TYPE},
      ${OBJECTKEYNAME.HEROKU_ID__C},
      ${OBJECTKEYNAME.OWNER__C}
      ) VALUES 
      (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60, $61, $62, $63, $64, $65, $66, $67, $68, $69, $70, $71, $72, $73, $74, $75, $76, $77, $78, $79
      ) RETURNING *`;

      return await client.query(insertQuery, values);
    }
    catch (error) {
      throw error;
    }
  },
  // Proprietor_Details__c
  insertProprietorDetails: async (insertData) => {
    try {
      const qry = format(
        `
          INSERT INTO ${SCHEMA.SALESFORCE.Detail_of_Proprietor__c} (
              ${OBJECTKEYNAME.NAME},
              ${OBJECTKEYNAME.Permanent_Address__c},
              ${OBJECTKEYNAME.Present_Address__c},
              ${OBJECTKEYNAME.Father_Husband_Name__c},
              ${OBJECTKEYNAME.Business_Owner_Mobile__c},
              ${OBJECTKEYNAME.Business_Owner_Email__c},
              ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C},
              ${OBJECTKEYNAME.HEROKU_ID__C}
          )
          VALUES %L returning *
          `,
        insertData
      );
      return await client.query(qry);
    }
    catch (error) {
      throw error;
    }
  },
  deleteProprietorByAccountId: async (herokuId) => {
    try {
      const dltqry = `DELETE FROM ${SCHEMA.SALESFORCE.Detail_of_Proprietor__c} WHERE ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C} = '${herokuId}'`;
      return await client.query(dltqry);

    }
    catch (error) {
      throw error;
    }

  },
  insertCompanyDetails: async (insertData) => {
    try {
      const qry = format(
        `
          INSERT INTO ${SCHEMA.SALESFORCE.Retail_of_Business__c} (
              ${OBJECTKEYNAME.Company_Existing_Business__c},
              ${OBJECTKEYNAME.Total_Dealing_Years__c},
              ${OBJECTKEYNAME.Major_Product__c},
              ${OBJECTKEYNAME.Annual_Turnover__c},
              ${OBJECTKEYNAME.Total_Dealers__c},
              ${OBJECTKEYNAME.Total_Credit_Days__c},
              ${OBJECTKEYNAME.Cash_Or_Credit__c},
              ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C},
              ${OBJECTKEYNAME.HEROKU_ID__C}
          )
          VALUES %L returning *
          `,
        insertData
      );
      return await client.query(qry);
    }
    catch (error) {
      throw error;
    }
  },
  deleteCompanyDetails: async (herokuId) => {
    try {
      const dltqry = `DELETE FROM ${SCHEMA.SALESFORCE.Retail_of_Business__c} WHERE ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C} = '${herokuId}'`;
      return await client.query(dltqry);
    }
    catch (error) {
      throw error;
    }
  },
  insertProductOfInterest: async (insertData) => {
    try {
      const qry = format(
        `
          INSERT INTO ${SCHEMA.SALESFORCE.Product_of_Interest__c} (
            ${OBJECTKEYNAME.Product_Name__c},
            ${OBJECTKEYNAME.Other_Products__c},
            ${OBJECTKEYNAME.Products_Unit__c},
            ${OBJECTKEYNAME.Current_Fiscal_Year__c},
            ${OBJECTKEYNAME.Next_Fiscal_Year__c},
            ${OBJECTKEYNAME.Next_Fiscal_Year_Unit__c},
            ${OBJECTKEYNAME.Next_Fiscal_Year_Quantity__c},
            ${OBJECTKEYNAME.QUANTITY__C},
            ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C},
            ${OBJECTKEYNAME.HEROKU_ID__C}
          )
          VALUES %L returning *
          `,
        insertData
      );
      return await client.query(qry);
    }
    catch (error) {
      throw error;
    }
  },
  deleteProductOfInterest: async (herokuId) => {
    try {
      const dltqry = `DELETE FROM ${SCHEMA.SALESFORCE.Product_of_Interest__c} WHERE ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C} = '${herokuId}'`;
      return await client.query(dltqry);
    }
    catch (error) {
      throw error;
    }
  },
  insertSisterCompanyDetails: async (insertData) => {
    try {
      const qry = format(
        `
          INSERT INTO ${SCHEMA.SALESFORCE.Sister_Company__c} (
            ${OBJECTKEYNAME.NAME},
            ${OBJECTKEYNAME.Sister_Company_Address__c},
            ${OBJECTKEYNAME.Sister_Company_Turnover__c},
            ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C},
            ${OBJECTKEYNAME.HEROKU_ID__C}
          )
          VALUES %L returning *
          `,
        insertData
      );
      return await client.query(qry);

    }
    catch (error) {
      throw error;
    }
  },
  deleteSisterCompanyDetails: async (herokuId) => {
    try {
      const dltqry = `DELETE FROM ${SCHEMA.SALESFORCE.Sister_Company__c} WHERE ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C} = '${herokuId}'`;
      return await client.query(dltqry);

    }
    catch (error) {
      throw error;
    }

  },
  insertMaterialDispatchDestination: async (insertData) => {
    try {
      const qry = format(
        `
        INSERT INTO ${SCHEMA.SALESFORCE.Destination_of_Dipatch_of_Material_Depot__c} (
          ${OBJECTKEYNAME.NAME__C},
          ${OBJECTKEYNAME.Lookup_Account__r__Heroku_ID__c},
          ${OBJECTKEYNAME.HEROKU_ID__C}
      )
      VALUES %L returning *
          `,
        insertData
      );
      return await client.query(qry);
    }
    catch (error) {
      throw error;
    }
  },
  deleteMaterialDispatchDestination: async (herokuId) => {
    try {
      const dltqry = `DELETE FROM ${SCHEMA.SALESFORCE.Destination_of_Dipatch_of_Material_Depot__c} WHERE ${OBJECTKEYNAME.Lookup_Account__r__Heroku_ID__c} = '${herokuId}'`;
      return await client.query(dltqry);

    }
    catch (error) {
      throw error;
    }

  },
  insertCrop: async (insertData) => {
    try {
      const qry = format(
        `
        INSERT INTO ${SCHEMA.SALESFORCE.CROP__C} (
          ${OBJECTKEYNAME.CROP__C},
          ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C},
          ${OBJECTKEYNAME.HEROKU_ID__C}
      )
      VALUES %L returning *
          `,
        insertData
      );
      return await client.query(qry);
    }
    catch (error) {
      throw error;
    }
  },
  deleteMajorCrops: async (herokuId) => {
    try {
      const dltqry = `DELETE FROM ${SCHEMA.SALESFORCE.CROP__C} WHERE ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C} = '${herokuId}'`;
      return await client.query(dltqry);
    }
    catch (error) {
      throw error;
    }

  },
  // files: async (insertData) => {
  //   try {
  //     const qry = format(
  //       `
  //         INSERT INTO ${SCHEMA.SALESFORCE.FILE__C} (
  //             ${OBJECTKEYNAME.NAME__C},
  //             ${OBJECTKEYNAME.PICTURE__C},
  //             ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C},
  //             ${OBJECTKEYNAME.HEROKU_ID__C}
  //         )
  //         VALUES %L returning *
  //         `,
  //       insertData
  //     );
  //     return await client.query(qry);
  //   } catch (error) {
  //     throw error;
  //   }
  // },
  // deleteFilesDetails: async (herokuId) => {
  //   try {
  //     const dltqry = `DELETE FROM ${SCHEMA.SALESFORCE.FILE__C} WHERE ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C} = '${herokuId}'`;
  //     return await client.query(dltqry);

  //   }
  //   catch (error) {
  //     throw error;
  //   }

  // },
  deleteDistributorDetailByHerokuId: async (herokuId) => {
    try {
      const dltqry = `DELETE FROM ${SCHEMA.SALESFORCE.ACCOUNT} WHERE ${OBJECTKEYNAME.Heroku_ID__c} = '${herokuId}'`;
      return await client.query(dltqry);
    }
    catch (error) {

    }

  },
  insertPendingApprovalRecords: async (accountHerokuId, sfid, herokuId) => {
    try {
      const approvalQry = `
    INSERT INTO ${SCHEMA.SALESFORCE.APPROVAL__C} (
      ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C},
      ${OBJECTKEYNAME.HEROKU_ID__C},
      ${OBJECTKEYNAME.OWNER__C},
      ${OBJECTKEYNAME.STATUS__C}
    ) VALUES (
      '${accountHerokuId}',
      '${herokuId}',
      '${sfid}',          
      '${STATUS.PENDING}'
    )
  `;
      return await client.query(approvalQry);
    } catch (error) {
      throw error;
    }

  },
  approveQry: async (values) => {
    try {
      const approvalQry = `
        INSERT INTO ${SCHEMA.SALESFORCE.APPROVAL__C} (
          ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C},
          ${OBJECTKEYNAME.HEROKU_ID__C},
          ${OBJECTKEYNAME.COMMENTS__C},
          ${OBJECTKEYNAME.Rejection_Level__c},
          ${OBJECTKEYNAME.OWNER__C},
          ${OBJECTKEYNAME.STATUS__C}
        ) VALUES (
          $1, $2, $3, $4, $5, $6
        )
      `;
      return await client.query(approvalQry, values);
    }
    catch (error) {
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
        WHERE 
        (
          ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C} = '${herokuId}'
          OR
          ${OBJECTKEYNAME.ACCOUNT__C} = '${herokuId}'
        )
        AND ${OBJECTKEYNAME.Rejection_Level__c} IS NOT NULL
        ORDER BY ${OBJECTKEYNAME.Rejection_Level__c}, ${OBJECTKEYNAME.CREATED_DATE} DESC
        LIMIT 1
      `;

      return await client.query(Approval_Qry);
    } catch (error) {
      throw error;
    }
  },
  managerDataQuery: async (profile__c, sfid) => {
    try {
      let managerDataQry;
      if (profile__c == 'SI') {
        managerDataQry = `
    SELECT 
    rmUser.${OBJECTKEYNAME.SFID} as managerSfid, 
    rmUser.${OBJECTKEYNAME.NAME__C} as managerName
    FROM 
    ${SCHEMA.SALESFORCE.USER}
    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as siTerritory ON siTerritory.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as amTerritory ON amTerritory.${OBJECTKEYNAME.SFID} = siTerritory.${OBJECTKEYNAME.Amr_Region__c}
    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as rmTerritory ON rmTerritory.${OBJECTKEYNAME.SFID} = amTerritory.${OBJECTKEYNAME.Rm_Region__c}
    INNER JOIN ${SCHEMA.SALESFORCE.USER} as rmUser ON rmUser.${OBJECTKEYNAME.Territory_Mapping1__c} = rmTerritory.${OBJECTKEYNAME.SFID}
    WHERE
    ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.SFID} = '${sfid}'
    AND
    rmUser.profile__c = 'RM'
  `;
      }
      else if (profile__c == 'RM') {
        managerDataQry = `
    SELECT 
    vpUser.${OBJECTKEYNAME.SFID} as managerSfid, 
    vpUser.${OBJECTKEYNAME.NAME__C} as managerName
    FROM 
    ${SCHEMA.SALESFORCE.USER}
    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as rmTerritory ON rmTerritory.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as zmTerritory ON zmTerritory.${OBJECTKEYNAME.SFID} = rmTerritory.${OBJECTKEYNAME.Zm_Region__c}
    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as vpTerritory ON vpTerritory.${OBJECTKEYNAME.SFID} = zmTerritory.${OBJECTKEYNAME.Cluster_region__c}
    INNER JOIN ${SCHEMA.SALESFORCE.USER} as vpUser ON vpUser.${OBJECTKEYNAME.Territory_Mapping1__c} = vpTerritory.${OBJECTKEYNAME.SFID}
    WHERE
    ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.SFID} = '${sfid}'
    AND
    vpUser.profile__c = 'VP'
  `;
      } else {
        return false
      }
      return await client.query(managerDataQry);
    }
    catch {
      throw error;

    }

  },
  //user by sfid
  // userBySfid: async (sfid) => {
  //   try {
  //     const userQry = `
  //       SELECT ${OBJECTKEYNAME.PROFILE__C} FROM ${SCHEMA.SALESFORCE.USER} WHERE ${OBJECTKEYNAME.SFID} = '${sfid}'
  //     `;
  //     return await client.query(userQry);

  //   } catch (error) {
  //     throw error;
  //   }
  // },
  // checkDistributorQuery: async (paramsData) => {
  //   try {
  //     const checkDistributorQry = `
  //       SELECT 
  //       ${OBJECTKEYNAME.SFID}, 
  //       ${OBJECTKEYNAME.Distributor_Approval_Status__c}, 
  //       ${OBJECTKEYNAME.Firm_Name__c} as distributorname, 
  //       ${OBJECTKEYNAME.OWNER__C} as saleRepresentativesfid
  //       FROM ${SCHEMA.SALESFORCE.ACCOUNT} 
  //       WHERE ${OBJECTKEYNAME.HEROKU_ID__C} = '${paramsData.herokuId}'
  //     `;
  //     return await client.query(checkDistributorQry);
  //   } catch (error) {
  //     throw error;
  //   }
  // },



  //update approval query  
  // updateInsertQry: async (Comments__c, isApproved, herokuId) => {
  //   try {
  //     const updateDistributorQry = `
  //   UPDATE ${SCHEMA.SALESFORCE.ACCOUNT}
  //   SET
  //   ${OBJECTKEYNAME.Distributor_Approval_Status__c} = '${isApproved === 'Yes'
  //         ? DISTRIBUTOR_APPROVAL_STATUS.APPROVED_BY_L3
  //         : DISTRIBUTOR_APPROVAL_STATUS.REJECTED_BY_L3
  //       }'
  //   WHERE
  //   ${OBJECTKEYNAME.HEROKU_ID__C} = '${herokuId}'
  //   `;
  //     return await client.query(updateDistributorQry);



  //   } catch (error) {
  //     throw error;
  //   }
  // },
  updateDistributorQry: async (isApproved, herokuId) => {
    try {
      const updateDistributorQry = `
  UPDATE ${SCHEMA.SALESFORCE.ACCOUNT}
  SET
  ${OBJECTKEYNAME.Distributor_Approval_Status__c} = '${isApproved === 'Yes'
          ? DISTRIBUTOR_APPROVAL_STATUS.APPROVED_BY_L4
          : DISTRIBUTOR_APPROVAL_STATUS.REJECTED_BY_L4
        }'
  WHERE
  ${OBJECTKEYNAME.HEROKU_ID__C} = '${herokuId}'
  `;
      return await client.query(updateDistributorQry);

    }
    catch (error) {
      throw error;
    }
  },
  /*deleteQry:async(Proprietor_Details__c,Company_Details__c,Product_Of_Interest__c,Sister_Company_Details__c,Files__c,herokuId)=>{
    try{
      const  deletedRecords='';
      if(Proprietor_Details__c.length > 0){
        deletedRecords = `DELETE FROM ${SCHEMA.SALESFORCE.Detail_of_Proprietor__c} WHERE ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C} = '${herokuId}'`
      }
      if(Company_Details__c.length > 0){
        deletedRecords = `DELETE FROM ${SCHEMA.SALESFORCE.Retail_of_Business__c} WHERE ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C} = '${herokuId}'`
      }
      if(Product_Of_Interest__c.length > 0){
         deletedRecords = `DELETE FROM ${SCHEMA.SALESFORCE.Product_of_Interest__c} WHERE ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C} = '${herokuId}'`
  
      }
      if(Sister_Company_Details__c.length > 0){
        deletedRecords = `DELETE FROM ${SCHEMA.SALESFORCE.Sister_Company__c} WHERE ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C} = '${herokuId}'`
      }
      if(Files__c.length > 0){
        deletedRecords = `DELETE FROM ${SCHEMA.SALESFORCE.FILE__C} WHERE ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C} = '${herokuId}'`
      }
      return await client.query(deletedRecords);
      
  
    }
    catch(error){
      throw error;
  
    }
  
  },*/
  //update query for si user
  // updateQry: async (values, fieldUpdates) => {
  //   try {
  //     const updateQuery = `UPDATE ${SCHEMA.SALESFORCE.ACCOUNT}
  //   SET
  //     ${Object.keys(fieldUpdates)
  //         .map((fieldName, index) => `${fieldName} = $${index + 1}`)
  //         .join(',\n')}
  //   WHERE
  //     ${OBJECTKEYNAME.HEROKU_ID__C} = $${Object.keys(fieldUpdates).length + 1}
  // `;
  //     return await client.query(updateQuery, values);
  //   }
  //   catch (error) {
  //     throw error;
  //   }
  // },
  // updatedQuery: async (Credit_Period_Specify_No_of_Days__c, Creditibility_in_Market_for_Managers_O__c, Credit_Limit_Specify_Amount__c, herokuId, isApproved) => {
  //   try {
  //     const updateQry = `
  //     UPDATE ${SCHEMA.SALESFORCE.ACCOUNT} 
  //     SET 
  //     ${OBJECTKEYNAME.Credit_Period_Specify_No_of_Days__c
  //       } = '${Credit_Period_Specify_No_of_Days__c}',
  //     ${OBJECTKEYNAME.Creditibility_in_Market_for_Managers_O__c
  //       } = '${Creditibility_in_Market_for_Managers_O__c}',
  //     ${OBJECTKEYNAME.Credit_Limit_Specify_Amount__c} = ${Credit_Limit_Specify_Amount__c || 0},
  //     ${OBJECTKEYNAME.Distributor_Approval_Status__c} = '${isApproved === 'Yes'
  //         ? DISTRIBUTOR_APPROVAL_STATUS.APPROVED_BY_L2
  //         : DISTRIBUTOR_APPROVAL_STATUS.REJECTED_BY_L2
  //       }'
  //     WHERE
  //     ${OBJECTKEYNAME.HEROKU_ID__C} = '${herokuId}'
  //   `;
  //     return await client.query(updateQry);

  //   }
  //   catch (error) {
  //     throw error;
  //   }

  // },
  getDistributors: async (loginUser, sfid) => {
    try {
      let qry = ''

      if (loginUser) {
        qry += `SELECT ${OBJECTKEYNAME.Firm_Name__c}, ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.NAME}, ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.PINCODE__C}, ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SFID}, ${OBJECTKEYNAME.GSTIN_NO__C}, ${OBJECTKEYNAME.GSTIN_APPLIED__C}, ${OBJECTKEYNAME.VILLAGE_NAME__C} FROM ${SCHEMA.SALESFORCE.ACCOUNT} INNER JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C} WHERE ${OBJECTKEYNAME.RECORD_TYPE} = '${RECORD_TYPES.DISTRIBUTOR}' AND ${OBJECTKEYNAME.OWNER__C} = '${sfid}'`;
      } else {
        qry += `SELECT ${OBJECTKEYNAME.Firm_Name__c}, ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.NAME}, ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.PINCODE__C}, ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SFID}, ${OBJECTKEYNAME.GSTIN_NO__C}, ${OBJECTKEYNAME.GSTIN_APPLIED__C}, ${OBJECTKEYNAME.VILLAGE_NAME__C} FROM ${SCHEMA.SALESFORCE.ACCOUNT} INNER JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C} WHERE ${OBJECTKEYNAME.RECORD_TYPE} = '${RECORD_TYPES.DISTRIBUTOR}'`;
      }
      return await client.query(qry);
    }
    catch (error) {
      throw error;
    }
  },
  distributorApprovalMessage: async (distributorName, approvalStatus) => {
    try {
      let msg = `Finance team has ${approvalStatus} ${distributorName} for distributor mapping`
      return msg;

    }
    catch (error) {
      throw error;
    }
  }


};


module.exports = {
  Distributor,

};
