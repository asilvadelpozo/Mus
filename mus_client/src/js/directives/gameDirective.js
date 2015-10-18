(function() {
    'use strict';

    angular.module('musApp').directive('game', function() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                playerName: '=',
                room: '='
            },
            templateUrl: 'src/views/templates/game.html',
            controller: ['$scope', 'playerLocatorService', function($scope, playerLocatorService) {

                $scope.getPlayer = function(index) {
                    return playerLocatorService.locatePlayer($scope.room, $scope.playerName, index);
                };

            }]
            //link: function(scope, element) {
            //
            //    var getPlayer = function(index) {
            //        return playerLocatorService.locatePlayer(scope.room, scope.playerName, index);
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
            //            console.log(angular.element(element)[0].querySelector('#player0'));
            //            angular.element(element)[0].querySelector('#player0').setAttribute('data-player-name', getPlayer(0));
            //            angular.element(element)[0].querySelector('#player1').setAttribute('data-player-name', getPlayer(1));
            //            angular.element(element)[0].querySelector('#player2').setAttribute('data-player-name', getPlayer(2));
            //            angular.element(element)[0].querySelector('#player3').setAttribute('data-player-name', getPlayer(3));
            //        });
            //
            //
            //}
        };
    });
})();