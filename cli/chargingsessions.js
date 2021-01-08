const db = require("../backend/models");
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


module.exports = (val, datetimeFrom, datetimeTo, flag, format) => {
    
    if (flag == 'point') {

        pointId = val;
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
        }).then(data => {
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
            });
            let response = {
                point: parseInt(pointId),
                pointOperator: JSON.parse(JSON.stringify(data))[0].chargingPoint.station.user.fullName,
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
                console.log(csvFirst + '\n\n' + csvSecond);
                process.exit()
            }
            // otherwise, send json response
            console.log(response)
            process.exit()
        }).catch(err => {
            console.log({error: "Error while retrieving the charging sessions of the point"});
            process.exit()
        });
    }

    if (flag == 'ev') {

        vehicleId = val;
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
                        include: [{model:energyProvider, attributes: ['enterpriseTitle','costPerKw','costPerKwh']}]
                    }
                ]
            },
            electricVehicle
        }).then(data => {
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
                        pricePolicyRef: `Cost per kW:  €${obj.chargingPoint.station.energyProvider.costPerKw} | ` + 
                                        `Cost per kWh: €${obj.chargingPoint.station.energyProvider.costPerKwh}`,
                        costPerKwh: parseFloat((obj.totalCost/obj.energyDelivered).toFixed(4)),
                        sessionCost: obj.totalCost
                    }
                }
            );
            let response = {
                vehicleId: parseInt(vehicleId),
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
                console.log(csvFirst + '\n\n' + csvSecond);
                process.exit()
            }
            // otherwise, send json response
            console.log(response)
            process.exit()
        }).catch(err => {
            console.log({error: "Error while retrieving the charging sessions of the vehicle"});
            process.exit()
        });
    }

    if (flag == 'station') {

        stationId = val;
        
        let condition = {
            '$chargingPoint.stationId$': stationId,
            startTime: {[Op.between]: [datetimeFrom, datetimeTo]}
        }

        chargingSession.findAll({
            attributes: {exclude: ['id']},
            where: condition,
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

        }).then(data => {
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
                operator: dataJson[0].chargingPoint.station.user.fullName,
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
                console.log(csvFirst + '\n\n' + csvSecond);
                process.exit()
            }
            // otherwise, send json response
            console.log(response)
            process.exit()
        }).catch(err => {
            console.log({error: "Error while retrieving the charging sessions of the station"});
            process.exit()
        });
    }

    if (flag == 'provider') {

        providerId = val;
        
        let condition = {
            startTime: {[Op.between]: [datetimeFrom, datetimeTo]}
        }

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
            where: condition
        }).then(data => {
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
                        pricePolicyRef: `Cost per kW:  €${obj.chargingPoint.station.energyProvider.costPerKw} | ` + 
                                        `Cost per kWh: €${obj.chargingPoint.station.energyProvider.costPerKwh}`,
                        costPerKwh: parseFloat((obj.totalCost/obj.energyDelivered).toFixed(4)),
                        totalCost: parseFloat(obj.totalCost)
                    }
                }
            )
            // send csv response, if explicitly mentioned
            if (format === 'csv') {
                const fields = ["providerId", "providerName", "stationId", "sessionId", "vehicleId", "startedOn", "energyDelivered", "pricePolicyRef", "costPerKwh", "totalCost"];
                const csv = parse(dataJson, {fields});
                console.log(csv);
                process.exit()
            }
            // otherwise, send json response
            console.log(dataJson)
            process.exit()
        }).catch(err => {
            console.error(err)
            console.log({error: "Error while retrieving the charging sessions of the provider"});
            process.exit()
        });
    }
}