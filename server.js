const express = require("express");
const app = express();
require("dotenv").config();
const moment = require("moment-timezone");

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
moment(moment.utc(new Date()).format()).tz('Asia/Kolkata').format();

const SERVER = process.env.SERVER;
const PORT = SERVER === "development" ? process.env.DEV_PORT : process.env.PROD_PORT;

app.get("/" , (req, res) => res.send(`${SERVER} server API's up and running.`))

app.listen(PORT, () => {
    console.log(
        SERVER === "development" ?
            `development server started on port ${PORT}` :
            `production server started on port ${PORT}`
    );
})

module.exports = {
    app,
    express
}