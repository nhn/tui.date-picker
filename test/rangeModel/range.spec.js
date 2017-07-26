/**
 * @fileoverview Range (in RangeModel) spec
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */
'use strict';

var $ = require('jquery');

var Range = require('../../src/js/rangeModel/range');

describe('Range', function() {
    var range;

    beforeEach(function() {
        range = new Range(100, 300);
    });

    it('contains a value', function() {
        expect(range.contains(100)).toBe(true);
        expect(range.contains(200)).toBe(true);
        expect(range.contains(300)).toBe(true);

        expect(range.contains(10)).toBe(false);
        expect(range.contains(-10)).toBe(false);
        expect(range.contains(1000)).toBe(false);
    });

    it('contains a sub-range', function() {
        expect(range.contains(100, 110)).toBe(true);
        expect(range.contains(200, 210)).toBe(true);
        expect(range.contains(290, 300)).toBe(true);

        expect(range.contains(10, 99)).toBe(false);
        expect(range.contains(10, 200)).toBe(false);
        expect(range.contains(-200, -100)).toBe(false);
    });

    it('(re)set', function() {
        range.setRange(10, 20);

        expect(range.start).toBe(10);
        expect(range.end).toBe(20);
        expect(range.contains(10, 20)).toBe(true);
    });

    it('set empty', function() {
        expect(range.isEmpty()).toBe(false);

        range.setEmpty();

        expect(range.isEmpty()).toBe(true);
    });

    it('check overlaps', function() {
        expect(range.isOverlapped(10, 110)).toBe(true);
        expect(range.isOverlapped(101, 120)).toBe(true);
        expect(range.isOverlapped(250, 310)).toBe(true);
        expect(range.isOverlapped(1, 1000)).toBe(true);

        expect(range.isOverlapped(1, 99)).toBe(false);
        expect(range.isOverlapped(301, 333)).toBe(false);

        expect(range.isOverlapped(200)).toBe(true);
        expect(range.isOverlapped(100)).toBe(true);
        expect(range.isOverlapped(300)).toBe(true);
    });

    it('exclude a sub-range(in-range)', function() {
        expect(range.contains(110, 200)).toBe(true);

        range.exclude(110, 200); // Range: 100 - 109

        expect(range.contains(100, 109)).toBe(true);
        expect(range.contains(110, 200)).toBe(false);
        expect(range.contains(200, 300)).toBe(false);
    });
    it('exclude a sub-range(right-side)', function() {
        expect(range.isOverlapped(201, 400)).toBe(true);

        range.exclude(201, 400); // Range: 100 - 200

        expect(range.contains(100, 200)).toBe(true);
        expect(range.isOverlapped(201, 300)).toBe(false);
    });

    it('exclude a sub-range(left-side)', function() {
        expect(range.isOverlapped(10, 199)).toBe(true);

        range.exclude(10, 199); // Range: 200 - 300

        expect(range.contains(200, 300)).toBe(true);
        expect(range.isOverlapped(10, 199)).toBe(false);
        expect(range.isOverlapped(301, 400)).toBe(false);
    });

    it('merge a range', function() {
        range.merge(0, 100);

        expect(range.start).toBe(0);
        expect(range.end).toBe(300);
    });
});
