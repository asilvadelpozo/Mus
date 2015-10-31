(function() {
    'use strict';

    angular.module('musApp')
        .factory('cardTranslatorService', function () {

            function getCardType(typeInt) {
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
            }

            function translateCard(card) {
                switch(card) {
                    case -1:
                        return '';
                    case 0:
                        return 'reverse';
                    default:
                        var number = card % 10,
                            type = Math.floor(card / 10);
                        if (number === 0) {
                            number = 10;
                            type = type - 1;
                        }
                        return getCardType(type) + number;
                }
            }

            function getCardsTranslation(cards) {
                var translatedCards = [];

                cards.forEach(function(playerCards, playerIndex) {
                    translatedCards.push([]);
                    playerCards.forEach(function(card) {
                        translatedCards[playerIndex].push(translateCard(card));
                    });
                });

                return translatedCards;
            }

            return {
                getCardsTranslation: getCardsTranslation
            };
        });

})();
