module.exports = (sequelize, Sequelize) => {
    const station = sequelize.define("station", {
      // address: the address of the charging station
      address: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      // userId: the operator/manager of the charging station
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      // energyProviderId: the energy provider of the station
      energyProviderId: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    },{
      timestamps: false
    });
    return station;
};