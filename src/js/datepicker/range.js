/**
 * @fileoverview Range (in RangeModel)
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */
'use strict';


var isNumber = tui.util.isNumber;

/**
 * @class
 * @ignore
 * @param {number} start - Start of range
 * @param {number} [end] - End of range
 */
var Range = tui.util.defineClass(/** @lends Range.prototype */{
    init: function(start, end) {
        this.setRange(start, end);
    },

    /**
     * Set range
     * @param {number} start - timestamp
     * @param {number} [end] - timestamp
     */
    setRange: function(start, end) {
        if (!isNumber(end)) {
            end = start;
        }

        this.start = Math.min(start, end);
        this.end = Math.max(start, end);
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
     * @param {number} start - timestamp
     * @param {number} [end] - timestamp
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
     * @param {number} start - timestamp
     * @param {number} [end] - timestamp
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
     * @param {number} start - timestamp
     * @param {number} end - timestamp
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
