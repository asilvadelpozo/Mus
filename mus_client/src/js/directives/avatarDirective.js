(function() {
    'use strict';

    angular.module('musApp').directive('avatar', function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'src/views/templates/avatar.html',
            scope: {
                playerName: '=',
                players: '=',
                mainPlayer: '='
            },
            controller: ['$scope', function ($scope) {
                $scope.getPlayerIndexClass = function() {
                    console.log('avatarPlayers: ', $scope.players);
                    if(typeof $scope.players === 'undefined' || $scope.playerName === null) {
                        return 'avatar__player--null';
                    }
                    return 'avatar__player--' + $scope.players.indexOf($scope.playerName);
                };

                $scope.getPlayerName = function() {
                    if($scope.mainPlayer) {
                        return 'Yo';
                    }
                    return $scope.playerName;
                };
            }]
        };
    });
})();