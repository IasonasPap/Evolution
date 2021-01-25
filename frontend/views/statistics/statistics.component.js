(function () {
    'use strict';

    const component = {
        templateUrl: 'frontend/views/statistics/statistics.html',
        controller: controller,
        bindings: {
            userStations: '<',
            stationSessions: '<'
        }
    };

    angular.module('evolution')
        .component('statistics', component);

    controller.$inject = ['$scope', '$location', 'ChargingSessionFactory'];

    function controller($scope, $location, ChargingSessionFactory) {
        const $ctrl = this;

        $ctrl.$onInit = onInit;
        $ctrl.chartOptions = chartOptions;
        $ctrl.chartTypeOptions = ['Bar', 'Pie', 'Doughnut'];
        let options = {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        };
        let charts = new Array(2);

        //////// Public

        function chartOptions(index, title) {
            if(charts[index]){
                return charts[index];
            }
            charts[index] = angular.extend({title:{display: true, text: title}}, options);
            return charts[index];
        }

        //////// Private

        function onInit() {
            findBestCharger();
            $ctrl.chartTypes = ['Bar', 'Pie'];
        }

        function findBestCharger() {
            $ctrl.bestCharger = {};
            $ctrl.worstCharger = {};
            $ctrl.bestMonth = {};
            $ctrl.worstMonth = {};
            $ctrl.mostProfitable = {};
            $ctrl.leastProfitable = {};
            let sessionsByMonth = new Array(12).fill(0);
            let sessionsByCharger = $ctrl.stationSessions.length && $ctrl.stationSessions.reduce((acc, s) => {
                acc[s.chargingPoint.charger.protocol] = acc[s.chargingPoint.charger.protocol] || {
                    sessions: 0,
                    profit: 0
                };
                acc[s.chargingPoint.charger.protocol].sessions = acc[s.chargingPoint.charger.protocol].sessions + 1 || 1;
                acc[s.chargingPoint.charger.protocol].profit += s.totalCost;
                sessionsByMonth[moment(s.startTime).month()]++;
                return acc;
            }, {});
            if (Object.entries(sessionsByCharger).length) {
                $ctrl.bestCharger.protocol = Object.keys(sessionsByCharger).reduce((a, b) =>
                    sessionsByCharger[a].sessions > sessionsByCharger[b].sessions ? a : b);
                $ctrl.bestCharger.sessions = sessionsByCharger[$ctrl.bestCharger.protocol].sessions;
                $ctrl.worstCharger.protocol = Object.keys(sessionsByCharger).reduce((a, b) =>
                    sessionsByCharger[a].sessions < sessionsByCharger[b].sessions ? a : b);
                $ctrl.worstCharger.sessions = sessionsByCharger[$ctrl.worstCharger.protocol].sessions;
                $ctrl.mostProfitable.protocol = Object.keys(sessionsByCharger).reduce((a, b) =>
                    sessionsByCharger[a].profit > sessionsByCharger[b].profit ? a : b);
                $ctrl.mostProfitable.profit = sessionsByCharger[$ctrl.mostProfitable.protocol].profit;
                $ctrl.leastProfitable.protocol = Object.keys(sessionsByCharger).reduce((a, b) =>
                    sessionsByCharger[a].profit < sessionsByCharger[b].profit ? a : b);
                $ctrl.leastProfitable.profit = sessionsByCharger[$ctrl.leastProfitable.protocol].profit;
            }
            let bestMonth = Math.max(...sessionsByMonth);
            let worstMonth = Math.min(...sessionsByMonth);
            $ctrl.bestMonth = {
                month: moment(sessionsByMonth.indexOf(bestMonth) + 1, 'M').format('MMMM'),
                sessions: bestMonth
            };
            $ctrl.worstMonth = {
                month: moment(sessionsByMonth.indexOf(worstMonth) + 1, 'M').format('MMMM'),
                sessions: worstMonth
            };

            $ctrl.chargers = Object.keys(sessionsByCharger);
            $ctrl.chargerSessions = Object.values(sessionsByCharger).map(item => item.sessions);
            $ctrl.chargerProfits = Object.values(sessionsByCharger).map(item => item.profit.toFixed(2));
        }

        $scope.$watch(() => $location.search(), (newVal, oldVal) => {
            if (newVal) {
                updateFilters(newVal);
            }
        });

        $scope.$watch('$ctrl.filters', (newVal, oldVal) => {
            if (newVal && newVal.dateFrom && newVal.dateTo) {
                $ctrl.isLoading = true;
                let filters = {
                    dateFrom: moment(newVal.dateFrom).format('YYYYMMDD'),
                    dateTo: moment(newVal.dateTo).format('YYYYMMDD'),
                }
                $location.search('dateFrom', filters.dateFrom);
                $location.search('dateTo', filters.dateTo);
                filters.stationId = $ctrl.userStations.reduce((acc, s, i, arr) => acc + s.id + (i < arr.length - 1 ? ',' : ''), '');
                ChargingSessionFactory.getChargingSessionsPerStations(filters).then(res => {
                    $ctrl.stationSessions = res.data.sort((a, b) => a.startTime > b.startTime ? -1 : 1);
                    findBestCharger();
                }).finally(() => $ctrl.isLoading = false);
            }
        }, true);

        function updateFilters(params) {
            $ctrl.filters = {
                dateFrom: params.dateFrom && moment(params.dateFrom).toDate() || undefined,
                dateTo: params.dateTo && moment(params.dateTo).toDate() || undefined
            }
        }
    }
})();