var RandomNumbersService = require('./../../services/randomNumbersService'),
    randomNumbersService = new RandomNumbersService();

require('jasmine-expect');

describe('Random Numbers Service', function() {

    describe('getRandomNumbers', function() {

        it('should return 1 random number between 1 and 10', function() {
            var randomNumbers = randomNumbersService.getRandomNumbers(1, 10, 1);
            expect(randomNumbers).toBeArrayOfSize(1);
            expect(randomNumbers).toBeArrayOfNumbers();
            expect(randomNumbers[0]).toBeWithinRange(1, 10);
        });

        it('should return 5 random numbers between 1 and 10', function() {
            var randomNumbers = randomNumbersService.getRandomNumbers(1, 10, 5);
            expect(randomNumbers).toBeArrayOfSize(5);
            expect(randomNumbers).toBeArrayOfNumbers();

            randomNumbers.forEach(function(number) {
                expect(number).toBeWithinRange(1, 10);

            });
        });

        it('should return 10 random numbers between 1 and 10', function() {
            var randomNumbers = randomNumbersService.getRandomNumbers(1, 10, 10);
            expect(randomNumbers).toBeArrayOfSize(10);
            expect(randomNumbers).toBeArrayOfNumbers();

            for(var i = 1; i <= 10; i++) {
                expect(randomNumbers).toContain(i);
            }
        });

    });

    describe('shuffle', function() {

        it('should not shuffle an empty array', function() {
            var array = [],
                shuffledArray = randomNumbersService.shuffle(array);

            expect(shuffledArray).toBeEmptyArray();
        });

        it('should shuffle an array correctly', function() {
            var array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                shuffledArray = randomNumbersService.shuffle(array);

            expect(shuffledArray).toBeArrayOfSize(10);
            expect(shuffledArray).toBeArrayOfNumbers();

            array.forEach(function(number) {
                expect(shuffledArray).toContain(number);
            });
        });

    });

});