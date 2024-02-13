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
} 

module.exports = {
    UserModal
};