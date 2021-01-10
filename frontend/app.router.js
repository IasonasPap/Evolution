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
                        return Utils.getUser() || UserFactory.getOne(localStorage.getItem('userId')).then(res => res.data);
                    }]
                }
            })
            .state('app.dashboard', {
                url: '/dashboard',
                component: 'dashboard'
                //abstract: true
            })
            .state('app.test', {
                url: '/test',
                template: '<div><a ui-sref="app.dashboard">Click here!</a></div>',
                //abstract: true
            });
    }

})
();
