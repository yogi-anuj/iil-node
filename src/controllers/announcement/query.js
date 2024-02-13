const { client } = require("../../middleware/database/database");
const { OBJECTKEYNAME, SCHEMA } = require("../../utilities/constants");


const announcement = {
    getAnnouncments: async () => {
        try {
            const getQry = `
            SELECT
            ${OBJECTKEYNAME.NAME},
            ${OBJECTKEYNAME.DESCRIPTION__C},
            ${OBJECTKEYNAME.url__c},
            TO_CHAR(${OBJECTKEYNAME.CREATED_DATE}, 'YYYY-MM-DD HH:MM') as ${OBJECTKEYNAME.CREATED_DATE}
            FROM ${SCHEMA.SALESFORCE.ANNOUNCEMENT__c}
            WHERE
            ${OBJECTKEYNAME.IsDeleted} = false
            ORDER BY ${OBJECTKEYNAME.CREATED_DATE} DESC
            `;

            return await client.query(getQry);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = { announcement };