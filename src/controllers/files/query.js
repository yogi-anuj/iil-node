const { client } = require("../../middleware/database/database");
const { OBJECTKEYNAME, SCHEMA } = require("../../utilities/constants");
const format = require('pg-format');


const Files = {
    // files for a particular account
    getAccountsFileDetailById: async (herokuId) => {
        try {
            const Files_Qry = `
            SELECT 
            ${OBJECTKEYNAME.NAME__C},
            ${OBJECTKEYNAME.PICTURE__C}
            FROM ${SCHEMA.SALESFORCE.FILE__C}
            WHERE ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C} = '${herokuId}'
            `
            return await client.query(Files_Qry);
        } catch (error) {
            throw error;
        }
    },
    // delete file for expense
    deleteExpenseFileDetailById: async (herokuId) => {
        try {
            const deleteFileRecords = `DELETE FROM ${SCHEMA.SALESFORCE.FILE__C} WHERE ${OBJECTKEYNAME.Expense_Line_Item__r__Heroku_ID__c} = '${herokuId}'`;
            await client.query(deleteFileRecords);
        } catch (error) {
            throw error;
        }
    },
    // insert multiple file for expense
    insertMultipleExpenseFiles: async (insertData) => {
        try {
            const fileInsertQry = format(
                `
                INSERT INTO ${SCHEMA.SALESFORCE.FILE__C} (
                    ${OBJECTKEYNAME.NAME__C},
                    ${OBJECTKEYNAME.PICTURE__C},
                    ${OBJECTKEYNAME.Expense_Line_Item__r__Heroku_ID__c},
                    ${OBJECTKEYNAME.HEROKU_ID__C}
                )
                VALUES %L returning *
                `,
                insertData
            );
            return await client.query(fileInsertQry);
        } catch (error) {
            throw error;
        }
    },
    // get expense files
    getExpenseFiles: async(expenseId) => {
        try {
            const getUrlQry = `
            SELECT 
            ${OBJECTKEYNAME.PICTURE__C} as url,
            ${OBJECTKEYNAME.NAME__C}
            FROM ${SCHEMA.SALESFORCE.FILE__C} WHERE ${OBJECTKEYNAME.Expense_Line_Item__r__Heroku_ID__c} = '${expenseId}'
            `;

            return await client.query(getUrlQry);
        } catch (error) {
            throw error;
        }
    },
}

module.exports = {
    Files
}