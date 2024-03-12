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

const Farmer = {
  insertFarmerDetails: async (values) => {
    try {
      let insertQuery = `INSERT INTO ${SCHEMA.SALESFORCE.ACCOUNT} 
            (${OBJECTKEYNAME.MOBILE__C},
              ${OBJECTKEYNAME.FARMER_NAME__C},
              ${OBJECTKEYNAME.Other_specify__c},
              ${OBJECTKEYNAME.Geo_Location__Latitude__s},
              ${OBJECTKEYNAME.Geo_Location__Longitude__s},
              ${OBJECTKEYNAME.DATE_OF_BIRTH__C},
              ${OBJECTKEYNAME.EMAIL__C},
              ${OBJECTKEYNAME.FATHER_NAME__C},
              ${OBJECTKEYNAME.TOTAL_CROP_ACREAGE__C},
              ${OBJECTKEYNAME.NUMBER_OF_FIELDS__C},
              ${OBJECTKEYNAME.ARE_YOU_ON_FIELD__C},
              ${OBJECTKEYNAME.STATE__C},
              ${OBJECTKEYNAME.DISTRICT__C},
              ${OBJECTKEYNAME.SUB_DISTRICT__C},
              ${OBJECTKEYNAME.Others_Sub_District__c},
              ${OBJECTKEYNAME.VILLAGE__C},
              ${OBJECTKEYNAME.Other_Village__c},
              ${OBJECTKEYNAME.METHOD__C},
              ${OBJECTKEYNAME.FROM_WHERE__C},
              ${OBJECTKEYNAME.NAME_OF_RETAILER_1__C},
              ${OBJECTKEYNAME.NAME_OF_RETAILER_2__C},
              ${OBJECTKEYNAME.NAME_OF_RETAILER_3__C},
              ${OBJECTKEYNAME.OTHER_1},
              ${OBJECTKEYNAME.OTHER_2},
              ${OBJECTKEYNAME.OTHER_3},
              ${OBJECTKEYNAME.INFLUENCER_NAME__C},
              ${OBJECTKEYNAME.OTHER_AGRIEXPERT__C},
              ${OBJECTKEYNAME.INFLUENCER_MOBILE__C},
              ${OBJECTKEYNAME.ADVICE_FROM_INFLUENCER__C},
              ${OBJECTKEYNAME.Farmer_Category__c},
              ${OBJECTKEYNAME.Farmer_Range__c},
              ${OBJECTKEYNAME.ID_TYPE__C},
              ${OBJECTKEYNAME.PICTURE__C},
              ${OBJECTKEYNAME.PROFILE_PICTURE__C},
              ${OBJECTKEYNAME.RECORD_TYPE},
              ${OBJECTKEYNAME.LAST_NAME},
              ${OBJECTKEYNAME.PINCODE__C},
              ${OBJECTKEYNAME.HEROKU_ID__C},
              ${OBJECTKEYNAME.OWNER__C}) VALUES 
              ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39)
              RETURNING *`;
      return await client.query(insertQuery, values);
    } catch (error) {
      throw error;
    }
  },
  insertCropDetails: async (insertData) => {
    try {
      const insertQuery = format(
        `
                INSERT INTO ${SCHEMA.SALESFORCE.CROP__C}(
                    ${OBJECTKEYNAME.SEASON__C},
                    ${OBJECTKEYNAME.CROP__C},
                    ${OBJECTKEYNAME.ACREAGES__C},
                    ${OBJECTKEYNAME.AgriInputs_Exp_per_Acre__c},
                    ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C},
                    ${OBJECTKEYNAME.HEROKU_ID__C},
                    ${OBJECTKEYNAME.Irrigation__c},
                    ${OBJECTKEYNAME.Other_Irrigation_Method__c}
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
  getFarmerById: async (herokuId) => {
    try {
      const getQry = `
    SELECT 
        A.${OBJECTKEYNAME.MOBILE__C},
        A.${OBJECTKEYNAME.FARMER_NAME__C},
        A.${OBJECTKEYNAME.Other_specify__c},
        A.${OBJECTKEYNAME.Farmer_Range__c},
        A.${OBJECTKEYNAME.Farmer_Category__c},
        A.${OBJECTKEYNAME.SEASON__C},
        A.${OBJECTKEYNAME.IRRIGATION_METHOD__C},
        A.${OBJECTKEYNAME.Farmer_Category__c},
        A.${OBJECTKEYNAME.Farmer_Range__c},
        A.${OBJECTKEYNAME.OTHER_1},
        A.${OBJECTKEYNAME.OTHER_2},
        A.${OBJECTKEYNAME.OTHER_3},
        InfluncerName.${OBJECTKEYNAME.LAST_NAME} as ${OBJECTKEYNAME.INFLUENCER_NAME__C},
        InfluncerName.${OBJECTKEYNAME.SFID} as influencerSfid,
        A.${OBJECTKEYNAME.OTHER_AGRIEXPERT__C},
        A.${OBJECTKEYNAME.INFLUENCER_MOBILE__C},
        TO_CHAR(A.${OBJECTKEYNAME.DATE_OF_BIRTH__C}, 'YYYY-MM-DD') as date_of_birth__c,
        A.${OBJECTKEYNAME.EMAIL__C},
        A.${OBJECTKEYNAME.FATHER_NAME__C},
        A.${OBJECTKEYNAME.TOTAL_CROP_ACREAGE__C},
        A.${OBJECTKEYNAME.NUMBER_OF_FIELDS__C},
        A.${OBJECTKEYNAME.ARE_YOU_ON_FIELD__C},
        A.${OBJECTKEYNAME.ACREAGE__C},
        A.${OBJECTKEYNAME.METHOD__C},
        A.${OBJECTKEYNAME.PINCODE__C},
        A.${OBJECTKEYNAME.FROM_WHERE__C},
        Retailer_Name_1.${OBJECTKEYNAME.NAME} as ${OBJECTKEYNAME.NAME_OF_RETAILER_1__C},
        Retailer_Name_2.${OBJECTKEYNAME.NAME} as ${OBJECTKEYNAME.NAME_OF_RETAILER_2__C},
        Retailer_Name_3.${OBJECTKEYNAME.NAME} as ${OBJECTKEYNAME.NAME_OF_RETAILER_3__C},
        Retailer_Name_1.${OBJECTKEYNAME.SFID} as ${OBJECTKEYNAME.NAME_OF_RETAILER_1__C_ID},
        Retailer_Name_2.${OBJECTKEYNAME.SFID} as ${OBJECTKEYNAME.NAME_OF_RETAILER_2__C_ID},
        Retailer_Name_3.${OBJECTKEYNAME.SFID} as ${OBJECTKEYNAME.NAME_OF_RETAILER_3__C_ID},
        A.${OBJECTKEYNAME.ADVICE_FROM_INFLUENCER__C},
        A.${OBJECTKEYNAME.ID_TYPE__C},
        A.${OBJECTKEYNAME.PICTURE__C},
        A.${OBJECTKEYNAME.PROFILE_PICTURE__C},
        A.${OBJECTKEYNAME.STATE__C},
        A.${OBJECTKEYNAME.DISTRICT__C},
        A.${OBJECTKEYNAME.SUB_DISTRICT__C},
        A.${OBJECTKEYNAME.Others_Sub_District__c},
        A.${OBJECTKEYNAME.VILLAGE__C},
        A.${OBJECTKEYNAME.Other_Village__c},
        A.${OBJECTKEYNAME.RECORD_TYPE},
        A.${OBJECTKEYNAME.LAST_NAME},
        A.${OBJECTKEYNAME.OWNER__C},
        A.${OBJECTKEYNAME.HEROKU_ID__C}, 
        District.${OBJECTKEYNAME.DISTRICT_NAME__C}, 
        SubDistrict.${OBJECTKEYNAME.SUB_DISTRICT_NAME__C}, 
        Village.${OBJECTKEYNAME.VILLAGE_NAME__C}, 
        State.${OBJECTKEYNAME.NAME__C} as state_name__c
    FROM ${SCHEMA.SALESFORCE.ACCOUNT} AS A
    LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} as Retailer_Name_1 ON Retailer_Name_1.${OBJECTKEYNAME.SFID} = A.${OBJECTKEYNAME.NAME_OF_RETAILER_1__C}
    LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} as Retailer_Name_2 ON Retailer_Name_2.${OBJECTKEYNAME.SFID} = A.${OBJECTKEYNAME.NAME_OF_RETAILER_2__C}
    LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} as Retailer_Name_3 ON Retailer_Name_3.${OBJECTKEYNAME.SFID} = A.${OBJECTKEYNAME.NAME_OF_RETAILER_3__C}
    LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} as InfluncerName ON InfluncerName.${OBJECTKEYNAME.SFID} = A.${OBJECTKEYNAME.INFLUENCER_NAME__C}
    LEFT JOIN ${SCHEMA.SALESFORCE.STATE__C} AS State ON State.${OBJECTKEYNAME.SFID} = A.${OBJECTKEYNAME.STATE__C}
    LEFT JOIN ${SCHEMA.SALESFORCE.DISTRICT__C} AS District ON District.${OBJECTKEYNAME.SFID} = A.${OBJECTKEYNAME.DISTRICT__C}
    LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} AS SubDistrict ON SubDistrict.${OBJECTKEYNAME.SFID} = A.${OBJECTKEYNAME.SUB_DISTRICT__C}
    LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} AS Village ON Village.${OBJECTKEYNAME.SFID} = A.${OBJECTKEYNAME.VILLAGE__C}
    WHERE 
        A.${OBJECTKEYNAME.RECORD_TYPE} = '${RECORD_TYPES.FARMER}'
        AND
        A.${OBJECTKEYNAME.HEROKU_ID__C} = '${herokuId}'
      
