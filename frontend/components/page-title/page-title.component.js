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

    controller.$inject = ['$state', 'Utils', 'AuthFactory'];

    function controller($state, Utils, AuthFactory) {
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
    }
})();