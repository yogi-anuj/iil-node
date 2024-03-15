const { client } = require("../../../middleware/database/database");
const { SCHEMA, OBJECTKEYNAME,RECORD_TYPES } = require("../../../utilities/constants");
const { formatDate } = require("../../../utilities/customDate");
const { getUniqueId } = require("../../../utilities/uniqueId");
const format = require('pg-format');
const retailerVisit={
    insertRetailerVisit:async(values)=>{
        try{
        let insertQuery = `INSERT INTO ${SCHEMA.SALESFORCE.VISIT__C} (
            ${OBJECTKEYNAME.MOBILE__C},
            ${OBJECTKEYNAME.ORDER__C},
            ${OBJECTKEYNAME.PRODUCT__C},
            ${OBJECTKEYNAME.Qty__c},
            ${OBJECTKEYNAME.FEEDBACK__C},
            ${OBJECTKEYNAME.AT_SHOP__C},
            ${OBJECTKEYNAME.ACCOUNT__C},
            ${OBJECTKEYNAME.LAST_VISIT_DATE__C},
            ${OBJECTKEYNAME.COMMENTS__C},
            ${OBJECTKEYNAME.Geo_Location__Latitude__s},
            ${OBJECTKEYNAME.Geo_Location__Longitude__s},
            ${OBJECTKEYNAME.OWNER__C},
            ${OBJECTKEYNAME.HEROKU_ID__C},
            ${OBJECTKEYNAME.CONTACT_PERSON__C},
            ${OBJECTKEYNAME.RETAILER_SHOP_NAME__C},
            ${OBJECTKEYNAME.PESTICIDES_LICENSE_NUMBER__C},
            ${OBJECTKEYNAME.RECORD_TYPE}
          ) VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11,
            $12,
            $13,
            $14,
           $15,
            $16,
            $17) RETURNING heroku_id__c`;
  
      return  await client.query(insertQuery,values);
          }
          catch(error){
            throw error;
          }
    },
    insertProductDetails:async()=>{
        try{
        const insertProduct=format( `
        INSERT INTO ${SCHEMA.SALESFORCE.NEW_PRODUCT__C} (
            ${OBJECTKEYNAME.PRODUCT__C},
            ${OBJECTKEYNAME.QUANTITY__C},
            ${OBJECTKEYNAME.UNIT__C},
            ${OBJECTKEYNAME.OTHER_BRAND__C},
            ${OBJECTKEYNAME.HEROKU_ID__C},
            ${OBJECTKEYNAME.VISIT__C__HEROKU_ID__C})
            VALUES %L returning *
            `,
          insertData)
          return await client.query(insertProduct);
        }
        catch(error){
            throw error;
        }

    },
    getRetailers:async(searchField,sfid)=>{
        try{
            if (searchField && searchField.length > 2) {
                qry = `
                SELECT 
                ${OBJECTKEYNAME.AT_SHOP__C},
                ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.MOBILE__C},
                ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.RETAILER_SHOP_NAME__C} as retailer_shop_name,
                ${OBJECTKEYNAME.HIGH_MOVING_IIL_PRODUCTS__C},
                ${OBJECTKEYNAME.COMMENTS__C},
                TO_CHAR(${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.CREATED_DATE}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.CREATED_DATE},
                ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.OWNER__C},
                ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.HEROKU_ID__C},
                ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.RECORD_TYPE}
                FROM ${SCHEMA.SALESFORCE.VISIT__C}
                LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.ACCOUNT__C}
                WHERE
                ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.OWNER__C} = '${sfid}'
                AND
                ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.RECORD_TYPE} = '${RECORD_TYPES.RETAILER_VISIT}'
                AND
                (CAST(${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.MOBILE__C} as TEXT) iLIKE '${searchField}%' OR ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.RETAILER_SHOP_NAME__C} iLIKE '${searchField}%')
                ORDER BY ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.CREATED_DATE} DESC
                LIMIT 20
              `;
              } else {
                qry = `
                  SELECT 
                  ${OBJECTKEYNAME.AT_SHOP__C},
                  ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.MOBILE__C},
                  ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.RETAILER_SHOP_NAME__C} as retailer_shop_name,
                  ${OBJECTKEYNAME.HIGH_MOVING_IIL_PRODUCTS__C},
                  ${OBJECTKEYNAME.COMMENTS__C},
                  TO_CHAR(${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.CREATED_DATE}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.CREATED_DATE},
                  ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.OWNER__C},
                  ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.HEROKU_ID__C},
                  ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.RECORD_TYPE}
                  FROM ${SCHEMA.SALESFORCE.VISIT__C}
                  LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.ACCOUNT__C}
                  WHERE
                  ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.OWNER__C} = '${sfid}'
                  AND
                  ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.RECORD_TYPE} = '${RECORD_TYPES.RETAILER_VISIT}'
                  ORDER BY ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.CREATED_DATE} DESC
                  LIMIT 20
                `;
              }
          
              return await client.query(qry);

        }
        catch(error){
            throw error;
        }
    },
    getRetailersById:async(sfid,herokuId)=>{
        try{
            const qry = `
      SELECT 
      ${OBJECTKEYNAME.AT_SHOP__C},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.MOBILE__C},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.RETAILER_SHOP_NAME__C} as retailer_shop_name,
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.CONTACT_PERSON__C},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.LICENSE_NUMBER__C},
      ${OBJECTKEYNAME.COMMENTS__C},
      ${OBJECTKEYNAME.FEEDBACK__C},
      TO_CHAR( ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.CREATED_DATE}, 'YYYY-MM-DD') as visit_date,
      TO_CHAR( ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.LAST_VISIT_DATE__C}, 'YYYY-MM-DD') as last_visit_date,
      ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.OWNER__C},
      ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.HEROKU_ID__C},
      ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.RECORD_TYPE},
      STRING_AGG(${SCHEMA.SALESFORCE.PRODUCT2}.${OBJECTKEYNAME.NAME}, ', ') as ${OBJECTKEYNAME.HIGH_MOVING_IIL_PRODUCTS__C},
      STRING_AGG(CAST(${SCHEMA.SALESFORCE.NEW_PRODUCT__C}.${OBJECTKEYNAME.PRODUCT__C} AS VARCHAR), ', ') as iilProductsSfids,
      STRING_AGG(CAST(${SCHEMA.SALESFORCE.NEW_PRODUCT__C}.${OBJECTKEYNAME.UNIT__C} AS VARCHAR), ', ') as iilProductsUnits,
      STRING_AGG(CAST(${SCHEMA.SALESFORCE.NEW_PRODUCT__C}.${OBJECTKEYNAME.QUANTITY__C} AS VARCHAR), ', ') as ${OBJECTKEYNAME.QUANTITY__C}
      FROM ${SCHEMA.SALESFORCE.VISIT__C}
      LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.ACCOUNT__C}
      LEFT JOIN ${SCHEMA.SALESFORCE.NEW_PRODUCT__C} ON ${SCHEMA.SALESFORCE.NEW_PRODUCT__C}.${OBJECTKEYNAME.VISIT__C__HEROKU_ID__C} = ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.HEROKU_ID__C}
      LEFT JOIN ${SCHEMA.SALESFORCE.PRODUCT2} ON ${SCHEMA.SALESFORCE.PRODUCT2}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.NEW_PRODUCT__C}.${OBJECTKEYNAME.PRODUCT__C}  
      WHERE
      ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.OWNER__C} = '${sfid}'
      AND
      ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.HEROKU_ID__C} = '${herokuId}'
      AND
      ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.RECORD_TYPE} = '${RECORD_TYPES.RETAILER_VISIT}'
      GROUP BY
      ${OBJECTKEYNAME.AT_SHOP__C},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.MOBILE__C},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.RETAILER_SHOP_NAME__C},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.CONTACT_PERSON__C},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.LICENSE_NUMBER__C},
      ${OBJECTKEYNAME.HIGH_MOVING_IIL_PRODUCTS__C},
      ${OBJECTKEYNAME.COMMENTS__C},
      ${OBJECTKEYNAME.FEEDBACK__C},
      ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.CREATED_DATE},
     ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.LAST_VISIT_DATE__C},
      ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.OWNER__C},
      ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.HEROKU_ID__C},
      ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.RECORD_TYPE}
    `;

    return  await client.query(qry);

        }
        catch(error){
            throw error;

        }
    },
    updateRetailerById:async(fieldUpdates,values)=>{
        try{
            const updateQuery = `UPDATE ${SCHEMA.SALESFORCE.VISIT__C}
    SET
      ${Object.keys(fieldUpdates)
        .map((fieldName, index) => `${fieldName} = $${index + 1}`)
        .join(',\n')}
    WHERE
      ${OBJECTKEYNAME.HEROKU_ID__C} = $${Object.keys(fieldUpdates).length + 1}
  `;
  return await client.query(updateQuery,values);


        }
        catch(error){
            throw error;
        }
    }

};
module.exports={
    retailerVisit
}