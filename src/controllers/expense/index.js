const { API_END_POINT, MESSAGE, EXPENSE_TYPE, MAXIMUM_DA_ODA_DAYS, MAXIMUM_EXPENSE_CLAIMING_DAYS, OBJECTKEYNAME, EXPENSE_STATUS, STATUS } = require("../../utilities/constants");
const { getDaysDiffFromToday } = require("../../utilities/customDate");
const { responseBody } = require("../../utilities/customResponse");
const { getUniqueId } = require("../../utilities/uniqueId");
const { Approval } = require("../approval/query");
const { attendance } = require("../attendance/query");
const { Files } = require("../files/query");
const { UserModal } = require("../user/query");
const { Expense } = require("./query");

// check if the user has expense approver access
exports.checkExpenseApprovalStatus = async (req, res) => {
    try {
        const { sfid } = req.payload;

        // checking if the user is active
        const response = await Expense.checkExpenseAprrovalStatus(sfid);

        let checkResult = { status: response.rowCount ? true : false };

        return res.json(responseBody(MESSAGE.FETCHSUCCESS, API_END_POINT.CHECK_EXPENSE_APPROVER_STATUS, false, checkResult));
    } catch (error) {
        console.error(error);
        return res.status(500).json(responseBody(error.message, API_END_POINT.CHECK_EXPENSE_APPROVER_STATUS));
    }
}

// get all expenses types
exports.getExpenseTypes = (req, res) => {
    try {
        return res.json(responseBody(
            MESSAGE.FETCHSUCCESS,
            API_END_POINT.GET_EXPENSE_TYPES,
            false,
            Object.values(EXPENSE_TYPE)
        ));
    } catch (error) {
        console.error(error);
        return res.status(500).json(responseBody(error.message, API_END_POINT.GET_EXPENSE_TYPES));
    }
}

// create or update expense
const handleExpense = async (expense, expenseDate, userSfid, status) => {
    try {
        const { localConveyanceAmt, dailyAllowanceAmt, outstationDailyAllowanceAmt, vehicleCategory, fromOdometer, toOdometer, totalKm, fuelAmount, fromDate, toDate, totalDays, amount, miscellaneousAmt, vehicleType, urls, herokuId, comment, travelTicketAmt, companyVehicleMaintenanceAmt, postageAndCourier, mobileBill, tollTax, otherMiscellaneous, otherMiscellaneousAmt } = expense;

        if (!expenseDate) {
            return { created: false, reason: MESSAGE.MISSINGPARAMS };
        }

        if (outstationDailyAllowanceAmt && dailyAllowanceAmt) {
            return { created: false, reason: MESSAGE.LOCAL_CONVEYANCE_AND_OUTSTATION_CONFLICTS };
        }

        if ((localConveyanceAmt && typeof localConveyanceAmt !== 'number') || (dailyAllowanceAmt && typeof dailyAllowanceAmt !== 'number') || (outstationDailyAllowanceAmt && typeof outstationDailyAllowanceAmt !== 'number') || (miscellaneousAmt && typeof miscellaneousAmt !== 'number')) {
            return { created: false, reason: MESSAGE.INVALID_DATA_TYPE };
        }

        if (herokuId || (userSfid && expenseDate)) {
            // delete the previous record and then create a new record for urls as well
            await Files.deleteExpenseFileDetailById(herokuId);
            await Expense.deleteExpense(herokuId, userSfid, expenseDate);
        }

        const newHerokuId = getUniqueId();

        const expenseResponse = await Expense.createExpense({
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
            userSfid,
            status
        });

        // create multiple records for different file urls
        let insertData = [];
        if (urls.length) {
            for (let index = 0; index < urls.length; index++) {
                let { name = '', url = '' } = urls[index];
                if (!(name && url)) {
                    return { message: 'Files missing params', created: false };
                }
                insertData.push([name, url, newHerokuId, getUniqueId()]);
            }

            await Files.insertMultipleExpenseFiles(insertData);
        }

        if (expenseResponse.rowCount) {
            return { created: true, herokuId: newHerokuId };
        }
        return { created: false, reason: MESSAGE.SOMETHING_WENT_WRONG };
    } catch (error) {
        throw error;
    }
}


