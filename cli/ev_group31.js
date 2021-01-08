const healthcheck = require('./healthcheck.js');
const resetsessions = require('./resetsessions.js');
const authenticate = require('./authenticate.js')
const check_authentication = require('./common/checkauthentication.js')
const charging_sessions = require('./chargingsessions.js')
const usermod = require('./usermod.js')

argv = process.argv

if (argv.length < 7){
	console.log("You need to provide at least 5 arguments!\n")
	process.exit()
}
else{
	scope = argv[2]
}

for (var i = 0, j = argv.length; i < j; i++){
	if ((argv[i] == '--apikey')){
		if ((i+1) < argv.length){
			key = argv[i+1]
		}
		else {
			console.log("You need to provide", argv[i], "value!\n")
			process.exit()
		}
	}
	else if ((argv[i] == '--format')){
		if ((i+1) < argv.length){
			format = argv[i+1] 
			if (format != 'csv' && format != 'json'){
				console.log("Please provide a valid format (json or csv)!\n")
				process.exit()
			}
		}
		else {
			console.log("You need to provide", argv[i], "value!\n")
			process.exit()
		}
	}
}

if (scope == 'healthcheck'){
	healthcheck()
}
else if (scope == 'resetsessions'){
	resetsessions()
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
		console.log({error : "You need to provide 2 parameters (--username, --passw)!"})
		process.exit()
	}
	authenticate.login(username, password)
}
else if (scope == 'logout'){
	check_authentication().then(() => {
		authenticate.logout()
	})
}
else if (scope == 'SessionsPerPoint' || scope == 'SessionsPerStation' || scope == 'SessionsPerEV' || scope == 'SessionsPerProvider'){
	
	check_authentication().then(() => {

		switch (scope) {
		  case 'SessionsPerProvider':
		    flag = 'provider';
		    break;
		  case 'SessionsPerStation':
		    flag = 'station';
		    break;
		  case 'SessionsPerEV':
		     flag = 'ev';
		    break;
		  case 'SessionsPerPoint':
		    flag = 'point';
		}

		let params = 0

		for (var i = 0, j = argv.length; i < j; i++){
			if (argv[i] == '--point' || argv[i] == '--station' || argv[i] == '--ev' || argv[i] == '--provider'){
				if ((i+1) < argv.length){
					val = argv[i+1]
					params += 1
				}
				else {
					console.log({error: `You need to provide ${argv[i]} value!`})
					process.exit()
				}
			}
			
			else if (argv[i] == '--datefrom'){
				if ((i+1) < argv.length){
					starting_date = argv[i+1]
					params += 1
				}
				else {
					console.log({error: `You need to provide ${argv[i]} value!`})
					process.exit()
				}
			}
			
			else if (argv[i] == '--dateto'){
				if ((i+1) < argv.length){
					ending_date = argv[i+1]
					params += 1
				}
				else {
					console.log({error: `You need to provide ${argv[i]} value!`})
					process.exit()
				}
			}
		}

		if (params < 3){
			console.log({error: "You need to provide 3 parameters."})
			process.exit()
		}

	}).then (() => {
		charging_sessions(val, starting_date, ending_date, flag, format)
	})
}
else if (scope == 'Admin'){

	check_authentication(true).then(() => {
	
		for (var i = 0, j = argv.length; i < j; i++){

			if (argv[i] == '--usermod'){
			
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
				}
				if (params < 2){
					console.log({error: "You need to provide username and password (--username, --passw)!"})
					process.exit()
				}
				usermod(username, password).then(() => {
					console.log(username, password)
					process.exit()
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
				//edw exeis to xrhsth
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
				// edw exeis parei to sourcefile
			}
			
			else if(argv[i] == '--healthcheck'){
				healthcheck()
			}
			
			else if(argv[i] == '--resetsessions'){
				resetsessions()
			}
		}		
	})
}