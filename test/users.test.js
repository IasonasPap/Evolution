process.env.NODE_ENV = 'test';

const app = require('../backend/server'); // Link to your server file
const supertest = require('supertest');
const request = supertest(app);
const chai = require('chai');
const bcrypt = require('bcrypt');
const { response } = require('express');

//const mocha = require('mocha');
//const chaiHttp = require("chai-http");
//const assert = chai.assert;
//const request = supert('http://localhost:8765');
//chai.use(chaiHttp);
chai.should();

setTimeout(function() {
    run()
  }, 7000);

describe('Users\' endpoints', () => {
 
    let newUserId,numberOfUsers;

    before((done) => {
        request.get('/evcharge/api/users')
                .end(function(error,response) {
                    numberOfUsers = response.body.length;
                    done();
                });
    });
    
    describe('POST /users', () => {
        const newUser = {
            username: "user0",
            password: "11223344556677",
            email: "user0@mail.gr"
        };

        it('Don\'t create a user when password is missing',function(done) {
            request.post('/evcharge/api/users')
                    .send({
                        username:'myusername'
                    })
                    .end(function(error,response) {
                        response.status.should.be.equal(400);
                        response.body.should.have.property('message').equal("You should provide a <username> and <password> for the new user!");
                        done();
                    });
        });

        it('Don\'t create a user username is missing',function(done) {
            request.post('/evcharge/api/users')
                    .send({
                        password:'mypassword'
                    })
                    .end(function(error,response) {
                        response.status.should.be.equal(400);
                        response.body.should.have.property('message').equal("You should provide a <username> and <password> for the new user!");
                        done();
                    });
        });

        it('Create a new user', function(done) {
            request.post('/evcharge/api/users')
                    .send(newUser)
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.body.should.have.property('id');
                        response.body.should.have.property('username').equal('user0');
                        response.body.should.have.property('password');
                        response.body.should.have.property('fullName').equal(null);
                        response.body.should.have.property('email').equal("user0@mail.gr");
                        response.body.should.have.property('isAdmin').equal(false);
                        response.body.should.have.property('isStationManager').equal(false);
                        newUserId = response.body.id;
                        done();
                    });
            
        });
    });

    describe('PUT /users/:id', () => {
        const updatedUser = {
            username: "user01",
            email: "user01@mail.gr",
            fullName: "user0-user1",
            isAdmin : true,
            isStationManager: true
        };

        it('Doesn\'t make an update if a user with given id doesn\'t exist', (done) => {
            request.put('/evcharge/api/users/-2')
                    .send(updatedUser)
                    .end(function(error,response) {
                        response.status.should.be.equal(400);
                        response.body.should.have.property('message').equal("Cannot update User with id=-2. User not found!");
                        done();
                    });
        });
        it('Update a user', (done) => {
            request.put('/evcharge/api/users/' + newUserId)
                    .send(updatedUser)
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.body.should.have.property('id').equal(newUserId);
                        response.body.should.have.property('username').equal('user01');
                        response.body.should.have.property('password');
                        response.body.should.have.property('fullName').equal('user0-user9');
                        response.body.should.have.property('email').equal("user01@mail.gr");
                        response.body.should.have.property('isAdmin').equal(true);
                        response.body.should.have.property('isStationManager').equal(true);
                        done();
                    });
        });
    });

    describe('GET /users', () => {

        it('Get all users', function(done) {
            request.get('/evcharge/api/users/')
                    .end(function(error,response) {
                        const res = response.body[0];
                        response.status.should.be.equal(200);
                        response.body.length.should.be.equal(numberOfUsers+1);
                        res.should.have.property('id');
                        res.should.have.property('username');
                        res.should.have.property('password');
                        res.should.have.property('fullName');
                        res.should.have.property('email');
                        res.should.have.property('isAdmin');
                        res.should.have.property('isStationManager');
                        done();
                    });
            
        });
    });

    describe('GET /users/:id', () => {

        it('Don\'t get a user with wrong id',function(done) {
            request.get('/evcharge/api/users/-2')
                    .end(function(error,response) {
                        response.status.should.be.equal(400);
                        response.body.should.have.property('message').equal("Not Found User with id=-2");
                        done();
                    });
        });

        it('Get a user by id', function(done) {
            request.get('/evcharge/api/users/' + newUserId)
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.body.should.have.property('id').equal(newUserId);
                        response.body.should.have.property('username').equal('user01');
                        response.body.should.have.property('password');
                        response.body.should.have.property('fullName').equal("user0-user1");
                        response.body.should.have.property('email').equal("user01@mail.gr");
                        response.body.should.have.property('isAdmin').equal(true);
                        response.body.should.have.property('isStationManager').equal(true);
                        done();
                    });
            
        });

    });


    describe.skip('DELETE /users', () => {

        it.skip('Delete all users', (done) => {
            request.delete('/evcharge/api/users')
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        done();
            });
        });
    });

    describe('DELETE /users/:id', () => {

        it('Fail to delete a user if an invalid id is givven',(done) => {
                request.delete('/evcharge/api/users/-2')
                        .end(function(error,response) {
                            response.body.should.have.property('message').equal('Cannot delete User with id=-2. User not found!');
                        done();
                });
        });

        it('Delete a user', (done) => {
            request.delete('/evcharge/api/users/' + newUserId)
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.body.should.have.property('message').equal('User was deleted successfully!');
                        done();
            });
        });
    });

});

