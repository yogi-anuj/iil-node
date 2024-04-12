const { client } = require("../../middleware/database/database");
const { SCHEMA, OBJECTKEYNAME, USER_HIERARCHY, RECORDS_PER_PAGE } = require("../../utilities/constants");


const HierarchyWiseRegion = {
    getAll: async (userSfid, pageNumber = 1, profile__c, territory2Status, searchField) => {
        try {
            const getQry = `
            SELECT
            ${SCHEMA.SALESFORCE.STATE__C}.${OBJECTKEYNAME.NAME__C} as state_name__c,
            ${SCHEMA.SALESFORCE.STATE__C}.${OBJECTKEYNAME.SFID} as state_sfid,
            ${SCHEMA.SALESFORCE.DISTRICT__C}.${OBJECTKEYNAME.DISTRICT_NAME__C},
            ${SCHEMA.SALESFORCE.DISTRICT__C}.${OBJECTKEYNAME.SFID} as district_sfid,
            ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID} as sub_district_sfid,
            ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SUB_DISTRICT_NAME__C},
            ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} as village_sfid,
            ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.VILLAGE_NAME__C},
            ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.PINCODE__C}
            FROM
            ${SCHEMA.SALESFORCE.USER}`

            if (profile__c == USER_HIERARCHY.SI__user) {
                getQry += `
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} ON ${SCHEMA.SALESFORCE.TERRITORY__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
                INNER JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = ${SCHEMA.SALESFORCE.TERRITORY__C}.${OBJECTKEYNAME.SFID}       
                `
            } else if (profile__c == USER_HIERARCHY.AM__user || profile__c == USER_HIERARCHY.Crop_Advisor_user) {
                getQry += `
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
                INNER JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
                `
            } else if (profile__c == USER_HIERARCHY.RM__user) {
                getQry += `
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as RmRegion ON RmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.Rm_Region__c} = RmRegion.${OBJECTKEYNAME.SFID}
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
                INNER JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
                `
            } else if (profile__c == USER_HIERARCHY.ZM__user) {
                getQry += `
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as ZmRegion ON ZmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as RmRegion ON RmRegion.${OBJECTKEYNAME.Zm_Region__c} = ZmRegion.${OBJECTKEYNAME.SFID}
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.Rm_Region__c} = RmRegion.${OBJECTKEYNAME.SFID}
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
                INNER JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
                `
            } else if (profile__c == USER_HIERARCHY.VP_user) {
                getQry += `
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as VpRegion ON VpRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as ZmRegion ON ZmRegion.${OBJECTKEYNAME.Cluster_region__c} = VpRegion.${OBJECTKEYNAME.SFID}
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as RmRegion ON RmRegion.${OBJECTKEYNAME.Zm_Region__c} = ZmRegion.${OBJECTKEYNAME.SFID}
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.Rm_Region__c} = RmRegion.${OBJECTKEYNAME.SFID}
                INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
                INNER JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
                `
            }
            getQry += `
            INNER JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
            INNER JOIN ${SCHEMA.SALESFORCE.DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.DISTRICT__C} = ${SCHEMA.SALESFORCE.DISTRICT__C}.${OBJECTKEYNAME.SFID}
            INNER JOIN ${SCHEMA.SALESFORCE.STATE__C} ON ${SCHEMA.SALESFORCE.DISTRICT__C}.${OBJECTKEYNAME.STATE__C} = ${SCHEMA.SALESFORCE.STATE__C}.${OBJECTKEYNAME.SFID}
            WHERE
            ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.SFID} = '${userSfid}'
            AND
            ${SCHEMA.SALESFORCE.STATE__C}.${OBJECTKEYNAME.SFID} IS NOT NULL            
            `;
            
            if (territory2Status) {
                getQry += `
                UNION
                SELECT
                ${SCHEMA.SALESFORCE.STATE__C}.${OBJECTKEYNAME.NAME__C} as state_name__c,
                ${SCHEMA.SALESFORCE.STATE__C}.${OBJECTKEYNAME.SFID} as state_sfid,
                ${SCHEMA.SALESFORCE.DISTRICT__C}.${OBJECTKEYNAME.DISTRICT_NAME__C},
                ${SCHEMA.SALESFORCE.DISTRICT__C}.${OBJECTKEYNAME.SFID} as district_sfid,
                ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID} as sub_district_sfid,
                ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SUB_DISTRICT_NAME__C},
                ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SFID} as village_sfid,
                ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.VILLAGE_NAME__C},
                ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.PINCODE__C}
                FROM
                ${SCHEMA.SALESFORCE.USER}
                `

                if (profile__c == USER_HIERARCHY.SI__user) {
                    getQry += `
                    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} ON ${SCHEMA.SALESFORCE.TERRITORY__C}.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
                    INNER JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = ${SCHEMA.SALESFORCE.TERRITORY__C}.${OBJECTKEYNAME.SFID}       
                `
                } else if (profile__c == USER_HIERARCHY.AM__user || profile__c == USER_HIERARCHY.Crop_Advisor_user) {
                    getQry += `
                    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
                    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
                    INNER JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
                `
                } else if (profile__c == USER_HIERARCHY.RM__user) {
                    getQry += `
                    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as RmRegion ON RmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
                    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.Rm_Region__c} = RmRegion.${OBJECTKEYNAME.SFID}
                    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
                    INNER JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
                `
                } else if (profile__c == USER_HIERARCHY.ZM__user) {
                    getQry += `
                    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as ZmRegion ON ZmRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
                    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as RmRegion ON RmRegion.${OBJECTKEYNAME.Zm_Region__c} = ZmRegion.${OBJECTKEYNAME.SFID}
                    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.Rm_Region__c} = RmRegion.${OBJECTKEYNAME.SFID}
                    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
                    INNER JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
                `
                } else if (profile__c == USER_HIERARCHY.VP_user) {
                    getQry += `
                    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as VpRegion ON VpRegion.${OBJECTKEYNAME.SFID} = ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.Territory_Mapping1__c}
                    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as ZmRegion ON ZmRegion.${OBJECTKEYNAME.Cluster_region__c} = VpRegion.${OBJECTKEYNAME.SFID}
                    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as RmRegion ON RmRegion.${OBJECTKEYNAME.Zm_Region__c} = ZmRegion.${OBJECTKEYNAME.SFID}
                    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as AmRegion ON AmRegion.${OBJECTKEYNAME.Rm_Region__c} = RmRegion.${OBJECTKEYNAME.SFID}
                    INNER JOIN ${SCHEMA.SALESFORCE.TERRITORY__C} as SiRegion ON SiRegion.${OBJECTKEYNAME.Amr_Region__c} = AmRegion.${OBJECTKEYNAME.SFID}
                    INNER JOIN ${SCHEMA.SALESFORCE.SUB_DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.Territory_Mapping__c} = SiRegion.${OBJECTKEYNAME.SFID}
                `
                }
                getQry += `
                    INNER JOIN ${SCHEMA.SALESFORCE.VILLAGE__C} ON ${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.SUB_DISTRICT__C} = ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.SFID}
                    INNER JOIN ${SCHEMA.SALESFORCE.DISTRICT__C} ON ${SCHEMA.SALESFORCE.SUB_DISTRICT__C}.${OBJECTKEYNAME.DISTRICT__C} = ${SCHEMA.SALESFORCE.DISTRICT__C}.${OBJECTKEYNAME.SFID}
                    INNER JOIN ${SCHEMA.SALESFORCE.STATE__C} ON ${SCHEMA.SALESFORCE.DISTRICT__C}.${OBJECTKEYNAME.STATE__C} = ${SCHEMA.SALESFORCE.STATE__C}.${OBJECTKEYNAME.SFID}
                    WHERE
                    ${SCHEMA.SALESFORCE.USER}.${OBJECTKEYNAME.SFID} = '${userSfid}'
                    AND
                    ${SCHEMA.SALESFORCE.STATE__C}.${OBJECTKEYNAME.SFID} IS NOT NULL            
                `;
            }

            if (searchField && searchField.length > 2) {
                getQry += `
                AND
                (${SCHEMA.SALESFORCE.VILLAGE__C}.${OBJECTKEYNAME.VILLAGE_NAME__C} iLIKE '${searchField}%')
                `;
            }

            getQry += `
            ORDER BY ${OBJECTKEYNAME.VILLAGE_NAME__C} ASC
            OFFSET (${pageNumber} - 1) * ${RECORDS_PER_PAGE}
            LIMIT ${RECORDS_PER_PAGE}
            `

            return await client.query(getQry);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = { HierarchyWiseRegion };