(function() {
    'use strict';


    var MAX_PLAYERS = 4;

    var RoomModel = function(roomName, roomId) {
        this.id = roomId;
        this.name = roomName;
        this.game = 'Mus';
        this.players = [null, null, null, null];
    };

    RoomModel.prototype.getId = function() {
        return this.id;
    };

    RoomModel.prototype.getName = function() {
        return this.name;
    };

    RoomModel.prototype.getGame = function() {
        return this.game;
    };

    RoomModel.prototype.getPlayers = function() {
        return this.players;
    };

    RoomModel.prototype.getMaxPlayers = function() {
        return MAX_PLAYERS;
    };

    RoomModel.prototype.findFirstGap = function() {
        var index = 0;
        while(index < MAX_PLAYERS) {
            if(this.players[index] === null) {
                return index;
            }
            index++;
        }
        return index;
    };

    RoomModel.prototype.addPlayer = function(playerName) {
        var firstGap = this.findFirstGap();
        if(firstGap < MAX_PLAYERS) {
            this.players[firstGap] = playerName;
            return true;
        }
        return false;
    };

    RoomModel.prototype.deletePlayer = function(playerName) {
        var indexPlayer = this.players.indexOf(playerName);
        if(indexPlayer > -1) {
            this.players[indexPlayer] = null;
        }
    };

    RoomModel.prototype.isEmpty = function() {
        var index = 0;
        while(index < MAX_PLAYERS) {
            if(this.players[index] !== null) {
                return false;
            }
            index++;
        }
        return true;
    };

    RoomModel.prototype.toJSON = function() {
        var data = {};
        data.maxPlayers = MAX_PLAYERS;
        data.game = this.game;
        data.id = this.id;
        data.name = this.name;
        data.players = this.players;
        return data;
    };

    module.exports = RoomModel;

})();
