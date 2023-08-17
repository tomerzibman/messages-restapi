require('dotenv').config();

module.exports = {
    server: {
        port: process.env.SERVER_PORT
    },
    database: {
        uri: process.env.MONGODB_URI
    },
    auth: {
        skey: process.env.SECRECT_SIGN_KEY
    }
}