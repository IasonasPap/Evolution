const axios = require("axios");
const fs = require('fs');
const Promise = require('bluebird');

const fileWrite = Promise.promisify(fs.writeFile);
const fileUnlink = Promise.promisify(fs.unlink);

exports.login = (username, password) => {
    axios({
        "url": "http://localhost:8765/evcharge/api/login",
        "method": "post",
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
        "url": "http://localhost:8765/evcharge/api/logout",
        "method": "post",
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