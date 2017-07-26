/**
 * @fileoverview Range (in RangeModel)
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');

var isNumber = snippet.isNumber;

/**
 * @class
 * @ignore
 * @param {number} start - Start of range
 * @param {number} [end] - End of range
 */
var Range = snippet.defineClass(/** @lends Range.prototype */{
    init: function(start, end) {
        this.setRange(start, end);
    },

    /**
     * Set range
     * @param {number} start - Start number
     * @param {number} [end] - End number
     */
    setRange: function(start, end) {
        if (!isNumber(end)) {
            end = start;
        }

        this.start = Math.min(start, end);
        this.end = Math.max(start, end);
    },

    /**
     * Merge range
     * @param {number} start - Start
     * @param {number} [end] - End
     */
    merge: function(start, end) {
        if (!isNumber(start) || !isNumber(end) || !this.isOverlapped(start, end)) {
            return;
        }

        this.start = Math.min(start, this.start);
        this.end = Math.max(end, this.end);
    },

    /**
     * Whether being empty.
     * @returns {boolean}
     */
    isEmpty: function() {
        return !isNumber(this.start) || !isNumber(this.end);
    },

    /**
     * Set empty
     */
    setEmpty: function() {
        this.start = this.end = null;
    },

    /**
     * Whether containing a range.
     * @param {number} start - Start
     * @param {number} [end] - End
     * @returns {boolean}
     */
    contains: function(start, end) {
        if (!isNumber(end)) {
            end = start;
        }

        return this.start <= start && end <= this.end;
    },

    /**
     * Whether overlaps with a range
     * @param {number} start - Start
     * @param {number} [end] - End
     * @returns {boolean}
     */
    isOverlapped: function(start, end) {
        if (!isNumber(end)) {
            end = start;
        }

        return this.start <= end && this.end >= start;
    },

    /**
     * Exclude a range
     * @param {number} start - Start
     * @param {number} end - End
     */
    exclude: function(start, end) {
        if (start <= this.start && end >= this.end) {
            // Excluding range contains this
            this.setEmpty();
        } else if (this.contains(start)) {
            this.setRange(this.start, start - 1);
        } else if (this.contains(end)) {
            this.setRange(end + 1, this.end);
        }
    }
});

module.exports = Range;
