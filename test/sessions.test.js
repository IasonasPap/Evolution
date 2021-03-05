const app = require('../backend/server'); // Link to your server file
const supertest = require('supertest');
const request = supertest(app);
const chai = require('chai');
const bcrypt = require('bcrypt');
const { response } = require('express');
const { should } = require('chai');

chai.should();
process.env.NODE_ENV ='test';

describe('Charging Sessions endpoints', () => {

    let newSessionId;

    const newChargingSession = {
        totalCost: 20,
        energyDelivered: 80,
        pointsAwarded: 15,
        startTime: "2021-01-01 21:14:08",
        endTime: "2021-01-01 21:16:08",
        paymentType: "Paypall",
        electricVehicleId: 3,
        chargingPointId: 3
    };
    
    // after((done) => {
    //     request.delete('/evcharge/api/sessions/' + newSessionId)
    //                 .then(function (response) {
    //                         done();
    //             });
    //         });
    // });

    describe.skip('POST /', () => {
        it('Add a new charging session',(done) => {
            request.post('/evcharge/api')
                    .send(newChargingSession)
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.body.should.have.property('id').equal(newSessionId);
                        response.body.should.have.property('totalCost').equal(20);
                        response.body.should.have.property('pointsAwarded').equal(15);
                        response.body.should.have.property('startTime').equal("2021-01-01 21:14:08");
                        response.body.should.have.property('endTime').equal("2021-01-01 21:16:08");
                        response.body.should.have.property('paymentType').equal("Paypall");
                        response.body.should.have.property('electricVehicleId').equal(3);
                        response.body.should.have.property('chargingPointId').equal(3);
                        newSessionId = response.body.id;
                        done();
                    });
        });
    });

    describe('GET /SessionsPerPoint/:pointID/:yyyymmdd_from/:yyyymmdd_to', () => {
        
        it('Retrieve the charging sessions for a specific point',(done) => {
            request.get('/evcharge/api/SessionsPerPoint/9/20201101/20201130')
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.body.should.have.property("point").equal(9);
                        response.body.should.have.property("pointOperator");
                        response.body.should.have.property("requestTimestamp");
                        response.body.should.have.property("periodFrom");
                        response.body.should.have.property("periodTo");
                        response.body.should.have.property("numberOfChargingSessions").equal(response.body.chargingSessionsList.length);
                        response.body.should.have.property("chargingSessionsList").be.a('array')
                        if(response.body.numberOfChargingSessions) {
                            response.body.chargingSessionsList[0].should.have.property("sessionIndex");
                            response.body.chargingSessionsList[0].should.have.property("sessionId");
                            response.body.chargingSessionsList[0].should.have.property("startedOn");
                            response.body.chargingSessionsList[0].should.have.property("finishedOn");
                            response.body.chargingSessionsList[0].should.have.property("protocol");
                            response.body.chargingSessionsList[0].should.have.property("energyDelivered");
                            response.body.chargingSessionsList[0].should.have.property("payment");
                            response.body.chargingSessionsList[0].should.have.property("vehicleType");
                        }
                        done();
                    })
        });
    });

    describe('GET /SessionsPerStation/:stationID/:yyyymmdd_from/:yyyymmdd_to', () => {
        

        it('Retrieve the charging sessions for a specific station',(done) => {
            request.get("/evcharge/api/SessionsPerStation/9/20201101/20201130")
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.body.should.have.property("stationId").equal(9);
                        response.body.should.have.property("operator");
                        response.body.should.have.property("requestTimestamp");
                        response.body.should.have.property("periodFrom");
                        response.body.should.have.property("periodTo");
                        response.body.should.have.property("totalEnergyDelivered");
                        response.body.should.have.property("numberOfChargingSessions");
                        response.body.should.have.property("numberOfActivePoints").equal(response.body.sessionSummaryList.length);
                        response.body.should.have.property("sessionSummaryList").be.a('array');
                        if(response.body.numberOfActivePoints) {
                            response.body.sessionSummaryList[0].should.have.property("pointId");
                            response.body.sessionSummaryList[0].should.have.property("pointSessions");
                            response.body.sessionSummaryList[0].should.have.property("energyDelivered");
                        }
                        done();
        });
        });
    });

    describe('GET /SessionsPerEV/:vehicleID/:yyyymmdd_from/:yyyymmdd_to', () => {
        
        it('Retrieve the charging sessions for a specific electric vehicle',(done) => {
            request.get("/evcharge/api/SessionsPerEV/7/20200201/20200229")
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.body.should.have.property("vehicleId").equal(7);
                        response.body.should.have.property("requestTimestamp");
                        response.body.should.have.property("periodFrom");
                        response.body.should.have.property("periodTo");
                        response.body.should.have.property("totalEnergyConsumed");
                        response.body.should.have.property("numberOfVisitedPoints");
                        response.body.should.have.property("numberOfVehicleChargingSessions").equal(response.body.vehicleChargingSessionsList.length);
                        response.body.should.have.property("vehicleChargingSessionsList").be.a('array');
                        if(response.body.numberOfVehicleChargingSessions) {
                            response.body.vehicleChargingSessionsList[0].should.have.property("sessionIndex");
                            response.body.vehicleChargingSessionsList[0].should.have.property("sessionId");
                            response.body.vehicleChargingSessionsList[0].should.have.property("energyProvider");
                            response.body.vehicleChargingSessionsList[0].should.have.property("startedOn");
                            response.body.vehicleChargingSessionsList[0].should.have.property("finishedOn");
                            response.body.vehicleChargingSessionsList[0].should.have.property("pricePolicyRef");
                            response.body.vehicleChargingSessionsList[0].should.have.property("costPerKwh");
                            response.body.vehicleChargingSessionsList[0].should.have.property("sessionCost");
                        }
                        done();
                    });
        });
    });

    describe('GET /SessionsPerProvider/:providerID/:yyyymmdd_from/:yyyymmdd_to', () => {
        
        it('Retrieve the charging sessions for a specific provider',(done) => {
            request.get("/evcharge/api/SessionsPerProvider/1/20201101/20201130")
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.body[0].should.have.property("providerId").equal(1);
                        response.body[0].should.have.property("providerName");
                        response.body[0].should.have.property("stationId");
                        response.body[0].should.have.property("sessionId");
                        response.body[0].should.have.property("vehicleId");
                        response.body[0].should.have.property("startedOn");
                        response.body[0].should.have.property("finishedOn");
                        response.body[0].should.have.property("energyDelivered");
                        response.body[0].should.have.property("pricePolicyRef");
                        response.body[0].should.have.property("costPerKwh");
                        response.body[0].should.have.property("totalCost");
                        done();
                    })
        });
    });
})