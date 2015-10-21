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
            controller: 'gameTableCtrl',
            link: function(scope, element) {

                scope.$watch('room.game.cards', function(newCards, oldCards) {

                    if(typeof newCards !== 'undefined' && typeof oldCards !== 'undefined' && typeof scope.playerName !== 'undefined' && scope.playerName !== '') {
                        console.log('newCards');
                        console.log(newCards);
                        console.log('oldCards');
                        console.log(oldCards);
                        var dealingOrder = cardDealingOrderService.getDealingOrder(oldCards, newCards, scope.room.game, scope.playerName);

                        console.log('dealingOrder');
                        console.log(dealingOrder);

                        console.log('room');
                        console.log(scope.room);
                        console.log('game');
                        console.log(scope.room);
                        console.log('players');
                        console.log(scope.room.game.players);
                        console.log('playerName');
                        console.log(scope.playerName);



                        for (var i = 0; i < 4; i++) {
                            var player = playerLocatorService.locatePlayer(scope.room.game, scope.playerName, i);
                            console.log(player);
                            var realIndexOfPlayer = scope.room.game.players.indexOf(player);
                            var dealingOrderForPlayer = dealingOrder[realIndexOfPlayer];
                            var playerCardsElement = element[0].querySelector('#player' + i + '-cards').children;
                            console.log('playerCardsElement');
                            console.log(playerCardsElement);
                            dealingOrderForPlayer.forEach(function (cardOrder, cardIndex) {
                                if (cardOrder !== 0) {
                                    playerCardsElement[cardIndex].classList.remove('card--empty');
                                    playerCardsElement[cardIndex].classList.add('card__animation--player' + i);
                                    playerCardsElement[cardIndex].classList.add('card--order' + cardOrder);
                                    playerCardsElement[cardIndex].classList.add('card--' + cardTranslatorService.translateCard(scope.room.game.cards[realIndexOfPlayer][cardIndex]));
                                }
                            });
                        }
                    }
                });

            }
            //link: function(scope, element) {
            //
            //    var getPlayer = function(index) {
            //        return playerLocatorService.locatePlayer(scope.room.game, scope.playerName, index);
            //    };
            //
            //    scope.$watch(
            //        function() {
            //            if(typeof scope.room.game !== 'undefined') {
            //                return scope.room.game.players.filter(function (player) {
            //                    return player !== null;
            //                }).length;
            //            }
            //            return 0;
            //        },
            //        function() {
            //            console.log('Cambio en la mesa');
            //            angular.element(element)[0].querySelector('#player1').setAttribute('data-player-name', getPlayer(1));
            //            angular.element(element)[0].querySelector('#player2').setAttribute('data-player-name', getPlayer(2));
            //            angular.element(element)[0].querySelector('#player3').setAttribute('data-player-name', getPlayer(3));
            //        });
            //
            //
            //
            //
            //}
        };
    }]);
})();