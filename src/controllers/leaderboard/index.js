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

exports.insertLeaderBoard = async (score, scoreFor, userId) => {
    try {
       if (!(score && scoreFor && userId)) {
          return res.status(500).json(responseBody(MESSAGE.MISSINGPARAMS, API_END_POINT.INSERT_LEADERBOARD));
       }
 
       if (await leaderBoard.insertPoints(score,scoreFor,userId)) {
          // after the insertion is successful, update the user's score inside user object
          const updatedQry = `
             UPDATE ${SCHEMA.SALESFORCE.USER} 
             SET ${OBJECTKEYNAME.Total_Points__c} = COALESCE(${OBJECTKEYNAME.Total_Points__c}, 0) + ${score} 
            WHERE ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.SFID}='${userId}'
          `
          let response = await client.query(updatedQry)
 
          return { success: true, message: 'Insertion was successful' };
       }
       return { success: false, message: 'Insertion failed' };
    } catch (error) {
       console.error(error.message);
       throw error;
    }
 }