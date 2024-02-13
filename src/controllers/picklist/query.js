const { client } = require("../../middleware/database/database");
const { SCHEMA, OBJECTKEYNAME } = require("../../utilities/constants");


const picklist = {
    getMasterPicklist: async () => {
        const qry = `
        SELECT 
        ${SCHEMA.PUBLIC.PICKLIST_CATEGORIES}.${OBJECTKEYNAME.NAME}, 
        ${SCHEMA.PUBLIC.PICKLISTS}.${OBJECTKEYNAME.NAME} as ${OBJECTKEYNAME.NAME__C}, 
        ${SCHEMA.PUBLIC.PICKLISTS}.${OBJECTKEYNAME.Agri_inputs_exp_per_acre}, 
        ${SCHEMA.PUBLIC.PICKLIST_CATEGORIES}.${OBJECTKEYNAME.CATEGORIEID}, 
        ${SCHEMA.PUBLIC.PICKLIST_CATEGORIES}.${OBJECTKEYNAME.NAME_TAG} 
        FROM ${SCHEMA.PUBLIC.PICKLIST_CATEGORIES}
        INNER JOIN ${SCHEMA.PUBLIC.PICKLISTS} ON
        ${SCHEMA.PUBLIC.PICKLISTS}.${OBJECTKEYNAME.CATEGORIEID} = ${SCHEMA.PUBLIC.PICKLIST_CATEGORIES}.${OBJECTKEYNAME.CATEGORIEID}
        ORDER BY ${SCHEMA.PUBLIC.PICKLISTS}.${OBJECTKEYNAME.NAME};
        `;

        return await client.query(qry);
    }
}

module.exports = {
    picklist
}