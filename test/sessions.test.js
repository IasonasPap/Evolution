process.env.NODE_ENV ='test';

const app = require('../backend/server'); // Link to your server file
const supertest = require('supertest');
const request = supertest(app);
const chai = require('chai');
const bcrypt = require('bcrypt');
const { response } = require('express');
const { should } = require('chai');

chai.should();

describe('Charging Sessions endpoints', () => {

    let newSessionId,userToken;
    const invalidUserToken= "t678igui767678ogyg7u656";

    const newChargingSession = {
        totalCost: 20,
        energyDelivered: 80,
        pointsAwarded: 15,
        startTime: "2021-01-01 21:14:08",
        endTime: "2021-01-02 21:16:08",
        paymentType: "Paypall",
        electricVehicleId: 3,
        chargingPointId: 3
    };

    before((done) => {

        request.post('/evcharge/api/login')
                .set('Content-Type','application/x-www-form-urlencoded')
                .send('username=admin')
                .send('password=petrol4ever')
                .end(function(error,response) {
                    userToken = response.body.token;
                    done();
                });
        
    })

    describe('GET /sessions', () => {

        it('Get all charging sessions', function(done) {
            request.get('/evcharge/api/sessions')
                    .end(function(error,response) {
                        const res = response.body[0];
                        response.status.should.be.equal(200);
                        res.should.have.property('id');
                        res.should.have.property('totalCost');
                        res.should.have.property('energyDelivered');
                        res.should.have.property('pointsAwarded');
                        res.should.have.property('startTime');
                        res.should.have.property('endTime');
                        res.should.have.property('paymentType');
                        res.should.have.property('electricVehicleId');
                        res.should.have.property('chargingPointId');
                        done();
                    });
            
        });
    });

    describe('POST /', () => {

        it('Don\'t create a charging session if any of the necessary fields is undefined',(done) => {
            
            let {totalCost, ...withoutTotalCost} = newChargingSession;
            request.post('/evcharge/api')
                    .send(withoutTotalCost)
                    .end(function(error,response) {
                        response.status.should.be.equal(400);
                        response.body.should.have.property('message').equal("notNull Violation: chargingSession.totalCost cannot be null");
                    });

            let {electricVehicleId, ...withoutElectricVehicleId} = newChargingSession;
            request.post('/evcharge/api')
                    .send(withoutElectricVehicleId)
                    .end(function(error,response) {
                        response.status.should.be.equal(400);
                        response.body.should.have.property('message').equal("notNull Violation: chargingSession.electricVehicleId cannot be null");
                    });

            let {chargingPointId, ...withoutChargingPointId} = newChargingSession;
            request.post('/evcharge/api')
                    .send(withoutChargingPointId)
                    .end(function(error,response) {
                        response.status.should.be.equal(400);
                        response.body.should.have.property('message').equal("notNull Violation: chargingSession.chargingPointId cannot be null");
                    });
            
            //it has default value equals current timestamp        
            // let {startTime, ...withoutStartTime} = newChargingSession;
            // request.post('/evcharge/api')
            //         .send(withoutStartTime)
            //         .end(function(error,response) {
            //             response.status.should.be.equal(400);
            //             response.body.should.have.property('message').equal("notNull Violation: chargingSession.startTime cannot be null");
            //         });

            let {endTime, ...withoutEndTime} = newChargingSession;
            request.post('/evcharge/api')
                    .send(withoutEndTime)
                    .end(function(error,response) {
                        response.status.should.be.equal(400);
                        response.body.should.have.property('message').equal("notNull Violation: chargingSession.endTime cannot be null");
                        done();
                    });
        });

        it('Don\'t create a charging session if startTime is after endTime',(done) => {
            request.post('/evcharge/api')
                    .send({
                        totalCost: 25,
                        energyDelivered: 85,
                        pointsAwarded: 20,
                        startTime: "2021-02-03 21:14:08",
                        endTime: "2021-01-02 21:16:08",
                        paymentType: "Paypall",
                        electricVehicleId: 4,
                        chargingPointId: 4
                    })
                    .end(function(error,response) {
                        response.status.should.be.equal(400);
                        response.body.should.have.property('message').equal("Session end time should be after session start time!");
                        done();
                    });
        });

        it('Add a new charging session',(done) => {
            request.post('/evcharge/api')
                    .send(newChargingSession)
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.body.should.have.property('id');
                        response.body.should.have.property('totalCost').equal(20);
                        response.body.should.have.property('pointsAwarded').equal((Math.floor(20) * 0.1).toFixed(2));
                        response.body.should.have.property('startTime').equal("2021-01-01 21:14:08");
                        response.body.should.have.property('endTime').equal("2021-01-02 21:16:08");
                        response.body.should.have.property('paymentType').equal("Paypall");
                        response.body.should.have.property('electricVehicleId').equal(3);
                        response.body.should.have.property('chargingPointId').equal(3);
                        newSessionId = response.body.id;
                        done();
                    });
        });
    });

    describe('DELETE /sessions/:id', () => {

        it('Fails to delete a charging session if an invalid or not existent id is given',(done) => {
            request.delete('/evcharge/api/sessions/-2')
                    .end(function(error,response) {
                        response.status.should.be.equal(400);
                        response.body.should.have.property('message').equal('Cannot delete charging session with id=-2. Session not found!');
                    done();
            });
        });

        it('Delete a charging session by id',(done) => {
            request.delete('/evcharge/api/sessions/' + newSessionId)
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.body.should.have.property('message').equal('Charging session was deleted successfully!');
                        done();
                    });
        });
    });

    describe('GET /SessionsPerPoint/:pointID/:yyyymmdd_from/:yyyymmdd_to', () => {
        
        it('Don\'t return response if the user is not logged in',(done) => {
            request.get('/evcharge/api/SessionsPerPoint/9/20201101/20201130')
                    .set('x-observatory-auth',invalidUserToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(401);
                        response.body.should.have.property('message').equal('Please login to continue');
                        done();
                    });
        });

        it('Don\'t return response if token is missing',(done) => {
            request.get('/evcharge/api/SessionsPerPoint/9/20201101/20201130')
                    .end(function(error,response) {
                        response.status.should.be.equal(401);
                        response.body.should.have.property('message').equal('Missing token!');
                        done();
                    });
        });

        it('Don\'t return response if startTime is after endTime',(done) => {
            request.get('/evcharge/api/SessionsPerPoint/9/2021201/20201030')
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(400);
                        response.body.should.have.property('message').equal('invalid dates');
                        done();
                    })
        });

        it("Don\'t return response if startTime or endTime is not in right format ('YYYYMMDD')",(done) => {
            request.get('/evcharge/api/SessionsPerPoint/9/2021201/20201030')
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(400);
                        response.body.should.have.property('message').equal('invalid dates');
                        request.get('/evcharge/api/SessionsPerPoint/9/20211001/255530')
                                .set('x-observatory-auth',userToken)
                                .end(function(error,response) {
                                    response.status.should.be.equal(400);
                                    response.body.should.have.property('message').equal('invalid dates');
                                    done();
                        })                        
                    })
        });

        it('Return suitable message if chargin point\'s id provided is invalid',(done) => {
            request.get('/evcharge/api/SessionsPerPoint/-2/20201001/20201030')
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(404);
                        response.body.should.have.property('message').equal('Charging point with id=-2 not found');
                        done();
                    })
        });

        it('Return suitable message if there are no charging sessions for this time period',(done) => {
            request.get('/evcharge/api/SessionsPerPoint/9/20221101/20221130')
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(402);
                        response.body.should.have.property('message').equal('No charging sessions for this time period');
                        done();
                    })
        });

        it('Retrieve the charging sessions for a specific point in default(application/json) format',(done) => {
            request.get('/evcharge/api/SessionsPerPoint/9/20201101/20201130')
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.headers['content-type'].should.equal('application/json; charset=utf-8');
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

        it('Retrieve the charging sessions for a specific point in application/json format',(done) => {
            request.get('/evcharge/api/SessionsPerPoint/9/20201101/20201130?format=json')
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.headers['content-type'].should.equal('application/json; charset=utf-8');
                        done();
                    })
        });

        it('Retrieve the charging sessions for a specific point in text/csv format',(done) => {
            request.get('/evcharge/api/SessionsPerPoint/9/20201101/20201130?format=csv')
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.headers['content-type'].should.equal('text/csv; charset=utf-8');
                        done();
                    })
        });
    });

    describe('GET /SessionsPerStation/:stationID/:yyyymmdd_from/:yyyymmdd_to', () => {
        
        it('Don\'t return response if the user is not logged in',(done) => {
            request.get('/evcharge/api/SessionsPerStation/9/20201101/20201130')
                    .set('x-observatory-auth',invalidUserToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(401);
                        response.body.should.have.property('message').equal('Please login to continue');
                        done();
                    });
        });

        it('Don\'t return response if token is missing',(done) => {
            request.get('/evcharge/api/SessionsPerStation/9/20201101/20201130')
                    .end(function(error,response) {
                        response.status.should.be.equal(401);
                        response.body.should.have.property('message').equal('Missing token!');
                        done();
                    });
        });

        it('Don\'t return response if startTime is after endTime',(done) => {
            request.get('/evcharge/api/SessionsPerStation/9/20201105/20201102')
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(400);
                        response.body.should.have.property('message').equal('invalid dates');
                        done();
                    })
        });

        it("Don\'t return response if startTime or endTime is not in right format ('YYYYMMDD')",(done) => {
            request.get('/evcharge/api/SessionsPerStation/9/20201/20201130')
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(400);
                        response.body.should.have.property('message').equal('invalid dates');
                        request.get('/evcharge/api/SessionsPerStation/9/20211001/2')
                                .set('x-observatory-auth',userToken)
                                .end(function(error,response) {
                                    response.status.should.be.equal(400);
                                    response.body.should.have.property('message').equal('invalid dates');
                                    done();
                        })                        
                    })
        });

        it('Return suitable message if chargin station\'s id provided is invalid',(done) => {
            request.get('/evcharge/api/SessionsPerStation/-2/20201101/20201130')
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(404);
                        response.body.should.have.property('message').equal('Station with id=-2 not found');
                        done();
                    })
        });

        it('Return suitable message if there are no charging sessions for this time period',(done) => {
            request.get('/evcharge/api/SessionsPerStation/9/20221101/20221130')
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(402);
                        response.body.should.have.property('message').equal('No charging sessions for this time period');
                        done();
                    })
        });

        it('Retrieve the charging sessions for a specific station in default(application/json) format',(done) => {
            request.get("/evcharge/api/SessionsPerStation/9/20201101/20201130")
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.headers['content-type'].should.equal('application/json; charset=utf-8');
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

        it('Retrieve the charging sessions for a specific station in application/json format',(done) => {
            request.get('/evcharge/api/SessionsPerStation/9/20201101/20201130?format=json')
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.headers['content-type'].should.equal('application/json; charset=utf-8');
                        done();
                    })
        });

        it('Retrieve the charging sessions for a specific station in text/csv format',(done) => {
            request.get('/evcharge/api/SessionsPerStation/9/20201101/20201130?format=csv')
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.headers['content-type'].should.equal('text/csv; charset=utf-8');
                        done();
                    })
        });
    });

    describe('GET /SessionsPerEV/:vehicleID/:yyyymmdd_from/:yyyymmdd_to', () => {

        it('Don\'t return response if the user is not logged in',(done) => {
            request.get('/evcharge/api/SessionsPerEV/7/20200201/20200229')
                    .set('x-observatory-auth',invalidUserToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(401);
                        response.body.should.have.property('message').equal('Please login to continue');
                        done();
                    });
        });

        it('Don\'t return response if token is missing',(done) => {
            request.get('/evcharge/api/SessionsPerEV/7/20200201/20200229')
                    .end(function(error,response) {
                        response.status.should.be.equal(401);
                        response.body.should.have.property('message').equal('Missing token!');
                        done();
                    });
        });

        it('Don\'t return response if startTime is after endTime',(done) => {
            request.get('/evcharge/api/SessionsPerEV/7/20200328/20200327')
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(400);
                        response.body.should.have.property('message').equal('invalid dates');
                        done();
                    })
        });

        it("Don\'t return response if startTime or endTime is invalid or not in right format ('YYYYMMDD')",(done) => {
            request.get('/evcharge/api/SessionsPerEV/7/20200201/sdfg')
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(400);
                        response.body.should.have.property('message').equal('invalid dates');
                        request.get('/evcharge/api/SessionsPerEV/7/202f001/20055530')
                                .set('x-observatory-auth',userToken)
                                .end(function(error,response) {
                                    response.status.should.be.equal(400);
                                    response.body.should.have.property('message').equal('invalid dates');
                                    done();
                        })                        
                    })
        });

        it('Return suitable message if chargin electric vehicle\'s id provided is invalid',(done) => {
            request.get('/evcharge/api/SessionsPerEV/-2/20200201/20200229')
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(404);
                        response.body.should.have.property('message').equal('EV with id=-2 not found');
                        done();
                    })
        });

        it('Return suitable message if there are no charging sessions for this time period',(done) => {
            request.get('/evcharge/api/SessionsPerEV/7/20221101/20221130')
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(402);
                        response.body.should.have.property('message').equal('No charging sessions for this time period');
                        done();
                    })
        });
        
        it('Retrieve the charging sessions for a specific electric vehicle in default(application/json) format',(done) => {
            request.get("/evcharge/api/SessionsPerEV/7/20200201/20200229")
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.headers['content-type'].should.equal('application/json; charset=utf-8');
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

        it('Retrieve the charging sessions for a specific electric vehicle in application/json format',(done) => {
            request.get('/evcharge/api/SessionsPerEV/7/20200201/20200229?format=json')
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.headers['content-type'].should.equal('application/json; charset=utf-8');
                        done();
                    })
        });

        it('Retrieve the charging sessions for a specific electric vehicle in text/csv format',(done) => {
            request.get('/evcharge/api/SessionsPerEV/7/20200201/20200229?format=csv')
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.headers['content-type'].should.equal('text/csv; charset=utf-8');
                        done();
                    })
        });
    });

    describe('GET /SessionsPerProvider/:providerID/:yyyymmdd_from/:yyyymmdd_to', () => {
        
        it('Don\'t return response if the user is not logged in',(done) => {
            request.get('/evcharge/api/SessionsPerProvider/1/20201101/20201130')
                    .set('x-observatory-auth',invalidUserToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(401);
                        response.body.should.have.property('message').equal('Please login to continue');
                        done();
                    });
        });

        it('Don\'t return response if token is missing',(done) => {
            request.get('/evcharge/api/SessionsPerProvider/1/20201101/20201130')
                    .end(function(error,response) {
                        response.status.should.be.equal(401);
                        response.body.should.have.property('message').equal('Missing token!');
                        done();
                    });
        });

        it('Don\'t return response if startTime is after endTime',(done) => {
            request.get('/evcharge/api/SessionsPerProvider/1/20220205/20211030')
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(400);
                        response.body.should.have.property('message').equal('invalid dates');
                        done();
                    })
        });

        it("Don\'t return response if startTime or endTime is not in right format ('YYYYMMDD')",(done) => {
            request.get('/evcharge/api/SessionsPerProvider/1/00/20201030')
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(400);
                        response.body.should.have.property('message').equal('invalid dates');
                        request.get('/evcharge/api/SessionsPerProvider/1/20211001/abcdefgh')
                                .set('x-observatory-auth',userToken)
                                .end(function(error,response) {
                                    response.status.should.be.equal(400);
                                    response.body.should.have.property('message').equal('invalid dates');
                                    done();
                        })                        
                    })
        });

        it('Return suitable message if chargin provider\'s id provided is invalid',(done) => {
            request.get('/evcharge/api/SessionsPerProvider/-2/20221101/20221130')
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(404);
                        response.body.should.have.property('message').equal('Provider with id=-2 not found');
                        done();
                    })
        });

        it('Return suitable message if there are no charging sessions for this time period',(done) => {
            request.get('/evcharge/api/SessionsPerProvider/1/20221101/20221130')
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(402);
                        response.body.should.have.property('message').equal('No charging sessions for this time period');
                        done();
                    })
        });

        it('Retrieve the charging sessions for a specific provider in default(application/json) format',(done) => {
            request.get("/evcharge/api/SessionsPerProvider/1/20201101/20201130")
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.headers['content-type'].should.equal('application/json; charset=utf-8');
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

        it('Retrieve the charging sessions for a specific provider in application/json format',(done) => {
            request.get('/evcharge/api/SessionsPerProvider/1/20201101/20201130?format=json')
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.headers['content-type'].should.equal('application/json; charset=utf-8');
                        done();
                    })
        });

        it('Retrieve the charging sessions for a specific provider in text/csv format',(done) => {
            request.get('/evcharge/api/SessionsPerProvider/1/20201101/20201130?format=csv')
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.headers['content-type'].should.equal('text/csv; charset=utf-8');
                        done();
                    })
        });
    });

    describe('GET /SessionsPerUser/:userId', () => {

        it('Don\'t return response if the user is not logged in',(done) => {
            request.get('/evcharge/api/SessionsPerUser/1')
                    .set('x-observatory-auth',invalidUserToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(401);
                        response.body.should.have.property('message').equal('Please login to continue');
                        done();
                    });
        });

        it('Don\'t return response if token is missing',(done) => {
            request.get('/evcharge/api/SessionsPerUser/1')
                    .end(function(error,response) {
                        response.status.should.be.equal(401);
                        response.body.should.have.property('message').equal('Missing token!');
                        done();
                    });
        });

        it('Retrieve the charging sessions for a specific user',(done) => {
            request.get("/evcharge/api/SessionsPerUser/5")
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        res = response.body[0];
                        res.should.have.property("userId").equal(5);
                        res.should.have.property("station").be.an('object');
                        res.should.have.property("charger").be.an('object');
                        res.should.have.property("sessionId");
                        res.should.have.property("electricVehicle").be.an('object');
                        res.should.have.property("startTime");
                        res.should.have.property("endTime");
                        res.should.have.property("energyDelivered");
                        res.should.have.property("points");
                        res.should.have.property("costPerKwh");
                        res.should.have.property("totalCost");
                        done();
                    })
        });

        it('Retrieve the charging sessions for a specific user for a time period (using query parameters)',(done) => {

            request.get("/evcharge/api/SessionsPerUser/1?datetimeFrom=20201201&datetimeTo=20201230")
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        res = response.body[0];
                        res.should.have.property("userId").equal(1);
                        res.should.have.property("station").be.an('object');
                        res.should.have.property("charger").be.an('object');
                        res.should.have.property("sessionId");
                        res.should.have.property("electricVehicle").be.an('object');
                        res.should.have.property("startTime");
                        res.should.have.property("endTime");
                        res.should.have.property("energyDelivered");
                        res.should.have.property("points");
                        res.should.have.property("costPerKwh");
                        res.should.have.property("totalCost");
                        done();
                    })
        });

        it('Return an empty array if user has no charging sessions for this time period',(done) => {

            request.get("/evcharge/api/SessionsPerUser/1?datetimeFrom=20200301&datetimeTo=20200330")
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.body.should.be.an('array');
                        response.body.length.should.be.equal(0);
                        done();
                    })
        });
    });

    describe('GET /SessionsPerMultipleStations', () => {

        it('Don\'t return response if the user is not logged in',(done) => {
            request.get('/evcharge/api/SessionsPerMultipleStations')
                    .set('x-observatory-auth',invalidUserToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(401);
                        response.body.should.have.property('message').equal('Please login to continue');
                        done();
                    });
        });

        it('Don\'t return response if token is missing',(done) => {
            request.get('/evcharge/api/SessionsPerMultipleStations')
                    .end(function(error,response) {
                        response.status.should.be.equal(401);
                        response.body.should.have.property('message').equal('Missing token!');
                        done();
                    });
        });

        it('Don\'t return response if stationId parameter is missing',(done) => {
            request.get("/evcharge/api/SessionsPerMultipleStations")
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(400);
                        response.body.should.have.property("message").equal("Give one or more station ids");
                        done();
                    })
        });

        it('Return an empty array if station id is not valid',(done) => {
            request.get("/evcharge/api/SessionsPerMultipleStations?stationId=-1")
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.body.should.be.an('array');
                        response.body.length.should.be.equal(0);
                        done();
                    })
        });

        it('Retrieve the charging sessions for multiple stations (using query parameters)',(done) => {
            request.get("/evcharge/api/SessionsPerMultipleStations?stationId=1,2")
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        res = response.body[0];
                        res.station.should.have.property("id").oneOf([1, 2]);
                        res.should.have.property("station").be.an('object');
                        res.should.have.property("electricVehicle").be.an('object');
                        res.should.have.property("startTime");
                        res.should.have.property("electricVehicleId");
                        res.should.have.property("chargingPointId");
                        res.should.have.property("chargingPoint").be.an('object');
                        res.should.have.property("endTime");
                        res.should.have.property("energyDelivered");
                        res.should.have.property("pointsAwarded");
                        res.should.have.property("paymentType");
                        res.should.have.property("costPerKwh");
                        res.should.have.property("totalCost");
                        done();
                    })
        });
    });
})