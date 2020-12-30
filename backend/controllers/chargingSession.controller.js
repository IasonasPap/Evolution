const db = require("../models");
const {Op} = require("sequelize");
const chargingPoint = db.chargingPoint;
const chargingSession = db.chargingSession;
const station = db.station;
const provider = db.provider;
const electricVehicle = db.electricVehicle;


// Create and Save a new Charging Event
exports.create = (req, res) => {
    // Validate request
    if (req.body.electricVehicleId <= 0) {
        res.status(400).send({
            message: "Invalid vehicle id!"
        })
        return;
    }

    // Create a new charging event
    const newChargingSession = {
        electricVehicleId: req.body.electricVehicleId,
        chargingPointId: req.body.chargingPointId,
        cost: (req.body.cost ? req.body.cost : null),
        energyRequested: req.body.energyRequested,
        pointsAwarded: req.body.pointsAwarded,
        startTime: req.body.startTime,
        endTime: req.body.endTime
    };

    chargingSession.create(newChargingSession)
        .then(data => {
            res.send(data)
        })
        .catch(err => {
            res.status(500).send({
                message: 
                    err.messase || "Some error occurred while creating the charging event." 
            });
        });
};

// Retrieve chargingSession with a condition
exports.findAll = (req, res) => {
    if (req.params.pointId && req.params.datetimeTo && req.params.datetimeFrom) {
        let {pointId, datetimeFrom, datetimeTo} = req.params;

        let condition = {
            chargingPointId: pointId, 
            startTime: { [Op.between]: [datetimeFrom, datetimeTo] }
            }; 
    
        chargingSession.findAll({where: condition})
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Error while retrieving the charging sessions of the point"
                });
            });
    }
    else if (req.params.vehicleId && req.params.datetimeTo && req.params.datetimeFrom ) {
        let {vehicleId, datetimeFrom, datetimeTo} = req.params;

        let condition = {
            electricVehicleId: vehicleId, 
            startTime: { [Op.between]: [datetimeFrom, datetimeTo] }
            }; 
    
        chargingSession.findAll({where: condition})
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Error while retrieving the charging sessions of the vehicle"
                });
            });
    }
    else if (req.params.stationId && req.params.datetimeTo && req.params.datetimeFrom) {
        let {stationId, datetimeFrom, datetimeTo} = req.params;

        chargingSession.findAll({ where: {
            '$chargingPoint.stationId$': stationId,
            startTime: {
                [Op.between] : [datetimeFrom, datetimeTo]
            }},
            include: {model: chargingPoint} 
        })
        /* ***Alternative way of expressing the query in raw SQL***
        
        db.sequelize.query(
        "SELECT * FROM chargingSession e NATURAL JOIN chargingPoint p " +
        "WHERE (p.stationId = :stationId) AND (e.startTime > :datetimeFrom) " + 
        "AND (e.startTime < :datetimeTo)", 
        { 
            type: db.sequelize.QueryTypes.SELECT 
        ,
            replacements: {
                stationId: stationId,
                datetimeFrom: datetimeFrom,
                datetimeTo: datetimeTo
        }}) 
        */
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Error while retrieving the charging sessions of the station"
                })
            });     
    }
    else if (req.params.providerId && req.params.datetimeTo && req.params.datetimeFrom) {
        let {providerId, datetimeFrom, datetimeTo} = req.params;

        chargingSession.findAll({ where: {
            '$station.energyProviderId$': providerId,
            startTime: {
                [Op.between] : [datetimeFrom, datetimeTo]
            }},
            include: {model: chargingPoint, station} 
        })
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Error while retrieving the charging sessions of the provider"
                })
            });     
    }
    else {
        res.status(400).send({
            message: "Invalid use of parameters"
        })
        return;
    }
    
};


exports.reset = (req, res, next) => {
    chargingSession.destroy({
        truncate: true
    }).then(() => {
        console.log("chargingSessions table was reset!");
        res.send({status: "OK"});
    }).catch(() => {
        res.send({status: "failed"});
    })
};