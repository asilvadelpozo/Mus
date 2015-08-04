(function() {
    'use strict';

    angular.module('musApp')
        .filter('withoutNull', function() {
            return function(input) {
                var result = [];
                input.forEach(function(entry) {
                    if(entry !== null) {
                        result.push(entry);
                    }
                });
                return result;
            };
        });
})();
