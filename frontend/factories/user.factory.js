(function () {
    'use strict';

    angular.module('evolution')
        .factory('UserFactory', factory);

    factory.$inject = ['$http', 'Api'];

    function factory($http, Api) {

        const api = Api.api + '/users';

        return {
            getOne: getOne,
            getVehicles: getVehicles
        };

        //////// Public
        function getOne(id) {
            return $http.get(api + '/' + id);
        }

        function getVehicles(id) {
            return $http.get(api + '/' + id + '/electricVehicles')
        }


    }
})();