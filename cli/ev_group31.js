const FormData = require('form-data');
const axios = require("axios")
const fs = require('fs');
const Promise = require('bluebird');

const fileWrite = Promise.promisify(fs.writeFile);
const fileUnlink = Promise.promisify(fs.unlink);

argv = process.argv

scope = argv[2]

for (var i = 0, j = argv.length; i < j; i++){
	if ((argv[i] == '--apikey')){
		if ((i+1) < argv.length){
			key = argv[i+1]
		}
		else {
			console.log({error: `You need to provide ${argv[i]} value!`})
			process.exit()
		}
	}
	else if ((argv[i] == '--format')){
		if ((i+1) < argv.length){
			format = argv[i+1] 
			if (format != 'csv' && format != 'json'){
				console.log({error: "Please provide a valid format (json or csv)!\n"})
				process.exit()
			}
		}
	}
}


if (scope == 'healthcheck'){
	axios({
		"url": "http://localhost:8765/evcharge/api/admin/healthcheck",
		"method": "get"
	}).then ((response) => {
		console.log(response.data)
	})
}

else if (scope == 'resetsessions'){
	axios({
		"url": "http://localhost:8765/evcharge/api/admin/resetsessions",
		"method": "post"
	}).then ((response) => {
		console.log(response.data)
	}).catch( (err) => {
		console.error(err)
	})
}

else if (scope == 'login'){
	let params = 0
	for (var i = 0, j = argv.length; i < j; i++){
		if ((argv[i] == '--username')){
			if ((i+1) < argv.length){
				username = argv[i+1]
				params += 1
			}
			else {
				console.log({error: `You need to provide ${argv[i]} value!`})
				process.exit()
			}
		}
		else if ((argv[i] == '--passw')){
			if ((i+1) < argv.length){
				password = argv[i+1]
				params += 1
			}
			else {
				console.log({error: `You need to provide ${argv[i]} value!`})
				process.exit()
			}
		}
	}
	if (params < 2){
		console.log({error: "You need to provide 2 parameters (--username, --passw)!"})
		process.exit()
	}
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
		console.error(err)
	})
}

else if (scope == 'logout'){
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
		console.error(err)
	})
}

else if (scope == 'SessionsPerPoint'){
	
	let params = 0

	for (var i = 0, j = argv.length; i < j; i++){
		if (argv[i] == '--point'){
			if ((i+1) < argv.length){
				pointId = argv[i+1]
				params += 1
			}
			else {
				console.log({error: `You need to provide ${argv[i]} value!`})
				process.exit()
			}
		}
		
		else if (argv[i] == '--datefrom'){
			if ((i+1) < argv.length){
				datetimeFrom = argv[i+1]
				params += 1
			}
			else {
				console.log({error: `You need to provide ${argv[i]} value!`})
				process.exit()
			}
		}
		
		else if (argv[i] == '--dateto'){
			if ((i+1) < argv.length){
				datetimeTo = argv[i+1]
				params += 1
			}
			else {
				console.log({error: `You need to provide ${argv[i]} value!`})
				process.exit()
			}
		}
		else if ((argv[i] == '--format')){
			if ((i+1) < argv.length){
				format = argv[i+1]
				params += 1
				if (format != 'csv' && format != 'json'){
					console.log({error: "Please provide a valid format (json or csv)!\n"})
					process.exit()
				}
			}
			else {
				console.log({error: `You need to provide ${argv[i]} value!`})
				process.exit()
			}
		}
	}

	if (params < 4){
		console.log({error: "You need to provide 4 parameters."})
		process.exit()
	}

	axios({
		"url": 'http://localhost:8765/evcharge/api/SessionsPerPoint/' + pointId + '/' + datetimeFrom + '/' + datetimeTo + '?format=' + format,
		"method": "get",
		"headers": {'x-observatory-auth': key}
	}).then ((response) => {
		console.log(response.data)
		process.exit()
	})
}

