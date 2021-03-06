const db = require("../models");
const {Op} = require("sequelize");
const {parse} = require('json2csv');
const moment = require('moment');
const chargingPoint = db.chargingPoint;
const chargingSession = db.chargingSession;
const charger = db.charger;
const station = db.station;
const energyProvider = db.energyProvider;
const electricVehicle = db.electricVehicle;
const user = db.user;

const fastcsv = require("fast-csv");
const fs = require("fs");

const dateFormat = require('dateformat');

//Get all charging sessions
exports.getAll = (req, res) => {
    let {format} = req.query;

    chargingSession.findAll()
        .then(data => {
            if (data.length) {
                if (format === 'csv') {
                    const jsonData = JSON.parse(JSON.stringify(data));
                    //TRY-CATCH
                    const ws = fs.createWriteStream("chargingSessions.csv");

                    fastcsv
                        .write(jsonData, {headers: ["totalCost", "energyDelivered", "pointsAwarded", "startTime", "endTime", "paymentType", "electricVehicleId", "chargingPointId"]})
                        .on("finish", function () {
                            console.log("Write to bezkoder_chargingSessions.csv successfully!");
                        })
                        .pipe(ws);
                    //If i want to just return a response with text/csv format
                    // const fields = ["totalCost","energyDelivered","pointsAwarded","startTime","endTime","paymentType","electricVehicleId","chargingPointId"];
                    // const csv = parse(data, {fields});
                    // return res.type('text/csv').status(200).send(csv);
                    return res.status(200).send({message: "File bezkoder_chargingSessions.csv created successfully"});
                }

                return res.send(data);
            } else {
                return res.status(404).send({message: "There are no charging sessions"});
            }
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving charging sessions."
            });
        });
};

// Create and Save a new Charging Event
exports.create = (req, res, next) => {
    // Validate request
    if (!req.body.startTime) req.body.startTime = moment().format('YYYY-MM-DD hh:mm:ss');

    if (req.body.startTime > req.body.endTime) {
        return res.status(400).send({
            message: "Session end time should be after session start time!"
        })
    }

    // Create new charging event
    const newChargingSession = {
        electricVehicleId: req.body.electricVehicleId,
        chargingPointId: req.body.chargingPointId,
        totalCost: (req.body.totalCost ? req.body.totalCost : null),
        energyDelivered: req.body.energyDelivered,
        paymentType: req.body.paymentType || 'Credit card',
        pointsAwarded: (Math.floor(req.body.totalCost) * 0.1).toFixed(2),
        startTime: req.body.startTime,
        endTime: req.body.endTime
    };

    chargingSession.create(newChargingSession)
        .then(data => {
            let dataJson = JSON.parse(JSON.stringify(data));
            dataJson.startTime = dateFormat(data.startTime, "yyyy-mm-dd HH:MM:ss");
            dataJson.endTime = dateFormat(data.endTime, "yyyy-mm-dd HH:MM:ss");
            res.send(dataJson)
        })
        .catch(err => {
            if (err) {
                res.status(400).send({
                    message: err.message
                })
            } else {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while creating the charging event."
                });
            }
        });
};

