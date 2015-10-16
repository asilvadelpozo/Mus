(function() {
    'use strict';

    module.exports = function(server, client, musModel, MusDTO, RoomDTO) {
        client.on('join-room', function(playerName, roomId) {
            if(musModel.addPlayerToRoom(client.id, playerName, roomId)) {
                client.join(roomId);
                client.emit('room-join-success', JSON.stringify({room: new RoomDTO(musModel.getRoomsModel().getRoomById(roomId)), playerName: playerName}));
                client.broadcast.to(roomId).emit('new-player-joined', JSON.stringify({room: new RoomDTO(musModel.getRoomsModel().getRoomById(roomId)), playerName: playerName}));
                server.to(roomId).emit('update-room', JSON.stringify(new RoomDTO(musModel.getRoomsModel().getRoomById(roomId))));
                server.sockets.emit('update-mus', JSON.stringify(new MusDTO(musModel)));
                if(musModel.getRoomsModel().getRoomById(roomId).isFull()) {
                    server.to(roomId).emit('game-started');
                }
            } else {
                client.emit('room-join-failure');
            }
        });

        client.on('room-info', function(roomId) {
            if(typeof musModel.getRoomsModel().getRoomById(roomId) === 'undefined') {
                client.emit('room-info-failure', roomId);
            } else {
                var playerName = (typeof musModel.getPlayers()[client.id] === 'undefined' ? '' : musModel.getPlayers()[client.id].playerName);
                client.emit('room-info-success', JSON.stringify({room: new RoomDTO(musModel.getRoomsModel().getRoomById(roomId)), playerName: playerName}));
            }
        });

        client.on('leave-room', function(data) {
            var playerName = musModel.getPlayers()[client.id].playerName,
                roomId = data;
            musModel.deletePlayerFromRoom(client.id, roomId);
            client.leave(roomId);
            client.emit('leave-room-success');
            client.broadcast.to(roomId).emit('player-left', JSON.stringify({room: new RoomDTO(musModel.getRoomsModel().getRoomById(roomId)), playerName: playerName}));
            client.broadcast.to(roomId).emit('update-room', JSON.stringify(new RoomDTO(musModel.getRoomsModel().getRoomById(roomId))));
            server.sockets.emit('update-mus', JSON.stringify(new MusDTO(musModel)));
        });
    }

})();