(function() {
    'use strict';

    angular.module('musApp')
        .controller('infoModalCtrl', ['$scope', '$modalInstance', 'infoData', function ($scope, $modalInstance, infoData) {

            $scope.infoData = infoData;

            $scope.ok = function () {
                $modalInstance.close();
            };
        }]);
})();