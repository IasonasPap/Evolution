const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const https = require('https');
const http = require('http');
const fs = require('fs');

const app = express();

app.use(cors());

// to support JSON-encoded bodies
app.use(bodyParser.json());

// to support URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./models");
db.sequelize.sync()
    .then(() => {
        console.log("Models synchronized with DB!");
    }).catch(err => {
        console.error(err);
    });

const routes = require('./routes/index.routes');
app.use('/evcharge/api',routes);

const options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt')
};

// set port, listen for requests
const PORT = 8765;
// app.listen(PORT, () => {
// 	console.log(`Server is running on port ${PORT}.`);
// });

// Create an HTTP service.
http.createServer(app).listen(8766);
// Create an HTTPS service identical to the HTTP service.
https.createServer(options, app)
    .listen(8765, function () {
        console.log('App listening on port 8765! Go to https://localhost:8765/')
    })
