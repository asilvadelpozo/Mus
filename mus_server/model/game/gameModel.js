(function() {
    'use strict';

    var MAX_PLAYERS = 4;

    var GameModel = function() {
        this.name = 'Mus';
        this.players = [null, null, null, null];
        this.cards = [[], [], [], []];
        this.deck = [];
        this.discarded = [];
        this.turn = -1;
        this.hand = -1;
    };

    GameModel.prototype.getMaxPlayers = function() {
        return MAX_PLAYERS;
    };

    GameModel.prototype.getPlayers = function() {
        return this.players;
    };

    GameModel.prototype.getHand = function() {
        return this.hand;
    };

    GameModel.prototype.setHand = function(hand) {
        this.hand = hand;
    };

    GameModel.prototype.getTurn = function() {
        return this.turn;
    };

    GameModel.prototype.setTurn = function(turn) {
        this.turn = turn;
    };

    GameModel.prototype.setDeck = function(deck) {
        this.deck = deck;
    };

    GameModel.prototype.getDeck = function() {
        return this.deck;
    };

    GameModel.prototype.setDiscarded = function(discarded) {
        this.discarded = discarded;
    };

    GameModel.prototype.getDiscarded = function() {
        return this.discarded;
    };

    GameModel.prototype.getCards = function() {
        return this.cards;
    };

    GameModel.prototype.resetCards = function() {
        this.cards = [[], [], [], []];
    };

    GameModel.prototype.findFirstGap = function() {
        var index = 0;
        while(index < MAX_PLAYERS) {
            if(this.players[index] === null) {
                return index;
            }
            index++;
        }
        return index;
    };

    GameModel.prototype.addPlayer = function(playerName) {
        var firstGap = this.findFirstGap();
        if(firstGap < MAX_PLAYERS) {
            this.players[firstGap] = playerName;
            return true;
        }
        return false;
    };

    GameModel.prototype.deletePlayer = function(playerName) {
        var indexPlayer = this.players.indexOf(playerName);
        if(indexPlayer > -1) {
            this.players[indexPlayer] = null;
        }
    };

    GameModel.prototype.toJSON = function() {
        var data = {};
        data.maxPlayers = MAX_PLAYERS;
        data.name = this.name;
        data.players = this.players;
        data.cards = this.cards;
        data.deck = this.deck;
        data.discarded = this.discarded;
        data.turn = this.turn;
        data.hand = this.hand;
        return data;
    };

    module.exports = GameModel;

})();