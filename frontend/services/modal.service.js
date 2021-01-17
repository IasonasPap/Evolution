(function () {
    'use strict';

    angular.module('evolution')
        .service('Modal', controller);

    controller.$inject = ['$q', 'ngDialog'];

    function controller($q, ngDialog) {
        const service = this;

        service.alert = alert;
        service.confirm = confirm;
        service.prompt = prompt;
        service.load = load;
        service.error = error;
        service.warn = warn;

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

        /**
         *
         * @param {string} title
         * @param {string} message
         * @param {string} ok
         * @returns {Promise}
         */
        function alert(title, message, ok) {
            return ngDialog.open({
                template: ' <div class="modal-close sp-icons sp-icons-cancel" ng-click="closeThisDialog()"></div>\
                            <div class="alert">\
                                <div class="modal-title" ng-if="ngDialogData.title">{{ngDialogData.title}}</div>\
                                <div class="modal-content" ng-if="ngDialogData.message" ng-bind-html="ngDialogData.message"></div>\
                                <div class="modal-buttons">\
                                    <button class="button cancel" ng-click="closeThisDialog()">{{ngDialogData.ok}}</button>\
                                </div>\
                            </div>',
                plain: true,
                className: 'ngdialog-theme-default',
                appendClassName: 'mc-modal',
                data: {
                    title: title,
                    message: message,
                    ok: ok || 'OK'
                }
            }).closePromise;
        }

        /**
         *
         * @param {string} title
         * @param {string} message
         * @param {string} ok
         * @returns {Promise}
         */
        function error(title, message, ok) {
            return ngDialog.open({
                template: ' <div class="modal-close sp-icons sp-icons-cancel" ng-click="closeThisDialog()"></div>\
                            <div class="alert">\
                                <div class="modal-title">{{ngDialogData.title}}</div>\
                                <div class="modal-content">\
                                    <div class="modal-icon fail">\
                                        <i class="sp-icons sp-icons-exclamation-circle"></i>\
                                    </div>\
                                    <div class="message fail" ng-bind-html="ngDialogData.message"></div>\
                                </div>\
                                <div class="modal-buttons">\
                                    <button class="button cancel" ng-click="closeThisDialog()">{{ngDialogData.ok}}</button>\
                                </div>\
                            </div>',
                plain: true,
                className: 'ngdialog-theme-default',
                appendClassName: 'mc-modal',
                data: {
                    title: title,
                    message: message,
                    ok: ok || 'OK'
                }
            }).closePromise;
        }

        /**
         *
         * @param {string} title
         * @param {string} message
         * @param {string} ok
         * @returns {Promise}
         */
        function warn(title, message, ok) {
            return ngDialog.open({
                template: ' <div class="modal-close sp-icons sp-icons-cancel" ng-click="closeThisDialog()"></div>\
                            <div class="alert">\
                                <div class="modal-title">{{ngDialogData.title}}</div>\
                                <div class="modal-content">\
                                    <div class="modal-icon warn">\
                                        <i class="sp-icons sp-icons-warning"></i>\
                                    </div>\
                                    <div class="message fail" ng-bind-html="ngDialogData.message"></div>\
                                </div>\
                                <div class="modal-buttons">\
                                    <button class="button cancel" ng-click="closeThisDialog()">{{ngDialogData.ok}}</button>\
                                </div>\
                            </div>',
                plain: true,
                className: 'ngdialog-theme-default',
                appendClassName: 'mega-buyouts-modal',
                data: {
                    title: title,
                    message: message,
                    ok: ok || 'OK'
                }
            }).closePromise;
        }

        /**
         *
         *
         * @param {string} title
         * @param {string} message
         * @typedef {Object} ModalServicePromptOptions
         * @property {string} [type] The input type
         * @property {string} [placeholder] The input placeholder
         * @property {Boolean} [adjustHeight] Option to make the textarea to adjust its height to the content
         * @property {string} [value] The initial model value
         * @param {ModalServicePromptOptions} options The input options
         * @param {string} ok
         * @param {string} cancel
         * @returns {Promise}
         */
        function prompt(title, message, options, ok, cancel) {
            return open({
                template: ' <div class="modal-close sp-icons sp-icons-cancel" ng-click="closeThisDialog()"></div>\
                            <div class="alert">\
                                <form name="modalForm" \
                                      ng-submit="modalForm.$valid && closeThisDialog(value)"\
                                      ng-init="value = ngDialogData.options.value">\
                                    <div class="modal-title">{{ngDialogData.title}}</div>\
                                    <div class="modal-content">\
                                        <div ng-bind-html="ngDialogData.message"></div>'
                    + (!options || !angular.isString(options.type) || options.type.toLowerCase() !== 'textarea'
                            ? '                      <sp-input class="modal-input" \
                                                           sp-model="value" \
                                                           type="{{ngDialogData.options.type}}"\
                                                           placeholder="{{ngDialogData.options.placeholder}}"\
                                                           sp-required="true"></sp-input>'
                            : '                      <sp-textarea class="modal-input"\
                                                              sp-model="value"\
                                                              adjust-height="ngDialogData.options.adjustHeight"\
                                                              placeholder="{{ngDialogData.options.placeholder}}"\
                                                              sp-required="true"></sp-textarea>'
                    ) + '                   </div>\
                                    <div class="modal-buttons">\
                                        <button class="button cancel" tabindex="1" \
                                                type="button" \
                                                ng-click="closeThisDialog()">{{ngDialogData.cancel}}</button>\
                                        <button class="button" tabindex="1"\
                                                type="submit"\
                                                ng-disabled="modalForm.$invalid">{{ngDialogData.ok}}</button>\
                                    </div>\
                                </form>\
                            </div>',
                plain: true,
                className: 'ngdialog-theme-default',
                appendClassName: 'mc-modal',
                data: {
                    title: title,
                    message: message,
                    options: options,
                    ok: ok || 'OK',
                    cancel: cancel || 'Cancel'
                }
            });
        }

        /**
         *
         * @param {string} title
         * @param {string} message
         * @param {string} [ok]
         * @param {string} [cancel]
         * @param {'warn' | 'info' | 'delete' | undefined} [type]
         * @returns {Promise}
         */
        function confirm(title, message, ok, cancel, type) {
            return ngDialog.openConfirm({
                template: ' <div class="modal-close sp-icons sp-icons-cancel" ng-click="closeThisDialog()"></div>\
                            <div class="alert">\
                                <div class="modal-title">{{ngDialogData.title}}</div>\
                                <div class="modal-content confirm-modal-content">\
                                    <div class="modal-icon confirm" ng-if="ngDialogData.type === \'info\'"><i class="sp-icons sp-icons-question"></i></div>\
                                    <div class="modal-icon delete" ng-if="ngDialogData.type === \'delete\'"><i class="sp-icons sp-icons-trash"></i></div>\
                                    <div class="modal-icon warn" ng-if="ngDialogData.type === \'warn\'"><i class="sp-icons sp-icons-warning"></i></div>\
                                    <div class="modal-message" ng-bind-html="ngDialogData.message"></div>\
                                </div>\
                                <div class="modal-buttons">\
                                    <button class="button cancel" ng-click="closeThisDialog()">{{ngDialogData.cancel}}</button>\
                                    <button class="button" ng-if="ngDialogData.type !== \'delete\'" ng-click="confirm()">{{ngDialogData.ok}}</button>\
                                    <button class="button red" ng-if="ngDialogData.type == \'delete\'" ng-click="confirm()">{{ngDialogData.ok}}</button>\
                                </div>\
                            </div>',
                plain: true,
                className: 'ngdialog-theme-default',
                appendClassName: 'mc-modal',
                data: {
                    title: title,
                    message: message,
                    ok: ok || 'OK',
                    cancel: cancel || 'Cancel',
                    type: type || 'info'
                }
            });
        }


        /**
         *
         * @param {Promise | Object} promise
         * @param {String} loadMessage
         * @param {String} successMessage
         * @param {String|null} [failMessage]
         * @param {{duration: Integer, showSuccess: Boolean, showFail: Boolean}} [options]
         * @returns {Promise}
         */
        function load(promise, loadMessage, successMessage, failMessage, options) {

            const defaultOptions = {
                duration: 1000,
                showSuccess: true,
                showFail: true
            };
            const opts = angular.extend(defaultOptions, options);

            return ngDialog.open({
                template: ' <div class="modal-close sp-icons sp-icons-cancel" ng-click="closeThisDialog()"></div>\
                            <div class="alert">\
                                <div class="modal-content load-modal-content">\
                                    <div ng-if="isLoading">\
                                        <div class="modal-message loading" ng-if="loadMessage" ng-bind-html="loadMessage"></div>\
                                        <loader></loader>\
                                    </div>\
                                    <div ng-if="!isLoading && success">\
                                        <img width="80" src="frontend/assets/images/check.svg"\>\
                                        <div class="modal-message success" ng-bind-html="successMessage"></div>\
                                        <div class="modal-buttons">\
                                            <button class="button grey-light-bg" ng-click="closeThisDialog()">OK</button>\
                                        </div>\
                                    </div>\
                                    <div ng-if="!isLoading && !success">\
                                        <div class="modal-icon fail"><i class="sp-icons sp-icons-exclamation-circle"></i></div>\
                                        <div class="modal-message fail" ng-bind-html="failMessage"></div>\
                                        <div class="modal-buttons">\
                                            <button class="cancel" ng-click="closeThisDialog()">OK</button>\
                                        </div>\
                                    </div>\
                                </div>\
                            </div>',
                plain: true,
                controller: ['$scope', '$q', '$timeout', function ($scope, $q, $timeout) {
                    $scope.loadMessage = loadMessage;
                    $scope.successMessage = successMessage;
                    $scope.failMessage = failMessage;

                    $scope.isLoading = true;
                    $q.when(promise).then(function () {
                        if (opts.showSuccess) {
                            $scope.success = true;
                            $timeout($scope.closeThisDialog, opts.duration);
                        } else {
                            $scope.closeThisDialog();
                        }
                    }).catch(function (err) {
                        if (opts.showFail) {
                            $scope.success = false;
                            $scope.failMessage = [failMessage, err.data.message].filter(function (v) {
                                return !!v;
                            }).join('<br>');
                        } else {
                            $scope.closeThisDialog();
                        }
                    }).finally(function () {
                        $scope.isLoading = false;
                    });
                }],
                className: 'ngdialog-theme-default',
                appendClassName: 'mc-modal'
            }).closePromise.then(function () {
                return promise;
            });
        }
    }
})();
