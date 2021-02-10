const app = require('../backend/server'); // Link to your server file
const supertest = require('supertest');
const request = supertest(app);
const chai = require('chai');
const bcrypt = require('bcrypt');

//const mocha = require('mocha');
//const chaiHttp = require("chai-http");
//const assert = chai.assert;
//const request = supert('http://localhost:8765');
//chai.use(chaiHttp);
chai.should();
process.env.NODE_ENV ='test';

setTimeout(function() {
    run()
  }, 8000);


describe('Users\' endpoints', () => {
 
    let newUserId,numberOfUsers;

    before((done) => {
        request.get('/evcharge/api/users')
                .then ((response) => {
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
                    .then(function(response) {
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
                    .then(function(response) {
                        //console.log(response);
                        response.status.should.be.equal(400);
                        response.body.should.have.property('message').equal("You should provide a <username> and <password> for the new user!");
                        done();
                    });
        });

        it('Create a new user', function(done) {
            request.post('/evcharge/api/users')
                    .send(newUser)
                    .then(function(response) {
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
                    .then(function(response) {
                        response.status.should.be.equal(400);
                        response.body.should.have.property('message').equal("Cannot update User with id=-2. User not found!");
                        done();
                    });
        });
        it('Update a user', (done) => {
            request.put('/evcharge/api/users/' + newUserId)
                    .send(updatedUser)
                    .then(function(response) {
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
                    .then(function(response) {
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
                    .then(function(response) {
                        response.status.should.be.equal(400);
                        response.body.should.have.property('message').equal("Not Found User with id=-2");
                        done();
                    });
        });

        it('Get a user by id', function(done) {
            request.get('/evcharge/api/users/' + newUserId)
                    .then(function(response) {
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
                    .then(function (response) {
                        response.status.should.be.equal(200);
                        done();
            });
        });
    });

    describe('DELETE /users/:id', () => {

        it('Fail to delete a user if an invalid id is givven',(done) => {
                request.delete('/evcharge/api/users/-2')
                        .then(function (response) {
                            response.body.should.have.property('message').equal('Cannot delete User with id=-2. User not found!');
                        done();
                });
        });

        it('Delete a user', (done) => {
            request.delete('/evcharge/api/users/' + newUserId)
                    .then(function (response) {
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
                    .then((response) => {
                        if(response.status == 200) {
                            newUserPassword = response.body.password;
                            newUserId = response.body.id;
                            done();
                        }
                    });
    });
    after((done) => {
        request.delete('/evcharge/api/users/' + newUserId)
                    .then(function (response) {
                            done();
            });
    });
    
    describe('GET /admin/users/:username',() => {
        it('Don\'t return a user with an invalid username',(done) => {
            request.get('/evcharge/api/admin/users/invalidUsername')
                    .then((response) => {
                        response.status.should.be.equal(400);
                        response.body.should.have.property('message').equal('No user found with name "invalidUsername"');
                        done();
                    });
        });

        it('Get a user by username',(done) => {
            request.get('/evcharge/api/admin/users/' + newUser.username)
                    .then((response) => {
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
                    .then((response) => {                     
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
                    .then((response) => {
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
                    .then((response) => {
                        response.status.should.be.equal(200);
                        response.body.should.have.property("status").equal("OK");
                        done();
                    });
        });
    });

    describe.skip('POST /admin/resetsessions',() => {
        it('Reset all charging sessions and Initialize administrator user',(done) => {
            request.post('/evcharge/api/admin/resetsessions')
                    .then((response) => {
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
                                .then((res) => {
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
                .then((response) => {
                    response.status.should.be.equal(400);
                    response.body.should.have.property('message').equal("You should provide a <username> and <password> to log in!");
                    done();
                });
        });

        it('Fails to log in if password is missing',(done) => {
            request.post('/evcharge/api/login')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send("username=admin")
                .then((response) => {
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
                .then((response) => {
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
                .then((response) => {
                    response.status.should.be.equal(401);
                    response.body.should.have.property('message').equal("Invalid username or password");
                    done();
                });
        });

        it('Succefully log in a user',(done) => {
            request.post('/evcharge/api/login')
            //.set('Content-Type', 'application/x-www-form-urlencoded')
                .set('Content-Type','application/x-www-form-urlencoded')
                .send('username=admin')
                .send('password=petrol4ever')
                .then((response) => {
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
            
        });
    });
});

describe.skip('Charging Sessions endpoints', () => {
    describe('GET ', () => {
        it('',() => {

        });
    });

    describe('GET ', () => {
        it('',() => {
            
        });
    });

    describe('GET ', () => {
        it('',() => {
            
        });
    });

    describe('GET ', () => {
        it('',() => {
            
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
response.should.have.status(404);
response.text.should.be.eq(to mhnuma pou gurnaei an uparxei);
response.should.have.status(201);

*/