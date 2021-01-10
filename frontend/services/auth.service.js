(function () {
    'use strict';

    angular.module('evolution')
        .service('Auth', controller);

    controller.$inject = [];

    function controller() {
        const service = this;
        service.getToken = getToken;
        service.setToken = setToken;

        init();

        //////// Public

        function getToken() {
            return service.token || localStorage.getItem('token');
        }

        function setToken(token) {
            localStorage.setItem('token', token);
            service.token = token;
        }

        //////// Private

        function init() {
            
        }
    }
})();