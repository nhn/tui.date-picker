/**
 * @fileoverview Util spec
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */
'use strict';

var $ = require('jquery');

var dateUtil = require('../src/js/dateUtil');

describe('getMeridiemHour()', function() {
    it('When "hour" is midnight(00:00), meridiem hour is 12.', function() {
        expect(dateUtil.getMeridiemHour(0)).toEqual(12);
    });

    it('When "hour" is over noon(12:00), meridiem hour is between 1~12.', function() {
        expect(dateUtil.getMeridiemHour(12)).toEqual(12);
        expect(dateUtil.getMeridiemHour(13)).toEqual(1);
        expect(dateUtil.getMeridiemHour(23)).toEqual(11);
    });
});

describe('getSafeNumber', function() {
    var getSafeNumber = dateUtil.getSafeNumber;

    it('should throw if defaultNumber is NaN', function() {
        expect(function() {
            getSafeNumber('3', NaN);
        }).toThrow();
    });

    it('should return defaultNumber if the first-param is NaN', function() {
        expect(getSafeNumber('a', 3)).toBe(3);
        expect(getSafeNumber(/a/, 3)).toBe(3);
        expect(getSafeNumber(undefined, 3)).toBe(3);
        expect(getSafeNumber(NaN, 3)).toBe(3);
        expect(getSafeNumber({}, 3)).toBe(3);
    });

    it('should return first-number if valid', function() {
        expect(getSafeNumber('', 3)).toBe(0); // Number('') === 0
        expect(getSafeNumber(null, 3)).toBe(0); // Number(null) === 0
        expect(getSafeNumber('2016', 3)).toBe(2016);
        expect(getSafeNumber(2016, 3)).toBe(2016);
    });
});

describe('getDateOfWeek', function() {
    var getDateOfWeek = dateUtil.getDateOfWeek;

    //
    // The first week of 2016-12-Calnedar
    // Sunday    Monday    Tuesday    Wednesday    Thursday    Firday    Saturday
    //  (27)      (28)      (29)       (30)         1           2         3
    //
    // The last week of 2016-11-Calnedar
    // Sunday    Monday    Tuesday    Wednesday    Thursday    Firday    Saturday
    //  27        28        29         30           (1)         (2)       (3)
    //

    it('should return sunday-(2016-11)-27 on above calendars', function() {
        expect(getDateOfWeek(2016, 12, 0, 0).getDate()).toEqual(27);
        expect(getDateOfWeek(2016, 12, 0, 0).getMonth()).toEqual(10); // November
        expect(getDateOfWeek(2016, 11, 4, 0).getDate()).toEqual(27);
        expect(getDateOfWeek(2016, 11, 4, 0).getMonth()).toEqual(10);
    });

    it('should return monday-(2016-11)-28 on above calendars', function() {
        expect(getDateOfWeek(2016, 12, 0, 1).getDate()).toEqual(28);
        expect(getDateOfWeek(2016, 12, 0, 1).getMonth()).toEqual(10); // November
        expect(getDateOfWeek(2016, 11, 4, 1).getDate()).toEqual(28);
        expect(getDateOfWeek(2016, 11, 4, 1).getMonth()).toEqual(10); // November
    });

    it('should return tuesday-(2016-11)-29 on above calendars', function() {
        expect(getDateOfWeek(2016, 12, 0, 2).getDate()).toEqual(29);
        expect(getDateOfWeek(2016, 12, 0, 2).getMonth()).toEqual(10); // November
        expect(getDateOfWeek(2016, 11, 4, 2).getDate()).toEqual(29);
        expect(getDateOfWeek(2016, 11, 4, 2).getMonth()).toEqual(10); // November
    });

    it('should return wednesday-(2016-11)-30 on above calendars', function() {
        expect(getDateOfWeek(2016, 12, 0, 3).getDate()).toEqual(30);
        expect(getDateOfWeek(2016, 12, 0, 3).getMonth()).toEqual(10); // November
        expect(getDateOfWeek(2016, 11, 4, 3).getDate()).toEqual(30);
        expect(getDateOfWeek(2016, 11, 4, 3).getMonth()).toEqual(10); // November
    });

    it('should return thursday-(2016-12)-1 on above calendars', function() {
        expect(getDateOfWeek(2016, 12, 0, 4).getDate()).toEqual(1);
        expect(getDateOfWeek(2016, 11, 4, 4).getMonth()).toEqual(11); // December
        expect(getDateOfWeek(2016, 11, 4, 4).getDate()).toEqual(1);
        expect(getDateOfWeek(2016, 11, 4, 4).getMonth()).toEqual(11); // December
    });

    it('should return friday-(2016-11)-2 on above calendars', function() {
        expect(getDateOfWeek(2016, 12, 0, 5).getDate()).toEqual(2);
        expect(getDateOfWeek(2016, 12, 0, 5).getMonth()).toEqual(11); // December
        expect(getDateOfWeek(2016, 11, 4, 5).getDate()).toEqual(2);
        expect(getDateOfWeek(2016, 11, 4, 5).getMonth()).toEqual(11); // December
    });

    it('should return saturday-(2016-11)-3 on above calendars', function() {
        expect(getDateOfWeek(2016, 12, 0, 6).getDate()).toEqual(3);
        expect(getDateOfWeek(2016, 12, 0, 6).getMonth()).toEqual(11); // December
        expect(getDateOfWeek(2016, 11, 4, 6).getDate()).toEqual(3);
        expect(getDateOfWeek(2016, 11, 4, 6).getMonth()).toEqual(11); // December
    });
});
