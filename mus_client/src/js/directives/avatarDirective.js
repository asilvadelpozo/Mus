(function() {
    'use strict';

    angular.module('musApp').directive('avatar', function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'src/views/templates/avatar.html',
            scope: {
                playerName: '=',
                players: '='
            },
            controller: ['$scope', function ($scope) {
                $scope.getPlayerIndexClass = function() {
                    if(typeof $scope.players === 'undefined' || $scope.playerName === null) {
                        return 'avatar__player--null';
                    }
                    return 'avatar__player--' + $scope.players.indexOf($scope.playerName);
                };
            }]
        };
    });
})();