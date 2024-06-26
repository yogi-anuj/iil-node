const { Client } = require('pg');
const { SERVERS } = require('../../utilities/constants');

let payload = {};
if(process.env.SERVER === SERVERS.PROD) {
    payload['user'] = process.env.PROD_DB_USER,
    payload['host'] = process.env.PROD_DB_HOST,
    payload['database'] = process.env.PROD_DB_NAME,
    payload['password'] = process.env.PROD_DB_PWD,
    payload['port'] = process.env.PROD_DB_PORT,
    payload['ssl'] = true
}else if(process.env.SERVER === SERVERS.STAGE) {
    payload['user'] = process.env.STAGE_DB_USER,
    payload['host'] = process.env.STAGE_DB_HOST,
    payload['database'] = process.env.STAGE_DB_NAME,
    payload['password'] = process.env.STAGE_DB_PWD,
    payload['port'] = process.env.STAGE_DB_PORT,
    payload['ssl'] = true
}else{
    payload['user'] = process.env.DEV_DB_USER,
    payload['host'] = process.env.DEV_DB_HOST,
    payload['database'] = process.env.DEV_DB_NAME,
    payload['password'] = process.env.DEV_DB_PWD,
    payload['port'] = process.env.DEV_DB_PORT,
    payload['ssl'] = true
}

const client = new Client(payload);

const connectDB = async () => {
    console.log(`Connecting to ${process.env.SERVER} db...`);
    try {
        await client.connect()
        console.log("db connected");
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    connectDB,
    client
};
