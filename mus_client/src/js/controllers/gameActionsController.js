(function () {
    'use strict';

    angular.module('musApp')
        .controller('gameActionsCtrl', ['$scope', 'musSocketService', function ($scope, musSocketService) {

            console.log(musSocketService);

            //TODO: Remove this later
            $scope.players = [];
            $scope.playerSelected = '';

            //TODO: Remove this later
            $scope.show = function() {
                var tempCards = [[0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ];
                $scope.game.players.forEach(function (player, index) {
                    if ($scope.playerName !== player) {
                        tempCards[index] = [(4 * index) + 1, (4 * index) + 2, (4 * index) + 3, (4 * index) + 4];
                    } else {
                        tempCards[index] = $scope.game.cards[index];
                    }
                });
                $scope.game.cards = tempCards;
            };

            //TODO: Remove this later
            $scope.discard = function() {
                var tempCards = [[0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ];
                $scope.game.players.forEach(function (player, index) {
                    if ($scope.playerSelected === player) {
                        tempCards[index] = [-1, -1, -1, -1];
                    } else {
                        tempCards[index] = $scope.game.cards[index];
                    }
                });
                $scope.game.cards = tempCards;
            };

            //TODO: Remove this later
            $scope.updateSelectedPlayer = function(selected){
                $scope.playerSelected = selected;
            };

            $scope.$on('socket:game-started', function () {
                $scope.game.currentStatus = 'game-started';
                //TODO: Remove this later
                $scope.players = [];
                $scope.game.players.forEach(function(playerName) {
                    $scope.players.push(playerName);
                });
                $scope.playerSelected = $scope.players[0];
            });

            $scope.$on('socket:player-left', function () {
                $scope.game.currentStatus = 'waiting';
            });

            $scope.$on('socket:hand-started', function (event, data) {
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
                    if ($scope.playerName === player) {
                        newCards[index] = cards;
                    }
                });
                $scope.game.cards = newCards;
                console.log('newCards in controller 2', $scope.game.cards);
            });

            $scope.isRoomFull = function () {
                return $scope.game.players.filter(function (player) {
                        return player !== null;
                    }).length === $scope.game.maxPlayers;
            };

        }]);

})();