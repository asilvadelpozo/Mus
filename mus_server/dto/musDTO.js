(function() {
    'use strict';

    require('./../model/musModel');

    var RoomsDTO = require('./rooms/roomsDTO');

    var MusDTO = function(musModel) {
        this.roomsModel = new RoomsDTO(musModel.getRoomsModel());
        this.players = musModel.getPlayers();
    };

    MusDTO.prototype.toJSON = function() {
        var data = {};
        data.roomsModel = this.roomsModel;
        data.players = this.players;
        return data;
    };

    module.exports = MusDTO;

})();