(function() {
    'use strict';

    angular.module('musApp').directive('message', function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'src/views/templates/message.html',
            scope: {
                playerName: '=',
                message: '=',
                players: '='
            },
            controller: ['$scope', function ($scope) {
                $scope.getPlayerIndexClass = function() {
                    if($scope.players.indexOf($scope.message.playerName) === -1) {
                        return 'message__player--room';
                    }
                    return 'message__player--' + $scope.players.indexOf($scope.message.playerName);
                };
            }]
        };
    });
})();