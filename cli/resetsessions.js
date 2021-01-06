const db = require('../backend/models');
const {user, chargingSession, sequelize} = db;

module.exports = () => {
    /* 
    This fuction checks if a user named <admin> exist in the users table. If 
    not, it creates this user and reset its field to default.
    Afterwards, it resets the chargingSessions table, clearing every row.
    */

    // Create or reset <admin> user with <petrol4ever> as its default password
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
        console.error(err);
        console.log("status: failed");
    }

    // Reset chanrgingSession table, that is, delete every row in the entity
    chargingSession.destroy({
        truncate: true
    }).then(() => {
        console.log("ChargingSessions table was reset!");
    }).catch((err) => {
        console.log("status: failed");
        console.error(err);
    })
    .then(() => {
        process.exit()
    })
}