const { client } = require("../../../middleware/database/database");
const {
  SCHEMA,
  OBJECTKEYNAME,
  USER_HIERARCHY,
  RECORD_TYPES,
  DISTRIBUTOR_APPROVAL_STATUS,
  STATUS,
} = require("../../../utilities/constants");
const format = require("pg-format");
const leaderBoard={
   insertPoints:async(score,scoreFor,userId)=>{
      try{
         const insertQry = `
         INSERT INTO ${SCHEMA.SALESFORCE.LEADERBOARD__C} 
         (
             ${OBJECTKEYNAME.Points__c}, 
             ${OBJECTKEYNAME.Purpose__c}, 
             ${OBJECTKEYNAME.USER__C}
         ) 
         VALUES 
         (
             $1, $2, $3
         )
         `;
         await client.query(insertQry, [score, scoreFor, userId]);

      }
      catch(error){
         throw error;
      }
   }

};
module.exports={
   leaderBoard
}