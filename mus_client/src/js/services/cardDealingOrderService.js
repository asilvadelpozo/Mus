(function() {
    'use strict';

    angular.module('musApp')
        .factory('cardDealingOrderService', ['playerLocatorService', function (playerLocatorService) {

             function shiftArrayNPositionsOnDirection(array, positions, direction) {
                 var i;
                if(direction === 'right') {
                    for(i = 0; i < positions; i++) {
                        array.unshift(array.pop());
                    }
                }
                if(direction === 'left') {
                    for(i = 0; i < positions; i++) {
                        array.push(array.shift());
                    }
                }
            }

            function reverseOrder(array, index) {
                var biggerThan0Reversed = array[index].filter(function(item) {
                    return item > 0;
                }).reverse();
                array[index].forEach(function(elem, elemIndex) {
                    if(elem > 0) {
                        array[index][elemIndex] = biggerThan0Reversed.shift();
                    }
                });
            }

            function getDealingOrder(oldCards, newCards, game, mainPlayerName) {
                var dealingOrder = [[0, 0, 0, 0],
                                    [0, 0, 0, 0],
                                    [0, 0, 0, 0],
                                    [0, 0, 0, 0]],
                    order = 1;

                // First we shift both arrays 'hand' positions to the left
                shiftArrayNPositionsOnDirection(oldCards, game.hand, 'left');
                shiftArrayNPositionsOnDirection(newCards, game.hand, 'left');

                if(game.currentStatus === 'hand-started') { // We have to deal alternatively
                    for(var cardIndex = 0; cardIndex < 4; cardIndex++) {
                        for(var playerIndex = 0; playerIndex < oldCards.length; playerIndex++) {
                            dealingOrder[playerIndex][cardIndex] = order;
                            order++;
                        }
                    }
                } else { // We have to deal normally
                    oldCards.forEach(function (playerCards, playerIndex) {
                        playerCards.forEach(function (card, cardIndex) {
                            if (newCards[playerIndex][cardIndex] !== card) { // The card did change
                                dealingOrder[playerIndex][cardIndex] = order;
                                order++;
                            }
                        });
                    });
                }

                // Now we shift back to the right 'hand' positions all the arrays
                shiftArrayNPositionsOnDirection(oldCards, game.hand, 'right');
                shiftArrayNPositionsOnDirection(newCards, game.hand, 'right');
                shiftArrayNPositionsOnDirection(dealingOrder, game.hand, 'right');

                // Finally we reverse the order of players 1 and 2 for better visualization effect
                reverseOrder(dealingOrder, game.players.indexOf(playerLocatorService.locatePlayer(game, mainPlayerName, 1)));
                reverseOrder(dealingOrder, game.players.indexOf(playerLocatorService.locatePlayer(game, mainPlayerName, 2)));

                return dealingOrder;
            }

            return {
                getDealingOrder: getDealingOrder
            };
        }]);

})();
