/**
 * @fileoverview DateTimeFormatter spec
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */
'use strict';

var $ = require('jquery');

var DateTimeFormatter = require('../src/js/dateTimeFormatter');

describe('DateTimeFormatter', function() {
    var formatter;

    afterEach(function() {
        formatter = null;
    });

    describe('"format" method', function() { // Parameters
        beforeEach(function() {
            formatter = new DateTimeFormatter('yyyy-MM-dd hh:mm');
        });

        it('should return formatted string', function() {
            expect(formatter.format(new Date(2016, 10, 28))).toEqual('2016-11-28 00:00');
            expect(formatter.format(new Date(2016, 10, 28, 10, 11))).toEqual('2016-11-28 10:11');

        });

        it('should return formatted string (with meridiem expression)', function() {
            formatter = new DateTimeFormatter('yyyy-MM-dd hh:mm a');
            expect(formatter.format(new Date(2016, 10, 28, 16, 11))).toEqual('2016-11-28 04:11 pm');
        });
    });

    describe('"parse" method', function() {
        beforeEach(function() {
            formatter = new DateTimeFormatter('yyyyMMdd hh:mm A');
        });

        it('should parse date+time string', function() {
            expect(formatter.parse('20160312 12:00 am')).toEqual(new Date(2016, 2, 12, 0, 0));
            expect(formatter.parse('20160312 12:00 pm')).toEqual(new Date(2016, 2, 12, 12, 0));
            expect(formatter.parse('20160312 12:00 pm')).toEqual(new Date(2016, 2, 12, 12, 0));
            expect(formatter.parse('20160312 13:00 pm')).toEqual(new Date(2016, 2, 12, 13, 0));
            expect(formatter.parse('20160312 10:00 am')).toEqual(new Date(2016, 2, 12, 10, 0));
        });

        it('should parse time string first than meridiem', function() {
            expect(formatter.parse('20160312 13:00 am')).toEqual(new Date(2016, 2, 12, 13, 0));
            expect(formatter.parse('20160312 16:00 am')).toEqual(new Date(2016, 2, 12, 16, 0));
        });
    });

    describe('on "yy/mm/dd"', function() {
        beforeEach(function() {
            formatter = new DateTimeFormatter('yy/MM/dd');
        });

        it('should format date to "16/11/28"', function() {
            expect(formatter.format(new Date(2016, 10, 28))).toEqual('16/11/28');
        });

        it('should parse "16/11/28" to dateHash', function() {
            expect(formatter.parse("16/11/28")).toEqual(new Date(2016, 10, 28));
        });
    });

    describe('on "mm dd"', function() {
        beforeEach(function() {
            formatter = new DateTimeFormatter('MM dd');
        });

        it('should format date to "05 12"', function() {
            expect(formatter.format(new Date(0, 4, 12))).toEqual('05 12');
            expect(formatter.format(new Date(2016, 4, 12))).toEqual('05 12');
        });

        it('should parse "5 12" to dateHash', function() {
            expect(formatter.parse("5 12")).toEqual(new Date(0, 4, 12));
        });
    });

    describe('on "m-d, yyyy"', function() {
        beforeEach(function() {
            formatter = new DateTimeFormatter('M-d, yyyy');
        });

        it('should format date to "1-28, 2016"', function() {
            expect(formatter.format(new Date(2016, 0, 28))).toEqual('1-28, 2016');
        });

        it('should parse "01/28, 2016:" to dateHash', function() {
            expect(formatter.parse('01/28, 2016')).toEqual(new Date(2016, 0, 28));
        });
    });

    it('should throw error with invalid date', function() {
        formatter = new DateTimeFormatter('yyyy/MM/dd');

        expect(function() {
            formatter.parse('2016/11/133')
        }).toThrow();

        expect(function() {
            formatter.parse('2016-11-12, 55')
        }).toThrow();
    });
});
