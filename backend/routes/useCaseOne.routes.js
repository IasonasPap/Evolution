const chargingPoint = require("../controllers/chargingPoint.controller.js");
const chargingSession = require("../controllers/chargingSession.controller.js");

var router = require("express").Router();

// tested on http://localhost:8766
router.get("/randomChargingPoint", chargingPoint.random);
//router.post("/newChargingSession", chargingSession.new);

module.exports = router;