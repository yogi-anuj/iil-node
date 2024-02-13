const { client } = require("../../middleware/database/database");
const { USER_HIERARCHY, OBJECTKEYNAME, SCHEMA, RECORDS_PER_PAGE, STATUS } = require("../../utilities/constants");



const feedback = {
    // add new feedback
    addNewFeedback: async (Complaint_Type__c, Subject__c, Description__c, userType, accountId, uniqueId, userSfid) => {
        try {
            let insertQuery = `INSERT INTO ${SCHEMA.SALESFORCE.FEEDBACK__C} (
            ${OBJECTKEYNAME.COMPLAIN_TYPE__C},
            ${OBJECTKEYNAME.SUBJECT__C},
            ${OBJECTKEYNAME.DESCRIPTION__C},
            ${OBJECTKEYNAME.Distributor_Account__c},
            ${OBJECTKEYNAME.ACCOUNT__C},
            ${OBJECTKEYNAME.HEROKU_ID__C},
            ${OBJECTKEYNAME.OWNER__C},
            ${OBJECTKEYNAME.STATUS__C}
            ) VALUES (
            '${Complaint_Type__c}',
            '${Subject__c}',
            '${Description__c}',
            '${userType}',
            '${accountId}',
            '${uniqueId}',
            '${userSfid}',
            '${STATUS.PENDING}') RETURNING heroku_id__c`;

            return await client.query(insertQuery);
        } catch (error) {
            throw error;
        }
    },
    // get all the feedbacks
    getFeedback: async (profile, ownerId, territory2Status, pageNumber = 1) => {
        try {
            if (!(ownerId && profile)) {
                return "Missing params";
            }
            let qry = '';
            if (profile === USER_HIERARCHY.VP_user) {
                qry += `
                SELECT
                DISTINCT ON (ZmFeedback.${OBJECTKEYNAME.SFID}, ZmFeedback.${OBJECTKEYNAME.CREATED_DATE})
                ZmFeedback.${OBJECTKEYNAME.SFID},
                ZmFeedback.${OBJECTKEYNAME.HEROKU_ID__C},
                ZmFeedback.${OBJECTKEYNAME.COMPLAIN_TYPE__C},
                ZmFeedback.${OBJECTKEYNAME.SUBJECT__C},
                ZmFeedback.${OBJECTKEYNAME.DESCRIPTION__C},
                ZmFeedback.${OBJECTKEYNAME.Distributor_Account__c},
                ZmFeedback.${OBJECTKEYNAME.STATUS__C},
                TO_CHAR(ZmFeedback.${OBJECTKEYNAME.CREATED_DATE}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.CREATED_DATE},
                userGrp.${OBJECTKEYNAME.NAME__C},
                userGrp.${OBJECTKEYNAME.PROFILE__C},
                accountUser.${OBJECTKEYNAME.NAME} as accountName
                FROM
                ${SCHEMA.SALESFORCE.USER}
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as zmRegion ON zmRegion.${OBJECTKEYNAME.Cluster_region__c} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as rmRegion ON rmRegion.${OBJECTKEYNAME.Zm_Region__c} = zmRegion.${OBJECTKEYNAME.SFID}
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as amRegion ON amRegion.${OBJECTKEYNAME.Rm_Region__c} = rmRegion.${OBJECTKEYNAME.SFID}
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as siRegion ON siRegion.${OBJECTKEYNAME.Amr_Region__c} = amRegion.${OBJECTKEYNAME.SFID}
                INNER JOIN ${SCHEMA.SALESFORCE.USER} as userGrp ON (userGrp.${OBJECTKEYNAME.Territory_Mapping1__c} = zmRegion.${OBJECTKEYNAME.SFID} OR userGrp.${OBJECTKEYNAME.Territory_Mapping1__c} = rmRegion.${OBJECTKEYNAME.SFID} OR userGrp.${OBJECTKEYNAME.Territory_Mapping1__c} = amRegion.${OBJECTKEYNAME.SFID} OR userGrp.${OBJECTKEYNAME.Territory_Mapping1__c} = siRegion.${OBJECTKEYNAME.SFID})
                INNER JOIN ${SCHEMA.SALESFORCE.FEEDBACK__C} as ZmFeedback ON ZmFeedback.${OBJECTKEYNAME.OWNER__C} = userGrp.${OBJECTKEYNAME.SFID}
                INNER JOIN ${SCHEMA.SALESFORCE.ACCOUNT} as accountUser ON accountUser.${OBJECTKEYNAME.SFID} = ZmFeedback.${OBJECTKEYNAME.ACCOUNT__C}
                WHERE
                ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.SFID} = '${ownerId}'
                `
                if (territory2Status) {
                    qry += `
                  UNION
                  SELECT
                  DISTINCT ON (ZmFeedback.${OBJECTKEYNAME.SFID}, ZmFeedback.${OBJECTKEYNAME.CREATED_DATE})
                  ZmFeedback.${OBJECTKEYNAME.SFID},
                  ZmFeedback.${OBJECTKEYNAME.HEROKU_ID__C},
                  ZmFeedback.${OBJECTKEYNAME.COMPLAIN_TYPE__C},
                  ZmFeedback.${OBJECTKEYNAME.SUBJECT__C},
                  ZmFeedback.${OBJECTKEYNAME.DESCRIPTION__C},
                  ZmFeedback.${OBJECTKEYNAME.Distributor_Account__c},
                  ZmFeedback.${OBJECTKEYNAME.STATUS__C},
                  TO_CHAR(ZmFeedback.${OBJECTKEYNAME.CREATED_DATE}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.CREATED_DATE},
                  userGrp.${OBJECTKEYNAME.NAME__C},
                  userGrp.${OBJECTKEYNAME.PROFILE__C},
                  accountUser.${OBJECTKEYNAME.NAME} as accountName
                  FROM
                  ${SCHEMA.SALESFORCE.USER}
                  INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as zmRegion ON zmRegion.${OBJECTKEYNAME.Cluster_region__c} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping2__c}
                  INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as rmRegion ON rmRegion.${OBJECTKEYNAME.Zm_Region__c} = zmRegion.${OBJECTKEYNAME.SFID}
                  INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as amRegion ON amRegion.${OBJECTKEYNAME.Rm_Region__c} = rmRegion.${OBJECTKEYNAME.SFID}
                  INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as siRegion ON siRegion.${OBJECTKEYNAME.Amr_Region__c} = amRegion.${OBJECTKEYNAME.SFID}
                  INNER JOIN ${SCHEMA.SALESFORCE.USER} as userGrp ON (userGrp.${OBJECTKEYNAME.Territory_Mapping2__c} = zmRegion.${OBJECTKEYNAME.SFID} OR userGrp.${OBJECTKEYNAME.Territory_Mapping2__c} = rmRegion.${OBJECTKEYNAME.SFID} OR userGrp.${OBJECTKEYNAME.Territory_Mapping2__c} = amRegion.${OBJECTKEYNAME.SFID} OR userGrp.${OBJECTKEYNAME.Territory_Mapping2__c} = siRegion.${OBJECTKEYNAME.SFID})
                  INNER JOIN ${SCHEMA.SALESFORCE.FEEDBACK__C} as ZmFeedback ON ZmFeedback.${OBJECTKEYNAME.OWNER__C} = userGrp.${OBJECTKEYNAME.SFID}
                  INNER JOIN ${SCHEMA.SALESFORCE.ACCOUNT} as accountUser ON accountUser.${OBJECTKEYNAME.SFID} = ZmFeedback.${OBJECTKEYNAME.ACCOUNT__C}
                  WHERE
                  ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.SFID} = '${ownerId}'                  
                  `;
                }
                qry += `
                  ORDER BY ZmFeedback.${OBJECTKEYNAME.CREATED_DATE} DESC
                  OFFSET (${pageNumber} - 1) * ${RECORDS_PER_PAGE}
                  LIMIT ${RECORDS_PER_PAGE}
                `;
            } else {
                qry += `
                SELECT 
                  ${SCHEMA.SALESFORCE.FEEDBACK__C}.${OBJECTKEYNAME.SFID},
                  ${SCHEMA.SALESFORCE.FEEDBACK__C}.${OBJECTKEYNAME.HEROKU_ID__C},
                  ${SCHEMA.SALESFORCE.FEEDBACK__C}.${OBJECTKEYNAME.COMPLAIN_TYPE__C},
                  ${SCHEMA.SALESFORCE.FEEDBACK__C}.${OBJECTKEYNAME.SUBJECT__C},
                  ${SCHEMA.SALESFORCE.FEEDBACK__C}.${OBJECTKEYNAME.DESCRIPTION__C},
                  ${SCHEMA.SALESFORCE.FEEDBACK__C}.${OBJECTKEYNAME.STATUS__C},
                  ${SCHEMA.SALESFORCE.FEEDBACK__C}.${OBJECTKEYNAME.Distributor_Account__c},
                  TO_CHAR(${SCHEMA.SALESFORCE.FEEDBACK__C}.${OBJECTKEYNAME.CREATED_DATE}, 'YYYY-MM-DD') as ${OBJECTKEYNAME.CREATED_DATE},
                  userGrp.${OBJECTKEYNAME.NAME__C},
                  userGrp.${OBJECTKEYNAME.PROFILE__C},
                  accountUser.${OBJECTKEYNAME.NAME} as accountName
                FROM 
                ${SCHEMA.SALESFORCE.FEEDBACK__C} 
                INNER JOIN ${SCHEMA.SALESFORCE.ACCOUNT} as accountUser ON accountUser.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.FEEDBACK__C}.${OBJECTKEYNAME.ACCOUNT__C}
                INNER JOIN ${SCHEMA.SALESFORCE.USER} as userGrp ON userGrp.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.FEEDBACK__C}.${OBJECTKEYNAME.OWNER__C}
                WHERE 
                ${SCHEMA.SALESFORCE.FEEDBACK__C}.${OBJECTKEYNAME.OWNER__C} = '${ownerId}' 
                ORDER BY createddate DESC
                OFFSET (${pageNumber} - 1) * ${RECORDS_PER_PAGE}
                LIMIT ${RECORDS_PER_PAGE}
                `;
            }

            return await client.query(qry);
        } catch (error) {
            throw error;
        }
    },
    // update feedback status
    updateFeedbackStatus: async (feedbackStatus, herokuId) => {
        try {
            const updateQry = `
            UPDATE
            ${SCHEMA.SALESFORCE.FEEDBACK__C}
            SET
            ${OBJECTKEYNAME.STATUS__C} = '${feedbackStatus}'
            WHERE
            ${OBJECTKEYNAME.HEROKU_ID__C} = '${herokuId}'
            `;
            
            return await client.query(updateQry);
        } catch (error) {
            throw error;
        }
    }
}


module.exports = { feedback };