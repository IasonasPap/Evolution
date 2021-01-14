const db = require("../models");
const {chargingPoint, charger, station, energyProvider}  = db;

// Function to generate random number  
function randomNumber(min, max) {  
    let r = Math.random() * (max - min) + min;
    return Math.floor(r); 
}  
  
exports.random = async (req,res) => {
    try {
        if (!req.query.vehicleChargerId) {
            return res.status(400).send({
                message: "No vehicleChargerId was provided!"
            });
        }
        let {vehicleChargerId} = req.query;
        const chargingPoints = await chargingPoint.findAll({
            where: {
                chargerId: vehicleChargerId,
                isOccupied: false
            },
            include: [
                {
                    model: charger,
                    required: true
                },
                {
                    model: station,
                    required: true,
                    include: {
                        model: energyProvider,
                        required: true
                    }
                }
            ]
        });

        var random = chargingPoints[randomNumber(0,chargingPoints.length)];
        res.status(200).send(random);
    }
    catch (err) {
        console.error(err);
        return res.status(500).send({
            message: "An error has occured while querying the database!"
        });
    }
}