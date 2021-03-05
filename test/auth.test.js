const app = require('../backend/server'); // Link to your server file
const supertest = require('supertest');
const request = supertest(app);
const chai = require('chai');
const bcrypt = require('bcrypt');
const { response } = require('express');
const { should } = require('chai');

chai.should();
process.env.NODE_ENV ='test';

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
            request.post('/evcharge/api/logout')
                    .end(function(error,response) {
                        response.status.should.be.equal(200);
                        done();
                    });
        });
    });
});