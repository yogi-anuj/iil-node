const { API_END_POINT, MESSAGE, USER_HIERARCHY, STATUS } = require("../../utilities/constants");
const { formatDate } = require("../../utilities/customDate");
const { responseBody } = require("../../utilities/customResponse");
const { attendance } = require("./query");
const moment = require('moment-timezone');

// controller to get current attendance information
exports.getAttendanceInformation = async (req, res) => {
    try {
        const { sfid } = req.payload;

        const today = formatDate();

        const todaysAttendanceResponse = await attendance.checkAttendanceForDate(sfid, today);

        if (!todaysAttendanceResponse.rowCount) {
            let response = await attendance.insertAttendanceForToday(sfid);
            return res.json(responseBody(MESSAGE.UPDATESUCCESS, API_END_POINT.Get_Attendance_Status, false, { ...response.rows[0] }));
        }

        let in_time__c =
            moment(todaysAttendanceResponse.rows[0].in_time__c)
                .add({ hours: 5, minutes: 30 })
                .format('YYYY-MM-DD hh:mm:ss A') || null;

        return res.json(responseBody(MESSAGE.UPDATESUCCESS, API_END_POINT.Get_Attendance_Status, false, { ...todaysAttendanceResponse.rows[0], in_time__c }));

    } catch (error) {
        console.error(error);
        return res.status(500).json(responseBody(error.message, API_END_POINT.Get_Attendance_Status));
    }
}

// controller to get past two days records
exports.getPast2Attendances = async (req, res) => {
    try {
        const { pageNumber = 1 } = req.body;
        const { sfid } = req.payload;

        const response = await attendance.getPastTwoDaysRecords(sfid, pageNumber);

        let resBody = {
            previousAttendanceStatus1: response.rowCount ? response.rows[0] : {},
            previousAttendanceStatus2: response.rowCount ? response.rows[1] : {},
        }
        return res.json(responseBody(MESSAGE.FETCHSUCCESS, API_END_POINT.Get_Previous_Attendance_Status, false, { ...resBody }))
    } catch (error) {
        console.error(error);
        return res.status(500).json(responseBody(error.message, API_END_POINT.Get_Previous_Attendance_Status));
    }
}

// controller to update or insert attendance record for previous date
exports.markPreviousAttendance = async (req, res) => {
    try {
        const {
            date,
            activityType,
            description,
            Geo_Location__Latitude__s,
            Geo_Location__Longitude__s,
        } = req.body;

        // user sfid
        const { sfid } = req.payload;

        if (!(date && activityType && description)) {
            return costomError(MESSAGE.MISSINGPARAMS, API_END_POINT.Add_Previous_Attendance);
        }

        const today = formatDate();
        //   restricts todays attendance
        if (date == today) {
            return res.status(401).json(responseBody('Please select the previous date.', API_END_POINT.Add_Previous_Attendance));
        }

        // get attendance for the given date
        const attendanceRecord = await attendance.checkAttendanceForDate(sfid, date);

        // if record for the date exists, update the details
        if (attendanceRecord.rowCount) {
            await attendance.updateAttendanceForPastDate(date, sfid, activityType, description, Geo_Location__Latitude__s, Geo_Location__Longitude__s);
        }
        // else insert new record with those details
        else {
            await attendance.insertAttendanceForPastDate(date, sfid, activityType, description, Geo_Location__Latitude__s, Geo_Location__Longitude__s);
        }

        return res.json(responseBody('Attendance marked successfully', API_END_POINT.Add_Previous_Attendance, false));

    } catch (error) {
        console.error(error);
        return res.status(500).json(responseBody(error.message, API_END_POINT.Add_Previous_Attendance));
    }
}

