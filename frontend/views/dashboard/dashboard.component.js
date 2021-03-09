(function () {
    'use strict';

    const component = {
        templateUrl: 'frontend/views/dashboard/dashboard.html',
        controller: controller,
        bindings: {
            //userSessions: '<',
            userVehicles: '<',
            userStations: '<',
            stationSessions: '<',
            user: '<'
        }
    };

    angular.module('evolution')
        .component('dashboard', component);

    controller.$inject = ['$scope', 'ChargingSessionFactory'];

    function controller($scope, ChargingSessionFactory) {
        const $ctrl = this;
        $ctrl.getDuration = getDuration;
        $ctrl.getUsersVisited = getUsersVisited;

        $ctrl.$onInit = onInit;

        //////// Public
        function getDuration(item) {
            return moment.utc(moment(item.endTime).diff(moment(item.startTime))).format('HH:mm:ss');
        }

        function getUsersVisited() {
            if($ctrl.usersVisited) {
                return $ctrl.usersVisited;
            }
            $ctrl.usersVisited = $ctrl.stationSessions.reduce((acc, s) => {
                acc[s.electricVehicle.userId] = acc[s.electricVehicle.userId] ? acc[s.electricVehicle.userId]++ : 1;
                return acc;
            }, {});
            $ctrl.usersVisited = Object.entries($ctrl.usersVisited).length;
            return $ctrl.usersVisited;
        }

        //////// Private

        function onInit() {
            reloadSessions();
        }

        function reloadSessions() {
            $ctrl.isLoading = true;
            ChargingSessionFactory.getChargingSessionsPerUser($ctrl.user.id)
                .then(res => {
                    $ctrl.userSessions = res.data;
                    $ctrl.isStationManager = $ctrl.user.isStationManager;
                    if(!$ctrl.isStationManager) {
                        $ctrl.stationsVisited = [];
                        $ctrl.userSessionsThisMonth = $ctrl.userSessions.filter(s => {
                            return moment(s.startTime).isSame(moment().format('YYYY-MM-DD'), 'month');
                        });
                        $ctrl.userSessions.map(s => {
                            if (!$ctrl.stationsVisited.find(st => st.id === s.station.id)) {
                                $ctrl.stationsVisited.push(s.station);
                            }
                        });
                    } else {
                        $ctrl.chargingPoints = [];
                        $ctrl.userStations.map(s => $ctrl.chargingPoints = $ctrl.chargingPoints.concat(s.chargingPoints));
                        $ctrl.stationSessionsLastMonth = $ctrl.stationSessions.filter(s =>
                            moment(s.startTime).format('YYYY-MM-DD') > moment().subtract(30, 'days').format('YYYY-MM-DD'));
                    }
                }).finally(() => $ctrl.isLoading = false);
        }

        $scope.$on('reload-sessions', () => {
            reloadSessions();
        });
    }
})();