module.exports = (sequelize, Sequelize) => {
    const chargingPoint = sequelize.define("chargingPoint", {
        // isOccupied: a boolean field that indicates if a charging point is currently occupied by an EV
        isOccupied:{
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        // chargerId: the charger of the specific charging point (compatible only with the correspondent protocol)
        chargerId:{
            type: Sequelize.INTEGER,
            allowNull: false
        },
        // stationId: the charging station to which the charging point belongs.
        stationId:{
            type: Sequelize.INTEGER,
            allowNull: false
        } 
    },{
        timestamps: false
    });
    return chargingPoint;
};