(function () {
    'use strict';

    const component = {
        templateUrl: 'frontend/views/charge-history/charge-history.html',
        controller: controller,
        bindings: {

        }
    };

    angular.module('evolution')
        .component('chargeHistory', component);

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