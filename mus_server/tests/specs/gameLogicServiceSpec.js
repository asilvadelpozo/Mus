var GameLogicService= require('./../../services/gameLogicService'),
    RandomNumbersService = require('./../../services/randomNumbersService'),
    GameModel = require('./../../model/game/gameModel');

describe('Game Logic Service', function() {

    var gameLogicService, mockRandomNumbersService, game;

    beforeEach(function() {
        mockRandomNumbersService = new RandomNumbersService();
        mockRandomNumbersService.getRandomNumbers = jasmine.createSpy("getRandomNumbers").andCallFake(function() {
            switch(arguments[2]) {
                case 40: // I am asking for deck
                    var result = [];
                    for(var i = 1; i <= 40; i++) {
                        result.push(i);
                    }
                    return result;
                case 1: // I am asking for hand
                    return [0];
            }
        });
        game = new GameModel();
        gameLogicService = new GameLogicService();
        gameLogicService.setRandomNumbersService(mockRandomNumbersService);
    });

    describe('initializeGame', function() {

        it('should initialize the game correctly', function() {
            gameLogicService.initializeGame(game);

            expect(game.getDiscarded()).toBeEmptyArray();
            expect(game.getDeck()).toEqual([17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40]);
            expect(game.getHand()).toBe(0);
            expect(game.getTurn()).toBe(0);
            expect(game.getCards()[0]).toEqual([1, 5, 9, 13]);
            expect(game.getCards()[1]).toEqual([2, 6, 10, 14]);
            expect(game.getCards()[2]).toEqual([3, 7, 11, 15]);
            expect(game.getCards()[3]).toEqual([4, 8, 12, 16]);
        });

    });

});