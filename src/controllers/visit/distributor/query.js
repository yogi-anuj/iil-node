const { client } = require("../../../middleware/database/database");
const { SCHEMA, OBJECTKEYNAME, USER_HIERARCHY, RECORD_TYPES,DISTRIBUTOR_APPROVAL_STATUS ,STATUS} = require("../../../utilities/constants");
const format = require('pg-format');
const { getUniqueId } = require("../../../utilities/uniqueId");
const distributorVisit={
    addDistributorVisitDetails:async(values)=>{
        try{
        let insertQuery = `INSERT INTO ${SCHEMA.SALESFORCE.VISIT__C} 
        (${OBJECTKEYNAME.AT_SHOP__C},
          ${OBJECTKEYNAME.ACCOUNT__C},
          ${OBJECTKEYNAME.MOBILE__C},
          ${OBJECTKEYNAME.DISTRIBUTOR_SHOP_NAME__C},
          ${OBJECTKEYNAME.CURRENT_INVENTORIES__C},
          ${OBJECTKEYNAME.MARKET_INSIGHTS__C},
          ${OBJECTKEYNAME.COLLECTION_TARGET_DISCUSSION__C},
          ${OBJECTKEYNAME.SALES_TARGET_DISCUSSION__C},
          ${OBJECTKEYNAME.FOCUS_PRODUCT_DISCUSSION__C},
          ${OBJECTKEYNAME.MARKET_DEVELOPMENT__C},
          ${OBJECTKEYNAME.DISTRIBUTOR_FEEDBACK__C},
          ${OBJECTKEYNAME.COMMENTS__C},
          ${OBJECTKEYNAME.Geo_Location__Latitude__s},
          ${OBJECTKEYNAME.Geo_Location__Longitude__s},
          ${OBJECTKEYNAME.OWNER__C},
          ${OBJECTKEYNAME.HEROKU_ID__C},
          ${OBJECTKEYNAME.CONTACT_PERSON__C},
          ${OBJECTKEYNAME.RECORD_TYPE}
          ) VALUES 
        (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18 
          ) RETURNING *`;
       return await client.query(insertQuery, values);
        }
        catch(error){
            throw error;
        }

    
    },
    insertProductDetails:async(sfid,quantity,unit,uniqueId)=>{
        try{
            const insertProduct = `INSERT INTO ${SCHEMA.SALESFORCE.NEW_PRODUCT__C} (
                ${OBJECTKEYNAME.PRODUCT__C},
                ${OBJECTKEYNAME.QUANTITY__C},
                ${OBJECTKEYNAME.UNIT__C},
                ${OBJECTKEYNAME.HEROKU_ID__C},
                ${OBJECTKEYNAME.VISIT__C__HEROKU_ID__C})
                    VALUES (
                      '${sfid}',
                      '${quantity}',
                      '${unit}',
                      '${getUniqueId()}',
                      '${uniqueId}')`;
               await client.query(insertProduct);
               

        }
        catch(error){
            throw error;
        }

    }

};


module.exports={
    distributorVisit,

}