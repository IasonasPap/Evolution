const express = require('express');
const router = express.Router({mergeParams: true});

const users = require('../controllers/user.controller');

// Create a new User
router.post("/", users.create);

// Retrieve all Users
router.get("/", users.findAll);


// Retrieve a single User with id
router.get("/:id", users.findOne);

// Retrieve vehicles for user with id
router.get("/:id/electricVehicles", users.findVehicles);

// Retrieve vehicles for user with id
router.get("/:id/stations", users.findStations);

// Update a User with id
router.put("/:id", users.update);

// Delete a User with id
router.delete("/:id", users.delete);

// Delete all Users
router.delete("/", users.deleteAll);

module.exports = router;