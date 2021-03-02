(function () {
    'use strict';

    angular.module('evolution')
        .controller('addSessionController', controller);

    controller.$inject = ['$scope', 'Utils'];

    function controller($scope, Utils) {
        const vm = this;
        vm.submit = submit;

        init();

        //////// Public

        function submit() {
            if (!Utils.validateForm(vm.form)) {
                return;
            }

            vm.data.electricVehicleId = vm.data.electricVehicle.id;
            vm.data.chargingPointId = vm.data.chargingPoint.id;
            vm.data.startTime = moment().format('YYYY-MM-DD HH:mm:ss');
            vm.data.endTime = moment(vm.data.startTime).add(vm.data.duration.hours, 'hours').add(vm.data.duration.minutes, 'minutes').format('YYYY-MM-DD HH:mm:ss');

            $scope.closeThisDialog(vm.data);
        }

        //////// Private

        function init() {
            vm.data = angular.copy($scope.ngDialogData);
            vm.data.duration = {hours: 0, minutes: 0};
            vm.batteryPercent = Math.floor(Math.random() * 66);
            vm.maxHours = Math.floor((100 - vm.batteryPercent) / (vm.data.charger.powerOutput/10 + 9));
            vm.maxMinutes = Math.floor(Math.random() * 4) * 15;
        }

        $scope.$watch('vm.data.duration', () => {
            vm.data.energyRequested = ((vm.data.duration.hours + (vm.data.duration.minutes / 60)) * vm.data.charger.powerOutput).toFixed(2);
            vm.data.cost = (vm.data.provider.costPerKwh * vm.data.energyRequested).toFixed(2);
        }, true);

        $scope.$watch('vm.fullCharge', () => {
            if(vm.fullCharge) {
                vm.data.duration.hours = vm.maxHours;
                vm.data.duration.minutes = vm.maxMinutes;
            }
        });
    }
})();