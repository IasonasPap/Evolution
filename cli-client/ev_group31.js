#! /usr/bin/env node

const yargs = require('yargs');
const axios = require("axios");
const admin = require('./admin.js');
const authenticate = require('./authenticate.js');
const chargingSessions = require('./chargingsessions.js');

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');

clear();

console.log(chalk.blue(figlet.textSync('EVolution', 'Banner')));

const argv = yargs
			.command({
				command: "healthcheck", 
				desc: "Checks if end-to-end connectivity is established between user and DB.",
				handler: (argv) => {
					admin.healthcheck()
				}
			})
			.command({
				command: "resetsessions", 
				desc: "Reset chargingSessions table and set a default admin.", 
				handler: (argv) => {
					admin.resetsessions()				
				}
			})
			.command({
				command: "login",
				desc: "Login of a user.",
				builder: {
					username: {
						describe: "The username of the user to login.",
						demandOption: true
					},
					passw: {
						describe: "The password of the user to login.",
						demandOption: true
					}
				},
				handler: (argv) => {
					authenticate.login(argv.username, argv.passw)
				}
			})
			.command({
				command: "logout",
				desc: "Logout of a user.",
				builder: {
					apikey: {
						describe: "The token of the user.",
						demandOption: true
					}
				},
				handler: (argv) => {
					authenticate.logout(argv.apikey)
				}
			})
			.command({
				command: "SessionsPerPoint", 
				desc: "Print the charging sessions for a given point between two certain dates.", 
				builder: {
					apikey: {
						describe: "The token of the user.",
						demandOption: true
					},
					format: {
						describe: "The format of output.",
						demandOption: true,
						choices: ['csv', 'json']
					},
					datefrom: {
						describe: "The starting date in format YYYYMMDD.",
						demandOption: true
					},
					dateto: {
						describe: "The ending date in format YYYYMMDD.",
						demandOption: true					
					},
					point: {
						describe: "The id of the point.",
						demandOption: true
					}
				},
				handler: (argv) => {
					chargingSessions.SessionsPerPoint(argv.point, argv.datefrom, argv.dateto, argv.format, argv.apikey)
				}
			})
			.command({
				command: "SessionsPerEV", 
				desc: "Print the charging sessions for a given vehicle between two certain dates.", 
				builder: {
					apikey: {
						describe: "The token of the user.",
						demandOption: true
					},
					format: {
						describe: "The format of output.",
						demandOption: true,
						choices: ['csv', 'json']
					},
					datefrom: {
						describe: "The starting date in format YYYYMMDD.",
						demandOption: true
					},
					dateto: {
						describe: "The ending date in format YYYYMMDD.",
						demandOption: true					
					},
					ev: {
						describe: "The id of the vehicle.",
						demandOption: true
					}
				},
				handler: (argv) => {
					chargingSessions.SessionsPerEV(argv.ev, argv.datefrom, argv.dateto, argv.format, argv.apikey)
				}
			})
			.command({
				command: "SessionsPerStation", 
				desc: "Print the charging sessions for a given station between two certain dates.", 
				builder: {
					apikey: {
						describe: "The token of the user.",
						demandOption: true
					},
					format: {
						describe: "The format of output.",
						demandOption: true,
						choices: ['csv', 'json']
					},
					datefrom: {
						describe: "The starting date in format YYYYMMDD.",
						demandOption: true
					},
					dateto: {
						describe: "The ending date in format YYYYMMDD.",
						demandOption: true					
					},
					station: {
						describe: "The id of the station.",
						demandOption: true
					}
				},
				handler: (argv) => {
					chargingSessions.SessionsPerStation(argv.station, argv.datefrom, argv.dateto, argv.format, argv.apikey)
				}
			})
			.command({
				command: "SessionsPerProvider", 
				desc: "Print the charging sessions for a given provider between two certain dates.", 
				builder: {
					apikey: {
						describe: "The token of the user.",
						demandOption: true
					},
					format: {
						describe: "The format of output.",
						demandOption: true,
						choices: ['csv', 'json']
					},
					datefrom: {
						describe: "The starting date in format YYYYMMDD.",
						demandOption: true
					},
					dateto: {
						describe: "The ending date in format YYYYMMDD.",
						demandOption: true					
					},
					provider: {
						describe: "The id of the provider.",
						demandOption: true
					}
				},
				handler: (argv) => {
					chargingSessions.SessionsPerProvider(argv.provider, argv.datefrom, argv.dateto, argv.format, argv.apikey)
				}
			})
			.command({
				command: "Admin", 
				desc: "Used for admin purposes.", 
				builder: {
					apikey: {
						describe: "The token of the admin.",
						demandOption: true,
					},
					sessionsupd: {
						describe: "Uploads charging sessions through a given csv file.",
						conflicts: ["users", "resetsessions", "usernmod", "healthcheck"],
						implies: ["source"]
					},
					users: {
						describe: "Returns info for the user with given username.",
						conflicts: ["sessionsupd", "resetsessions", "usernmod", "healthcheck"]
					},
					usermod: {
						describe: "Insert or change the given user.",
						conflicts: ["users", "resetsessions", "sessionsupd", "healthcheck"],
						implies: ["username", "passw"]
					},
					healthcheck: {
						describe: "Checks if end-to-end connectivity is established between user and DB.",
						conflicts: ["users", "sessionsupd", "usermod", "resetsessions"]
					},
					resetsessions: {
						describe: "Reset chargingSessions table and set a default admin.",
						conflicts: ["users", "sessionsupd", "usernmod", "healthcheck"]
					},
					username: {
						describe: "Username of the user.",
						conflicts: ["users", "sessionsupd", "resetsessions", "healthcheck"],
						type: 'string'
					},
					passw: {
						describe: "(New) Password for the user.",
						conflicts: ["users", "sessionsupd", "resetsessions", "healthcheck"],
						type: 'string'
					},
					isAdmin: {
						describe: "Set if the user is admin.",
						type: 'boolean',
						default: false
					},
					isStationManager: {
						describe: "Set if the user is manager of a station.",
						type: 'boolean',
						default: false
					},
					source: {
						describe: "Absolute path to the csv file.",
						conflicts: ["users", "resetsessions", "usernmod", "healthcheck"],
						type: 'string'
					}
				},
				handler: (argv) => {
					if(argv.healthcheck){
						admin.healthcheck()
					}
					else if(argv.resetsessions){
						admin.resetsessions()
					}
					else if(argv.usermod){
						admin.usermod(argv.username, argv.passw, argv.isAdmin, argv.isStationManager, argv.apikey)
					}
					else if(argv.sessionsupd){
						admin.sessionsupd(argv.source, argv.apikey)
					}
					else if(argv.users){
						admin.users(argv.users, argv.apikey)
					}
				}	
			})
			.help()
			.argv