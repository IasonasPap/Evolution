const axios = require("axios");
const FormData = require('form-data');
const fs = require('fs');
const https = require('https');

const agent = new https.Agent({  
  rejectUnauthorized: false
})

exports.healthcheck = () => {
    axios({
        "url": "https://localhost:8765/evcharge/api/admin/healthcheck",
        "method": "get",
        httpsAgent: agent
    }).then ((response) => {
        console.log(response.data)
    })
}

exports.resetsessions = () => {
	axios({
		"url": "https://localhost:8765/evcharge/api/admin/resetsessions",
		"method": "post",
		httpsAgent: agent
	}).then ((response) => {
		console.log(response.data)
	}).catch( (err) => {
		console.error(err)
	})
}

exports.usermod = (username, password, isAdmin, isStationManager, key) => {
	axios({
		"url": 'https://localhost:8765/evcharge/api/admin/usermod/' + username + '/' + password,
		"method": "post",
		httpsAgent: agent,
		"data": {
			"isAdmin": isAdmin,
			"isStationManager": isStationManager
		},
		"headers": {'x-observatory-auth': key}
	}).then (() => {
		return axios({
			"url": "https://localhost:8765/evcharge/api/login",
			"method": "post",
			httpsAgent: agent,
			"data": {
				"username": username,
				"password": password
			}
		}).then ((response) => {
			console.log(response.data.token)
		})
	}).catch( (err) => {
		console.error(err.response.data)
	})
}

exports.users = (username, key) => {
	axios({
		"url": 'https://localhost:8765/evcharge/api/admin/users/' + username,
		"method": "get",
		httpsAgent: agent,
		"headers": {'x-observatory-auth': key}
	}).then ((response) => {
		delete response.data.password
		console.log(response.data)
		process.exit()
	})
	.catch((err) => {
		console.error(err.response.data)
	})
}

exports.sessionsupd = (source, key) => {
	const form_data = new FormData();
	form_data.append("file", fs.createReadStream(source));
	axios({
		"url": 'https://localhost:8765/evcharge/api/admin/system/sessionsupd',
		"method": "post",
		httpsAgent: agent,
		"headers": {
			'x-observatory-auth': key,
			'Content-Type': 'multipart/form-data',
			...form_data.getHeaders()
		},
		"data": form_data
	}).then ((response) => {
		console.log({message : response.data})
		process.exit()
	})
	.catch((err) => {
		if (!err.respone){
			console.error({error: err.message})
		}
		else {
			console.error(err.response.data)
		}
		process.exit()
	})
}