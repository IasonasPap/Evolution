const db = require("../backend/models");
const User = db.user;

module.exports = (username) => {
	return User.findOne({where: {username: username}}).then(user => {

		if (!user) {
			console.log({error : "User not found!"})
			process.exit()
		}
		else {
			delete user.dataValues.password
			console.log(user.dataValues)
		}
	}).catch(() => {
		console.log({error : "User not found!"})
		process.exit()
	})
}
