/**
 * @fileoverview Date <-> Text formatting module
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');

var dateUtil = require('./dateUtil');
var constants = require('./constants');
var localeTexts = require('./localeTexts');

var rFormableKeys = /\\?(yyyy|yy|mmmm|mmm|mm|m|dd|d|hh|h|a)/gi;
var mapForConverting = {
    yyyy: {
        expression: '(\\d{4}|\\d{2})',
        type: constants.TYPE_YEAR
    },
    yy: {
        expression: '(\\d{4}|\\d{2})',
        type: constants.TYPE_YEAR
    },
    y: {
        expression: '(\\d{4}|\\d{2})',
        type: constants.TYPE_YEAR
    },
    M: {
        expression: '(1[012]|0[1-9]|[1-9])',
        type: constants.TYPE_MONTH
    },
    MM: {
        expression: '(1[012]|0[1-9]|[1-9])',
        type: constants.TYPE_MONTH
    },
    MMM: {
        expression: '(1[012]|0[1-9]|[1-9])',
        type: constants.TYPE_MONTH
    },
    MMMM: {
        expression: '(1[012]|0[1-9]|[1-9])',
        type: constants.TYPE_MONTH
    },
    mmm: {
        expression: '(1[012]|0[1-9]|[1-9])',
        type: constants.TYPE_MONTH
    },
    mmmm: {
        expression: '(1[012]|0[1-9]|[1-9])',
        type: constants.TYPE_MONTH
    },
    dd: {
        expression: '([12]\\d{1}|3[01]|0[1-9]|[1-9])',
        type: constants.TYPE_DATE
    },
    d: {
        expression: '([12]\\d{1}|3[01]|0[1-9]|[1-9])',
        type: constants.TYPE_DATE
    },
    D: {
        expression: '([12]\\d{1}|3[01]|0[1-9]|[1-9])',
        type: constants.TYPE_DATE
    },
    DD: {
        expression: '([12]\\d{1}|3[01]|0[1-9]|[1-9])',
        type: constants.TYPE_DATE
    },
    h: {
        expression: '(d{1}|0\\d{1}|1\\d{1}|2[0123])',
        type: constants.TYPE_HOUR
    },
    hh: {
        expression: '(d{1}|[01]\\d{1}|2[0123])',
        type: constants.TYPE_HOUR
    },
    H: {
        expression: '(d{1}|0\\d{1}|1\\d{1}|2[0123])',
        type: constants.TYPE_HOUR
    },
    HH: {
        expression: '(d{1}|[01]\\d{1}|2[0123])',
        type: constants.TYPE_HOUR
    },
    m: {
        expression: '(d{1}|[012345]\\d{1})',
        type: constants.TYPE_MINUTE
    },
    mm: {
        expression: '(d{1}|[012345]\\d{1})',
        type: constants.TYPE_MINUTE
    },
    a: {
        expression: '([ap]m)',
        type: constants.TYPE_MERIDIEM
    },
    A: {
        expression: '([ap]m)',
        type: constants.TYPE_MERIDIEM
    }
};

/**
 * @class
 * @ignore
 */
