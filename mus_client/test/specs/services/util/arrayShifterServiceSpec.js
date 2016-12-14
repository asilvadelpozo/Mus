describe('Array Shifter Service', function() {
    'use strict';

    var arrayShifterService;

    beforeEach(function() {
        module('musApp');
    });

    beforeEach(inject(function($injector) {
        arrayShifterService = $injector.get('arrayShifterService');
    }));

    var testCases = [
        {array: [], positions: 1, direction: 'right', result: []},
        {array: [], positions: 1, direction: 'left', result: []},
        {array: [1], positions: 1, direction: 'right', result: [1]},
        {array: [1], positions: 1, direction: 'left', result: [1]},
        {array: [1, 2, 3, 4], positions: 1, direction: 'right', result: [4, 1, 2, 3]},
        {array: [1, 2, 3, 4], positions: 4, direction: 'right', result: [1, 2, 3, 4]},
        {array: [1, 2, 3, 4], positions: 1, direction: 'left', result: [2, 3, 4, 1]},
        {array: [1, 2, 3, 4], positions: 4, direction: 'left', result: [1, 2, 3, 4]}
    ];

    testCases.forEach(function(testCase) {

        it('shifting array [' + testCase.array + '] ' + testCase.positions + ' positions to the ' + testCase.direction + ' returns [' + testCase.result + ']', function () {
            var result = arrayShifterService.shiftArrayNPositionsOnDirection(testCase.array, testCase.positions, testCase.direction);
            expect(result).toEqual(testCase.result);
        });

    });

});