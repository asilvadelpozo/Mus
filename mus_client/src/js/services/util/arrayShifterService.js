(function() {
    'use strict';

    angular.module('musApp')
        .factory('arrayShifterService', function () {
            function shiftArrayNPositionsOnDirection(array, positions, direction) {
                var result = array,
                    i;
                if(array.length <= 1) {
                    return array;
                }
                if(direction === 'right') {
                    for(i = 0; i < positions; i++) {
                        result.unshift(result.pop());
                    }
                }
                if(direction === 'left') {
                    for(i = 0; i < positions; i++) {
                        result.push(result.shift());
                    }
                }
                return result;
            }

            return {
                shiftArrayNPositionsOnDirection: shiftArrayNPositionsOnDirection
            };
        });

})();