// create expense for a user
exports.createExpense = async (req, res) => {
    try {
        const { expense, expenseDate } = req.body;
        const { sfid } = req.payload;

        // checking attendance for a specific date and restrict if attendance is not marked.
        const checkAttendance = await attendance.checkAttendanceForDate(sfid, expenseDate);

        if (!checkAttendance.rowCount) {
            return res.status(404).json(responseBody(MESSAGE.ATTENDANCE_NOT_FOUND, API_END_POINT.CREATE_EXPENSE));
        }

        // check if there is an expense already in pending or approved for that date and restrict
        const checkPendingOrApprovedExpenseResponse = await Expense.checkPendingOrApprovedExpenseQry(sfid, expenseDate);

        if (!checkPendingOrApprovedExpenseResponse.rowCount) {
            return res.status(404).json(responseBody(MESSAGE.EXPENSE_APPROVED_OR_PENDING, API_END_POINT.CREATE_EXPENSE));
        }

        // check if DA + ODA doesn't exceed 26 days for the current month
        const totalDays = await Expense.getTotalDaOdaForCurrentMonth(sfid);

        if (!totalDays.rowCount && totalDays.rows[0].totalcount >= MAXIMUM_DA_ODA_DAYS) {
            return res.status(404).json(responseBody(MESSAGE.DA_ODA_LIMIT_EXCEED, API_END_POINT.CREATE_EXPENSE));
        }

        // check if the claiming date is 45 days old
        let days = getDaysDiffFromToday(expenseDate);
        if (days > MAXIMUM_EXPENSE_CLAIMING_DAYS) {
            return res.status(404).json(responseBody(
                MESSAGE.MAXIMUM_EXPENSE_CLAIMING_DAYS_EXCEED,
                API_END_POINT.CREATE_EXPENSE
            ));
        }

        // create expense
        const response = await handleExpense(expense, expenseDate, currentUser.attributes.sfid, EXPENSE_STATUS.DRAFT);
        if (!response.created) {
            return res.status(404).json(responseBody(`Expense ${MESSAGE.INSERTED_FAIL}`, API_END_POINT.CREATE_EXPENSE, true, response));
        }
        return res.json(responseBody(`Expense ${MESSAGE.INSERTED_SUCCESS}`, API_END_POINT.CREATE_EXPENSE, false, response));

    } catch (error) {
        console.error(error);
        return res.status(500).json(responseBody(error.message, API_END_POINT.CREATE_EXPENSE));
    }
}


// get expense by date
exports.getExpenseByDate = async (req, res) => {
    try {
        const { expenseDate } = req.body;
        const { sfid } = req.payload;

        // get expense by date
        const expense = await Expense.getExpenseByDate(expenseDate, sfid);

        // get file details from expense id
        const fileResponse = await Files.getExpenseFiles(expense.rows[0].heroku_id__c);

        return res.json(responseBody(MESSAGE.FETCHSUCCESS, API_END_POINT.GET_EXPENSE_BY_DATE, false, { ...expense.rows[0], urls: fileResponse.rows }));
    } catch (error) {
        console.error(error);
        return res.status(500).json(responseBody(error.message, API_END_POINT.GET_EXPENSE_BY_DATE));
    }
}

// submit expense
exports.submitExpense = async (req, res) => {
    try {

        const { expense, expenseDate } = req.body;
        const { sfid } = req.payload;

        const response = await handleExpense(expense, expenseDate, sfid, EXPENSE_STATUS.PENDING);

        if (!response.created) {
            return res.status(404).json(responseBody(`Expense submission failed`, API_END_POINT.SUBMIT_EXPENSE, true, response));
        }

        // before submitting checking if a new group can be created
        const expensePreviousAndNextDatesRes = await Expense.expensePreviousAndNextDatesQry(sfid, expenseDate);

        // create new group id
        let groupIdValue = getUniqueId();

        // group the expense only if all the below condtions are satisfied
        if (expensePreviousAndNextDatesRes.rowCount && expensePreviousAndNextDatesRes.rows[0].date__c == expenseDate && expensePreviousAndNextDatesRes.rows[0].previous_group_id__c == expensePreviousAndNextDatesRes.rows[0].next_group_id__c) {
            groupIdValue = expensePreviousAndNextDatesRes.rows[0].next_group_id__c;
        }

        await Expense.updateExpenseGroupQry(false, startDate = '', endDate = '', sfid, groupIdValue, response.herokuId);

        await Approval.expenseApproval(response.herokuId, sfid, STATUS.PENDING);

        return res.json(responseBody(`Expense ${MESSAGE.UPDATESUCCESS}`, API_END_POINT.SUBMIT_EXPENSE, false, groupIdValue));
    } catch (error) {
        console.error(error);
        return res.status(500).json(responseBody(error.message, API_END_POINT.SUBMIT_EXPENSE));
    }
}

