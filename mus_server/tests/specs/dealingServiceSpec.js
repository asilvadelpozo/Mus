var DealingService= require('./../../services/dealingService'),
    RandomNumbersService = require('./../../services/randomNumbersService'),
    GameModel = require('./../../model/game/gameModel');

describe('Dealing Service', function() {

    var dealingService, mockRandomNumbersService, game;

    beforeEach(function() {
        mockRandomNumbersService = new RandomNumbersService();
        mockRandomNumbersService.shuffle = jasmine.createSpy("shuffle").andCallFake(function() {
            var result = [];

            for(var i = 17; i <= 40; i++) {
                result.push(i);
            }

            return result;
        });
        game = new GameModel();
        dealingService = new DealingService(mockRandomNumbersService);
    });

    describe('shiftArrayNPositionsOnDirection', function() {

        it('should shift to the left and array 1 position', function() {
            var array = [1, 2, 3, 4];

            dealingService.shiftArrayNPositionsOnDirection(array, 1, 'left');
            expect(array).toEqual([2, 3, 4, 1]);
        });

        it('should shift to the right and array 1 position', function() {
            var array = [1, 2, 3, 4];

            dealingService.shiftArrayNPositionsOnDirection(array, 1, 'right');
            expect(array).toEqual([4, 1, 2, 3]);
        });

    });

    describe('reShuffle', function() {

        beforeEach(function() {
            var discarded = [];

            for(var i = 40; i >= 17; i--) {
                discarded.push(i);
            }
            game.setDiscarded(discarded);
        });

        it('should move all cards from discarded to deck after shuffling', function() {
            dealingService.reShuffle(game);

            expect(game.getDiscarded()).toBeEmptyArray();
            expect(game.getDeck()).toEqual([17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40]);
        });

    });

    describe('dealCards', function() {

        describe('full deck (no discarded yet)', function() {

            beforeEach(function() {
                var deck = [];

                for(var i = 1; i <= 40; i++) {
                    deck.push(i);
                }
                game.setDeck(deck);
            });

            it('should deal cards without alternate', function() {
                dealingService.dealCards(game, false);

                expect(game.getDiscarded()).toBeEmptyArray();
                expect(game.getDeck()).toEqual([17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40]);

                expect(game.getCards()[0]).toEqual([1, 2, 3, 4]);
                expect(game.getCards()[1]).toEqual([5, 6, 7, 8]);
                expect(game.getCards()[2]).toEqual([9, 10, 11, 12]);
                expect(game.getCards()[3]).toEqual([13, 14, 15, 16]);
            });

            it('should deal cards with alternate', function() {
                dealingService.dealCards(game, true);

                expect(game.getDiscarded()).toBeEmptyArray();
                expect(game.getDeck()).toEqual([17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40]);

                expect(game.getCards()[0]).toEqual([1, 5, 9, 13]);
                expect(game.getCards()[1]).toEqual([2, 6, 10, 14]);
                expect(game.getCards()[2]).toEqual([3, 7, 11, 15]);
                expect(game.getCards()[3]).toEqual([4, 8, 12, 16]);
            });

        });

//TODO: test alternate with discarded

    });

});