const db = require('../backend/models');
const {user, chargingSession, sequelize} = db;
const bcrypt = require('bcrypt')

module.exports = (username, password, fullName, email, isAdmin, isStationManager) => {

    return user.findOne({where: {username: username}}).then(my_user => {

        if (!my_user){
            return user.create({
                username: username,
                password: password,
                fullName: fullName,
                email: email,
                isAdmin: isAdmin,
                isStationManager: isStationManager
            }).then((_) =>{
                return false
            })
        }
        else {
            return my_user.update({
                password: password
            }).then((_) => {
                return true
            })
        }
    }).then((isNew) => {
        if(!isNew){
            console.log({message: "User created successfully!"})
        }
        else {
            console.log({message: "User updated successfully!"})
        }
    }).catch((err) => {
        console.log({error: "Something went wrong with update/creation of user!"})
        process.exit()
    })
}