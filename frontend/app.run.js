(function () {
    'use strict';

    angular.module('evolution')
        .run(init);

    init.$inject = ['$rootScope', '$transitions', '$location', 'Auth'];

    function init($rootScope, $transitions, $location, Auth) {
        $transitions.onStart({to: 'app.*'}, function (transition) {
            if (!Auth.getToken()) {
                console.log('DENY : Redirecting to Login');
                return transition.router.stateService.target('login');
            } else {
                console.log('ALLOW');
            }
        });

        $transitions.onStart({to: 'login'}, function (transition) {
            if (Auth.getToken()) {
                console.log('DENY : Redirecting to Dashboard');
                return transition.router.stateService.target('app.dashboard');
            } else {
                console.log('ALLOW');
            }
        });

    }
})();
