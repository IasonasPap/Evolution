(function () {
    'use strict';

    angular.module('evolution')
        .controller('sessionProgressController', controller);

    controller.$inject = ['$scope'];

    function controller($scope) {
        const vm = this;

        init();

        //////// Public

        //////// Private

        function init() {
            vm.data = angular.copy($scope.ngDialogData.item);
            vm.data.progress = moment().diff(moment(vm.data.startTime), 'seconds') * 3;
            vm.data.energyDelivered = (vm.data.energyRequested * parseFloat(vm.data.progress / 100)).toFixed(2);
        }
    }
})();