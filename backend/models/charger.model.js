module.exports = (sequelize, Sequelize) => {
    const charger = sequelize.define("chargers", {
      // protocol: the connection protocol of the charger
      protocol: {
        type: Sequelize.STRING,
        allowNull: false
      },
      // powerOutput: the amount of power that a charger can offer measured in Kw (SI)
      powerOutput:{
        type:  Sequelize.FLOAT,
        allowNull: false
      },
      // isFastCharger: a fast charger can offer more than 40 Kw of power output
      isFastCharger:{
        type: Sequelize.BOOLEAN,
        allowNull:false
      } 
    },{
      timestamps: false
    });
    return charger;
  };