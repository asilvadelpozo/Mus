(function() {
    'use strict';

    angular.module('musApp').directive('game', function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'src/views/templates/game.html'
        };
    });
})();