(function() {
    'use strict';

    var MusModel = require('../model/musModel'),
        musModel = new MusModel();

    var removePlayerFromRoom = function(server, client, playerName, roomId) {
        musModel.deletePlayerFromRoom(client.id, roomId);
        client.leave(roomId);
        client.emit('leave-room-success');
        client.broadcast.to(roomId).emit('player-left', playerName + ' left the room');
        client.broadcast.to(roomId).emit('update-room', JSON.stringify(musModel.getRoomsModel().getRoomById(roomId)));
        server.sockets.emit('update-mus', JSON.stringify(musModel));
    };

    module.exports = function (server) {

        server.on('connection', function (client) {

            client.on('mus-info', function() {
                if(musModel.isUserPlaying(client.id)) {
                    var roomId = musModel.getPlayers()[client.id].roomId,
                        playerName = musModel.getPlayers()[client.id].playerName;
                    removePlayerFromRoom(server, client, playerName, roomId);
                }
                client.emit('update-mus', JSON.stringify(musModel));
            });


            client.on('create-room', function(playerName) {
                var roomId = musModel.createRoom(client.id, playerName);
                client.emit('room-creation-success', roomId);
                client.join(roomId);
                server.sockets.emit('update-mus', JSON.stringify(musModel));
            });

            client.on('join-room', function(playerName, roomId) {
                if(musModel.addPlayerToRoom(client.id, playerName, roomId)) {
                    client.join(roomId);
                    client.emit('room-join-success', roomId);
                    client.broadcast.to(roomId).emit('new-player-joined', playerName + ' joined the room');
                    client.broadcast.to(roomId).emit('update-room', JSON.stringify(musModel.getRoomsModel().getRoomById(roomId)));
                    server.sockets.emit('update-mus', JSON.stringify(musModel));
                } else {
                    client.emit('room-join-failure', playerName + ': You could not connected to ' + roomId);
                }
            });

            client.on('room-info', function(roomId) {
                if(musModel.isUserPlayingInRoom(client.id, roomId)) {
                    client.emit('room-info-success', JSON.stringify({room: musModel.getRoomsModel().getRoomById(roomId), playerName: musModel.getPlayers()[client.id].playerName}));
                } else {
                    client.emit('room-info-failure', 'You are attempting to enter a room in an invalid way');
                }

            });

            client.on('leave-room', function(data) {
                var playerName = musModel.getPlayers()[client.id].playerName,
                    roomId = data;
                removePlayerFromRoom(server, client, playerName, roomId);
            });

            //client.on('message', function (from, msg) {
            //    server.sockets.emit('broadcast', {
            //        payload: msg,
            //        source: from
            //    });
            //});

            client.on("disconnect", function() {
                if(musModel.isUserPlaying(client.id)) {
                    var roomId = musModel.getPlayers()[client.id].roomId,
                        playerName = musModel.getPlayers()[client.id].playerName;
                    removePlayerFromRoom(server, client, playerName, roomId);
                }
            });

        });

    };
})();

