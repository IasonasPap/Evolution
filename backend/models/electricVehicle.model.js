module.exports = (sequelize, Sequelize) => {
    const electricVehicle = sequelize.define("electricVehicle", {
      // licensePlate: the license plate of the specific vehicle
      licensePlate:{
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      // vehicleType: the type of the specific vehicle, ex. wagon, sedan etc. 
      vehicleType:{
        type: Sequelize.STRING,
        allowNull: true
      },
      // userId: the registered owner/proprietary of the vehicle
      userId:{
        type: Sequelize.INTEGER,
        allowNull: false
      },
      // chargerId: the charger of the specific vehicle (compatible only with the correspondent protocol)
      chargerId:{
        type: Sequelize.INTEGER,
        allowNull: false      
      }
    },{
      timestamps: false
  });
    return electricVehicle;
  };