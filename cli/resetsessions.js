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
        console.log({message: `Admin user was ${newlyCreated?'created':'reset'}!`});
    }
    catch (err) {
        console.log({error: "Something went wrong!"});
    }

    // Reset chanrgingSession table, that is, delete every row in the entity
    chargingSession.destroy({
        truncate: true
    }).then(() => {
        console.log({message: "ChargingSessions table was reset!"});
    }).catch((err) => {
        console.log({error: "Something went wrong!"});
    })
    .then(() => {
        process.exit()
    })
}