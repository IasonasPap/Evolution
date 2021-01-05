const db = require('../models');
const {user, chargingSession, sequelize} = db;

exports.resetSession = async (req,res) => {
    /* 
    This fuction checks if a user named <admin> exist in the users table. If 
    not, it creates this user and reset its field to default.

    Afterwards, it resets the chargingSessions table, clearing every row.
    */

    // Create or reset <admin> user with <petrol4ever> as its default password
    try {
        const [_, newlyCreated] = await user.findOrCreate({
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
        return res.status(500).send({status:"failed"});
    }

    // Reset chargingSession table, that is, delete every row in the entity
    chargingSession.destroy({
        truncate: true
    }).then(() => {
        console.log("ChargingSessions table was reset!");
        return res.send({status: "OK"});
    }).catch((err) => {
        console.error(err);
        return res.send({status: "failed"});
    })
}


exports.healthCheck = (req,res) => {
     /* 
    This fuction checks the connect to the database by
    realizing a dummy query. 
    */
    sequelize.authenticate()
        .then((err) => {
            if (err) {
                res.send({status: "failed"})
                console.error(err);
            }
            else {
                res.send({status: "OK"})
                console.log("Connection to DB established!")
            }
        })
}