(function() {
    'use strict';

    angular.module('musApp')
        .factory('musSocketService', function (socketFactory) {
            var socket = socketFactory();
            socket.forward('connection-success');

            socket.forward('room-creation-success');

            socket.forward('room-info-init');

            socket.forward('room-join-success');
            socket.forward('room-join-failure');
            socket.forward('new-player-joined');

            socket.forward('leave-room-success');
            socket.forward('player-left');

            socket.forward('update-mus');
            socket.forward('update-room');
            return socket;
        });
})();
