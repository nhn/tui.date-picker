/**
 * @fileoverview Utils for calendar component
 * @author NHN Net. FE dev Lab. <dl_javascript@nhnent.com>
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
     * Return date hash by parameter.
     *  if there are 3 parameter, the parameter is corgnized Date object
     *  if there are no parameter, return today's hash date
     * @param {Date|number} [year] A date instance or year
     * @param {number} [month] A month
     * @param {number} [date] A date
     * @returns {{year: *, month: *, date: *}}
     */
    getDateHash: function(year, month, date) {
        var nDate;

        if (arguments.length < 3) {
            nDate = arguments[0] || new Date();

            year = nDate.getFullYear();
            month = nDate.getMonth() + 1;
            date = nDate.getDate();
        }

        return {
            year: year,
            month: month,
            date: date
        };
    },

    /**
     * Return today that saved on component or create new date.
     * @returns {{year: *, month: *, date: *}}
     */
    getToday: function() {
        return utils.getDateHash();
    },

    /**
     * Get unix time from date hash
     * @param {Object} date A date hash
     * @param {number} date.year A year
     * @param {number} date.month A month
     * @param {number} date.date A date
     * @returns {number}
     * @example
     * utils.getTime({year:2010, month:5, date:12}); // 1273590000000
     */
    getTime: function(date) {
        return utils.getDateObject(date).getTime();
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
     * Get which day is last by parameters that include year and month information.
     * @param {number} year A year
     * @param {number} month A month
     * @returns {number} (0~6)
     */
    getLastDay: function(year, month) {
        return new Date(year, month, 0).getDay();
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
     * Get date instance.
     * @param {dateHash} dateHash A date hash
     * @returns {Date} Date
     * @example
     *  dateUtil.getDateObject({year:2010, month:5, date:12});
     *  dateUtil.getDateObject(2010, 5, 12); //year,month,date
     */
    getDateObject: function(dateHash) {
        if (arguments.length === 3) {
            return new Date(arguments[0], arguments[1] - 1, arguments[2]);
        }

        return new Date(dateHash.year, dateHash.month - 1, dateHash.date);
    },

    /**
     * Get related date hash with parameters that include date information.
     * @param {number} year A related value for year(you can use +/-)
     * @param {number} month A related value for month (you can use +/-)
     * @param {number} date A related value for day (you can use +/-)
     * @param {Object} dateObj standard date hash
     * @returns {Object} dateObj
     * @example
     *  dateUtil.getRelativeDate(1, 0, 0, {year:2000, month:1, date:1}); // {year:2001, month:1, date:1}
     *  dateUtil.getRelativeDate(0, 0, -1, {year:2010, month:1, date:1}); // {year:2009, month:12, date:31}
     */
    getRelativeDate: function(year, month, date, dateObj) {
        var nYear = (dateObj.year + year),
            nMonth = (dateObj.month + month - 1),
            nDate = (dateObj.date + date),
            nDateObj = new Date(nYear, nMonth, nDate);

        return utils.getDateHash(nDateObj);
    },

    /**
     * Binary search
     * @param {Array} field - Search field
     * @param {Array} value - Search target
     * @returns {{found: boolean, index: number}} Result
     */
    search: function(field, value) {
        var found = false,
            low = 0,
            high = field.length - 1,
            end, index, fieldValue;

        while (!found && !end) {
            index = Math.floor((low + high) / 2);
            fieldValue = field[index];

            if (fieldValue === value) {
                found = true;
            } else if (fieldValue < value) {
                low = index + 1;
            } else {
                high = index - 1;
            }
            end = (low > high);
        }

        return {
            found: found,
            index: (found || fieldValue > value) ? index : index + 1
        };
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
     * Whether the two dateHash objects are equal
     * @param {dateHash} a - dateHash
     * @param {dateHash} b - dateHash
     * @returns {boolean}
     */
    isEqualDateHash: function(a, b) {
        return a.year === b.year
            && a.month === b.month
            && a.date === b.date;
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
    }
};

module.exports = utils;
