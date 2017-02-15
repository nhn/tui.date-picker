/**
 * @fileoverview Utils for Datepicker component
 * @author NHN Ent. FE dev Lab. <dl_javascript@nhnent.com>
 * @dependency tui-code-snippet ^1.0.2
 */
'use strict';

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
        var firstDay = this.getFirstDay(year, month),
            lastDate = this.getLastDayInMonth(year, month);

        return Math.ceil((firstDay + lastDate) / 7);
    },

    /**
     * @param {Date} date - Date instance
     * @returns {boolean}
     */
    isValidDate: function(date) {
        return !isNaN(date.getTime());
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
        if (isNaN(defaultNumber) || !tui.util.isNumber(defaultNumber)) {
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
    }
};

module.exports = utils;
