(function() {
    'use strict';

    angular.module('musApp')
        .controller('infoModalCtrl', function ($scope, $modalInstance, infoData) {

            $scope.infoData = infoData;

            $scope.ok = function () {
                $modalInstance.close();
            };
        });
})();