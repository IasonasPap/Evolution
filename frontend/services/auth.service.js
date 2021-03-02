(function () {
    'use strict';

    angular.module('evolution')
        .service('Auth', controller);

    controller.$inject = [];

    function controller() {
        const service = this;
        service.getToken = getToken;
        service.setToken = setToken;
        service.deleteToken = deleteToken;

        init();

        //////// Public

        function getToken() {
            return localStorage.getItem('token');
        }

        function setToken(token) {
            localStorage.setItem('token', token);
            service.token = token;
        }

        function deleteToken() {
            localStorage.removeItem('token');
        }

        //////// Private

        function init() {
            
        }
    }
})();