(function() {
    'use strict';

    /* This filter will transform this kind of object:
     {
     "key1": "value1",
     "key2": "value2"
     }
     to this array:
     [
     "key1", "key2"
     ]
     */
    angular.module('musApp')
        .filter('getKeys', function() {
            return function(input, obj) {
                for(var key in obj) {
                    input.push(key);
                }
                return input;
            };
        });
})();
