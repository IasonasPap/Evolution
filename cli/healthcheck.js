const db = require('../backend/models');
const {sequelize} = db;

module.exports = () => {
    sequelize.authenticate()
    .then((err) => {
        if (err) {
            console.log("status: failed")
        }
        else {
            console.log("Connection to DB established!")
        }
	})
	.then(() => {
		process.exit()
	})
}