// submit multiple expenses
exports.submitMultipleExpenses = async (req, res) => {
    try {
        let { startDate, endDate } = req.body;
        let { sfid } = req.payload;

        if (!startDate || !(startDate && endDate)) {
            return res.status(404).json(responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.SUBMIT_MULTIPLE_EXPENSE));
        }

        let expensePreviousAndNextDatesForStartDateRes = await Expense.expensePreviousAndNextDatesQry(sfid, startDate);
        let expensePreviousAndNextDatesForEndDateRes = await Expense.expensePreviousAndNextDatesQry(sfid, endDate);

        // new group id
        let groupIdValue = getUniqueId();

        // group the expense only if all the below condtions are satisfied
        if (expensePreviousAndNextDatesForStartDateRes.rowCount && expensePreviousAndNextDatesForEndDateRes.rowCount) {
            let startDateRes = expensePreviousAndNextDatesForStartDateRes.rows[0];
            let endDateRes = expensePreviousAndNextDatesForEndDateRes.rows[0];

            // case 1: 
            if (startDateRes.previous_group_id__c && startDateRes.next_group_id__c && endDateRes.previous_group_id__c && !endDateRes.next_group_id__c) {
                // update the group of startDateRes.previous_group_id__c to every date inside the dates range
                groupIdValue = startDateRes.previous_group_id__c;
            }
            // case 2: 
            else if (!startDateRes.previous_group_id__c && startDateRes.next_group_id__c && endDateRes.previous_group_id__c && endDateRes.next_group_id__c) {
                // update the group of endDateRes.previous_group_id__c to every date inside the dates range
                groupIdValue = endDateRes.previous_group_id__c;
            }
        }

        // update all the records in the expense list for the given dates
        await Expense.updateExpenseGroupQry(true, startDate, endDate, currentUser.attributes.sfid, groupIdValue, herokuId = '');

        // for multiple expense approval requests
        // all the records in the expense list from startDate to endDate for the user
        let multipleExpenseRecords = await Expense.multipleExpenseRecords(startDate, endDate, sfid);

        if (multipleExpenseRecords.rowCount) {
            let insertData = [];
            for (let index = 0; index < multipleExpenseRecords.rows.length; index++) {
                let { heroku_id__c } = multipleExpenseRecords.rows[index];
                insertData.push([heroku_id__c, getUniqueId(), sfid, STATUS.PENDING],);
            }

            await Approval.insertMultipleExpenseForApproval(insertData);
        }

        return res.json(responseBody(MESSAGE.SUBMIT_MULTIPLE_EXPENSE, API_END_POINT.SUBMIT_MULTIPLE_EXPENSE, false));

    } catch (error) {
        console.error(error);
        return res.status(500).json(responseBody(error.message, API_END_POINT.SUBMIT_MULTIPLE_EXPENSE));
    }
}


// get rejected and draft expenses
exports.getExpense = async (req, res) => {
    try {
        let { pageNumber = 1 } = req.body;
        let { sfid } = req.payload;

        // get draft and rejected expenses
        let response = await Expense.getExpense(sfid, pageNumber);

        return res.json(responseBody(MESSAGE.FETCHSUCCESS, API_END_POINT.GET_EXPENSE, false, response.rows));
    } catch (error) {
        console.error(error);
        return res.status(500).json(responseBody(error.message, API_END_POINT.GET_EXPENSE));
    }
}