else if (scope == 'SessionsPerEV'){

	let params = 0

	for (var i = 0, j = argv.length; i < j; i++){
		if (argv[i] == '--ev'){
			if ((i+1) < argv.length){
				vehicleId = argv[i+1]
				params += 1
			}
			else {
				console.log({error: `You need to provide ${argv[i]} value!`})
				process.exit()
			}
		}
		
		else if (argv[i] == '--datefrom'){
			if ((i+1) < argv.length){
				datetimeFrom = argv[i+1]
				params += 1
			}
			else {
				console.log({error: `You need to provide ${argv[i]} value!`})
				process.exit()
			}
		}
		
		else if (argv[i] == '--dateto'){
			if ((i+1) < argv.length){
				datetimeTo = argv[i+1]
				params += 1
			}
			else {
				console.log({error: `You need to provide ${argv[i]} value!`})
				process.exit()
			}
		}
		else if ((argv[i] == '--format')){
			if ((i+1) < argv.length){
				format = argv[i+1] 
				params += 1
				if (format != 'csv' && format != 'json'){
					console.log({error: "Please provide a valid format (json or csv)!\n"})
					process.exit()
				}
			}
			else {
				console.log({error: `You need to provide ${argv[i]} value!`})
				process.exit()
			}
		}
	}

	if (params < 4){
		console.log({error: "You need to provide 4 parameters."})
		process.exit()
	}
	axios({
		"url": 'http://localhost:8765/evcharge/api/SessionsPerPoint/' + vehicleId + '/' + datetimeFrom + '/' + datetimeTo + '?format=' + format,
		"method": "get",
		"headers": {'x-observatory-auth': key}
	}).then ((response) => {
		console.log(response.data)
		process.exit()
	})
}
else if (scope == 'SessionsPerStation'){
	
	let params = 0

	for (var i = 0, j = argv.length; i < j; i++){
		if (argv[i] == '--station'){
			if ((i+1) < argv.length){
				stationId = argv[i+1]
				params += 1
			}
			else {
				console.log({error: `You need to provide ${argv[i]} value!`})
				process.exit()
			}
		}
		
		else if (argv[i] == '--datefrom'){
			if ((i+1) < argv.length){
				datetimeFrom = argv[i+1]
				params += 1
			}
			else {
				console.log({error: `You need to provide ${argv[i]} value!`})
				process.exit()
			}
		}
		
		else if (argv[i] == '--dateto'){
			if ((i+1) < argv.length){
				datetimeTo = argv[i+1]
				params += 1
			}
			else {
				console.log({error: `You need to provide ${argv[i]} value!`})
				process.exit()
			}
		}
		else if ((argv[i] == '--format')){
			if ((i+1) < argv.length){
				format = argv[i+1] 
				params += 1
				if (format != 'csv' && format != 'json'){
					console.log({error: "Please provide a valid format (json or csv)!\n"})
					process.exit()
				}
			}
			else {
				console.log({error: `You need to provide ${argv[i]} value!`})
				process.exit()
			}
		}
	}

	if (params < 4){
		console.log({error: "You need to provide 4 parameters."})
		process.exit()
	}

	axios({
		"url": 'http://localhost:8765/evcharge/api/SessionsPerPoint/' + stationId + '/' + datetimeFrom + '/' + datetimeTo + '?format=' + format,
		"method": "get",
		"headers": {'x-observatory-auth': key}
	}).then ((response) => {
		console.log(response.data)
		process.exit()
	})
}
else if (scope == 'SessionsPerProvider'){
	
	let params = 0

	for (var i = 0, j = argv.length; i < j; i++){
		if (argv[i] == '--provider'){
			if ((i+1) < argv.length){
				providerId = argv[i+1]
				params += 1
			}
			else {
				console.log({error: `You need to provide ${argv[i]} value!`})
				process.exit()
			}
		}
		
		else if (argv[i] == '--datefrom'){
			if ((i+1) < argv.length){
				datetimeFrom = argv[i+1]
				params += 1
			}
			else {
				console.log({error: `You need to provide ${argv[i]} value!`})
				process.exit()
			}
		}
		
		else if (argv[i] == '--dateto'){
			if ((i+1) < argv.length){
				datetimeTo = argv[i+1]
				params += 1
			}
			else {
				console.log({error: `You need to provide ${argv[i]} value!`})
				process.exit()
			}
		}
		else if ((argv[i] == '--format')){
			if ((i+1) < argv.length){
				format = argv[i+1] 
				params += 1
				if (format != 'csv' && format != 'json'){
					console.log({error: "Please provide a valid format (json or csv)!\n"})
					process.exit()
				}
			}
			else {
				console.log({error: `You need to provide ${argv[i]} value!`})
				process.exit()
			}
		}
	}

	if (params < 4){
		console.log({error: "You need to provide 4 parameters."})
		process.exit()
	}

	axios({
		"url": 'http://localhost:8765/evcharge/api/SessionsPerPoint/' + providerId + '/' + datetimeFrom + '/' + datetimeTo + '?format=' + format,
		"method": "get",
		"headers": {'x-observatory-auth': key}
	}).then ((response) => {
		console.log(response.data)
		process.exit()
	})
}

