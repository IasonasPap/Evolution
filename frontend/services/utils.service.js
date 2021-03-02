(function () {
    'use strict';

    angular.module('evolution')
        .service('Utils', controller);

    controller.$inject = ['$q', 'UserFactory', 'UseCaseFactory'];

    function controller($q, UserFactory, UseCaseFactory) {
        const service = this;
        service.getUser = getUser;
        service.setUser = setUser;
        service.setUserVehicles = setUserVehicles;
        service.getUserVehicles = getUserVehicles;
        service.getRandomVehicle = getRandomVehicle;
        service.getSelectedChargingPoint = getSelectedChargingPoint;
        service.validateForm = validateForm;
        service.toggleIsCharging = toggleIsCharging;

        init();

        //////// Public
        function getUser() {
            let deferred = $q.defer();
            if(service.user) {
                deferred.resolve(service.user)
            } else {
                UserFactory.getOne(localStorage.getItem('userId')).then(res => deferred.resolve(res.data));
            }
            return deferred.promise;
        }

        function setUser(id) {
            service.user = UserFactory.getOne(id).then(res => {
                localStorage.setItem('userId', res.data.id);
                return res.data;
            });
        }

        function setUserVehicles(arr) {
            service.userVehicles = arr;
            //randomly select a vehicle to be plugged in a random compatible chargerPoint
            service.randomVehicle = service.userVehicles[Math.floor(Math.random() * service.userVehicles.length)];
            service.randomVehicle && UseCaseFactory.getRandomChargingPoint(service.randomVehicle.chargerId).then(res => service.chargingPoint = res.data);
        }

        function  toggleIsCharging() {
            service.isCharging = !service.isCharging;
        }

        function getUserVehicles() {
            return service.userVehicles;
        }

        function getRandomVehicle() {
            return service.randomVehicle;
        }

        function getSelectedChargingPoint() {
            return service.chargingPoint;
        }

        function validateForm(form) {
            if (form.$invalid) {

                angular.forEach(form.$error.required, function (field) {
                    setDirty(field);
                });

                return false;
            }

            return true;

            function setDirty(field) {
                if (field.$setTouched) {
                    field.$setTouched();
                    field.$setDirty();
                } else {
                    angular.forEach(field.$error.required, setDirty);
                }
            }
        }

        //////// Private

        function init() {

        }
    }
})();