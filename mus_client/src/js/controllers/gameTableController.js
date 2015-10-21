(function() {
    'use strict';

    angular.module('musApp')
        .controller('gameTableCtrl', ['$scope', 'playerLocatorService', function($scope, playerLocatorService) {

            $scope.getPlayer = function(index) {
                return playerLocatorService.locatePlayer($scope.room.game, $scope.playerName, index);
            };

            //$scope.getCardsClassesForPlayer = function(index) {
            //    var cardClasses = ['card--empty', 'card--empty', 'card--empty', 'card--empty'];
            //    if(typeof $scope.room !== 'undefined' &&
            //        typeof $scope.room.game !== 'undefined' &&
            //        $scope.playerName !== '') {
            //        var indexOfMainPlayer = $scope.room.game.players.indexOf($scope.playerName),
            //            realTargetPlayerIndex = (indexOfMainPlayer + index) % $scope.room.game.maxPlayers;
            //        if(realTargetPlayerIndex !== -1) {
            //            $scope.room.game.cards[realTargetPlayerIndex].map(function (card, index) {
            //                cardClasses[index] ='card--' + cardTranslatorService.translateCard(card);
            //            });
            //        }
            //    }
            //    return cardClasses;
            //};

        }]);

})();