const {express} = require('../../server');
const { getAllAnnouncements } = require('../controllers/announcement');
const { updateAttendanceStatus, getAttendanceInformation, getPast2Attendances, markPreviousAttendance, getAttendanceHistory, getPendingAttendanceRequest, approvePendingAttendanceRequest } = require('../controllers/attendance');
const { userOtpLogin, verifyOtp, logoutUser } = require('../controllers/authenticate');
const { checkExpenseApprovalStatus, getExpenseTypes, createExpense, getExpenseByDate, submitExpense, submitMultipleExpenses, getExpense, getExpenseHistory, getExpensesLimit, getPendingExpenseApprovals, getPendingExpenseApprovalsById, approveMassExpensesRequest, approveExpenseRequestById } = require('../controllers/expense');
const { getAllFeedback, addNewFeedback, updateFeedbackStatus } = require('../controllers/feedback');
const { getDistributorMapping, getDistributorMappingById, getDepotsForDistributor, addDistributorsMappingDetails,getDistributors, updateDistributorMappingDetailsById } = require('../controllers/mapping/distributor');
const { addFarmerMappingDetails, getFarmerMappingDetails, getFarmerMappingDetailsById, updateFarmerMappingDetailsById } = require('../controllers/mapping/farmer');
const { addRetailerMappingDetails } = require('../controllers/mapping/retailer');
const { getPicklistData } = require('../controllers/picklist');
const { getAreaManager } = require('../controllers/user');
const authentication = require('../middleware/authentication');
const { API_END_POINT } = require('../utilities/constants');
const router = express.Router();

// all the routes are maintained here because after migrating from parse serve we have to keep all the api's endpoints same.

// authentication routes
router.post(`/${API_END_POINT.USER_LOGIN}`, userOtpLogin);
router.post(`/${API_END_POINT.VERIFY_OTP}`, verifyOtp);
router.post(`/${API_END_POINT.USER_LOGOUT}`, authentication, logoutUser);

// attendance routes
router.post(`/${API_END_POINT.Get_Attendance_Status}`, authentication, getAttendanceInformation);
router.post(`/${API_END_POINT.Get_Previous_Attendance_Status_History}`, authentication, getAttendanceHistory);
router.post(`/${API_END_POINT.Get_Previous_Attendance_History_For_Approvel}`, authentication, getPendingAttendanceRequest);
router.post(`/${API_END_POINT.Get_Previous_Attendance_Status}`, authentication, getPast2Attendances);
router.post(`/${API_END_POINT.Add_Previous_Attendance}`, authentication, markPreviousAttendance);
router.post(`/${API_END_POINT.UPDATE_ATTENDANCE_STATUS}`, authentication, updateAttendanceStatus);
router.post(`/${API_END_POINT.Update_Previous_Attendance_Status}`, authentication, approvePendingAttendanceRequest);

// user routes
router.post(`/${API_END_POINT.ASSIGN_TO}`, authentication, getAreaManager);


// picklist routes
router.post(`/${API_END_POINT.GET_PICKLIST_MASTER}`, authentication, getPicklistData);

// expense routes
router.post(`/${API_END_POINT.CHECK_EXPENSE_APPROVER_STATUS}`, authentication, checkExpenseApprovalStatus);
router.post(`/${API_END_POINT.GET_EXPENSE_TYPES}`, authentication, getExpenseTypes);
router.post(`/${API_END_POINT.CREATE_EXPENSE}`, authentication, createExpense);
router.post(`/${API_END_POINT.GET_EXPENSE_BY_DATE}`, authentication, getExpenseByDate);
router.post(`/${API_END_POINT.SUBMIT_EXPENSE}`, authentication, submitExpense);
router.post(`/${API_END_POINT.SUBMIT_MULTIPLE_EXPENSE}`, authentication, submitMultipleExpenses);
router.post(`/${API_END_POINT.GET_EXPENSE}`, authentication, getExpense);
router.post(`/${API_END_POINT.GET_EXPENSE_HISTORY}`, authentication, getExpenseHistory);
router.post(`/${API_END_POINT.GET_EXPENSE_LIMIT}`, authentication, getExpensesLimit);
router.post(`/${API_END_POINT.GET_EXPENSE_PENDING_APPROVAL}`, authentication, getPendingExpenseApprovals);
router.post(`/${API_END_POINT.GET_EXPENSE_PENDING_APPROVAL_BY_ID}`, authentication, getPendingExpenseApprovalsById);
router.post(`/${API_END_POINT.APPROVE_MASS_EXPENSE_PENDING_APPROVAL_BY_ID}`, authentication, approveMassExpensesRequest);
router.post(`/${API_END_POINT.APPROVE_EXPENSE_PENDING_APPROVAL_BY_ID}`, authentication, approveExpenseRequestById);

// announcement routes
router.post(`/${API_END_POINT.GET_ANNOUNCEMENTS}`, authentication, getAllAnnouncements);

// feedback routes
router.post(`/${API_END_POINT.ADD_FEEDBACK}`, authentication, addNewFeedback);
router.post(`/${API_END_POINT.UPDATE_FEEDBACK_STATUS}`, authentication, updateFeedbackStatus);
router.post(`/${API_END_POINT.GET_FEEDBACK}`, authentication, getAllFeedback);

// distributor routes
router.post(`/${API_END_POINT.GET_DISTRIBUTOR_MAPPING_DETAILS}`, authentication, getDistributorMapping);
router.post(`/${API_END_POINT.GET_DISTRIBUTOR_MAPPING_DETAILS_BY_ID}`, authentication, getDistributorMappingById);
router.post(`/${API_END_POINT.GET_DEPOTS_FOR_DISTRIBUTOR}`, authentication, getDepotsForDistributor);
router.post(`/${API_END_POINT.ADD_DISTRIBUTOR_MAPPING_DETAILS}`, authentication, addDistributorsMappingDetails);
router.post(`/${API_END_POINT.GET_DISTRIBUTORS}`, authentication, getDistributors);
router.post(`/${API_END_POINT.UPDATE_DISTRIBUTOR_MAPPING_DETAILS_BY_ID}`, authentication, updateDistributorMappingDetailsById);

// farmer routes
router.post(`/${API_END_POINT.ADD_FARMER_MAPPING_DETAILS}`, authentication, addFarmerMappingDetails);
router.post(`/${API_END_POINT.GET_FARMER_MAPPING_DETAILS}`, authentication, getFarmerMappingDetails);
router.post(`/${API_END_POINT.GET_FARMER_MAPPING_DETAILS_BY_ID}`, authentication, getFarmerMappingDetailsById);
router.post(`/${API_END_POINT.UPDATE_FARMER_MAPPING_DETAILS_BY_ID}`, authentication, updateFarmerMappingDetailsById);
//retailer routes 
router.post(`/${API_END_POINT.ADD_RETAILER_MAPPING_DETAILS}`, authentication, addRetailerMappingDetails);


module.exports = router;