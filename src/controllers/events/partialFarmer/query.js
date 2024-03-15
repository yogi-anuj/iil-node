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
const FarmerForEvent={
   
    addFarmerForEventDetails:async(values)=>{
        try{
            let qry=`INSERT INTO 
            ${SCHEMA.SALESFORCE.NEW_FARMER__C}
            (
                ${OBJECTKEYNAME.MOBILE__C},
                ${OBJECTKEYNAME.PINCODE__C},
                ${OBJECTKEYNAME.FARMER_NAME__C},
                ${OBJECTKEYNAME.LAST_NAME},
                ${OBJECTKEYNAME.STATE__C},
                ${OBJECTKEYNAME.DISTRICT__C},
                ${OBJECTKEYNAME.SUB_DISTRICT__C},
                ${OBJECTKEYNAME.VILLAGE__C},
                ${OBJECTKEYNAME.IS_PARTIAL_FARMER__c},
                ${OBJECTKEYNAME.RECORD_TYPE},
                ${OBJECTKEYNAME.OWNER__C},
                ${OBJECTKEYNAME.HEROKU_ID__C},
                ${OBJECTKEYNAME.EVENT__C__HEROKU_ID__C}
)
VALUES(
    $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
)
RETURNING heroku_id__c
`;
return await client.query(qry,values);


        }
        catch(error){
            throw error;
        }
    },
    getFarmerForEventByEventId:async(searchField,eventId)=>{
        try{
            let selectQry=``;
            if(searchField && searchField.length>2){
                selectQry+=`SELECT
                ${OBJECTKEYNAME.MOBILE__C},
                ${OBJECTKEYNAME.PINCODE__C},
                ${OBJECTKEYNAME.FARMER_NAME__C},
                ${OBJECTKEYNAME.VILLAGE__C},
                ${OBJECTKEYNAME.ACREAGE__C},
                ${OBJECTKEYNAME.CROP__C},
                ${OBJECTKEYNAME.PICTURE__C},
                TO_CHAR(${OBJECTKEYNAME.CREATED_DATE}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.CREATED_DATE},
                ${OBJECTKEYNAME.HEROKU_ID__C},
                ${OBJECTKEYNAME.EVENT__C__HEROKU_ID__C}
                FROM
                ${SCHEMA.SALESFORCE.NEW_FARMER__C}
                WHERE
                ${OBJECTKEYNAME.EVENT__C__HEROKU_ID__C} = '${eventId}'
                AND
                (${OBJECTKEYNAME.MOBILE__C} iLIKE '${searchField}%' OR ${OBJECTKEYNAME.FARMER_NAME__C} iLIKE '${searchField}%')
                ORDER BY ${OBJECTKEYNAME.CREATED_DATE} DESC
                LIMIT 20`;
            }
            else{
                selectQry += `
                SELECT
                ${OBJECTKEYNAME.MOBILE__C},
                ${OBJECTKEYNAME.PINCODE__C},
                ${OBJECTKEYNAME.FARMER_NAME__C},
                ${OBJECTKEYNAME.VILLAGE__C},
                ${OBJECTKEYNAME.ACREAGE__C},
                ${OBJECTKEYNAME.CROP__C},
                ${OBJECTKEYNAME.PICTURE__C},
                TO_CHAR(${OBJECTKEYNAME.CREATED_DATE}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.CREATED_DATE},
                ${OBJECTKEYNAME.HEROKU_ID__C},
                ${OBJECTKEYNAME.EVENT__C__HEROKU_ID__C}
                FROM
                ${SCHEMA.SALESFORCE.NEW_FARMER__C}
                WHERE
                ${OBJECTKEYNAME.EVENT__C__HEROKU_ID__C} = '${eventId}'
                ORDER BY ${OBJECTKEYNAME.CREATED_DATE} DESC
                LIMIT 20
            `
            }
            return await client.query(selectQry);

        }
        catch(error){
            throw error;
        }
    },
    getPartialFarmers:async(searchField,pageNumber,profile__c)=>{
        try{
            let qry = `
            SELECT
            ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SFID},
            ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.MOBILE__C},
            ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.PINCODE__C},
            ${OBJECTKEYNAME.FARMER_NAME__C},
            ${OBJECTKEYNAME.Farmer_Category__c},
            ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.HEROKU_ID__C},
            TO_CHAR(${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.CREATED_DATE}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.CREATED_DATE},
            ${OBJECTKEYNAME.VILLAGE_NAME__C}
            FROM
            ${SCHEMA.SALESFORCE.USER}`;
            if(profile__c==USER_HIERARCHY.SI__user){
                qry+=`
                LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} ON ${SCHEMA.SALESFORCE.TERRITORY__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
              LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = ${SCHEMA.SALESFORCE.TERRITORY__C}.${OBJECTKEYNAME.SFID}
             LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
            LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
                `;
            }
            if(profile__c==USER_HIERARCHY.AM__user){
                qry+=`
                LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
                LEFT JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
                LEFT JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
                LEFT JOIN ${SCHEMA.SALESFORCE.ACCOUNT} ON ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
                LEFT JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.ACCOUNT}.${OBJECTKEYNAME.VILLAGE__C}
                `;
            }
            if(profile__c==USER_HIERARCHY.RM__user){
                qry+=`
                
                `;
            }


        }
        catch(error){
            throw error;
        }
    }

};
module.exports={
    FarmerForEvent
};