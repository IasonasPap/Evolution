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

        /**
         * DO NOT CHANGE
         * The following 2 lines are being replaced by the gulpfile before deploying to production
         */
        // service.core = {base: service.root + '/core'};
        // service.core.api = service.core.base + '/api';
        //
        // service.lm = {base: service.root + '/lm', api: service.root + '/lm/api'};
        // service.pis = {base: service.root + '/pis', api: service.root + '/pis/api'};
        // service.ab = {base: service.root + '/ab/address-book', api: service.root + '/ab/api'};
        // service.buyouts = {base: service.root + '/buyouts', api: service.root + '/buyouts/api'};
        // service.incidents = {base: service.root + '/incidents', api: service.root + '/incidents/api'};
        // service.compliance = {base: service.root + '/compliance', api: service.root + '/compliance/api'};
        // service.jt = {base: service.root + '/jt', api: service.root + '/tasks/api'};
        // service.at = {base: service.root + '/admin-tasks', api: service.root + '/admin-tasks/api'};
        //
        // ////////////// Functions
        //
        // service.goToBase = goToBase;
        // service.isDev = isDev;
        //
        // function goToBase(redirect) {
        //     $window.location.assign(service.core.base + '/login' + (redirect ? '?redirect=' + window.encodeURIComponent(redirect) : ''));
        // }
        //
        // function isDev() {
        //     return ['localhost', '127.0.0.1', 'dev.spectre.gr'].some(str => $location.host().includes(str));
        // }
    }
})();
