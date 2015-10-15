(function() {
    'use strict';

    module.exports = function(server, client, musModel, MusDTO) {
        client.on('mus-info', function() {
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
            console.log('mus-info', musModel.toJSON());
            client.emit('update-mus', JSON.stringify(new MusDTO(musModel)));
        });

        client.on('create-room', function(data) {
            var roomId = musModel.createRoom(client.id, JSON.parse(data).roomName, JSON.parse(data).playerName);
            console.log(musModel.toJSON());
            client.emit('room-creation-success', roomId);
            client.join(roomId);
            server.sockets.emit('update-mus', JSON.stringify(new MusDTO(musModel)));
        });
    }

})();