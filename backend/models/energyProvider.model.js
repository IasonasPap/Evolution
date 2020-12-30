module.exports = (sequelize, Sequelize) => {
    const energyProvider = sequelize.define("energyProvider", {
      // enterpriseTitle: the name of energy provider enterprise
      enterpriseTitle: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      // costPerKw: cost of the *power output* offered measured in €/kw: ex. 0.008€/kw * 40kw = 0,32€ 
      // This sum will be a fixed cost for any charger with a power output of 40kw
      costPerKw: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
          min: 0
        }
      },
      // costPerKwh: cost of the *energy* offered measured in €/kwh
      costPerKwh:{
        type: Sequelize.FLOAT,
        allowNull:false,
        validate: {
          min: 0
        }
      } 
    },{
      timestamps: false
    });
    return energyProvider;
  };