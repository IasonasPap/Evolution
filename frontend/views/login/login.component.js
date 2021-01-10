(function () {
    'use strict';

    const component = {
        templateUrl: 'frontend/views/login/login.html',
        controller: controller,
        bindings: {}
    };

    angular.module('evolution')
        .component('login', component);

    controller.$inject = ['$scope', '$state', 'Auth', 'Utils', 'AuthFactory'];

    function controller($scope, $state, Auth, Utils, AuthFactory) {
        const $ctrl = this;
        $ctrl.login = login;

        $ctrl.$onInit = onInit;

        //////// Public

        function login() {
            if ($scope.loginForm.$invalid) {
                return;
            }
            delete $ctrl.error;
            $ctrl.waitingForReply = true;
            AuthFactory.login($ctrl.user)
            .then(function (res) {
                Auth.setToken(res.data.token);
                Utils.setUser($ctrl.user.username);
                $state.go('app.dashboard');

            }).catch(res => {
                $ctrl.error = res.data.message;
            })
            .finally(() => {
                $ctrl.waitingForReply = false;
            });
        }

        //////// Private

        function onInit() {
            $ctrl.user = {};
        }
    }
})();