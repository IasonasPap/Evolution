(function () {
    'use strict';

    angular.module('evolution')
        .run(init);

    init.$inject = ['$rootScope', '$transitions', '$location', 'Auth'];

    function init($rootScope, $transitions, $location, Auth) {
        $transitions.onStart({to: 'app.*'}, function (transition) {
            if (!Auth.getToken()) {
                console.log('DENY : Redirecting to Login');
                $rootScope.title = 'Login';
                return transition.router.stateService.target('login');
            } else {
                console.log('ALLOW');
                $rootScope.title = transition.to().config.title;
            }
        });

        $transitions.onStart({to: 'login'}, function (transition) {
            if (Auth.getToken()) {
                console.log('DENY : Redirecting to Dashboard');
                $rootScope.title = transition.to().config.title;
                return transition.router.stateService.target('app.dashboard');
            } else {
                $rootScope.title = 'Login';
                console.log('ALLOW');
            }
        });

    }
})();