// get expense history
exports.getExpenseHistory = async (req, res) => {
    try {
        let { pageNumber = 1 } = req.body;
        let { sfid } = req.payload;

        // get draft and rejected expenses
        let response = await Expense.getExpenseHistory(sfid, pageNumber);

        let tempObj = {};
        response.rows.map(row => {
            if (tempObj[`${row.group_id__c}`] == undefined) {
                tempObj[`${row.group_id__c}`] = {
                    'start_date': '',
                    'end_date': '',
                    'data': [],
                }
            }
            tempObj[`${row.group_id__c}`].data.push(row)
        });

        // structuring the response object
        let responseObj = Object.values(tempObj).map(data => {
            if (data.data.length > 1) {
                let total = data.data.length;
                return {
                    ...data,
                    start_date: data.data[0].date,
                    end_date: data.data[total - 1].date,
                }
            } else {
                return {
                    ...data,
                    start_date: data.data[0].date,
                    end_date: data.data[0].date,
                }
            }
        });

        return res.json(responseBody(MESSAGE.FETCHSUCCESS, API_END_POINT.GET_EXPENSE_HISTORY, false, responseObj));
    } catch (error) {
        console.error(error);
        return res.status(500).json(responseBody(error.message, API_END_POINT.GET_EXPENSE_HISTORY));
    }
}


// get expense limits
exports.getExpensesLimit = async (req, res) => {
    try {
        const { sfid } = req.payload;

        const hrPolicyLevel = await UserModal.getHrPolicy(sfid);

        if (!hrPolicyLevel.rowCount || !hrPolicyLevel.rows[0].hr_policy_profile__c) {
            return res.status(404).json(responseBody('HR Policy Profile not assigned', API_END_POINT.GET_EXPENSE_LIMIT));
        }

        let response = await Expense.getExpenseLimit(hrPolicyLevel.rows[0].hr_policy_profile__c);

        if (!response.rowCount) {
            return res.status(404).json(responseBody(MESSAGE.DATA_NOT_FOUND, API_END_POINT.GET_EXPENSE_LIMIT));
        }
        return res.json(responseBody(MESSAGE.FETCHSUCCESS, API_END_POINT.GET_EXPENSE_LIMIT, response.rows[0]));
    } catch (error) {
        console.error(error);
        return res.status(500).json(responseBody(error.message, API_END_POINT.GET_EXPENSE_LIMIT));
    }
}


// get pending expense approval requests
exports.getPendingExpenseApprovals = async (req, res) => {
    try {
        let { pageNumber = 1 } = req.body;
        let { sfid } = req.payload;

        let response = await Expense.getPendingApprovalRequests(sfid, pageNumber);

        let tempObj = {};
        response.rows.map(row => {
            if (tempObj[`${row.group_id__c}`] == undefined) {
                tempObj[`${row.group_id__c}`] = {
                    'start_date': '',
                    'end_date': '',
                    'userName': '',
                    'userSfid': '',
                    'data': [],
                }
            }
            tempObj[`${row.group_id__c}`].data.push(row)
        });

        // structuring the response object
        let responseObj = Object.values(tempObj).map(data => {
            if (data.data.length > 1) {
                let total = data.data.length;
                return {
                    ...data,
                    userName: data.data[0].username,
                    userSfid: data.data[0].usersfid,
                    start_date: data.data[0].date,
                    end_date: data.data[total - 1].date,
                }
            } else {
                return {
                    ...data,
                    userName: data.data[0].username,
                    userSfid: data.data[0].usersfid,
                    start_date: data.data[0].date,
                    end_date: data.data[0].date,
                }
            }
        });
        console.log("checking res obj", responseObj);
        return res.json(responseBody(MESSAGE.FETCHSUCCESS, API_END_POINT.GET_EXPENSE_PENDING_APPROVAL, false, responseObj))
    } catch (error) {
        console.error(error);
        return res.status(500).json(responseBody(error.message, API_END_POINT.GET_EXPENSE_PENDING_APPROVAL));
    }
}


// get pending expense approval requests by id
exports.getPendingExpenseApprovalsById = async (req, res) => {
    try {
        let { expenseHerokuId } = req.body;

        if (!expenseHerokuId) {
            return res.status(404).json(responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.GET_EXPENSE_PENDING_APPROVAL_BY_ID));
        }

        let response = await Expense.getPendingApprovalRequestsById(expenseHerokuId);

        let urlResponse = [];
        if (response.rowCount) {
            let urlQryResponse = await Files.getExpenseFiles(expenseHerokuId);
            urlResponse = urlQryResponse.rows;
        }

        return res.json(responseBody(MESSAGE.FETCHSUCCESS, API_END_POINT.GET_EXPENSE_PENDING_APPROVAL_BY_ID, false, { ...response.rows[0], urls: urlResponse }));
    } catch (error) {
        console.error(error);
        return res.status(500).json(responseBody(error.message, API_END_POINT.GET_EXPENSE_PENDING_APPROVAL_BY_ID));
    }
}


