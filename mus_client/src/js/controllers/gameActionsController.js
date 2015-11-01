(function() {
    'use strict';

    angular.module('musApp')
        .controller('gameActionsCtrl', ['$scope', 'musSocketService', function($scope, musSocketService) {

            console.log(musSocketService);


            $scope.$on('socket:game-started', function() {
                $scope.game.currentStatus = 'game-started';
            });

            $scope.$on('socket:player-left', function() {
                $scope.game.currentStatus = 'waiting';
            });

            $scope.$on('socket:hand-started', function(event, data) {
                var info = JSON.parse(data),
                    cards = info.playerCards,
                    hand = info.hand,
                    newCards = [[0, 0, 0, 0],
                                [0, 0, 0, 0],
                                [0, 0, 0, 0],
                                [0, 0, 0, 0]
                    ];

                $scope.game.hand = hand;
                console.log('newCards in controller', cards);
                $scope.game.currentStatus = 'hand-started';
                $scope.game.players.forEach(function (player, index) {
                    if($scope.playerName === player) {
                        newCards[index] = cards;
                    }
                });
                $scope.game.cards = newCards;
                console.log('newCards in controller 2', $scope.game.cards);
            });

            $scope.isRoomFull = function() {
                return $scope.game.players.filter(function(player) { return player !== null; }).length === $scope.game.maxPlayers;
            };

        }]);

})();