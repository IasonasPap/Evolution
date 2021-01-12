(function () {
    'use strict';

    angular.module('evolution')
        .factory('ChargingSessionFactory', factory);

    factory.$inject = ['$http', 'Api'];

    function factory($http, Api) {

        const api = Api.api;

        return {
            getChargingSessionsPerUser: getChargingSessionsPerUser
        };

        //////// Public
        function getChargingSessionsPerUser(userId) {
            return $http.get(api + '/SessionsPerUser/' + userId);
        }


    }
})();