// approve mass expense requests
exports.approveMassExpensesRequest = async (req, res) => {
    try {
        let { expenseHerokuIds, status, reason } = req.body;
        let { sfid } = req.payload;

        if ((typeof status != 'boolean' || !Array.isArray(expenseHerokuIds))) {
            return res.status(404).json(responseBody(MESSAGE.INVALID_DATA_TYPE, API_END_POINT.APPROVE_MASS_EXPENSE_PENDING_APPROVAL_BY_ID));
        }

        // if manager rejects then reason is mandatory also there must be list of expenseHerokuIds
        if (!expenseHerokuIds.length || (status === false && !reason)) {
            return res.status(404).json(responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.APPROVE_MASS_EXPENSE_PENDING_APPROVAL_BY_ID));
        }

        // check all the expenses if exists
        let expenses = await Expense.getMultipleExpenses(expenseHerokuIds);

        // taking only the ids which exists
        expenseHerokuIds = expenses.rows.map(row => { return row.heroku_id__c });

        if (expenses.rowCount) {
            // update expenses status for multiple expense rows 
            await Expense.updateStatusForMultipleExpenses(status, reason, sfid, expenseHerokuIds);

            // update approval records
            await Approval.approveMultipleExpenses(expenseHerokuIds, status, reason, sfid);

            return res.json(responseBody(MESSAGE.UPDATESUCCESS, API_END_POINT.APPROVE_MASS_EXPENSE_PENDING_APPROVAL_BY_ID, false));
        }
        return res.status(404).json(responseBody(MESSAGE.UPDATEFAIL, API_END_POINT.APPROVE_MASS_EXPENSE_PENDING_APPROVAL_BY_ID));
    } catch (error) {
        console.error(error);
        return res.status(500).json(responseBody(error.message, API_END_POINT.APPROVE_MASS_EXPENSE_PENDING_APPROVAL_BY_ID));
    }
}


// approve expense by id
exports.approveExpenseRequestById = async (req, res) => {
    try {
        let { sfid } = req.payload;

        let { expenseHerokuId, status, reason, daily_allowance_status__c, outstation_daily_allowance_status__c, local_conveyance_status__c, fuel_status__c, travel_tickets_status__c, company_vehicle_maintenance_status__c, postage_courier_status__c, mobile_bill_status__c, toll_tax_status__c, others_status__c, hotel_stay_status__c } = req.body;

        if (typeof status != 'boolean') {
            return res.status(404).json(responseBody(MESSAGE.INVALID_DATA_TYPE, API_END_POINT.APPROVE_EXPENSE_PENDING_APPROVAL_BY_ID));
        }

        // if manager rejects then reason is mandatory
        if (status === false && !reason) {
            return res.status(404).json(responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.APPROVE_EXPENSE_PENDING_APPROVAL_BY_ID));
        }

        // check if the expense exists
        let expense = await Expense.getExpenseById(expenseHerokuId);

        if(!expense.rowCount){
            return res.status(404).json(responseBody(MESSAGE.DATA_NOT_FOUND, API_END_POINT.APPROVE_EXPENSE_PENDING_APPROVAL_BY_ID));
        }

        // update expense all status by id
        await Expense.updateExpenseById({expenseHerokuId, status, reason, daily_allowance_status__c, outstation_daily_allowance_status__c, local_conveyance_status__c, fuel_status__c, travel_tickets_status__c, company_vehicle_maintenance_status__c, postage_courier_status__c, mobile_bill_status__c, toll_tax_status__c, others_status__c, hotel_stay_status__c, userSfid: sfid});

        // approve expense request
        await Approval.approveExpenseById(expenseHerokuId, status, reason, sfid);

        return res.json(responseBody(MESSAGE.UPDATESUCCESS, API_END_POINT.APPROVE_EXPENSE_PENDING_APPROVAL_BY_ID, false));

    } catch (error) {
        console.error(error);
        return res.status(500).json(responseBody(error.message, API_END_POINT.APPROVE_EXPENSE_PENDING_APPROVAL_BY_ID));
    }
}

