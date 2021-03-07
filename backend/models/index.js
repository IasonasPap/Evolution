const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST, 
    dialect: dbConfig.dialect,
    operatorsAliases: 0,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    },
    logging: false
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

user = require("./user.model.js")(sequelize, Sequelize);
charger = require("./charger.model.js")(sequelize, Sequelize);
electricVehicle = require("./electricVehicle.model.js")(sequelize, Sequelize);
station = require("./station.model.js")(sequelize, Sequelize);
chargingSession = require("./chargingSession.model.js")(sequelize, Sequelize);
chargingPoint = require("./chargingPoint.model.js")(sequelize, Sequelize);
energyProvider = require("./energyProvider.model.js")(sequelize, Sequelize);

user.hasMany(electricVehicle);
electricVehicle.belongsTo(user);

user.hasMany(station);
station.belongsTo(user);

charger.hasMany(electricVehicle);
electricVehicle.belongsTo(charger);

charger.hasMany(chargingPoint);
chargingPoint.belongsTo(charger);

station.hasMany(chargingPoint);
chargingPoint.belongsTo(station);

electricVehicle.hasMany(chargingSession);
chargingSession.belongsTo(electricVehicle);

chargingPoint.hasMany(chargingSession);
chargingSession.belongsTo(chargingPoint);

energyProvider.hasMany(station);
station.belongsTo(energyProvider);

db.user = user;
db.charger = charger;
db.electricVehicle = electricVehicle;
db.station = station;
db.chargingSession = chargingSession;
db.chargingPoint = chargingPoint;
db.energyProvider = energyProvider;

module.exports = db;

