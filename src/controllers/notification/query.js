const { client } = require("../../middleware/database/database");
const { SCHEMA, NOTIFICATION_FOR, OBJECTKEYNAME, } = require("../../utilities/constants");
const { getUniqueId } = require("../../utilities/uniqueId");


const Notification = {
    insertNotification : async(notificationType, message, ownerSfid, managerSfid, notificationHeader) => {
        try {
            // query
            const qry = `
            INSERT into ${SCHEMA.PUBLIC.NOITIFICATIONS} ("${OBJECTKEYNAME.OBJECTID}", "${OBJECTKEYNAME.MESSAGE_CREATED}", "${OBJECTKEYNAME.MESSAGE_FOR}", "${OBJECTKEYNAME.MESSAGE}",  "${OBJECTKEYNAME.MESSAGE_FROM}", "${OBJECTKEYNAME.MESSAGE_TO}", "${OBJECTKEYNAME.MESSAGE_HEADER}")  VALUES('${getUniqueId()}', '${new Date().toISOString()}', '${notificationType}','${message}','${ownerSfid}','${managerSfid}','${notificationHeader}')
            RETURNING *
            `;
            let response = await client.query(qry);
            return  response.rows[0].objectId;
        } catch (error) {
            throw error;
        }
    },
    notificationById:async(notificationId)=>{
        try{
            let qry =`Select * from ${SCHEMA.PUBLIC.NOITIFICATIONS} where "${OBJECTKEYNAME.OBJECTID}" = '${notificationId}'`
             return await client.query(qry);

        }
        catch(error){
            throw error;
        }
    },
    notificationSpecific:async(notificationFor)=>{
        try{
            let qry=`Select * from ${SCHEMA.PUBLIC.USER} Where sfid='${notificationFor}'  `  
            return await client.query(qry);

        }
        catch(error){
            throw error;
        }
    },
    notificationFarmer:async()=>{
        try{
            let qry=`Select * from ${SCHEMA.PUBLIC.USER} Where userType=${NOTIFICATION_FOR.FARMERS}  && loginStatus=${true} `  
            return await client.query(qry);

        }
        catch(error){
            throw error;
        }
    }

}

module.exports = {Notification}