(function() {
    'use strict';

    var MusModel = require('../model/musModel'),
        musModel = new MusModel();

    module.exports = function (server) {

        server.on('connection', function (client) {

            require('./mainSocket')(server, client, musModel);

            require('./roomSocket')(server, client, musModel);

            require('./chatSocket')(server, client, musModel);

            client.on("disconnect", function() {
                if(musModel.isUserPlaying(client.id)) {
                    var roomId = musModel.getPlayers()[client.id].roomId,
                        playerName = musModel.getPlayers()[client.id].playerName;
                    musModel.deletePlayerFromRoom(client.id, roomId);
                    client.leave(roomId);
                    client.emit('leave-room-success');
                    client.broadcast.to(roomId).emit('player-left', JSON.stringify({room: musModel.getRoomsModel().getRoomById(roomId), playerName: playerName}));
                    client.broadcast.to(roomId).emit('update-room', JSON.stringify(musModel.getRoomsModel().getRoomById(roomId)));
                    server.sockets.emit('update-mus', JSON.stringify(musModel));
                }
            });

        });

    };
})();

