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

    controller.$inject = [];

    function controller() {
        const $ctrl = this;
        $ctrl.getDuration = getDuration;

        $ctrl.$onInit = onInit;

        //////// Public
        function getDuration(item) {
            return moment(moment(item.finishedOn, 'YYYY-MM-DD HH:mm:ss').diff(moment(item.startedOn, 'YYYY-MM-DD HH:mm:ss'))).format('HH:mm:ss');
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
    }
})();