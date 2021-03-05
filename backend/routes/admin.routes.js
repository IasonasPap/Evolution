const admin = require('../controllers/admin.controller');
var router = require("express").Router();
const upload = require("../middleware/upload");
console.log(upload.single('file'));

// check the status of the database
router.get("/healthcheck", admin.healthCheck);

// reset the charging sessions and create a new admin user
router.post("/resetsessions", admin.resetSession);

router.post("/usermod/:username/:password",admin.createOrChange);

router.get("/users/:username",admin.findOne);

router.post("/system/sessionsupd",upload.single('file'),admin.upload);

module.exports = router;