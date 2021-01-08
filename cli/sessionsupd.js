const db = require("../backend/models");
const ChargingSession = db.chargingSession;
const fs = require("fs");
const csv = require("fast-csv");

module.exports = (filename) => {
  try {

    console.log('started')

    let sessions = [];
    let path = "./" + filename;

    fs.createReadStream(path)
      .pipe(csv.parse({ headers: true }))
      .on("error", (error) => {
        throw error.message;
      })
      .on("data", (row) => {
        sessions.push(row);
      })
      .on("end", () => {
        ChargingSession.bulkCreate(sessions)
          .then(() => {
            console.log({message: "Uploaded the file successfully: " + filename});
            process.exit()
          })
          .catch((err) => {
            console.error(err)
            console.log({error: "Fail to import data into database!"});
            process.exit()
          });
      });
  } catch (err) {
    console.error(err);
    console.log({error: "Could not upload the file: " + filaname});
    process.exit()
  }
};