(function() {
    'use strict';

    angular.module('musApp')
        .factory('playerLocatorService', function () {
            function locatePlayer(room, mainPlayerName, targetPlayerIndex) {
                if (typeof room.players !== 'undefined') {
                    var indexOfMainPlayer = room.players.indexOf(mainPlayerName),
                        realTargetPlayerIndex = (indexOfMainPlayer + targetPlayerIndex) % room.maxPlayers;
                    return room.players[realTargetPlayerIndex];
                }
                return null;
            }

            return {
                locatePlayer: locatePlayer
            };
        });

})();
