const chargingPoint = require("../controllers/chargingPoint.controller.js");
const chargingSession = require("../controllers/chargingSession.controller.js");
const auth = require('../middleware/auth');

var router = require("express").Router();

// tested on http://localhost:8766
router.get("/randomChargingPoint", auth, chargingPoint.random);
//router.post("/newChargingSession", chargingSession.new);

module.exports = router;