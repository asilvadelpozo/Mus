(function() {
    'use strict';

    var RoomsModel = require('./rooms/roomsModel');

    var MusModel = function() {
        this.roomsModel = new RoomsModel();
        this.players = {};
    };

    MusModel.prototype.getRoomsModel = function() {
        return this.roomsModel;
    };

    MusModel.prototype.getPlayers = function() {
        return this.players;
    };

    MusModel.prototype.createRoom = function(creatorId, creatorName) {
        this.players[creatorId] = creatorName;
        return this.roomsModel.createRoom(creatorName);
    };

    MusModel.prototype.deleteRoom = function(id) {
        this.roomsModel.deleteRoom(id);
    };

    MusModel.prototype.addPlayerToRoom = function(playerId, playerName, roomId) {
        if (this.roomsModel.addPlayerToRoom(playerName, roomId)) {
            this.players[playerId] = playerName;
            return true;
        }
        return false;
    };

    MusModel.prototype.deletePlayerFromRoom = function(playerId, roomId) {

        this.roomsModel.deletePlayerFromRoom(this.players[playerId], roomId);

        if(this.roomsModel.getRoomById(roomId).isEmpty()) {
            this.roomsModel.deleteRoom(roomId);
        }

        console.log('deleting player  ' + this.players[playerId]);
        delete this.players[playerId];
    };

    MusModel.prototype.toJSON = function() {
        var data = {};
        data.roomsModel = this.roomsModel;
        data.players = this.players;
        return data;
    };

    module.exports = MusModel;

})();
