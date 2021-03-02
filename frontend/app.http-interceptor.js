(function () {
    'use strict';

    angular.module('evolution')
        .config(errorHandler);

    //////// Functions

    errorHandler.$inject = ['$httpProvider'];

    function errorHandler($httpProvider) {
        $httpProvider.interceptors.push(httpInterceptor);

        /// Functions

        httpInterceptor.$inject = ['$q', '$location', 'Auth'];

        function httpInterceptor($q, $location, Auth) {
            return {
                request: function (config) {

                    config.headers['X-OBSERVATORY-AUTH'] = Auth.getToken();

                    return config;
                },
                responseError: function (rejection) {
                    const deferred = $q.defer();
                    if (rejection.status === 401) {
                        Auth.deleteToken();
                        $location.path('login');
                        deferred.reject(rejection);
                    }
                    return deferred.promise;
                }
            };
        }
    }

})();
