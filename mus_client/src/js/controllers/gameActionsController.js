(function() {
    'use strict';

    angular.module('musApp')
        .controller('gameActionsCtrl', ['$scope', 'musSocketService', function($scope, musSocketService) {

            $scope.currentStatus = 'waiting';

            console.log(musSocketService);

            $scope.$on('socket:game-started', function() {
                $scope.currentStatus = 'game-started';
            });

            $scope.$on('socket:update-room', function() {
                if(!$scope.isRoomFull()) {
                    $scope.currentStatus = 'waiting';
                }
            });

            $scope.isRoomFull = function() {
                return $scope.room.game.players.filter(function(player) { return player !== null; }).length === $scope.room.game.maxPlayers;
            };

        }]);

})();