(function () {
    'use strict';

    const component = {
        templateUrl: 'frontend/views/dashboard/dashboard.html',
        controller: controller,
        bindings: {
            userSessions: '<',
            userVehicles: '<',
            user: '<'
        }
    };

    angular.module('evolution')
        .component('dashboard', component);

    controller.$inject = ['$scope', 'ChargingSessionFactory'];

    function controller($scope, ChargingSessionFactory) {
        const $ctrl = this;
        $ctrl.getDuration = getDuration;

        $ctrl.$onInit = onInit;

        //////// Public
        function getDuration(item) {
            return moment.utc(moment(item.finishedOn).diff(moment(item.startedOn))).format('HH:mm:ss');
        }

        //////// Private

        function onInit() {
            $ctrl.stationsVisited = [];
            $ctrl.userSessionsThisMonth = $ctrl.userSessions.filter(s => {
                return moment(s.startedOn).isSame(moment().format('YYYY-MM-DD'), 'month');
            });
            $ctrl.userSessions.map(s => {
                if(!$ctrl.stationsVisited.find( st => st.id === s.station.id)) {
                    $ctrl.stationsVisited.push(s.station);
                }
            });

        }

        $scope.$on('reload-sessions', () => {
            ChargingSessionFactory.getChargingSessionsPerUser($ctrl.user.id)
                .then(res => {
                    $ctrl.userSessions = res.data;
                    onInit();
                });
        });
    }
})();