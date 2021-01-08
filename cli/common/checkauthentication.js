const Promise = require('bluebird');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const db = require("../../backend/models");
const User = db.user;

const fileRead = Promise.promisify(fs.readFile);

module.exports = (isAdmin=false) => {
	return fileRead("./softeng20bAPI.token").then((buffer) => {
		const token = buffer.toString()
		return jwt.decode(token)
	}).then(({user}) => {
		return User.findOne({where: {id: user.id}})
	}).then((user) => {
		if (!user) {
			console.log({error : "User not found!"})
			process.exit()
		}
		else {
			if (isAdmin && !user.isAdmin) {
				console.log({error: `User ${user.username} does not have admin permissions!`})
				process.exit()
			}
			console.log({message: `User ${user.username} is authenticated!`})
			return user
		}
	}).catch(() => {
		console.log({error : "User not found!"})
		process.exit()
	})
}
