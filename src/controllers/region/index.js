const { MESSAGE, API_END_POINT } = require("../../utilities/constants");
const { responseBody } = require("../../utilities/customResponse");
const { HierarchyWiseRegion } = require("./query");


function transformResponseToNestedStructure(response) {
    const groupedData = [];

    const stateMap = new Map();

    for (const row of response) {
        const {
            state_name__c,
            state_sfid,
            district_name__c,
            district_sfid,
            sub_district_sfid,
            sub_district_name__c,
            village_sfid,
            village_name__c,
        } = row;

        if (!stateMap.has(state_sfid)) {
            stateMap.set(state_sfid, {
                state_name_c: state_name__c,
                state_sfid: state_sfid,
                district: new Map(),
            });
        }

        if (!stateMap.get(state_sfid).district.has(district_sfid)) {
            stateMap.get(state_sfid).district.set(district_sfid, {
                district_name_c: district_name__c,
                district_sfid: district_sfid,
                sub_district: new Map(),
            });
        }

        if (!stateMap.get(state_sfid).district.get(district_sfid).sub_district.has(sub_district_sfid)) {
            stateMap.get(state_sfid).district.get(district_sfid).sub_district.set(sub_district_sfid, {
                sub_district_sfid: sub_district_sfid,
                sub_district_name_c: sub_district_name__c,
                village: [],
            });
        }

        stateMap.get(state_sfid).district.get(district_sfid).sub_district.get(sub_district_sfid).village.push({
            village_sfid: village_sfid,
            village_name_c: village_name__c,
        });
    }

    stateMap.forEach((stateData) => {
        const stateObj = {
            state_name_c: stateData.state_name_c,
            state_sfid: stateData.state_sfid,
            district: [],
        };

        stateData.district.forEach((districtData) => {
            const districtObj = {
                district_name_c: districtData.district_name_c,
                district_sfid: districtData.district_sfid,
                sub_district: [],
            };

            districtData.sub_district.forEach((subDistrictData) => {
                districtObj.sub_district.push(subDistrictData);
            });

            stateObj.district.push(districtObj);
        });

        groupedData.push(stateObj);
    });

    return groupedData;
}

exports.getHierarchyWiseRegion = async (req, res) => {
    try {
        const { territory_mapping2__c, sfid, profile__c } = req.payload;
        let { searchKey, pageNumber = 1, assignedHerarchy } = req.params;

        let territory2Status = territory_mapping2__c ? true : false;

        const response = await HierarchyWiseRegion.getAll(sfid, pageNumber, profile__c, territory2Status, searchKey);

        let responseData;

        if (assignedHerarchy) {
            responseData = transformResponseToNestedStructure(response.rows);
        } else {
            responseData = response.rows;
        }

        return res.json(responseBody(
            MESSAGE.FETCHSUCCESS,
            API_END_POINT.GET_HIERARCHY_WISE_REGION,
            false,
            responseData || []
        ));

    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(
                responseBody(error.message, API_END_POINT.GET_HIERARCHY_WISE_REGION)
            );

    }
}