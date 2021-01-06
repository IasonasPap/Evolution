const db = require('../backend/models');
const {sequelize} = db;

module.exports = () => {
    sequelize.authenticate()
    .then((err) => {
        if (err) {
            console.log("status: failed")
            console.error(err);
        }
        else {
            console.log("Connection to DB established!")
        }
	})
	.then(() => {
		process.exit()
	})
}