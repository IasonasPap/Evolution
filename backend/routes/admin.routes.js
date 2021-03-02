const admin = require('../controllers/admin.controller');
const authAdmin = require('../middleware/auth.admin');
var router = require("express").Router();
const upload = require("../middleware/upload");

console.log(upload.single('file'));
// check the status of the database
router.get("/healthcheck", admin.healthCheck);

// reset the charging sessions and create a new admin user
router.post("/resetsessions", admin.resetSession);

router.post("/usermod/:username/:password", authAdmin, admin.createOrChange);

router.get("/users/:username", authAdmin, admin.findOne);

router.post("/system/sessionsupd", authAdmin, upload.single('file'), admin.upload);

module.exports = router;