(function () {
    'use strict';

    angular.module('evolution')
        .service('Api', controller);

    controller.$inject = ['$location', '$window'];

    function controller($location, $window) {
        const service = this;

        service.root = $location.protocol() + '://' + $location.host();
        //service.ws = 'wss://' + $location.host() + '/wss';

        service.base = service.root + ':8080';
        service.api = service.root + ':8765/evcharge/api';

    }
})();
