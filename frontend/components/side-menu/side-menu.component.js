(function () {
    'use strict';

    const component = {
        templateUrl: 'frontend/components/side-menu/side-menu.html',
        controller: controller,
        bindings: {
            user: '<'
        }
    };

    angular.module('evolution')
        .component('sideMenu', component);

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