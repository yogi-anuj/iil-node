const { SMS_PARTY, SMS_COUNTRY } = require("./constants");
const fetch = require('node-fetch');


const generateOtp = async (phone, signatureId = 't22jBsJWGmZ', smsPlatform) => {
    try {
        let response;
        let otpCode = Math.floor(100000 + Math.random() * 900000);

        // ----------for sms country----------------
        if (smsPlatform === SMS_PARTY.MINOVO) {
            // ----------for minavo sms --------------------
            const otpSignature = `${otpCode}`;
            // const otpSignature = `${otpCode} ${signatureId}`;
            response = await fetch(`https://vsms.minavo.in/api/singlesms.php?auth_key=14069191-f3de-11ed-9a4f-6045bda560d0&mobilenumber=${phone}&message=${otpSignature} is your login OTP for IIL ${signatureId}. Please do not share with anyone.Minavo&sid=MINOVO&mtype=N&template_id=1407166171375396978`);
        } else {
            const body = {
                "Text": `${otpCode} is your login OTP for IIL App, your reference number is ${signatureId}. Please do not share with anyone.INSECTICIDES (INDIA) LIMITED`,
                "Number": phone,
                "SenderId": "IILSMS"
            }
            response = await fetch(SMS_COUNTRY.URL, {
                method: 'post',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': SMS_COUNTRY.TOKEN
                }
            });
        }

        // after confirmation send response
        const data = await response.json();
        console.log(data, otpCode);
        return { sid: smsPlatform === SMS_PARTY.IIL ? data.Success : data.status, otp: `${otpCode}` };
    } catch (error) {
        return { sid: error.message, otp: "" };
    }
};

module.exports = { generateOtp };