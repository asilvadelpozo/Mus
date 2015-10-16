(function() {
    'use strict';

    angular.module('musApp')
        .controller('gameTableCtrl', ['$scope', 'playerLocatorService', function($scope, playerLocatorService) {

            $scope.getPlayer = function(index) {
                return playerLocatorService.locatePlayer($scope.room, $scope.playerName, index);
            };

            $scope.getCardType = function(typeInt) {
                switch (typeInt) {
                    case 0:
                        return 'o';
                    case 1:
                        return 'c';
                    case 2:
                        return 'e';
                    case 3:
                        return 'b';
                }
            };

            $scope.getCardsClassesForPlayer = function(index) {
                var cardClasses = ['card--empty', 'card--empty', 'card--empty', 'card--empty'];
                if(typeof $scope.room !== 'undefined' &&
                    typeof $scope.room.game !== 'undefined' &&
                    $scope.playerName !== '') {
                    var indexOfMainPlayer = $scope.room.game.players.indexOf($scope.playerName),
                        realTargetPlayerIndex = (indexOfMainPlayer + index) % $scope.room.game.maxPlayers;
                    if(realTargetPlayerIndex !== -1) {
                        $scope.room.game.cards[realTargetPlayerIndex].map(function (card, index) {
                            if (card === -1) {
                                cardClasses[index] = 'card--empty';
                            } else {
                                if (card === 0) {
                                    cardClasses[index] ='card--reverse';
                                } else {
                                    var number = card % 10,
                                        type = Math.floor(card / 10);
                                    if (number === 0) {
                                        number = 10;
                                        type = type - 1;
                                    }
                                    cardClasses[index] ='card--' + $scope.getCardType(type) + number;
                                }
                            }

                        });
                    }
                }
                return cardClasses;
            };

        }]);

})();