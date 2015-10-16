(function() {
    'use strict';

    function getAllRoomMembers(server, roomId) {
        var roomMembers = [];
        for(var member in server.sockets.adapter.rooms[roomId]) {
            roomMembers.push(member);
        }
        return roomMembers;
    }

    function dealCardsToClients(server, room, allPlayers) {
        var clientIds = getAllRoomMembers(server, room.getId());
        clientIds.forEach(function (clientId) {
            var playerName = allPlayers[clientId].playerName,
                playerCards = room.getGame().getCards()[room.getGame().getPlayers().indexOf(playerName)];
            setTimeout(function () {
                server.sockets.connected[clientId].emit('hand-started', JSON.stringify(playerCards));
            }, 2000);
        });
    }

    module.exports = function(server, client, musModel, MusDTO, RoomDTO, gameLogicService) {
        client.on('join-room', function(playerName, roomId) {

            if(musModel.addPlayerToRoom(client.id, playerName, roomId)) {
                var room = musModel.getRoomsModel().getRoomById(roomId);
                client.join(roomId);
                client.emit('room-join-success', JSON.stringify({room: new RoomDTO(room), playerName: playerName}));
                client.broadcast.to(roomId).emit('new-player-joined', JSON.stringify({room: new RoomDTO(room), playerName: playerName}));
                server.to(roomId).emit('update-room', JSON.stringify(new RoomDTO(room)));
                server.sockets.emit('update-mus', JSON.stringify(new MusDTO(musModel)));

                if(room.isFull()) {
                    server.to(roomId).emit('game-started');
                    gameLogicService.initializeGame(room.getGame());
                    dealCardsToClients(server, room, musModel.getPlayers());
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