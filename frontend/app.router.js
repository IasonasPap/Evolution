(function () {
    'use strict';

    angular.module('evolution')
        .config(['$stateProvider', '$urlRouterProvider', stateDefinition]);

    function stateDefinition($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/dashboard');
        $stateProvider
            .state('login', {
                url: '/login',
                component: 'login'
            })
            .state('app', {
                url: '',
                templateUrl: 'frontend/views/content/content.html',
                controller: 'contentController',
                controllerAs: 'vm',
                abstract: true,
                resolve: {
                    user: ['UserFactory', 'Utils', function (UserFactory, Utils) {
                        return Utils.getUser();
                    }],
                    userSessions: ['ChargingSessionFactory', 'user', function (ChargingSessionFactory, user) {
                        return ChargingSessionFactory.getChargingSessionsPerUser(user.id)
                            .then(res => res.data);
                    }],
                    userVehicles: ['Utils', 'UserFactory', 'user', function (Utils, UserFactory, user) {
                        return !user.isStationManager && UserFactory.getVehicles(user.id)
                            .then(res => {
                                Utils.setUserVehicles(res.data);
                                return res.data;
                            });
                    }],
                    userStations: ['UserFactory', 'user' ,function (UserFactory, user) {
                        return user.isStationManager && UserFactory.getStations(user.id)
                            .then(res => {
                                return res.data;
                            }).catch( err => {
                                console.log(err);
                                if(err.status === 402) {
                                    return [];
                                }
                            });
                    }],
                    stationSessions: ['userStations', 'ChargingSessionFactory', 'user', function (userStations, ChargingSessionFactory, user) {
                        let stationIds = userStations && userStations.reduce((ids, s, index) => ids + s.id + (index < userStations.length - 1 ? ',' : ''), '');
                        return user.isStationManager && ChargingSessionFactory.getChargingSessionsPerStations({stationId: stationIds}).then(res => res.data)
                            .catch(res => {
                                if (res.message === "Give one or more station ids") {
                                    return [];
                                }
                            });
                    }]
                }
            })
            .state('app.dashboard', {
                url: '/dashboard',
                component: 'dashboard',
                config: {title: 'Dashboard'},
            })
            .state('app.chargingHistory', {
                url: '/charging-history',
                component: 'chargingHistory',
                config: {title: 'Charging History'}
            })
            .state('app.statistics', {
                url: '/statistics',
                component: 'statistics',
                config: {title: 'Statistics'}
            });
    }

})
();
