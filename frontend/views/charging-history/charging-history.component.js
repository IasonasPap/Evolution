(function () {
    'use strict';

    const component = {
        templateUrl: 'frontend/views/charging-history/charging-history.html',
        controller: controller,
        bindings: {
            user: '<'
        }
    };

    angular.module('evolution')
        .component('chargingHistory', component);

    controller.$inject = ['$scope', '$location', 'ChargingSessionFactory'];

    function controller($scope, $location, ChargingSessionFactory) {
        const $ctrl = this;
        $ctrl.getDuration = getDuration;
        $ctrl.floor = Math.floor;

        $ctrl.$onInit = onInit;

        //////// Public

        function getDuration(item) {
            return moment.utc(moment(item.finishedOn).diff(moment(item.startedOn))).format('HH:mm:ss');
        }

        //////// Private

        function onInit() {
            $ctrl.showPage = 0;
        }

        function updateFilters(params) {
            $ctrl.filters = {
                dateFrom: params.dateFrom && moment(params.dateFrom).toDate() || moment().startOf('month').toDate(),
                dateTo: params.dateTo && moment(params.dateTo).toDate() || moment().toDate()
            }
        }

        function updateTotals() {
            $ctrl.vehicleTotals = {};
            $ctrl.totals = {
                sessionsCount: 0,
                totalEnergyDelivered: 0,
                totalCost: 0,
                points: 0
            };
            $ctrl.userSessions.forEach(s => {
                if(!$ctrl.vehicleTotals.hasOwnProperty(s.vehicle.licensePlate)) {
                    $ctrl.vehicleTotals[s.vehicle.licensePlate] = {
                        sessionsCount: 1,
                        totalEnergyDelivered: s.energyDelivered,
                        totalCost: s.totalCost,
                        points: s.points
                    }
                } else {
                    $ctrl.vehicleTotals[s.vehicle.licensePlate].sessionsCount++;
                    $ctrl.vehicleTotals[s.vehicle.licensePlate].totalEnergyDelivered += s.energyDelivered;
                    $ctrl.vehicleTotals[s.vehicle.licensePlate].totalCost += s.totalCost;
                    $ctrl.vehicleTotals[s.vehicle.licensePlate].points += s.points;
                }

                $ctrl.totals.sessionsCount++;
                $ctrl.totals.totalEnergyDelivered += s.energyDelivered;
                $ctrl.totals.totalCost += s.totalCost;
                $ctrl.totals.points += s.points;
            })
        }

        $scope.$watch(() => $location.search(), (newVal, oldVal) => {
            if (newVal) {
                updateFilters(newVal);
            }
        });

        $scope.$watch('$ctrl.filters', (newVal, oldVal) => {
            if(newVal && newVal.dateFrom && newVal.dateTo) {
                $ctrl.isLoading = true;
                let filters = {
                    dateFrom: moment(newVal.dateFrom).format('YYYYMMDD'),
                    dateTo: moment(newVal.dateTo).format('YYYYMMDD'),
                }
                $location.search('dateFrom', filters.dateFrom);
                $location.search('dateTo', filters.dateTo);
                $ctrl.showPage = 0;
                ChargingSessionFactory.getChargingSessionsPerUser($ctrl.user.id, filters).then(res => {
                    $ctrl.userSessions = res.data.sort((a,b) => a.startedOn > b.startedOn ? -1 : 1);
                    $ctrl.items = $ctrl.userSessions.slice($ctrl.showPage*10, $ctrl.showPage*10 + 10);
                    if($ctrl.userSessions.length) {
                        $ctrl.pageArray = [...Array(Math.floor($ctrl.userSessions.length / 10)).keys()].map(i => i + 2);
                    } else {
                        $ctrl.pageArray = undefined;
                    }
                    updateTotals();
                }).finally(() => $ctrl.isLoading = false);
            }
        }, true);

        $scope.$watch('$ctrl.showPage', (newVal) => {
            if (isFinite(newVal) && $ctrl.userSessions) {
                $ctrl.items = $ctrl.userSessions.slice($ctrl.showPage * 10, $ctrl.showPage * 10 + 10);
            }
        });

        $scope.$on('reload-sessions', () => {
            $ctrl.isLoading = true;
            let filters = {
                dateFrom: moment($ctrl.filters.dateFrom).format('YYYYMMDD'),
                dateTo: moment($ctrl.filters.dateTo).format('YYYYMMDD'),
            }
            ChargingSessionFactory.getChargingSessionsPerUser($ctrl.user.id, filters).then(res => {
                $ctrl.userSessions = res.data.sort((a,b) => a.startedOn > b.startedOn ? -1 : 1);
                $ctrl.items = $ctrl.userSessions.slice($ctrl.showPage*10, $ctrl.showPage*10 + 10);
                if($ctrl.userSessions.length) {
                    $ctrl.pageArray = [...Array(Math.floor($ctrl.userSessions.length / 10 - 1)).keys()].map(i => i + 2);
                } else {
                    $ctrl.pageArray = undefined;
                }
                updateTotals();
            }).finally(() => $ctrl.isLoading = false);
        });
    }
})();