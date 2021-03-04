const axios = require("axios");
const fs = require('fs');
const Promise = require('bluebird');

const fileWrite = Promise.promisify(fs.writeFile);
const fileUnlink = Promise.promisify(fs.unlink);

const https = require('https');

const agent = new https.Agent({  
  rejectUnauthorized: false
})

exports.login = (username, password) => {
    axios({
        "url": "https://localhost:8765/evcharge/api/login",
        "method": "post",
        httpsAgent: agent,
        "data": {
            "username": username,
            "password": password
        }
    }).then ((response) => {
        console.log(response.data.token)
        return fileWrite("./softeng20bAPI.token", response.data.token)
    }).catch( (err) => {
        console.error(err.response.data)
    })
}

exports.logout = (key) => {
    axios({
        "url": "https://localhost:8765/evcharge/api/logout",
        "method": "post",
        httpsAgent: agent,
        "headers": {'x-observatory-auth': key}
    }).then (() => {
        const filePath = './softeng20bAPI.token'; 
        return fileUnlink(filePath)
    }).then(() => {
        console.log({ message: "User logout successfully!"})
    }).catch( (err) => {
        if(!err.response) {
            console.error({error: err.message})
        }
        else {
            console.error(err.response.data)
        }
    })
}