else if (scope == 'Admin'){

	for (var i = 0, j = argv.length; i < j; i++){

		if (argv[i] == '--usermod'){

			isStationManager = false
			isAdmin = false
		
			let params = 0
			for (var k = 0, l = argv.length; k < l; k++){
				if(argv[k] == '--username'){
					if ((k+1) < argv.length){
						username = argv[k+1]
						if (!username.match(/^[0-9a-z]+$/)){
							console.log({error: "This username is not valid!"})
							process.exit()
						}
						params += 1
					}
					else {
						console.log({error: `You need to provide ${argv[k]} value!`})
						process.exit()							
					}
				}
				else if(argv[k] == '--passw') {
					if ((k+1) < argv.length){
						password = argv[k+1]
						if (password == ' '){
							console.log({error: "Empty password is not valid!"})
							process.exit()
						}
						params += 1
					}
					else {
						console.log({error: `You need to provide ${argv[k]} value!`})
						process.exit()							
					}
				}
				else if(argv[k] == '--isStationManager') {
					isStationManager = true
				}
				else if(argv[k] == '--isAdmin') {
					isAdmin = true
				}
				else if(argv[k] == '--email') {
					if ((k+1) < argv.length){
						email = argv[k+1]
						if (email == ' '){
							console.log({error: "Empty email is not valid!"})
							process.exit()
						}
						params += 1
					}
					else {
						console.log({error: `You need to provide ${argv[k]} value!`})
						process.exit()							
					}
				}
				else if(argv[k] == '--fullName') {
					if ((k+1) < argv.length){
						fullName = argv[k+1]
						if (fullName == ' '){
							console.log({error: "Empty full name is not valid!"})
							process.exit()
						}
						params += 1
					}
					else {
						console.log({error: `You need to provide ${argv[k]} value!`})
						process.exit()							
					}
				}
			}
			if (params < 4){
				console.log({error: "You need to provide username, password, full name and email (--username, --passw, --fullName, --email)!"})
				process.exit()
			}
			axios({
				"url": 'http://localhost:8765/evcharge/api/admin/usermod/' + username + '/' + password,
				"method": "post",
				"data": {
					"fullName": fullName,
					"email": email,
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
				console.error(err)
			})
		}
		
		else if (argv[i] == '--users'){
		
			if ((i+1) < argv.length){
				username = argv[i+1]
			}
			else {
				console.log({error: `You need to provide ${argv[k]} value!`})
				process.exit()
			}
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
				console.error(err.message)
			})
		}

		else if (argv[i] == '--sessionsupd'){
			
			let params = 0
			for (var k = 0, l = argv.length; k < l; k++){
				if (argv[k] == '--source'){
					if ((k+1) < argv.length){
						source = argv[k+1]
						params += 1
					}
					else {
						console.log({error: `You need to provide ${argv[k]} value!`})
						process.exit()	
					}
				}
			}
			if (params < 1){
				console.log({error: "You need to provide source filename (--source)!"})
				process.exit()
			}
			const form_data = new FormData();
			form_data.append("file", fs.createReadStream("./sessions.csv"));
			axios({
				"url": 'http://localhost:8765/evcharge/api/admin/system/sessionsupd',
				"method": "post",
				"headers": {
					'x-observatory-auth': key,
					'content-type': 'multipart/form-data; charset=utf-8; boundary= Content-Disposition: form-data; name="file"'
				},
				"data": form_data
			}).then ((response) => {
				console.log(response.data)
				process.exit()
			})
			.catch((err) => {
				console.error(err.request)
			})
		}
		
		else if(argv[i] == '--healthcheck'){
			axios({
				"url": "http://localhost:8765/evcharge/api/admin/healthcheck",
				"method": "get"
			}).then ((response) => {
				console.log(response.data)
			})
		}
		
		else if(argv[i] == '--resetsessions'){
			axios({
				"url": "http://localhost:8765/evcharge/api/admin/resetsessions",
				"method": "post"
			}).then ((response) => {
				console.log(response.data)
			})
		}
	}
}
