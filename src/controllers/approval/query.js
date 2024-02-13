const { client } = require("../../middleware/database/database");
const { SCHEMA, OBJECTKEYNAME } = require("../../utilities/constants");
const { getUniqueId } = require("../../utilities/uniqueId");
const format = require('pg-format');


const Approval = {
    // insert approval record for expense
    expenseApproval: async (expenseHerokuId, userSfid, status) => {
        try {
            let qry = `
            INSERT INTO ${SCHEMA.SALESFORCE.APPROVAL__C} (
              ${OBJECTKEYNAME.Expense_Line_Item__c__Heroku_ID__c},
              ${OBJECTKEYNAME.HEROKU_ID__C},
              ${OBJECTKEYNAME.OWNER__C},
              ${OBJECTKEYNAME.STATUS__C}
            ) VALUES (
              '${expenseHerokuId}',
              '${getUniqueId()}',
              '${userSfid}',          
              '${status}'
            )
          `;
            return await client.query(qry);
        } catch (error) {
            throw error;
        }
    },
    // insert multiple expense approval records
    insertMultipleExpenseForApproval: async (data) => {
        try {
            const qry = format(
                `
                    INSERT INTO ${SCHEMA.SALESFORCE.APPROVAL__C} (
                      ${OBJECTKEYNAME.Expense_Line_Item__c__Heroku_ID__c},
                      ${OBJECTKEYNAME.HEROKU_ID__C},
                      ${OBJECTKEYNAME.OWNER__C},
                      ${OBJECTKEYNAME.STATUS__C}
                    )
                    VALUES %L returning *
                    `,
                data
            );
            return await client.query(qry);
        } catch (error) {
            throw error;
        }
    },
    // approve multiple expense records
    approveMultipleExpenses: async(expenseHerokuIds, status, reason, userSfid) => {
        try {
            const updateApprovalQry = `
                UPDATE
                ${SCHEMA.SALESFORCE.APPROVAL__C}
                SET
                ${OBJECTKEYNAME.STATUS__C} = '${status ? EXPENSE_STATUS.APPROVED : EXPENSE_STATUS.REJECTED}',
                ${OBJECTKEYNAME.Approved_By__c} = '${userSfid}',
                ${OBJECTKEYNAME.COMMENTS__C} = '${reason}'
                WHERE ${OBJECTKEYNAME.HEROKU_ID__C} IN (${expenseHerokuIds.map(id => { return `'${id}'` })}) RETURNING *
            `
            await client.query(updateApprovalQry);
        } catch (error) {
            throw error;
        }
    },
    // approve expense by id
    approveExpenseById: async(expenseHerokuId, status, reason, userSfid) => {
        try {
            const updateApprovalQry = `
            UPDATE
            ${SCHEMA.SALESFORCE.APPROVAL__C}
            SET
            ${OBJECTKEYNAME.STATUS__C} = '${status ? EXPENSE_STATUS.APPROVED : EXPENSE_STATUS.REJECTED}',
            ${OBJECTKEYNAME.Approved_By__c} = '${userSfid}',
            ${OBJECTKEYNAME.COMMENTS__C} = '${reason}'
            WHERE ${OBJECTKEYNAME.HEROKU_ID__C} = '${expenseHerokuId}'
            `
            return await client.query(updateApprovalQry);
        } catch (error) {
            throw error;
        }
    },
}

module.exports = {
    Approval
}