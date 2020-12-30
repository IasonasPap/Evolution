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


// set port, listen for requests
const PORT = 8765;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
});