// controller to mark attendance status
exports.updateAttendanceStatus = async (req, res) => {
    try {
        const {
            logginState,
            Geo_Location__Latitude__s,
            Geo_Location__Longitude__s,
        } = req.body;

        const { sfid } = req.payload;

        const today = formatDate();

        let todaysAttendanceResponse = await attendance.checkAttendanceForDate(sfid, today);

        // calculating effective hours only if in_time is marked
        let effective_hours__c = '';
        if (todaysAttendanceResponse.rowCount) {
            let in_time__c = moment(todaysAttendanceResponse.rows[0].in_time__c, 'YYYY-MM-DD HH:mm:ss');

            const currentDate = new Date();
            // Subtract -5 hours and -30 minutes from the current date
            const modifiedDate = new Date(currentDate);
            modifiedDate.setHours(currentDate.getHours());
            modifiedDate.setMinutes(currentDate.getMinutes());
            let out_time__c = moment(modifiedDate, 'YYYY-MM-DD HH:mm:ss');
            const duration = moment.duration(out_time__c.diff(in_time__c));
            const hours = duration.hours();
            const minutes = duration.minutes();
            effective_hours__c = `${hours}:${minutes}`;
        }

        // getting current time
        let time = moment(new Date()).utc().format();

        let payload = {
            sfid,
            markStatus: logginState,
            in_time__c: time,
            out_time__c: time,
            effective_hours__c,
            Geo_Location__Latitude__s,
            Geo_Location__Longitude__s,
        }

        let updateResponse = ((!logginState && todaysAttendanceResponse.rowCount) || logginState) && await attendance.updateAttendanceStatus(payload);

        let loginTime = (updateResponse.rowCount && updateResponse.rows[0].logintime) || null;

        // while getting utc time from heroku it sends as -5:30 and storing it already stores with -5:30 so i added 11:00 hours
        let convertedTime = moment(loginTime).utcOffset('+11:00').format('hh:mm A');

        return res.json(responseBody(MESSAGE.UPDATESUCCESS, API_END_POINT.UPDATE_ATTENDANCE_STATUS, false, {
            loginTime: convertedTime,
        }));

    } catch (error) {
        console.error(error);
        return res.status(500).json(responseBody(error.message, API_END_POINT.UPDATE_ATTENDANCE_STATUS));
    }
}

// controller to get past attendance history
exports.getAttendanceHistory = async (req, res) => {
    try {
        const { pageNumber } = req.body;
        const { sfid } = req.payload;

        const response = await attendance.getAttendanceStatusHistory(sfid, pageNumber);

        return res.json(responseBody(MESSAGE.FETCHSUCCESS, API_END_POINT.Get_Previous_Attendance_Status_History, false, response.rows));
    } catch (error) {
        console.error(error);
        return res.status(500).json(responseBody(error.message, API_END_POINT.Get_Previous_Attendance_Status_History));
    }
}

// pending attendance approval request
exports.getPendingAttendanceRequest = async (req, res) => {
    try {
        const { pageNumber } = req.body;
        const { sfid, profile__c } = req.payload;
        
        if (profile__c == USER_HIERARCHY.SI__user) {
            return res.status(403).json(responseBody(MESSAGE.UNAUTHORIZEDACCESS, API_END_POINT.Get_Previous_Attendance_Status_History));
        }
        
        const response = await attendance.getPendingAttendanceRequests(sfid, pageNumber);

        return res.json(responseBody(MESSAGE.FETCHSUCCESS, API_END_POINT.Get_Previous_Attendance_Status_History, false, response.rows));
    } catch (error) {
        console.error(error);
        return res.status(500).json(responseBody(error.message, API_END_POINT.Get_Previous_Attendance_History_For_Approvel));
    }
}

// approve pending attendance requests
exports.approvePendingAttendanceRequest = async (req, res) => {
    try {
        const { status, herokuid } = req.body;
        const { profile__c } = req.payload;

        if (profile__c == 'SI') {
            return res.status(403).json(responseBody(MESSAGE.UNAUTHORIZEDACCESS, API_END_POINT.Update_Previous_Attendance_Status));
        }
        
        if (!(status && herokuid)) {
            return res.status(401).json(responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.Update_Previous_Attendance_Status));
        }
        
        let msg = STATUS.REJECTED == status ? 'rejected' : 'approved';
        let attendanceStatus = STATUS.REJECTED == status ? false : true;
        
        let response = await attendance.approveAttendanceRequest(herokuid, status, attendanceStatus);

        console.log("checking response", response);

        return res.json(responseBody(`Attendance ${msg} successfully.`, API_END_POINT.Update_Previous_Attendance_Status, false));
    } catch (error) {
        console.error(error);
        return res.status(500).json(responseBody(error.message, API_END_POINT.Update_Previous_Attendance_Status));
    }
}