`;
      return await client.query(getQry);
    } catch (error) {
      throw error;
    }
  },
  getAllQuery: async (herokuId) => {
    try {
      const getQry = ``;
    } catch (error) {
      throw error;
    }
  },
  getFarmerCrops: async (herokuId) => {
    try {
      let cropsQry = `
                SELECT
                  ${OBJECTKEYNAME.SEASON__C} as session,
                  ${OBJECTKEYNAME.CROP__C} as crop,
                  ${OBJECTKEYNAME.ACREAGES__C} as acreage,
                  ${OBJECTKEYNAME.AgriInputs_Exp_per_Acre__c} as agri_inputs_exp_per_acre,
                  ${OBJECTKEYNAME.Irrigation__c} as irrigation,
                  ${OBJECTKEYNAME.Other_Irrigation_Method__c} as other_irrigation__c
                FROM
                  ${SCHEMA.SALESFORCE.CROP__C}
                WHERE
                  ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C} = '${herokuId}'        
              `;
      return await client.query(cropsQry);
    } catch (error) {
      throw error;
    }
  },
  
  
  checkMobileForFarmer: async (Mobile__c) => {
    try {
      const checkMobileQry = `
              SELECT ${OBJECTKEYNAME.HEROKU_ID__C} FROM ${SCHEMA.SALESFORCE.ACCOUNT} WHERE ${OBJECTKEYNAME.MOBILE__C} = '${Mobile__c}' AND ${OBJECTKEYNAME.HEROKU_ID__C} != '${herokuId}'
            `;
      return await client.query(checkMobileQry);
    } catch (error) {
      throw error;
    }
  },
};

module.exports = {
  Farmer,
};
