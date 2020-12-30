// Configuration for the remote database
module.exports = {
    HOST: "remotemysql.com",
    USER: "gZ6NCHm1TW",
    PASSWORD: "38bW8fAoZN",
    DB: "gZ6NCHm1TW",
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};

// Configuration for a local copy the database
// module.exports = {
//     HOST: "localhost",
//     PORT: "3306",
//     DB: "evolutionDB",
//     USER: "root",
//     PASSWORD: "uZCuhy8==2A$LPtp",
//     dialect: "mysql",
//     pool: {
//         max: 5,
//         min: 0,
//         acquire: 30000,
//         idle: 10000
//     }
// };