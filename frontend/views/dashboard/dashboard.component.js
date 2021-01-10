(function () {
    'use strict';

    const component = {
        templateUrl: 'frontend/views/dashboard/dashboard.html',
        controller: controller,
        bindings: {

        }
    };

    angular.module('evolution')
        .component('dashboard', component);

    controller.$inject = [];

    function controller() {
        const $ctrl = this;

        $ctrl.$onInit = onInit;

        //////// Public

        //////// Private

        function onInit() {

        }
    }
})();