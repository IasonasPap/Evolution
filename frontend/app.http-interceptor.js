(function () {
    'use strict';

    angular.module('evolution')
        .config(errorHandler);

    //////// Functions

    errorHandler.$inject = ['$httpProvider'];

    function errorHandler($httpProvider) {
        $httpProvider.interceptors.push(httpInterceptor);

        /// Functions

        httpInterceptor.$inject = ['Auth'];

        function httpInterceptor(Auth) {
            // noinspection JSUnusedGlobalSymbols
            return {
                request: function (config) {

                    config.headers['X-OBSERVATORY-AUTH'] = Auth.getToken();

                    return config;
                }
            };
        }
    }

})();
