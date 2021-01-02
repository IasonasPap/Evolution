const db = require("../models");
const {Op} = require("sequelize");
const { parse } = require('json2csv');
const chargingPoint = db.chargingPoint;
const chargingSession = db.chargingSession;
const station = db.station;
const energyProvider = db.energyProvider;
const electricVehicle = db.electricVehicle;
const user = db.user;
const charger = db.charger;

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
    let requestTimestamp = new Date();
    if (req.params.pointId && req.params.datetimeTo && req.params.datetimeFrom) {
        let {pointId, datetimeFrom, datetimeTo} = req.params;
        let {format} = req.query;
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
                            include: [{model:user, attributes: {exclude:['password']}}]
                        },
                        charger
                    ]
                },
                electricVehicle
            ]
        })
            .then(data => {
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
                );
                let response = {
                    point: parseInt(req.params.pointId),
                    pointOperator: JSON.parse(JSON.stringify(data))[0].chargingPoint.station.userId,
                    requestTimestamp: dateFormat(requestTimestamp, "yyyy-mm-dd HH:MM:ss"),
                    periodFrom: dateFormat(datetimeFrom, "yyyy-mm-dd HH:MM:ss"),
                    periodTo: dateFormat(datetimeTo, "yyyy-mm-dd HH:MM:ss"),
                    numberOfChargingSessions: dataJson.length,
                    chargingSessionsList: dataJson
                }
                // send csv response, if explicitly mentioned
                if (format === 'csv') {
                    const fieldsFirst = ["point", "pointOperator", "pequestTimestamp", "periodFrom", "periodTo", "numberOfChargingSessions"];
                    delete response.chargingSessionsList;
                    const csvFirst = parse(response, {fieldsFirst});
                    const fieldsSecond = ["sessionIndex", "sessionId", "startedOn", "finishedOn", "protocol", "energyDelivered", "payment", "vehicleType"];
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
    } else if (req.params.vehicleId && req.params.datetimeTo && req.params.datetimeFrom) {
        let {vehicleId, datetimeFrom, datetimeTo} = req.params;

        let condition = {
            electricVehicleId: vehicleId,
            startTime: {[Op.between]: [datetimeFrom, datetimeTo]}
        };

        chargingSession.findAll({
            where: condition,
            include: {
                model: chargingPoint, include: [
                    {
                        model: station,
                        include: [{model:energyProvider, attributes: ['enterpriseTitle']}]
                    }
                ]
            },
            electricVehicle
        })
            .then(data => {
                datetimeFrom = datetimeFrom.substring(0, 4) + '-' + datetimeFrom.substring(4, 6) + '-' + datetimeFrom.substring(6, 8);
                datetimeTo = datetimeTo.substring(0, 4) + '-' + datetimeTo.substring(4, 6) + '-' + datetimeTo.substring(6, 8);
                let totalEnergyConsumed = 0;
                let pointsVisited = [];
                let dataJson = data.map((item, index) => {
                        let obj = JSON.parse(JSON.stringify(item));
                        totalEnergyConsumed += item.energyDelivered;
                        if (pointsVisited.indexOf(item.chargingPointId) < 0){
                            pointsVisited.push(item.chargingPointId);
                        }
                        return {
                            sessionIndex: index,
                            sessionId: obj.id,
                            energyProvider: obj.chargingPoint.station.energyProvider.enterpriseTitle,
                            startedOn: dateFormat(obj.startTime, "yyyy-mm-dd HH:MM:ss"),
                            finishedOn: dateFormat(obj.endTime, "yyyy-mm-dd HH:MM:ss"),
                            energyDelivered: obj.energyDelivered,
                            pricePolicyRef: 'Some price policy ref',
                            costPerKwh: parseFloat((obj.totalCost/obj.energyDelivered).toFixed(4)),
                            sessionCost: obj.totalCost
                        }
                    }
                );
                let response = {
                    vehicleId: parseInt(req.params.vehicleId),
                    requestTimestamp: dateFormat(requestTimestamp, "yyyy-mm-dd HH:MM:ss"),
                    periodFrom: dateFormat(datetimeFrom, "yyyy-mm-dd HH:MM:ss"),
                    periodTo: dateFormat(datetimeTo, "yyyy-mm-dd HH:MM:ss"),
                    totalEnergyConsumed: totalEnergyConsumed,
                    numberOfVisitedPoints: pointsVisited.length,
                    numberOfVehicleChargingSessions: dataJson.length,
                    vehicleChargingSessionsList: dataJson
                }
                res.status(200).send(response);
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
                            include: [{model:user, attributes: {exclude:['password']}}]
                        }
                    ]
                }
            ]

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
                datetimeFrom = datetimeFrom.substring(0, 4) + '-' + datetimeFrom.substring(4, 6) + '-' + datetimeFrom.substring(6, 8);
                datetimeTo = datetimeTo.substring(0, 4) + '-' + datetimeTo.substring(4, 6) + '-' + datetimeTo.substring(6, 8);
                let dataJson = JSON.parse(JSON.stringify(data));
                let groupByCpId = dataJson.reduce((acc, item) => {
                    acc.data[item.chargingPointId] = acc.data[item.chargingPointId] || {energyDelivered: 0, pointSessions: 0};
                    acc.data[item.chargingPointId].energyDelivered += item.energyDelivered;
                    acc.data[item.chargingPointId].energyDelivered = parseFloat(acc.data[item.chargingPointId].energyDelivered.toFixed(2));
                    acc.data[item.chargingPointId].pointId = item.chargingPointId;
                    acc.data[item.chargingPointId].pointSessions += 1;
                    acc.totalEnergyDelivered += item.energyDelivered;
                    return acc;
                }, {totalEnergyDelivered:0, data:{}});
                let response = {
                    stationId: dataJson[0].chargingPoint.stationId,
                    operator: dataJson[0].chargingPoint.station.user,
                    requestTimestamp: dateFormat(requestTimestamp, "yyyy-mm-dd HH:MM:ss"),
                    periodFrom: dateFormat(datetimeFrom, "yyyy-mm-dd HH:MM:ss"),
                    periodTo: dateFormat(datetimeTo, "yyyy-mm-dd HH:MM:ss"),
                    totalEnergyDelivered: parseFloat(groupByCpId.totalEnergyDelivered.toFixed(2)),
                    numberOfChargingSessions: dataJson.length,
                    numberOfActivePoints: Object.entries(groupByCpId.data).length,
                    sessionSummaryList: Object.values(groupByCpId.data)
                }
                res.status(200).send(response);
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Error while retrieving the charging sessions of the station"
                })
            });
    } else if (req.params.providerId && req.params.datetimeTo && req.params.datetimeFrom) {
        let {providerId, datetimeFrom, datetimeTo} = req.params;

        chargingSession.findAll({
            include: [
                {
                    model: chargingPoint, required:true, include: [
                        {
                            model: station,
                            attributes: ['energyProviderId'],
                            where: {
                                energyProviderId: providerId,
                            },
                            required: true,
                            include: [{model:energyProvider,required:true}]
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
                            pricePolicyRef: 'Some price policy ref',
                            costPerKwh: parseFloat((obj.totalCost/obj.energyDelivered).toFixed(4)),
                            totalCost: parseFloat(obj.totalCost)
                        }
                    }
                )
                res.status(200).send(dataJson);
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