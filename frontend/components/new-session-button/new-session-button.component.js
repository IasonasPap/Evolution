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

    controller.$inject = ['$rootScope', '$scope', '$timeout', 'Modal', 'Utils', 'ChargingSessionFactory'];

    function controller($rootScope, $scope, $timeout, Modal, Utils, ChargingSessionFactory) {
        const $ctrl = this;
        let sessionStopped;
        $ctrl.startSession = startSession;
        $ctrl.showSessionData = showSessionData;

        $ctrl.$onInit = onInit;

        //////// Public
        function startSession() {
            $ctrl.chargingPoint = Utils.getSelectedChargingPoint();
            Modal.open({
                template: 'frontend/modals/add-session/add-session.html',
                controller: 'addSessionController',
                data: {
                    vehicle: $ctrl.vehicle,
                    chargingPoint: $ctrl.chargingPoint,
                    station: $ctrl.chargingPoint.station,
                    provider: $ctrl.chargingPoint.station.energyProvider,
                    charger: $ctrl.chargingPoint.charger
                }
            })
                .then(data => {
                    $ctrl.session = angular.copy(data);
                    $rootScope.$broadcast('start-charging');
                    $timeout(() => {
                        $rootScope.$broadcast('end-charging');
                    },1000)
                        .then(() => {
                            if (sessionStopped) {
                                return;
                            }
                            Modal.load(
                                ChargingSessionFactory.create(data),
                                '',
                                'Session completed',
                                ''
                            )
                                .then(() => {

                                });
                        });
                })
        }

        function showSessionData() {
            Modal.open({
                template: 'frontend/modals/session-progress/session-progress.html',
                controller: 'sessionProgressController',
                data: {
                    item: $ctrl.session
                }
            })
        }

        //////// Private

        function onInit() {
            $ctrl.vehicle = Utils.getRandomVehicle();
        }

        $scope.$on('start-charging', () => $ctrl.isCharging = true);
        $scope.$on('end-charging', () => $ctrl.isCharging = false);
    }
})();