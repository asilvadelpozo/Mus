(function() {
    'use strict';

    angular.module('musApp')
        .controller('gameCtrl', ['$scope', function($scope) {

            $scope.getPlayer = function(index) {
                if(typeof $scope.room.players !== 'undefined') {
                    var indexOfMainPlayer = $scope.room.players.indexOf($scope.playerName),
                        realIndex = (indexOfMainPlayer + index) % $scope.room.maxPlayers;
                    return $scope.room.players[realIndex];
                }
                return null;
            };

        }]);

})();