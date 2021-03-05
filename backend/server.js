const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require('dotenv');
dotenv.config();
const routes = require('./routes/index.routes');
const app = express();

global.__basedir = __dirname + '/..';

const corsOptions = {
	origin: "http://localhost:8765"
};

app.use(cors(corsOptions));

// to support JSON-encoded bodies
app.use(bodyParser.json());

// to support URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/evcharge/api',routes);

const db = require("./models");
db.sequelize.sync()
    .then(() => {
        console.log("Models synchronized with DB!");
    }).catch(err => {
        console.error(err);
    });

// set port, listen for requests
const PORT = 8765;

if (process.env.NODE_ENV != 'test'){
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}.`);
    });
}

module.exports = app;