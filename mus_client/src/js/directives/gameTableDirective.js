(function() {
    'use strict';

    angular.module('musApp').directive('gameTable', function() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                playerName: '=',
                room: '='
            },
            templateUrl: 'src/views/templates/game-table.html',
            controller: 'gameTableCtrl'
        };
    });
})();