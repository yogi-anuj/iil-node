const { client } = require("../../middleware/database/database");
const { SCHEMA, OBJECTKEYNAME, MESSAGE, API_END_POINT, RECORDS_PER_PAGE, STATUS } = require("../../utilities/constants");
const { responseBody } = require("../../utilities/customResponse");
const { getUniqueId } = require("../../utilities/uniqueId");
const moment = require("moment-timezone");

const attendance = {
    // create new attendance record
    insertAttendanceForToday: async (sfId) => {
        try {
            if (!sfId) {
                return "Missind sfId in query"
            }
            let insertQuery = `
            INSERT INTO ${SCHEMA.SALESFORCE.ATTENDANCE} (
                Date__c,
                user__c, 
                attendance_status__c,
                ${OBJECTKEYNAME.LogoutStatus}, 
                ${OBJECTKEYNAME.HEROKU_ID__C}
            ) VALUES (
                CURRENT_DATE,
                '${sfId}',
                ${false},
                ${false}, 
                '${getUniqueId()}'
            )
            RETURNING 
            ${OBJECTKEYNAME.ATTENDANCE_STATUS}, 
            ${OBJECTKEYNAME.LogoutStatus}, 
            TO_CHAR(${OBJECTKEYNAME.IN_TIME__C}, 'DD-MM-YYYY HH:MM:SS AM') as in_time__c, 
            ${OBJECTKEYNAME.EFFECTIVE_HOURS__C}`;
            return await client.query(insertQuery);

        } catch (error) {
            throw error;
        }
    },
    // get attendance record for a given date
    checkAttendanceForDate: async (userId, date) => {
        try {
            if (!userId) {
                return "Missing user ID"
            }

            let queryAttendanceStatus = `
            SELECT 
            ${SCHEMA.SALESFORCE.ATTENDANCE}.${OBJECTKEYNAME.SFID},
            ${SCHEMA.SALESFORCE.ATTENDANCE}.${OBJECTKEYNAME.HEROKU_ID__C} as herokuId,
            TO_CHAR(${OBJECTKEYNAME.DATE__C}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.DATE__C},
            (CASE WHEN ${OBJECTKEYNAME.ACTIVE} = 'yes' THEN 'yes' ELSE 'no' END) as active_status,
            ${OBJECTKEYNAME.ATTENDANCE_STATUS},
            ${OBJECTKEYNAME.LogoutStatus},
            ${OBJECTKEYNAME.EFFECTIVE_HOURS__C},
            ${OBJECTKEYNAME.IN_TIME__C},
            TO_CHAR(${OBJECTKEYNAME.IN_TIME__C}, 'HH:MM') as loginTime 
            FROM ${SCHEMA.SALESFORCE.ATTENDANCE}
            INNER JOIN ${SCHEMA.SALESFORCE.USER} ON ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.SFID} = '${userId}'
            WHERE 
            ${OBJECTKEYNAME.USER__C} = '${userId}' 
            AND 
            (${OBJECTKEYNAME.DATE__C} = '${date}'  
            OR
            ${OBJECTKEYNAME.IN_TIME__C} = '${date}' ) 
            ORDER BY ${SCHEMA.SALESFORCE.ATTENDANCE}.id DESC LIMIT 1
            `;

            return await client.query(queryAttendanceStatus);

        } catch (error) {
            throw error;
        }
    },
    // mark in or mark out 
    updateAttendanceStatus: async ({ sfid, markStatus, in_time__c, out_time__c, effective_hours__c, Geo_Location__Latitude__s, Geo_Location__Longitude__s }) => {
        try {
            if (!sfid) {
                return "Missing params from find user by mobile"
            }
            let updateQry = '';
            if (markStatus) {
                updateQry = `
                UPDATE ${SCHEMA.SALESFORCE.ATTENDANCE} 
                SET 
                ${OBJECTKEYNAME.IN_TIME__C} = '${in_time__c}', 
                ${OBJECTKEYNAME.ATTENDANCE_STATUS} = ${true},
                ${OBJECTKEYNAME.Geo_Location__Latitude__s} = ${Geo_Location__Latitude__s}, 
                ${OBJECTKEYNAME.Geo_Location__Longitude__s} = ${Geo_Location__Longitude__s}
                WHERE 
                ${OBJECTKEYNAME.USER__C} = '${sfid}' AND DATE(${OBJECTKEYNAME.DATE__C}) = CURRENT_DATE
                RETURNING ${OBJECTKEYNAME.IN_TIME__C} as loginTime
                `
            } else {
                updateQry = `
                UPDATE ${SCHEMA.SALESFORCE.ATTENDANCE} 
                SET 
                ${OBJECTKEYNAME.OUT_TIME__C} = '${out_time__c}', 
                ${OBJECTKEYNAME.EFFECTIVE_HOURS__C} = '${effective_hours__c}',
                ${OBJECTKEYNAME.ATTENDANCE_STATUS} = ${true}, 
                ${OBJECTKEYNAME.Auto_Attendance_Marked__c} = ${false}, 
                ${OBJECTKEYNAME.LogoutStatus} = ${true}, 
                ${OBJECTKEYNAME.Geo_Location__Latitude__s} = ${Geo_Location__Latitude__s}, 
                ${OBJECTKEYNAME.Geo_Location__Longitude__s} = ${Geo_Location__Longitude__s}
                WHERE
                ${OBJECTKEYNAME.USER__C} = '${sfid}' AND DATE(${OBJECTKEYNAME.DATE__C}) = CURRENT_DATE
                RETURNING ${OBJECTKEYNAME.IN_TIME__C} as loginTime`
            }
            return await client.query(updateQry);
        } catch (error) {
            throw error;
        }
    },
    // get previous two days records
    getPastTwoDaysRecords: async (sfId, pageNumber = 1) => {
        try {
            if (!sfId) {
                return "Missing sfId in query"
            }
            const qry = `
            SELECT
            TO_CHAR(${OBJECTKEYNAME.DATE__C}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.DATE__C},
            ${OBJECTKEYNAME.HEROKU_ID__C} as herokuId,
            ${OBJECTKEYNAME.ATTENDANCE_STATUS}
            FROM ${SCHEMA.SALESFORCE.ATTENDANCE}
            WHERE
            ${OBJECTKEYNAME.USER__C} = '${sfId}'
            AND
            ${OBJECTKEYNAME.DATE__C} BETWEEN CURRENT_DATE - INTERVAL '2 days' AND CURRENT_DATE - INTERVAL '1 day'
            ORDER BY ${OBJECTKEYNAME.DATE__C} DESC
            OFFSET (${pageNumber} - 1) * ${RECORDS_PER_PAGE}
            LIMIT ${RECORDS_PER_PAGE}
            ;
            `;

            return await client.query(qry);
        } catch (error) {
            throw error;
        }
    },
    // mark attendance for past date
    insertAttendanceForPastDate: async (date, userSfid, activityType, description, Geo_Location__Latitude__s, Geo_Location__Longitude__s) => {
        try {
            if (!(date && userSfid)) {
                return "Missing params";
            }

            let insertQuery = `
            INSERT INTO ${SCHEMA.SALESFORCE.ATTENDANCE} (
                ${OBJECTKEYNAME.DATE__C}, 
                ${OBJECTKEYNAME.USER__C}, 
                ${OBJECTKEYNAME.ATTENDANCE_STATUS},  
                ${OBJECTKEYNAME.IN_TIME__C},
                ${OBJECTKEYNAME.OUT_TIME__C},
                ${OBJECTKEYNAME.ACTIVITY_TYPE__C},
                ${OBJECTKEYNAME.DESCRIPTION__C},
                ${OBJECTKEYNAME.HEROKU_ID__C},
                ${OBJECTKEYNAME.Geo_Location__Latitude__s},  
                ${OBJECTKEYNAME.Geo_Location__Longitude__s},        
                ${OBJECTKEYNAME.STATUS__C}
            ) 
            VALUES (
                '${date}',
                '${userSfid}',
                ${true}, 
                '${moment(new Date()).utc().format()}',
                '${moment(new Date()).utc().format()}',
                '${activityType}',
                '${description}',
                '${getUniqueId()}',
                ${Geo_Location__Latitude__s},
                ${Geo_Location__Longitude__s},
                '${STATUS.PENDING}'
            )
            `;
            return await client.query(insertQuery);
        } catch (error) {
            throw error;
        }
    },
    // update attendance for past date
    updateAttendanceForPastDate: async (date, userSfid, activityType, description, Geo_Location__Latitude__s, Geo_Location__Longitude__s) => {
        try {
            if (!(date && userSfid)) {
                return "Missing params";
            }

            let updateAttendanceStatus = `
            UPDATE ${SCHEMA.SALESFORCE.ATTENDANCE} 
            SET 
            ${OBJECTKEYNAME.IN_TIME__C} = '${moment(new Date()).utc().format()}',
            ${OBJECTKEYNAME.OUT_TIME__C} = '${moment(new Date()).utc().format()}',  
            ${OBJECTKEYNAME.DATE__C} = '${date}',
            ${OBJECTKEYNAME.ATTENDANCE_STATUS} = ${true},
            ${OBJECTKEYNAME.ACTIVITY_TYPE__C} = '${activityType}',
            ${OBJECTKEYNAME.DESCRIPTION__C} = '${description}',
            ${OBJECTKEYNAME.STATUS__C} = '${STATUS.PENDING}',
            ${OBJECTKEYNAME.Geo_Location__Latitude__s} = ${Geo_Location__Latitude__s}, 
            ${OBJECTKEYNAME.Geo_Location__Longitude__s} = ${Geo_Location__Longitude__s}
            WHERE 
            ${OBJECTKEYNAME.USER__C} = '${userSfid}' 
            AND 
            ${OBJECTKEYNAME.DATE__C} = '${date}'`;

            await client.query(updateAttendanceStatus);
        } catch (error) {
            throw error;
        }
    },
    // get attendance status history
    getAttendanceStatusHistory: async (userSfid, pageNumber = 1) => {
        try {
            if(!userSfid){
                return "Missing userSfid"
            }
            const qry = `
            SELECT TO_CHAR(${OBJECTKEYNAME.DATE__C}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.DATE__C},
            ${OBJECTKEYNAME.ACTIVITY_TYPE__C},
            ${OBJECTKEYNAME.DESCRIPTION__C},
            ${OBJECTKEYNAME.HEROKU_ID__C} as herokuId,
            ${OBJECTKEYNAME.STATUS__C}
            FROM ${SCHEMA.SALESFORCE.ATTENDANCE}
            WHERE ${OBJECTKEYNAME.USER__C} = '${userSfid}' AND ${OBJECTKEYNAME.STATUS__C} IS NOT NULL
            ORDER BY ${OBJECTKEYNAME.DATE__C} DESC
            OFFSET (${pageNumber} - 1) * ${RECORDS_PER_PAGE}
            LIMIT ${RECORDS_PER_PAGE}
            `;

            return await client.query(qry);
        } catch (error) {
            throw error;
        }
    },
    // get pending attendance requests for approval
    getPendingAttendanceRequests: async (userSfid, pageNumber) => {
        try {
            if(!userSfid){
                return "Missing userSfid from query"
            }

            const qry = `
            SELECT TO_CHAR(${OBJECTKEYNAME.DATE__C}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.DATE__C},
            ${OBJECTKEYNAME.ACTIVITY_TYPE__C},
            ${OBJECTKEYNAME.DESCRIPTION__C},
            ${OBJECTKEYNAME.STATUS__C},
            ${SCHEMA.SALESFORCE.ATTENDANCE}.${OBJECTKEYNAME.ID} as herokuId,
            ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.NAME__C}
            FROM ${SCHEMA.SALESFORCE.ATTENDANCE}
            INNER JOIN ${SCHEMA.SALESFORCE.USER} ON ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Z7__C} = '${userSfid}'
            WHERE ${OBJECTKEYNAME.STATUS__C} = '${STATUS.PENDING}'
            ORDER BY ${OBJECTKEYNAME.DATE__C} DESC
            OFFSET (${pageNumber} - 1) * ${RECORDS_PER_PAGE}
            LIMIT ${RECORDS_PER_PAGE}
            `;

            return await client.query(qry);

        } catch (error) {
            throw error;
        }
    },
    // approve pending attendance request
    approveAttendanceRequest: async(herokuId, status, attendanceStatus) => {
        try {
            if(!(herokuId && status)){
                return "Missing herokuId from query";
            }
            
            let queryAttendanceStatus = `
            UPDATE ${SCHEMA.SALESFORCE.ATTENDANCE} 
            SET 
            ${OBJECTKEYNAME.ATTENDANCE_STATUS} = ${attendanceStatus},
            ${OBJECTKEYNAME.STATUS__C} = '${status}'
            WHERE 
            ${OBJECTKEYNAME.ID} = '${herokuId}'`;
            
            return await client.query(queryAttendanceStatus);
        } catch (error) {
            throw error;
        }
    }
}


module.exports = {
    attendance,
}