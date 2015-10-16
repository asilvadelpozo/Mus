(function() {
    'use strict';

    var GameModel = require('./../game/gameModel');

    var RoomModel = function(roomName, roomId) {
        this.id = roomId;
        this.name = roomName;
        this.game = new GameModel();
    };

    RoomModel.prototype.getId = function() {
        return this.id;
    };

    RoomModel.prototype.getName = function() {
        return this.name;
    };

    RoomModel.prototype.getGame = function() {
        return this.game;
    };

    RoomModel.prototype.getPlayers = function() {
        return this.game.getPlayers();
    };

    RoomModel.prototype.getMaxPlayers = function() {
        return this.game.getMaxPlayers();
    };

    RoomModel.prototype.addPlayer = function(playerName) {
        return this.game.addPlayer(playerName);
    };

    RoomModel.prototype.deletePlayer = function(playerName) {
        this.game.deletePlayer(playerName);
    };

    RoomModel.prototype.isEmpty = function() {
        return this.game.getPlayers().filter(function(player) { return player !== null; }).length === 0;
    };

    RoomModel.prototype.isFull = function() {
        return this.game.getPlayers().filter(function(player) { return player !== null; }).length === this.getMaxPlayers();
    };

    RoomModel.prototype.toJSON = function() {
        var data = {};
        data.id = this.id;
        data.name = this.name;
        data.game = this.game;
        return data;
    };

    module.exports = RoomModel;

})();
