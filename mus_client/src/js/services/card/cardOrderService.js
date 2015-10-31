(function() {
    'use strict';

    angular.module('musApp')
        .factory('cardOrderService', ['arrayShifterService', function (arrayShifterService) {

            function getRelativeHand(game, mainPlayerName) {
                return (game.maxPlayers - game.players.indexOf(mainPlayerName) + game.hand) % game.maxPlayers;
            }

            function didAllCardsChange(oldCards, newCards) {
                var playerIndex = 0,
                    cardIndex = 0,
                    allCardsChanged = true;

                while(playerIndex < 4 && allCardsChanged) {
                    var playerOldCards = oldCards[playerIndex],
                        playerNewCards = newCards[playerIndex];
                    cardIndex = 0;
                    while(cardIndex < playerOldCards.length && allCardsChanged) {
                        if(playerOldCards[cardIndex] !== playerNewCards[cardIndex]) {
                            cardIndex++;
                        }
                        else {
                            allCardsChanged = false;
                        }
                    }
                    playerIndex++;
                }
                return allCardsChanged;
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

            function getDealOrder(oldCards, newCards, game, mainPlayerName) {
                var dealingOrder = [[0, 0, 0, 0],
                                    [0, 0, 0, 0],
                                    [0, 0, 0, 0],
                                    [0, 0, 0, 0]],
                    relativeHand = getRelativeHand(game, mainPlayerName),
                    order = 1;

                // First we shift both arrays 'relativeHand' positions to the left
                arrayShifterService.shiftArrayNPositionsOnDirection(oldCards, relativeHand, 'left');
                arrayShifterService.shiftArrayNPositionsOnDirection(newCards, relativeHand, 'left');

                if(didAllCardsChange(oldCards, newCards)) { // We have to deal alternatively
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

                // Now we shift back to the right 'relativeHand' positions all the arrays
                arrayShifterService.shiftArrayNPositionsOnDirection(oldCards, relativeHand, 'right');
                arrayShifterService.shiftArrayNPositionsOnDirection(newCards, relativeHand, 'right');
                arrayShifterService.shiftArrayNPositionsOnDirection(dealingOrder, relativeHand, 'right');

                // Finally we reverse the order of players 1 and 2 for better visualization effect
                reverseOrder(dealingOrder, 1);
                reverseOrder(dealingOrder, 2);

                return dealingOrder;
            }

            function getDiscardOrder(oldCards, newCards, whoChangedCards) {
                var discardOrder = [[0, 0, 0, 0],
                                    [0, 0, 0, 0],
                                    [0, 0, 0, 0],
                                    [0, 0, 0, 0]],
                    playerWhoDiscarded = whoChangedCards[0]; // When discarding 'whoChangeCards' should only contain 1 element

                oldCards[playerWhoDiscarded].forEach(function (card, cardIndex) {
                    if (newCards[playerWhoDiscarded][cardIndex] !== card) { // The card was discarded
                        discardOrder[playerWhoDiscarded][cardIndex] = 1;
                    }
                });

                return discardOrder;
            }

            function getShowOrder() { // The show order is always the same: all players except the main player have to show at the same time.
                return [[0, 0, 0, 0],
                        [1, 1, 1, 1],
                        [1, 1, 1, 1],
                        [1, 1, 1, 1]];
            }

            function getCardsOrder(oldCards, newCards, game, mainPlayerName, action, whoChangedCards) {
                switch (action) {
                    case 'deal':
                        return getDealOrder(oldCards, newCards, game, mainPlayerName);
                    case 'discard':
                        return getDiscardOrder(oldCards, newCards, whoChangedCards);
                    case 'show':
                        return getShowOrder();
                }
            }

            return {
                getCardsOrder: getCardsOrder
            };
        }]);

})();
