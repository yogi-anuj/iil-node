const { API_END_POINT, MESSAGE, USER_HIERARCHY, STATIC_OTP, RECORD_TYPES, } = require("../../utilities/constants");
const { formatDate } = require("../../utilities/customDate");
const { responseBody } = require("../../utilities/customResponse");
const { generateOtp } = require("../../utilities/otp");
const { generateSignature } = require("../../utilities/sessionTokens");
const { attendance } = require("../attendance/query");
const { user } = require("./query");

// verify user and send otp controller
exports.userOtpLogin = async (req, res) => {
    try {
        const { username, signatureId, smsPlatform } = req.body;
        if (!username) {
            return res.status(401).json(responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.USER_LOGIN));
        }
        
        // get user profile
        let checkingUser = await user.findUserByMobileForOTPGeneration(username);
        
        // restrict if the user is not found or user is a depot manager user
        if (!checkingUser.rowCount || checkingUser.rows[0].profile__c == USER_HIERARCHY.Depot_Manager_user) {
            return res.status(401).json(responseBody(MESSAGE.INVALID_USER, API_END_POINT.USER_LOGIN));
        }

        // restrict if a non active user
        if (checkingUser.rows[0].active__c == null || checkingUser.rows[0].active__c.toLowerCase() === "no") {
            return res.status(401).json(responseBody('Not an active user', API_END_POINT.USER_LOGIN));
        }

        // generate otp
        const generatedOtpResponse = await generateOtp(username, signatureId, smsPlatform);

        // verify otp response
        if (generatedOtpResponse.otp) {
            let otp = generatedOtpResponse.otp;
            let userId = checkingUser.rows[0].sfid;

            // store the generated otp
            await user.storeOtp(otp, userId);

            return res.json(responseBody(MESSAGE.OTP_SEND_SUCCESS, API_END_POINT.USER_LOGIN, false, generatedOtpResponse));
        } else {
            return res.status(401).json(responseBody(generatedOtpResponse.sid, API_END_POINT.USER_LOGIN));
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).json(responseBody(error.message, API_END_POINT.USER_LOGIN));
    }
}


// verify otp and generate session token
exports.verifyOtp = async (req, res) => {
    try {
        let { otp, username, fcmToken = '', applicationVersionName = '', platformName = '', deviceName = '', deviceId = '', deviceOsVersion = '' } = req.body;

        if (!(otp && username)) {
            return res.status(401).json(responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.VERIFY_OTP));
        }

        // get user information
        const checkingUser = await user.findUserByMobileForOTPVerification(username);
        
        // restrict if the user is not found or user is a depot manager user
        if (!checkingUser.rowCount || checkingUser.rows[0].profile__c == USER_HIERARCHY.Depot_Manager_user) {
            return res.status(401).json(responseBody(MESSAGE.INVALID_USER, API_END_POINT.VERIFY_OTP));
        }

        // validate otp
        if (otp != STATIC_OTP && otp != checkingUser.rows[0].otp__c) {
            return res.status(401).json(responseBody('Invalid OTP', API_END_POINT.VERIFY_OTP));
        }

        if (otp == STATIC_OTP || otp == checkingUser.rows[0].otp__c) {
            const sfId = checkingUser.rows[0].sfid;
            // remove otp
            await user.removeUsedOtp(sfId);

            // set login status true
            await user.updateLoginStatus(sfId, true);

            // check if device needs to be updated
            if (checkingUser.rows[0].fcm_token__c != fcmToken) {
                let payload = {
                    mobile: username, fcmToken, applicationVersionName, platformName, deviceName, deviceId, deviceOsVersion
                }
                await user.updateDeviceData(payload);
            }

            const today = formatDate();

            // get todays attendance data
            let checkAttendance = await attendance.checkAttendanceForDate(sfId, today);

            // if no attendance found for today, then insert
            if (!checkAttendance.rowCount) {                
                await attendance.insertAttendanceForToday(sfId);
            }

            // tokens payload
            let payload = {
                mobile__c: checkingUser.rows[0].mobile__c,
                name__c: checkingUser.rows[0].name__c,
                profile__c: checkingUser.rows[0].profile__c,
                sfid: checkingUser.rows[0].sfid,
                herokuId__c: checkingUser.rows[0].heroku_id__c,
                territory_mapping1__c: checkingUser.rows[0].territory_mapping1__c,
                territory_mapping2__c: checkingUser.rows[0].territory_mapping2__c,
                // recordTypeId: checkingUser.rows[0].recordTypeId,                  // for dms application
            }

            // generate token
            const token = await generateSignature(payload);

            // save the token in the database and set login status to true
            await user.storeToken(sfId, token);

            // data to be sent in response
            const data = {
                userDetails: { ...checkingUser.rows[0], otp__c: "", fcm_token__c: "" },
                sessionToken: token,
                farmerRecordTypeId: RECORD_TYPES.FARMER,
                retailerRecordTypeId: RECORD_TYPES.RETAILER,
                distributorRecordTypeId: RECORD_TYPES.DISTRIBUTOR,
                agriExpertRecordTypeId: RECORD_TYPES.AGRI_EXPERT,
                otherStateSfid: RECORD_TYPES.OTHER_STATE_SFID,
                otherDistrictSfid: RECORD_TYPES.OTHER_DISTRICT_SFID,
                otherSubDistrictSfid: RECORD_TYPES.OTHER_SUB_DISTRICT_SFID,
                otherVillageSfid: RECORD_TYPES.OTHER_VILLAGE_SFID,
                attendanceStatus:
                    checkAttendance.rows[0] == undefined
                        ? false
                        : checkAttendance.rows[0].attendance_status__c,
                logoutStatus:
                    checkAttendance.rows[0] == undefined
                        ? false
                        : checkAttendance.rows[0].log_out_status__c,
            };
            return res.json(responseBody(MESSAGE.LOGINSUCCESS, API_END_POINT.VERIFY_OTP, false, data));
        }

        return res.status(401).json(responseBody('Something went wrong', API_END_POINT.VERIFY_OTP));
    } catch (error) {
        console.error(error.message);
        return res.status(500).json(responseBody(error.message, API_END_POINT.VERIFY_OTP));
    }
}


// logout user controller
exports.logoutUser = async(req, res) => {
    try {
        const {sfid} = req.payload;

        // destroy the saved token
        await user.updateToken(sfid);

        // set the login status to false
        await user.updateLoginStatus(false);

        return res.json(responseBody('Logout success', API_END_POINT.USER_LOGOUT, false));
    } catch (error) {
        console.error(error.message);
        return res.status(500).json(responseBody(error.message, API_END_POINT.USER_LOGOUT));
    }
}
