(function() {
    'use strict';

    angular.module('musApp')
        .factory('playerLocatorService', function () {
            function locatePlayer(room, mainPlayerName, targetPlayerIndex) {
                if (typeof room.game !== 'undefined' && typeof room.game.players !== 'undefined') {
                    var indexOfMainPlayer = room.game.players.indexOf(mainPlayerName),
                        realTargetPlayerIndex = (indexOfMainPlayer + targetPlayerIndex) % room.game.maxPlayers;
                    return room.game.players[realTargetPlayerIndex];
                }
                return null;
            }

            return {
                locatePlayer: locatePlayer
            };
        });

})();
