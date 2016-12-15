describe('Player Locator Service', function() {
    'use strict';

    var playerLocatorService,
        playerName = 'PlayerName',
        game;

    beforeEach(function() {
        module('musApp');
    });

    beforeEach(inject(function($injector) {
        playerLocatorService = $injector.get('playerLocatorService');
    }));

    it('When game is undefined, it should return null', function() {
        var result = playerLocatorService.locatePlayer(game, playerName, 1);
        expect(result).toBe(null);
    });

    it('When players are undefined, it should return null', function() {
        game = {};
        var result = playerLocatorService.locatePlayer(game, playerName, 1);
        expect(result).toBe(null);
    });

    it('When player is not in the room, it should return null', function() {
        game = {
            maxPlayers: 4,
            players: ['A', 'B', 'C', 'D']
        };
        var result = playerLocatorService.locatePlayer(game, playerName, 1);
        expect(result).toBe(null);
    });

    describe('Main player is the first to enter the room', function() {

        beforeEach(function() {
            game = {
                maxPlayers: 4,
                players: [playerName, 'B', 'C', 'D']
            };
        });

        var testCases = [
            {playerTargetIndex: 0, result: playerName},
            {playerTargetIndex: 1, result: 'B'},
            {playerTargetIndex: 2, result: 'C'},
            {playerTargetIndex: 3, result: 'D'}
        ];

        testCases.forEach(function(testCase) {

            it('In game with players [\'playerName\', \'B\', \'C\', \'D\'] and main player \'' + playerName +
                '\', if we try to locate player at index ' + testCase.playerTargetIndex +
                ', then it should return \'' + testCase.result + '\'', function() {
                var result = playerLocatorService.locatePlayer(game, playerName, testCase.playerTargetIndex);
                expect(result).toBe(testCase.result);
            });
        });

    });

    describe('Main player is NOT the first to enter the room', function() {

        beforeEach(function() {
            game = {
                maxPlayers: 4,
                players: ['A', playerName, 'C', 'D']
            };
        });

        var testCases = [
            {playerTargetIndex: 0, result: playerName},
            {playerTargetIndex: 1, result: 'C'},
            {playerTargetIndex: 2, result: 'D'},
            {playerTargetIndex: 3, result: 'A'}
        ];

        testCases.forEach(function(testCase) {

            it('In game with players [\'A\', \'playerName\', \'C\', \'D\'] and main player \'' + playerName +
                '\', if we try to locate player at index ' + testCase.playerTargetIndex +
                ', then it should return \'' + testCase.result + '\'', function() {
                var result = playerLocatorService.locatePlayer(game, playerName, testCase.playerTargetIndex);
                expect(result).toBe(testCase.result);
            });
        });

    });

});