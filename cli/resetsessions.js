const db = require('../backend/models');
const {user, chargingSession, sequelize} = db;

module.exports = () => {
    try {
        const [_, newlyCreated] = user.findOrCreate({
            where: {
                username: "admin"
            },
            defaults: {
                username: "admin",
                password: "petrol4ever",
                fullName: "test",
                email: "test@evolution.com",
                isAdmin: 1,
                isStationManager: 0
            }
        });
        console.log(`admin user was ${newlyCreated?'created':'reset'}!`);
    }
    catch (err) {
        console.log("status: failed");
    }

    // Reset chanrgingSession table, that is, delete every row in the entity
    chargingSession.destroy({
        truncate: true
    }).then(() => {
        console.log("ChargingSessions table was reset!");
    }).catch((err) => {
        console.log("status: failed");
    })
    .then(() => {
        process.exit()
    })
}