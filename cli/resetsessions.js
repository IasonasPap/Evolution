const db = require('../backend/models');
const {user, chargingSession, sequelize} = db;

module.exports = () => {

    return user.upsert({
        username: 'admin',
        password: 'petrol4ever',
        email: "defaultadmin@evolution.com",
        fullName: "Default Admin",
        isAdmin: 1,
        isStationOwner: 0
    }).then(([user, isNew]) => {
        if (isNew){
            console.log({message: "Default admin was created successfully!"})
        }
        else {
            console.log({message: "Default admin was updated successfully!"})
        }
    }).catch(() =>{
        console.log({error: "Something went wrong with update/creation of default admin!"})
        process.exit()
    }).then(() => {
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
    })
}