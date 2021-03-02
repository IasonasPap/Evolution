const chargingSession = require('../controllers/chargingSession.controller.js');
const auth = require('../middleware/auth');

var router = require("express").Router();

//create a new charging Session
router.post("/", chargingSession.create);

//retrieve the charging Session of a single point in a period of time

router.get("/SessionsPerPoint/:pointId/:datetimeFrom/:datetimeTo", auth, chargingSession.findAll);
router.get("/SessionsPerStation/:stationId/:datetimeFrom/:datetimeTo", auth, chargingSession.findAll);
router.get("/SessionsPerEV/:vehicleId/:datetimeFrom/:datetimeTo", auth, chargingSession.findAll);
router.get("/SessionsPerProvider/:providerId/:datetimeFrom/:datetimeTo", auth, chargingSession.findAll);
router.get("/SessionsPerUser/:userId", auth, chargingSession.findAll);
router.get("/SessionsPerMultipleStations", auth, chargingSession.findSessionsPerMultipleStations);

//get all charging sessions
router.get("/sessions", chargingSession.getAll);



module.exports = router;