(function() {
    'use strict';

    angular.module('musApp').directive('chat', function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'src/views/templates/chat.html',
            scope: {
                playerName: '=',
                players: '='
            },
            controller: 'chatCtrl'
        };
    });
})();