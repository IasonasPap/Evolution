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
                //abstract: true
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
                        return UserFactory.getVehicles(user.id)
                            .then(res => {
                                Utils.setUserVehicles(res.data);
                                return res.data;
                            });
                    }],
                    userStations: ['UserFactory', 'user' ,function (UserFactory, user) {
                        return UserFactory.getStations(user.id)
                            .then(res => {
                                return res.data;
                            });
                    }],
                    stationSessions: ['userStations', 'ChargingSessionFactory', function (userStations, ChargingSessionFactory) {
                        let stationIds = userStations.reduce((ids, s, index) => s.id + (index < userStations.length - 1 ? ',' : ''), '');
                        return ChargingSessionFactory.getChargingSessionsPerStations({stationId: stationIds}).then(res => res.data);
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
            });
    }

})
();
