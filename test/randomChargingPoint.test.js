process.env.NODE_ENV ='test';

const app = require('../backend/server'); // Link to your server file
const supertest = require('supertest');
const request = supertest(app);
const chai = require('chai');

chai.should();

describe('GET /useCaseOne/randomChargingPoint',() => {

    let userToken;
    const invalidUserToken= "t678igui767678ogyg7u656";

    before((done) => {
        request.post('/evcharge/api/login')
                .set('Content-Type','application/x-www-form-urlencoded')
                .send('username=admin')
                .send('password=petrol4ever')
                .end(function(error,response) {
                    userToken = response.body.token;
                    done();
                });        
    });

    it('Don\'t return response if the user is not logged in',(done) => {
        request.get('/evcharge/api/useCaseOne/randomChargingPoint')
                .set('x-observatory-auth',invalidUserToken)
                .end(function(error,response) {
                    response.status.should.be.equal(401);
                    response.body.should.have.property('message').equal('Please login to continue');
                    done();
                });
    });

    it('Don\'t return response if token is missing',(done) => {
        request.get('/evcharge/api/useCaseOne/randomChargingPoint')
                .end(function(error,response) {
                    response.status.should.be.equal(401);
                    response.body.should.have.property('message').equal('Missing token!');
                    done();
                });
    });

    it('Don\'t return response if charger id is missing',(done) => {
        request.get('/evcharge/api/useCaseOne/randomChargingPoint')
                .set('x-observatory-auth',userToken)
                .end(function(error,response) {
                    response.status.should.be.equal(400);
                    response.body.should.have.property('message').equal('No vehicleChargerId was provided!');
                    done();
                });
    });

    it('Return a charging point for a specific charger id',(done) => {
        request.get('/evcharge/api/useCaseOne/randomChargingPoint?vehicleChargerId=5')
                .set('x-observatory-auth',userToken)
                .end(function(error,response) {
                    response.status.should.be.equal(200);
                    response.body.should.have.property('id');
                    response.body.should.have.property('isOccupied').be.false;
                    response.body.should.have.property('chargerId').equal(5);
                    response.body.should.have.property('stationId');
                    response.body.should.have.property('charger').be.a('object');
                    response.body.should.have.property('station').be.a('object');
                    done();
                });
    });
})