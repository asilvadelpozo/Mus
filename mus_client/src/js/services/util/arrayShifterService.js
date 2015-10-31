(function() {
    'use strict';

    angular.module('musApp')
        .factory('arrayShifterService', function () {
            function shiftArrayNPositionsOnDirection(array, positions, direction) {
                var i;
                if(direction === 'right') {
                    for(i = 0; i < positions; i++) {
                        array.unshift(array.pop());
                    }
                }
                if(direction === 'left') {
                    for(i = 0; i < positions; i++) {
                        array.push(array.shift());
                    }
                }
            }

            return {
                shiftArrayNPositionsOnDirection: shiftArrayNPositionsOnDirection
            };
        });

})();
