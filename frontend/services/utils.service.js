(function () {
    'use strict';

    angular.module('evolution')
        .service('Utils', controller);

    controller.$inject = ['$q', 'UserFactory'];

    function controller($q, UserFactory) {
        const service = this;
        service.getUser = getUser;
        service.setUser = setUser;
        service.setUserVehicles = setUserVehicles;
        service.getUserVehicles = getUserVehicles;

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
        }

        function getUserVehicles() {
            return service.userVehicles;
        }

        //////// Private

        function init() {

        }
    }
})();