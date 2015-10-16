(function() {
    'use strict';

    var RandomNumbersService = require('./randomNumbersService'),
        DealingService = require('./dealingService');

    var GameLogicService = function() {
        this.randomNumbersService = new RandomNumbersService();
        this.dealingService = new DealingService(this.randomNumbersService);
    };

    GameLogicService.prototype.initializeGame = function(game) {
        var deck = this.randomNumbersService.getRandomNumbers(1, 40, 40);
        game.setDeck(deck);
        game.setHand(0);
        this.dealingService.dealCards(game, true);
    };

    module.exports = GameLogicService;

})();