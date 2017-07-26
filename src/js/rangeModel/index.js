/**
 * @fileoverview RangeModel
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');

var Range = require('./range');

/**
 * @class
 * @ignore
 * @param {Array.<Array.<number>>} ranges - Ranges
 */
var RangeModel = snippet.defineClass(/** @lends RangeModel.prototype */{
    init: function(ranges) {
        ranges = ranges || [];

        /**
         * @type {Array.<Range>}
         * @private
         */
        this._ranges = [];

        snippet.forEach(ranges, function(range) {
            this.add(range[0], range[1]);
        }, this);
    },

    /**
     * Whether the ranges contain a time or time-range
     * @param {number} start - Start
     * @param {number} [end] - End
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
     * @param {number} start - Start
     * @param {number} [end] - End
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
     * @param {number} start - Start
     * @param {number} [end] - End
     */
    add: function(start, end) {
        var overlapped = false;
        var i = 0;
        var len = this._ranges.length;
        var range;

        for (; i < len; i += 1) {
            range = this._ranges[i];
            overlapped = range.isOverlapped(start, end);

            if (overlapped) {
                range.merge(start, end);
                break;
            }

            if (start < range.start) {
                break;
            }
        }

        if (!overlapped) {
            this._ranges.splice(i, 0, new Range(start, end));
        }
    },

    /**
     * Returns minimum value in ranges
     * @returns {number}
     */
    getMinimumValue: function() {
        return this._ranges[0].start;
    },

    /**
     * Returns maximum value in ranges
     * @returns {number}
     */
    getMaximumValue: function() {
        var length = this._ranges.length;

        return this._ranges[length - 1].end;
    },

    /**
     * @param {number} start - Start
     * @param {number} [end] - End
     */
    exclude: function(start, end) {
        if (!snippet.isNumber(end)) {
            end = start;
        }

        snippet.forEach(this._ranges, function(range) {
            var rangeEnd;

            if (range.isOverlapped(start, end)) {
                rangeEnd = range.end; // Save before excluding
                range.exclude(start, end);

                if (end + 1 <= rangeEnd) {
                    this.add(end + 1, rangeEnd); // Add split range
                }
            }
        }, this);

        // Reduce empty ranges
        this._ranges = snippet.filter(this._ranges, function(range) {
            return !range.isEmpty();
        });
    },

    /**
     * Returns the first overlapped range from the point or range
     * @param {number} start - Start
     * @param {number} end - End
     * @returns {Array.<number>} - [start, end]
     */
    findOverlappedRange: function(start, end) {
        var i = 0;
        var len = this._ranges.length;
        var range;

        for (; i < len; i += 1) {
            range = this._ranges[i];
            if (range.isOverlapped(start, end)) {
                return [range.start, range.end];
            }
        }

        return null;
    }
});

module.exports = RangeModel;
