const axios = require('axios');

exports.SessionsPerPoint = (pointId, datetimeFrom, datetimeTo, format, key) => {
    axios({
        "url": 'http://localhost:8765/evcharge/api/SessionsPerPoint/' + pointId + '/' + datetimeFrom + '/' + datetimeTo + '?format=' + format,
        "method": "get",
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
        "url": 'http://localhost:8765/evcharge/api/SessionsPerEV/' + vehicleId + '/' + datetimeFrom + '/' + datetimeTo + '?format=' + format,
        "method": "get",
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
        "url": 'http://localhost:8765/evcharge/api/SessionsPerStation/' + stationId + '/' + datetimeFrom + '/' + datetimeTo + '?format=' + format,
        "method": "get",
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
        "url": 'http://localhost:8765/evcharge/api/SessionsPerProvider/' + providerId + '/' + datetimeFrom + '/' + datetimeTo + '?format=' + format,
        "method": "get",
        "headers": {'x-observatory-auth': key}
    }).then ((response) => {
        console.log(response.data)
        process.exit()
    }).catch( (err) => {
        console.error(err.response.data)
    })
}