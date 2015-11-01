(function() {
    'use strict';

    angular.module('musApp').directive('gameTable', ['$timeout', 'cardManagerService', 'playerLocatorService', function($timeout, cardManagerService, playerLocatorService) {
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

                var animationTime = 200, // 0.20s is the time it take for the animation of dealing and discarding. It must be always the same as in _deck.scss
                    delay = 500;

                function isRoomFull() {
                    return scope.room.game.players.filter(function(player) { return player !== null; }).length === scope.room.game.maxPlayers;
                }

                function resetCardSide(card) {
                    var classesToRemove = []; // It is necessary to cache the classes. If not, working directly with classlist causes weird errors.
                    for(var i = 0; i < card.classList.length; i++) {
                        var cardClass = card.classList[i];
                        if (cardClass !== 'card--front' && cardClass !== 'card--back' && (cardClass.indexOf('card--') === 0 || cardClass.indexOf('card__') === 0)) {
                            classesToRemove.push(cardClass);
                        }
                    }
                    classesToRemove.forEach(function (cardClass) {
                        card.classList.remove(cardClass);
                    });
                }

                function resetCard(cardElement) {
                    var cardFront = cardElement.querySelector('.card--front'),
                        cardBack = cardElement.querySelector('.card--back');

                    resetCardSide(cardFront);
                    resetCardSide(cardBack);

                    cardElement.classList.remove('card--flip');
                }

                function resetCards() {
                    for(var playerIndex = 0; playerIndex < scope.room.game.maxPlayers; playerIndex++) {
                        var playerCardsElements = element[0].querySelector('#player' + playerIndex + '-cards').children;
                        for(var cardIndex = 0; cardIndex < playerCardsElements.length; cardIndex++) {
                            resetCard(playerCardsElements[cardIndex]);
                        }
                    }
                }

                function dealCard(playerCardsElements, cardIndex, playerIndex, cardOrder, cardManagerInfo) {
                    var cardContainer = playerCardsElements[cardIndex],
                        cardFront = cardContainer.querySelector('.card--front'),
                        cardBack = cardContainer.querySelector('.card--back');

                    // Start reverse card animation: this happens for all the cards.
                    cardBack.classList.add('card__animation--in--player' + playerIndex);
                    cardBack.classList.add('card__order' + cardOrder);
                    cardBack.classList.add('card--reverse');

                    // If the card has to be flipped: we have to wait until it is dealt and after manage card front and card container.
                    if (cardManagerInfo.cardsFlip[playerIndex][cardIndex]) {
                        $timeout(function () {
                            cardFront.classList.add('card--' + cardManagerInfo.cardsTranslation[playerIndex][cardIndex]);
                            cardContainer.classList.toggle('card--flip');
                        }, (cardOrder * animationTime) + delay);
                    }
                }

                scope.$watch('room.game.cards', function(newCards, oldCards) {

                    if(typeof newCards !== 'undefined' && typeof oldCards !== 'undefined' && typeof scope.playerName !== 'undefined' && scope.playerName !== '') {

                        if(!isRoomFull()) {
                            resetCards();
                        } else {
                            var cardManagerInfo = cardManagerService.manageCards(oldCards, newCards, scope.room.game, scope.playerName);

                            switch(cardManagerInfo.action) {
                                case 'deal':
                                    var dealingOrder = cardManagerInfo.cardsOrder;
                                    dealingOrder.forEach(function(playerDealingOrder, playerIndex) {
                                        var playerCardsElements = element[0].querySelector('#player' + playerIndex + '-cards').children;
                                        playerDealingOrder.forEach(function(cardOrder, cardIndex) {
                                            if(cardOrder > 0) {
                                                dealCard(playerCardsElements, cardIndex, playerIndex, cardOrder, cardManagerInfo);
                                            }
                                        });
                                    });
                                    break;
                            }
                        }
                    }
                });
            }
        };
    }]);
})();