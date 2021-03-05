const app = require('../backend/server'); // Link to your server file
const supertest = require('supertest');
const request = supertest(app);
const chai = require('chai');
const bcrypt = require('bcrypt');
const { response } = require('express');
const { should } = require('chai');


chai.should();
process.env.NODE_ENV ='test';

describe('GIA NA DOUME AN GINONTAI OLA', ()=> {
    it('ppppapapaps', (done) => {
        const x = 4 ;
        console.log("!!!!!!!!!!!!!!");
        x.should.be.equal(4);
        done();
    })
    
});