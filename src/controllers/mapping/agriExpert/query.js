const { client } = require("../../../middleware/database/database");
const {
  SCHEMA,
  OBJECTKEYNAME,
  USER_HIERARCHY,
  RECORD_TYPES,
  DISTRIBUTOR_APPROVAL_STATUS,
  STATUS,
} = require("../../../utilities/constants");
const format = require("pg-format");

const agriExperts = {
  insertAgriExpertDetails: async (values) => {
    try {
      let insertQuery = `INSERT INTO ${SCHEMA.SALESFORCE.ACCOUNT} (
              ${OBJECTKEYNAME.MOBILE__C},
              ${OBJECTKEYNAME.First_Mobile__c},
              ${OBJECTKEYNAME.LAST_NAME},
              ${OBJECTKEYNAME.TYPE_OF_AGRI_EXPERT__C},
              ${OBJECTKEYNAME.DESIGNATION_PROFILE__C},
              ${OBJECTKEYNAME.STATE__C},
              ${OBJECTKEYNAME.CITY__C},
              ${OBJECTKEYNAME.ADDRESS__C},
              ${OBJECTKEYNAME.Firm_Name__c},
              ${OBJECTKEYNAME.DISTRICT__C},
              ${OBJECTKEYNAME.SUB_DISTRICT__C},
              ${OBJECTKEYNAME.Others_Sub_District__c},
              ${OBJECTKEYNAME.VILLAGE__C},
              ${OBJECTKEYNAME.Other_Village__c},
              ${OBJECTKEYNAME.Name_Of_Department__c},
              ${OBJECTKEYNAME.Prop_Parternership__c},
              ${OBJECTKEYNAME.CONTACT_PERSON__C},
              ${OBJECTKEYNAME.Total_Annual_Turnover_in_Lacs_IIL__c},
              ${OBJECTKEYNAME.Company_1_Brand__c},
              ${OBJECTKEYNAME.Company_2_Brand__c},
              ${OBJECTKEYNAME.Company_3_Brand__c},
              ${OBJECTKEYNAME.Company_4_Brand__c},
              ${OBJECTKEYNAME.Company_5_Brand__c},
              ${OBJECTKEYNAME.PESTICIDE_SALE__C},
              ${OBJECTKEYNAME.FERTILIZE_SALLES__C},
              ${OBJECTKEYNAME.SEED_SALES__C},
              ${OBJECTKEYNAME.Brands_Promoted__c},
              ${OBJECTKEYNAME.No_of_Retailers__c},
              ${OBJECTKEYNAME.Working_With__c},
              ${OBJECTKEYNAME.Territory_Looking__c},
              ${OBJECTKEYNAME.No_of_Distributors__c},
              ${OBJECTKEYNAME.Business_Value__c},
              ${OBJECTKEYNAME.Experience__c},
              ${OBJECTKEYNAME.No_of_Farmers_associated_with_him__c},
              ${OBJECTKEYNAME.AT_THE_SHOP__C},
              ${OBJECTKEYNAME.PINCODE__C},
              ${OBJECTKEYNAME.RECORD_TYPE},
              ${OBJECTKEYNAME.OWNER__C},
              ${OBJECTKEYNAME.HEROKU_ID__C},
              ${OBJECTKEYNAME.Geo_Location__Longitude__s},
              ${OBJECTKEYNAME.Geo_Location__Latitude__s}
              ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41
                ) RETURNING heroku_id__c`;
      return await client.query(insertQuery, values);
    } catch (error) {
      throw error;
    }
  },
  insertCropDetails: async (insertData) => {
    try {
      const insertQuery = format(
        `INSERT INTO ${SCHEMA.SALESFORCE.CROP__C} 
              (
                ${OBJECTKEYNAME.CROP__C}, 
                ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C},
                ${OBJECTKEYNAME.Heroku_ID__c}
              ) 
              VALUES %L returning *
                      `,
        insertData
      );

      return await client.query(insertQuery);
    } catch (error) {
      throw error;
    }

  },
  getAllAgriExpertsByTerritory: async (
    userSfid,
    pageNumber = 1,
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
            
      return await client.query(qry);
    } catch (error) {
      throw error;
    }
  },
  getAgriExpertDetailsById: async (herokuId) => {
    try {
      const getQry = `
      SELECT 
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.LAST_NAME}, 
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.PINCODE__C}, 
      ${OBJECTKEYNAME.TYPE_OF_AGRI_EXPERT__C},
      ${OBJECTKEYNAME.DESIGNATION_PROFILE__C},
      ${OBJECTKEYNAME.AT_THE_SHOP__C},
      ${OBJECTKEYNAME.ADDRESS__C}, 
      ${OBJECTKEYNAME.CITY__C},
      ${OBJECTKEYNAME.CROP__C},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.PINCODE__C},
      ${OBJECTKEYNAME.MOBILE__C}, 
      ${OBJECTKEYNAME.Name_Of_Department__c}, 
      ${OBJECTKEYNAME.First_Mobile__c}, 
      ${OBJECTKEYNAME.Firm_Name__c},
      ${OBJECTKEYNAME.Prop_Parternership__c},
      ${OBJECTKEYNAME.CONTACT_PERSON__C},
      ${OBJECTKEYNAME.Total_Annual_Turnover_in_Lacs_IIL__c},
      ${OBJECTKEYNAME.Company_1_Brand__c},
      ${OBJECTKEYNAME.Company_2_Brand__c},
      ${OBJECTKEYNAME.Company_3_Brand__c},
      ${OBJECTKEYNAME.Company_4_Brand__c},
      ${OBJECTKEYNAME.Company_5_Brand__c},
      ${OBJECTKEYNAME.PESTICIDE_SALE__C},
      ${OBJECTKEYNAME.FERTILIZE_SALLES__C},
      ${OBJECTKEYNAME.SEED_SALES__C},
      ${OBJECTKEYNAME.Brands_Promoted__c},
      ${OBJECTKEYNAME.No_of_Retailers__c},
      ${OBJECTKEYNAME.Working_With__c},
      ${OBJECTKEYNAME.Territory_Looking__c},
      ${OBJECTKEYNAME.No_of_Distributors__c},
      ${OBJECTKEYNAME.Business_Value__c},
      ${OBJECTKEYNAME.Experience__c},
      ${OBJECTKEYNAME.No_of_Farmers_associated_with_him__c},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.HEROKU_ID__C}, 
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SFID}, 
      ${SCHEMA.SALESFORCE.DISTRICT__C}.${OBJECTKEYNAME.DISTRICT_NAME__C}, 
      ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SUB_DISTRICT_NAME__C}, 
      ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.VILLAGE_NAME__C}, 
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.STATE__C},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.DISTRICT__C},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.Others_Sub_District__c},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.Other_Village__c},
      ${SCHEMA.SALESFORCE.STATE__C}.${OBJECTKEYNAME.NAME__C} as state_name__c
      FROM ${SCHEMA.SALESFORCE.ACCOUNT}
      LEFT JOIN ${SCHEMA.SALESFORCE.STATE__C} ON ${SCHEMA.SALESFORCE.STATE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.STATE__C}
      LEFT JOIN ${SCHEMA.SALESFORCE.DISTRICT__C} ON ${SCHEMA.SALESFORCE.DISTRICT__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.DISTRICT__C}
      LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C}
      LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
      WHERE 
      ${OBJECTKEYNAME.RECORD_TYPE} = '${RECORD_TYPES.AGRI_EXPERT}'
      AND
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.HEROKU_ID__C} = '${herokuId}'
      `;
      return await client.query(getQry);
    }
    catch (error) {
      throw error;
    }
  },
  getCropDetails: async (herokuId) => {
    try {
      let cropsQry = `
      SELECT
      ${OBJECTKEYNAME.SEASON__C} as session,
      ${OBJECTKEYNAME.CROP__C} as crop,
      ${OBJECTKEYNAME.ACREAGES__C} as acreage,
      ${OBJECTKEYNAME.AgriInputs_Exp_per_Acre__c} as agri_inputs_exp_per_acre,
      ${OBJECTKEYNAME.Irrigation__c} as irrigation
      FROM
        ${SCHEMA.SALESFORCE.CROP__C}
      WHERE
        ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C} = '${herokuId}'     
      `;
      return await client.query(cropsQry);
    }
    catch (error) {
      throw error;
    }
  }
};
module.exports = {
  agriExperts
};