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

    controller.$inject = ['$rootScope', '$scope', '$timeout', 'Modal', 'ngDialog', 'Utils', 'ChargingSessionFactory'];

    function controller($rootScope, $scope, $timeout, Modal, ngDialog, Utils, ChargingSessionFactory) {
        const $ctrl = this;
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
                    $rootScope.$broadcast('start-charging', {session: $ctrl.session});
                    $ctrl.timeoutFun = $timeout(() => {
                        $rootScope.$broadcast('end-charging');
                    },25000)
                        .then(() => {
                            if ($ctrl.session.sessionStopped) {
                                return;
                            }
                            ngDialog.closeAll();
                            ChargingSessionFactory.create(data).then((res) => {
                                $rootScope.$broadcast('reload-sessions');
                                Modal.open({
                                    template: 'frontend/modals/session-progress/session-progress.html',
                                    controller: 'sessionProgressController',
                                    showClose: false,
                                    data: {
                                        item: data,
                                        isCompleted: true
                                    }
                                });
                            })
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
            });
        }

        //////// Private

        function onInit() {
            $ctrl.vehicle = Utils.getRandomVehicle();
        }

        $scope.$on('start-charging', (ev, data) => {
            $ctrl.isCharging = true;
            $ctrl.session = $ctrl.session || data.session;
        });
        $scope.$on('end-charging', () => $ctrl.isCharging = false);

        $scope.$watch('$ctrl.session.sessionStopped', (newVal) => {
            if (newVal) {
                $ctrl.isCharging = false;
                clearTimeout($ctrl.timeoutFun);
            }
        });
    }
})();