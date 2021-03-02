(function () {
    'use strict';

    angular.module('evolution')
        .controller('appController', appController);


    appController.$inject = ['$scope', '$window'];

    function appController($scope, $window) {
        const vm = this;

        init();

        /////// Private functions

        function init() {
            vm.year = moment().year();

            if (isSmartDevice($window)) {
                angular.element($window.document.body).addClass('smart no-transition');
            }
        }

        function isSmartDevice($window) {
            const ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
            return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
        }
    }
})();

