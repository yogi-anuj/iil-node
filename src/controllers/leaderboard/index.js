const { responseBody } = require("../../utilities/customResponse");
const { leaderBoard } = require("./query");
const {
    API_END_POINT,
    MESSAGE,
    USER_HIERARCHY,
    OBJECTKEYNAME,
    NOTIFICATION_FOR,
    firebaseAdmin,
    STATUS,
    DISTRIBUTOR_APPROVAL_STATUS,
    RECORD_TYPES,
  } = require("./../../utilities/constants");
const { UserModal } = require("../user/query");

exports.insertLeaderBoard = async (score, scoreFor, userId) => {
    try {
       if (!(score && scoreFor && userId)) {
          return res.status(500).json(responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.INSERT_LEADERBOARD));
       }
 
       if (await leaderBoard.insertPoints(score,scoreFor,userId)) {
          // after the insertion is successful, update the user's score inside user object
          
          let response = await UserModal.updateScore(score,userId);
 
          return { success: true, message: 'Insertion was successful' };
       }
       return { success: false, message: 'Insertion failed' };
    } catch (error) {
       console.error(error.message);
       throw error;
    }
 }