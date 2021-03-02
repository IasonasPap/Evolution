(function () {
    'use strict';

    angular.module('evolution')
        .config(config);

    config.$inject = ['$locationProvider'];

    function config($locationProvider) {
        $locationProvider.html5Mode(true);
    }
})();
