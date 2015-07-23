(function() {
    'use strict';

    module.exports = function(server, client, musModel) {
        client.on('mus-info', function() {
            if(musModel.isUserPlaying(client.id)) {
                var roomId = musModel.getPlayers()[client.id].roomId,
                    playerName = musModel.getPlayers()[client.id].playerName;
                musModel.deletePlayerFromRoom(client.id, roomId);
                client.leave(roomId);
                client.emit('leave-room-success');
                client.broadcast.to(roomId).emit('player-left', playerName);
                client.broadcast.to(roomId).emit('update-room', JSON.stringify(musModel.getRoomsModel().getRoomById(roomId)));
                server.sockets.emit('update-mus', JSON.stringify(musModel));
            }
            client.emit('update-mus', JSON.stringify(musModel));
        });

        client.on('create-room', function(playerName) {
            var roomId = musModel.createRoom(client.id, playerName);
            client.emit('room-creation-success', roomId);
            client.join(roomId);
            server.sockets.emit('update-mus', JSON.stringify(musModel));
        });
    }

})();