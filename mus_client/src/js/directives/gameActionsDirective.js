(function() {
    'use strict';

    angular.module('musApp').directive('gameActions', function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'src/views/templates/game-actions.html',
            scope: {
                game : '=',
                playerName: '='
            },
            controller: 'gameActionsCtrl'
        };
    });

})();