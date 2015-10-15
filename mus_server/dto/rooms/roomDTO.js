(function() {
    'use strict';

    var GameDTO = require('./../game/gameDTO');
    require('./../../model/rooms/roomModel');

    var RoomDTO = function(roomModel) {
        this.id = roomModel.getId();
        this.name = roomModel.getName();
        this.game = new GameDTO(roomModel.getGame());
    };

    RoomDTO.prototype.toJSON = function() {
        var data = {};
        data.id = this.id;
        data.name = this.name;
        data.game = this.game;
        return data;
    };

    module.exports = RoomDTO;

})();