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

            $scope.$on('socket:hand-started', function(event, data) {
                var cards = JSON.parse(data);
                $scope.room.game.players.forEach(function (player, index) {
                    if($scope.playerName === player) {
                        $scope.room.game.cards[index] = cards;
                    }
                    else {
                        $scope.room.game.cards[index] = [0, 0, 0, 0];
                    }
                });
            });

            $scope.isRoomFull = function() {
                return $scope.room.game.players.filter(function(player) { return player !== null; }).length === $scope.room.game.maxPlayers;
            };

        }]);

})();