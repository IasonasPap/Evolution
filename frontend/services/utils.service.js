(function () {
    'use strict';

    angular.module('evolution')
        .service('Utils', controller);

    controller.$inject = ['UserFactory'];

    function controller(UserFactory) {
        const service = this;
        service.getUser = getUser;
        service.setUser = setUser;

        init();

        //////// Public
        function getUser() {
            return service.user;
        }

        function setUser(id) {
            service.user = UserFactory.getOne(id).then(res => {
                localStorage.setItem('userId', res.data.id);
                return res.data;
            });
        }

        //////// Private

        function init() {

        }
    }
})();