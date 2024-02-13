const { API_END_POINT, MESSAGE } = require("../../utilities/constants");
const { responseBody } = require("../../utilities/customResponse");
const { announcement } = require("./query");


exports.getAllAnnouncements = async (req, res) =>{
    try {
        const response = await announcement.getAnnouncments();

        return res.json(responseBody(MESSAGE.FETCHSUCCESS, API_END_POINT.GET_ANNOUNCEMENTS, false, response.rows));
    } catch (error) {
        console.error(error);
        return res.status(500).json(responseBody(error.message, API_END_POINT.GET_ANNOUNCEMENTS));
    }
}