/**
 * @fileoverview Utils for DatePicker component
 * @author NHN Ent. FE dev Lab. <dl_javascript@nhnent.com>
 * @dependency tui-code-snippet ^1.0.2
 */

'use strict';

var snippet = require('tui-code-snippet');

var constants = require('./constants');

var TYPE_DATE = constants.TYPE_DATE;
var TYPE_MONTH = constants.TYPE_MONTH;
var TYPE_YEAR = constants.TYPE_YEAR;

/**
 * Utils of calendar
 * @namespace dateUtil
 * @ignore
 */
var utils = {
    /**
     * Get weeks count by paramenter
     * @param {number} year A year
     * @param {number} month A month
     * @returns {number} Weeks count (4~6)
     **/
    getWeeksCount: function(year, month) {
        var firstDay = utils.getFirstDay(year, month),
            lastDate = utils.getLastDayInMonth(year, month);

        return Math.ceil((firstDay + lastDate) / 7);
    },

    /**
     * @param {Date} date - Date instance
     * @returns {boolean}
     */
    isValidDate: function(date) {
        return snippet.isDate(date) && !isNaN(date.getTime());
    },

    /**
     * Get which day is first by parameters that include year and month information.
     * @param {number} year A year
     * @param {number} month A month
     * @returns {number} (0~6)
     */
    getFirstDay: function(year, month) {
        return new Date(year, month - 1, 1).getDay();
    },

    /**
     * Get last date by parameters that include year and month information.
     * @param {number} year A year
     * @param {number} month A month
     * @returns {number} (1~31)
     */
    getLastDayInMonth: function(year, month) {
        return new Date(year, month, 0).getDate();
    },

    /**
     * Chagne number 0~9 to '00~09'
     * @param {number} number number
     * @returns {string}
     * @example
     *  dateUtil.prependLeadingZero(0); //  '00'
     *  dateUtil.prependLeadingZero(9); //  '09'
     *  dateUtil.prependLeadingZero(12); //  '12'
     */
    prependLeadingZero: function(number) {
        var prefix = '';

        if (number < 10) {
            prefix = '0';
        }

        return prefix + number;
    },

    /**
     * Get meridiem hour
     * @param {number} hour - Original hour
     * @returns {number} Converted meridiem hour
     */
    getMeridiemHour: function(hour) {
        hour %= 12;

        if (hour === 0) {
            hour = 12;
        }

        return hour;
    },

    /**
     * Returns number or default
     * @param {*} any - Any value
     * @param {number} defaultNumber - Default number
     * @throws Will throw an error if the defaultNumber is invalid.
     * @returns {number}
     */
    getSafeNumber: function(any, defaultNumber) {
        if (isNaN(defaultNumber) || !snippet.isNumber(defaultNumber)) {
            throw Error('The defaultNumber must be a valid number.');
        }
        if (isNaN(any)) {
            return defaultNumber;
        }

        return Number(any);
    },

    /**
     * Return date of the week
     * @param {number} year - Year
     * @param {number} month - Month
     * @param {number} weekNumber - Week number (0~5)
     * @param {number} dayNumber - Day number (0: sunday, 1: monday, ....)
     * @returns {number}
     */
    getDateOfWeek: function(year, month, weekNumber, dayNumber) {
        var firstDayOfMonth = new Date(year, month - 1).getDay();
        var dateOffset = firstDayOfMonth - dayNumber - 1;

        return new Date(year, month - 1, (weekNumber * 7) - dateOffset);
    },

    /**
     * Returns range arr
     * @param {number} start - Start value
     * @param {number} end - End value
     * @returns {Array}
     */
    getRangeArr: function(start, end) {
        var arr = [];
        var i;

        if (start > end) {
            for (i = end; i >= start; i -= 1) {
                arr.push(i);
            }
        } else {
            for (i = start; i <= end; i += 1) {
                arr.push(i);
            }
        }

        return arr;
    },

    /**
     * Returns cloned date with the start of a unit of time
     * @param {Date|number} date - Original date
     * @param {string} [type = TYPE_DATE] - Unit type
     * @throws {Error}
     * @returns {Date}
     */
    cloneWithStartOf: function(date, type) {
        type = type || TYPE_DATE;
        date = new Date(date);

        // Does not consider time-level yet.
        date.setHours(0, 0, 0, 0);

        switch (type) {
            case TYPE_DATE:
                break;
            case TYPE_MONTH:
                date.setDate(1);
                break;
            case TYPE_YEAR:
                date.setMonth(0, 1);
                break;
            default:
                throw Error('Unsupported type: ' + type);
        }

        return date;
    },

    /**
     * Returns cloned date with the end of a unit of time
     * @param {Date|number} date - Original date
     * @param {string} [type = TYPE_DATE] - Unit type
     * @throws {Error}
     * @returns {Date}
     */
    cloneWithEndOf: function(date, type) {
        type = type || TYPE_DATE;
        date = new Date(date);

        // Does not consider time-level yet.
        date.setHours(23, 59, 59, 999);

        switch (type) {
            case TYPE_DATE:
                break;
            case TYPE_MONTH:
                date.setMonth(date.getMonth() + 1, 0);
                break;
            case TYPE_YEAR:
                date.setMonth(11, 31);
                break;
            default:
                throw Error('Unsupported type: ' + type);
        }

        return date;
    },

    /**
     * Compare two dates
     * @param {Date|number} dateA - Date
     * @param {Date|number} dateB - Date
     * @param {string} [cmpLevel] - Comparing level
     * @returns {number}
     */
    compare: function(dateA, dateB, cmpLevel) {
        var aTimestamp, bTimestamp;

        if (!(utils.isValidDate(dateA) && utils.isValidDate(dateB))) {
            return NaN;
        }

        if (!cmpLevel) {
            aTimestamp = dateA.getTime();
            bTimestamp = dateB.getTime();
        } else {
            aTimestamp = utils.cloneWithStartOf(dateA, cmpLevel).getTime();
            bTimestamp = utils.cloneWithStartOf(dateB, cmpLevel).getTime();
        }

        if (aTimestamp > bTimestamp) {
            return 1;
        }

        return aTimestamp === bTimestamp ? 0 : -1;
    },

    /**
     * Returns whether two dates are same
     * @param {Date|number} dateA - Date
     * @param {Date|number} dateB - Date
     * @param {string} [cmpLevel] - Comparing level
     * @returns {boolean}
     */
    isSame: function(dateA, dateB, cmpLevel) {
        return utils.compare(dateA, dateB, cmpLevel) === 0;
    },

    /**
     * Returns whether the target is in range
     * @param {Date|number} start - Range start
     * @param {Date|number} end - Range end
     * @param {Date|number} target - Target
     * @param {string} [cmpLevel = TYPE_DATE] - Comparing level
     * @returns {boolean}
     */
    inRange: function(start, end, target, cmpLevel) {
        return utils.compare(start, target, cmpLevel) < 1 && utils.compare(end, target, cmpLevel) > -1;
    }
};

module.exports = utils;
