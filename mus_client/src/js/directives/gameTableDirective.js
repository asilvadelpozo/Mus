(function() {
    'use strict';

    angular.module('musApp').directive('gameTable', ['cardDealingOrderService', 'playerLocatorService', 'cardTranslatorService', function(cardDealingOrderService, playerLocatorService, cardTranslatorService) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                playerName: '=',
                room: '='
            },
            templateUrl: 'src/views/templates/game-table.html',
            controller: ['$scope', function($scope) {

                $scope.getPlayer = function(index) {
                    return playerLocatorService.locatePlayer($scope.room.game, $scope.playerName, index);
                };

            }],
            link: function(scope, element) {

                function removeOldClassesFromCard(playerCardsElements, cardIndex) {
                    var classesToRemove = []; // It is necessary to cache the classes. If not, working directly with classlist causes weird errors.
                    for(var i = 0; i < playerCardsElements[cardIndex].classList.length; i++) {
                        var cardClass = playerCardsElements[cardIndex].classList[i];
                        if (cardClass.indexOf('card--') === 0 || cardClass.indexOf('card__') === 0) {
                            classesToRemove.push(cardClass);
                        }
                    }
                    classesToRemove.forEach(function (cardClass) {
                        playerCardsElements[cardIndex].classList.remove(cardClass);
                    });
                }

                function addNewClassesToCard(playerCardsElements, cardIndex, cardDealingOrder, playerPositionOnTheTable, playerRealIndex) {
                    if (scope.room.game.currentStatus !== 'waiting') {
                        playerCardsElements[cardIndex].classList.add('card__order' + cardDealingOrder);
                    }
                    var animationType = (scope.room.game.cards[playerRealIndex][cardIndex] > -1) ? 'in' : 'out';
                    if(scope.room.game.currentStatus !== 'waiting') {
                        playerCardsElements[cardIndex].classList.add('card__animation--' + animationType + '--player' + playerPositionOnTheTable);
                    }
                    playerCardsElements[cardIndex].classList.add('card--' + cardTranslatorService.translateCard(scope.room.game.cards[playerRealIndex][cardIndex]));
                }

                scope.$watch('room.game.cards', function(newCards, oldCards) {

                    if(typeof newCards !== 'undefined' && typeof oldCards !== 'undefined' && typeof scope.playerName !== 'undefined' && scope.playerName !== '') {
                        var dealingOrder = cardDealingOrderService.getDealingOrder(oldCards, newCards, scope.room.game, scope.playerName);

                        for (var playerPositionOnTheTable = 0; playerPositionOnTheTable < scope.room.game.maxPlayers; playerPositionOnTheTable++) {
                            var player = playerLocatorService.locatePlayer(scope.room.game, scope.playerName, playerPositionOnTheTable),
                                playerRealIndex = scope.room.game.players.indexOf(player),
                                dealingOrderForPlayer = dealingOrder[playerRealIndex],
                                playerCardsElements = element[0].querySelector('#player' + playerPositionOnTheTable + '-cards').children;

                            dealingOrderForPlayer.forEach(function (cardDealingOrder, cardIndex) {
                                if (cardDealingOrder !== 0) { // If the card has changed...
                                    removeOldClassesFromCard(playerCardsElements, cardIndex);
                                    addNewClassesToCard(playerCardsElements, cardIndex, cardDealingOrder, playerPositionOnTheTable, playerRealIndex);
                                }
                            });
                        }
                    }
                });
            }
        };
    }]);
})();