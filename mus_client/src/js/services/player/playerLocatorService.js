(function() {
    'use strict';

    angular.module('musApp')
        .factory('playerLocatorService', function () {
            function locatePlayer(game, mainPlayerName, targetPlayerIndex) {
                if (typeof game !== 'undefined' && typeof game.players !== 'undefined') {
                    var indexOfMainPlayer = game.players.indexOf(mainPlayerName),
                        realTargetPlayerIndex = (indexOfMainPlayer + targetPlayerIndex) % game.maxPlayers;
                    return game.players[realTargetPlayerIndex];
                }
                return null;
            }

            return {
                locatePlayer: locatePlayer
            };
        });

})();
