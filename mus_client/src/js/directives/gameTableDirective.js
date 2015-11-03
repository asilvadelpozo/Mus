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
                    flipTime = 600,// 0.6s is the time taken for a flip. It must be always the same as in _deck.scss (check flipper class).
                    delay = 500;

                function isRoomFull() {
                    return scope.room.game.players.filter(function(player) { return player !== null; }).length === scope.room.game.maxPlayers;
                }

                function resetCardSide(cardSide, cardTranslationIncluded) {
                    var classesToRemove = []; // It is necessary to cache the classes. If not, working directly with classlist causes weird errors.
                    for(var i = 0; i < cardSide.classList.length; i++) {
                        var cardClass = cardSide.classList[i];
                        if (cardClass !== 'card--front' && cardClass !== 'card--back' && ((cardTranslationIncluded && cardClass.indexOf('card--') === 0) || cardClass.indexOf('card__') === 0)) {
                            classesToRemove.push(cardClass);
                        }
                    }
                    classesToRemove.forEach(function (cardClass) {
                        cardSide.classList.remove(cardClass);
                    });
                }

                function resetCard(cardElement) {
                    var cardFront = cardElement.querySelector('.card--front'),
                        cardBack = cardElement.querySelector('.card--back');

                    resetCardSide(cardFront, true);
                    resetCardSide(cardBack, true);

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

                function triggerDealAnimation(cardBack, playerIndex, cardOrder) {
                    cardBack.classList.add('card__animation--in--player' + playerIndex);
                    cardBack.classList.add('card__order' + cardOrder);
                    cardBack.classList.add('card--reverse');
                }

                function triggerDiscardAnimation(cardBack, playerIndex, cardOrder) {
                    cardBack.classList.add('card__animation--out--player' + playerIndex);
                    cardBack.classList.add('card__order' + cardOrder);
                    $timeout(function () {
                        resetCardSide(cardBack, true);
                    }, (cardOrder * animationTime) + delay);
                }

                function deal(playerCardsElements, cardIndex, playerIndex, cardOrder, cardManagerInfo) {
                    var cardContainer = playerCardsElements[cardIndex],
                        cardFront = cardContainer.querySelector('.card--front'),
                        cardBack = cardContainer.querySelector('.card--back');

                    // Start reverse card animation: this happens for all the cards.
                    triggerDealAnimation(cardBack, playerIndex, cardOrder);

                    // When the deal animation is finished we flip the card if needed and clean animation and order classes
                    $timeout(function () {
                        if (cardManagerInfo.cardsFlip[playerIndex][cardIndex]) {
                            cardFront.classList.add('card--' + cardManagerInfo.cardsTranslation[playerIndex][cardIndex]);
                            cardContainer.classList.toggle('card--flip');
                        }
                        resetCardSide(cardBack, false);
                    }, (cardOrder * animationTime) + delay);
                }

                function discard(playerCardsElements, cardIndex, playerIndex, cardOrder, cardManagerInfo) {
                    var cardContainer = playerCardsElements[cardIndex],
                        cardFront = cardContainer.querySelector('.card--front'),
                        cardBack = cardContainer.querySelector('.card--back');

                    // Only if the card needs to be flipped
                    if (cardManagerInfo.cardsFlip[playerIndex][cardIndex]) {
                        cardContainer.classList.toggle('card--flip');

                        // After the flip animation is done we remove the class card on the front and we trigger the discard animation
                        $timeout(function () {
                            resetCardSide(cardFront, true);
                            triggerDiscardAnimation(cardBack, playerIndex, cardOrder);

                        }, (cardOrder * flipTime));
                    } else { // We just need to start the discard animation
                        triggerDiscardAnimation(cardBack, playerIndex, cardOrder);
                    }
                }

                function show(playerCardsElements, cardIndex, playerIndex, cardOrder, cardManagerInfo) {
                    var cardContainer = playerCardsElements[cardIndex],
                        cardFront = cardContainer.querySelector('.card--front');

                    // First we flip the card in case it has to be flipped
                    if (cardManagerInfo.cardsFlip[playerIndex][cardIndex]) {
                        cardFront.classList.add('card--' + cardManagerInfo.cardsTranslation[playerIndex][cardIndex]);
                        cardContainer.classList.toggle('card--flip');
                    }
                }

                function executeActionOnCards(cardManagerInfo, callback) {
                    var dealingOrder = cardManagerInfo.cardsOrder;
                    dealingOrder.forEach(function (playerDealingOrder, playerIndex) {
                        var playerCardsElements = element[0].querySelector('#player' + playerIndex + '-cards').children;
                        playerDealingOrder.forEach(function (cardOrder, cardIndex) {
                            if (cardOrder > 0) { // The card did change
                                callback(playerCardsElements, cardIndex, playerIndex, cardOrder, cardManagerInfo);
                            }
                        });
                    });
                }

                scope.$watch('room.game.cards', function(newCards, oldCards) {

                    if(typeof newCards !== 'undefined' && typeof oldCards !== 'undefined' && typeof scope.playerName !== 'undefined' && scope.playerName !== '') {

                        if(!isRoomFull()) {
                            resetCards();
                        } else {
                            var cardManagerInfo = cardManagerService.manageCards(oldCards, newCards, scope.room.game, scope.playerName);

                            switch(cardManagerInfo.action) {
                                case 'deal':
                                    executeActionOnCards(cardManagerInfo, deal);
                                    break;
                                case 'discard':
                                    executeActionOnCards(cardManagerInfo, discard);
                                    break;
                                case 'show':
                                    executeActionOnCards(cardManagerInfo, show);
                                    break;
                            }
                        }
                    }
                });
            }
        };
    }]);
})();