describe('Adminstrators\' endpoints', () => {

    const newUser = {
        username: "user0",
        password: "11223344556677",
        email: "user0@mail.gr"
    };
    let newUserPassword,newUserId;
    before((done) => {
        request.post('/evcharge/api/users')
                    .send(newUser)
                    .end(function(error,response) {
                        if(response.status == 200) {
                            newUserPassword = response.body.password;
                            newUserId = response.body.id;
                            done();
                        }
                    });
    });
    after((done) => {
        request.delete('/evcharge/api/users/' + newUserId)
                .end(function(error,response) {
                        newUserId--;
                        request.delete('/evcharge/api/users/' + newUserId)
                        .then(function (response) {
                            done();
                });
            });
        
    });
    
    describe('GET /admin/users/:username',() => {
        
        it('Don\'t return a user with an invalid username',(done) => {
            request.get('/evcharge/api/admin/users/invalidUsername')
                    .end(function(error,response) {
                        response.status.should.be.equal(400);
                        response.body.should.have.property('message').equal('No user found with name "invalidUsername"');
                        done();
                    });
        });

        it('Get a user by username',(done) => {
            request.get('/evcharge/api/admin/users/' + newUser.username)
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.body.should.have.property('id').equal(newUserId);
                        response.body.should.have.property('username').equal(newUser.username);
                        response.body.should.have.property('password').equal(newUserPassword);
                        response.body.should.have.property('fullName').equal(null);
                        response.body.should.have.property('email').equal(newUser.email);
                        response.body.should.have.property('isAdmin').equal(false);
                        response.body.should.have.property('isStationManager').equal(false);
                        done();
                        
                    });
        });
    });

    describe('POST /admin/usermod/:username/:password',() => {

        it('If user with username exists update his password',(done) => {
            request.post(`/evcharge/api/admin/usermod/${newUser.username}/1234567890000`)
                    .send()
                    .end(function(error,response) {                     
                        response.status.should.be.equal(200);
                        response.body.should.have.property('id').equal(newUserId);
                        response.body.should.have.property('username').equal(newUser.username);
                        response.body.should.have.property('password').not.equal(newUserPassword);
                        response.body.should.have.property('fullName').equal(null);
                        response.body.should.have.property('email').equal(newUser.email);
                        response.body.should.have.property('isAdmin').equal(false);
                        response.body.should.have.property('isStationManager').equal(false);
                        done();
                    });
        });

        it('If user with username doesn\'t exist create new user',(done) => {
            request.post('/evcharge/api/admin/usermod/notExistentName/123456789')
                    .send()
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.body.should.have.property('id');
                        response.body.should.have.property('username').equal('notExistentName');
                        response.body.should.have.property('password');
                        response.body.should.have.property('fullName').equal(null);
                        response.body.should.have.property('email').equal(null);
                        response.body.should.have.property('isAdmin').equal(false);
                        response.body.should.have.property('isStationManager').equal(false);
                        newUserId = response.body.id;
                        done();
                    });
        });
    });

    describe('GET /admin/healthcheck',() => {
        it('Check connectivity with database',(done) => {
            request.get('/evcharge/api/admin/healthcheck')
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.body.should.have.property("status").equal("OK");
                        done();
                    });
        });
    });

    describe('POST /admin/system/sessionsupd', () => {

        let numberOfSessions;

        before((done) => {
            request.get('/evcharge/api/sessions')
                    .end(function(error,response) {
                        numberOfSessions = response.body.length;
                        done();
                    });
        });
        
        it('Ask for a csv to be uploaded if it hasn\'t', (done) => {
            request.post('/evcharge/api/admin/system/sessionsupd')
                    .end(function(error,response) {
                        response.status.should.be.equal(400);
                        response.text.should.be.equal('Please upload a CSV file!');
                        done();
                    });
        });
        
        it.skip('Upload a csv file with Charging Sessions', (done) => {
            request.post('/evcharge/api/admin/system/sessionsupd')
                    .attach('file','test/uploadChargingSessions.csv')
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        request.get('/evcharge/api/sessions')
                                .then((response) => {
                                    response.body.length.should.be.equal(numberOfSessions+2);
                                    done();
                                })                       
                    });
        });
    });

    describe.skip('POST /admin/resetsessions',() => {
        it('Reset all charging sessions and Initialize administrator user',(done) => {
            request.post('/evcharge/api/admin/resetsessions')
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.body.should.have.property("status").equal("OK");
                        request.get('/evcharge/api/admin/users/admin')
                                .then((res) => {
                                res.status.should.be.equal(200);
                                res.body.should.have.property('id');
                                res.body.should.have.property('username').equal("admin");
                                //bcrypt.compare(req.body.password, data.password)
                                //const hash = bcrypt.hashSync(value, 10);
                                //this.setDataValue('password', hash);
                                res.body.should.have.property('password');
                                bcrypt.compare('petrol4ever', res.body.password).should.be.equal(true);
                                res.body.should.have.property('fullName').equal("test");
                                res.body.should.have.property('email').equal("test@evolution.com");
                                res.body.should.have.property('isAdmin').equal(true);
                                res.body.should.have.property('isStationManager').equal(false);
                                done();                        
                        });

                        request.get('/evcharge/api/chargingSessions')
                                .end(function(error,res) {
                                res.status.should.be.equal(200);
                                res.body.length.should.be.equal(0);
                                done();                        
                        });
                    });
            
        });
    });

});

