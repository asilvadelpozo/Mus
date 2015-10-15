(function() {
    'use strict';

    var RoomDTO = require('./roomDTO');
    require('./../../model/rooms/roomsModel');

    var RoomsDTO = function(roomsModel) {
        this.rooms = {};
        this.counter = roomsModel.counter;
        for(var roomId in roomsModel.getRooms()) {
            this.rooms[roomId] = new RoomDTO(roomsModel.getRoomById(roomId));
        }
    };

    RoomsDTO.prototype.toJSON = function() {
        var data = {};
        data.counter = this.counter;
        data.rooms = this.rooms;
        return data;
    };

    module.exports = RoomsDTO;

})();