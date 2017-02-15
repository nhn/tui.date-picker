/**
 * @fileoverview RangeModel
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */
'use strict';

var Range = require('./range');

/**
 * @class
 * @ignore
 * @param {Array.<Array.<number>>} ranges - Ranges
 */
var RangeModel = tui.util.defineClass(/** @lends RangeModel.prototype */{
    init: function(ranges) {
        ranges = ranges || [];

        /**
         * @type {Array.<Range>}
         * @private
         */
        this._ranges = tui.util.map(ranges, function(range) {
            return new Range(range[0], range[1]);
        });
    },

    /**
     * Whether the ranges contain a time or time-range
     * @param {number} start - timestamp
     * @param {number} [end] - timestamp
     * @returns {boolean}
     */
    contains: function(start, end) {
        var i = 0;
        var length = this._ranges.length;
        var range;

        for (; i < length; i += 1) {
            range = this._ranges[i];
            if (range.contains(start, end)) {
                return true;
            }
        }

        return false;
    },

    /**
     * Whether overlaps with a point or range
     * @param {number} start - timestamp
     * @param {number} [end] - timestamp
     * @returns {boolean}
     */
    hasOverlap: function(start, end) {
        var i = 0;
        var length = this._ranges.length;
        var range;

        for (; i < length; i += 1) {
            range = this._ranges[i];
            if (range.isOverlapped(start, end)) {
                return true;
            }
        }

        return false;
    },

    /**
     * Add range
     * @param {number} start - timestamp
     * @param {number} [end] - timestamp
     */
    add: function(start, end) {
        this._ranges.push(new Range(start, end));
    },

    /**
     * Returns minimum value in ranges
     * @returns {number}
     */
    getMinimumValue: function() {
        return Math.min.apply(null, tui.util.map(this._ranges, function(range) {
            return range.start;
        }));
    },

    /**
     * Returns maximum value in ranges
     * @returns {number}
     */
    getMaximumValue: function() {
        return Math.max.apply(null, tui.util.map(this._ranges, function(range) {
            return range.end;
        }));
    },

    /**
     * @param {number} start - timestamp
     * @param {number} [end] - timestamp
     */
    exclude: function(start, end) {
        if (!tui.util.isNumber(end)) {
            end = start;
        }

        tui.util.forEach(this._ranges, function(range) {
            if (range.contains(start, end)) {
                // Should add split range
                this.add(end + 1, range.end);
            }
            range.exclude(start, end);
        }, this);

        // Reduce empty ranges
        this._ranges = tui.util.filter(this._ranges, function(range) {
            return !range.isEmpty();
        });
    }
});

module.exports = RangeModel;
