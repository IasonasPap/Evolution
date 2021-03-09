process.env.NODE_ENV ='test';

const app = require('../backend/server'); // Link to your server file
const supertest = require('supertest');
const request = supertest(app);
const chai = require('chai');
const fs = require("fs");

let path = __basedir + "/chargingSessions.csv";
// const bcrypt = require('bcrypt');
// const { response } = require('express');
// const { should } = require('chai');

chai.should();

describe('Adminstrators\' endpoints', () => {

    const newUser = {
        username: "user0",
        password: "11223344556677",
        email: "user0@mail.gr"
    };

    let newUserPassword,newUserId,newUserToken,adminToken;

    before((done) => {
        request.post('/evcharge/api/users')
                .send(newUser)
                .end(function(error,response) {
                    if(response.status == 200) {
                        newUserPassword = response.body.password;
                        newUserId = response.body.id;
                    }
                    request.post('/evcharge/api/login')
                            .set('Content-Type','application/x-www-form-urlencoded')
                            .send('username=user0')
                            .send('password=11223344556677')
                            .end(function(error,response) {
                                response.status.should.be.equal(200);
                                newUserToken = response.body.token;
                                request.post('/evcharge/api/login')
                                        .set('Content-Type','application/x-www-form-urlencoded')
                                        .send('username=admin')
                                        .send('password=petrol4ever')
                                        .end(function(error,response) {
                                            adminToken = response.body.token;
                                            done();
                                        });
                            });
                });
        
    });

    after((done) => {
        request.delete('/evcharge/api/users/' + newUserId)
                .end(function(error,response) {
                        newUserId--;
                        request.delete('/evcharge/api/users/' + newUserId)
                            .end(function (erro,resp) {
                                done();
                        });
            });
        
    });
    
    describe('GET /admin/users/:username',() => {
        
        it('Don\'t return a user with an invalid username',(done) => {
            request.get('/evcharge/api/admin/users/invalidUsername')
                    .set('x-observatory-auth',adminToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(400);
                        response.body.should.have.property('message').equal('No user found with name "invalidUsername"');
                        done();
                    });
        });

        it('Don\'t return a user if the request wasn\'t made by an administrator',(done) => {
            request.get('/evcharge/api/admin/users/invalidUsername')
                    .set('x-observatory-auth',newUserToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(401);
                        response.body.should.have.property('message').equal('This user is not an admin!');
                        done();
                    });
        });

        it('Get a user by username',(done) => {
            request.get('/evcharge/api/admin/users/' + newUser.username)
                    .set('x-observatory-auth',adminToken)
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

        it('Don\'t make any changes if the request wasn\'t made by an administrator',(done) => {
            request.post('/evcharge/api/admin/usermod/invalidUsername/invalidPassword')
                    .set('x-observatory-auth',newUserToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(401);
                        response.body.should.have.property('message').equal('This user is not an admin!');
                        done();
                    });
        });

        it('If user with username exists update his password',(done) => {
            request.post(`/evcharge/api/admin/usermod/${newUser.username}/1234567890000`)
                    .set('x-observatory-auth',adminToken)
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
                    .set('x-observatory-auth',adminToken)
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
        
        it('Don\'t update file if the request wasn\'t made by an administrator',(done) => {
            request.get('/evcharge/api/admin/users/invalidUsername')
                    .set('x-observatory-auth',newUserToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(401);
                        response.body.should.have.property('message').equal('This user is not an admin!');
                        done();
                    });
        });

        it('Ask for a csv to be uploaded if it hasn\'t', (done) => {
            request.post('/evcharge/api/admin/system/sessionsupd')
                    .set('x-observatory-auth',adminToken)
                    .end(function(error,response) {
                        response.status.should.be.equal(400);
                        response.text.should.be.equal('Please upload a CSV file!');
                        done();
                    });
        });
        
        it('Upload a csv file with two invalid Charging Sessions', (done) => {
            request.post('/evcharge/api/admin/system/sessionsupd')
                    .set('x-observatory-auth',adminToken)
                    .attach('file','test/withInvalidChargingSessions.csv')
                    .end(function(error,response) {
                        response.status.should.be.equal(200);                        
                        response.body.should.have.property("sessionsImported").equal(3);
                        response.body.should.have.property("sessionsInUploadedFile").equal(5);
                        response.body.should.have.property("totalSessionsInDatabase").equal(numberOfSessions+3);
                        done();                      
                    });
        });

        it('Upload a csv file with only valid Charging Sessions', (done) => {
            request.post('/evcharge/api/admin/system/sessionsupd')
                    .set('x-observatory-auth',adminToken)
                    .attach('file','test/uploadChargingSessions.csv')
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.body.should.have.property("sessionsImported").equal(2);
                        response.body.should.have.property("sessionsInUploadedFile").equal(2);
                        response.body.should.have.property("totalSessionsInDatabase").equal(numberOfSessions+5);
                        done();                     
                    });
        });
    });

    describe('POST /admin/resetsessions', () => {

        before(function (done) {
            request.get('/evcharge/api/sessions?format=csv')
                    .then(function(re) {
                    re.status.should.be.equal(200);
                    re.body.should.have.property('message').equal('File bezkoder_chargingSessions.csv created successfully');
                    done();
                                          
                });
        });

        after(function (done) {
            request.post('/evcharge/api/admin/system/sessionsupd')
                        .set('x-observatory-auth',adminToken)
                        .attach('file','chargingSessions.csv')
                        .then(function(respo){
                            respo.status.should.be.equal(200);
                            fs.unlink(path, (err) => {
                                if (err) console.log('something went wrong');
                                else console.log("Succesfully deleted chargingSessions.csv");
                                done();                                
                            })                            
                        });
        });

        it('Reset all charging sessions and Initialize administrator user',(done) => {
            request.post('/evcharge/api/admin/resetsessions')
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        response.body.should.have.property("status").equal("OK");
                        request.get('/evcharge/api/sessions')
                                .end(function(err,res) {
                                res.status.should.be.equal(404);
                                res.body.should.have.property('message').equal('There are no charging sessions'); 
                            
                            request.get('/evcharge/api/admin/users/admin')
                                    .set('x-observatory-auth',adminToken)
                                    .end(function (er,resp) {
                                        resp.status.should.be.equal(200);
                                        resp.body.should.have.property('id');
                                        resp.body.should.have.property('username').equal("admin");
                                        //bcrypt.compare(req.body.password, data.password)
                                        //const hash = bcrypt.hashSync(value, 10);
                                        //this.setDataValue('password', hash);
                                        //res.body.should.not.have.property('password');
                                        //bcrypt.compare('petrol4ever', res.body.password).should.be.equal(true);
                                        resp.body.should.have.property('fullName').equal("test");
                                        resp.body.should.have.property('email').equal("test@evolution.com");
                                        resp.body.should.have.property('isAdmin').equal(true);
                                        resp.body.should.have.property('isStationManager').equal(false);
                                        done();                  
                                    });
                            });
                    });
            });
            
        });
    });