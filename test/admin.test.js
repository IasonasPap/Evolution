const app = require('../backend/server'); // Link to your server file
const supertest = require('supertest');
const request = supertest(app);
const chai = require('chai');
const bcrypt = require('bcrypt');
const { response } = require('express');
const { should } = require('chai');

chai.should();
process.env.NODE_ENV ='test';

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