const admin = require('../controllers/admin.controller');
var router = require("express").Router();

// check the status of the database
router.get("/healthcheck", admin.healthCheck);

// reset the charging sessions and create a new admin user
router.post("/resetsessions", admin.resetSession);

module.exports = router;