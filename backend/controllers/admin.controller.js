const db = require('../models');
const fs = require("fs");
const csv = require("fast-csv");
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

exports.findOne = (req, res) => {
    const {username} = req.params;

    user.findOne({where: {username} })
        .then(data => {
			if(data){
				res.send(data);
			} else {
				return res.status(400).send({
                    message:`No user found with name "${username}"`
                });
			}
        })
        .catch((err) => {
            return res.status(500).send({
                message: "Error retrieving User with name=" + username
            });
        });
};

exports.createOrChange = (req, res, next) => {
    /*
    This controller for the user model initializes a new user object 
    and then saves it to the database.
    */

    // Validate request 
    if (!req.params.username || !req.params.password) {
        return res.status(400).send({
            message: "You should provide a <username> and <password> for the new user!"
        });
    }
    const {username} = req.params;
    
	user.findOne({where: {username} } )
        .then(data => {
            if(data){
                const {id} = data;
				user.update({password: req.params.password}, {
					where: {id: id},
					raw: true
					})
					.then((result) => {
						if (result[0] !== 1) {
							return res.status(400).send({
								message: `Cannot update User with id=${id}. User not found!`
							});
						} else {
                            user.findByPk(id)
                                .then(data => {
                                    if (data){
                                        res.send(data);
                                    } else {
                                        return res.status(400).send({
                                            message: "Not Found User with id=" + id
                                        });
                                    }
                                
                            })
                            .catch(err => {
                                res.status(500).send({
                                    message: "Error updating User with id=" + id
                                });
                            });
                        }
                    })
                    .catch(err => {
                        return res.status(500).send({
                            message: "Error updating User with id=" + id
                        });
                    });
                    
					
			} else {
				// Create a newUser object
				let newUser = {
					username: req.params.username,
					password: req.params.password,
					fullName: req.body.fullName || null,
					email: req.body.email || null,
					isAdmin: req.body.isAdmin || false,
					isStationManager: req.body.isStationManager || false
				};

				// Insert the newUser into the users table
				user.create(newUser)
					.then(data => {
						return res.status(200).send(data);
					})
					.catch(err => {
						return res.status(500).send(
							{message: err.message || "Some error occurred while creating the user."}
						);
					});
			}
        })
        .catch(err => {
            return res.status(500).send({
                message: "Error retrieving User with id=" + id
            });
        });
   
};

exports.upload = async (req, res) => {
  try {
    if (req.file == undefined) {
      return res.status(400).send("Please upload a CSV file!");
    }

    let sessions = [];
    let path = __basedir + "/" + req.file.filename;

    fs.createReadStream(path)
      .pipe(csv.parse({ headers: true }))
      .on("error", (error) => {
        throw error.message;
      })
      .on("data", (row) => {
        sessions.push(row);
      })
      .on("end", () => {
        chargingSession.bulkCreate(sessions)
          .then(response => {
              const uploadedSessions = response.map(x => {
                  return x.dataValues;
              });
            fs.unlink(path, (err) => {
                if (err) console.log('!!!!!!!!!!!!!');
                else console.log("succesful delete");
            });

            res.status(200).send({
                data: uploadedSessions,
              message:
                "Uploaded the file successfully: " + req.file.originalname
            });
          })
          .catch((error) => {
            res.status(500).send({
              message: "Fail to import data into database!",
              error: error.message,
            });
          });
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Could not upload the file: " + req.file.originalname,
    });
  }
};

