const { client } = require("../../middleware/database/database");
const { OBJECTKEYNAME, SCHEMA } = require("../../utilities/constants");


const UserModal = {
    // get hr policy for a user
    getHrPolicy: async(userSfid) => {
        try {
            const getQry = `
            SELECT ${OBJECTKEYNAME.HR_Policy_Profile__c} FROM ${SCHEMA.SALESFORCE.USER} WHERE ${OBJECTKEYNAME.SFID} = '${userSfid}'
            `
            return await client.query(getQry);
        } catch (error) {
            throw error;
        }
    },
    updateScore:async(score,userId)=>{
        try{

            const updatedQry = `
            UPDATE ${SCHEMA.SALESFORCE.USER} 
            SET ${OBJECTKEYNAME.Total_Points__c} = COALESCE(${OBJECTKEYNAME.Total_Points__c}, 0) + ${score} 
           WHERE ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.SFID}='${userId}'
         `
          await client.query(updatedQry)
        }
        catch(error){
            throw error;

        }
    }
} 

module.exports = {
    UserModal
};