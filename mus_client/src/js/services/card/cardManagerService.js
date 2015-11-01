(function() {
    'use strict';

    angular.module('musApp')
        .factory('cardManagerService', ['arrayShifterService', 'cardOrderService', 'cardTranslatorService', function (arrayShifterService, cardOrderService, cardTranslatorService) {

            function determineWhoChangedCards(oldCards, newCards) {
                var whoChanged = [];

                oldCards.forEach(function(oldPlayerCards, index) {
                    if(oldPlayerCards.sort().join(',') !== newCards[index].sort().join(',')) {
                        whoChanged.push(index);
                    }
                });

                return whoChanged;
            }

            function determineAction(howManyChanged) {
                switch (howManyChanged) {
                    case 4:
                        return 'deal';
                    case 1:
                        return 'discard';
                    case 3:
                        return 'show';
                }
            }

            function determineFlip(action, whoChangedCards) {
                var cardFlip = [[false, false, false, false],
                                [false, false, false, false],
                                [false, false, false, false],
                                [false, false, false, false]
                               ];
                switch (action) {
                    case 'deal': // When dealing, only player 0 flip cards
                        cardFlip[0] = [true, true, true, true];
                        break;
                    case 'discard': // When discarding, only if it was player 1 it must be flipped
                        if(whoChangedCards[0] === 0) {
                            cardFlip[0] = [true, true, true, true];
                        }
                        break;
                    case 'show': // When showing, all players but 0 should flip
                        cardFlip[1] = [true, true, true, true];
                        cardFlip[2] = [true, true, true, true];
                        cardFlip[3] = [true, true, true, true];
                        break;
                }
                return cardFlip;
            }

            function manageCards(oldCards, newCards, game, mainPlayerName) {
                var whoChangedCards,
                    action,
                    cardsOrder,
                    cardsFlip,
                    cardsTranslation,
                    realPlayerIndex = game.players.indexOf(mainPlayerName),
                    relativeOldCards = arrayShifterService.shiftArrayNPositionsOnDirection(oldCards, realPlayerIndex, 'left'),
                    relativeNewCards = arrayShifterService.shiftArrayNPositionsOnDirection(newCards, realPlayerIndex, 'left');

                whoChangedCards = determineWhoChangedCards(relativeOldCards, relativeNewCards);

                action = determineAction(whoChangedCards.length);

                cardsOrder = cardOrderService.getCardsOrder(relativeOldCards, relativeNewCards, game, mainPlayerName, action, whoChangedCards);

                cardsFlip = determineFlip(action, whoChangedCards);

                cardsTranslation = cardTranslatorService.getCardsTranslation(relativeNewCards);

                return {
                    'action': action,
                    'cardsOrder': cardsOrder,
                    'cardsFlip': cardsFlip,
                    'cardsTranslation': cardsTranslation
                };
            }

            return {
                manageCards: manageCards
            };
        }]);

})();
