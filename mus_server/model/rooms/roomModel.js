(function() {
    'use strict';


    var MAX_PLAYERS = 4;

    var RoomModel = function(roomId) {
        this.id = roomId;
        this.game = 'Mus';
        this.players = [];
    };

    RoomModel.prototype.getId = function() {
        return this.id;
    };

    RoomModel.prototype.getGame = function() {
        return this.game;
    };

    RoomModel.prototype.getPlayers = function() {
        return this.players;
    };

    RoomModel.prototype.getMaxPlayers = function() {
        return MAX_PLAYERS;
    };

    RoomModel.prototype.addPlayer = function(playerName) {
        if(this.players.length < MAX_PLAYERS) {
            this.players.push(playerName);
            return true;
        }
        return false;
    };

    RoomModel.prototype.deletePlayer = function(playerName) {
        var indexPlayer = this.players.indexOf(playerName);
        if(indexPlayer > -1) {
            this.players.splice(indexPlayer, 1);
        }
    };

    RoomModel.prototype.isEmpty = function() {
        return this.players.length === 0;
    };

    RoomModel.prototype.toJSON = function() {
        var data = {};
        data.maxPlayers = MAX_PLAYERS;
        data.game = this.game;
        data.id = this.id;
        data.players = this.players;
        return data;
    };

    module.exports = RoomModel;

})();
