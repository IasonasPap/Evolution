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
        $ctrl.isCharging = isCharging;

        $ctrl.$onInit = onInit;

        //////// Public
        function startSession() {
            $ctrl.chargingPoint = Utils.getSelectedChargingPoint();
            Modal.open({
                template: 'frontend/modals/add-session/add-session.html',
                controller: 'addSessionController',
                data: {
                    electricVehicle: $ctrl.vehicle,
                    chargingPoint: $ctrl.chargingPoint,
                    station: $ctrl.chargingPoint.station,
                    provider: $ctrl.chargingPoint.station.energyProvider,
                    charger: $ctrl.chargingPoint.charger
                }
            })
                .then(data => {
                    $ctrl.session = angular.copy(data);
                    Utils.session = $ctrl.session;
                    Utils.isCharging = true;
                    $ctrl.timeoutFun = $timeout(() => {
                        $rootScope.$broadcast('end-charging');
                    },25000)
                        .then(() => {
                            if ($ctrl.session.sessionStopped) {
                                return;
                            }
                            Utils.isCharging = false;
                            Utils.session  = undefined;
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
                    item: Utils.session
                }
            });
        }

        function isCharging() {
            return Utils.isCharging;
        }

        //////// Private

        function onInit() {
            $ctrl.vehicle = Utils.getRandomVehicle();
            $ctrl.session = Utils.session;
        }


        $scope.$watch('$ctrl.session.sessionStopped', (newVal) => {
            if (newVal) {
                clearTimeout($ctrl.timeoutFun);
                Utils.isCharging = false;
                Utils.session = undefined;
            }
        });


    }
})();