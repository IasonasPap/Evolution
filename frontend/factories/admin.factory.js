(function () {
    'use strict';

    angular.module('evolution')
        .factory('AdminFactory', factory);

    factory.$inject = ['$http', 'Api', 'Utils'];

    function factory($http, Api, Utils) {

        const api = Api.api + '/admin';

        return {
            uploadSessions: uploadSessions
        };

        //////// Public
        function uploadSessions(file) {
            return Utils.postFormData(api + '/system/sessionsupd', file);
        }

    }
})();