const axios = require('axios');
const https = require('https');

const agent = new https.Agent({  
  rejectUnauthorized: false
})


exports.SessionsPerPoint = (pointId, datetimeFrom, datetimeTo, format, key) => {
    axios({
        "url": 'https://localhost:8765/evcharge/api/SessionsPerPoint/' + pointId + '/' + datetimeFrom + '/' + datetimeTo + '?format=' + format,
        "method": "get",
        httpsAgent: agent,
        "headers": {'x-observatory-auth': key}
    }).then ((response) => {
        console.log(response.data)
        process.exit()
    }).catch( (err) => {
        console.error(err.response.data)
    })
}

exports.SessionsPerEV = (vehicleId, datetimeFrom, datetimeTo, format, key) => {
    axios({
        "url": 'https://localhost:8765/evcharge/api/SessionsPerEV/' + vehicleId + '/' + datetimeFrom + '/' + datetimeTo + '?format=' + format,
        "method": "get",
        httpsAgent: agent,
        "headers": {'x-observatory-auth': key}
    }).then ((response) => {
        console.log(response.data)
        process.exit()
    }).catch( (err) => {
        console.error(err.response.data)
    })
}

exports.SessionsPerStation = (stationId, datetimeFrom, datetimeTo, format, key) => {
    axios({
        "url": 'https://localhost:8765/evcharge/api/SessionsPerStation/' + stationId + '/' + datetimeFrom + '/' + datetimeTo + '?format=' + format,
        "method": "get",
        httpsAgent: agent,
        "headers": {'x-observatory-auth': key}
    }).then ((response) => {
        console.log(response.data)
        process.exit()
    }).catch( (err) => {
        console.error(err.response.data)
    })
}

exports.SessionsPerProvider = (providerId, datetimeFrom, datetimeTo, format, key) => {
    axios({
        "url": 'https://localhost:8765/evcharge/api/SessionsPerProvider/' + providerId + '/' + datetimeFrom + '/' + datetimeTo + '?format=' + format,
        "method": "get",
        httpsAgent: agent,
        "headers": {'x-observatory-auth': key}
    }).then ((response) => {
        console.log(response.data)
        process.exit()
    }).catch( (err) => {
        console.error(err.response.data)
    })
}