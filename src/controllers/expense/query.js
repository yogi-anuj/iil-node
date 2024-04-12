const { client } = require("../../middleware/database/database");
const { OBJECTKEYNAME, SCHEMA, RECORDS_PER_PAGE, EXPENSE_STATUS } = require("../../utilities/constants");


const Expense = {
    // check if the user has expense approving access
    checkExpenseAprrovalStatus: async (userSfid) => {
        try {
            if (!userSfid) {
                return "Missing userSfid field"
            }
            let qry = `SELECT 
                ${OBJECTKEYNAME.SFID}
                FROM ${SCHEMA.SALESFORCE.USER} 
                WHERE
                ${OBJECTKEYNAME.ACTIVE} ilike 'yes' AND
                ${OBJECTKEYNAME.Expense_Approver__c} = '${userSfid}'
                LIMIT 1
                `;

            return await client.query(qry);
        } catch (error) {
            throw error;
        }
    },
    // check if there is an expense already in pending or approved for that date
    checkPendingOrApprovedExpenseQry: async (userSfid, expenseDate) => {
        try {
            let qry = `
            SELECT *
            FROM ${SCHEMA.SALESFORCE.EXPENSE_LINE}
            WHERE
            ${SCHEMA.SALESFORCE.EXPENSE_LINE}.${OBJECTKEYNAME.OWNER__C} = '${userSfid}'
            AND
            ${SCHEMA.SALESFORCE.EXPENSE_LINE}.${OBJECTKEYNAME.DATE__C} = '${expenseDate}'
            AND
            (
              ${SCHEMA.SALESFORCE.EXPENSE_LINE}.${OBJECTKEYNAME.STATUS__C} = '${EXPENSE_STATUS.APPROVED}'
              OR
              ${SCHEMA.SALESFORCE.EXPENSE_LINE}.${OBJECTKEYNAME.STATUS__C} = '${EXPENSE_STATUS.PENDING}'
            )
            `;

            return await client.query(qry);
        } catch (error) {
            throw error;
        }
    },
    // counts total daily allowance and out station daily allowance in a month
    getTotalDaOdaForCurrentMonth: (userSfid) => {
        try {
            let qry = `
          SELECT COUNT(*) as totalcount
          FROM ${SCHEMA.SALESFORCE.EXPENSE_LINE} 
          WHERE 
          ${OBJECTKEYNAME.OWNER__C} = '${userSfid}' 
          AND (
            ${OBJECTKEYNAME.Daily_Allowance_Amount__c} IS NOT NULL
            OR
            ${OBJECTKEYNAME.Outstation_Daily_Allowance_Amount__c} IS NOT NULL
            ) 
          AND EXTRACT(MONTH FROM ${OBJECTKEYNAME.DATE__C}) = EXTRACT(MONTH FROM CURRENT_DATE);
        `
            return client.query(qry);
        } catch (error) {
            throw error;
        }
    },
    // delete expense based on heroku id or (user id and date)
    deleteExpense: (herokuId, userSfid, expenseDate) => {
        try {
            let qry = `
            DELETE FROM ${SCHEMA.SALESFORCE.EXPENSE_LINE} WHERE ${OBJECTKEYNAME.HEROKU_ID__C} = '${herokuId}' OR (${OBJECTKEYNAME.OWNER__C} = '${userSfid}' AND ${OBJECTKEYNAME.DATE__C} = '${expenseDate}')
            `
            return client.query(qry);
        } catch (error) {
            throw error;
        }
    },
    // create expense
    createExpense: async ({ outstationDailyAllowanceAmt,
        localConveyanceAmt,
        vehicleCategory,
        fromOdometer,
        toOdometer,
        totalKm,
        fuelAmount,
        vehicleType,
        fromDate,
        toDate,
        totalDays,
        amount,
        miscellaneousAmt,
        dailyAllowanceAmt,
        travelTicketAmt,
        companyVehicleMaintenanceAmt,
        postageAndCourier,
        mobileBill,
        tollTax,
        otherMiscellaneous,
        otherMiscellaneousAmt,
        comment,
        expenseDate,
        newHerokuId,
        ownerId,
        status }) => {
        try {
            const insertQry = `
        INSERT INTO ${SCHEMA.SALESFORCE.EXPENSE_LINE} (
          ${OBJECTKEYNAME.Outstation_Daily_Allowance_Amount__c},
          ${OBJECTKEYNAME.Local_Conveyance_Amount__c},
          ${OBJECTKEYNAME.Select_Category__c},
          ${OBJECTKEYNAME.Odometer_Start_Reading__c},
          ${OBJECTKEYNAME.Odometer_End_Reading__c},
          ${OBJECTKEYNAME.Total_KM_Travelled__c},
          ${OBJECTKEYNAME.Fuel_Amount__c},
          ${OBJECTKEYNAME.Vehicle_Type__c},
          ${OBJECTKEYNAME.From_Date__c},
          ${OBJECTKEYNAME.To_Date__c},
          ${OBJECTKEYNAME.Total_Days__c},
          ${OBJECTKEYNAME.Hotel_Bills__c},
          ${OBJECTKEYNAME.Miscellaneous_Amount__c},
          ${OBJECTKEYNAME.Daily_Allowance_Amount__c},
          ${OBJECTKEYNAME.Company_Vehicle_Maintenance_Amount__c},
          ${OBJECTKEYNAME.Travel_Ticket_Amount__c},
          ${OBJECTKEYNAME.Postage_And_Courier__c},
          ${OBJECTKEYNAME.Mobile_Bill__c},
          ${OBJECTKEYNAME.Toll_Tax__c},
          ${OBJECTKEYNAME.Other_Miscellaneous__c},
          ${OBJECTKEYNAME.Other_Miscellaneous_Amount__c},
          ${OBJECTKEYNAME.COMMENTS__C},
          ${OBJECTKEYNAME.DATE__C},
          ${OBJECTKEYNAME.HEROKU_ID__C},
          ${OBJECTKEYNAME.OWNER__C},
          ${OBJECTKEYNAME.STATUS__C}
      ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
      ) RETURNING *
    `;

            const values = [
                outstationDailyAllowanceAmt,
                localConveyanceAmt,
                vehicleCategory,
                fromOdometer,
                toOdometer,
                totalKm,
                fuelAmount,
                vehicleType,
                fromDate,
                toDate,
                totalDays,
                amount,
                miscellaneousAmt,
                dailyAllowanceAmt,
                travelTicketAmt,
                companyVehicleMaintenanceAmt,
                postageAndCourier,
                mobileBill,
                tollTax,
                otherMiscellaneous,
                otherMiscellaneousAmt,
                comment,
                expenseDate,
                newHerokuId,
                ownerId,
                status
            ]

            return await client.query(insertQry, values);
        } catch (error) {
            throw error;
        }
    },
    // get expense based on date
    getExpenseByDate: async (expenseDate, userSfid) => {
        try {
            let qry = `SELECT 
            ${OBJECTKEYNAME.Daily_Allowance_Amount__c}, 
            ${OBJECTKEYNAME.Outstation_Daily_Allowance_Amount__c}, 
            ${OBJECTKEYNAME.Select_Category__c}, 
            ${OBJECTKEYNAME.Odometer_Start_Reading__c},
            ${OBJECTKEYNAME.Odometer_End_Reading__c},
            ${OBJECTKEYNAME.Total_KM_Travelled__c},
            ${OBJECTKEYNAME.Fuel_Amount__c}, 
            ${OBJECTKEYNAME.Vehicle_Type__c}, 
            TO_CHAR(${OBJECTKEYNAME.From_Date__c}, 'YYYY-MM-DD') as from_date__c,
            TO_CHAR(${OBJECTKEYNAME.To_Date__c}, 'YYYY-MM-DD') as to_date__c,
            ${OBJECTKEYNAME.Total_Days__c},
            ${OBJECTKEYNAME.Hotel_Bills__c},
            ${OBJECTKEYNAME.Local_Conveyance_Amount__c},
            ${OBJECTKEYNAME.Travel_Ticket_Amount__c},
            ${OBJECTKEYNAME.Company_Vehicle_Maintenance_Amount__c},
            ${OBJECTKEYNAME.Postage_And_Courier__c},
            ${OBJECTKEYNAME.Mobile_Bill__c},
            ${OBJECTKEYNAME.Toll_Tax__c},
            ${OBJECTKEYNAME.Other_Miscellaneous__c},
            ${OBJECTKEYNAME.Other_Miscellaneous_Amount__c},
            ${OBJECTKEYNAME.COMMENTS__C},
            ${OBJECTKEYNAME.USER__C} as approverSfid,
            userExpense.${OBJECTKEYNAME.NAME__C} as approverName,
            ${SCHEMA.SALESFORCE.EXPENSE_LINE}.${OBJECTKEYNAME.HEROKU_ID__C},
            ${OBJECTKEYNAME.STATUS__C}
            FROM ${SCHEMA.SALESFORCE.EXPENSE_LINE} 
            INNER JOIN ${SCHEMA.SALESFORCE.USER} as userExpense ON userExpense.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.EXPENSE_LINE}.${OBJECTKEYNAME.OWNER__C}
            WHERE 
            ${OBJECTKEYNAME.OWNER__C} = '${userSfid}' 
            AND 
            ${OBJECTKEYNAME.DATE__C} = '${expenseDate}'`;

            // console.log("checking qry 1", qry);
            return await client.query(qry);
        } catch (error) {
            throw error;
        }
    },
    // previous and expense dates expense
    expensePreviousAndNextDatesQry: async (userSfid, date) => {
        try {
            let qry = `
            WITH ExpensePreviousAndNextDatesTable AS (
              SELECT
                  ${OBJECTKEYNAME.OWNER__C},
                  ${OBJECTKEYNAME.Group_ID__c},
                  TO_CHAR(${OBJECTKEYNAME.DATE__C}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.DATE__C},
                  TO_CHAR(LAG(${OBJECTKEYNAME.DATE__C}) OVER (PARTITION BY ${OBJECTKEYNAME.OWNER__C} ORDER BY ${OBJECTKEYNAME.DATE__C}), 'YYYY-MM-DD') AS previous_date,
                  LAG(${OBJECTKEYNAME.Group_ID__c}) OVER (PARTITION BY ${OBJECTKEYNAME.OWNER__C} ORDER BY ${OBJECTKEYNAME.DATE__C}) AS previous_group_id__c,
                  TO_CHAR(LEAD(${OBJECTKEYNAME.DATE__C}) OVER (PARTITION BY ${OBJECTKEYNAME.OWNER__C} ORDER BY ${OBJECTKEYNAME.DATE__C}), 'YYYY-MM-DD') AS next_date,
                  LEAD(${OBJECTKEYNAME.Group_ID__c}) OVER (PARTITION BY ${OBJECTKEYNAME.OWNER__C} ORDER BY ${OBJECTKEYNAME.DATE__C}) AS next_group_id__c
              FROM
                  ${SCHEMA.SALESFORCE.EXPENSE_LINE}
            )
            SELECT
                *
            FROM
                ExpensePreviousAndNextDatesTable
            WHERE
                ${OBJECTKEYNAME.OWNER__C} = '${userSfid}'
                AND (
                    ${OBJECTKEYNAME.DATE__C} >= '${date}'
                )
            ORDER BY
                ${OBJECTKEYNAME.DATE__C}
                LIMIT 1;
            `
            return client.query(qry);
        } catch (error) {
            throw error;
        }
    },
    // update expense group
    updateExpenseGroupQry: async (checkForDate, startDate = '', endDate = '', currentUser, groupIdValue, herokuId = '') => {
        try {
            let qry = '';
            if (checkForDate) {
                qry += `
                UPDATE ${SCHEMA.SALESFORCE.EXPENSE_LINE}
                SET 
                ${OBJECTKEYNAME.Group_ID__c} =  ${groupIdValue},
                ${OBJECTKEYNAME.STATUS__C} =  '${EXPENSE_STATUS.PENDING}'
                WHERE 
                ${OBJECTKEYNAME.OWNER__C} = '${currentUser}'
                AND
                ${OBJECTKEYNAME.DATE__C} BETWEEN '${startDate}' AND '${endDate}'
              `;
            } else {
                qry += `
                UPDATE ${SCHEMA.SALESFORCE.EXPENSE_LINE}
                SET 
                ${OBJECTKEYNAME.Group_ID__c} =  ${groupIdValue},
                ${OBJECTKEYNAME.STATUS__C} =  '${EXPENSE_STATUS.PENDING}'
                WHERE 
                ${OBJECTKEYNAME.OWNER__C} = '${currentUser}'
                AND
                ${OBJECTKEYNAME.HEROKU_ID__C} = '${herokuId}'
              `;
            }
            return await client.query(qry);
        } catch (error) {
            throw error;
        }
    },
    // expense records from start date to end date
    multipleExpenseRecords: async (startDate, endDate, userSfid) => {
        try {
            let qry = `
            SELECT ${OBJECTKEYNAME.HEROKU_ID__C} FROM ${SCHEMA.SALESFORCE.EXPENSE_LINE}
            WHERE 
            ${OBJECTKEYNAME.OWNER__C} = '${userSfid}'
            AND
            ${OBJECTKEYNAME.DATE__C} BETWEEN '${startDate}' AND '${endDate}'
            `

            return await client.query(qry);
        } catch (error) {
            throw error;
        }
    },
    // current users rejected and draft expense
    getExpense: async (userSfid, pageNumber = 1) => {
        try {
            let expenseQry = `
            SELECT
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Daily_Allowance_Amount__c})::NUMERIC, 2), 0) + 
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Local_Conveyance_Amount__c})::NUMERIC, 2), 0) + 
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Hotel_Bills__c})::NUMERIC, 2), 0) + 
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Outstation_Daily_Allowance_Amount__c})::NUMERIC, 2), 0) + 
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Fuel_Amount__c})::NUMERIC, 2), 0) + 
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Travel_Ticket_Amount__c})::NUMERIC, 2), 0) +
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Company_Vehicle_Maintenance_Amount__c})::NUMERIC, 2), 0) +
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Postage_And_Courier__c})::NUMERIC, 2), 0) +
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Mobile_Bill__c})::NUMERIC, 2), 0) +
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Toll_Tax__c})::NUMERIC, 2), 0) +
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Other_Miscellaneous_Amount__c})::NUMERIC, 2), 0)
            as total,
            ${OBJECTKEYNAME.STATUS__C},
            ${OBJECTKEYNAME.SFID},
            ${OBJECTKEYNAME.HEROKU_ID__C},
            TO_CHAR(${OBJECTKEYNAME.DATE__C}, 'YYYY-MM-DD') as date
            FROM ${SCHEMA.SALESFORCE.EXPENSE_LINE} WHERE ${OBJECTKEYNAME.OWNER__C} = '${userSfid}' AND (LOWER(${OBJECTKEYNAME.STATUS__C}) = LOWER('${EXPENSE_STATUS.DRAFT}') OR LOWER(${OBJECTKEYNAME.STATUS__C}) = LOWER('${EXPENSE_STATUS.REJECTED}'))
            GROUP BY ${OBJECTKEYNAME.DATE__C}, ${OBJECTKEYNAME.SFID}, ${OBJECTKEYNAME.HEROKU_ID__C}, ${OBJECTKEYNAME.STATUS__C}
            ORDER BY date asc
            OFFSET (${pageNumber} - 1) * ${RECORDS_PER_PAGE}
            LIMIT ${RECORDS_PER_PAGE}
        `;

            return await client.query(expenseQry);
        } catch (error) {
            throw error;
        }
    },
    // current users pending and approved expense
    getExpenseHistory: async (userSfid, pageNumber = 1) => {
        try {
            let expenseQry = `
            SELECT
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Daily_Allowance_Amount__c})::NUMERIC, 2), 0) + 
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Local_Conveyance_Amount__c})::NUMERIC, 2), 0) + 
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Hotel_Bills__c})::NUMERIC, 2), 0) + 
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Outstation_Daily_Allowance_Amount__c})::NUMERIC, 2), 0) + 
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Fuel_Amount__c})::NUMERIC, 2), 0) + 
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Travel_Ticket_Amount__c})::NUMERIC, 2), 0) +
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Company_Vehicle_Maintenance_Amount__c})::NUMERIC, 2), 0) +
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Postage_And_Courier__c})::NUMERIC, 2), 0) +
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Mobile_Bill__c})::NUMERIC, 2), 0) +
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Toll_Tax__c})::NUMERIC, 2), 0) +
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Other_Miscellaneous_Amount__c})::NUMERIC, 2), 0)
            as total,
            ${OBJECTKEYNAME.Group_ID__c},
            TO_CHAR(${OBJECTKEYNAME.DATE__C}, 'YYYY-MM-DD') as date, ${OBJECTKEYNAME.STATUS__C}
            FROM ${SCHEMA.SALESFORCE.EXPENSE_LINE} 
            WHERE ${OBJECTKEYNAME.OWNER__C} = '${userSfid}' AND (${OBJECTKEYNAME.STATUS__C} = '${EXPENSE_STATUS.PENDING}' OR ${OBJECTKEYNAME.STATUS__C} = '${EXPENSE_STATUS.APPROVED}')
            GROUP BY ${OBJECTKEYNAME.Group_ID__c}, ${OBJECTKEYNAME.DATE__C}, ${OBJECTKEYNAME.STATUS__C}
            ORDER BY date asc
            OFFSET (${pageNumber} - 1) * ${RECORDS_PER_PAGE}
            LIMIT ${RECORDS_PER_PAGE}
        `;

            return await client.query(expenseQry);
        } catch (error) {
            throw error;
        }
    },
    // get expense limit
    getExpenseLimit: async (level) => {
        try {
            const expenseLimitQry = `SELECT name, travel_allowed__c, telephone_exp_limit__c, da_rates_local__c, hotel_bills_exp_rule__c, designation__c, da_rules__c, da_rates_outstation__c, rate_per_km_for_own_2_wheeler__c, rate_per_km_for_own_car__c FROM ${SCHEMA.SALESFORCE.HR_Policy__c} WHERE level__c = '${level}' LIMIT 1 `;

            return await client.query(expenseLimitQry);
        } catch (error) {
            throw error;
        }
    },
    // get pending approval requests
    getPendingApprovalRequests: async (userSfid, pageNumber = 1) => {
        try {
            let expenseQry = `
            SELECT
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Daily_Allowance_Amount__c})::NUMERIC, 2), 0) + 
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Local_Conveyance_Amount__c})::NUMERIC, 2), 0) + 
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Hotel_Bills__c})::NUMERIC, 2), 0) + 
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Outstation_Daily_Allowance_Amount__c})::NUMERIC, 2), 0) + 
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Fuel_Amount__c})::NUMERIC, 2), 0) + 
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Travel_Ticket_Amount__c})::NUMERIC, 2), 0) +
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Company_Vehicle_Maintenance_Amount__c})::NUMERIC, 2), 0) +
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Postage_And_Courier__c})::NUMERIC, 2), 0) +
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Mobile_Bill__c})::NUMERIC, 2), 0) +
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Toll_Tax__c})::NUMERIC, 2), 0) +
            COALESCE (ROUND(SUM (${OBJECTKEYNAME.Other_Miscellaneous_Amount__c})::NUMERIC, 2), 0)
            as total,
            ${OBJECTKEYNAME.Group_ID__c},
            expenseUser.${OBJECTKEYNAME.NAME__C} as userName,
            expenseUser.${OBJECTKEYNAME.SFID} as userSfid,
            ${SCHEMA.SALESFORCE.EXPENSE_LINE}.${OBJECTKEYNAME.HEROKU_ID__C} as expense_heroku_id,
            TO_CHAR(${OBJECTKEYNAME.DATE__C}, 'YYYY-MM-DD') as date, ${OBJECTKEYNAME.STATUS__C}
            FROM ${SCHEMA.SALESFORCE.USER} 
            LEFT JOIN ${SCHEMA.SALESFORCE.USER} as expenseUser ON ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.SFID} = expenseUser.${OBJECTKEYNAME.Expense_Approver__c}
            LEFT JOIN ${SCHEMA.SALESFORCE.EXPENSE_LINE} ON ${SCHEMA.SALESFORCE.EXPENSE_LINE}.${OBJECTKEYNAME.OWNER__C} = expenseUser.${OBJECTKEYNAME.SFID}
            WHERE 
            ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.SFID} = '${userSfid}'
            AND 
            ${SCHEMA.SALESFORCE.EXPENSE_LINE}.${OBJECTKEYNAME.STATUS__C} = '${EXPENSE_STATUS.PENDING}'
            AND
            ${SCHEMA.SALESFORCE.EXPENSE_LINE}.${OBJECTKEYNAME.Group_ID__c} IS NOT NULL
            GROUP BY ${OBJECTKEYNAME.Group_ID__c}, ${OBJECTKEYNAME.DATE__C}, ${OBJECTKEYNAME.STATUS__C}, expenseUser.${OBJECTKEYNAME.NAME__C},
            expenseUser.${OBJECTKEYNAME.SFID}, expense_heroku_id
            ORDER BY date asc
            OFFSET (${pageNumber} - 1) * ${RECORDS_PER_PAGE}
            LIMIT ${RECORDS_PER_PAGE}
        `;
            return await client.query(expenseQry);
        } catch (error) {
            throw error;
        }
    },
    // get pending approval requests by id
    getPendingApprovalRequestsById: async (expenseHerokuId) => {
        try {
            let qry = `SELECT 
                ${OBJECTKEYNAME.Daily_Allowance_Amount__c}, 
                ${OBJECTKEYNAME.Outstation_Daily_Allowance_Amount__c}, 
                ${OBJECTKEYNAME.Select_Category__c}, 
                ${OBJECTKEYNAME.Odometer_Start_Reading__c},
                ${OBJECTKEYNAME.Odometer_End_Reading__c},
                ${OBJECTKEYNAME.Total_KM_Travelled__c},
                ${OBJECTKEYNAME.Fuel_Amount__c}, 
                TO_CHAR(${OBJECTKEYNAME.From_Date__c}, 'YYYY-MM-DD') as from_date__c,
                TO_CHAR(${OBJECTKEYNAME.To_Date__c}, 'YYYY-MM-DD') as to_date__c,
                ${OBJECTKEYNAME.Total_Days__c},
                ${OBJECTKEYNAME.Hotel_Bills__c},
                ${OBJECTKEYNAME.Vehicle_Type__c},
                ${OBJECTKEYNAME.Miscellaneous_Amount__c},
                ${OBJECTKEYNAME.Local_Conveyance_Amount__c},
                ${OBJECTKEYNAME.Company_Vehicle_Maintenance_Amount__c},
                ${OBJECTKEYNAME.Travel_Ticket_Amount__c},
                ${OBJECTKEYNAME.Postage_And_Courier__c},
                ${OBJECTKEYNAME.Mobile_Bill__c},
                ${OBJECTKEYNAME.Toll_Tax__c},
                ${OBJECTKEYNAME.Other_Miscellaneous__c},
                ${OBJECTKEYNAME.Other_Miscellaneous_Amount__c},
                ${OBJECTKEYNAME.OWNER__C} as approverSfid,
                expenseUser.${OBJECTKEYNAME.NAME__C} as approverName,
                ${OBJECTKEYNAME.COMMENTS__C},
                ${OBJECTKEYNAME.daily_allowance_status__c},
                ${OBJECTKEYNAME.outstation_daily_allowance_status__c},
                ${OBJECTKEYNAME.local_conveyance_status__c},
                ${OBJECTKEYNAME.fuel_status__c},
                ${OBJECTKEYNAME.travel_tickets_status__c},
                ${OBJECTKEYNAME.company_vehicle_maintenance_status__c},
                ${OBJECTKEYNAME.postage_courier_status__c},
                ${OBJECTKEYNAME.mobile_bill_status__c},
                ${OBJECTKEYNAME.toll_tax_status__c},
                ${OBJECTKEYNAME.others_status__c},
                ${OBJECTKEYNAME.hotel_stay_status__c},
                ${SCHEMA.SALESFORCE.EXPENSE_LINE}.${OBJECTKEYNAME.HEROKU_ID__C} as expenseHerokuId,
                ${OBJECTKEYNAME.STATUS__C}
                FROM ${SCHEMA.SALESFORCE.EXPENSE_LINE} 
                INNER JOIN ${SCHEMA.SALESFORCE.USER} as expenseUser ON expenseUser.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.EXPENSE_LINE}.${OBJECTKEYNAME.OWNER__C}
                WHERE
                ${SCHEMA.SALESFORCE.EXPENSE_LINE}.${OBJECTKEYNAME.HEROKU_ID__C} = '${expenseHerokuId}'
                `;

            return await client.query(qry);
        } catch (error) {
            throw error;
        }
    },
    // get expenses from list of expense ids
    getMultipleExpenses: async (expenseHerokuIds) => {
        try {
            let checkQry = `SELECT 
                ${OBJECTKEYNAME.HEROKU_ID__C},
                ${OBJECTKEYNAME.Daily_Allowance_Amount__c},
                ${OBJECTKEYNAME.Outstation_Daily_Allowance_Amount__c},
                ${OBJECTKEYNAME.Local_Conveyance_Amount__c},
                ${OBJECTKEYNAME.Fuel_Amount__c},
                ${OBJECTKEYNAME.Travel_Ticket_Amount__c},
                ${OBJECTKEYNAME.Company_Vehicle_Maintenance_Amount__c},
                ${OBJECTKEYNAME.Postage_And_Courier__c},
                ${OBJECTKEYNAME.Mobile_Bill__c},
                ${OBJECTKEYNAME.Toll_Tax__c},
                ${OBJECTKEYNAME.Other_Miscellaneous__c},
                ${OBJECTKEYNAME.Other_Miscellaneous_Amount__c},
                ${OBJECTKEYNAME.Hotel_Bills__c}
                FROM ${SCHEMA.SALESFORCE.EXPENSE_LINE} 
                WHERE
                ${OBJECTKEYNAME.HEROKU_ID__C} = ANY(ARRAY[${expenseHerokuIds.map(id => { return `'${id}'` })}])
                `;

            return await client.query(checkQry);
        } catch (error) {
            throw error;
        }
    },
    // update multiple status for multiple expenses
    updateStatusForMultipleExpenses: async (status, reason, userSfid, expenseHerokuIds) => {
        try {
            // format query by adding WHEN clause
            const formatQuery = (columnName) => {
                let qry = '';
                for (const id of expenseHerokuIds) {
                    qry += `WHEN ${OBJECTKEYNAME.HEROKU_ID__C} = '${id}' AND ${columnName} > 0 THEN ${status}
                  `
                }
                return qry;
            }
            const updateQuery = `
            UPDATE ${SCHEMA.SALESFORCE.EXPENSE_LINE}
            SET
            ${[OBJECTKEYNAME.daily_allowance_status__c]} = 
            CASE 
            ${formatQuery(OBJECTKEYNAME.Daily_Allowance_Amount__c)}
            ELSE ${[OBJECTKEYNAME.daily_allowance_status__c]}
            END,
            ${[OBJECTKEYNAME.outstation_daily_allowance_status__c]} = 
            CASE 
            ${formatQuery(OBJECTKEYNAME.Outstation_Daily_Allowance_Amount__c)}
            ELSE ${[OBJECTKEYNAME.outstation_daily_allowance_status__c]}
            END,
            ${[OBJECTKEYNAME.local_conveyance_status__c]} = 
            CASE 
            ${formatQuery(OBJECTKEYNAME.Local_Conveyance_Amount__c)}
            ELSE ${[OBJECTKEYNAME.local_conveyance_status__c]}
            END,
            ${[OBJECTKEYNAME.fuel_status__c]} = 
            CASE 
            ${formatQuery(OBJECTKEYNAME.Fuel_Amount__c)}
            ELSE ${[OBJECTKEYNAME.fuel_status__c]}
            END,
            ${[OBJECTKEYNAME.travel_tickets_status__c]} = 
            CASE 
            ${formatQuery(OBJECTKEYNAME.Travel_Ticket_Amount__c)}
            ELSE ${[OBJECTKEYNAME.travel_tickets_status__c]}
            END,
            ${[OBJECTKEYNAME.company_vehicle_maintenance_status__c]} = 
            CASE 
            ${formatQuery(OBJECTKEYNAME.Company_Vehicle_Maintenance_Amount__c)}
            ELSE ${[OBJECTKEYNAME.company_vehicle_maintenance_status__c]}
            END,
            ${[OBJECTKEYNAME.postage_courier_status__c]} = 
            CASE 
            ${formatQuery(OBJECTKEYNAME.Postage_And_Courier__c)}
            ELSE ${[OBJECTKEYNAME.postage_courier_status__c]}
            END,
            ${[OBJECTKEYNAME.mobile_bill_status__c]} = 
            CASE 
            ${formatQuery(OBJECTKEYNAME.Mobile_Bill__c)}
            ELSE ${[OBJECTKEYNAME.mobile_bill_status__c]}
            END,
            ${[OBJECTKEYNAME.toll_tax_status__c]} = 
            CASE 
            ${formatQuery(OBJECTKEYNAME.Toll_Tax__c)}
            ELSE ${[OBJECTKEYNAME.toll_tax_status__c]}
            END,
            ${[OBJECTKEYNAME.others_status__c]} = 
            CASE 
            ${formatQuery(OBJECTKEYNAME.Other_Miscellaneous_Amount__c)}
            ELSE ${[OBJECTKEYNAME.others_status__c]}
            END,
            ${[OBJECTKEYNAME.hotel_stay_status__c]} = 
            CASE 
            ${formatQuery(OBJECTKEYNAME.Hotel_Bills__c)}
            ELSE ${[OBJECTKEYNAME.hotel_stay_status__c]}
            END,
            ${OBJECTKEYNAME.STATUS__C} = '${status ? EXPENSE_STATUS.APPROVED : EXPENSE_STATUS.REJECTED}',
            ${OBJECTKEYNAME.USER__C} = '${userSfid}',
            ${OBJECTKEYNAME.Remarks__C} = '${reason}'
            WHERE ${OBJECTKEYNAME.HEROKU_ID__C} = ANY(ARRAY[${expenseHerokuIds.map(heroku_id__c => { return `'${heroku_id__c}'` })}])
            `;
            await client.query(updateQuery);
        } catch (error) {
            throw error;
        }
    },
    // update expense status by id
    updateExpenseById: async({expenseHerokuId, status, reason, daily_allowance_status__c, outstation_daily_allowance_status__c, local_conveyance_status__c, fuel_status__c, travel_tickets_status__c, company_vehicle_maintenance_status__c, postage_courier_status__c, mobile_bill_status__c, toll_tax_status__c, others_status__c, hotel_stay_status__c, userSfid}) => {
        try {
            const updateQry = `
                UPDATE
                ${SCHEMA.SALESFORCE.EXPENSE_LINE}
                SET ${[OBJECTKEYNAME.daily_allowance_status__c]} = ${daily_allowance_status__c},
                ${[OBJECTKEYNAME.outstation_daily_allowance_status__c]} = ${outstation_daily_allowance_status__c},
                ${[OBJECTKEYNAME.local_conveyance_status__c]} = ${local_conveyance_status__c},
                ${[OBJECTKEYNAME.fuel_status__c]} = ${fuel_status__c},
                ${[OBJECTKEYNAME.travel_tickets_status__c]} = ${travel_tickets_status__c},
                ${[OBJECTKEYNAME.company_vehicle_maintenance_status__c]} = ${company_vehicle_maintenance_status__c},
                ${[OBJECTKEYNAME.postage_courier_status__c]} = ${postage_courier_status__c},
                ${[OBJECTKEYNAME.mobile_bill_status__c]} = ${mobile_bill_status__c},
                ${[OBJECTKEYNAME.toll_tax_status__c]} = ${toll_tax_status__c},
                ${[OBJECTKEYNAME.others_status__c]} = ${others_status__c},
                ${[OBJECTKEYNAME.hotel_stay_status__c]} = ${hotel_stay_status__c},
                ${OBJECTKEYNAME.STATUS__C} = '${status ? EXPENSE_STATUS.APPROVED : EXPENSE_STATUS.REJECTED}',
                ${OBJECTKEYNAME.USER__C} = '${userSfid}',
                ${OBJECTKEYNAME.Remarks__C} = '${reason}'
                WHERE ${OBJECTKEYNAME.HEROKU_ID__C} = '${expenseHerokuId}'
            `
            return await client.query(updateQry);
        } catch (error) {
            throw error;
        }
    },
    // get expense by id
    getExpenseById: async (expenseHerokuId) => {
        try {
            let qry = `SELECT 
                ${OBJECTKEYNAME.HEROKU_ID__C}
                FROM ${SCHEMA.SALESFORCE.EXPENSE_LINE} 
                WHERE
                ${OBJECTKEYNAME.HEROKU_ID__C} = '${expenseHerokuId}'
                `;

            return await client.query(qry);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = { Expense };