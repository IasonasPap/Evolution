(function () {
    'use strict';

    angular.module('evolution')
        .controller('addSessionController', controller);

    controller.$inject = ['$scope'];

    function controller($scope) {
        const vm = this;

        init();

        //////// Public

        //////// Private

        function init() {
            vm.data = angular.copy($scope.ngDialogData);;
        }
    }
})();