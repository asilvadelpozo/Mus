(function() {
    'use strict';

    module.exports = function(server, client, musModel) {
        client.on('message', function(message) {
            if(musModel.isUserPlaying(client.id)) {
                var roomId = musModel.getPlayers()[client.id].roomId,
                    playerName = musModel.getPlayers()[client.id].playerName;
                server.to(roomId).emit('new-message', JSON.stringify({playerName: playerName, message: message}));
            }
        });
    }
})();