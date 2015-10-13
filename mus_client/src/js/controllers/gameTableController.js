(function() {
    'use strict';

    angular.module('musApp')
        .controller('gameTableCtrl', ['$scope', 'playerLocatorService', function($scope, playerLocatorService) {

            $scope.getPlayer = function(index) {
                return playerLocatorService.locatePlayer($scope.room, $scope.playerName, index);
            };

        }]);

})();