const db = require("../models");
const {Op} = require("sequelize");
const { parse } = require('json2csv');
const chargingPoint = db.chargingPoint;
const chargingSession = db.chargingSession;
const charger = db.charger;
const station = db.station;
const energyProvider = db.energyProvider;
const electricVehicle = db.electricVehicle;
const user = db.user;

const dateFormat = require('dateformat');


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
        let requestTimestamp = new Date();
        let format = req.query.format;
        let condition = {
            chargingPointId: pointId,
            startTime: {[Op.between]: [datetimeFrom, datetimeTo]}
        };

        chargingSession.findAll({
            where: condition,
            include: [
                {
                    model: chargingPoint, include: [
                        {
                            model: station,
                            include: [user]
                        },{
                            model: charger
                        }
                    ]
                },
                electricVehicle
            ]
        })
            .then(data => {
                datetimeFrom = datetimeFrom.substring(0,4) + '-' + datetimeFrom.substring(4,6) + '-' + datetimeFrom.substring(6,8);
                datetimeTo = datetimeTo.substring(0,4) + '-' + datetimeTo.substring(4,6) + '-' + datetimeTo.substring(6,8);
                let dataObjects = data.map((item, index) => {
                        let obj = JSON.parse(JSON.stringify(item));
                        return {
                            SessionIndex: index,
                            SessionId: obj.id,
                            StartedOn: dateFormat(obj.startTime, "yyyy-mm-dd HH:MM:ss"),
                            FinishedOn: dateFormat(obj.endTime, "yyyy-mm-dd HH:MM:ss"),
                            Protocol: obj.chargingPoint.charger.protocol,
                            EnergyDelivered: obj.energyDelivered,
                            Payment: obj.paymentType,
                            VehicleType: obj.electricVehicle.vehicleType
                        }
                    }
                );
                let response = {
                    Point: req.params.pointId,
                    PointOperator: JSON.parse(JSON.stringify(data))[0].chargingPoint.station.user.fullName,
                    RequestTimestamp: dateFormat(requestTimestamp, "yyyy-mm-dd HH:MM:ss"),
                    PeriodFrom: dateFormat(datetimeFrom, "yyyy-mm-dd HH:MM:ss"),
                    PeriodTo: dateFormat(datetimeTo, "yyyy-mm-dd HH:MM:ss"),
                    NumberOfChargingSessions: dataObjects.length,
                    ChargingSessionsList: dataObjects
                }
                // send csv response, if explicitly mentioned
                if (format === 'csv') {
                    const fieldsFirst = ["Point", "PointOperator", "RequestTimestamp", "PeriodFrom", "PeriodTo", "NumberOfChargingSessions"];
                    delete response.ChargingSessionsList;
                    const csvFirst = parse(response, {fieldsFirst});
                    const fieldsSecond = ["SessionIndex", "SessionId", "StartedOn", "FinishedOn", "Protocol", "EnergyDelivered", "Payment", "VehicleType"];
                    const csvSecond = parse(dataObjects, {fieldsSecond});
                    return res.type('text/csv').status(200).send(csvFirst + '\n\n' + csvSecond);
                }
                // otherwise, send json response
                return res.type('application/json').status(200).send(response);
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Error while retrieving the charging sessions of the point"
                });
            });
    } else if (req.params.vehicleId && req.params.datetimeTo && req.params.datetimeFrom) {
        let {vehicleId, datetimeFrom, datetimeTo} = req.params;

        let condition = {
            electricVehicleId: vehicleId,
            startTime: {[Op.between]: [datetimeFrom, datetimeTo]}
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
    } else if (req.params.stationId && req.params.datetimeTo && req.params.datetimeFrom) {
        let {stationId, datetimeFrom, datetimeTo} = req.params;

        chargingSession.findAll({
            where: {
                '$chargingPoint.stationId$': stationId,
                startTime: {
                    [Op.between]: [datetimeFrom, datetimeTo]
                }
            },
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
    } else if (req.params.providerId && req.params.datetimeTo && req.params.datetimeFrom) {
        let {providerId, datetimeFrom, datetimeTo} = req.params;
        let requestTimestamp = new Date();


        chargingSession.findAll({
            where: {
                '$chargingPoint.station.energyProviderId$': providerId,
                startTime: {
                    [Op.between]: [datetimeFrom, datetimeTo]
                }
            },
            include: [
                {
                    model: chargingPoint, include: [
                        {
                            model: station,
                            include: [user,energyProvider]
                        }
                    ]
                },
                electricVehicle
            ]
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
    } else {
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