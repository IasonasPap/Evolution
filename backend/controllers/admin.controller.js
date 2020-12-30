const db = require('../models');
const {user, chargingSession, sequelize} = db;

exports.resetSession = (req,res) => {
    // username and password are obligatory fields
    if (!req.body.username || !req.body.password) {
        res.status(400).send( {status: "failed"} );
        console.log("You should provide <username> and <password> for the new user!");
        return;
    }
    else {  
        // Create a newUser object
        let newUser = {
            username: req.body.username,
            password: req.body.password,
            fullName: req.body.fullName ? req.body.fullName : undefined,
            email: req.body.email ? req.body.email : undefined,
            isAdmin: 1,
            isStationManager: req.body.isStationManager ? req.body.isStationManager : undefined
        };

        // Save the newUser to the database
        user.create(newUser)
            .then(() => {
                console.log(`The user <${req.body.username}> was created.`)
            })
            .catch((err) => {
                res.status(400).send( {status: "failed"} );
                console.error(err);
                return;
            })

        // Reset chanrgingSession table, that is, delete every row in the entity
        chargingSession.destroy({
            truncate: true
        }).then(() => {
            console.log("ChargingSessions table was reset!");
            res.send({status: "OK"});
        }).catch((err) => {
            res.send({status: "failed"});
            console.error(err);
        })
    }
}

exports.healthCheck = (req,res) => {
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
