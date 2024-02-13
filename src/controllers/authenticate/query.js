const { client } = require("../../middleware/database/database");
const { SCHEMA, OBJECTKEYNAME, MESSAGE, API_END_POINT } = require("../../utilities/constants");
const { responseBody } = require("../../utilities/customResponse");
const { getUniqueId } = require("../../utilities/uniqueId");

const user = {
    findUserByMobileForOTPGeneration: async (mobile) => {
        try {
            if (!mobile) {
                return "Missing params from find user by mobile"
            }
            let query = `SELECT ${OBJECTKEYNAME.SFID}, ${OBJECTKEYNAME.PROFILE__C}, ${OBJECTKEYNAME.ACTIVE} FROM ${SCHEMA.SALESFORCE.USER} WHERE ${OBJECTKEYNAME.MOBILE__C} = '${mobile}' LIMIT 1`;
            return await client.query(query);
        } catch (error) {
            throw error;
        }
    },
    storeOtp: async (otp, userId) => {
        try {
            if (!otp) {
                return "Missing params from store otp";
            }
            let updateQry = `
            UPDATE ${SCHEMA.SALESFORCE.USER}
            SET
            ${OBJECTKEYNAME.OTP__c} = '${otp}'
            WHERE
            ${OBJECTKEYNAME.SFID} = '${userId}'
            `;
            return await client.query(updateQry);

        } catch (error) {
            throw error;
        }
    },
    findUserByMobileForOTPVerification: async (mobile) => {
        try {
            if (!mobile) {
                return "Missing params from otp verification"
            }

            let query = `SELECT 
            ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.MOBILE__C} ,
            ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.NAME__C} ,
            ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.EMAIL__C} ,
            ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Plant_Master__c} ,
            ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.HR_Policy_Profile__c} ,
            ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.ACTIVE} ,
            ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.SFID} ,
            ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.PROFILE__C} ,
            ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c} ,
            ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping2__c} ,
            ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Total_Points__c} ,
            ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Application_version_name__c} ,
            ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Platform_Name__c} ,
            ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Device_Name__c} ,
            ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Fcm_token__c} ,
            ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.HR_Policy_Profile__c} ,
            ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.OTP__c} ,
            expenseApprover.${OBJECTKEYNAME.NAME__C} as expenseApproverName ,
            expenseApprover.${OBJECTKEYNAME.SFID} as expenseApproverSfid
            FROM ${SCHEMA.SALESFORCE.USER} 
            LEFT JOIN ${SCHEMA.SALESFORCE.USER} as expenseApprover on expenseApprover.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Expense_Approver__c}
            WHERE 
            ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.MOBILE__C} = '${mobile}' 
            LIMIT 1`;

            return await client.query(query);
        } catch (error) {
            throw error;
        }
    },
    updateDeviceData: async ({ applicationVersionName, deviceId, deviceName, deviceOsVersion, platformName, fcmToken, mobile }) => {
        try {
            if (!mobile) {
                return "Missing params from device updation";
            }
            // device data updation in user profile.
            const updateDeviceDataQry = `
            UPDATE ${SCHEMA.SALESFORCE.USER} 
            SET 
            ${OBJECTKEYNAME.Application_version_name__c} = '${applicationVersionName || ''}', 
            ${OBJECTKEYNAME.Device_Id__c} = '${deviceId || ''}',
            ${OBJECTKEYNAME.Device_Name__c} = '${deviceName || ''}', 
            ${OBJECTKEYNAME.Device_OS_version__c} = '${deviceOsVersion || ''}', 
            ${OBJECTKEYNAME.Platform_Name__c} = '${platformName || ''}',
            ${OBJECTKEYNAME.Fcm_token__c} = '${fcmToken || ''}'
            WHERE
            ${OBJECTKEYNAME.MOBILE__C} = '${mobile}'
            `;
            return await client.query(updateDeviceDataQry);

        } catch (error) {
            throw error;
        }
    },
    removeUsedOtp: async (sfId) => {
        try {
            if (!sfId) {
                return responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.VERIFY_OTP);
            }
            // set empty otp
            const removeUsedOtpQry = `
            UPDATE ${SCHEMA.SALESFORCE.USER} 
            SET 
            ${OBJECTKEYNAME.OTP__c} = ''
            WHERE
            ${OBJECTKEYNAME.SFID} = '${sfId}'
            `;
            await client.query(removeUsedOtpQry);

            return responseBody(MESSAGE.UPDATESUCCESS, API_END_POINT.VERIFY_OTP, false);
        } catch (error) {
            throw error;
        }
    },
    updateLoginStatus: async (sfId, status) => {
        try {
            if (!sfId) {
                return responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.VERIFY_OTP);
            }
            // update login status qry
            const removeUsedOtpQry = `
            UPDATE ${SCHEMA.PUBLIC.USER} 
            SET 
            has_logged_out__c = ${status}
            WHERE
            ${OBJECTKEYNAME.SFID} = '${sfId}'
            `;
            await client.query(removeUsedOtpQry);

            return responseBody(MESSAGE.UPDATESUCCESS, API_END_POINT.VERIFY_OTP, false);
        } catch (error) {
            throw error;
        }
    },
    checkTokenExistence: async (sfId, token) => {
        try {
            if (!(sfId && token)) {
                return false;
            }
            const getQry = `
            SELECT
            session_token__c
            FROM 
            ${SCHEMA.PUBLIC.SESSION}
            WHERE
            user_sfid__c = '${sfId}'
            AND
            session_token__c = '${token}'
            `
            const response = await client.query(getQry);

            if (response.rowCount) {
                return true;
            }
            return false;
        } catch (error) {
            throw error;
        }
    },
    updateToken: async (sfId, token = '') => {
        try {
            if (!(sfId)) {
                return responseBody(MESSAGE.MISSINGPARAMS, 'Check Token');
            }
            const updateQry = `
            UPDATE ${SCHEMA.PUBLIC.SESSION}
            SET
            session_token__c = '${token || ''}'
            WHERE user_sfid__c = '${sfId}'
            `
            return await client.query(updateQry);
        } catch (error) {
            throw error;
        }
    },
    storeToken: async (sfId, token) => {
        try {
            if (!(sfId && token)) {
                return responseBody(MESSAGE.MISSINGPARAMS, 'Check Token');
            }

            // if record found update it or else create a new record
            let updateResponse = await user.updateToken(sfId, token);
            if (!updateResponse.rowCount) {
                const insertQry = `
                INSERT INTO ${SCHEMA.PUBLIC.SESSION} (user_sfid__c, session_token__c, "objectId" ) VALUES ( '${sfId}', '${token}', '${getUniqueId()}' )
                `;
                return await client.query(insertQry);
            }

        } catch (error) {
            throw error;
        }
    },
}


module.exports = {
    user
}