// Retrieve chargingSession with a condition
exports.findAll = (req, res) => {
    let requestTimestamp = new Date();
    let {format} = req.query;

    if (req.params.pointId && req.params.datetimeTo && req.params.datetimeFrom) {
        let {pointId, datetimeFrom, datetimeTo} = req.params;
        let condition = {
            chargingPointId: pointId,
            startTime: {[Op.between]: [datetimeFrom, datetimeTo]}
        };

        if (datetimeFrom > datetimeTo || !moment(datetimeFrom, 'YYYYMMDD', true).isValid() || !moment(datetimeTo, 'YYYYMMDD', true).isValid()) {
            res.status(400).send({
                message: 'invalid dates'
            });
            return;
        }

        chargingPoint.count({where: {id: pointId}}).then(c => {
            if (c <= 0) {
                res.status(404).send({
                    message: 'Charging point with id=' + pointId + ' not found'
                });
            } else {
                chargingSession.findAll({
                    where: condition,
                    include: [
                        {
                            model: chargingPoint, include: [
                                {
                                    model: station,
                                    include: [{model: user, attributes: {exclude: ['password']}}]
                                },
                                charger
                            ]
                        },
                        electricVehicle
                    ]
                })
                    .then(data => {
                        if (!data.length) {
                            return res.status(402).send({message: "No charging sessions for this time period"})
                        }
                        datetimeFrom = datetimeFrom.substring(0, 4) + '-' + datetimeFrom.substring(4, 6) + '-' + datetimeFrom.substring(6, 8);
                        datetimeTo = datetimeTo.substring(0, 4) + '-' + datetimeTo.substring(4, 6) + '-' + datetimeTo.substring(6, 8);
                        let dataJson = data.map((item, index) => {
                                let obj = JSON.parse(JSON.stringify(item));
                                return {
                                    sessionIndex: index,
                                    sessionId: obj.id,
                                    startedOn: dateFormat(obj.startTime, "yyyy-mm-dd HH:MM:ss"),
                                    finishedOn: dateFormat(obj.endTime, "yyyy-mm-dd HH:MM:ss"),
                                    protocol: obj.chargingPoint.charger.protocol,
                                    energyDelivered: obj.energyDelivered,
                                    payment: obj.paymentType,
                                    vehicleType: obj.electricVehicle.vehicleType
                                }
                            }
                        ).sort(function (a, b) {
                            return moment(a.startedOn) - moment(b.startedOn) || moment(a.finishedOn) - moment(b.finishedOn);
                        });
                        let response = {
                            point: parseInt(req.params.pointId),
                            pointOperator: JSON.parse(JSON.stringify(data))[0].chargingPoint.station.user.fullName,
                            requestTimestamp: dateFormat(requestTimestamp, "yyyy-mm-dd HH:MM:ss"),
                            periodFrom: dateFormat(datetimeFrom, "yyyy-mm-dd HH:MM:ss"),
                            periodTo: dateFormat(datetimeTo, "yyyy-mm-dd HH:MM:ss"),
                            numberOfChargingSessions: dataJson.length,
                            chargingSessionsList: dataJson
                        }
                        // send csv response, if explicitly mentioned
                        if (format === 'csv') {
                            const fieldsFirst = ["Point", "PointOperator", "RequestTimestamp", "PeriodFrom", "PeriodTo", "NumberOfChargingSessions"];
                            delete response.ChargingSessionsList;
                            const csvFirst = parse(response, {fieldsFirst});
                            const fieldsSecond = ["SessionIndex", "SessionId", "StartedOn", "FinishedOn", "Protocol", "EnergyDelivered", "Payment", "VehicleType"];
                            const csvSecond = parse(dataJson, {fieldsSecond});
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
            }
        });


    } else if (req.params.vehicleId && req.params.datetimeTo && req.params.datetimeFrom) {
        let {vehicleId, datetimeFrom, datetimeTo} = req.params;

        let condition = {
            electricVehicleId: vehicleId,
            startTime: {[Op.between]: [datetimeFrom, datetimeTo]}
        };

        if (datetimeFrom > datetimeTo || !moment(datetimeFrom, 'YYYYMMDD', true).isValid() || !moment(datetimeTo, 'YYYYMMDD', true).isValid()) {
            res.status(400).send({
                message: 'invalid dates'
            });
            return;
        }

        electricVehicle.count({where: {id: vehicleId}}).then(c => {
            if (c <= 0) {
                res.status(404).send({
                    message: 'EV with id=' + vehicleId + ' not found'
                });
            } else {
                chargingSession.findAll({
                    where: condition,
                    include: [{
                        model: chargingPoint, include: [
                            {
                                model: station,
                                include: [{
                                    model: energyProvider,
                                    attributes: ['enterpriseTitle', 'costPerKw', 'costPerKwh']
                                }]
                            }
                        ]
                    },
                        {model: electricVehicle}
                    ]
                })
                    .then(data => {
                        if (!data.length) {
                            return res.status(402).send({message: "No charging sessions for this time period"})
                        }
                        datetimeFrom = datetimeFrom.substring(0, 4) + '-' + datetimeFrom.substring(4, 6) + '-' + datetimeFrom.substring(6, 8);
                        datetimeTo = datetimeTo.substring(0, 4) + '-' + datetimeTo.substring(4, 6) + '-' + datetimeTo.substring(6, 8);
                        let licensePlate = data[0].electricVehicle.licensePlate;
                        let totalEnergyConsumed = 0;
                        let pointsVisited = [];
                        let dataJson = data.map((item, index) => {
                                let obj = JSON.parse(JSON.stringify(item));
                                totalEnergyConsumed += item.energyDelivered;
                                if (pointsVisited.indexOf(item.chargingPointId) < 0) {
                                    pointsVisited.push(item.chargingPointId);
                                }
                                return {
                                    sessionIndex: index,
                                    sessionId: obj.id,
                                    energyProvider: obj.chargingPoint.station.energyProvider.enterpriseTitle,
                                    startedOn: dateFormat(obj.startTime, "yyyy-mm-dd HH:MM:ss"),
                                    finishedOn: dateFormat(obj.endTime, "yyyy-mm-dd HH:MM:ss"),
                                    energyDelivered: obj.energyDelivered,
                                    pricePolicyRef: `Cost per kW:  ???${obj.chargingPoint.station.energyProvider.costPerKw} | ` +
                                        `Cost per kWh: ???${obj.chargingPoint.station.energyProvider.costPerKwh}`,
                                    costPerKwh: parseFloat((obj.totalCost / obj.energyDelivered).toFixed(4)),
                                    sessionCost: obj.totalCost
                                }
                            }
                        ).sort(function (a, b) {
                            return moment(a.startedOn) - moment(b.startedOn) || moment(a.finishedOn) - moment(b.finishedOn);
                        });
                        let response = {
                            vehicleId: parseInt(req.params.vehicleId),
                            licensePlate: licensePlate,
                            requestTimestamp: dateFormat(requestTimestamp, "yyyy-mm-dd HH:MM:ss"),
                            periodFrom: dateFormat(datetimeFrom, "yyyy-mm-dd HH:MM:ss"),
                            periodTo: dateFormat(datetimeTo, "yyyy-mm-dd HH:MM:ss"),
                            totalEnergyConsumed: totalEnergyConsumed,
                            numberOfVisitedPoints: pointsVisited.length,
                            numberOfVehicleChargingSessions: dataJson.length,
                            vehicleChargingSessionsList: dataJson
                        }
                        // send csv response, if explicitly mentioned
                        if (format === 'csv') {
                            const fieldsFirst = ["vehicleId", "requestTimestamp", "periodFrom", "periodTo", "totalEnergyConsumed", "numberOfVisitedPoints", "numberOfVehicleChargingSessions"];
                            delete response.vehicleChargingSessionsList;
                            const csvFirst = parse(response, {fieldsFirst});
                            const fieldsSecond = ["sessionIndex", "sessionId", "energyProvider", "startedOn", "finishedOn", "energyDelivered", "pricePolicyRef", "costPerKwh", "sessionCost"];
                            const csvSecond = parse(dataJson, {fieldsSecond});
                            return res.type('text/csv').status(200).send(csvFirst + '\n\n' + csvSecond);
                        }
                        // otherwise, send json response
                        return res.type('application/json').status(200).send(response);
                    })
                    .catch(err => {
                        res.status(500).send({
                            message:
                                err.message || "Error while retrieving the charging sessions of the vehicle"
                        });
                    });

            }
        });


    } else if (req.params.stationId && req.params.datetimeTo && req.params.datetimeFrom) {
        let {stationId, datetimeFrom, datetimeTo} = req.params;

        if (datetimeFrom > datetimeTo || !moment(datetimeFrom, 'YYYYMMDD', true).isValid() || !moment(datetimeTo, 'YYYYMMDD', true).isValid()) {
            res.status(400).send({
                message: 'invalid dates'
            });
            return;
        }

        station.count({where: {id: stationId}}).then(c => {
            if (c <= 0) {
                res.status(404).send({
                    message: 'Station with id=' + stationId + ' not found'
                });
            } else {
                chargingSession.findAll({
                    attributes: {exclude: ['id']},
                    where: {
                        '$chargingPoint.stationId$': stationId,
                        startTime: {
                            [Op.between]: [datetimeFrom, datetimeTo]
                        }
                    },
                    include: [
                        {
                            model: chargingPoint, include: [
                                {
                                    model: station,
                                    include: [{model: user, attributes: {exclude: ['password']}}]
                                }
                            ]
                        }
                    ]
                })
                    .then(data => {
                        if (!data.length) {
                            return res.status(402).send({message: "No charging sessions for this time period"})
                        }
                        datetimeFrom = datetimeFrom.substring(0, 4) + '-' + datetimeFrom.substring(4, 6) + '-' + datetimeFrom.substring(6, 8);
                        datetimeTo = datetimeTo.substring(0, 4) + '-' + datetimeTo.substring(4, 6) + '-' + datetimeTo.substring(6, 8);
                        let dataJson = JSON.parse(JSON.stringify(data));
                        let groupByCpId = dataJson.reduce((acc, item) => {
                            acc.data[item.chargingPointId] = acc.data[item.chargingPointId] || {
                                energyDelivered: 0,
                                pointSessions: 0
                            };
                            acc.data[item.chargingPointId].energyDelivered += item.energyDelivered;
                            acc.data[item.chargingPointId].energyDelivered = parseFloat(acc.data[item.chargingPointId].energyDelivered.toFixed(2));
                            acc.data[item.chargingPointId].pointId = item.chargingPointId;
                            acc.data[item.chargingPointId].pointSessions += 1;
                            acc.totalEnergyDelivered += item.energyDelivered;
                            return acc;
                        }, {totalEnergyDelivered: 0, data: {}});
                        let response = {
                            stationId: dataJson[0].chargingPoint.stationId,
                            operator: dataJson[0].chargingPoint.station.user.fullName,
                            requestTimestamp: dateFormat(requestTimestamp, "yyyy-mm-dd HH:MM:ss"),
                            periodFrom: dateFormat(datetimeFrom, "yyyy-mm-dd HH:MM:ss"),
                            periodTo: dateFormat(datetimeTo, "yyyy-mm-dd HH:MM:ss"),
                            totalEnergyDelivered: parseFloat(groupByCpId.totalEnergyDelivered.toFixed(2)),
                            numberOfChargingSessions: dataJson.length,
                            numberOfActivePoints: Object.entries(groupByCpId.data).length,
                            sessionSummaryList: Object.values(groupByCpId.data)
                        }
                        // send csv response, if explicitly mentioned
                        if (format === 'csv') {
                            const fieldsFirst = ["stationId", "operator", "requestTimestamp", "periodFrom", "periodTo", "totalEnergyDelivered", "numberOfChargingSessions", "numberOfActivePoints"];
                            delete response.sessionSummaryList;
                            const csvFirst = parse(response, {fieldsFirst});
                            const fieldsSecond = ["pointId", "pointSessions", "energyDelivered"];
                            const csvSecond = parse(Object.values(groupByCpId.data), {fieldsSecond});
                            return res.type('text/csv').status(200).send(csvFirst + '\n\n' + csvSecond);
                        }
                        // otherwise, send json response
                        return res.type('application/json').status(200).send(response);
                    })
                    .catch(err => {
                        res.status(500).send({
                            message:
                                err.message || "Error while retrieving the charging sessions of the station"
                        })
                    });

            }
        });

    } else if (req.params.providerId && req.params.datetimeTo && req.params.datetimeFrom) {
        let {providerId, datetimeFrom, datetimeTo} = req.params;

        if (datetimeFrom > datetimeTo || !moment(datetimeFrom, 'YYYYMMDD', true).isValid() || !moment(datetimeTo, 'YYYYMMDD', true).isValid()) {
            res.status(400).send({
                message: 'invalid dates'
            });
            return;
        }

        energyProvider.count({where: {id: providerId}}).then(c => {
            if (c <= 0) {
                res.status(404).send({
                    message: 'Provider with id=' + providerId + ' not found'
                });
            } else {
                chargingSession.findAll({
                    include: [
                        {
                            model: chargingPoint, required: true, include: [
                                {
                                    model: station,
                                    attributes: ['energyProviderId'],
                                    where: {
                                        energyProviderId: providerId,
                                    },
                                    required: true,
                                    include: [{model: energyProvider, required: true}]
                                }
                            ],
                        },
                    ],
                    where: {
                        startTime: {
                            [Op.between]: [datetimeFrom, datetimeTo]
                        }
                    }
                })
                    .then(data => {
                        if (!data.length) {
                            return res.status(402).send({message: "No charging sessions for this time period"})
                        }
                        datetimeFrom = datetimeFrom.substring(0, 4) + '-' + datetimeFrom.substring(4, 6) + '-' + datetimeFrom.substring(6, 8);
                        datetimeTo = datetimeTo.substring(0, 4) + '-' + datetimeTo.substring(4, 6) + '-' + datetimeTo.substring(6, 8);
                        let dataJson = data.map((item, index) => {
                                let obj = JSON.parse(JSON.stringify(item));
                                return {
                                    providerId: parseInt(obj.chargingPoint.station.energyProviderId),
                                    providerName: obj.chargingPoint.station.energyProvider.enterpriseTitle,
                                    stationId: parseInt(obj.chargingPoint.stationId),
                                    sessionId: parseInt(obj.id),
                                    vehicleId: parseInt(obj.electricVehicleId),
                                    startedOn: dateFormat(obj.startTime, "yyyy-mm-dd HH:MM:ss"),
                                    finishedOn: dateFormat(obj.endTime, "yyyy-mm-dd HH:MM:ss"),
                                    energyDelivered: obj.energyDelivered,
                                    pricePolicyRef: `Cost per kW:  ???${obj.chargingPoint.station.energyProvider.costPerKw} | ` +
                                        `Cost per kWh: ???${obj.chargingPoint.station.energyProvider.costPerKwh}`,
                                    costPerKwh: parseFloat((obj.totalCost / obj.energyDelivered).toFixed(4)),
                                    totalCost: parseFloat(obj.totalCost)
                                }
                            }
                        )
                        // send csv response, if explicitly mentioned
                        if (format === 'csv') {
                            const fields = ["providerId", "providerName", "stationId", "sessionId", "vehicleId", "startedOn", "energyDelivered", "pricePolicyRef", "costPerKwh", "totalCost"];
                            const csv = parse(dataJson, {fields});
                            return res.type('text/csv').status(200).send(csv);
                        }
                        // otherwise, send json response
                        return res.type('application/json').status(200).send(dataJson);
                    })
                    .catch(err => {
                        res.status(500).send({
                            message:
                                err.message || "Error while retrieving the charging sessions of the provider"
                        })
                    });
            }
        });

    } else if (req.params.userId) {
        let {userId} = req.params;
        let datetimeTo = moment(req.query.datetimeTo).add(1, 'day').format('YYYYMMDD');
        let datetimeFrom = req.query.datetimeFrom && moment(req.query.datetimeFrom).format('YYYYMMDD');

        if (datetimeFrom > datetimeTo || !moment(datetimeFrom, 'YYYYMMDD') || !moment(datetimeTo, 'YYYYMMDD')) {
            res.status(400).send({
                message: 'invalid dates'
            });
            return;
        }

        user.count({where: {id: userId}}).then(c => {
            if (c <= 0) {
                res.status(404).send({
                    message: 'User with id=' + userId + ' not found'
                });
            } else {
                chargingSession.findAll({
                    include: [
                        {model: electricVehicle, required: true, where: {userId: userId},},
                        {model: chargingPoint, include: [{model: station}, {model: charger}]}
                    ],
                    where: (!!datetimeFrom && !!datetimeTo) && {
                        startTime: {
                            [Op.between]: [datetimeFrom, datetimeTo]
                        }
                    }
                })
                    .then(data => {
                        let dataJson = data.map((item, index) => {
                                let obj = JSON.parse(JSON.stringify(item));
                                return {
                                    userId: parseInt(obj.electricVehicle.userId),
                                    station: obj.chargingPoint.station,
                                    charger: obj.chargingPoint.charger,
                                    sessionId: parseInt(obj.id),
                                    electricVehicle: obj.electricVehicle,
                                    startTime: dateFormat(obj.startTime, "yyyy-mm-dd HH:MM:ss"),
                                    endTime: dateFormat(obj.endTime, "yyyy-mm-dd HH:MM:ss"),
                                    energyDelivered: obj.energyDelivered,
                                    costPerKwh: parseFloat((obj.totalCost / obj.energyDelivered).toFixed(4)),
                                    totalCost: parseFloat(obj.totalCost),
                                    points: parseFloat(obj.pointsAwarded)
                                }
                            }
                        )
                        return res.type('application/json').status(200).send(dataJson);
                    })
                    .catch(err => {
                        res.status(500).send({
                            message:
                                err.message || "Error while retrieving the charging sessions for user"
                        })
                    });
            }
        });

    } else {
        res.status(400).send({
            message: "Invalid use of parameters"
        })
    }
}

exports.findSessionsPerMultipleStations = (req, res) => {
    if (!req.query.stationId) {
        return res.status(400).send({message: "Give one or more station ids"});
    }
    let stationId = req.query.stationId.split(',');
    let datetimeFrom = req.query.datetimeFrom;
    let datetimeTo = moment(req.query.datetimeTo).add(1, 'day').format('YYYYMMDD');
    let condition = {
        '$chargingPoint.stationId$': [stationId],
    };

    if (datetimeFrom && datetimeTo) {
        condition.startTime = {
            [Op.between]: [datetimeFrom, datetimeTo]
        };
    }

    chargingSession.findAll({
        attributes: {exclude: ['id']},
        where: condition,
        include: [
            {
                model: chargingPoint, include: [
                    {
                        model: station,
                        include: [{model: user, attributes: {exclude: ['password']}}]
                    },
                    charger
                ]
            },
            {model: electricVehicle, include: [user]}
        ]
    }).then(data => {
        let dataJson = JSON.parse(JSON.stringify(data));
        dataJson.map(item => {
            item.costPerKwh = parseFloat((item.totalCost / item.energyDelivered).toFixed(4));
            item.station = item.chargingPoint.station;
            delete item.chargingPoint.station;
        });
        return res.type('application/json').status(200).send(dataJson);
    })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Error while retrieving the charging sessions"
            })
        });
}

// Delete a charging session with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    chargingSession.destroy({
        where: {id: id}
    })
        .then(num => {
            if (num === 1) {
                res.send({
                    message: "Charging session was deleted successfully!"
                });
            } else {
                res.status(400).send({
                    message: `Cannot delete charging session with id=${id}. Session not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete charging session with id=" + id
            });
        });
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
}