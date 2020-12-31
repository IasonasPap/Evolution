const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

var corsOptions = {
	origin: "http://localhost:8765"
};

app.use(cors(corsOptions));

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

require('./routes/user.routes.js')(app);

// set port, listen for requests
const PORT = 8765;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
});
