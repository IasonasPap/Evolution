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
      // energyProciderId: the energy provider of the station
      energyProciderId: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    },{
      timestamps: false
    });
    return station;
};