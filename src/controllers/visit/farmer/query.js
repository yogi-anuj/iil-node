const { client } = require("../../../middleware/database/database");
const { SCHEMA, OBJECTKEYNAME,RECORD_TYPES } = require("../../../utilities/constants");
const { formatDate } = require("../../../utilities/customDate");
const { getUniqueId } = require("../../../utilities/uniqueId");
const format = require('pg-format');

const farmerVisit={
    insertFarmerVisit: async(VALUES)=>{
        try{
         const qry=  `INSERT into ${SCHEMA.SALESFORCE.VISIT__C} 
         (
            ${OBJECTKEYNAME.ACCOUNT__C},
            ${OBJECTKEYNAME.MOBILE__C},
            ${OBJECTKEYNAME.Last_Visit_Brand},
            ${OBJECTKEYNAME.LAST_VISIT_DATE__C},
            ${OBJECTKEYNAME.OTHER_BRAND__C},
            ${OBJECTKEYNAME.COMMENTS__C},
            ${OBJECTKEYNAME.FEEDBACK__C},
            ${OBJECTKEYNAME.ON_FIELD__C},
            ${OBJECTKEYNAME.CONVERSION__C},
           ${OBJECTKEYNAME.Geo_Location__Longitude__s},
           ${OBJECTKEYNAME.Geo_Location__Latitude__s},
           ${OBJECTKEYNAME.SFID},
           ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C},
           ${OBJECTKEYNAME.FO_NAME__C},
           ${OBJECTKEYNAME.FARMER_NAME__C},
           ${OBJECTKEYNAME.FATHER_NAME__C},
           ${OBJECTKEYNAME.EMAIL__C},
           ${OBJECTKEYNAME.PICTURE__C},
           ${OBJECTKEYNAME.RECORD_TYPE}

         )
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
         ` ;
        await client.query(qry,VALUES);
          

        }
        catch(error){
            throw error;
        }

    },
    insertProductDetails:async(sfid,name,quantity,unit,isProduct,otherBrandName,uniqueId)=>{
        try{
            const insertProduct = `INSERT INTO ${SCHEMA.SALESFORCE.NEW_PRODUCT__C} (
                ${OBJECTKEYNAME.PRODUCT__C},
                ${OBJECTKEYNAME.NAME__C},
                ${OBJECTKEYNAME.QUANTITY__C},
                ${OBJECTKEYNAME.UNIT__C},
                ${OBJECTKEYNAME.isProduct__c},
                ${OBJECTKEYNAME.OTHER_BRAND__C},
               
                ${OBJECTKEYNAME.HEROKU_ID__C},
                ${OBJECTKEYNAME.VISIT__C__HEROKU_ID__C})
                    VALUES (
                      '${sfid}',
                      '${name}',
                      '${quantity}',
                      '${unit}',
                      '${isProduct}',
                      '${otherBrandName}',
                      '${getUniqueId()}',
                      '${uniqueId}')`;
               await client.query(insertProduct);
               

        }
        catch(error){
            throw error;
        }

    },
    insertCropDetails:async(plot_area__c, Pest_Type__c, pest_Name__c, crop_Name__c,uniqueId)=>{
        try{
            const insertCrop = `INSERT INTO ${SCHEMA.SALESFORCE.CROP__C} (
                ${OBJECTKEYNAME.Plot_Area__c},
                ${OBJECTKEYNAME.PEST_TYPE__C},
                ${OBJECTKEYNAME.PEST_NAME__C},
                ${OBJECTKEYNAME.CROP__C},
                ${OBJECTKEYNAME.Heroku_ID__c},
                ${OBJECTKEYNAME.VISIT__C__HEROKU_ID__C})
               
              
                    VALUES (
                      '${plot_area__c}',
                      '${Pest_Type__c}',
                      '${pest_Name__c}',
                      '${crop_Name__c}',
                     
                      '${getUniqueId()}',
                      '${uniqueId}')`;
               await client.query(insertProduct);
              

        }
       
        catch(error){
            throw error;
        }

    },
    getBrandDetails:async(sfid,herokuId)=>{
        try{
            const qryBrand = `
    SELECT
    STRING_AGG(${SCHEMA.SALESFORCE.NEW_PRODUCT__C}.${OBJECTKEYNAME.NAME__C} || ' ' || ${SCHEMA.SALESFORCE.NEW_PRODUCT__C}.${OBJECTKEYNAME.QUANTITY__C} ||'/' || ${SCHEMA.SALESFORCE.NEW_PRODUCT__C}.${OBJECTKEYNAME.UNIT__C}, ', ') as ${OBJECTKEYNAME.BRAND__C
      }
  FROM ${SCHEMA.SALESFORCE.VISIT__C}
  LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.VISIT__C
      }.${OBJECTKEYNAME.ACCOUNT__C}
  LEFT JOIN ${SCHEMA.SALESFORCE.NEW_PRODUCT__C} ON ${SCHEMA.SALESFORCE.NEW_PRODUCT__C}.${OBJECTKEYNAME.VISIT__C__HEROKU_ID__C
      } = ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.HEROKU_ID__C}
  WHERE
    ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.OWNER__C} = '${sfid}'
    AND
    ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.HEROKU_ID__C} = '${herokuId}'
    AND
    ${SCHEMA.SALESFORCE.NEW_PRODUCT__C}.${OBJECTKEYNAME.isProduct__c} = ${false}
    AND
    ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.RECORD_TYPE} = '${RECORD_TYPES.FARMER_VISIT}'
  GROUP BY
    ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.RECORD_TYPE};
  `;
   return await client.query(qryBrand);

        }
        catch(error){
            throw error;
        }
    },
    getFarmerVisitDetailsById:async(sfid,herokuId)=>{
        try{
            const qry = `
      SELECT
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.MOBILE__C},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.FARMER_NAME__C} as farmer_name,
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.FATHER_NAME__C} as father_name,
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.EMAIL__C},
      ${OBJECTKEYNAME.Plot_Area__c},
      ${OBJECTKEYNAME.COMMENTS__C},
      ${OBJECTKEYNAME.FEEDBACK__C},
      ${OBJECTKEYNAME.ON_FIELD__C},
      TO_CHAR(${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.CREATED_DATE
      }, 'YYYY-MM-DD') as visit_date,
      ${OBJECTKEYNAME.FO_NAME__C},
      ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.PICTURE__C} as pictureUrl,
      ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.CROP__C},
      ${OBJECTKEYNAME.PEST_TYPE__C},
      ${OBJECTKEYNAME.PEST_NAME__C},
      ${OBJECTKEYNAME.IIL_PRODUCT_PROMOTED__C},
      ${OBJECTKEYNAME.CONVERSION__C},
      ${OBJECTKEYNAME.PRODUCT_BOUGHT__C},
      ${OBJECTKEYNAME.PRODUCT_BOUGHT_FROM__C},
      ${OBJECTKEYNAME.COMMENTS__C},
      ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.ACCOUNT__C},
      ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.OWNER__C},
      ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.HEROKU_ID__C},
      ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.RECORD_TYPE},
      STRING_AGG(${SCHEMA.SALESFORCE.PRODUCT2}.${OBJECTKEYNAME.NAME} || ' ' || ${SCHEMA.SALESFORCE.NEW_PRODUCT__C}.${OBJECTKEYNAME.QUANTITY__C} ||'/' || ${SCHEMA.SALESFORCE.NEW_PRODUCT__C}.${OBJECTKEYNAME.UNIT__C}, ', ') as ${OBJECTKEYNAME.PRODUCT_INTERESTED__C},
      STRING_AGG(${SCHEMA.SALESFORCE.NEW_PRODUCT__C}.${OBJECTKEYNAME.PRODUCT__C}, ', ') as productInterestedSfids
    FROM ${SCHEMA.SALESFORCE.VISIT__C}
    LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SFID
      } = ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.ACCOUNT__C}
    LEFT JOIN ${SCHEMA.SALESFORCE.NEW_PRODUCT__C} ON ${SCHEMA.SALESFORCE.NEW_PRODUCT__C}.${OBJECTKEYNAME.VISIT__C__HEROKU_ID__C
      } = ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.HEROKU_ID__C}
    LEFT JOIN ${SCHEMA.SALESFORCE.PRODUCT2} ON ${SCHEMA.SALESFORCE.PRODUCT2}.${OBJECTKEYNAME.SFID
      } = ${SCHEMA.SALESFORCE.NEW_PRODUCT__C}.${OBJECTKEYNAME.PRODUCT__C}
    WHERE
      ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.OWNER__C} = '${sfid}'
      AND
      ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.HEROKU_ID__C} = '${herokuId}'
      AND
      ${SCHEMA.SALESFORCE.NEW_PRODUCT__C}.${OBJECTKEYNAME.isProduct__c} = ${true}
      AND
      ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.RECORD_TYPE} = '${RECORD_TYPES.FARMER_VISIT}'
    GROUP BY
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.MOBILE__C},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.FARMER_NAME__C},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.FATHER_NAME__C},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.EMAIL__C},
      ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.CROP__C},
      ${OBJECTKEYNAME.Plot_Area__c},
      ${OBJECTKEYNAME.COMMENTS__C},
      ${OBJECTKEYNAME.FEEDBACK__C},
      ${OBJECTKEYNAME.ON_FIELD__C},
      ${OBJECTKEYNAME.FO_NAME__C},
      ${OBJECTKEYNAME.PEST_TYPE__C},
      ${OBJECTKEYNAME.PEST_NAME__C},
      ${OBJECTKEYNAME.IIL_PRODUCT_PROMOTED__C},
      ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.PICTURE__C},
      ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.CREATED_DATE},
      ${OBJECTKEYNAME.CONVERSION__C},
      ${OBJECTKEYNAME.PRODUCT_BOUGHT__C},
      ${OBJECTKEYNAME.PRODUCT_BOUGHT_FROM__C},
      ${OBJECTKEYNAME.COMMENTS__C},
      ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.ACCOUNT__C},
      ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.OWNER__C},
      ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.HEROKU_ID__C},
      ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.FATHER_NAME__C},
      ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.RECORD_TYPE};
    `;
    return  await client.query(qry);

    

        }
        catch(error){
            throw error;
        }
    },
    lastVisitDetails:async(sfid,result)=>{
        try{
            const today = formatDate();
            const lastVisitQry = `
    SELECT 
      ${OBJECTKEYNAME.COMMENTS__C} as last_visit_comments,
      ${OBJECTKEYNAME.HEROKU_ID__C} as herokuId,
      ${OBJECTKEYNAME.CROP__C} as last_visit_crop,
      ${OBJECTKEYNAME.PEST_TYPE__C} as last_visit_pest_type,
      ${OBJECTKEYNAME.BRAND__C} as last_visit_brand,
      TO_CHAR(${OBJECTKEYNAME.CREATED_DATE}, 'YYYY-MM-DD') as last_visit_date,
      ${OBJECTKEYNAME.Plot_Area__c} as last_visit_plot_area
    FROM ${SCHEMA.SALESFORCE.VISIT__C} 
    WHERE 
      ${OBJECTKEYNAME.LAST_VISIT_DATE__C} <= '${today}'
      AND
      ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.OWNER__C} = '${sfid}'
      AND
      ${SCHEMA.SALESFORCE.VISIT__C}.${OBJECTKEYNAME.ACCOUNT__C} = '${result.rows[0].account__c}'
    ORDER BY ${OBJECTKEYNAME.CREATED_DATE} DESC
    OFFSET 1
    LIMIT 1
  `;
  return await client .query(lastVisitQry);

        }
        catch(error){
            throw error;
        }
    },
    getCropDetails:async(herokuId)=>{
        try{
            const cropQry = `
            SELECT 
              ${OBJECTKEYNAME.PEST_NAME__C},
              ${OBJECTKEYNAME.CROP__C} as crop_name__c,
              ${OBJECTKEYNAME.PEST_TYPE__C},
              ${OBJECTKEYNAME.Plot_Area__c}
            FROM ${SCHEMA.SALESFORCE.CROP__C} 
            WHERE 
              ${SCHEMA.SALESFORCE.CROP__C}.${OBJECTKEYNAME.OWNER__C} = '${herokuId}'
          `;
          return await client.query(cropQry);

        }
        catch(error){
            throw error;
        }
    },
    updateFarmerVisitDetails:async(fieldUpdates,values)=>{
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
    },
    updateProductData:async(insertData)=>{
        try{
            const qry = format(
                `INSERT INTO ${SCHEMA.SALESFORCE.NEW_PRODUCT__C} (
                  ${OBJECTKEYNAME.PRODUCT__C},
                  ${OBJECTKEYNAME.NAME__C},
                  ${OBJECTKEYNAME.QUANTITY__C},
                  ${OBJECTKEYNAME.UNIT__C},
                  ${OBJECTKEYNAME.isProduct__c},
                  ${OBJECTKEYNAME.OTHER_BRAND__C},
                  ${OBJECTKEYNAME.HEROKU_ID__C},
                  ${OBJECTKEYNAME.VISIT__C__HEROKU_ID__C})
                  VALUES %L returning *
                  `,
                insertData
              );
              await client.query(qry);


        }
        catch(error){
            throw error;
        }
    },
    updateCropData:async(insertCropData)=>{
        try{
            const insertCrop = format(
                `INSERT INTO ${SCHEMA.SALESFORCE.CROP__C} (
                ${OBJECTKEYNAME.Plot_Area__c},
                ${OBJECTKEYNAME.Pest_Type_c__c},
                ${OBJECTKEYNAME.Pest_Name_c__c},
                ${OBJECTKEYNAME.CROP__C},
                ${OBJECTKEYNAME.HEROKU_ID__C},
                ${OBJECTKEYNAME.VISIT__C__HEROKU_ID__C})
                    VALUES %L returning *`
                    , insertCropData
                    );
                    await client.query(insertCrop);


        }
        catch(error){
            throw error;
        }
    },
    getCropsById:async(farmerHerokuId)=>{
        try{
            const cropsQry = `
    SELECT 
    ${OBJECTKEYNAME.SEASON__C},
    ${OBJECTKEYNAME.CROP__C},
    ${OBJECTKEYNAME.ACREAGES__C},
    ${OBJECTKEYNAME.AgriInputs_Exp_per_Acre__c},
    ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C},
    ${OBJECTKEYNAME.Irrigation__c},
    ${OBJECTKEYNAME.Other_Irrigation_Method__c}
    FROM ${SCHEMA.SALESFORCE.CROP__C}
    WHERE
    ${SCHEMA.SALESFORCE.CROP__C}.${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C} = '${farmerHerokuId}'
    `

    return await client.query(cropsQry);

        }
        catch(error){
            throw error;
        }
    }

};
module.exports={
    farmerVisit
}