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
  const Retailer={
    insertRetailerDetails: async (values) => {
        try {
            let insertQuery = `INSERT INTO ${SCHEMA.SALESFORCE.ACCOUNT} 
            (${OBJECTKEYNAME.MOBILE__C},
                ${OBJECTKEYNAME.PINCODE__C},
                ${OBJECTKEYNAME.Retailer_Range__c},
                ${OBJECTKEYNAME.Geo_Location__Latitude__s},
                ${OBJECTKEYNAME.Geo_Location__Longitude__s},
                ${OBJECTKEYNAME.RETAILER_SHOP_NAME__C},
                ${OBJECTKEYNAME.CONTACT_PERSON__C},
                ${OBJECTKEYNAME.CONTACT_PERSON_DESIGNATION__C},
                ${OBJECTKEYNAME.PAN_NO__C},
                ${OBJECTKEYNAME.GSTIN_NO__C},
                ${OBJECTKEYNAME.AT_THE_SHOP__C},
                ${OBJECTKEYNAME.STATE__C},
                ${OBJECTKEYNAME.Other_State__c},
                ${OBJECTKEYNAME.DISTRICT__C},
                ${OBJECTKEYNAME.Other_District__c},
                ${OBJECTKEYNAME.SUB_DISTRICT__C},
                ${OBJECTKEYNAME.Others_Sub_District__c},
                ${OBJECTKEYNAME.VILLAGE__C},
                ${OBJECTKEYNAME.Other_Village__c},
                ${OBJECTKEYNAME.ADDRESS__C},
                ${OBJECTKEYNAME.PESTICIDE_FERTILIZER_LICENSE__C},
                ${OBJECTKEYNAME.LICENSE_NUMBER__C},
                ${OBJECTKEYNAME.PESTICIDE_LICENSE_EXPIRY_DATE__C},
                ${OBJECTKEYNAME.PREFERRED_DISTRIBUTOR__C},
                ${OBJECTKEYNAME.SECOND_PREFERRED_DISTRIBUTOR__C},
                ${OBJECTKEYNAME.IS_RETAILER_A_FARMER__C},
                ${OBJECTKEYNAME.PESTICIDE_LICENSE__C},
                ${OBJECTKEYNAME.RETAILER_CATEGORY__C},
                ${OBJECTKEYNAME.AGRI_IMPLIMENTS_TURNOVER__C},
                ${OBJECTKEYNAME.PESTICIDE_SALE__C},
                ${OBJECTKEYNAME.SEED_SALES__C},
                ${OBJECTKEYNAME.FERTILIZE_SALLES__C},
                ${OBJECTKEYNAME.IIL_BUSINESS__C},
                ${OBJECTKEYNAME.IIL_CATEGORY__C},
                ${OBJECTKEYNAME.Shop_Front_Pic__c},
                ${OBJECTKEYNAME.Counter_Front_Pic__c},
                ${OBJECTKEYNAME.Interested_in_Dealer_Board__c},
                ${OBJECTKEYNAME.Image_of_Pest_Lic__c},
                ${OBJECTKEYNAME.CITY__C},
                ${OBJECTKEYNAME.Others__c},
                ${OBJECTKEYNAME.ID_Proof__c},
                ${OBJECTKEYNAME.PICTURE__C},
                ${OBJECTKEYNAME.RECORD_TYPE},
                ${OBJECTKEYNAME.HEROKU_ID__C},
                ${OBJECTKEYNAME.NAME},
                ${OBJECTKEYNAME.OWNER__C}) VALUES 
              ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46)`;
        
          await client.query(insertQuery, values);
        } catch (error) {
          throw error;
        }
      },
      getRetailerDetails:async()=>{
        try{
            const query = `SELECT ${OBJECTKEYNAME.RETAILER_SHOP_NAME__C}, ${OBJECTKEYNAME.NAME}, ${OBJECTKEYNAME.SFID} FROM ${SCHEMA.SALESFORCE.ACCOUNT} WHERE ${OBJECTKEYNAME.RECORD_TYPE} = '${RECORD_TYPES.RETAILER}'`;
    return await client.query(query);

        }
        catch(error){
            throw error;
        }
      },
      getRetailerById:async(herokuId)=>{
        try{
          const getQry = `
        SELECT 
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.MOBILE__C},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.PINCODE__C},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.RETAILER_SHOP_NAME__C},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.CONTACT_PERSON__C},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.CONTACT_PERSON_DESIGNATION__C},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.PAN_NO__C},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.GSTIN_NO__C},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.AT_THE_SHOP__C},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.ADDRESS__C},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.PESTICIDE_FERTILIZER_LICENSE__C},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.LICENSE_NUMBER__C},
        TO_CHAR(${SCHEMA.SALESFORCE.ACCOUNT}.${'Pesticide_License_Expiry_date__c'}, 'YYYY-MM-DD') as Pesticide_License_Expiry_date__c,
        preferredDistributor.${OBJECTKEYNAME.SFID} as Preferred_Distributor__c_id,
        secondPreferredDistributor.${OBJECTKEYNAME.SFID} as Second_Preferred_Distributor__c_id,
        preferredDistributor.${OBJECTKEYNAME.NAME} as Preferred_Distributor__c,
        secondPreferredDistributor.${OBJECTKEYNAME.NAME} as Second_Preferred_Distributor__c,
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.IS_RETAILER_A_FARMER__C},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.PESTICIDE_LICENSE__C},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.RETAILER_CATEGORY__C},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.AGRI_IMPLIMENTS_TURNOVER__C},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.PESTICIDE_SALE__C},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SEED_SALES__C},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.FERTILIZE_SALLES__C},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.IIL_BUSINESS__C},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.IIL_CATEGORY__C},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.PICTURE__C},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.Shop_Front_Pic__c},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.Counter_Front_Pic__c},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.Interested_in_Dealer_Board__c},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.Image_of_Pest_Lic__c},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.CITY__C},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.Other_State__c},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.Other_District__c},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.Others_Sub_District__c},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.Other_Village__c},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.Others__c},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.ID_Proof__c},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.RECORD_TYPE},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.NAME},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.OWNER__C},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.HEROKU_ID__C}, 
        ${SCHEMA.SALESFORCE.DISTRICT__C}.${OBJECTKEYNAME.DISTRICT_NAME__C}, 
        ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SUB_DISTRICT_NAME__C}, 
        ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.VILLAGE_NAME__C}, 
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.STATE__C},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.DISTRICT__C},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C},
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C},
        ${SCHEMA.SALESFORCE.STATE__C}.${OBJECTKEYNAME.NAME__C} as state_name__c
        FROM ${SCHEMA.SALESFORCE.ACCOUNT}
    LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} as preferredDistributor ON ${
      SCHEMA.SALESFORCE.ACCOUNT
    }.${OBJECTKEYNAME.PREFERRED_DISTRIBUTOR__C} = preferredDistributor.${OBJECTKEYNAME.SFID}
        LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} as secondPreferredDistributor ON ${
      SCHEMA.SALESFORCE.ACCOUNT
    }.${OBJECTKEYNAME.SECOND_PREFERRED_DISTRIBUTOR__C} = secondPreferredDistributor.${
      OBJECTKEYNAME.SFID
    }
        LEFT JOIN ${SCHEMA.SALESFORCE.STATE__C} ON ${SCHEMA.SALESFORCE.STATE__C}.${
      OBJECTKEYNAME.SFID
    } = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.STATE__C}
        LEFT JOIN ${SCHEMA.SALESFORCE.DISTRICT__C} ON ${SCHEMA.SALESFORCE.DISTRICT__C}.${
      OBJECTKEYNAME.SFID
    } = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.DISTRICT__C}
        LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${
      OBJECTKEYNAME.SFID
    } = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C}
        LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${
      OBJECTKEYNAME.SFID
    } = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
        WHERE 
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.RECORD_TYPE} = '${RECORD_TYPES.RETAILER}'
        AND
        ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.HEROKU_ID__C} = '${herokuId}'
    `;

   return await client.query(getQry);

        }
        catch(error){
          throw error;
        }

      },
      mobileQuery:async(Mobile__c,herokuId)=>{
        const checkDuplicateMobileQry = `
        SELECT ${OBJECTKEYNAME.HEROKU_ID__C} FROM ${SCHEMA.SALESFORCE.ACCOUNT} WHERE ${OBJECTKEYNAME.MOBILE__C} = '${Mobile__c}' AND ${OBJECTKEYNAME.HEROKU_ID__C} != '${herokuId}'
      `;
      return await client.query(checkDuplicateMobileQry);

      },
      


  };
  module.exports = {
    Retailer,
  };

