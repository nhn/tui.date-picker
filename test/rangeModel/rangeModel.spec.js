/**
 * @fileoverview RangeModel spec
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */
'use strict';

var $ = require('jquery');

var RangeModel = require('../../src/js/rangeModel/index');

describe('RangeModel', function() {
    var rangeModel;

    beforeEach(function() {
        rangeModel = new RangeModel([
            [10, 20],
            [400, 500],
            [100, 300],
            [25, 35],
            [290, 310]
        ]);
    });

    it('"contains" a value in ranges', function() {
        expect(rangeModel.contains(10)).toBe(true);
        expect(rangeModel.contains(15)).toBe(true);
        expect(rangeModel.contains(444)).toBe(true);

        expect(rangeModel.contains(555)).toBe(false);
        expect(rangeModel.contains(333)).toBe(false);
        expect(rangeModel.contains(-1)).toBe(false);
    });

    it('"contains" a range in ranges', function() {
        expect(rangeModel.contains(10, 15)).toBe(true);
        expect(rangeModel.contains(100, 200)).toBe(true);
        expect(rangeModel.contains(25, 30)).toBe(true);

        expect(rangeModel.contains(35, 55)).toBe(false);
        expect(rangeModel.contains(10, 150)).toBe(false);
        expect(rangeModel.contains(-30, -1)).toBe(false);
    });

    it('check overlap from a value (It operates like the "contains")', function() {
        expect(rangeModel.hasOverlap(10)).toBe(true);
        expect(rangeModel.hasOverlap(15)).toBe(true);
        expect(rangeModel.hasOverlap(444)).toBe(true);

        expect(rangeModel.hasOverlap(555)).toBe(false);
        expect(rangeModel.hasOverlap(333)).toBe(false);
        expect(rangeModel.hasOverlap(-1)).toBe(false);
    });

    it('check overlap from a range', function() {
        expect(rangeModel.hasOverlap(0, 11)).toBe(true);
        expect(rangeModel.hasOverlap(40, 150)).toBe(true);
        expect(rangeModel.hasOverlap(450, 600)).toBe(true);

        expect(rangeModel.hasOverlap(0, 5)).toBe(false);
        expect(rangeModel.hasOverlap(333, 399)).toBe(false);
        expect(rangeModel.hasOverlap(501, 600)).toBe(false);
    });

    it('add a value', function() {
        expect(rangeModel.contains(55)).toBe(false);

        rangeModel.add(55);

        expect(rangeModel.contains(55)).toBe(true);
    });

    it('add a range', function() {
        expect(rangeModel.contains(55, 60)).toBe(false);

        rangeModel.add(55, 60);

        expect(rangeModel.contains(55, 60)).toBe(true);
    });

    it('exclude a value', function() {
        expect(rangeModel.contains(15)).toBe(true);

        rangeModel.exclude(15);

        expect(rangeModel.contains(15)).toBe(false);
    });

    it('exclude a range', function() {
        expect(rangeModel.contains(15, 20)).toBe(true);

        rangeModel.exclude(15, 20);

        expect(rangeModel.contains(15, 20)).toBe(false);
    });

    it('exclude wide-range(containing all)', function() {
        rangeModel.exclude(0, 500);

        expect(rangeModel._ranges.length).toBe(0);
    });

    it('get minimum value in ranges', function() {
        expect(rangeModel.getMinimumValue()).toBe(10);
    });

    it('get maximum value in ranges', function() {
        expect(rangeModel.getMaximumValue()).toBe(500);
    });

    it('get overlapped range from a point', function() {
        var overlappedRange = rangeModel.findOverlappedRange(100);

        expect(overlappedRange[0]).toBe(100);
        expect(overlappedRange[1]).toBe(310);
    });
});
