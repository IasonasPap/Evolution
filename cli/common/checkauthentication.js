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
			console.error({error : "User not found!"})
			process.exit()
		}
		else {
			if (isAdmin) {
				//tsekarei kai oti thelw epipedo diapisteushs isAdmin kai oti einai admin
			}
			console.log({message: `User ${user.username} is authenticated!`})
			return user
		}
	}).catch(() => {
		console.error({error : "User not found!"})
		process.exit()
	})
}
