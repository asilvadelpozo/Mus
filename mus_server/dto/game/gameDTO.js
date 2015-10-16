(function() {
    'use strict';

    require('./../../model/game/gameModel');

    var GameDTO = function(gameModel) {
        this.maxPlayers = gameModel.getMaxPlayers();
        this.players = gameModel.getPlayers();
        this.hand = gameModel.getHand();
        this.turn = gameModel.getTurn();
        this.cards = [
            [-1, -1, -1, -1],
            [-1, -1, -1, -1],
            [-1, -1, -1, -1],
            [-1, -1, -1, -1]
        ];
    };

    GameDTO.prototype.toJSON = function() {
        var data = {};
        data.maxPlayers = this.maxPlayers;
        data.players = this.players;
        data.hand = this.hand;
        data.turn = this.turn;
        data.cards = this.cards;
        return data;
    };

    module.exports = GameDTO;

})();