const db = require('../backend/models');
const {sequelize} = db;

module.exports = () => {
    sequelize.authenticate()
    .then((err) => {
        if (err) {
            console.log({error: "Connection to DB failed!"})
        }
        else {
            console.log({message: "Connection to DB established!"})
        }
	})
	.then(() => {
		process.exit()
	})
}