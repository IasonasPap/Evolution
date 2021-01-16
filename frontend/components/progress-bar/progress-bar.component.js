(function () {

    angular.module('evolution')
        .directive('progressBar', progressBarDirective);

    function progressBarDirective() {
        return {
            restrict: 'E',
            scope: {
                curVal: '@',
                maxVal: '@',
                bg: '@',
                label: '@?',
                decimals: '@?',
            },
            template: getTemplate,
            controller: controller,
            link: link
        };

        function link(scope, element) {
            const bar = element[0].querySelector('.progress-bar');
            const innerBar = element[0].querySelector('.progress-bar-bar');
            innerBar.style.transition = 'all linear 0.4s'

            function updateProgress() {
                const curVal = scope.curVal && parseFloat(scope.curVal) || 0;
                const maxVal = parseFloat(scope.maxVal);
                let progress = 0;

                if (scope.maxVal) {
                    progress = (Math.min(curVal, maxVal) / maxVal) * bar.clientWidth;
                }

                innerBar.style.width = progress + 'px';
                innerBar.style.backgroundColor = scope.bg;
            }

            scope.$watchGroup([
                'curVal',
                'maxVal',
                function () {
                    return bar.clientWidth;
                }
            ], updateProgress);
        }
    }

    controller.$inject = ['$scope'];

    function controller($scope) {
        $scope.getCurVal = function () {
            const decimals = parseInt($scope.decimals) || 2;

            const pow = Math.pow(10, decimals);
            return Math.round(parseFloat($scope.curVal) * pow) / pow;
        }
    }

    function getTemplate() {
        return '<div class="progress-bar">\
                    <div class="progress-bar-bar"></div>\
                    <div class="progress-bar-label">{{getCurVal()}}%{{label ? " " + label : ""}}</div>\
                </div>';
    }
})();