module.exports = app => {
    const chargingSession = require('../controllers/chargingSession.controller.js');

    var router = require("express").Router();

    //create a new charging Session
    router.post("/", chargingSession.create);

    //retrieve the charging Session of a sigle point in a period of time
    router.get("/SessionsPerPoint/:pointId/:datetimeFrom/:datetimeTo", chargingSession.findAll);
    router.get("/SessionsPerStation/:stationId/:datetimeFrom/:datetimeTo", chargingSession.findAll);
    router.get("/SessionsPerEV/:vehicleId/:datetimeFrom/:datetimeTo", chargingSession.findAll);
    router.get("/SessionsPerProvider/:providerId/:datetimeFrom/:datetimeTo", chargingSession.findAll);

    app.use('/evcharge/api', router);
}