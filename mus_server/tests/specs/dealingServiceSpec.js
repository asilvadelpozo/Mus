var DealingService= require('./../../services/dealingService'),
    RandomNumbersService = require('./../../services/randomNumbersService'),
    GameModel = require('./../../model/game/gameModel');

describe('Dealing Service', function() {
    'use strict';

    var dealingService, mockRandomNumbersService, game;

    function mockRandomNumberServiceShuffle(resultNumbersArray) {
        mockRandomNumbersService = new RandomNumbersService();
        mockRandomNumbersService.shuffle = jasmine.createSpy('shuffle').andCallFake(function() {
            return resultNumbersArray;
        });
        game = new GameModel();
        dealingService = new DealingService(mockRandomNumbersService);
    }

    beforeEach(function() {
        mockRandomNumberServiceShuffle([17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40]);
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

        describe('almost empty deck (discarded already)', function () {

            it('when remaining cards still on the deck, it should deal cards without alternate', function() {
                var discarded = [3, 4, 7, 8, 11, 12, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
                    discardedReverse = discarded.slice().reverse();

                // We use slice for making a copy. It is necessary here to be able to use discardedReverse
                // on the expectations below, and avoid it being mutated by the method.
                mockRandomNumberServiceShuffle(discardedReverse.slice());
                game.cards = [[1, 2], [5, 6], [9, 10], [13, 14]];
                game.setDiscarded(discarded);
                game.setDeck([37, 38, 39, 40]);

                dealingService.dealCards(game, false);

                expect(game.getDiscarded()).toBeEmptyArray();
                expect(game.getDeck()).toEqual(discardedReverse.slice(4, discarded.length));

                expect(game.getCards()[0]).toEqual([1, 2, 37, 38]);
                expect(game.getCards()[1]).toEqual([5, 6, 39, 40]);
                expect(game.getCards()[2]).toEqual([9, 10, discardedReverse[0], discardedReverse[1]]);
                expect(game.getCards()[3]).toEqual([13, 14, discardedReverse[2], discardedReverse[3]]);
            });

            it('when the deck is already empty, it should deal cards without alternate', function() {
                var discarded = [3, 4, 7, 8, 11, 12, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
                    discardedReverse = discarded.slice().reverse();

                // We use slice for making a copy. It is necessary here to be able to use discardedReverse
                // on the expectations below, and avoid it being mutated by the method.
                mockRandomNumberServiceShuffle(discardedReverse.slice());
                game.cards = [[1, 2], [5, 6], [9, 10], [13, 14]];
                game.setDiscarded(discarded);
                game.setDeck([]);

                dealingService.dealCards(game, false);

                expect(game.getDiscarded()).toBeEmptyArray();
                expect(game.getDeck()).toEqual(discardedReverse.slice(8, discarded.length));

                expect(game.getCards()[0]).toEqual([1, 2, discardedReverse[0], discardedReverse[1]]);
                expect(game.getCards()[1]).toEqual([5, 6, discardedReverse[2], discardedReverse[3]]);
                expect(game.getCards()[2]).toEqual([9, 10, discardedReverse[4], discardedReverse[5]]);
                expect(game.getCards()[3]).toEqual([13, 14, discardedReverse[6], discardedReverse[7]]);
            });

        });

    });

});