var DateTimeFormatter = snippet.defineClass(/** @lends DateTimeFormatter.prototype */{
    init: function(rawStr, titles) {
        /**
         * @type {string}
         * @private
         */
        this._rawStr = rawStr;

        /**
         * @type {Array}
         * @private
         * @example
         *  rawStr = "yyyy-MM-dd" --> keyOrder = ['year', 'month', 'date']
         *  rawStr = "MM/dd, yyyy" --> keyOrder = ['month', 'date', 'year']
         */
        this._keyOrder = null;

        /**
         * @type {RegExp}
         * @private
         */
        this._regExp = null;

        /**
         * Titles
         * @type {object}
         * @private
         */
        this._titles = titles || localeTexts.en.titles;

        this._parseFormat();
    },

    /**
     * Parse initial format and make the keyOrder, regExp
     * @private
     */
    _parseFormat: function() {
        var regExpStr = '^';
        var matchedKeys = this._rawStr.match(rFormableKeys);
        var keyOrder = [];

        matchedKeys = snippet.filter(matchedKeys, function(key) {
            return key[0] !== '\\'; // escape character
        });

        snippet.forEach(matchedKeys, function(key, index) {
            if (!/m/i.test(key)) {
                key = key.toLowerCase();
            }

            regExpStr += (mapForConverting[key].expression + '[\\D\\s]*');
            keyOrder[index] = mapForConverting[key].type;
        });

        // This formatter does not allow additional numbers at the end of string.
        regExpStr += '$';

        this._keyOrder = keyOrder;

        this._regExp = new RegExp(regExpStr, 'gi');
    },

    /**
     * Parse string to dateHash
     * @param {string} str - Date string
     * @returns {Date}
     */
    parse: function(str) {
        var dateHash = {
            year: 0,
            month: 1,
            date: 1,
            hour: 0,
            minute: 0
        };
        var hasMeridiem = false;
        var isPM = false;
        var matched;

        this._regExp.lastIndex = 0;
        matched = this._regExp.exec(str);

        if (!matched) {
            throw Error('DateTimeFormatter: Not matched - "' + str + '"');
        }

        snippet.forEach(this._keyOrder, function(name, index) {
            var value = matched[index + 1];

            if (name === constants.TYPE_MERIDIEM && /[ap]m/i.test(value)) {
                hasMeridiem = true;
                isPM = /pm/i.test(value);
            } else {
                value = Number(value);

                if (value !== 0 && !value) {
                    throw Error('DateTimeFormatter: Unknown value - ' + matched[index + 1]);
                }

                if (name === constants.TYPE_YEAR && value < 100) {
                    value += 2000;
                }

                dateHash[name] = value;
            }
        });

        if (hasMeridiem) {
            isPM = isPM || dateHash.hour > 12;
            dateHash.hour %= 12;
            if (isPM) {
                dateHash.hour += 12;
            }
        }

        return new Date(dateHash.year, dateHash.month - 1, dateHash.date, dateHash.hour, dateHash.minute);
    },

    /**
     * Returns raw string of format
     * @returns {string}
     */
    getRawString: function() {
        return this._rawStr;
    },

    /**
     * Format date to string
     * @param {Date} dateObj - Date object
     * @returns {string}
     */
    format: function(dateObj) {
        var year = dateObj.getFullYear();
        var month = dateObj.getMonth() + 1;
        var dayInMonth = dateObj.getDate();
        var day = dateObj.getDay();
        var hour = dateObj.getHours();
        var minute = dateObj.getMinutes();
        var meridiem = 'a'; // Default value for unusing meridiem format
        var replaceMap;

        if (snippet.inArray(constants.TYPE_MERIDIEM, this._keyOrder) > -1) {
            meridiem = hour >= 12 ? 'pm' : 'am';
            hour = dateUtil.getMeridiemHour(hour);
        }

        replaceMap = {
            yyyy: year,
            yy: String(year).substr(2, 2),
            M: month,
            MM: dateUtil.prependLeadingZero(month),
            MMM: this._titles.MMM[month - 1],
            MMMM: this._titles.MMMM[month - 1],
            d: dayInMonth,
            dd: dateUtil.prependLeadingZero(dayInMonth),
            D: this._titles.D[day],
            DD: this._titles.DD[day],
            hh: dateUtil.prependLeadingZero(hour),
            h: hour,
            mm: dateUtil.prependLeadingZero(minute),
            m: minute,
            A: meridiem.toUpperCase(),
            a: meridiem
        };

        return this._rawStr.replace(rFormableKeys, function(key) {
            if (key[0] === '\\') {
                return key.substr(1);
            }

            return replaceMap[key] || replaceMap[key.toLowerCase()] || '';
        });
    }
});

module.exports = DateTimeFormatter;
