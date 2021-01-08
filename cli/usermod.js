const db = require('../backend/models');
const {user, chargingSession, sequelize} = db;
const bcrypt = require('bcrypt')

module.exports = (username, password) => {
    // needs changes with other columns
    passw = bcrypt.hashSync(password, 8)
    return user.upsert({
        username: username,
        password: passw,
        email: "skatoules@gmail.com",
        fullName: "Papitso Pasit",
        isAdmin: 0,
        isStationOwner: 0
    }).then(([user, isNew]) => {
        if (isNew){
            console.log({message: "User was created successfully!"})
        }
        else {
            console.log({message: "User was updated successfully!"})
        }
    }).catch(() =>{
        console.log({error: "Something went wrong with update/creation of user!"})
        process.exit()
    })
}