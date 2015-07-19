(function() {
    'use strict';

    var RoomModel = require('./roomModel');

    var RoomsModel = function() {
        this.rooms = {};
        this.counter = 1;
    };

    RoomsModel.prototype.getRooms = function() {
        return this.rooms;
    };

    RoomsModel.prototype.getRoomById = function(id) {
        return this.rooms[id];
    };

    RoomsModel.prototype.createRoom = function(creator) {
        var roomId = 'room-' + this.counter,
            roomModel = new RoomModel(roomId);
        roomModel.addPlayer(creator);
        this.rooms[roomId] = roomModel;
        this.counter++;
        return roomId;
    };

    RoomsModel.prototype.addPlayerToRoom = function(playerName, roomId) {
        return this.getRoomById(roomId).addPlayer(playerName);
    };

    RoomsModel.prototype.deletePlayerFromRoom = function(playerName, roomId) {
        console.log('Deleting...');
        console.log('playerName: ' + playerName);
        console.log('roomId: ' + roomId);

        console.log('room info before deletion: ');
        console.log('roomId: ' + this.getRoomById(roomId).getId());
        console.log('players: ' + this.getRoomById(roomId).getPlayers());

        this.getRoomById(roomId).deletePlayer(playerName);
    };

    RoomsModel.prototype.deleteRoom = function(id) {
        delete this.rooms[id];
    };

    RoomsModel.prototype.toJSON = function() {
        var data = {};
        data.rooms = this.rooms;
        return data;
    };

    module.exports = RoomsModel;

})();
