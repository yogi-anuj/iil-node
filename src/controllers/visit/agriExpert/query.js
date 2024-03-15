const { client } = require("../../../middleware/database/database");
const { SCHEMA, OBJECTKEYNAME, USER_HIERARCHY, RECORD_TYPES,DISTRIBUTOR_APPROVAL_STATUS ,STATUS} = require("../../../utilities/constants");
const format = require('pg-format');
const { getUniqueId } = require("../../../utilities/uniqueId");
const AgriExpert={
    addAgriExpertVisitDetails:async(values)=>{
        try{
            let insertQuery = `INSERT INTO ${SCHEMA.SALESFORCE.VISIT__C} 
    (${OBJECTKEYNAME.Category_type__c},
      ${OBJECTKEYNAME.TYPE_OF_AGRI_EXPERT__C},
      ${OBJECTKEYNAME.LAST_VISIT_DATE__C},
      ${OBJECTKEYNAME.EMAIL__C},
      ${OBJECTKEYNAME.ACCOUNT__C},
      ${OBJECTKEYNAME.MOBILE__C},
      ${OBJECTKEYNAME.Product_disscussion__c},
      ${OBJECTKEYNAME.New_Products_Discussion__c},
      ${OBJECTKEYNAME.Focus_Products_Discussion__c},
      ${OBJECTKEYNAME.Approach_For_Trial__c},
      ${OBJECTKEYNAME.Results_Of_Trial__c},
      ${OBJECTKEYNAME.COMMENTS__C},
      ${OBJECTKEYNAME.FEEDBACK__C},
      ${OBJECTKEYNAME.Geo_Location__Latitude__s},
      ${OBJECTKEYNAME.Geo_Location__Longitude__s},
      ${OBJECTKEYNAME.OWNER__C},
      ${OBJECTKEYNAME.HEROKU_ID__C},
      ${OBJECTKEYNAME.RECORD_TYPE}
      ) VALUES 
    (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
    )`;
    await client.query(insertQuery,values)

        }
        catch(error){
            throw error;
        }
    },
    getAgriExpertVisitors:async(searchField,sfid)=>{
        try{
            let getQry=``;
            if (searchField && searchField.length > 2) {
                getQry += `
                SELECT      
                ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.SFID},
                ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.HEROKU_ID__C},
                ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.LAST_NAME} as name,
                ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.Firm_Name__c},
                ${OBJECTKEYNAME.Category_type__c},
                ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.EMAIL__C},
                ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.MOBILE__C},
                ${OBJECTKEYNAME.Product_disscussion__c},
                ${OBJECTKEYNAME.New_Products_Discussion__c},
                ${OBJECTKEYNAME.Focus_Products_Discussion__c},
                ${OBJECTKEYNAME.Approach_For_Trial__c},
                ${OBJECTKEYNAME.Results_Of_Trial__c},
                ${OBJECTKEYNAME.COMMENTS__C},
                ${OBJECTKEYNAME.FEEDBACK__C},
                --${OBJECTKEYNAME.DISCUSSION__C},
                TO_CHAR(${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.CREATED_DATE}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.CREATED_DATE}
                FROM
                ${SCHEMA.SALESFORCE.VISIT__C}
                LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.ACCOUNT__C}
                WHERE
                (CAST(${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.MOBILE__C} as TEXT) iLIKE '${searchField}%' OR ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.Firm_Name__c} iLIKE '${searchField}%' OR ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.LAST_NAME} iLIKE '${searchField}%')
                AND
                ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.OWNER__C} = '${sfid}'
                AND
                ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.RECORD_TYPE_ID} = '${RECORD_TYPES.AGRI_EXPERT_VISIT}'
                ORDER BY ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.CREATED_DATE} DESC
                LIMIT 20
                `
              } else {
                getQry += `
                SELECT 
                ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.SFID},
                ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.HEROKU_ID__C},
                ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.LAST_NAME} as name,
                ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.Firm_Name__c},
                ${OBJECTKEYNAME.Category_type__c},
                ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.EMAIL__C},
                ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.MOBILE__C},
                ${OBJECTKEYNAME.Product_disscussion__c},
                ${OBJECTKEYNAME.New_Products_Discussion__c},
                ${OBJECTKEYNAME.Focus_Products_Discussion__c},
                ${OBJECTKEYNAME.Approach_For_Trial__c},
                ${OBJECTKEYNAME.Results_Of_Trial__c},
                ${OBJECTKEYNAME.COMMENTS__C},
                ${OBJECTKEYNAME.FEEDBACK__C},
                --${OBJECTKEYNAME.DISCUSSION__C},
                TO_CHAR(${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.CREATED_DATE}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.CREATED_DATE}
                FROM
                ${SCHEMA.SALESFORCE.VISIT__C}
                LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.ACCOUNT__C}
                WHERE
                ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.OWNER__C} = '${sfid}'
                AND
                ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.RECORD_TYPE_ID} = '${RECORD_TYPES.AGRI_EXPERT_VISIT}'
                ORDER BY ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.CREATED_DATE} DESC
                LIMIT 20
                `
              }
              return await client.query(getQry);

        }
        catch(error){
            throw error;
        }
    },
    getAgriExpertVisitorsById:async(herokuId)=>{
        try{
            let getQry = `
    SELECT 
    ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.SFID},
    ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.HEROKU_ID__C},
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.LAST_NAME} as name,
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.Firm_Name__c},
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.No_of_Farmers_associated_with_him__c},
    ${OBJECTKEYNAME.Category_type__c},
    ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.TYPE_OF_AGRI_EXPERT__C},
    ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.EMAIL__C},
    ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.MOBILE__C},
    ${OBJECTKEYNAME.Product_disscussion__c},
    ${OBJECTKEYNAME.New_Products_Discussion__c},
    ${OBJECTKEYNAME.Focus_Products_Discussion__c},
    ${OBJECTKEYNAME.Approach_For_Trial__c},
    ${OBJECTKEYNAME.Results_Of_Trial__c},
    ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.COMMENTS__C},
    ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.FEEDBACK__C},
    --${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.DISCUSSION__C},
    ${SCHEMA.SALESFORCE.DISTRICT__C}.${OBJECTKEYNAME.DISTRICT_NAME__C}, 
    ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SUB_DISTRICT_NAME__C}, 
    ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.VILLAGE_NAME__C}, 
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.STATE__C},
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.DISTRICT__C},
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C},
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C},
    ${SCHEMA.SALESFORCE.STATE__C}.${OBJECTKEYNAME.NAME__C} as state_name__c,
    TO_CHAR(${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.LAST_VISIT_DATE__C}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.LAST_VISIT_DATE__C},
    TO_CHAR(${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.CREATED_DATE}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.CREATED_DATE}
    FROM
    ${SCHEMA.SALESFORCE.VISIT__C}
    LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.ACCOUNT__C}
    LEFT JOIN ${SCHEMA.SALESFORCE.STATE__C} ON ${SCHEMA.SALESFORCE.STATE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.STATE__C}
    LEFT JOIN ${SCHEMA.SALESFORCE.DISTRICT__C} ON ${SCHEMA.SALESFORCE.DISTRICT__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.DISTRICT__C}
    LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C}
    LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
    WHERE
    ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.HEROKU_ID__C} = '${herokuId}'`;
    return await client.query(getQry);

        }
        catch(error)
        {
            throw error;
        }
    },
    getCropsById:async(herokuId)=>{
        try{
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
        catch(error){
            throw error;
        }
    },
    getAgriExpertLastVisitDetails:async(mobile__c,sfid)=>{
        try{
            const lastVisitQry = `
        SELECT 
          TO_CHAR(${OBJECTKEYNAME.CREATED_DATE}, 'YYYY-MM-DD') as last_visit_date
        FROM ${SCHEMA.SALESFORCE.VISIT__C} 
        WHERE 
          ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.OWNER__C} = '${sfid}'
          AND
          ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.RECORD_TYPE_ID} = '${RECORD_TYPES.AGRI_EXPERT_VISIT}'
          AND
          ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.MOBILE__C} = '${mobile__c}'
        ORDER BY ${OBJECTKEYNAME.CREATED_DATE} DESC
        OFFSET 1
        LIMIT 1
      `;
    
        return await client.query(lastVisitQry);

        }
        catch(error){
            throw error;
        }
    },
    getAccountDetails:async(herokuId)=>{
        try{
            let getQry=`SELECT 
            ${OBJECTKEYNAME.LAST_NAME} as name
            ${OBJECTKEYNAME.Firm_Name__c}
            ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.No_of_Farmers_associated_with_him__c},
    ${SCHEMA.SALESFORCE.DISTRICT__C}.${OBJECTKEYNAME.DISTRICT_NAME__C}, 
    ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SUB_DISTRICT_NAME__C}, 
    ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.VILLAGE_NAME__C}, 
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.STATE__C},
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SFID},
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.DISTRICT__C},
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C},
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C},
    ${SCHEMA.SALESFORCE.STATE__C}.${OBJECTKEYNAME.NAME__C} as state_name__c
    FROM ${SCHEMA.SALESFORCE.ACCOUNT}
    LEFT JOIN ${SCHEMA.SALESFORCE.STATE__C} ON ${SCHEMA.SALESFORCE.STATE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.STATE__C}
    LEFT JOIN ${SCHEMA.SALESFORCE.DISTRICT__C} ON ${SCHEMA.SALESFORCE.DISTRICT__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.DISTRICT__C}
    LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C}
    LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
    WHERE
    ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.HEROKU_ID__C} = '${herokuId}'
            ` ;
            return await client.query(getQry);


        }
        catch(error){
            throw error;
        }
    }

};
module.exports={
    AgriExpert
}