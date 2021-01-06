const healthcheck = require('./healthcheck.js');
const resetsessions = require('./resetsessions.js');
const authenticate = require('./authenticate.js')
const check_authentication = require('./common/checkauthentication.js')
//const SessionsPerPoint = require('./sessionsperpoint.js')
//const SessionsPerStation = require('./sessionsperstation.js')
//const SessionsPerEV = require('./sessionsperev.js')
//const SessionsPerProvider = require('./sessionsperprovider.js')
//const Admin = require('./admin.js')

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
	for (var i = 0, j = argv.length; i < j; i++){
		if ((argv[i] == '--username')){
			if ((i+1) < argv.length){
				username = argv[i+1]
			}
			else {
				console.log("You need to provide", argv[i], "value!\n")
				process.exit()
			}
		}
		else if ((argv[i] == '--passw')){
			if ((i+1) < argv.length){
				password = argv[i+1]
			}
			else {
				console.log("You need to provide", argv[i], "value!\n")
				process.exit()
			}
		}
	}
	authenticate.login(username, password)
}
else if (scope == 'logout'){
	check_authentication().then( () => {
		authenticate.logout()
	})
}
else if (scope == 'SessionsPerPoint' || scope == 'SessionsPerStation' || scope == 'SessionsPerEV' || scope == 'SessionsPerProvider'){
	//apaiteitai diapisteumenos xrhsths edw
	if (scope == 'SessionsPerProvider'){
		flag = 'provider'
	}
	else if (scope == 'SessionsPerEV'){
		flag = 'ev'
	}
	else if (scope == 'SessionsPerPoint'){
		flag = 'point'
	}
	else {
		flag == 'station'
	}
	for (var i = 0, j = argv.length; i < j; i++){
		if (argv[i] == '--point' || argv[i] == '--station' || argv[i] == '--ev' || argv[i] == '--provider'){
			if ((i+1) < argv.length){
				val1 = argv[i+1]
			}
			else {
				console.log("You need to provide", argv[i], "value!\n")
				process.exit()
			}
		}
		else if ((argv[i] == '--datefrom')){
			if ((i+1) < argv.length){
				starting_date = argv[i+1]
			}
			else {
				console.log("You need to provide", argv[i], "value!\n")
				process.exit()
			}
		}
		else if ((argv[i] == '--dateto')){
			if ((i+1) < argv.length){
				ending_date = argv[i+1]
			}
			else {
				console.log("You need to provide", argv[i], "value!\n")
				process.exit()
			}
		}
	}
	SessionsPerPoint(val1, starting_date, ending_date, flag) // flag is for setting what type of per to use
}
else if (scope == 'Admin'){
	// thelei thn pio pollh douleia
	admin()
}