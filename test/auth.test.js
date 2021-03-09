process.env.NODE_ENV ='test';

const app = require('../backend/server'); // Link to your server file
const supertest = require('supertest');
const request = supertest(app);
const chai = require('chai');

chai.should();

describe('Authorization endpoints', () => {
    let userToken;

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
                    response.body.should.have.property('message').equal("Invalid username or password!");
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
                    userToken = response.body.token;
                    done();
                });
        });
    });

    describe('POST /evcharge/api/logout', () => {
        
        it('Don\'t logout if a user is not logged in',(done) => {
            request.post('/evcharge/api/logout')
                    .set('x-observatory-auth','678tyghjg86gyug78')
                    .end(function(error,response) {
                        response.status.should.be.equal(401);
                        response.body.should.have.property('message').equal('Please login to continue');
                        done();
                    });
        });

        it('Don\'t logout if token is missing',(done) => {
            request.post('/evcharge/api/logout')
                    .end(function(error,response) {
                        response.status.should.be.equal(401);
                        response.body.should.have.property('message').equal('Missing token!');
                        done();
                    });
        });

        it('Logout a user',(done) => {
            request.post('/evcharge/api/logout')
                    .set('x-observatory-auth',userToken)
                    .end(function(error,response) {
                        response.body.should.be.empty;
                        response.status.should.be.equal(200);
                        done();
                    });
        });
    });
});