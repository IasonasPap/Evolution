(function () {
    'use strict';

    const component = {
        templateUrl: 'frontend/components/page-title/page-title.html',
        controller: controller,
        bindings: {
            pageTitle: '<'
        }
    };

    angular.module('evolution')
        .component('pageTitle', component);

    controller.$inject = ['$scope', '$rootScope', '$state', 'Utils', 'AuthFactory', 'AdminFactory'];

    function controller($scope, $rootScope, $state, Utils, AuthFactory, AdminFactory) {
        const $ctrl = this;
        $ctrl.logout = logout;

        $ctrl.$onInit = onInit;

        //////// Public
        function logout() {
            AuthFactory.logout().then(() => {
                localStorage.removeItem('token');
                $state.go('login', {});
            });
        }

        //////// Private

        function onInit() {
            Utils.getUser().then(res => $ctrl.user = res);
        }

        $scope.$watch('$ctrl.file', (newVal) => {
            if(newVal) {
                AdminFactory.uploadSessions(newVal).then(res => $rootScope.$broadcast('reload-sessions'));
            }
        });
    }
})();