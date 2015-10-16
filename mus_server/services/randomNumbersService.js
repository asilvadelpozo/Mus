(function() {
    'use strict';

    var shuffle = require('knuth-shuffle').knuthShuffle;

    var RandomNumbersService = function() {};

    RandomNumbersService.prototype.getRandomNumbers = function(from, to, amount) {
        var range = [];
        for(var i = from; i <= to; i++) {
            range.push(i);
        }
        return shuffle(range.slice(0, amount));
    };

    RandomNumbersService.prototype.shuffle = function(array) {
        return shuffle(array.slice(0, array.length));
    };

    module.exports = RandomNumbersService;

})();