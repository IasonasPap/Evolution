module.exports = (sequelize, Sequelize) => {
    const chargingSession = sequelize.define("chargingSession", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false, 
            primaryKey: true,
            autoIncrement: true
        },
        // totalCost: the total cost of a charging event after its completion measured in €
        totalCost: {
            type: Sequelize.FLOAT,
            allowNull: false,
            validate: {
                min:0
            }
        },
        // energyDelivered: the total amount of energy transfered during a session measured in Kwh (SI)
        energyDelivered: {
            type: Sequelize.FLOAT,
            allowNull: false,
            validate: {
                min: 0
            }
        },
        // pointsAwarded: the amount of points awarded  from the user that will be redeemed through a rewarding system
        pointsAwarded: {
            type: Sequelize.FLOAT,
            allowNull: false,
            validate: {
                min: 0
            }
        },
        // startTime: timestamp of the start of the charging session
        startTime: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
            validate: {
                isDate: true
            }
        },
        // endTime: timestamp of the finish of the charging session
        endTime:{
            type: Sequelize.DATE,
            allowNull: false,
            validate: {
                isDate: true,
                isAfter: this.startTime
            }
        },
        // paymentType: the type of payment: cash, paypal, credit card
        paymentType:{
            type: Sequelize.STRING,
            allowNull: false
        },
        // electricVehicleId: the EV involved in the charging session
        electricVehicleId:{
            type: Sequelize.INTEGER,
            allowNull: false
        },
        // chargingPointId: the specific charging point invlovled in the charging session
        chargingPointId:{
            type: Sequelize.INTEGER,
            allowNull: false
        } 
    },{
        timestamps: false
    });
    return chargingSession;
};