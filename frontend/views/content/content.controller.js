(function () {
    'use strict';

    angular.module('evolution')
        .controller('contentController', controller);

    controller.$inject = ['user'];

    function controller(user) {
        const vm = this;

        init();

        //////// Public

        //////// Private

        function init() {
            vm.user = user;
        }
    }
})();
