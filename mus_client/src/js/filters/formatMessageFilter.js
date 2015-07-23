(function() {
    'use strict';

    angular.module('musApp')
        .filter('formatMessage', function() {
            return function(playerName, message) {
                return new Date().toLocaleTimeString() + ' - ' + playerName + ': ' + message + '\n';
            };
        });
})();
