(function () {
    'use strict';

    angular.module('evolution')
        .factory('AuthFactory', factory);

    factory.$inject = ['$http', 'Api'];

    function factory($http, Api) {

        const api = Api.api;

        return {
            login: login,
            logout: logout
        };

        //////// Public
        function login(user) {
            return $http.post(api + '/login', user);
        }

        function logout() {
            return $http.post(api + '/logout');
        }


    }
})();