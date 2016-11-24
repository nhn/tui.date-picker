/**
 * Created by nhnent on 2015. 12. 27..
 */
'use strict';

var utils = require('../src/utils');
describe('search', function() {
    var search = utils.search;

    it('found first', function() {
        expect(search([1, 2, 3], 1)).toEqual({
            found: true,
            index: 0
        });
    });
    it('notfound first', function() {
        expect(search([1, 2, 3], -1)).toEqual({
            found: false,
            index: 0
        });
    });
    it('found middle', function() {
        expect(search([1, 2, 3], 2)).toEqual({
            found: true,
            index: 1
        });
    });
    it('notfound middle', function() {
        expect(search([1, 2, 3], 1.5)).toEqual({
            found: false,
            index: 1
        });
    });
    it('found end', function() {
        expect(search([1, 2, 3], 3)).toEqual({
            found: true,
            index: 2
        });
    });
    it('notfound end', function() {
        expect(search([1, 2, 3], 4)).toEqual({
            found: false,
            index: 3
        });
    });
});

describe('getMeridiemHour()', function() {
    it('When "hour" is midnight(00:00), meridiem hour is 12.', function() {
        expect(utils.getMeridiemHour(0)).toEqual(12);
    });

    it('When "hour" is over noon(12:00), meridiem hour is between 1~12.', function() {
        expect(utils.getMeridiemHour(12)).toEqual(12);
        expect(utils.getMeridiemHour(13)).toEqual(1);
        expect(utils.getMeridiemHour(23)).toEqual(11);
    });
});

describe('getSafeNumber', function() {
    var safeNumber = utils.getSafeNumber;

    it('should throw if defaultNumber is NaN', function() {
        expect(function() {
            safeNumber('3', NaN);
        }).toThrow();
    });

    it('should return defaultNumber if the first-param is NaN', function() {
        expect(safeNumber('a', 3)).toBe(3);
        expect(safeNumber(/a/, 3)).toBe(3);
        expect(safeNumber(undefined, 3)).toBe(3);
        expect(safeNumber(NaN, 3)).toBe(3);
        expect(safeNumber({}, 3)).toBe(3);
    });

    it('should return first-number if valid', function() {
        expect(safeNumber('', 3)).toBe(0); // Number('') === 0
        expect(safeNumber(null, 3)).toBe(0); // Number(null) === 0
        expect(safeNumber('2016', 3)).toBe(2016);
        expect(safeNumber(2016, 3)).toBe(2016);
    });
});
