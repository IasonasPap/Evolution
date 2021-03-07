process.env.NODE_ENV = 'test';

const app = require('../backend/server'); // Link to your server file
const supertest = require('supertest');
const request = supertest(app);
const chai = require('chai');
const bcrypt = require('bcrypt');
const { response } = require('express');

//const mocha = require('mocha');
chai.should();

setTimeout(function() {
    run()
  }, 7000);

describe('Users\' endpoints', () => {
 
    let newUserId,numberOfUsers;

    //get the number of users that initially exist in database
    before((done) => {
        request.get('/evcharge/api/users')
                .end(function(error,response) {
                    numberOfUsers = response.body.length;
                    done();
                });
    });
    
    //if we skip the test for deleting all users
    after((done) => {
        request.get('/evcharge/api/users')
                .end(function(error,response) {
                    response.body.length.should.be.equal(numberOfUsers);
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
                        //save user's id to delete it after executing necessary tests
                        newUserId = response.body.id;
                        done();
                    });
            
        });
    
        it('Don\'t create a user if username is not available',function(done) {
            request.post('/evcharge/api/users')
                    .send({
                        username:"user0",
                        password:'mypassword',
                        isAdmin: true
                    })
                    .end(function(error,response) {
                        response.status.should.be.equal(500);
                        response.body.should.have.property('message').equal("Duplicate entry 'user0' for key 'UNIQUE'");
                        done();
                    });
        });

        it('Don\'t create a user if invalid data where provided (email,isAdmin,isStationManager)',function(done) {
            
            request.post('/evcharge/api/users')
                    .send({
                        username:"userfortest",
                        password:'mypassword',
                        email:890789
                    })
                    .end(function(error,response) {
                        response.status.should.be.equal(500);
                        response.body.should.have.property('message').equal("Out of range value for column 'email' at row 1");
                    });
            request.post('/evcharge/api/users')
                    .send({
                        username:"userfortest",
                        password:'mypassword',
                        isAdmin:76567567898
                    })
                    .end(function(error,response) {
                        response.status.should.be.equal(500);
                        response.body.should.have.property('message').equal("Out of range value for column 'isAdmin' at row 1");
                    });
            request.post('/evcharge/api/users')
                    .send({
                        username:"userfortest",
                        password:'mypassword',
                        isStationManager:"76567567898"
                    })
                    .end(function(error,response) {
                        response.status.should.be.equal(500);
                        response.body.should.have.property('message').equal("Out of range value for column 'isStationManager' at row 1");
                        done();
                    });
        });
    });

    describe('PUT /users/:id', () => {
        let userForUpdateId;

        before((done) => {
            request.post('/evcharge/api/users')
                    .send({
                        username: 'testuser',
                        password: "randompsw"
                    })
                    .end(function(error,response) {
                        userForUpdateId = response.body.id;
                        done();
                    });
        });
        
        after((done) => {
            request.delete('/evcharge/api/users/' + userForUpdateId)
                    .end(function(error,response) {
                        done();
                    });
        });
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

        it('Doesn\'t make an update if the new username is not available', (done) => {
            request.put('/evcharge/api/users/' + userForUpdateId)
                    .send({
                        username: "user0",
                        email: "user01@mail.gr",
                        fullName: "user0-user1"
                    })
                    .end(function(error,response) {
                        response.status.should.be.equal(500);
                        response.body.should.have.property('message').equal("Duplicate entry 'user0' for key 'UNIQUE'");
                        done();
                    });
        });

        it('Don\'t make an update if invalid data where provided (email,isAdmin,isStationManager)',function(done) {

            
            request.put('/evcharge/api/users/' + userForUpdateId)
                    .send({
                        username:"userfortest",
                        password:'mypassword',
                        email:890789
                    })
                    .end(function(error,response) {
                        response.status.should.be.equal(500);
                        response.body.should.have.property('message').equal("Out of range value for column 'email' at row 1");
                    });
            request.put('/evcharge/api/users/' + userForUpdateId)
                    .send({
                        username:"userfortest",
                        password:'mypassword',
                        isAdmin:76567567898
                    })
                    .end(function(error,response) {
                        response.status.should.be.equal(500);
                        response.body.should.have.property('message').equal("Out of range value for column 'isAdmin' at row 1");
                    });
            request.put('/evcharge/api/users/' + userForUpdateId)
                    .send({
                        username:"userfortest",
                        password:'mypassword',
                        isStationManager:"76567567898"
                    })
                    .end(function(error,response) {
                        response.status.should.be.equal(500);
                        response.body.should.have.property('message').equal("Out of range value for column 'isStationManager' at row 1");
                        done();
                    });
        })

        it('Update a user', (done) => {
            request.put('/evcharge/api/users/' + newUserId)
                    .send(updatedUser)
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.body.should.have.property('id').equal(newUserId);
                        response.body.should.have.property('username').equal('user01');
                        response.body.should.have.property('password');
                        response.body.should.have.property('fullName').equal('user0-user1');
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

        it('Don\'t get a user with not existent name',function(done) {
            request.get('/evcharge/api/users/notexistentusername')
                    .end(function(error,response) {
                        response.status.should.be.equal(400);
                        response.body.should.have.property('message').equal("Not Found User with name=notexistentusername");
                        done();
                    });
        });

        it('Get a user by id', function(done) {
            request.get('/evcharge/api/users/' + newUserId)
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.body.should.have.property('id').equal(newUserId);
                        response.body.should.have.property('username').equal('user01');
                        response.body.should.not.have.property('password');
                        response.body.should.have.property('fullName').equal("user0-user1");
                        response.body.should.have.property('email').equal("user01@mail.gr");
                        response.body.should.have.property('isAdmin').equal(true);
                        response.body.should.have.property('isStationManager').equal(true);
                        done();
                    });
            
        });

        it('Get a user by name', function(done) {
            request.get('/evcharge/api/users/user01')
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.body.should.have.property('id').equal(newUserId);
                        response.body.should.have.property('username').equal('user01');
                        response.body.should.not.have.property('password');
                        response.body.should.have.property('fullName').equal("user0-user1");
                        response.body.should.have.property('email').equal("user01@mail.gr");
                        response.body.should.have.property('isAdmin').equal(true);
                        response.body.should.have.property('isStationManager').equal(true);
                        done();
                    });
            
        });

    });

    describe('GET /users/:id/stations', () => {

        it('Return an empty list if a not existent or invalid id was provided',function(done) {
            request.get('/evcharge/api/users/-2/stations')
                    .end(function(error,response) {
                        response.status.should.be.equal(402);
                        response.body.should.be.a('array');
                        response.body.length.should.be.equal(0);
                        done();
                    });
        });

        it('Return an empty list if the user doesn\'t own any stations',function(done) {
            request.get('/evcharge/api/users/' + newUserId + '/stations')
                    .end(function(error,response) {
                        response.status.should.be.equal(402);
                        response.body.should.be.a('array');
                        response.body.length.should.be.equal(0);
                        done();
                    });
        });

        it('Get a user\'s stations by id', function(done) {
            request.get('/evcharge/api/users/700/stations')
                    .end(function(error,response) {
                        const res = response.body[0];
                        response.status.should.be.equal(200);
                        res.should.have.property('id');
                        res.should.have.property('address');
                        res.should.have.property('userId').equal(700);
                        res.should.have.property('energyProviderId');
                        res.should.have.property('chargingPoints').be.a("array");
                        res.chargingPoints[0].should.have.property('id');
                        res.chargingPoints[0].should.have.property('isOccupied');
                        res.chargingPoints[0].should.have.property('chargerId');
                        res.chargingPoints[0].should.have.property('stationId');
                        res.chargingPoints[0].should.have.property('charger');
                        done();
                    });
            
        });

    });

    describe('GET /users/:id/electricVehicles', () => {

        it('Return an empty list if a not existent or invalid id was provided',function(done) {
            request.get('/evcharge/api/users/-2/electricVehicles')
                    .end(function(error,response) {
                        response.status.should.be.equal(402);
                        response.body.should.be.a('array');
                        response.body.length.should.be.equal(0);
                        done();
                    });
        });

        it('Return an empty list if the user doesn\'t own any stations',function(done) {
            request.get('/evcharge/api/users/' + newUserId + '/electricVehicles')
                    .end(function(error,response) {
                        response.status.should.be.equal(402);
                        response.body.should.be.a('array');
                        response.body.length.should.be.equal(0);
                        done();
                    });
        });

        it('Get a user\'s electric vehicles by id', function(done) {
            request.get('/evcharge/api/users/1/electricVehicles')
                    .end(function(error,response) {
                        const res = response.body[0];
                        response.status.should.be.equal(200);
                        response.body.should.be.a('array');
                        res.should.have.property('id');
                        res.should.have.property('licensePlate');
                        res.should.have.property('vehicleType');
                        res.should.have.property('userId');
                        res.should.have.property('chargerId');
                        done();
                    });
            
        });

    });

    describe('DELETE /users/:id', () => {

        it('Fail to delete a user if an invalid or not existent id is given',(done) => {
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
                        request.get('/evcharge/api/users/' + newUserId)
                                .end(function(error,response) {
                                    response.status.should.be.equal(400);
                                    response.body.should.have.property('message').equal("Not Found User with id=" + newUserId);
                                    done();
                                });
            });
        });
    });

    describe.skip('DELETE /users', () => {

        it.skip('Delete all users', (done) => {
            request.delete('/evcharge/api/users')
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        request.get('/evcharge/api/users/')
                                .end(function(error,response) {
                                    response.status.should.be.equal(402);
                                    //response.body.length.should.be.equal(0);
                                    done();
                                });
            });
        });

        it.skip('Return error with Status 402 if Table is empty', (done) => {
            request.delete('/evcharge/api/users')
                    .end(function(error,response) {
                        response.status.should.be.equal(402);
                        response.body.length.should.be.equal(0);
                        done();
                    });
        });

    });

});

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