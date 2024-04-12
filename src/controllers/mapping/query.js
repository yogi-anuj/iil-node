const { client } = require("../../middleware/database/database");
const {
  USER_HIERARCHY,
  SCHEMA,
  OBJECTKEYNAME,
  RECORD_TYPES,
  RECORDS_PER_PAGE,
} = require("../../utilities/constants");
const { updateAttendanceStatus } = require("../attendance");

const Account = {
  updateAccount: async (fieldUpdates, values) => {
    try {
      const updateQuery = `UPDATE ${SCHEMA.SALESFORCE.ACCOUNT}
      SET
        ${Object.keys(fieldUpdates)
          .map((fieldName, index) => `${fieldName} = $${index + 1}`)
          .join(',\n')}
      WHERE
        ${OBJECTKEYNAME.HEROKU_ID__C} = $${values.length}`;

      return await client.query(updateQuery, values);
    }
    catch (error) {
      throw error;
    }
  },
  deleteAccountById: async (herokuId) => {
    try {
      const dltQry = `DELETE FROM ${SCHEMA.SALESFORCE.ACCOUNT} WHERE ${OBJECTKEYNAME.HEROKU_ID__C} = '${herokuId}'`;
      return await client.query(dltQry);
    } catch (error) {
      throw error;
    }
  },
  deleteCropById: async (herokuId) => {
    try {
      const deleteQuery = `DELETE FROM ${SCHEMA.SALESFORCE.CROP__C}  WHERE ${OBJECTKEYNAME.ACCOUNT__HEROKU_ID__C} = '${herokuId}'`;
      return await client.query(deleteQuery);
    }
    catch (error) {
      throw error;
    }
  },
  getAccountDetailsByMobileAndAccountType: async (mobile__c, accountType) => {
    try {
      const checkMobileQry = `
      SELECT ${OBJECTKEYNAME.MOBILE__C} FROM ${SCHEMA.SALESFORCE.ACCOUNT} WHERE ${OBJECTKEYNAME.MOBILE__C} = '${mobile__c}' AND ${OBJECTKEYNAME.RECORD_TYPE_ID} = '${accountType}'
    `;
      return await client.query(checkMobileQry);
    } catch (error) {
      throw error;
    }
  },
  getAllAccountDetailsByMobile: async (mobile__c) => {
    try {
      let queryDuplicate = `SELECT * FROM ${SCHEMA.SALESFORCE.ACCOUNT} WHERE ${OBJECTKEYNAME.MOBILE__C} = '${mobile__c}' LIMIT 1`;
      return await client.query(queryDuplicate);
    }
    catch (error) {
      throw error;
    }
  },
  getAccountDetailById: async (herokuId) => {
    try {
      const getQry = `
      SELECT * FROM ${SCHEMA.SALESFORCE.ACCOUNT} WHERE ${OBJECTKEYNAME.HEROKU_ID__C} = '${herokuId}'
    `;
      return await client.query(getQry);
    } catch (error) {
      throw error;
    }
  },
  getAccountIdByMobile: async (mobile__c, herokuId) => {
    try {
      const checkDuplicateMobileQry = `
      SELECT ${OBJECTKEYNAME.HEROKU_ID__C} FROM ${SCHEMA.SALESFORCE.ACCOUNT} WHERE ${OBJECTKEYNAME.MOBILE__C} = '${mobile__c}' AND ${OBJECTKEYNAME.HEROKU_ID__C} != '${herokuId}'
    `;
      return await client.query(checkDuplicateMobileQry);

    }
    catch (error) {
      throw error;
    }
  },
  getAccountDetailByEmail: async (email) => {
    try {
      const getQry = `SELECT ${OBJECTKEYNAME.EMAIL__C} FROM ${SCHEMA.SALESFORCE.ACCOUNT} WHERE ${OBJECTKEYNAME.EMAIL__C} = '${email}' AND ${OBJECTKEYNAME.RECORD_TYPE_ID} = '${RECORD_TYPES.DISTRIBUTOR}' LIMIT 1`;
      return await client.query(getQry);
    } catch (error) {
      throw error;
    }
  },
};


const distributorMapping = {




};

const retailerMapping = {
  // checkQuery: async (Mobile__c) => {
  //   try {
  //     const checkQry = `
  //     SELECT  ${OBJECTKEYNAME.MOBILE__C} FROM ${SCHEMA.SALESFORCE.ACCOUNT} WHERE ${OBJECTKEYNAME.MOBILE__C} = '${Mobile__c}' AND ${OBJECTKEYNAME.RECORD_TYPE_ID} = '${RECORD_TYPES.RETAILER}'
  //   `;

  //     return await client.query(checkQry);
  //   } catch (error) {
  //     throw error;
  //   }
  // },

};
const agriExpertMapping = {
  


};


const farmerMapping = {
  checkQuery: async (Mobile__c) => {
    try {
      const checkQry = `
      SELECT ${OBJECTKEYNAME.EMAIL__C}, ${OBJECTKEYNAME.MOBILE__C} FROM ${SCHEMA.SALESFORCE.ACCOUNT} WHERE ${OBJECTKEYNAME.MOBILE__C} = '${Mobile__c}' AND ${OBJECTKEYNAME.RECORD_TYPE_ID} = '${RECORD_TYPES.FARMER}'
    `;

      return await client.query(checkQry);
    } catch (error) {
      throw error;
    }
  },
};

module.exports = {
  distributorMapping,
  retailerMapping,
  farmerMapping,
  Account,
  agriExpertMapping
};
