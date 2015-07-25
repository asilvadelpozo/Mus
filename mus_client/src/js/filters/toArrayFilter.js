(function() {
    'use strict';

    angular.module('musApp')
        .filter('toArray', function() {
            return function(input, obj) {
                for(var key in obj) {
                    input.push(obj[key]);
                }
                return input;
            };
        });
})();
