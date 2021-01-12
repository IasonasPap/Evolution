(function () {
    'use strict';

    const component = {
        templateUrl: 'frontend/components/new-session-button/new-session-button.html',
        controller: controller,
        bindings: {

        }
    };

    angular.module('evolution')
        .component('newSessionButton', component);

    controller.$inject = ['Modal', 'Utils'];

    function controller(Modal, Utils) {
        const $ctrl = this;
        $ctrl.startSession = startSession;

        $ctrl.$onInit = onInit;

        //////// Public
        function startSession() {
            Modal.open({
                template: 'frontend/modals/add-session/add-session.html',
                controller: 'addSessionController',
                data: {
                    vehicle: $ctrl.userVehicles[Math.floor(Math.random() * $ctrl.userVehicles.length)],
                    chargingPoint: $ctrl.chargingPoint
                }
            })
        }

        //////// Private

        function onInit() {
            $ctrl.userVehicles = Utils.getUserVehicles();
            $ctrl.chargingPoint = {};
        }
    }
})();