(function() {
    'use strict';

    var DealingService = function(randomNumbersService) {
        this.randomNumbersService = randomNumbersService;
    };

    DealingService.prototype.reShuffle = function(game) {
        var aux = this.randomNumbersService.shuffle(game.getDiscarded());
        game.setDiscarded([]);
        game.setDeck(aux);
    };

    DealingService.prototype.shiftArrayNPositionsOnDirection = function(array, positions, direction) {
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
    };

    DealingService.prototype.dealCards = function(game, alternate) {
        var cards = game.getCards();
        this.shiftArrayNPositionsOnDirection(cards, game.getHand(), 'left');
        if(alternate) {
            for(var i = 0; i < 16; i++) {
                var index = i % cards.length,
                    card = game.getDeck().splice(0, 1)[0];
                cards[index].push(card);
            }
        }
        else {
            cards.map(function(playerCards) {
                for(var i = playerCards.length; i < 4; i++) {
                    if(game.getDeck().length === 0) {
                        this.reShuffle(game);
                    }
                    var card = game.getDeck().splice(0, 1)[0];
                    playerCards.push(card);
                }
            }, this);
        }
        this.shiftArrayNPositionsOnDirection(cards, game.getHand(), 'right');
    };

    module.exports = DealingService;

})();