describe('Authorization endpoints', () => {
    describe('POST /evcharge/api/login', () => {
        it('Fails to log in if username is missing',(done) => {
            request.post('/evcharge/api/login')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send("password=petrol4ever")
                .end(function(error,response) {
                    response.status.should.be.equal(400);
                    response.body.should.have.property('message').equal("You should provide a <username> and <password> to log in!");
                    done();
                });
        });

        it('Fails to log in if password is missing',(done) => {
            request.post('/evcharge/api/login')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send("username=admin")
                .end(function(error,response) {
                    response.status.should.be.equal(400);
                    response.body.should.have.property('message').equal("You should provide a <username> and <password> to log in!");
                    done();
                });
        });

        it('Fails to log in if user doesn\'t exist',(done) => {
            request.post('/evcharge/api/login')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send("username=wrongusername")
                .send("password=petrol4ever")
                .end(function(error,response) {
                    response.status.should.be.equal(401);
                    response.body.should.have.property('message').equal("Invalid username or password!");
                    done();
                });
        });

        it('Fails to log in if password is incorrect',(done) => {
            request.post('/evcharge/api/login')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send("username=admin")
                .send("password=wrongpassword")
                .end(function(error,response) {
                    response.status.should.be.equal(401);
                    response.body.should.have.property('message').equal("Invalid username or password");
                    done();
                });
        });

        it('Succefully log in a user',(done) => {
            request.post('/evcharge/api/login')
                .set('Content-Type','application/x-www-form-urlencoded')
                .send('username=admin')
                .send('password=petrol4ever')
                .end(function(error,response) {
                    response.status.should.be.equal(200);
                    response.body.should.have.property("token");
                    done();
                });
        });
    });

    describe.skip('POST /evcharge/api/logout', () => {
        
        it('Don\'t logout if a user is not loged in',(done) => {
            
        });

        it('Logout a user',(done) => {
            //response.status(200)
        });
    });
});

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

/* 
describe.skip('POST /admin/resetsessions',() => {
    before((done) => {
        request.post('/evcharge/api/admin/resetsessions')
                    .then((response) => {
                        response.status.should.be.equal(200);
                        response.body.should.have.property("status").equal("OK");
                    }
    });
        it('Initialize administrator user',(done) => {
            
            request.get('/evcharge/api/admin/users/admin')
                    .then((res) => {
                    res.status.should.be.equal(200);
                    res.body.should.have.property('id');
                    res.body.should.have.property('username').equal("admin");
                        //bcrypt.compare(req.body.password, data.password)
                        //const hash = bcrypt.hashSync(value, 10);
                        //this.setDataValue('password', hash);
                    res.body.should.have.property('password');
                    bcrypt.compare('petrol4ever', res.body.password).should.be.equal(true);
                    res.body.should.have.property('fullName').equal("test");
                    res.body.should.have.property('email').equal("test@evolution.com");
                    res.body.should.have.property('isAdmin').equal(true);
                    res.body.should.have.property('isStationManager').equal(false);
                    done();                        
            });

            
        });
        it('Reset all charging sessions',(done) => {
            request.get('/evcharge/api/chargingSessions')
                        .then((res) => {
                        res.status.should.be.equal(200);
                        res.body.length.should.be.equal(0);
                        done();                        
                });
            });
            
        });
    });
*/

/*

response.body.should.be.a('object');

*/