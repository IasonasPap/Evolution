const db = require('../backend/models');
const User = db.user;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const Promise = require('bluebird');

const fileWrite = Promise.promisify(fs.writeFile);
const fileUnlink = Promise.promisify(fs.unlink);

module.exports.login = (username, password) => {
    User.findOne({where: {username: username}}).then(user => {
        return bcrypt.compare(password, user.password).then((valid) => {
            if (!valid) {
                console.log({error: "Invalid username or password"})
                process.exit()
            }
            else {
                let user_ = JSON.parse(JSON.stringify(user));
                delete user_.password;
                delete user_.isAdmin;
                return jwt.sign(
                    {user: user_},
                    'RANDOM_TOKEN_SECRET',
                    {expiresIn: '24h'}
                );
            }
        })
    }).then((token) => {
        return fileWrite("./softeng20bAPI.token", token)
    }).then(() => {
        console.log({message: "Login was successful!"})
    }).catch((err) => {
        console.log({error: "Something went wrong with authentication!"})
    }).finally(() => {
        process.exit()
    });
}

module.exports.logout = () => {
    const filePath = './softeng20bAPI.token'; 
    fileUnlink(filePath)
    .then(() => {
        console.log({message: "Logout was successful!"})
    })
    .catch(() => {
        console.log({error: "Something went wrong with logout!"})
    })
    .finally(() => {
        process.exit()
    });
}