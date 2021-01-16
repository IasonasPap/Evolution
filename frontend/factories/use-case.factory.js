(function () {
    'use strict';

    angular.module('evolution')
        .factory('UseCaseFactory', factory);

    factory.$inject = ['$http', 'Api'];

    function factory($http, Api) {

        const api = Api.api + '/useCaseOne';

        return {
            getRandomChargingPoint: getRandomChargingPoint
        };

        //////// Public
        function getRandomChargingPoint(chargerId) {
            return $http.get(api + '/randomChargingPoint?vehicleChargerId=' + chargerId);
        }


    }
})();