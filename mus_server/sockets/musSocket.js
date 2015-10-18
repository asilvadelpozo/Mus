(function() {
    'use strict';

    var MusModel = require('../model/musModel'),
        MusDTO = require('../dto/musDTO'),
        RoomDTO = require('../dto/rooms/roomDTO'),
        GameLogicService = require('../services/gameLogicService'),
        musModel = new MusModel(),
        gameLogicService = new GameLogicService();

    module.exports = function (server) {

        server.on('connection', function (client) {

            require('./mainSocket')(server, client, musModel, MusDTO);

            require('./roomSocket')(server, client, musModel, MusDTO, RoomDTO, gameLogicService);

            require('./chatSocket')(server, client, musModel);

            client.on("disconnect", function() {
                if(musModel.isUserPlaying(client.id)) {
                    var roomId = musModel.getPlayers()[client.id].roomId,
                        playerName = musModel.getPlayers()[client.id].playerName,
                        room = musModel.getRoomsModel().getRoomById(roomId);
                    musModel.deletePlayerFromRoom(client.id, roomId);
                    client.leave(roomId);
                    client.emit('leave-room-success');
                    if(typeof musModel.getRoomsModel().getRoomById(roomId) !== 'undefined') {
                        client.broadcast.to(roomId).emit('player-left', JSON.stringify({room: new RoomDTO(room), playerName: playerName}));
                        client.broadcast.to(roomId).emit('update-room', JSON.stringify(new RoomDTO(room)));
                    }
                    server.sockets.emit('update-mus', JSON.stringify(new MusDTO(musModel)));
                }
            });

        });

    };
})();

