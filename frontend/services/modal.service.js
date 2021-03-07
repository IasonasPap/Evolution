(function () {
    'use strict';

    angular.module('evolution')
        .service('Modal', controller);

    controller.$inject = ['$q', 'ngDialog'];

    function controller($q, ngDialog) {
        const service = this;

        service.open = open;

        /**
         *
         * @param {Object} config
         */
        function open(config) {

            const modalConfig = {
                template: config.template,
                plain: config.plain,
                controller: config.controller,
                controllerAs: config.controllerAs || 'vm',
                onOpenCallback: config.onOpenCallback,
                resolve: config.resolve,
                showClose: config.showClose !== false,
                data: config.data
            };

            if (config.scope) {
                modalConfig.scope = config.scope;
            }
            if (config.appendClassName) {
                modalConfig.appendClassName = 'mc-modal ' + config.appendClassName;
            }

            return ngDialog.open(modalConfig).closePromise.then(function (data) {
                const deferred = $q.defer();

                /**
                 * ['$escape', '$closeButton', '$document'] are the special values that are assigned by ngDialog when
                 * the modal is closed.
                 */
                if (data.value && ['$escape', '$closeButton', '$document'].indexOf(data.value) === -1) {
                    deferred.resolve(data.value);
                }

                return deferred.promise;
            });
        }

    }
})();
