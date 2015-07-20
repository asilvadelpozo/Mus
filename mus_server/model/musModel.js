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
        var roomId = this.roomsModel.createRoom(creatorName);
        this.players[creatorId] = {'playerName': creatorName, 'roomId': roomId};
        return roomId;
    };

    MusModel.prototype.deleteRoom = function(id) {
        this.roomsModel.deleteRoom(id);
    };

    MusModel.prototype.addPlayerToRoom = function(playerId, playerName, roomId) {
        if (this.roomsModel.addPlayerToRoom(playerName, roomId)) {
            this.players[playerId] = {'playerName': playerName, 'roomId': roomId};
            return true;
        }
        return false;
    };

    MusModel.prototype.deletePlayerFromRoom = function(playerId, roomId) {

        this.roomsModel.deletePlayerFromRoom(this.players[playerId].playerName, roomId);

        if(this.roomsModel.getRoomById(roomId).isEmpty()) {
            this.roomsModel.deleteRoom(roomId);
        }

        delete this.players[playerId];
    };

    MusModel.prototype.isUserPlaying = function(clientId) {
        return this.players.hasOwnProperty(clientId);
    };

    MusModel.prototype.isUserPlayingInRoom = function(clientId, roomId) {
        return this.players.hasOwnProperty(clientId) && this.players[clientId].roomId == roomId;
    };

    MusModel.prototype.toJSON = function() {
        var data = {};
        data.roomsModel = this.roomsModel;
        data.players = this.players;
        return data;
    };

    module.exports = MusModel;

})();
