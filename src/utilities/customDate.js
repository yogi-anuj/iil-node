const moment = require('moment-timezone');

const formatDate = (date = moment()) => {
    try {
        return moment.tz(date, 'Asia/Kolkata').format('YYYY-MM-DD');
    } catch (error) {
        throw error;
    }
}


const getDaysDiffFromToday = (date) => {
    try {
        var a = moment(new Date());
        var b = moment(date, 'YYYY-MM-DD');
        return a.diff(b, 'days')
    } catch (error) {
        throw error;
    }

}

module.exports = {
    formatDate,
    getDaysDiffFromToday,
};