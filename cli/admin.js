const axios = require("axios");
const FormData = require('form-data');
const fs = require('fs');

exports.healthcheck = () => {
    axios({
        "url": "http://localhost:8765/evcharge/api/admin/healthcheck",
        "method": "get"
    }).then ((response) => {
        console.log(response.data)
    })
}

exports.resetsessions = () => {
	axios({
		"url": "http://localhost:8765/evcharge/api/admin/resetsessions",
		"method": "post"
	}).then ((response) => {
		console.log(response.data)
	}).catch( (err) => {
		console.error(err)
	})
}

exports.usermod = (username, password, isAdmin, isStationManager, key) => {
	axios({
		"url": 'http://localhost:8765/evcharge/api/admin/usermod/' + username + '/' + password,
		"method": "post",
		"data": {
			"isAdmin": isAdmin,
			"isStationManager": isStationManager
		},
		"headers": {'x-observatory-auth': key}
	}).then (() => {
		return axios({
			"url": "http://localhost:8765/evcharge/api/login",
			"method": "post",
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
		"url": 'http://localhost:8765/evcharge/api/admin/users/' + username,
		"method": "get",
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
		"url": 'http://localhost:8765/evcharge/api/admin/system/sessionsupd',
		"method": "post",
		"headers": {
			'x-observatory-auth': key,
			'Content-Type': 'multipart/form-data',
			...form_data.getHeaders()
		},
		"data": form_data
	}).then ((response) => {
		console.log(response.data)
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