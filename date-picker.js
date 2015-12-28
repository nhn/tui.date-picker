(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
tui.util.defineNamespace('tui.component.Spinbox', require('./src/spinbox'));
tui.util.defineNamespace('tui.component.TimePicker', require('./src/timepicker'));
tui.util.defineNamespace('tui.component.DatePicker', require('./src/datepicker'));

},{"./src/datepicker":2,"./src/spinbox":3,"./src/timepicker":4}],2:[function(require,module,exports){
/**
 * Created by nhnent on 15. 5. 14..
 * @fileoverview This component provides a calendar for picking a date & time.
 * @author NHN ent FE dev <dl_javascript@nhnent.com> <minkyu.yi@nhnent.com>
 * @dependency jquery-1.8.3, code-snippet-1.0.2, component-calendar-1.0.1, timePicker.js
 */

'use strict';

var utils = require('./utils');

var inArray = tui.util.inArray,
    formatRegExp = /yyyy|yy|mm|m|dd|d/gi,
    mapForConverting = {
        yyyy: {expression: '(\\d{4}|\\d{2})', type: 'year'},
        yy: {expression: '(\\d{4}|\\d{2})', type: 'year'},
        y: {expression: '(\\d{4}|\\d{2})', type: 'year'},
        mm: {expression: '(1[012]|0[1-9]|[1-9]\\b)', type: 'month'},
        m: {expression: '(1[012]|0[1-9]|[1-9]\\b)', type: 'month'},
        dd: {expression: '([12]\\d{1}|3[01]|0[1-9]|[1-9]\\b)', type: 'date'},
        d: {expression: '([12]\\d{1}|3[01]|0[1-9]|[1-9]\\b)', type: 'date'}
    },
    CONSTANTS = {
        MIN_YEAR: 1970,
        MAX_YEAR: 2999,
        MONTH_DAYS: [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        WRAPPER_TAG: '<div style="position:absolute;"></div>',
        MIN_EDGE: +new Date(0),
        MAX_EDGE: +new Date(2999, 11, 31),
        YEAR_TO_MS: 31536000000
    };

/**
 * A number, or a string containing a number.
 * @typedef {Object} dateHash
 * @property {number} year - 1970~2999
 * @property {number} month - 1~12
 * @property {number} date - 1~31
 */

/**
 * Create DatePicker<br>
 * You can get a date from 'getYear', 'getMonth', 'getDayInMonth', 'getDateObject'
 * @constructor
 * @param {Object} option - options for DatePicker
 *      @param {HTMLElement|string} option.element - input element(or selector) of DatePicker
 *      @param {dateHash} [option.date = today] - initial date object
 *      @param {string} [option.dateForm = 'yyyy-mm-dd'] - format of date string
 *      @param {string} [option.defaultCentury = 20] - if year-format is yy, this value is prepended automatically.
 *      @param {string} [option.selectableClassName = 'selectable'] - for selectable date elements
 *      @param {string} [option.selectedClassName = 'selected'] - for selected date element
 *      @param {Array.<Array.<dateHash>>} [options.selectableRanges] - Selectable date ranges, See example
 *      @param {Object} [option.pos] - calendar position style value
 *          @param {number} [option.pos.left] - position left of calendar
 *          @param {number} [option.pos.top] - position top of calendar
 *          @param {number} [option.pos.zIndex] - z-index of calendar
 *      @param {Object} [option.openers = [element]] - opener button list (example - icon, button, etc.)
 *      @param {boolean} [option.showAlways = false] - whether the datepicker shows the calendar always
 *      @param {boolean} [option.useTouchEvent = true] - whether the datepicker uses touch events
 *      @param {tui.component.TimePicker} [option.timePicker] - TimePicker instance
 * @param {tui.component.Calendar} calendar - Calendar instance
 * @example
 *   var calendar = new tui.component.Calendar({
 *       element: '#layer',
 *       titleFormat: 'yyyy년 m월',
 *       todayFormat: 'yyyy년 mm월 dd일 (D)'
 *   });
 *
 *   var timePicker = new tui.component.TimePicker({
 *       showMeridian: true,
 *       defaultHour: 13,
 *       defaultMinute: 24
 *   });
 *
 *   var range1 = [
 *          {year: 2015, month:1, date: 1},
 *          {year: 2015, month:2, date: 1}
 *      ],
 *      range2 = [
 *          {year: 2015, month:3, date: 1},
 *          {year: 2015, month:4, date: 1}
 *      ],
 *      range3 = [
 *          {year: 2015, month:6, date: 1},
 *          {year: 2015, month:7, date: 1}
 *      ];
 *
 *   var picker1 = new tui.component.DatePicker({
 *       element: '#picker',
 *       dateForm: 'yyyy년 mm월 dd일 - ',
 *       date: {year: 2015, month: 1, date: 1 },
 *       selectableRanges: [range1, range2, range3],
 *       openers: ['#opener'],
 *       timePicker: timePicker
 *   }, calendar);
 *
 *   // Close calendar when select a date
 *   $('#layer').on('click', function(event) {
 *       var $el = $(event.target);
 *
 *       if ($el.hasClass('selectable')) {
 *           picker1.close();
 *       }
 *   });
 */
var DatePicker = tui.util.defineClass(/** @lends DatePicker.prototype */{
    init: function(option, calendar) {
        // set defaults
        option = tui.util.extend({
            dateForm: 'yyyy-mm-dd ',
            defaultCentury: '20',
            selectableClassName: 'selectable',
            selectedClassName: 'selected',
            selectableRanges: [],
            showAlways: false,
            useTouchEvent: true
        }, option);

        /**
         * Calendar instance
         * @type {Calendar}
         * @private
         */
        this._calendar = calendar;

        /**
         * Element for displaying a date value
         * @type {HTMLElement}
         * @private
         */
        this._$element = $(option.element);

        /**
         * Element wrapping calendar
         * @type {HTMLElement}
         * @private
         */
        this._$wrapperElement = $(CONSTANTS.WRAPPER_TAG);

        /**
         * Format of date string
         * @type {string}
         * @private
         */
        this._dateForm = option.dateForm;

        /**
         * RegExp instance for format of date string
         * @type {RegExp}
         * @private
         */
        this._regExp = null;

        /**
         * Array saving a order of format
         * @type {Array}
         * @private
         * @see {tui.component.DatePicker.prototype.setDateForm}
         * @example
         * // If the format is a 'mm-dd, yyyy'
         * // `this._formOrder` is ['month', 'date', 'year']
         */
        this._formOrder = [];

        /**
         * Object having date values
         * @type {dateHash}
         * @private
         */
        this._date = null;

        /**
         * This value is prepended automatically when year-format is 'yy'
         * @type {string}
         * @private
         * @example
         * //
         * // If this value is '20', the format is 'yy-mm-dd' and the date string is '15-04-12',
         * // the date value object is
         * //  {
         * //      year: 2015,
         * //      month: 4,
         * //      date: 12
         * //  }
         */
        this._defaultCentury = option.defaultCentury;

        /**
         * Class name for selectable date elements
         * @type {string}
         * @private
         */
        this._selectableClassName = option.selectableClassName;

        /**
         * Class name for selected date element
         * @type {string}
         * @private
         */
        this._selectedClassName = option.selectedClassName;

        /**
         * It is start timestamps from this._ranges
         * @type {Array.<number>}
         * @since 1.2.0
         * @private
         */
        this._startTimes = [];

        /**
         * It is end timestamps from this._ranges
         * @type {Array.<number>}
         * @since 1.2.0
         * @private
         */
        this._endTimes = [];

        /**
         * Selectable date ranges
         * @type {Array.<Array.<dateHash>>}
         * @private
         * @since 1.2.0
         */
        this._ranges = option.selectableRanges;

        /**
         * TimePicker instance
         * @type {TimePicker}
         * @since 1.1.0
         * @private
         */
        this._timePicker = null;

        /**
         * position - left & top & zIndex
         * @type {Object}
         * @private
         * @since 1.1.1
         */
        this._pos = null;

        /**
         * openers - opener list
         * @type {Array}
         * @private
         * @since 1.1.1
         */
        this._openers = [];

        /**
         * Handlers binding context
         * @type {Object}
         * @private
         */
        this._proxyHandlers = {};

        /**
         * Whether the datepicker shows always
         * @api
         * @type {boolean}
         * @since 1.2.0
         * @example
         * datepicker.showAlways = true;
         * datepicker.open();
         * // The datepicker will be not closed if you click the outside of the datepicker
         */
        this.showAlways = option.showAlways;

        /**
         * Whether the datepicker use touch event.
         * @api
         * @type {boolean}
         * @since 1.2.0
         * @example
         * datepicker.useTouchEvent = false;
         * // The datepicker will be use only 'click', 'mousedown' events
         */
        this.useTouchEvent = !!(
            (('createTouch' in document) || ('ontouchstart' in document)) &&
            option.useTouchEvent
        );

        this._initializeDatePicker(option);
    },

    /**
     * Initialize method
     * @param {Object} option - user option
     * @private
     */
    _initializeDatePicker: function(option) {
        this._setSelectableRanges();
        this._setWrapperElement();
        this._setDefaultDate(option.date);
        this._setDefaultPosition(option.pos);
        this._setProxyHandlers();
        this._bindOpenerEvent(option.openers);
        this._setTimePicker(option.timePicker);
        this.setDateForm();
        this._$wrapperElement.hide();
    },

    /**
     * Set wrapper element(= container)
     * @private
     */
    _setWrapperElement: function() {
        var $wrapperElement = this._$wrapperElement;

        $wrapperElement.append(this._calendar.$element);
        if (this._$element[0]) {
            $wrapperElement.insertAfter(this._$element);
        } else {
            $wrapperElement.appendTo(document.body);
        }
    },

    /**
     * Set default date
     * @param {{year: number, month: number, date: number}|Date} opDate [option.date] - user setting: date
     * @private
     */
    _setDefaultDate: function(opDate) {
        var isNumber = tui.util.isNumber;

        if (!opDate) {
            this._date = utils.getToday();
        } else {
            this._date = {
                year: isNumber(opDate.year) ? opDate.year : CONSTANTS.MIN_YEAR,
                month: isNumber(opDate.month) ? opDate.month : 1,
                date: isNumber(opDate.date) ? opDate.date : 1
            };
        }
    },

    /**
     * Save default style-position of calendar
     * @param {Object} opPos [option.pos] - user setting: position(left, top, zIndex)
     * @private
     */
    _setDefaultPosition: function(opPos) {
        var pos = this._pos = opPos || {},
            bound = this._getBoundingClientRect();

        pos.left = pos.left || bound.left || 0;
        pos.top = pos.top || bound.bottom || 0;
        pos.zIndex = pos.zIndex || 9999;
    },

    /**
     * Set start/end edge from selectable-ranges
     * @private
     */
    _setSelectableRanges: function() {
        this._startTimes = [];
        this._endTimes = [];

        tui.util.forEach(this._ranges, function(range, index) {
            var startHash = range[0],
                endHash = range[1];

            if (this._isValidDate(startHash) && this._isValidDate(endHash)) {
                this._updateTimeRange({
                    start: utils.getTime(startHash),
                    end: utils.getTime(endHash)
                });
            } else {
                this._ranges.splice(index, 1);
            }
        }, this);
    },

    /**
     * Update time range (startTimes, endTimes)
     * @param {{start: number, end: number}} newTimeRange - Time range for update
     * @private
     */
    _updateTimeRange: function(newTimeRange) {
        var index, existingTimeRange, mergedTimeRange;

        index = this._searchStartTime(newTimeRange.start).index;
        existingTimeRange = {
            start:  this._startTimes[index],
            end: this._endTimes[index]
        };

        if (this._isOverlappedTimeRange(existingTimeRange, newTimeRange)) {
            mergedTimeRange = this._mergeTimeRanges(existingTimeRange, newTimeRange);
            this._startTimes.splice(index, 1, mergedTimeRange.start);
            this._endTimes.splice(index, 1, mergedTimeRange.end);
        } else {
            this._startTimes.splice(index, 0, newTimeRange.start);
            this._endTimes.splice(index, 0, newTimeRange.end);
        }
    },

    /**
     * Whether the ranges are overlapped
     * @param {{start: number, end: number}} existingTimeRange - Existing time range
     * @param {{start: number, end: number}} newTimeRange - New time range
     * @returns {boolean} Whether the ranges are overlapped
     * @private
     */
    _isOverlappedTimeRange: function(existingTimeRange, newTimeRange) {
        var existingStart = existingTimeRange.start,
            existingEnd = existingTimeRange.end,
            newStart = newTimeRange.start,
            newEnd = newTimeRange.end,
            isTruthy = existingStart && existingEnd && newStart && newEnd,
            isOverlapped = !(
                (newStart < existingStart && newEnd < existingStart) ||
                (newStart > existingEnd && newEnd > existingEnd)
            );

        return isTruthy && isOverlapped;
    },

    /**
     * Merge the overlapped time ranges
     * @param {{start: number, end: number}} existingTimeRange - Existing time range
     * @param {{start: number, end: number}} newTimeRange - New time range
     * @returns {{start: number, end: number}} Merged time range
     * @private
     */
    _mergeTimeRanges: function(existingTimeRange, newTimeRange) {
        return {
            start: Math.min(existingTimeRange.start, newTimeRange.start),
            end: Math.max(existingTimeRange.end, newTimeRange.end)
        };
    },

    /**
     * Search timestamp in startTimes
     * @param {number} timestamp - timestamp
     * @returns {{found: boolean, index: number}} result
     * @private
     */
    _searchStartTime: function(timestamp) {
        return utils.search(this._startTimes, timestamp);
    },

    /**
     * Search timestamp in endTimes
     * @param {number} timestamp - timestamp
     * @returns {{found: boolean, index: number}} result
     */
    _searchEndTime: function(timestamp) {
        return utils.search(this._endTimes, timestamp);
    },

    /**
     * Store opener element list
     * @param {Array} opOpeners [option.openers] - opener element list
     * @private
     */
    _setOpeners: function(opOpeners) {
        this.addOpener(this._$element);
        tui.util.forEach(opOpeners, function(opener) {
            this.addOpener(opener);
        }, this);
    },

    /**
     * Set TimePicker instance
     * @param {tui.component.TimePicker} [opTimePicker] - TimePicker instance
     * @private
     */
    _setTimePicker: function(opTimePicker) {
        if (!opTimePicker) {
            return;
        }

        this._timePicker = opTimePicker;
        this._bindCustomEventWithTimePicker();
    },

    /**
     * Bind custom event with TimePicker
     * @private
     */
    _bindCustomEventWithTimePicker: function() {
        var onChangeTimePicker = tui.util.bind(this.setDate, this);

        this.on('open', function() {
            this._timePicker.setTimeFromInputElement(this._$element);
            this._timePicker.on('change', onChangeTimePicker);
        });
        this.on('close', function() {
            this._timePicker.off('change', onChangeTimePicker);
        });
    },

    /**
     * Check validation of a year
     * @param {number} year - year
     * @returns {boolean} - whether the year is valid or not
     * @private
     */
    _isValidYear: function(year) {
        return tui.util.isNumber(year) && year > CONSTANTS.MIN_YEAR && year < CONSTANTS.MAX_YEAR;
    },

    /**
     * Check validation of a month
     * @param {number} month - month
     * @returns {boolean} - whether the month is valid or not
     * @private
     */
    _isValidMonth: function(month) {
        return tui.util.isNumber(month) && month > 0 && month < 13;
    },

    /**
     * Check validation of values in a date object having year, month, day-in-month
     * @param {dateHash} dateHash - dateHash
     * @returns {boolean} - whether the date object is valid or not
     * @private
     */
    _isValidDate: function(datehash) {
        var year, month, date, isLeapYear, lastDayInMonth, isBetween;

        if (!datehash) {
            return false;
        }

        year = datehash.year;
        month = datehash.month;
        date = datehash.date;
        isLeapYear = (year % 4 === 0) && (year % 100 !== 0) || (year % 400 === 0);
        if (!this._isValidYear(year) || !this._isValidMonth(month)) {
            return false;
        }

        lastDayInMonth = CONSTANTS.MONTH_DAYS[month];
        if (isLeapYear && month === 2) {
                lastDayInMonth = 29;
        }
        isBetween = !!(tui.util.isNumber(date) && (date > 0) && (date <= lastDayInMonth));

        return isBetween;
    },

    /**
     * Check an element is an opener.
     * @param {HTMLElement} target element
     * @returns {boolean} - opener true/false
     * @private
     */
    _isOpener: function(target) {
        var result = false;

        tui.util.forEach(this._openers, function(opener) {
            if (target === opener || $.contains(opener, target)) {
                result = true;
                return false;
            }
        });
        return result;
    },

    /**
     * Set style-position of calendar
     * @private
     */
    _arrangeLayer: function() {
        var style = this._$wrapperElement[0].style,
            pos = this._pos;

        style.left = pos.left + 'px';
        style.top = pos.top + 'px';
        style.zIndex = pos.zIndex;
        this._$wrapperElement.append(this._calendar.$element);
        if (this._timePicker) {
            this._$wrapperElement.append(this._timePicker.$timePickerElement);
            this._timePicker.show();
        }
    },

    /**
     * Get boundingClientRect of an element
     * @param {HTMLElement|jQuery} [element] - element
     * @returns {Object} - an object having left, top, bottom, right of element
     * @private
     */
    _getBoundingClientRect: function(element) {
        var el = $(element)[0] || this._$element[0],
            bound,
            ceil;

        if (!el) {
            return {};
        }

        bound = el.getBoundingClientRect();
        ceil = Math.ceil;
        return {
            left: ceil(bound.left),
            top: ceil(bound.top),
            bottom: ceil(bound.bottom),
            right: ceil(bound.right)
        };
    },

    /**
     * Set date from string
     * @param {string} str - date string
     * @private
     */
    _setDateFromString: function(str) {
        var date = this._extractDate(str);

        if (date && this._isSelectable(date)) {
            if (this._timePicker) {
                this._timePicker.setTimeFromInputElement(this._$element);
            }
            this.setDate(date.year, date.month, date.date);
        } else {
            this.setDate();
        }
    },

    /**
     * Return formed date-string from date object
     * @return {string} - formed date-string
     * @private
     */
    _formed: function() {
        var year = this._date.year,
            month = this._date.month,
            date = this._date.date,
            form = this._dateForm,
            replaceMap,
            dateString;

        month = month < 10 ? ('0' + month) : month;
        date = date < 10 ? ('0' + date) : date;

        replaceMap = {
            yyyy: year,
            yy: String(year).substr(2, 2),
            mm: month,
            m: Number(month),
            dd: date,
            d: Number(date)
        };

        dateString = form.replace(formatRegExp, function(key) {
            return replaceMap[key.toLowerCase()] || '';
        });

        return dateString;
    },

    /**
     * Extract date-object from input string with comparing date-format<br>
     * If can not extract, return false
     * @param {String} str - input string(text)
     * @returns {dateHash|false} - extracted date object or false
     * @private
     */
    _extractDate: function(str) {
        var formOrder = this._formOrder,
            resultDate = {},
            regExp = this._regExp;

        regExp.lastIndex = 0;
        if (regExp.test(str)) {
            resultDate[formOrder[0]] = Number(RegExp.$1);
            resultDate[formOrder[1]] = Number(RegExp.$2);
            resultDate[formOrder[2]] = Number(RegExp.$3);
        } else {
            return false;
        }

        if (String(resultDate.year).length === 2) {
            resultDate.year = Number(this._defaultCentury + resultDate.year);
        }

        return resultDate;
    },

    /**
     * Whether a dateHash is selectable
     * @param {dateHash} dateHash - dateHash
     * @returns {boolean} - Whether a dateHash is selectable
     * @private
     */
    _isSelectable: function(dateHash) {
        var inRange = false,
            startTimes, startTime, result, timestamp;

        if (!this._isValidDate(dateHash)) {
            return false;
        }

        startTimes = this._startTimes;
        timestamp = utils.getTime(dateHash);

        if (startTimes.length) {
            result = this._searchEndTime(timestamp);
            startTime = startTimes[result.index];
            inRange = result.found || (timestamp >= startTime);
        } else {
            inRange = (timestamp >= CONSTANTS.MIN_EDGE) && (timestamp <= CONSTANTS.MAX_EDGE);
        }

        return inRange;
    },

    /**
     * Set selectable-class-name to selectable date element.
     * @param {HTMLElement|jQuery} element - date element
     * @param {{year: number, month: number, date: number}} dateHash - date object
     * @private
     */
    _setSelectableClassName: function(element, dateHash) {
        if (this._isSelectable(dateHash)) {
            $(element).addClass(this._selectableClassName);
        }
    },

    /**
     * Set selected-class-name to selected date element
     * @param {HTMLElement|jQuery} element - date element
     * @param {{year: number, month: number, date: number}} dateHash - date object
     * @private
     */
    _setSelectedClassName: function(element, dateHash) {
        var year = this._date.year,
            month = this._date.month,
            date = this._date.date,
            isSelected = (year === dateHash.year) && (month === dateHash.month) && (date === dateHash.date);

        if (isSelected) {
            $(element).addClass(this._selectedClassName);
        }
    },

    /**
     * Set value a date-string of current this instance to input element
     * @private
     */
    _setValueToInputElement: function() {
        var dateString = this._formed(),
            timeString = '';

        if (this._timePicker) {
            timeString = this._timePicker.getTime();
        }
        this._$element.val(dateString + timeString);
    },

    /**
     * Set(or make) RegExp instance from the date-format of this instance.
     * @private
     */
    _setRegExp: function() {
        var regExpStr = '^',
            index = 0,
            formOrder = this._formOrder;

        this._dateForm.replace(formatRegExp, function(str) {
            var key = str.toLowerCase();

            regExpStr += (mapForConverting[key].expression + '[\\D\\s]*');
            formOrder[index] = mapForConverting[key].type;
            index += 1;
        });
        this._regExp = new RegExp(regExpStr, 'gi');
    },

    /**
     * Set event handlers to bind context and then store.
     * @private
     */
    _setProxyHandlers: function() {
        var proxies = this._proxyHandlers,
            bind = tui.util.bind;

        // Event handlers for element
        proxies.onMousedownDocument = bind(this._onMousedownDocument, this);
        proxies.onKeydownElement = bind(this._onKeydownElement, this);
        proxies.onClickCalendar = bind(this._onClickCalendar, this);
        proxies.onClickOpener = bind(this._onClickOpener, this);

        // Event handlers for custom event of calendar
        proxies.onBeforeDrawCalendar = bind(this._onBeforeDrawCalendar, this);
        proxies.onDrawCalendar = bind(this._onDrawCalendar, this);
        proxies.onAfterDrawCalendar = bind(this._onAfterDrawCalendar, this);
    },

    /**
     * Event handler for mousedown of document<br>
     * - When click the out of layer, close the layer
     * @param {Event} event - event object
     * @private
     */
    _onMousedownDocument: function(event) {
        var isContains = $.contains(this._$wrapperElement[0], event.target);

        if ((!isContains && !this._isOpener(event.target))) {
            this.close();
        }
    },

    /**
     * Event handler for enter-key down of input element
     * @param {Event} [event] - event object
     * @private
     */
    _onKeydownElement: function(event) {
        if (!event || event.keyCode !== 13) {
            return;
        }
        this._setDateFromString(this._$element.val());
    },

    /**
     * Event handler for click of calendar<br>
     * - Update date form event-target
     * @param {Event} event - event object
     * @private
     */
    _onClickCalendar: function(event) {
        var target = event.target,
            className = target.className,
            value = Number((target.innerText || target.textContent || target.nodeValue)),
            shownDate,
            relativeMonth,
            date;

        if (value && !isNaN(value)) {
            if (className.indexOf('prev-month') > -1) {
                relativeMonth = -1;
            } else if (className.indexOf('next-month') > -1) {
                relativeMonth = 1;
            } else {
                relativeMonth = 0;
            }

            shownDate = this._calendar.getDate();
            shownDate.date = value;
            date = utils.getRelativeDate(0, relativeMonth, 0, shownDate);
            this.setDate(date.year, date.month, date.date);
        }
    },

    /**
     * Event handler for click of opener-element
     * @private
     */
    _onClickOpener: function() {
        this.open();
    },

    /**
     * Event handler for 'beforeDraw'-custom event of calendar
     * @private
     * @see {tui.component.Calendar.draw}
     */
    _onBeforeDrawCalendar: function() {
        this._unbindOnClickCalendar();
    },

    /**
     * Event handler for 'draw'-custom event of calendar
     * @param {Object} eventData - custom event data
     * @private
     * @see {tui.component.Calendar.draw}
     */
    _onDrawCalendar: function(eventData) {
        var dateHash = {
            year: eventData.year,
            month: eventData.month,
            date: eventData.date
        };
        this._setSelectableClassName(eventData.$dateContainer, dateHash);
        this._setSelectedClassName(eventData.$dateContainer, dateHash);
    },

    /**
     * Event handler for 'afterDraw'-custom event of calendar
     * @private
     * @see {tui.component.Calendar.draw}
     */
    _onAfterDrawCalendar: function() {
        this._showOnlyValidButtons();
        this._bindOnClickCalendar();
    },

    /**
     * Show only valid buttons in calendar
     * @private
     */
    _showOnlyValidButtons: function() {
        var $header = this._calendar.$header,
            btns = {
                $prevYear: $header.find('[class*="prev-year"]').hide(),
                $prevMonth: $header.find('[class*="prev-month"]').hide(),
                $nextYear: $header.find('[class*="next-year"]').hide(),
                $nextMonth: $header.find('[class*="next-month"]').hide()
            },
            shownDateHash = this._calendar.getDate(),
            shownDate = new Date(shownDateHash.year, shownDateHash.month - 1),
            startDate = new Date(this._startTimes[0] || CONSTANTS.MIN_EDGE).setDate(1),
            endDate = new Date(this._endTimes.slice(-1)[0] || CONSTANTS.MAX_EDGE).setDate(1),
            startDifference = shownDate - startDate,
            endDifference = endDate - shownDate;

        if (startDifference > 0) {
            btns.$prevMonth.show();
            if (startDifference >= CONSTANTS.YEAR_TO_MS) {
                btns.$prevYear.show();
            }
        }

        if (endDifference > 0) {
            btns.$nextMonth.show();
            if (endDifference >= CONSTANTS.YEAR_TO_MS) {
                btns.$nextYear.show();
            }
        }
    },

    /**
     * Bind opener-elements event
     * @param {Array} opOpeners [option.openers] - list of opener elements
     * @private
     */
    _bindOpenerEvent: function(opOpeners) {
        this._setOpeners(opOpeners);
        this._$element.on('keydown', this._proxyHandlers.onKeydownElement);
    },

    /**
     * Bind a mousedown/touchstart event of documnet
     * @private
     */
    _bindOnMousedownDocument: function() {
        var eventType = (this.useTouchEvent) ? 'touchstart' : 'mousedown';
        $(document).on(eventType, this._proxyHandlers.onMousedownDocument);
    },

    /**
     * Unbind mousedown,touchstart events of documnet
     * @private
     */
    _unbindOnMousedownDocument: function() {
        $(document).off('mousedown touchstart', this._proxyHandlers.onMousedownDocument);
    },

    /**
     * Bind click event of calendar
     * @private
     */
    _bindOnClickCalendar: function() {
        var handler = this._proxyHandlers.onClickCalendar,
            eventType = (this.useTouchEvent) ? 'touchend' : 'click';
        this._$wrapperElement.find('.' + this._selectableClassName).on(eventType, handler);
    },

    /**
     * Unbind click event of calendar
     * @private
     */
    _unbindOnClickCalendar: function() {
        var handler = this._proxyHandlers.onClickCalendar;
        this._$wrapperElement.find('.' + this._selectableClassName).off('click touchend', handler);
    },

    /**
     * Bind custom event of calendar
     * @private
     */
    _bindCalendarCustomEvent: function() {
        var proxyHandlers = this._proxyHandlers,
            onBeforeDraw = proxyHandlers.onBeforeDrawCalendar,
            onDraw = proxyHandlers.onDrawCalendar,
            onAfterDraw = proxyHandlers.onAfterDrawCalendar;

        this._calendar.on({
            'beforeDraw': onBeforeDraw,
            'draw': onDraw,
            'afterDraw': onAfterDraw
        });
    },

   /**
    * Unbind custom event of calendar
    * @private
    */
    _unbindCalendarCustomEvent: function() {
       var proxyHandlers = this._proxyHandlers,
           onBeforeDraw = proxyHandlers.onBeforeDrawCalendar,
           onDraw = proxyHandlers.onDrawCalendar,
           onAfterDraw = proxyHandlers.onAfterDrawCalendar;

       this._calendar.off({
           'beforeDraw': onBeforeDraw,
           'draw': onDraw,
           'afterDraw': onAfterDraw
       });
    },

    /**
     * Add a range
     * @api
     * @param {dateHash} startHash - Start dateHash
     * @param {dateHash} endHash - End dateHash
     * @since 1.2.0
     * @example
     * var start = {year: 2015, month: 2, date: 3},
     *     end = {year: 2015, month: 3, date: 6};
     *
     * datepicker.addRange(start, end);
     */
    addRange: function(startHash, endHash) {
        this._ranges.push([startHash, endHash]);
        this._setSelectableRanges();
        this._calendar.draw();
    },

    /**
     * Remove a range
     * @param {dateHash} startHash - Start dateHash
     * @param {dateHash} endHash - End dateHash
     * @since 1.2.0
     * @example
     * var start = {year: 2015, month: 2, date: 3},
     *     end = {year: 2015, month: 3, date: 6};
     *
     * datepicker.addRange(start, end);
     * datepicker.removeRange(start, end);
     */
    removeRange: function(startHash, endHash) {
        var ranges = this._ranges,
            target = [startHash, endHash];

        tui.util.forEach(ranges, function(range, index) {
            if (tui.util.compareJSON(target, range)) {
                ranges.splice(index, 1);
                return false;
            }
        });
        this._setSelectableRanges();
        this._calendar.draw();
    },

    /**
     * Set position-left, top of calendar
     * @api
     * @param {number} x - position-left
     * @param {number} y - position-top
     * @since 1.1.1
     */
    setXY: function(x, y) {
        var pos = this._pos,
            isNumber = tui.util.isNumber;

        pos.left = isNumber(x) ? x : pos.left;
        pos.top = isNumber(y) ? y : pos.top;
        this._arrangeLayer();
    },

    /**
     * Set z-index of calendar
     * @api
     * @param {number} zIndex - z-index value
     * @since 1.1.1
     */
    setZIndex: function(zIndex) {
        if (!tui.util.isNumber(zIndex)) {
            return;
        }

        this._pos.zIndex = zIndex;
        this._arrangeLayer();
    },

    /**
     * add opener
     * @api
     * @param {HTMLElement|jQuery|string} opener - element or selector
     */
    addOpener: function(opener) {
        var eventType = (this.useTouchEvent) ? 'touchend' : 'click';

        opener = $(opener)[0];
        if (opener && inArray(opener, this._openers) < 0) {
            this._openers.push(opener);
            $(opener).on(eventType, this._proxyHandlers.onClickOpener);
        }
    },

    /**
     * remove opener
     * @api
     * @param {HTMLElement|jQuery|string} opener - element or selector
     */
    removeOpener: function(opener) {
        var index;
        opener = $(opener)[0];

        index = inArray(opener, this._openers);
        if (index > -1) {
            $(this._openers[index]).off('click touchend', this._proxyHandlers.onClickOpener);
            this._openers.splice(index, 1);
        }
    },

    /**
     * Open calendar with arranging position
     * @api
     * @example
     * datepicker.open();
     */
    open: function() {
        if (this.isOpened()) {
            return;
        }

        this._arrangeLayer();
        this._bindCalendarCustomEvent();
        this._calendar.draw(this._date.year, this._date.month, false);
        this._$wrapperElement.show();
        if (!this.showAlways) {
            this._bindOnMousedownDocument();
        }

        /**
         * @api
         * @event DatePicker#open
         * @example
         * datePicker.on('open', function() {
         *     alert('open');
         * });
         */
        this.fire('open');
    },

    /**
     * Close calendar with unbinding some events
     * @api
     * @exmaple
     * datepicker.close();
     */
    close: function() {
        if (!this.isOpened()) {
            return;
        }
        this._unbindCalendarCustomEvent();
        this._unbindOnMousedownDocument();
        this._$wrapperElement.hide();

        /**
         * Close event - DatePicker
         * @api
         * @event DatePicker#close
         * @example
         * datePicker.on('close', function() {
         *     alert('close');
         * });
         */
        this.fire('close');
    },

    /**
     * Get date-object of current DatePicker instance.
     * @api
     * @returns {Object} - date-object having year, month and day-in-month
     * @example
     * // 2015-04-13
     * datepicker.getDateObject(); // {year: 2015, month: 4, date: 13}
     */
    getDateObject: function() {
        return tui.util.extend({}, this._date);
    },

    /**
     * Return year
     * @api
     * @returns {number} - year
     * @example
     * // 2015-04-13
     * datepicker.getYear(); // 2015
     */
    getYear: function() {
        return this._date.year;
    },

    /**
     * Return month
     * @api
     * @returns {number} - month
     * @example
     * // 2015-04-13
     * datepicker.getMonth(); // 4
     */
    getMonth: function() {
        return this._date.month;
    },

    /**
     * Return day-in-month
     * @api
     * @returns {number} - day-in-month
     * @example
     * // 2015-04-13
     * datepicker.getDayInMonth(); // 13
     */
    getDayInMonth: function() {
        return this._date.date;
    },

    /**
     * Set date from values(year, month, date) and then fire 'update' custom event
     * @api
     * @param {string|number} [year] - year
     * @param {string|number} [month] - month
     * @param {string|number} [date] - day in month
     * @example
     * datepicker.setDate(2014, 12, 3); // 2014-12- 03
     * datepicker.setDate(null, 11, 23); // 2014-11-23
     * datepicker.setDate('2015', '5', 3); // 2015-05-03
     */
    setDate: function(year, month, date) {
        var dateObj = this._date,
            newDateObj = {};

        newDateObj.year = year || dateObj.year;
        newDateObj.month = month || dateObj.month;
        newDateObj.date = date || dateObj.date;

        if (this._isSelectable(newDateObj)) {
            tui.util.extend(dateObj, newDateObj);
        }
        this._setValueToInputElement();
        this._calendar.draw(dateObj.year, dateObj.month, false);

        /**
         * Update event
         * @api
         * @event DatePicker#update
         */
        this.fire('update');
    },

    /**
     * Set or update date-form
     * @api
     * @param {String} [form] - date-format
     * @example
     * datepicker.setDateForm('yyyy-mm-dd');
     * datepicker.setDateForm('mm-dd, yyyy');
     * datepicker.setDateForm('y/m/d');
     * datepicker.setDateForm('yy/mm/dd');
     */
    setDateForm: function(form) {
        this._dateForm = form || this._dateForm;
        this._setRegExp();
        this.setDate();
    },

    /**
     * Return whether the calendar is opened or not
     * @api
     * @returns {boolean} - true if opened, false otherwise
     * @example
     * datepicker.close();
     * datepicker.isOpened(); // false
     *
     * datepicker.open();
     * datepicker.isOpened(); // true
     */
    isOpened: function() {
        return (this._$wrapperElement.css('display') === 'block');
    },

    /**
     * Return TimePicker instance
     * @api
     * @returns {TimePicker} - TimePicker instance
     * @example
     * var timepicker = this.getTimepicker();
     */
    getTimePicker: function() {
        return this._timePicker;
    }
});

tui.util.CustomEvents.mixin(DatePicker);

module.exports = DatePicker;


},{"./utils":5}],3:[function(require,module,exports){
/**
 * Created by nhnent on 15. 4. 28..
 * @fileoverview Spinbox Component
 * @author NHN ent FE dev <dl_javascript@nhnent.com> <minkyu.yi@nhnent.com>
 * @dependency jquery-1.8.3, code-snippet-1.0.2
 */

'use strict';

var util = tui.util,
    inArray = util.inArray;

/**
 * @constructor
 *
 * @param {String|HTMLElement} container - container of spinbox
 * @param {Object} [option] - option for initialization
 *
 * @param {number} [option.defaultValue = 0] - initial setting value
 * @param {number} [option.step = 1] - if step = 2, value : 0 -> 2 -> 4 -> ...
 * @param {number} [option.max = 9007199254740991] - max value
 * @param {number} [option.min = -9007199254740991] - min value
 * @param {string} [option.upBtnTag = button HTML] - up button html string
 * @param {string} [option.downBtnTag = button HTML] - down button html string
 * @param {Array}  [option.exclusion = []] - value to be excluded. if this is [1,3], 0 -> 2 -> 4 -> 5 ->....
 */
var Spinbox = util.defineClass(/** @lends Spinbox.prototype */ {
    init: function(container, option) {
        /**
         * @type {jQuery}
         * @private
         */
        this._$containerElement = $(container);

        /**
         * @type {jQuery}
         * @private
         */
        this._$inputElement = this._$containerElement.find('input[type="text"]');

        /**
         * @type {number}
         * @private
         */
        this._value = null;

        /**
         * @type {Object}
         * @private
         */
        this._option = null;

        /**
         * @type {jQuery}
         * @private
         */
        this._$upButton = null;

        /**
         * @type {jQuery}
         * @private
         */
        this._$downButton = null;

        this._initialize(option);
    },

    /**
     * Initialize with option
     * @param {Object} option - Option for Initialization
     * @private
     */
    _initialize: function(option) {
        this._setOption(option);
        this._assignHTMLElements();
        this._assignDefaultEvents();
        this.setValue(this._option.defaultValue);
    },

    /**
     * Set a option to instance
     * @param {Object} option - Option that you want
     * @private
     */
    _setOption: function(option) {
        this._option = {
            defaultValue: 0,
            step: 1,
            max: Number.MAX_SAFE_INTEGER || 9007199254740991,
            min: Number.MIN_SAFE_INTEGER || -9007199254740991,
            upBtnTag: '<button type="button"><b>+</b></button>',
            downBtnTag: '<button type="button"><b>-</b></button>'
        };
        util.extend(this._option, option);

        if (!util.isArray(this._option.exclusion)) {
            this._option.exclusion = [];
        }

        if (!this._isValidOption()) {
            throw new Error('Spinbox option is invaild');
        }
    },

    /**
     * is a valid option?
     * @returns {boolean} result
     * @private
     */
    _isValidOption: function() {
        var opt = this._option;

        return (this._isValidValue(opt.defaultValue) && this._isValidStep(opt.step));
    },

    /**
     * is a valid value?
     * @param {number} value for spinbox
     * @returns {boolean} result
     * @private
     */
    _isValidValue: function(value) {
        var opt,
            isBetween,
            isNotInArray;

        if (!util.isNumber(value)) {
            return false;
        }

        opt = this._option;
        isBetween = value <= opt.max && value >= opt.min;
        isNotInArray = (inArray(value, opt.exclusion) === -1);

        return (isBetween && isNotInArray);
    },

    /**
     * is a valid step?
     * @param {number} step for spinbox up/down
     * @returns {boolean} result
     * @private
     */
    _isValidStep: function(step) {
        var maxStep = (this._option.max - this._option.min);

        return (util.isNumber(step) && step < maxStep);
    },

    /**
     * Assign elements to inside of container.
     * @private
     */
    _assignHTMLElements: function() {
        this._setInputSizeAndMaxLength();
        this._makeButton();
    },

    /**
     * Make up/down button
     * @private
     */
    _makeButton: function() {
        var $input = this._$inputElement,
            $upBtn = this._$upButton = $(this._option.upBtnTag),
            $downBtn = this._$downButton = $(this._option.downBtnTag);

        $upBtn.insertBefore($input);
        $upBtn.wrap('<div></div>');
        $downBtn.insertAfter($input);
        $downBtn.wrap('<div></div>');
    },

    /**
     * Set size/maxlength attributes of input element.
     * Default value is a digits of a longer value of option.min or option.max
     * @private
     */
    _setInputSizeAndMaxLength: function() {
        var $input = this._$inputElement,
            minValueLength = String(this._option.min).length,
            maxValueLength = String(this._option.max).length,
            maxlength = Math.max(minValueLength, maxValueLength);

        if (!$input.attr('size')) {
            $input.attr('size', maxlength);
        }
        if (!$input.attr('maxlength')) {
            $input.attr('maxlength', maxlength);
        }
    },

    /**
     * Assign default events to up/down button
     * @private
     */
    _assignDefaultEvents: function() {
        var onClick = util.bind(this._onClickButton, this),
            onKeyDown = util.bind(this._onKeyDownInputElement, this);

        this._$upButton.on('click', {isDown: false}, onClick);
        this._$downButton.on('click', {isDown: true}, onClick);
        this._$inputElement.on('keydown', onKeyDown);
        this._$inputElement.on('change', util.bind(this._onChangeInput, this));
    },

    /**
     * Set input value when user click a button.
     * @param {boolean} isDown - If a user clicked a down-buttton, this value is true.  Else if a user clicked a up-button, this value is false.
     * @private
     */
    _setNextValue: function(isDown) {
        var opt = this._option,
            step = opt.step,
            min = opt.min,
            max = opt.max,
            exclusion = opt.exclusion,
            nextValue = this.getValue();

        if (isDown) {
            step = -step;
        }

        do {
            nextValue += step;
            if (nextValue > max) {
                nextValue = min;
            } else if (nextValue < min) {
                nextValue = max;
            }
        } while (inArray(nextValue, exclusion) > -1);

        this.setValue(nextValue);
    },

    /**
     * DOM(Up/Down button) Click Event handler
     * @param {Event} event event-object
     * @private
     */
    _onClickButton: function(event) {
        this._setNextValue(event.data.isDown);
    },

    /**
     * DOM(Input element) Keydown Event handler
     * @param {Event} event event-object
     * @private
     */
    _onKeyDownInputElement: function(event) {
        var keyCode = event.which || event.keyCode,
            isDown;
        switch (keyCode) {
            case 38: isDown = false; break;
            case 40: isDown = true; break;
            default: return;
        }

        this._setNextValue(isDown);
    },

    /**
     * DOM(Input element) Change Event handler
     * @private
     */
    _onChangeInput: function() {
        var newValue = Number(this._$inputElement.val()),
            isChange = this._isValidValue(newValue) && this._value !== newValue,
            nextValue = (isChange) ? newValue : this._value;

        this._value = nextValue;
        this._$inputElement.val(nextValue);
    },

    /**
     * set step of spinbox
     * @param {number} step for spinbox
     */
    setStep: function(step) {
        if (!this._isValidStep(step)) {
            return;
        }
        this._option.step = step;
    },

    /**
     * get step of spinbox
     * @returns {number} step
     */
    getStep: function() {
        return this._option.step;
    },

    /**
     * Return a input value.
     * @returns {number} Data in input-box
     */
    getValue: function() {
        return this._value;
    },

    /**
     * Set a value to input-box.
     * @param {number} value - Value that you want
     */
    setValue: function(value) {
        this._$inputElement.val(value).change();
    },

    /**
     * Return a option of instance.
     * @returns {Object} Option of instance
     */
    getOption: function() {
        return this._option;
    },

    /**
     * Add value that will be excluded.
     * @param {number} value - Value that will be excluded.
     */
    addExclusion: function(value) {
        var exclusion = this._option.exclusion;

        if (inArray(value, exclusion) > -1) {
            return;
        }
        exclusion.push(value);
    },

    /**
     * Remove a value which was excluded.
     * @param {number} value - Value that will be removed from a exclusion list of instance
     */
    removeExclusion: function(value) {
        var exclusion = this._option.exclusion,
            index = inArray(value, exclusion);

        if (index === -1) {
            return;
        }
        exclusion.splice(index, 1);
    },

    /**
     * get container element
     * @return {HTMLElement} element
     */
    getContainerElement: function() {
        return this._$containerElement[0];
    }
});

module.exports = Spinbox;

},{}],4:[function(require,module,exports){
/**
 * @fileoverview TimePicker Component
 * @author NHN ent FE dev <dl_javascript@nhnent.com> <minkyu.yi@nhnent.com>
 * @dependency jquery-1.8.3, code-snippet-1.0.2, spinbox.js
 */

'use strict';

var util = tui.util,
    Spinbox = require('./spinbox'),
    timeRegExp = /\s*(\d{1,2})\s*:\s*(\d{1,2})\s*([ap][m])?(?:[\s\S]*)/i,
    timePickerTag = '<table class="timepicker"><tr class="timepicker-row"></tr></table>',
    columnTag = '<td class="timepicker-column"></td>',
    spinBoxTag = '<td class="timepicker-column timepicker-spinbox"><div><input type="text" class="timepicker-spinbox-input"></div></td>',
    upBtnTag = '<button type="button" class="timepicker-btn timepicker-btn-up"><b>+</b></button>',
    downBtnTag = '<button type="button" class="timepicker-btn timepicker-btn-down"><b>-</b></button>';

/**
 * @constructor
 * @param {Object} [option] - option for initialization
 *
 * @param {number} [option.defaultHour = 0] - initial setting value of hour
 * @param {number} [option.defaultMinute = 0] - initial setting value of minute
 * @param {HTMLElement} [option.inputElement = null] - optional input element with timepicker
 * @param {number} [option.hourStep = 1] - step of hour spinbox. if step = 2, hour value 1 -> 3 -> 5 -> ...
 * @param {number} [option.minuteStep = 1] - step of minute spinbox. if step = 2, minute value 1 -> 3 -> 5 -> ...
 * @param {Array} [option.hourExclusion = null] - hour value to be excluded. if hour [1,3] is excluded, hour value 0 -> 2 -> 4 -> 5 -> ...
 * @param {Array} [option.minuteExclusion = null] - minute value to be excluded. if minute [1,3] is excluded, minute value 0 -> 2 -> 4 -> 5 -> ...
 * @param {boolean} [option.showMeridian = false] - is time expression-"hh:mm AM/PM"?
 * @param {Object} [option.position = {}] - left, top position of timepicker element
 */
var TimePicker = util.defineClass(/** @lends TimePicker.prototype */ {
    init: function(option) {
        /**
         * @type {jQuery}
         */
        this.$timePickerElement = null;

        /**
         * @type {jQuery}
         * @private
         */
        this._$inputElement = null;

        /**
         * @type {jQuery}
         * @private
         */
        this._$meridianElement = null;

        /**
         * @type {Spinbox}
         * @private
         */
        this._hourSpinbox = null;

        /**
         * @type {Spinbox}
         * @private
         */
        this._minuteSpinbox = null;

        /**
         * time picker element show up?
         * @type {boolean}
         * @private
         */
        this._isShown = false;

        /**
         * @type {Object}
         * @private
         */
        this._option = null;

        /**
         * @type {number}
         * @private
         */
        this._hour = null;

        /**
         * @type {number}
         * @private
         */
        this._minute = null;

        this._initialize(option);
    },

    /**
     * Initialize with option
     * @param {Object} option for time picker
     * @private
     */
    _initialize: function(option) {
        this._setOption(option);
        this._makeSpinboxes();
        this._makeTimePickerElement();
        this._assignDefaultEvents();
        this.fromSpinboxes();
    },

    /**
     * Set option
     * @param {Object} option for time picker
     * @private
     */
    _setOption: function(option) {
        this._option = {
            defaultHour: 0,
            defaultMinute: 0,
            inputElement: null,
            hourStep: 1,
            minuteStep: 1,
            hourExclusion: null,
            minuteExclusion: null,
            showMeridian: false,
            position: {}
        };

        util.extend(this._option, option);
    },

    /**
     * make spinboxes (hour & minute)
     * @private
     */
    _makeSpinboxes: function() {
        var opt = this._option;

        this._hourSpinbox = new Spinbox(spinBoxTag, {
            defaultValue: opt.defaultHour,
            min: 0,
            max: 23,
            step: opt.hourStep,
            upBtnTag: upBtnTag,
            downBtnTag: downBtnTag,
            exclusion: opt.hourExclusion
        });

        this._minuteSpinbox = new Spinbox(spinBoxTag, {
            defaultValue: opt.defaultMinute,
            min: 0,
            max: 59,
            step: opt.minuteStep,
            upBtnTag: upBtnTag,
            downBtnTag: downBtnTag,
            exclusion: opt.minuteExclusion
        });
    },

    /**
     * make timepicker container
     * @private
     */
    _makeTimePickerElement: function() {
        var opt = this._option,
            $tp = $(timePickerTag),
            $tpRow = $tp.find('.timepicker-row'),
            $meridian,
            $colon = $(columnTag)
                .addClass('colon')
                .append(':');


        $tpRow.append(this._hourSpinbox.getContainerElement(), $colon, this._minuteSpinbox.getContainerElement());

        if (opt.showMeridian) {
            $meridian = $(columnTag)
                .addClass('meridian')
                .append(this._isPM ? 'PM' : 'AM');
            this._$meridianElement = $meridian;
            $tpRow.append($meridian);
        }

        $tp.hide();
        $('body').append($tp);
        this.$timePickerElement = $tp;

        if (opt.inputElement) {
            $tp.css('position', 'absolute');
            this._$inputElement = $(opt.inputElement);
            this._setDefaultPosition(this._$inputElement);
        }
    },

    /**
     * set position of timepicker container
     * @param {jQuery} $input jquery-object (element)
     * @private
     */
    _setDefaultPosition: function($input) {
        var inputEl = $input[0],
            position = this._option.position,
            x = position.x,
            y = position.y;

        if (!util.isNumber(x) || !util.isNumber(y)) {
            x = inputEl.offsetLeft;
            y = inputEl.offsetTop + inputEl.offsetHeight + 3;
        }
        this.setXYPosition(x, y);
    },

    /**
     * assign default events
     * @private
     */
    _assignDefaultEvents: function() {
        var $input = this._$inputElement;

        if ($input) {
            this._assignEventsToInputElement();
            this.on('change', function() {
                $input.val(this.getTime());
            }, this);
        }
        this.$timePickerElement.on('change', util.bind(this._onChangeTimePicker, this));
    },

    /**
     * attach event to Input element
     * @private
     */
    _assignEventsToInputElement: function() {
        var self = this,
            $input = this._$inputElement;

        $input.on('click', function(event) {
            self.open(event);
        });

        $input.on('change', function() {
            if (!self.setTimeFromInputElement()) {
                $input.val(self.getTime());
            }
        });
    },

    /**
     * dom event handler (timepicker)
     * @private
     */
    _onChangeTimePicker: function() {
        this.fromSpinboxes();
    },

    /**
     * is clicked inside of container?
     * @param {Event} event event-object
     * @returns {boolean} result
     * @private
     */
    _isClickedInside: function(event) {
        var isContains = $.contains(this.$timePickerElement[0], event.target),
            isInputElement = (this._$inputElement && this._$inputElement[0] === event.target);

        return isContains || isInputElement;
    },

    /**
     * transform time into formatted string
     * @returns {string} time string
     * @private
     */
    _formToTimeFormat: function() {
        var hour = this._hour,
            minute = this._minute,
            postfix = this._getPostfix(),
            formattedHour,
            formattedMinute;

        if (this._option.showMeridian) {
            hour %= 12;
        }

        formattedHour = (hour < 10) ? '0' + hour : hour;
        formattedMinute = (minute < 10) ? '0' + minute : minute;
        return formattedHour + ':' + formattedMinute + postfix;
    },

    /**
     * set the boolean value 'isPM' when AM/PM option is true.
     * @private
     */
    _setIsPM: function() {
        this._isPM = (this._hour > 11);
    },

    /**
     * get postfix when AM/PM option is true.
     * @returns {string} postfix (AM/PM)
     * @private
     */
    _getPostfix: function() {
        var postfix = '';

        if (this._option.showMeridian) {
            postfix = (this._isPM) ? ' PM' : ' AM';
        }
        return postfix;
    },

    /**
     * set position of container
     * @param {number} x - it will be offsetLeft of element
     * @param {number} y - it will be offsetTop of element
     */
    setXYPosition: function(x, y) {
        var position;

        if (!util.isNumber(x) || !util.isNumber(y)) {
            return;
        }

        position = this._option.position;
        position.x = x;
        position.y = y;
        this.$timePickerElement.css({left: x, top: y});
    },

    /**
     * show time picker element
     */
    show: function() {
        this.$timePickerElement.show();
        this._isShown = true;
    },

    /**
     * hide time picker element
     */
    hide: function() {
        this.$timePickerElement.hide();
        this._isShown = false;
    },

    /**
     * listener to show container
     * @param {Event} event event-object
     */
    open: function(event) {
        if (this._isShown) {
            return;
        }

        $(document).on('click', util.bind(this.close, this));
        this.show();

        /**
         * Open event - TimePicker
         * @event TimePicker#open
         * @param {(jQuery.Event|undefined)} - Click the input element
         */
        this.fire('open', event);
    },

    /**
     * listener to hide container
     * @param {Event} event event-object
     */
    close: function(event) {
        if (!this._isShown || this._isClickedInside(event)) {
            return;
        }

        $(document).off(event);
        this.hide();

        /**
         * Hide event - Timepicker
         * @event TimePicker#close
         * @param {(jQuery.Event|undefined)} - Click the document (not TimePicker)
         */
        this.fire('close', event);
    },

    /**
     * set values in spinboxes from time
     */
    toSpinboxes: function() {
        var hour = this._hour,
            minute = this._minute;

        this._hourSpinbox.setValue(hour);
        this._minuteSpinbox.setValue(minute);
    },

    /**
     * set time from spinboxes values
     */
    fromSpinboxes: function() {
        var hour = this._hourSpinbox.getValue(),
            minute = this._minuteSpinbox.getValue();

        this.setTime(hour, minute);
    },

    /**
     * set time from input element.
     * @param {HTMLElement|jQuery} [inputElement] jquery object (element)
     * @return {boolean} result of set time
     */
    setTimeFromInputElement: function(inputElement) {
        var input = $(inputElement)[0] || this._$inputElement[0];
        return !!(input && this.setTimeFromString(input.value));
    },

    /**
     * set hour
     * @param {number} hour for time picker
     * @return {boolean} result of set time
     */
    setHour: function(hour) {
        return this.setTime(hour, this._minute);
    },

    /**
     * set minute
     * @param {number} minute for time picker
     * @return {boolean} result of set time
     */
    setMinute: function(minute) {
        return this.setTime(this._hour, minute);
    },

    /**
     * set time
     * @api
     * @param {number} hour for time picker
     * @param {number} minute for time picker
     * @return {boolean} result of set time
     */
    setTime: function(hour, minute) {
        var isNumber = (util.isNumber(hour) && util.isNumber(minute)),
            isChange = (this._hour !== hour || this._minute !== minute),
            isValid = (hour < 24 && minute < 60);

        if (!isNumber || !isChange || !isValid) {
            return false;
        }

        this._hour = hour;
        this._minute = minute;
        this._setIsPM();
        this.toSpinboxes();
        if (this._$meridianElement) {
            this._$meridianElement.html(this._getPostfix());
        }

        /**
         * Change event - TimePicker
         * @event TimePicker#change
         */
        this.fire('change');
        return true;
    },

    /**
     * set time from time-string
     * @param {string} timeString time-string
     * @return {boolean} result of set time
     */
    setTimeFromString: function(timeString) {
        var hour,
            minute,
            postfix,
            isPM;

        if (timeRegExp.test(timeString)) {
            hour = Number(RegExp.$1);
            minute = Number(RegExp.$2);
            postfix = RegExp.$3.toUpperCase();

            if (hour < 24 && this._option.showMeridian) {
                if (postfix === 'PM') {
                    isPM = true;
                } else if (postfix === 'AM') {
                    isPM = false;
                } else {
                    isPM = this._isPM;
                }

                if (isPM) {
                    hour += 12;
                }
            }
        }
        return this.setTime(hour, minute);
    },

    /**
     * set step of hour
     * @param {number} step for time picker
     */
    setHourStep: function(step) {
        this._hourSpinbox.setStep(step);
        this._option.hourStep = this._hourSpinbox.getStep();
    },

    /**
     * set step of minute
     * @param {number} step for time picker
     */
    setMinuteStep: function(step) {
        this._minuteSpinbox.setStep(step);
        this._option.minuteStep = this._minuteSpinbox.getStep();
    },

    /**
     * add a specific hour to exclude
     * @param {number} hour for exclusion
     */
    addHourExclusion: function(hour) {
        this._hourSpinbox.addExclusion(hour);
    },

    /**
     * add a specific minute to exclude
     * @param {number} minute for exclusion
     */
    addMinuteExclusion: function(minute) {
        this._minuteSpinbox.addExclusion(minute);
    },

    /**
     * get step of hour
     * @returns {number} hour up/down step
     */
    getHourStep: function() {
        return this._option.hourStep;
    },

    /**
     * get step of minute
     * @returns {number} minute up/down step
     */
    getMinuteStep: function() {
        return this._option.minuteStep;
    },

    /**
     * remove hour from exclusion list
     * @param {number} hour that you want to remove
     */
    removeHourExclusion: function(hour) {
        this._hourSpinbox.removeExclusion(hour);
    },

    /**
     * remove minute from exclusion list
     * @param {number} minute that you want to remove
     */
    removeMinuteExclusion: function(minute) {
        this._minuteSpinbox.removeExclusion(minute);
    },

    /**
     * get hour
     * @returns {number} hour
     */
    getHour: function() {
        return this._hour;
    },

    /**
     * get minute
     * @returns {number} minute
     */
    getMinute: function() {
        return this._minute;
    },

    /**
     * get time
     * @api
     * @returns {string} 'hh:mm (AM/PM)'
     */
    getTime: function() {
        return this._formToTimeFormat();
    }
});
tui.util.CustomEvents.mixin(TimePicker);

module.exports = TimePicker;


},{"./spinbox":3}],5:[function(require,module,exports){
/**
 * @fileoverview Utils for calendar component
 * @author NHN Net. FE dev team. <dl_javascript@nhnent.com>
 * @dependency ne-code-snippet ~1.0.2
 */

'use strict';

/**
 * Utils of calendar
 * @namespace utils
 */
var utils = {
    /**
     * Return date hash by parameter.
     *  if there are 3 parameter, the parameter is corgnized Date object
     *  if there are no parameter, return today's hash date
     * @function getDateHashTable
     * @memberof utils
     * @param {Date|number} [year] A date instance or year
     * @param {number} [month] A month
     * @param {number} [date] A date
     * @returns {{year: *, month: *, date: *}} 
     */
    getDateHashTable: function(year, month, date) {
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
     * @function getToday
     * @returns {{year: *, month: *, date: *}}
     * @memberof utils
     */
    getToday: function() {
       return utils.getDateHashTable();
    },

    /**
     * Get weeks count by paramenter
     * @function getWeeks
     * @param {number} year A year
     * @param {number} month A month
     * @return {number} 주 (4~6)
     * @memberof utils
     **/
    getWeeks: function(year, month) {
        var firstDay = utils.getFirstDay(year, month),
            lastDate = utils.getLastDate(year, month);

        return Math.ceil((firstDay + lastDate) / 7);
    },

    /**
     * Get unix time from date hash
     * @function getTime
     * @param {Object} date A date hash
     * @param {number} date.year A year
     * @param {number} date.month A month
     * @param {number} date.date A date
     * @return {number} 
     * @memberof utils
     * @example
     * utils.getTime({year:2010, month:5, date:12}); // 1273590000000
     **/
    getTime: function(date) {
        return utils.getDateObject(date).getTime();
    },

    /**
     * Get which day is first by parameters that include year and month information.
     * @function getFirstDay
     * @param {number} year A year
     * @param {number} month A month
     * @return {number} (0~6)
     * @memberof utils
     **/
    getFirstDay: function(year, month) {
        return new Date(year, month - 1, 1).getDay();
    },

    /**
     * Get which day is last by parameters that include year and month information.
     * @function getLastDay
     * @param {number} year A year
     * @param {number} month A month
     * @return {number} (0~6)
     * @memberof utils
     **/
    getLastDay: function(year, month) {
        return new Date(year, month, 0).getDay();
    },

    /**
     * Get last date by parameters that include year and month information.
     * @function
     * @param {number} year A year
     * @param {number} month A month
     * @return {number} (1~31)
     * @memberof utils
     **/
    getLastDate: function(year, month) {
        return new Date(year, month, 0).getDate();
    },

    /**
     * Get date instance.
     * @function getDateObject
     * @param {Object} date A date hash
     * @return {Date} Date  
     * @memberof utils
     * @example
     *  utils.getDateObject({year:2010, month:5, date:12});
     *  utils.getDateObject(2010, 5, 12); //year,month,date
     **/
    getDateObject: function(date) {
        if (arguments.length === 3) {
            return new Date(arguments[0], arguments[1] - 1, arguments[2]);
        }
        return new Date(date.year, date.month - 1, date.date);
    },

    /**
     * Get related date hash with parameters that include date information.
     * @function getRelativeDate
     * @param {number} year A related value for year(you can use +/-)
     * @param {number} month A related value for month (you can use +/-)
     * @param {number} date A related value for day (you can use +/-)
     * @param {Object} dateObj standard date hash
     * @return {Object} dateObj 
     * @memberof utils
     * @example
     *  utils.getRelativeDate(1, 0, 0, {year:2000, month:1, date:1}); // {year:2001, month:1, date:1}
     *  utils.getRelativeDate(0, 0, -1, {year:2010, month:1, date:1}); // {year:2009, month:12, date:31}
     **/
    getRelativeDate: function(year, month, date, dateObj) {
        var nYear = (dateObj.year + year),
            nMonth = (dateObj.month + month - 1),
            nDate = (dateObj.date + date),
            nDateObj = new Date(nYear, nMonth, nDate);

        return utils.getDateHashTable(nDateObj);
    },

    /**
     *
     * @param field
     * @param value
     * @returns {{found: boolean, index: *}}
     * @private
     */
    search: function(field, value) {
        var end = false,
            found = false,
            low = 0,
            high = field.length - 1,
            index, fieldValue;

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
        }
    }
};

module.exports = utils;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9kYXRlcGlja2VyLmpzIiwic3JjL3NwaW5ib3guanMiLCJzcmMvdGltZXBpY2tlci5qcyIsInNyYy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvd0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM2tCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidHVpLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCd0dWkuY29tcG9uZW50LlNwaW5ib3gnLCByZXF1aXJlKCcuL3NyYy9zcGluYm94JykpO1xudHVpLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCd0dWkuY29tcG9uZW50LlRpbWVQaWNrZXInLCByZXF1aXJlKCcuL3NyYy90aW1lcGlja2VyJykpO1xudHVpLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCd0dWkuY29tcG9uZW50LkRhdGVQaWNrZXInLCByZXF1aXJlKCcuL3NyYy9kYXRlcGlja2VyJykpO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IG5obmVudCBvbiAxNS4gNS4gMTQuLlxuICogQGZpbGVvdmVydmlldyBUaGlzIGNvbXBvbmVudCBwcm92aWRlcyBhIGNhbGVuZGFyIGZvciBwaWNraW5nIGEgZGF0ZSAmIHRpbWUuXG4gKiBAYXV0aG9yIE5ITiBlbnQgRkUgZGV2IDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+IDxtaW5reXUueWlAbmhuZW50LmNvbT5cbiAqIEBkZXBlbmRlbmN5IGpxdWVyeS0xLjguMywgY29kZS1zbmlwcGV0LTEuMC4yLCBjb21wb25lbnQtY2FsZW5kYXItMS4wLjEsIHRpbWVQaWNrZXIuanNcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIGluQXJyYXkgPSB0dWkudXRpbC5pbkFycmF5LFxuICAgIGZvcm1hdFJlZ0V4cCA9IC95eXl5fHl5fG1tfG18ZGR8ZC9naSxcbiAgICBtYXBGb3JDb252ZXJ0aW5nID0ge1xuICAgICAgICB5eXl5OiB7ZXhwcmVzc2lvbjogJyhcXFxcZHs0fXxcXFxcZHsyfSknLCB0eXBlOiAneWVhcid9LFxuICAgICAgICB5eToge2V4cHJlc3Npb246ICcoXFxcXGR7NH18XFxcXGR7Mn0pJywgdHlwZTogJ3llYXInfSxcbiAgICAgICAgeToge2V4cHJlc3Npb246ICcoXFxcXGR7NH18XFxcXGR7Mn0pJywgdHlwZTogJ3llYXInfSxcbiAgICAgICAgbW06IHtleHByZXNzaW9uOiAnKDFbMDEyXXwwWzEtOV18WzEtOV1cXFxcYiknLCB0eXBlOiAnbW9udGgnfSxcbiAgICAgICAgbToge2V4cHJlc3Npb246ICcoMVswMTJdfDBbMS05XXxbMS05XVxcXFxiKScsIHR5cGU6ICdtb250aCd9LFxuICAgICAgICBkZDoge2V4cHJlc3Npb246ICcoWzEyXVxcXFxkezF9fDNbMDFdfDBbMS05XXxbMS05XVxcXFxiKScsIHR5cGU6ICdkYXRlJ30sXG4gICAgICAgIGQ6IHtleHByZXNzaW9uOiAnKFsxMl1cXFxcZHsxfXwzWzAxXXwwWzEtOV18WzEtOV1cXFxcYiknLCB0eXBlOiAnZGF0ZSd9XG4gICAgfSxcbiAgICBDT05TVEFOVFMgPSB7XG4gICAgICAgIE1JTl9ZRUFSOiAxOTcwLFxuICAgICAgICBNQVhfWUVBUjogMjk5OSxcbiAgICAgICAgTU9OVEhfREFZUzogWzAsIDMxLCAyOCwgMzEsIDMwLCAzMSwgMzAsIDMxLCAzMSwgMzAsIDMxLCAzMCwgMzFdLFxuICAgICAgICBXUkFQUEVSX1RBRzogJzxkaXYgc3R5bGU9XCJwb3NpdGlvbjphYnNvbHV0ZTtcIj48L2Rpdj4nLFxuICAgICAgICBNSU5fRURHRTogK25ldyBEYXRlKDApLFxuICAgICAgICBNQVhfRURHRTogK25ldyBEYXRlKDI5OTksIDExLCAzMSksXG4gICAgICAgIFlFQVJfVE9fTVM6IDMxNTM2MDAwMDAwXG4gICAgfTtcblxuLyoqXG4gKiBBIG51bWJlciwgb3IgYSBzdHJpbmcgY29udGFpbmluZyBhIG51bWJlci5cbiAqIEB0eXBlZGVmIHtPYmplY3R9IGRhdGVIYXNoXG4gKiBAcHJvcGVydHkge251bWJlcn0geWVhciAtIDE5NzB+Mjk5OVxuICogQHByb3BlcnR5IHtudW1iZXJ9IG1vbnRoIC0gMX4xMlxuICogQHByb3BlcnR5IHtudW1iZXJ9IGRhdGUgLSAxfjMxXG4gKi9cblxuLyoqXG4gKiBDcmVhdGUgRGF0ZVBpY2tlcjxicj5cbiAqIFlvdSBjYW4gZ2V0IGEgZGF0ZSBmcm9tICdnZXRZZWFyJywgJ2dldE1vbnRoJywgJ2dldERheUluTW9udGgnLCAnZ2V0RGF0ZU9iamVjdCdcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbiAtIG9wdGlvbnMgZm9yIERhdGVQaWNrZXJcbiAqICAgICAgQHBhcmFtIHtIVE1MRWxlbWVudHxzdHJpbmd9IG9wdGlvbi5lbGVtZW50IC0gaW5wdXQgZWxlbWVudChvciBzZWxlY3Rvcikgb2YgRGF0ZVBpY2tlclxuICogICAgICBAcGFyYW0ge2RhdGVIYXNofSBbb3B0aW9uLmRhdGUgPSB0b2RheV0gLSBpbml0aWFsIGRhdGUgb2JqZWN0XG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9uLmRhdGVGb3JtID0gJ3l5eXktbW0tZGQnXSAtIGZvcm1hdCBvZiBkYXRlIHN0cmluZ1xuICogICAgICBAcGFyYW0ge3N0cmluZ30gW29wdGlvbi5kZWZhdWx0Q2VudHVyeSA9IDIwXSAtIGlmIHllYXItZm9ybWF0IGlzIHl5LCB0aGlzIHZhbHVlIGlzIHByZXBlbmRlZCBhdXRvbWF0aWNhbGx5LlxuICogICAgICBAcGFyYW0ge3N0cmluZ30gW29wdGlvbi5zZWxlY3RhYmxlQ2xhc3NOYW1lID0gJ3NlbGVjdGFibGUnXSAtIGZvciBzZWxlY3RhYmxlIGRhdGUgZWxlbWVudHNcbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IFtvcHRpb24uc2VsZWN0ZWRDbGFzc05hbWUgPSAnc2VsZWN0ZWQnXSAtIGZvciBzZWxlY3RlZCBkYXRlIGVsZW1lbnRcbiAqICAgICAgQHBhcmFtIHtBcnJheS48QXJyYXkuPGRhdGVIYXNoPj59IFtvcHRpb25zLnNlbGVjdGFibGVSYW5nZXNdIC0gU2VsZWN0YWJsZSBkYXRlIHJhbmdlcywgU2VlIGV4YW1wbGVcbiAqICAgICAgQHBhcmFtIHtPYmplY3R9IFtvcHRpb24ucG9zXSAtIGNhbGVuZGFyIHBvc2l0aW9uIHN0eWxlIHZhbHVlXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gW29wdGlvbi5wb3MubGVmdF0gLSBwb3NpdGlvbiBsZWZ0IG9mIGNhbGVuZGFyXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gW29wdGlvbi5wb3MudG9wXSAtIHBvc2l0aW9uIHRvcCBvZiBjYWxlbmRhclxuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24ucG9zLnpJbmRleF0gLSB6LWluZGV4IG9mIGNhbGVuZGFyXG4gKiAgICAgIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uLm9wZW5lcnMgPSBbZWxlbWVudF1dIC0gb3BlbmVyIGJ1dHRvbiBsaXN0IChleGFtcGxlIC0gaWNvbiwgYnV0dG9uLCBldGMuKVxuICogICAgICBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb24uc2hvd0Fsd2F5cyA9IGZhbHNlXSAtIHdoZXRoZXIgdGhlIGRhdGVwaWNrZXIgc2hvd3MgdGhlIGNhbGVuZGFyIGFsd2F5c1xuICogICAgICBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb24udXNlVG91Y2hFdmVudCA9IHRydWVdIC0gd2hldGhlciB0aGUgZGF0ZXBpY2tlciB1c2VzIHRvdWNoIGV2ZW50c1xuICogICAgICBAcGFyYW0ge3R1aS5jb21wb25lbnQuVGltZVBpY2tlcn0gW29wdGlvbi50aW1lUGlja2VyXSAtIFRpbWVQaWNrZXIgaW5zdGFuY2VcbiAqIEBwYXJhbSB7dHVpLmNvbXBvbmVudC5DYWxlbmRhcn0gY2FsZW5kYXIgLSBDYWxlbmRhciBpbnN0YW5jZVxuICogQGV4YW1wbGVcbiAqICAgdmFyIGNhbGVuZGFyID0gbmV3IHR1aS5jb21wb25lbnQuQ2FsZW5kYXIoe1xuICogICAgICAgZWxlbWVudDogJyNsYXllcicsXG4gKiAgICAgICB0aXRsZUZvcm1hdDogJ3l5eXnrhYQgbeyblCcsXG4gKiAgICAgICB0b2RheUZvcm1hdDogJ3l5eXnrhYQgbW3sm5QgZGTsnbwgKEQpJ1xuICogICB9KTtcbiAqXG4gKiAgIHZhciB0aW1lUGlja2VyID0gbmV3IHR1aS5jb21wb25lbnQuVGltZVBpY2tlcih7XG4gKiAgICAgICBzaG93TWVyaWRpYW46IHRydWUsXG4gKiAgICAgICBkZWZhdWx0SG91cjogMTMsXG4gKiAgICAgICBkZWZhdWx0TWludXRlOiAyNFxuICogICB9KTtcbiAqXG4gKiAgIHZhciByYW5nZTEgPSBbXG4gKiAgICAgICAgICB7eWVhcjogMjAxNSwgbW9udGg6MSwgZGF0ZTogMX0sXG4gKiAgICAgICAgICB7eWVhcjogMjAxNSwgbW9udGg6MiwgZGF0ZTogMX1cbiAqICAgICAgXSxcbiAqICAgICAgcmFuZ2UyID0gW1xuICogICAgICAgICAge3llYXI6IDIwMTUsIG1vbnRoOjMsIGRhdGU6IDF9LFxuICogICAgICAgICAge3llYXI6IDIwMTUsIG1vbnRoOjQsIGRhdGU6IDF9XG4gKiAgICAgIF0sXG4gKiAgICAgIHJhbmdlMyA9IFtcbiAqICAgICAgICAgIHt5ZWFyOiAyMDE1LCBtb250aDo2LCBkYXRlOiAxfSxcbiAqICAgICAgICAgIHt5ZWFyOiAyMDE1LCBtb250aDo3LCBkYXRlOiAxfVxuICogICAgICBdO1xuICpcbiAqICAgdmFyIHBpY2tlcjEgPSBuZXcgdHVpLmNvbXBvbmVudC5EYXRlUGlja2VyKHtcbiAqICAgICAgIGVsZW1lbnQ6ICcjcGlja2VyJyxcbiAqICAgICAgIGRhdGVGb3JtOiAneXl5eeuFhCBtbeyblCBkZOydvCAtICcsXG4gKiAgICAgICBkYXRlOiB7eWVhcjogMjAxNSwgbW9udGg6IDEsIGRhdGU6IDEgfSxcbiAqICAgICAgIHNlbGVjdGFibGVSYW5nZXM6IFtyYW5nZTEsIHJhbmdlMiwgcmFuZ2UzXSxcbiAqICAgICAgIG9wZW5lcnM6IFsnI29wZW5lciddLFxuICogICAgICAgdGltZVBpY2tlcjogdGltZVBpY2tlclxuICogICB9LCBjYWxlbmRhcik7XG4gKlxuICogICAvLyBDbG9zZSBjYWxlbmRhciB3aGVuIHNlbGVjdCBhIGRhdGVcbiAqICAgJCgnI2xheWVyJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAqICAgICAgIHZhciAkZWwgPSAkKGV2ZW50LnRhcmdldCk7XG4gKlxuICogICAgICAgaWYgKCRlbC5oYXNDbGFzcygnc2VsZWN0YWJsZScpKSB7XG4gKiAgICAgICAgICAgcGlja2VyMS5jbG9zZSgpO1xuICogICAgICAgfVxuICogICB9KTtcbiAqL1xudmFyIERhdGVQaWNrZXIgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIERhdGVQaWNrZXIucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbiwgY2FsZW5kYXIpIHtcbiAgICAgICAgLy8gc2V0IGRlZmF1bHRzXG4gICAgICAgIG9wdGlvbiA9IHR1aS51dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICBkYXRlRm9ybTogJ3l5eXktbW0tZGQgJyxcbiAgICAgICAgICAgIGRlZmF1bHRDZW50dXJ5OiAnMjAnLFxuICAgICAgICAgICAgc2VsZWN0YWJsZUNsYXNzTmFtZTogJ3NlbGVjdGFibGUnLFxuICAgICAgICAgICAgc2VsZWN0ZWRDbGFzc05hbWU6ICdzZWxlY3RlZCcsXG4gICAgICAgICAgICBzZWxlY3RhYmxlUmFuZ2VzOiBbXSxcbiAgICAgICAgICAgIHNob3dBbHdheXM6IGZhbHNlLFxuICAgICAgICAgICAgdXNlVG91Y2hFdmVudDogdHJ1ZVxuICAgICAgICB9LCBvcHRpb24pO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDYWxlbmRhciBpbnN0YW5jZVxuICAgICAgICAgKiBAdHlwZSB7Q2FsZW5kYXJ9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9jYWxlbmRhciA9IGNhbGVuZGFyO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFbGVtZW50IGZvciBkaXNwbGF5aW5nIGEgZGF0ZSB2YWx1ZVxuICAgICAgICAgKiBAdHlwZSB7SFRNTEVsZW1lbnR9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl8kZWxlbWVudCA9ICQob3B0aW9uLmVsZW1lbnQpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFbGVtZW50IHdyYXBwaW5nIGNhbGVuZGFyXG4gICAgICAgICAqIEB0eXBlIHtIVE1MRWxlbWVudH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuXyR3cmFwcGVyRWxlbWVudCA9ICQoQ09OU1RBTlRTLldSQVBQRVJfVEFHKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRm9ybWF0IG9mIGRhdGUgc3RyaW5nXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9kYXRlRm9ybSA9IG9wdGlvbi5kYXRlRm9ybTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVnRXhwIGluc3RhbmNlIGZvciBmb3JtYXQgb2YgZGF0ZSBzdHJpbmdcbiAgICAgICAgICogQHR5cGUge1JlZ0V4cH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3JlZ0V4cCA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFycmF5IHNhdmluZyBhIG9yZGVyIG9mIGZvcm1hdFxuICAgICAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBzZWUge3R1aS5jb21wb25lbnQuRGF0ZVBpY2tlci5wcm90b3R5cGUuc2V0RGF0ZUZvcm19XG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqIC8vIElmIHRoZSBmb3JtYXQgaXMgYSAnbW0tZGQsIHl5eXknXG4gICAgICAgICAqIC8vIGB0aGlzLl9mb3JtT3JkZXJgIGlzIFsnbW9udGgnLCAnZGF0ZScsICd5ZWFyJ11cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2Zvcm1PcmRlciA9IFtdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBPYmplY3QgaGF2aW5nIGRhdGUgdmFsdWVzXG4gICAgICAgICAqIEB0eXBlIHtkYXRlSGFzaH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2RhdGUgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGlzIHZhbHVlIGlzIHByZXBlbmRlZCBhdXRvbWF0aWNhbGx5IHdoZW4geWVhci1mb3JtYXQgaXMgJ3l5J1xuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKiAvL1xuICAgICAgICAgKiAvLyBJZiB0aGlzIHZhbHVlIGlzICcyMCcsIHRoZSBmb3JtYXQgaXMgJ3l5LW1tLWRkJyBhbmQgdGhlIGRhdGUgc3RyaW5nIGlzICcxNS0wNC0xMicsXG4gICAgICAgICAqIC8vIHRoZSBkYXRlIHZhbHVlIG9iamVjdCBpc1xuICAgICAgICAgKiAvLyAge1xuICAgICAgICAgKiAvLyAgICAgIHllYXI6IDIwMTUsXG4gICAgICAgICAqIC8vICAgICAgbW9udGg6IDQsXG4gICAgICAgICAqIC8vICAgICAgZGF0ZTogMTJcbiAgICAgICAgICogLy8gIH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2RlZmF1bHRDZW50dXJ5ID0gb3B0aW9uLmRlZmF1bHRDZW50dXJ5O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDbGFzcyBuYW1lIGZvciBzZWxlY3RhYmxlIGRhdGUgZWxlbWVudHNcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3NlbGVjdGFibGVDbGFzc05hbWUgPSBvcHRpb24uc2VsZWN0YWJsZUNsYXNzTmFtZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2xhc3MgbmFtZSBmb3Igc2VsZWN0ZWQgZGF0ZSBlbGVtZW50XG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9zZWxlY3RlZENsYXNzTmFtZSA9IG9wdGlvbi5zZWxlY3RlZENsYXNzTmFtZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogSXQgaXMgc3RhcnQgdGltZXN0YW1wcyBmcm9tIHRoaXMuX3Jhbmdlc1xuICAgICAgICAgKiBAdHlwZSB7QXJyYXkuPG51bWJlcj59XG4gICAgICAgICAqIEBzaW5jZSAxLjIuMFxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fc3RhcnRUaW1lcyA9IFtdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJdCBpcyBlbmQgdGltZXN0YW1wcyBmcm9tIHRoaXMuX3Jhbmdlc1xuICAgICAgICAgKiBAdHlwZSB7QXJyYXkuPG51bWJlcj59XG4gICAgICAgICAqIEBzaW5jZSAxLjIuMFxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fZW5kVGltZXMgPSBbXTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VsZWN0YWJsZSBkYXRlIHJhbmdlc1xuICAgICAgICAgKiBAdHlwZSB7QXJyYXkuPEFycmF5LjxkYXRlSGFzaD4+fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAc2luY2UgMS4yLjBcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3JhbmdlcyA9IG9wdGlvbi5zZWxlY3RhYmxlUmFuZ2VzO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaW1lUGlja2VyIGluc3RhbmNlXG4gICAgICAgICAqIEB0eXBlIHtUaW1lUGlja2VyfVxuICAgICAgICAgKiBAc2luY2UgMS4xLjBcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3RpbWVQaWNrZXIgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBwb3NpdGlvbiAtIGxlZnQgJiB0b3AgJiB6SW5kZXhcbiAgICAgICAgICogQHR5cGUge09iamVjdH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHNpbmNlIDEuMS4xXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9wb3MgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBvcGVuZXJzIC0gb3BlbmVyIGxpc3RcbiAgICAgICAgICogQHR5cGUge0FycmF5fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAc2luY2UgMS4xLjFcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX29wZW5lcnMgPSBbXTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogSGFuZGxlcnMgYmluZGluZyBjb250ZXh0XG4gICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9wcm94eUhhbmRsZXJzID0ge307XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdoZXRoZXIgdGhlIGRhdGVwaWNrZXIgc2hvd3MgYWx3YXlzXG4gICAgICAgICAqIEBhcGlcbiAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICAgICAqIEBzaW5jZSAxLjIuMFxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKiBkYXRlcGlja2VyLnNob3dBbHdheXMgPSB0cnVlO1xuICAgICAgICAgKiBkYXRlcGlja2VyLm9wZW4oKTtcbiAgICAgICAgICogLy8gVGhlIGRhdGVwaWNrZXIgd2lsbCBiZSBub3QgY2xvc2VkIGlmIHlvdSBjbGljayB0aGUgb3V0c2lkZSBvZiB0aGUgZGF0ZXBpY2tlclxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zaG93QWx3YXlzID0gb3B0aW9uLnNob3dBbHdheXM7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdoZXRoZXIgdGhlIGRhdGVwaWNrZXIgdXNlIHRvdWNoIGV2ZW50LlxuICAgICAgICAgKiBAYXBpXG4gICAgICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAgICAgKiBAc2luY2UgMS4yLjBcbiAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICogZGF0ZXBpY2tlci51c2VUb3VjaEV2ZW50ID0gZmFsc2U7XG4gICAgICAgICAqIC8vIFRoZSBkYXRlcGlja2VyIHdpbGwgYmUgdXNlIG9ubHkgJ2NsaWNrJywgJ21vdXNlZG93bicgZXZlbnRzXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnVzZVRvdWNoRXZlbnQgPSAhIShcbiAgICAgICAgICAgICgoJ2NyZWF0ZVRvdWNoJyBpbiBkb2N1bWVudCkgfHwgKCdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50KSkgJiZcbiAgICAgICAgICAgIG9wdGlvbi51c2VUb3VjaEV2ZW50XG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5faW5pdGlhbGl6ZURhdGVQaWNrZXIob3B0aW9uKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBtZXRob2RcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uIC0gdXNlciBvcHRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbml0aWFsaXplRGF0ZVBpY2tlcjogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIHRoaXMuX3NldFNlbGVjdGFibGVSYW5nZXMoKTtcbiAgICAgICAgdGhpcy5fc2V0V3JhcHBlckVsZW1lbnQoKTtcbiAgICAgICAgdGhpcy5fc2V0RGVmYXVsdERhdGUob3B0aW9uLmRhdGUpO1xuICAgICAgICB0aGlzLl9zZXREZWZhdWx0UG9zaXRpb24ob3B0aW9uLnBvcyk7XG4gICAgICAgIHRoaXMuX3NldFByb3h5SGFuZGxlcnMoKTtcbiAgICAgICAgdGhpcy5fYmluZE9wZW5lckV2ZW50KG9wdGlvbi5vcGVuZXJzKTtcbiAgICAgICAgdGhpcy5fc2V0VGltZVBpY2tlcihvcHRpb24udGltZVBpY2tlcik7XG4gICAgICAgIHRoaXMuc2V0RGF0ZUZvcm0oKTtcbiAgICAgICAgdGhpcy5fJHdyYXBwZXJFbGVtZW50LmhpZGUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHdyYXBwZXIgZWxlbWVudCg9IGNvbnRhaW5lcilcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRXcmFwcGVyRWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkd3JhcHBlckVsZW1lbnQgPSB0aGlzLl8kd3JhcHBlckVsZW1lbnQ7XG5cbiAgICAgICAgJHdyYXBwZXJFbGVtZW50LmFwcGVuZCh0aGlzLl9jYWxlbmRhci4kZWxlbWVudCk7XG4gICAgICAgIGlmICh0aGlzLl8kZWxlbWVudFswXSkge1xuICAgICAgICAgICAgJHdyYXBwZXJFbGVtZW50Lmluc2VydEFmdGVyKHRoaXMuXyRlbGVtZW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICR3cmFwcGVyRWxlbWVudC5hcHBlbmRUbyhkb2N1bWVudC5ib2R5KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgZGVmYXVsdCBkYXRlXG4gICAgICogQHBhcmFtIHt7eWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXRlOiBudW1iZXJ9fERhdGV9IG9wRGF0ZSBbb3B0aW9uLmRhdGVdIC0gdXNlciBzZXR0aW5nOiBkYXRlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0RGVmYXVsdERhdGU6IGZ1bmN0aW9uKG9wRGF0ZSkge1xuICAgICAgICB2YXIgaXNOdW1iZXIgPSB0dWkudXRpbC5pc051bWJlcjtcblxuICAgICAgICBpZiAoIW9wRGF0ZSkge1xuICAgICAgICAgICAgdGhpcy5fZGF0ZSA9IHV0aWxzLmdldFRvZGF5KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9kYXRlID0ge1xuICAgICAgICAgICAgICAgIHllYXI6IGlzTnVtYmVyKG9wRGF0ZS55ZWFyKSA/IG9wRGF0ZS55ZWFyIDogQ09OU1RBTlRTLk1JTl9ZRUFSLFxuICAgICAgICAgICAgICAgIG1vbnRoOiBpc051bWJlcihvcERhdGUubW9udGgpID8gb3BEYXRlLm1vbnRoIDogMSxcbiAgICAgICAgICAgICAgICBkYXRlOiBpc051bWJlcihvcERhdGUuZGF0ZSkgPyBvcERhdGUuZGF0ZSA6IDFcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2F2ZSBkZWZhdWx0IHN0eWxlLXBvc2l0aW9uIG9mIGNhbGVuZGFyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wUG9zIFtvcHRpb24ucG9zXSAtIHVzZXIgc2V0dGluZzogcG9zaXRpb24obGVmdCwgdG9wLCB6SW5kZXgpXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0RGVmYXVsdFBvc2l0aW9uOiBmdW5jdGlvbihvcFBvcykge1xuICAgICAgICB2YXIgcG9zID0gdGhpcy5fcG9zID0gb3BQb3MgfHwge30sXG4gICAgICAgICAgICBib3VuZCA9IHRoaXMuX2dldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgIHBvcy5sZWZ0ID0gcG9zLmxlZnQgfHwgYm91bmQubGVmdCB8fCAwO1xuICAgICAgICBwb3MudG9wID0gcG9zLnRvcCB8fCBib3VuZC5ib3R0b20gfHwgMDtcbiAgICAgICAgcG9zLnpJbmRleCA9IHBvcy56SW5kZXggfHwgOTk5OTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHN0YXJ0L2VuZCBlZGdlIGZyb20gc2VsZWN0YWJsZS1yYW5nZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRTZWxlY3RhYmxlUmFuZ2VzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fc3RhcnRUaW1lcyA9IFtdO1xuICAgICAgICB0aGlzLl9lbmRUaW1lcyA9IFtdO1xuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2godGhpcy5fcmFuZ2VzLCBmdW5jdGlvbihyYW5nZSwgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBzdGFydEhhc2ggPSByYW5nZVswXSxcbiAgICAgICAgICAgICAgICBlbmRIYXNoID0gcmFuZ2VbMV07XG5cbiAgICAgICAgICAgIGlmICh0aGlzLl9pc1ZhbGlkRGF0ZShzdGFydEhhc2gpICYmIHRoaXMuX2lzVmFsaWREYXRlKGVuZEhhc2gpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlVGltZVJhbmdlKHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IHV0aWxzLmdldFRpbWUoc3RhcnRIYXNoKSxcbiAgICAgICAgICAgICAgICAgICAgZW5kOiB1dGlscy5nZXRUaW1lKGVuZEhhc2gpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Jhbmdlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIHRpbWUgcmFuZ2UgKHN0YXJ0VGltZXMsIGVuZFRpbWVzKVxuICAgICAqIEBwYXJhbSB7e3N0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyfX0gbmV3VGltZVJhbmdlIC0gVGltZSByYW5nZSBmb3IgdXBkYXRlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfdXBkYXRlVGltZVJhbmdlOiBmdW5jdGlvbihuZXdUaW1lUmFuZ2UpIHtcbiAgICAgICAgdmFyIGluZGV4LCBleGlzdGluZ1RpbWVSYW5nZSwgbWVyZ2VkVGltZVJhbmdlO1xuXG4gICAgICAgIGluZGV4ID0gdGhpcy5fc2VhcmNoU3RhcnRUaW1lKG5ld1RpbWVSYW5nZS5zdGFydCkuaW5kZXg7XG4gICAgICAgIGV4aXN0aW5nVGltZVJhbmdlID0ge1xuICAgICAgICAgICAgc3RhcnQ6ICB0aGlzLl9zdGFydFRpbWVzW2luZGV4XSxcbiAgICAgICAgICAgIGVuZDogdGhpcy5fZW5kVGltZXNbaW5kZXhdXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMuX2lzT3ZlcmxhcHBlZFRpbWVSYW5nZShleGlzdGluZ1RpbWVSYW5nZSwgbmV3VGltZVJhbmdlKSkge1xuICAgICAgICAgICAgbWVyZ2VkVGltZVJhbmdlID0gdGhpcy5fbWVyZ2VUaW1lUmFuZ2VzKGV4aXN0aW5nVGltZVJhbmdlLCBuZXdUaW1lUmFuZ2UpO1xuICAgICAgICAgICAgdGhpcy5fc3RhcnRUaW1lcy5zcGxpY2UoaW5kZXgsIDEsIG1lcmdlZFRpbWVSYW5nZS5zdGFydCk7XG4gICAgICAgICAgICB0aGlzLl9lbmRUaW1lcy5zcGxpY2UoaW5kZXgsIDEsIG1lcmdlZFRpbWVSYW5nZS5lbmQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fc3RhcnRUaW1lcy5zcGxpY2UoaW5kZXgsIDAsIG5ld1RpbWVSYW5nZS5zdGFydCk7XG4gICAgICAgICAgICB0aGlzLl9lbmRUaW1lcy5zcGxpY2UoaW5kZXgsIDAsIG5ld1RpbWVSYW5nZS5lbmQpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIHJhbmdlcyBhcmUgb3ZlcmxhcHBlZFxuICAgICAqIEBwYXJhbSB7e3N0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyfX0gZXhpc3RpbmdUaW1lUmFuZ2UgLSBFeGlzdGluZyB0aW1lIHJhbmdlXG4gICAgICogQHBhcmFtIHt7c3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXJ9fSBuZXdUaW1lUmFuZ2UgLSBOZXcgdGltZSByYW5nZVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBXaGV0aGVyIHRoZSByYW5nZXMgYXJlIG92ZXJsYXBwZWRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc092ZXJsYXBwZWRUaW1lUmFuZ2U6IGZ1bmN0aW9uKGV4aXN0aW5nVGltZVJhbmdlLCBuZXdUaW1lUmFuZ2UpIHtcbiAgICAgICAgdmFyIGV4aXN0aW5nU3RhcnQgPSBleGlzdGluZ1RpbWVSYW5nZS5zdGFydCxcbiAgICAgICAgICAgIGV4aXN0aW5nRW5kID0gZXhpc3RpbmdUaW1lUmFuZ2UuZW5kLFxuICAgICAgICAgICAgbmV3U3RhcnQgPSBuZXdUaW1lUmFuZ2Uuc3RhcnQsXG4gICAgICAgICAgICBuZXdFbmQgPSBuZXdUaW1lUmFuZ2UuZW5kLFxuICAgICAgICAgICAgaXNUcnV0aHkgPSBleGlzdGluZ1N0YXJ0ICYmIGV4aXN0aW5nRW5kICYmIG5ld1N0YXJ0ICYmIG5ld0VuZCxcbiAgICAgICAgICAgIGlzT3ZlcmxhcHBlZCA9ICEoXG4gICAgICAgICAgICAgICAgKG5ld1N0YXJ0IDwgZXhpc3RpbmdTdGFydCAmJiBuZXdFbmQgPCBleGlzdGluZ1N0YXJ0KSB8fFxuICAgICAgICAgICAgICAgIChuZXdTdGFydCA+IGV4aXN0aW5nRW5kICYmIG5ld0VuZCA+IGV4aXN0aW5nRW5kKVxuICAgICAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gaXNUcnV0aHkgJiYgaXNPdmVybGFwcGVkO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNZXJnZSB0aGUgb3ZlcmxhcHBlZCB0aW1lIHJhbmdlc1xuICAgICAqIEBwYXJhbSB7e3N0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyfX0gZXhpc3RpbmdUaW1lUmFuZ2UgLSBFeGlzdGluZyB0aW1lIHJhbmdlXG4gICAgICogQHBhcmFtIHt7c3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXJ9fSBuZXdUaW1lUmFuZ2UgLSBOZXcgdGltZSByYW5nZVxuICAgICAqIEByZXR1cm5zIHt7c3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXJ9fSBNZXJnZWQgdGltZSByYW5nZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21lcmdlVGltZVJhbmdlczogZnVuY3Rpb24oZXhpc3RpbmdUaW1lUmFuZ2UsIG5ld1RpbWVSYW5nZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RhcnQ6IE1hdGgubWluKGV4aXN0aW5nVGltZVJhbmdlLnN0YXJ0LCBuZXdUaW1lUmFuZ2Uuc3RhcnQpLFxuICAgICAgICAgICAgZW5kOiBNYXRoLm1heChleGlzdGluZ1RpbWVSYW5nZS5lbmQsIG5ld1RpbWVSYW5nZS5lbmQpXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNlYXJjaCB0aW1lc3RhbXAgaW4gc3RhcnRUaW1lc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lc3RhbXAgLSB0aW1lc3RhbXBcbiAgICAgKiBAcmV0dXJucyB7e2ZvdW5kOiBib29sZWFuLCBpbmRleDogbnVtYmVyfX0gcmVzdWx0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2VhcmNoU3RhcnRUaW1lOiBmdW5jdGlvbih0aW1lc3RhbXApIHtcbiAgICAgICAgcmV0dXJuIHV0aWxzLnNlYXJjaCh0aGlzLl9zdGFydFRpbWVzLCB0aW1lc3RhbXApO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZWFyY2ggdGltZXN0YW1wIGluIGVuZFRpbWVzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRpbWVzdGFtcCAtIHRpbWVzdGFtcFxuICAgICAqIEByZXR1cm5zIHt7Zm91bmQ6IGJvb2xlYW4sIGluZGV4OiBudW1iZXJ9fSByZXN1bHRcbiAgICAgKi9cbiAgICBfc2VhcmNoRW5kVGltZTogZnVuY3Rpb24odGltZXN0YW1wKSB7XG4gICAgICAgIHJldHVybiB1dGlscy5zZWFyY2godGhpcy5fZW5kVGltZXMsIHRpbWVzdGFtcCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN0b3JlIG9wZW5lciBlbGVtZW50IGxpc3RcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBvcE9wZW5lcnMgW29wdGlvbi5vcGVuZXJzXSAtIG9wZW5lciBlbGVtZW50IGxpc3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRPcGVuZXJzOiBmdW5jdGlvbihvcE9wZW5lcnMpIHtcbiAgICAgICAgdGhpcy5hZGRPcGVuZXIodGhpcy5fJGVsZW1lbnQpO1xuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKG9wT3BlbmVycywgZnVuY3Rpb24ob3BlbmVyKSB7XG4gICAgICAgICAgICB0aGlzLmFkZE9wZW5lcihvcGVuZXIpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IFRpbWVQaWNrZXIgaW5zdGFuY2VcbiAgICAgKiBAcGFyYW0ge3R1aS5jb21wb25lbnQuVGltZVBpY2tlcn0gW29wVGltZVBpY2tlcl0gLSBUaW1lUGlja2VyIGluc3RhbmNlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0VGltZVBpY2tlcjogZnVuY3Rpb24ob3BUaW1lUGlja2VyKSB7XG4gICAgICAgIGlmICghb3BUaW1lUGlja2VyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl90aW1lUGlja2VyID0gb3BUaW1lUGlja2VyO1xuICAgICAgICB0aGlzLl9iaW5kQ3VzdG9tRXZlbnRXaXRoVGltZVBpY2tlcigpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCaW5kIGN1c3RvbSBldmVudCB3aXRoIFRpbWVQaWNrZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9iaW5kQ3VzdG9tRXZlbnRXaXRoVGltZVBpY2tlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvbkNoYW5nZVRpbWVQaWNrZXIgPSB0dWkudXRpbC5iaW5kKHRoaXMuc2V0RGF0ZSwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5vbignb3BlbicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5fdGltZVBpY2tlci5zZXRUaW1lRnJvbUlucHV0RWxlbWVudCh0aGlzLl8kZWxlbWVudCk7XG4gICAgICAgICAgICB0aGlzLl90aW1lUGlja2VyLm9uKCdjaGFuZ2UnLCBvbkNoYW5nZVRpbWVQaWNrZXIpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5vbignY2xvc2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuX3RpbWVQaWNrZXIub2ZmKCdjaGFuZ2UnLCBvbkNoYW5nZVRpbWVQaWNrZXIpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgdmFsaWRhdGlvbiBvZiBhIHllYXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geWVhciAtIHllYXJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSB3aGV0aGVyIHRoZSB5ZWFyIGlzIHZhbGlkIG9yIG5vdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzVmFsaWRZZWFyOiBmdW5jdGlvbih5ZWFyKSB7XG4gICAgICAgIHJldHVybiB0dWkudXRpbC5pc051bWJlcih5ZWFyKSAmJiB5ZWFyID4gQ09OU1RBTlRTLk1JTl9ZRUFSICYmIHllYXIgPCBDT05TVEFOVFMuTUFYX1lFQVI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrIHZhbGlkYXRpb24gb2YgYSBtb250aFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtb250aCAtIG1vbnRoXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IC0gd2hldGhlciB0aGUgbW9udGggaXMgdmFsaWQgb3Igbm90XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNWYWxpZE1vbnRoOiBmdW5jdGlvbihtb250aCkge1xuICAgICAgICByZXR1cm4gdHVpLnV0aWwuaXNOdW1iZXIobW9udGgpICYmIG1vbnRoID4gMCAmJiBtb250aCA8IDEzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayB2YWxpZGF0aW9uIG9mIHZhbHVlcyBpbiBhIGRhdGUgb2JqZWN0IGhhdmluZyB5ZWFyLCBtb250aCwgZGF5LWluLW1vbnRoXG4gICAgICogQHBhcmFtIHtkYXRlSGFzaH0gZGF0ZUhhc2ggLSBkYXRlSGFzaFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSAtIHdoZXRoZXIgdGhlIGRhdGUgb2JqZWN0IGlzIHZhbGlkIG9yIG5vdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzVmFsaWREYXRlOiBmdW5jdGlvbihkYXRlaGFzaCkge1xuICAgICAgICB2YXIgeWVhciwgbW9udGgsIGRhdGUsIGlzTGVhcFllYXIsIGxhc3REYXlJbk1vbnRoLCBpc0JldHdlZW47XG5cbiAgICAgICAgaWYgKCFkYXRlaGFzaCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgeWVhciA9IGRhdGVoYXNoLnllYXI7XG4gICAgICAgIG1vbnRoID0gZGF0ZWhhc2gubW9udGg7XG4gICAgICAgIGRhdGUgPSBkYXRlaGFzaC5kYXRlO1xuICAgICAgICBpc0xlYXBZZWFyID0gKHllYXIgJSA0ID09PSAwKSAmJiAoeWVhciAlIDEwMCAhPT0gMCkgfHwgKHllYXIgJSA0MDAgPT09IDApO1xuICAgICAgICBpZiAoIXRoaXMuX2lzVmFsaWRZZWFyKHllYXIpIHx8ICF0aGlzLl9pc1ZhbGlkTW9udGgobW9udGgpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBsYXN0RGF5SW5Nb250aCA9IENPTlNUQU5UUy5NT05USF9EQVlTW21vbnRoXTtcbiAgICAgICAgaWYgKGlzTGVhcFllYXIgJiYgbW9udGggPT09IDIpIHtcbiAgICAgICAgICAgICAgICBsYXN0RGF5SW5Nb250aCA9IDI5O1xuICAgICAgICB9XG4gICAgICAgIGlzQmV0d2VlbiA9ICEhKHR1aS51dGlsLmlzTnVtYmVyKGRhdGUpICYmIChkYXRlID4gMCkgJiYgKGRhdGUgPD0gbGFzdERheUluTW9udGgpKTtcblxuICAgICAgICByZXR1cm4gaXNCZXR3ZWVuO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBhbiBlbGVtZW50IGlzIGFuIG9wZW5lci5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSB0YXJnZXQgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSAtIG9wZW5lciB0cnVlL2ZhbHNlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNPcGVuZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaCh0aGlzLl9vcGVuZXJzLCBmdW5jdGlvbihvcGVuZXIpIHtcbiAgICAgICAgICAgIGlmICh0YXJnZXQgPT09IG9wZW5lciB8fCAkLmNvbnRhaW5zKG9wZW5lciwgdGFyZ2V0KSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHN0eWxlLXBvc2l0aW9uIG9mIGNhbGVuZGFyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXJyYW5nZUxheWVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHN0eWxlID0gdGhpcy5fJHdyYXBwZXJFbGVtZW50WzBdLnN0eWxlLFxuICAgICAgICAgICAgcG9zID0gdGhpcy5fcG9zO1xuXG4gICAgICAgIHN0eWxlLmxlZnQgPSBwb3MubGVmdCArICdweCc7XG4gICAgICAgIHN0eWxlLnRvcCA9IHBvcy50b3AgKyAncHgnO1xuICAgICAgICBzdHlsZS56SW5kZXggPSBwb3MuekluZGV4O1xuICAgICAgICB0aGlzLl8kd3JhcHBlckVsZW1lbnQuYXBwZW5kKHRoaXMuX2NhbGVuZGFyLiRlbGVtZW50KTtcbiAgICAgICAgaWYgKHRoaXMuX3RpbWVQaWNrZXIpIHtcbiAgICAgICAgICAgIHRoaXMuXyR3cmFwcGVyRWxlbWVudC5hcHBlbmQodGhpcy5fdGltZVBpY2tlci4kdGltZVBpY2tlckVsZW1lbnQpO1xuICAgICAgICAgICAgdGhpcy5fdGltZVBpY2tlci5zaG93KCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGJvdW5kaW5nQ2xpZW50UmVjdCBvZiBhbiBlbGVtZW50XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudHxqUXVlcnl9IFtlbGVtZW50XSAtIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSAtIGFuIG9iamVjdCBoYXZpbmcgbGVmdCwgdG9wLCBib3R0b20sIHJpZ2h0IG9mIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRCb3VuZGluZ0NsaWVudFJlY3Q6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgdmFyIGVsID0gJChlbGVtZW50KVswXSB8fCB0aGlzLl8kZWxlbWVudFswXSxcbiAgICAgICAgICAgIGJvdW5kLFxuICAgICAgICAgICAgY2VpbDtcblxuICAgICAgICBpZiAoIWVsKSB7XG4gICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgIH1cblxuICAgICAgICBib3VuZCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjZWlsID0gTWF0aC5jZWlsO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGVmdDogY2VpbChib3VuZC5sZWZ0KSxcbiAgICAgICAgICAgIHRvcDogY2VpbChib3VuZC50b3ApLFxuICAgICAgICAgICAgYm90dG9tOiBjZWlsKGJvdW5kLmJvdHRvbSksXG4gICAgICAgICAgICByaWdodDogY2VpbChib3VuZC5yaWdodClcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGRhdGUgZnJvbSBzdHJpbmdcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyIC0gZGF0ZSBzdHJpbmdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXREYXRlRnJvbVN0cmluZzogZnVuY3Rpb24oc3RyKSB7XG4gICAgICAgIHZhciBkYXRlID0gdGhpcy5fZXh0cmFjdERhdGUoc3RyKTtcblxuICAgICAgICBpZiAoZGF0ZSAmJiB0aGlzLl9pc1NlbGVjdGFibGUoZGF0ZSkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl90aW1lUGlja2VyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdGltZVBpY2tlci5zZXRUaW1lRnJvbUlucHV0RWxlbWVudCh0aGlzLl8kZWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldERhdGUoZGF0ZS55ZWFyLCBkYXRlLm1vbnRoLCBkYXRlLmRhdGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXREYXRlKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGZvcm1lZCBkYXRlLXN0cmluZyBmcm9tIGRhdGUgb2JqZWN0XG4gICAgICogQHJldHVybiB7c3RyaW5nfSAtIGZvcm1lZCBkYXRlLXN0cmluZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Zvcm1lZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB5ZWFyID0gdGhpcy5fZGF0ZS55ZWFyLFxuICAgICAgICAgICAgbW9udGggPSB0aGlzLl9kYXRlLm1vbnRoLFxuICAgICAgICAgICAgZGF0ZSA9IHRoaXMuX2RhdGUuZGF0ZSxcbiAgICAgICAgICAgIGZvcm0gPSB0aGlzLl9kYXRlRm9ybSxcbiAgICAgICAgICAgIHJlcGxhY2VNYXAsXG4gICAgICAgICAgICBkYXRlU3RyaW5nO1xuXG4gICAgICAgIG1vbnRoID0gbW9udGggPCAxMCA/ICgnMCcgKyBtb250aCkgOiBtb250aDtcbiAgICAgICAgZGF0ZSA9IGRhdGUgPCAxMCA/ICgnMCcgKyBkYXRlKSA6IGRhdGU7XG5cbiAgICAgICAgcmVwbGFjZU1hcCA9IHtcbiAgICAgICAgICAgIHl5eXk6IHllYXIsXG4gICAgICAgICAgICB5eTogU3RyaW5nKHllYXIpLnN1YnN0cigyLCAyKSxcbiAgICAgICAgICAgIG1tOiBtb250aCxcbiAgICAgICAgICAgIG06IE51bWJlcihtb250aCksXG4gICAgICAgICAgICBkZDogZGF0ZSxcbiAgICAgICAgICAgIGQ6IE51bWJlcihkYXRlKVxuICAgICAgICB9O1xuXG4gICAgICAgIGRhdGVTdHJpbmcgPSBmb3JtLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiByZXBsYWNlTWFwW2tleS50b0xvd2VyQ2FzZSgpXSB8fCAnJztcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGRhdGVTdHJpbmc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4dHJhY3QgZGF0ZS1vYmplY3QgZnJvbSBpbnB1dCBzdHJpbmcgd2l0aCBjb21wYXJpbmcgZGF0ZS1mb3JtYXQ8YnI+XG4gICAgICogSWYgY2FuIG5vdCBleHRyYWN0LCByZXR1cm4gZmFsc2VcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyIC0gaW5wdXQgc3RyaW5nKHRleHQpXG4gICAgICogQHJldHVybnMge2RhdGVIYXNofGZhbHNlfSAtIGV4dHJhY3RlZCBkYXRlIG9iamVjdCBvciBmYWxzZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2V4dHJhY3REYXRlOiBmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgdmFyIGZvcm1PcmRlciA9IHRoaXMuX2Zvcm1PcmRlcixcbiAgICAgICAgICAgIHJlc3VsdERhdGUgPSB7fSxcbiAgICAgICAgICAgIHJlZ0V4cCA9IHRoaXMuX3JlZ0V4cDtcblxuICAgICAgICByZWdFeHAubGFzdEluZGV4ID0gMDtcbiAgICAgICAgaWYgKHJlZ0V4cC50ZXN0KHN0cikpIHtcbiAgICAgICAgICAgIHJlc3VsdERhdGVbZm9ybU9yZGVyWzBdXSA9IE51bWJlcihSZWdFeHAuJDEpO1xuICAgICAgICAgICAgcmVzdWx0RGF0ZVtmb3JtT3JkZXJbMV1dID0gTnVtYmVyKFJlZ0V4cC4kMik7XG4gICAgICAgICAgICByZXN1bHREYXRlW2Zvcm1PcmRlclsyXV0gPSBOdW1iZXIoUmVnRXhwLiQzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChTdHJpbmcocmVzdWx0RGF0ZS55ZWFyKS5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgIHJlc3VsdERhdGUueWVhciA9IE51bWJlcih0aGlzLl9kZWZhdWx0Q2VudHVyeSArIHJlc3VsdERhdGUueWVhcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0RGF0ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBhIGRhdGVIYXNoIGlzIHNlbGVjdGFibGVcbiAgICAgKiBAcGFyYW0ge2RhdGVIYXNofSBkYXRlSGFzaCAtIGRhdGVIYXNoXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IC0gV2hldGhlciBhIGRhdGVIYXNoIGlzIHNlbGVjdGFibGVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc1NlbGVjdGFibGU6IGZ1bmN0aW9uKGRhdGVIYXNoKSB7XG4gICAgICAgIHZhciBpblJhbmdlID0gZmFsc2UsXG4gICAgICAgICAgICBzdGFydFRpbWVzLCBzdGFydFRpbWUsIHJlc3VsdCwgdGltZXN0YW1wO1xuXG4gICAgICAgIGlmICghdGhpcy5faXNWYWxpZERhdGUoZGF0ZUhhc2gpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBzdGFydFRpbWVzID0gdGhpcy5fc3RhcnRUaW1lcztcbiAgICAgICAgdGltZXN0YW1wID0gdXRpbHMuZ2V0VGltZShkYXRlSGFzaCk7XG5cbiAgICAgICAgaWYgKHN0YXJ0VGltZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9zZWFyY2hFbmRUaW1lKHRpbWVzdGFtcCk7XG4gICAgICAgICAgICBzdGFydFRpbWUgPSBzdGFydFRpbWVzW3Jlc3VsdC5pbmRleF07XG4gICAgICAgICAgICBpblJhbmdlID0gcmVzdWx0LmZvdW5kIHx8ICh0aW1lc3RhbXAgPj0gc3RhcnRUaW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGluUmFuZ2UgPSAodGltZXN0YW1wID49IENPTlNUQU5UUy5NSU5fRURHRSkgJiYgKHRpbWVzdGFtcCA8PSBDT05TVEFOVFMuTUFYX0VER0UpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGluUmFuZ2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBzZWxlY3RhYmxlLWNsYXNzLW5hbWUgdG8gc2VsZWN0YWJsZSBkYXRlIGVsZW1lbnQuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudHxqUXVlcnl9IGVsZW1lbnQgLSBkYXRlIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3t5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRhdGU6IG51bWJlcn19IGRhdGVIYXNoIC0gZGF0ZSBvYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRTZWxlY3RhYmxlQ2xhc3NOYW1lOiBmdW5jdGlvbihlbGVtZW50LCBkYXRlSGFzaCkge1xuICAgICAgICBpZiAodGhpcy5faXNTZWxlY3RhYmxlKGRhdGVIYXNoKSkge1xuICAgICAgICAgICAgJChlbGVtZW50KS5hZGRDbGFzcyh0aGlzLl9zZWxlY3RhYmxlQ2xhc3NOYW1lKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgc2VsZWN0ZWQtY2xhc3MtbmFtZSB0byBzZWxlY3RlZCBkYXRlIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fGpRdWVyeX0gZWxlbWVudCAtIGRhdGUgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e3llYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF0ZTogbnVtYmVyfX0gZGF0ZUhhc2ggLSBkYXRlIG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldFNlbGVjdGVkQ2xhc3NOYW1lOiBmdW5jdGlvbihlbGVtZW50LCBkYXRlSGFzaCkge1xuICAgICAgICB2YXIgeWVhciA9IHRoaXMuX2RhdGUueWVhcixcbiAgICAgICAgICAgIG1vbnRoID0gdGhpcy5fZGF0ZS5tb250aCxcbiAgICAgICAgICAgIGRhdGUgPSB0aGlzLl9kYXRlLmRhdGUsXG4gICAgICAgICAgICBpc1NlbGVjdGVkID0gKHllYXIgPT09IGRhdGVIYXNoLnllYXIpICYmIChtb250aCA9PT0gZGF0ZUhhc2gubW9udGgpICYmIChkYXRlID09PSBkYXRlSGFzaC5kYXRlKTtcblxuICAgICAgICBpZiAoaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgJChlbGVtZW50KS5hZGRDbGFzcyh0aGlzLl9zZWxlY3RlZENsYXNzTmFtZSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHZhbHVlIGEgZGF0ZS1zdHJpbmcgb2YgY3VycmVudCB0aGlzIGluc3RhbmNlIHRvIGlucHV0IGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRWYWx1ZVRvSW5wdXRFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGRhdGVTdHJpbmcgPSB0aGlzLl9mb3JtZWQoKSxcbiAgICAgICAgICAgIHRpbWVTdHJpbmcgPSAnJztcblxuICAgICAgICBpZiAodGhpcy5fdGltZVBpY2tlcikge1xuICAgICAgICAgICAgdGltZVN0cmluZyA9IHRoaXMuX3RpbWVQaWNrZXIuZ2V0VGltZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuXyRlbGVtZW50LnZhbChkYXRlU3RyaW5nICsgdGltZVN0cmluZyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldChvciBtYWtlKSBSZWdFeHAgaW5zdGFuY2UgZnJvbSB0aGUgZGF0ZS1mb3JtYXQgb2YgdGhpcyBpbnN0YW5jZS5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRSZWdFeHA6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVnRXhwU3RyID0gJ14nLFxuICAgICAgICAgICAgaW5kZXggPSAwLFxuICAgICAgICAgICAgZm9ybU9yZGVyID0gdGhpcy5fZm9ybU9yZGVyO1xuXG4gICAgICAgIHRoaXMuX2RhdGVGb3JtLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBzdHIudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAgICAgcmVnRXhwU3RyICs9IChtYXBGb3JDb252ZXJ0aW5nW2tleV0uZXhwcmVzc2lvbiArICdbXFxcXERcXFxcc10qJyk7XG4gICAgICAgICAgICBmb3JtT3JkZXJbaW5kZXhdID0gbWFwRm9yQ29udmVydGluZ1trZXldLnR5cGU7XG4gICAgICAgICAgICBpbmRleCArPSAxO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fcmVnRXhwID0gbmV3IFJlZ0V4cChyZWdFeHBTdHIsICdnaScpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgZXZlbnQgaGFuZGxlcnMgdG8gYmluZCBjb250ZXh0IGFuZCB0aGVuIHN0b3JlLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldFByb3h5SGFuZGxlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcHJveGllcyA9IHRoaXMuX3Byb3h5SGFuZGxlcnMsXG4gICAgICAgICAgICBiaW5kID0gdHVpLnV0aWwuYmluZDtcblxuICAgICAgICAvLyBFdmVudCBoYW5kbGVycyBmb3IgZWxlbWVudFxuICAgICAgICBwcm94aWVzLm9uTW91c2Vkb3duRG9jdW1lbnQgPSBiaW5kKHRoaXMuX29uTW91c2Vkb3duRG9jdW1lbnQsIHRoaXMpO1xuICAgICAgICBwcm94aWVzLm9uS2V5ZG93bkVsZW1lbnQgPSBiaW5kKHRoaXMuX29uS2V5ZG93bkVsZW1lbnQsIHRoaXMpO1xuICAgICAgICBwcm94aWVzLm9uQ2xpY2tDYWxlbmRhciA9IGJpbmQodGhpcy5fb25DbGlja0NhbGVuZGFyLCB0aGlzKTtcbiAgICAgICAgcHJveGllcy5vbkNsaWNrT3BlbmVyID0gYmluZCh0aGlzLl9vbkNsaWNrT3BlbmVyLCB0aGlzKTtcblxuICAgICAgICAvLyBFdmVudCBoYW5kbGVycyBmb3IgY3VzdG9tIGV2ZW50IG9mIGNhbGVuZGFyXG4gICAgICAgIHByb3hpZXMub25CZWZvcmVEcmF3Q2FsZW5kYXIgPSBiaW5kKHRoaXMuX29uQmVmb3JlRHJhd0NhbGVuZGFyLCB0aGlzKTtcbiAgICAgICAgcHJveGllcy5vbkRyYXdDYWxlbmRhciA9IGJpbmQodGhpcy5fb25EcmF3Q2FsZW5kYXIsIHRoaXMpO1xuICAgICAgICBwcm94aWVzLm9uQWZ0ZXJEcmF3Q2FsZW5kYXIgPSBiaW5kKHRoaXMuX29uQWZ0ZXJEcmF3Q2FsZW5kYXIsIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFdmVudCBoYW5kbGVyIGZvciBtb3VzZWRvd24gb2YgZG9jdW1lbnQ8YnI+XG4gICAgICogLSBXaGVuIGNsaWNrIHRoZSBvdXQgb2YgbGF5ZXIsIGNsb3NlIHRoZSBsYXllclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gZXZlbnQgb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25Nb3VzZWRvd25Eb2N1bWVudDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyIGlzQ29udGFpbnMgPSAkLmNvbnRhaW5zKHRoaXMuXyR3cmFwcGVyRWxlbWVudFswXSwgZXZlbnQudGFyZ2V0KTtcblxuICAgICAgICBpZiAoKCFpc0NvbnRhaW5zICYmICF0aGlzLl9pc09wZW5lcihldmVudC50YXJnZXQpKSkge1xuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV2ZW50IGhhbmRsZXIgZm9yIGVudGVyLWtleSBkb3duIG9mIGlucHV0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBbZXZlbnRdIC0gZXZlbnQgb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25LZXlkb3duRWxlbWVudDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKCFldmVudCB8fCBldmVudC5rZXlDb2RlICE9PSAxMykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3NldERhdGVGcm9tU3RyaW5nKHRoaXMuXyRlbGVtZW50LnZhbCgpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXZlbnQgaGFuZGxlciBmb3IgY2xpY2sgb2YgY2FsZW5kYXI8YnI+XG4gICAgICogLSBVcGRhdGUgZGF0ZSBmb3JtIGV2ZW50LXRhcmdldFxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gZXZlbnQgb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25DbGlja0NhbGVuZGFyOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LFxuICAgICAgICAgICAgY2xhc3NOYW1lID0gdGFyZ2V0LmNsYXNzTmFtZSxcbiAgICAgICAgICAgIHZhbHVlID0gTnVtYmVyKCh0YXJnZXQuaW5uZXJUZXh0IHx8IHRhcmdldC50ZXh0Q29udGVudCB8fCB0YXJnZXQubm9kZVZhbHVlKSksXG4gICAgICAgICAgICBzaG93bkRhdGUsXG4gICAgICAgICAgICByZWxhdGl2ZU1vbnRoLFxuICAgICAgICAgICAgZGF0ZTtcblxuICAgICAgICBpZiAodmFsdWUgJiYgIWlzTmFOKHZhbHVlKSkge1xuICAgICAgICAgICAgaWYgKGNsYXNzTmFtZS5pbmRleE9mKCdwcmV2LW1vbnRoJykgPiAtMSkge1xuICAgICAgICAgICAgICAgIHJlbGF0aXZlTW9udGggPSAtMTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY2xhc3NOYW1lLmluZGV4T2YoJ25leHQtbW9udGgnKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgcmVsYXRpdmVNb250aCA9IDE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlbGF0aXZlTW9udGggPSAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzaG93bkRhdGUgPSB0aGlzLl9jYWxlbmRhci5nZXREYXRlKCk7XG4gICAgICAgICAgICBzaG93bkRhdGUuZGF0ZSA9IHZhbHVlO1xuICAgICAgICAgICAgZGF0ZSA9IHV0aWxzLmdldFJlbGF0aXZlRGF0ZSgwLCByZWxhdGl2ZU1vbnRoLCAwLCBzaG93bkRhdGUpO1xuICAgICAgICAgICAgdGhpcy5zZXREYXRlKGRhdGUueWVhciwgZGF0ZS5tb250aCwgZGF0ZS5kYXRlKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFdmVudCBoYW5kbGVyIGZvciBjbGljayBvZiBvcGVuZXItZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uQ2xpY2tPcGVuZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLm9wZW4oKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXZlbnQgaGFuZGxlciBmb3IgJ2JlZm9yZURyYXcnLWN1c3RvbSBldmVudCBvZiBjYWxlbmRhclxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHNlZSB7dHVpLmNvbXBvbmVudC5DYWxlbmRhci5kcmF3fVxuICAgICAqL1xuICAgIF9vbkJlZm9yZURyYXdDYWxlbmRhcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX3VuYmluZE9uQ2xpY2tDYWxlbmRhcigpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFdmVudCBoYW5kbGVyIGZvciAnZHJhdyctY3VzdG9tIGV2ZW50IG9mIGNhbGVuZGFyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50RGF0YSAtIGN1c3RvbSBldmVudCBkYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAc2VlIHt0dWkuY29tcG9uZW50LkNhbGVuZGFyLmRyYXd9XG4gICAgICovXG4gICAgX29uRHJhd0NhbGVuZGFyOiBmdW5jdGlvbihldmVudERhdGEpIHtcbiAgICAgICAgdmFyIGRhdGVIYXNoID0ge1xuICAgICAgICAgICAgeWVhcjogZXZlbnREYXRhLnllYXIsXG4gICAgICAgICAgICBtb250aDogZXZlbnREYXRhLm1vbnRoLFxuICAgICAgICAgICAgZGF0ZTogZXZlbnREYXRhLmRhdGVcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5fc2V0U2VsZWN0YWJsZUNsYXNzTmFtZShldmVudERhdGEuJGRhdGVDb250YWluZXIsIGRhdGVIYXNoKTtcbiAgICAgICAgdGhpcy5fc2V0U2VsZWN0ZWRDbGFzc05hbWUoZXZlbnREYXRhLiRkYXRlQ29udGFpbmVyLCBkYXRlSGFzaCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV2ZW50IGhhbmRsZXIgZm9yICdhZnRlckRyYXcnLWN1c3RvbSBldmVudCBvZiBjYWxlbmRhclxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHNlZSB7dHVpLmNvbXBvbmVudC5DYWxlbmRhci5kcmF3fVxuICAgICAqL1xuICAgIF9vbkFmdGVyRHJhd0NhbGVuZGFyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fc2hvd09ubHlWYWxpZEJ1dHRvbnMoKTtcbiAgICAgICAgdGhpcy5fYmluZE9uQ2xpY2tDYWxlbmRhcigpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IG9ubHkgdmFsaWQgYnV0dG9ucyBpbiBjYWxlbmRhclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3Nob3dPbmx5VmFsaWRCdXR0b25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyICRoZWFkZXIgPSB0aGlzLl9jYWxlbmRhci4kaGVhZGVyLFxuICAgICAgICAgICAgYnRucyA9IHtcbiAgICAgICAgICAgICAgICAkcHJldlllYXI6ICRoZWFkZXIuZmluZCgnW2NsYXNzKj1cInByZXYteWVhclwiXScpLmhpZGUoKSxcbiAgICAgICAgICAgICAgICAkcHJldk1vbnRoOiAkaGVhZGVyLmZpbmQoJ1tjbGFzcyo9XCJwcmV2LW1vbnRoXCJdJykuaGlkZSgpLFxuICAgICAgICAgICAgICAgICRuZXh0WWVhcjogJGhlYWRlci5maW5kKCdbY2xhc3MqPVwibmV4dC15ZWFyXCJdJykuaGlkZSgpLFxuICAgICAgICAgICAgICAgICRuZXh0TW9udGg6ICRoZWFkZXIuZmluZCgnW2NsYXNzKj1cIm5leHQtbW9udGhcIl0nKS5oaWRlKClcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzaG93bkRhdGVIYXNoID0gdGhpcy5fY2FsZW5kYXIuZ2V0RGF0ZSgpLFxuICAgICAgICAgICAgc2hvd25EYXRlID0gbmV3IERhdGUoc2hvd25EYXRlSGFzaC55ZWFyLCBzaG93bkRhdGVIYXNoLm1vbnRoIC0gMSksXG4gICAgICAgICAgICBzdGFydERhdGUgPSBuZXcgRGF0ZSh0aGlzLl9zdGFydFRpbWVzWzBdIHx8IENPTlNUQU5UUy5NSU5fRURHRSkuc2V0RGF0ZSgxKSxcbiAgICAgICAgICAgIGVuZERhdGUgPSBuZXcgRGF0ZSh0aGlzLl9lbmRUaW1lcy5zbGljZSgtMSlbMF0gfHwgQ09OU1RBTlRTLk1BWF9FREdFKS5zZXREYXRlKDEpLFxuICAgICAgICAgICAgc3RhcnREaWZmZXJlbmNlID0gc2hvd25EYXRlIC0gc3RhcnREYXRlLFxuICAgICAgICAgICAgZW5kRGlmZmVyZW5jZSA9IGVuZERhdGUgLSBzaG93bkRhdGU7XG5cbiAgICAgICAgaWYgKHN0YXJ0RGlmZmVyZW5jZSA+IDApIHtcbiAgICAgICAgICAgIGJ0bnMuJHByZXZNb250aC5zaG93KCk7XG4gICAgICAgICAgICBpZiAoc3RhcnREaWZmZXJlbmNlID49IENPTlNUQU5UUy5ZRUFSX1RPX01TKSB7XG4gICAgICAgICAgICAgICAgYnRucy4kcHJldlllYXIuc2hvdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVuZERpZmZlcmVuY2UgPiAwKSB7XG4gICAgICAgICAgICBidG5zLiRuZXh0TW9udGguc2hvdygpO1xuICAgICAgICAgICAgaWYgKGVuZERpZmZlcmVuY2UgPj0gQ09OU1RBTlRTLllFQVJfVE9fTVMpIHtcbiAgICAgICAgICAgICAgICBidG5zLiRuZXh0WWVhci5zaG93KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBvcGVuZXItZWxlbWVudHMgZXZlbnRcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBvcE9wZW5lcnMgW29wdGlvbi5vcGVuZXJzXSAtIGxpc3Qgb2Ygb3BlbmVyIGVsZW1lbnRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYmluZE9wZW5lckV2ZW50OiBmdW5jdGlvbihvcE9wZW5lcnMpIHtcbiAgICAgICAgdGhpcy5fc2V0T3BlbmVycyhvcE9wZW5lcnMpO1xuICAgICAgICB0aGlzLl8kZWxlbWVudC5vbigna2V5ZG93bicsIHRoaXMuX3Byb3h5SGFuZGxlcnMub25LZXlkb3duRWxlbWVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgYSBtb3VzZWRvd24vdG91Y2hzdGFydCBldmVudCBvZiBkb2N1bW5ldFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2JpbmRPbk1vdXNlZG93bkRvY3VtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGV2ZW50VHlwZSA9ICh0aGlzLnVzZVRvdWNoRXZlbnQpID8gJ3RvdWNoc3RhcnQnIDogJ21vdXNlZG93bic7XG4gICAgICAgICQoZG9jdW1lbnQpLm9uKGV2ZW50VHlwZSwgdGhpcy5fcHJveHlIYW5kbGVycy5vbk1vdXNlZG93bkRvY3VtZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5iaW5kIG1vdXNlZG93bix0b3VjaHN0YXJ0IGV2ZW50cyBvZiBkb2N1bW5ldFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3VuYmluZE9uTW91c2Vkb3duRG9jdW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAkKGRvY3VtZW50KS5vZmYoJ21vdXNlZG93biB0b3VjaHN0YXJ0JywgdGhpcy5fcHJveHlIYW5kbGVycy5vbk1vdXNlZG93bkRvY3VtZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBjbGljayBldmVudCBvZiBjYWxlbmRhclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2JpbmRPbkNsaWNrQ2FsZW5kYXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaGFuZGxlciA9IHRoaXMuX3Byb3h5SGFuZGxlcnMub25DbGlja0NhbGVuZGFyLFxuICAgICAgICAgICAgZXZlbnRUeXBlID0gKHRoaXMudXNlVG91Y2hFdmVudCkgPyAndG91Y2hlbmQnIDogJ2NsaWNrJztcbiAgICAgICAgdGhpcy5fJHdyYXBwZXJFbGVtZW50LmZpbmQoJy4nICsgdGhpcy5fc2VsZWN0YWJsZUNsYXNzTmFtZSkub24oZXZlbnRUeXBlLCBoYW5kbGVyKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5iaW5kIGNsaWNrIGV2ZW50IG9mIGNhbGVuZGFyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfdW5iaW5kT25DbGlja0NhbGVuZGFyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGhhbmRsZXIgPSB0aGlzLl9wcm94eUhhbmRsZXJzLm9uQ2xpY2tDYWxlbmRhcjtcbiAgICAgICAgdGhpcy5fJHdyYXBwZXJFbGVtZW50LmZpbmQoJy4nICsgdGhpcy5fc2VsZWN0YWJsZUNsYXNzTmFtZSkub2ZmKCdjbGljayB0b3VjaGVuZCcsIGhhbmRsZXIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCaW5kIGN1c3RvbSBldmVudCBvZiBjYWxlbmRhclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2JpbmRDYWxlbmRhckN1c3RvbUV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHByb3h5SGFuZGxlcnMgPSB0aGlzLl9wcm94eUhhbmRsZXJzLFxuICAgICAgICAgICAgb25CZWZvcmVEcmF3ID0gcHJveHlIYW5kbGVycy5vbkJlZm9yZURyYXdDYWxlbmRhcixcbiAgICAgICAgICAgIG9uRHJhdyA9IHByb3h5SGFuZGxlcnMub25EcmF3Q2FsZW5kYXIsXG4gICAgICAgICAgICBvbkFmdGVyRHJhdyA9IHByb3h5SGFuZGxlcnMub25BZnRlckRyYXdDYWxlbmRhcjtcblxuICAgICAgICB0aGlzLl9jYWxlbmRhci5vbih7XG4gICAgICAgICAgICAnYmVmb3JlRHJhdyc6IG9uQmVmb3JlRHJhdyxcbiAgICAgICAgICAgICdkcmF3Jzogb25EcmF3LFxuICAgICAgICAgICAgJ2FmdGVyRHJhdyc6IG9uQWZ0ZXJEcmF3XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgIC8qKlxuICAgICogVW5iaW5kIGN1c3RvbSBldmVudCBvZiBjYWxlbmRhclxuICAgICogQHByaXZhdGVcbiAgICAqL1xuICAgIF91bmJpbmRDYWxlbmRhckN1c3RvbUV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICB2YXIgcHJveHlIYW5kbGVycyA9IHRoaXMuX3Byb3h5SGFuZGxlcnMsXG4gICAgICAgICAgIG9uQmVmb3JlRHJhdyA9IHByb3h5SGFuZGxlcnMub25CZWZvcmVEcmF3Q2FsZW5kYXIsXG4gICAgICAgICAgIG9uRHJhdyA9IHByb3h5SGFuZGxlcnMub25EcmF3Q2FsZW5kYXIsXG4gICAgICAgICAgIG9uQWZ0ZXJEcmF3ID0gcHJveHlIYW5kbGVycy5vbkFmdGVyRHJhd0NhbGVuZGFyO1xuXG4gICAgICAgdGhpcy5fY2FsZW5kYXIub2ZmKHtcbiAgICAgICAgICAgJ2JlZm9yZURyYXcnOiBvbkJlZm9yZURyYXcsXG4gICAgICAgICAgICdkcmF3Jzogb25EcmF3LFxuICAgICAgICAgICAnYWZ0ZXJEcmF3Jzogb25BZnRlckRyYXdcbiAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIGEgcmFuZ2VcbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtkYXRlSGFzaH0gc3RhcnRIYXNoIC0gU3RhcnQgZGF0ZUhhc2hcbiAgICAgKiBAcGFyYW0ge2RhdGVIYXNofSBlbmRIYXNoIC0gRW5kIGRhdGVIYXNoXG4gICAgICogQHNpbmNlIDEuMi4wXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgc3RhcnQgPSB7eWVhcjogMjAxNSwgbW9udGg6IDIsIGRhdGU6IDN9LFxuICAgICAqICAgICBlbmQgPSB7eWVhcjogMjAxNSwgbW9udGg6IDMsIGRhdGU6IDZ9O1xuICAgICAqXG4gICAgICogZGF0ZXBpY2tlci5hZGRSYW5nZShzdGFydCwgZW5kKTtcbiAgICAgKi9cbiAgICBhZGRSYW5nZTogZnVuY3Rpb24oc3RhcnRIYXNoLCBlbmRIYXNoKSB7XG4gICAgICAgIHRoaXMuX3Jhbmdlcy5wdXNoKFtzdGFydEhhc2gsIGVuZEhhc2hdKTtcbiAgICAgICAgdGhpcy5fc2V0U2VsZWN0YWJsZVJhbmdlcygpO1xuICAgICAgICB0aGlzLl9jYWxlbmRhci5kcmF3KCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBhIHJhbmdlXG4gICAgICogQHBhcmFtIHtkYXRlSGFzaH0gc3RhcnRIYXNoIC0gU3RhcnQgZGF0ZUhhc2hcbiAgICAgKiBAcGFyYW0ge2RhdGVIYXNofSBlbmRIYXNoIC0gRW5kIGRhdGVIYXNoXG4gICAgICogQHNpbmNlIDEuMi4wXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgc3RhcnQgPSB7eWVhcjogMjAxNSwgbW9udGg6IDIsIGRhdGU6IDN9LFxuICAgICAqICAgICBlbmQgPSB7eWVhcjogMjAxNSwgbW9udGg6IDMsIGRhdGU6IDZ9O1xuICAgICAqXG4gICAgICogZGF0ZXBpY2tlci5hZGRSYW5nZShzdGFydCwgZW5kKTtcbiAgICAgKiBkYXRlcGlja2VyLnJlbW92ZVJhbmdlKHN0YXJ0LCBlbmQpO1xuICAgICAqL1xuICAgIHJlbW92ZVJhbmdlOiBmdW5jdGlvbihzdGFydEhhc2gsIGVuZEhhc2gpIHtcbiAgICAgICAgdmFyIHJhbmdlcyA9IHRoaXMuX3JhbmdlcyxcbiAgICAgICAgICAgIHRhcmdldCA9IFtzdGFydEhhc2gsIGVuZEhhc2hdO1xuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2gocmFuZ2VzLCBmdW5jdGlvbihyYW5nZSwgaW5kZXgpIHtcbiAgICAgICAgICAgIGlmICh0dWkudXRpbC5jb21wYXJlSlNPTih0YXJnZXQsIHJhbmdlKSkge1xuICAgICAgICAgICAgICAgIHJhbmdlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX3NldFNlbGVjdGFibGVSYW5nZXMoKTtcbiAgICAgICAgdGhpcy5fY2FsZW5kYXIuZHJhdygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgcG9zaXRpb24tbGVmdCwgdG9wIG9mIGNhbGVuZGFyXG4gICAgICogQGFwaVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gcG9zaXRpb24tbGVmdFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gcG9zaXRpb24tdG9wXG4gICAgICogQHNpbmNlIDEuMS4xXG4gICAgICovXG4gICAgc2V0WFk6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgdmFyIHBvcyA9IHRoaXMuX3BvcyxcbiAgICAgICAgICAgIGlzTnVtYmVyID0gdHVpLnV0aWwuaXNOdW1iZXI7XG5cbiAgICAgICAgcG9zLmxlZnQgPSBpc051bWJlcih4KSA/IHggOiBwb3MubGVmdDtcbiAgICAgICAgcG9zLnRvcCA9IGlzTnVtYmVyKHkpID8geSA6IHBvcy50b3A7XG4gICAgICAgIHRoaXMuX2FycmFuZ2VMYXllcigpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgei1pbmRleCBvZiBjYWxlbmRhclxuICAgICAqIEBhcGlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gekluZGV4IC0gei1pbmRleCB2YWx1ZVxuICAgICAqIEBzaW5jZSAxLjEuMVxuICAgICAqL1xuICAgIHNldFpJbmRleDogZnVuY3Rpb24oekluZGV4KSB7XG4gICAgICAgIGlmICghdHVpLnV0aWwuaXNOdW1iZXIoekluZGV4KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fcG9zLnpJbmRleCA9IHpJbmRleDtcbiAgICAgICAgdGhpcy5fYXJyYW5nZUxheWVyKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGFkZCBvcGVuZXJcbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudHxqUXVlcnl8c3RyaW5nfSBvcGVuZXIgLSBlbGVtZW50IG9yIHNlbGVjdG9yXG4gICAgICovXG4gICAgYWRkT3BlbmVyOiBmdW5jdGlvbihvcGVuZXIpIHtcbiAgICAgICAgdmFyIGV2ZW50VHlwZSA9ICh0aGlzLnVzZVRvdWNoRXZlbnQpID8gJ3RvdWNoZW5kJyA6ICdjbGljayc7XG5cbiAgICAgICAgb3BlbmVyID0gJChvcGVuZXIpWzBdO1xuICAgICAgICBpZiAob3BlbmVyICYmIGluQXJyYXkob3BlbmVyLCB0aGlzLl9vcGVuZXJzKSA8IDApIHtcbiAgICAgICAgICAgIHRoaXMuX29wZW5lcnMucHVzaChvcGVuZXIpO1xuICAgICAgICAgICAgJChvcGVuZXIpLm9uKGV2ZW50VHlwZSwgdGhpcy5fcHJveHlIYW5kbGVycy5vbkNsaWNrT3BlbmVyKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZW1vdmUgb3BlbmVyXG4gICAgICogQGFwaVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR8alF1ZXJ5fHN0cmluZ30gb3BlbmVyIC0gZWxlbWVudCBvciBzZWxlY3RvclxuICAgICAqL1xuICAgIHJlbW92ZU9wZW5lcjogZnVuY3Rpb24ob3BlbmVyKSB7XG4gICAgICAgIHZhciBpbmRleDtcbiAgICAgICAgb3BlbmVyID0gJChvcGVuZXIpWzBdO1xuXG4gICAgICAgIGluZGV4ID0gaW5BcnJheShvcGVuZXIsIHRoaXMuX29wZW5lcnMpO1xuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgJCh0aGlzLl9vcGVuZXJzW2luZGV4XSkub2ZmKCdjbGljayB0b3VjaGVuZCcsIHRoaXMuX3Byb3h5SGFuZGxlcnMub25DbGlja09wZW5lcik7XG4gICAgICAgICAgICB0aGlzLl9vcGVuZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT3BlbiBjYWxlbmRhciB3aXRoIGFycmFuZ2luZyBwb3NpdGlvblxuICAgICAqIEBhcGlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGRhdGVwaWNrZXIub3BlbigpO1xuICAgICAqL1xuICAgIG9wZW46IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5pc09wZW5lZCgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9hcnJhbmdlTGF5ZXIoKTtcbiAgICAgICAgdGhpcy5fYmluZENhbGVuZGFyQ3VzdG9tRXZlbnQoKTtcbiAgICAgICAgdGhpcy5fY2FsZW5kYXIuZHJhdyh0aGlzLl9kYXRlLnllYXIsIHRoaXMuX2RhdGUubW9udGgsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5fJHdyYXBwZXJFbGVtZW50LnNob3coKTtcbiAgICAgICAgaWYgKCF0aGlzLnNob3dBbHdheXMpIHtcbiAgICAgICAgICAgIHRoaXMuX2JpbmRPbk1vdXNlZG93bkRvY3VtZW50KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQGFwaVxuICAgICAgICAgKiBAZXZlbnQgRGF0ZVBpY2tlciNvcGVuXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqIGRhdGVQaWNrZXIub24oJ29wZW4nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICogICAgIGFsZXJ0KCdvcGVuJyk7XG4gICAgICAgICAqIH0pO1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5maXJlKCdvcGVuJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENsb3NlIGNhbGVuZGFyIHdpdGggdW5iaW5kaW5nIHNvbWUgZXZlbnRzXG4gICAgICogQGFwaVxuICAgICAqIEBleG1hcGxlXG4gICAgICogZGF0ZXBpY2tlci5jbG9zZSgpO1xuICAgICAqL1xuICAgIGNsb3NlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzT3BlbmVkKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl91bmJpbmRDYWxlbmRhckN1c3RvbUV2ZW50KCk7XG4gICAgICAgIHRoaXMuX3VuYmluZE9uTW91c2Vkb3duRG9jdW1lbnQoKTtcbiAgICAgICAgdGhpcy5fJHdyYXBwZXJFbGVtZW50LmhpZGUoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2xvc2UgZXZlbnQgLSBEYXRlUGlja2VyXG4gICAgICAgICAqIEBhcGlcbiAgICAgICAgICogQGV2ZW50IERhdGVQaWNrZXIjY2xvc2VcbiAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICogZGF0ZVBpY2tlci5vbignY2xvc2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICogICAgIGFsZXJ0KCdjbG9zZScpO1xuICAgICAgICAgKiB9KTtcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZmlyZSgnY2xvc2UnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGRhdGUtb2JqZWN0IG9mIGN1cnJlbnQgRGF0ZVBpY2tlciBpbnN0YW5jZS5cbiAgICAgKiBAYXBpXG4gICAgICogQHJldHVybnMge09iamVjdH0gLSBkYXRlLW9iamVjdCBoYXZpbmcgeWVhciwgbW9udGggYW5kIGRheS1pbi1tb250aFxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gMjAxNS0wNC0xM1xuICAgICAqIGRhdGVwaWNrZXIuZ2V0RGF0ZU9iamVjdCgpOyAvLyB7eWVhcjogMjAxNSwgbW9udGg6IDQsIGRhdGU6IDEzfVxuICAgICAqL1xuICAgIGdldERhdGVPYmplY3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdHVpLnV0aWwuZXh0ZW5kKHt9LCB0aGlzLl9kYXRlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHllYXJcbiAgICAgKiBAYXBpXG4gICAgICogQHJldHVybnMge251bWJlcn0gLSB5ZWFyXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyAyMDE1LTA0LTEzXG4gICAgICogZGF0ZXBpY2tlci5nZXRZZWFyKCk7IC8vIDIwMTVcbiAgICAgKi9cbiAgICBnZXRZZWFyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGUueWVhcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIG1vbnRoXG4gICAgICogQGFwaVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IC0gbW9udGhcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIDIwMTUtMDQtMTNcbiAgICAgKiBkYXRlcGlja2VyLmdldE1vbnRoKCk7IC8vIDRcbiAgICAgKi9cbiAgICBnZXRNb250aDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kYXRlLm1vbnRoO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gZGF5LWluLW1vbnRoXG4gICAgICogQGFwaVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IC0gZGF5LWluLW1vbnRoXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyAyMDE1LTA0LTEzXG4gICAgICogZGF0ZXBpY2tlci5nZXREYXlJbk1vbnRoKCk7IC8vIDEzXG4gICAgICovXG4gICAgZ2V0RGF5SW5Nb250aDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kYXRlLmRhdGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBkYXRlIGZyb20gdmFsdWVzKHllYXIsIG1vbnRoLCBkYXRlKSBhbmQgdGhlbiBmaXJlICd1cGRhdGUnIGN1c3RvbSBldmVudFxuICAgICAqIEBhcGlcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFt5ZWFyXSAtIHllYXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFttb250aF0gLSBtb250aFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW2RhdGVdIC0gZGF5IGluIG1vbnRoXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBkYXRlcGlja2VyLnNldERhdGUoMjAxNCwgMTIsIDMpOyAvLyAyMDE0LTEyLSAwM1xuICAgICAqIGRhdGVwaWNrZXIuc2V0RGF0ZShudWxsLCAxMSwgMjMpOyAvLyAyMDE0LTExLTIzXG4gICAgICogZGF0ZXBpY2tlci5zZXREYXRlKCcyMDE1JywgJzUnLCAzKTsgLy8gMjAxNS0wNS0wM1xuICAgICAqL1xuICAgIHNldERhdGU6IGZ1bmN0aW9uKHllYXIsIG1vbnRoLCBkYXRlKSB7XG4gICAgICAgIHZhciBkYXRlT2JqID0gdGhpcy5fZGF0ZSxcbiAgICAgICAgICAgIG5ld0RhdGVPYmogPSB7fTtcblxuICAgICAgICBuZXdEYXRlT2JqLnllYXIgPSB5ZWFyIHx8IGRhdGVPYmoueWVhcjtcbiAgICAgICAgbmV3RGF0ZU9iai5tb250aCA9IG1vbnRoIHx8IGRhdGVPYmoubW9udGg7XG4gICAgICAgIG5ld0RhdGVPYmouZGF0ZSA9IGRhdGUgfHwgZGF0ZU9iai5kYXRlO1xuXG4gICAgICAgIGlmICh0aGlzLl9pc1NlbGVjdGFibGUobmV3RGF0ZU9iaikpIHtcbiAgICAgICAgICAgIHR1aS51dGlsLmV4dGVuZChkYXRlT2JqLCBuZXdEYXRlT2JqKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zZXRWYWx1ZVRvSW5wdXRFbGVtZW50KCk7XG4gICAgICAgIHRoaXMuX2NhbGVuZGFyLmRyYXcoZGF0ZU9iai55ZWFyLCBkYXRlT2JqLm1vbnRoLCBmYWxzZSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFVwZGF0ZSBldmVudFxuICAgICAgICAgKiBAYXBpXG4gICAgICAgICAqIEBldmVudCBEYXRlUGlja2VyI3VwZGF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5maXJlKCd1cGRhdGUnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IG9yIHVwZGF0ZSBkYXRlLWZvcm1cbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IFtmb3JtXSAtIGRhdGUtZm9ybWF0XG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBkYXRlcGlja2VyLnNldERhdGVGb3JtKCd5eXl5LW1tLWRkJyk7XG4gICAgICogZGF0ZXBpY2tlci5zZXREYXRlRm9ybSgnbW0tZGQsIHl5eXknKTtcbiAgICAgKiBkYXRlcGlja2VyLnNldERhdGVGb3JtKCd5L20vZCcpO1xuICAgICAqIGRhdGVwaWNrZXIuc2V0RGF0ZUZvcm0oJ3l5L21tL2RkJyk7XG4gICAgICovXG4gICAgc2V0RGF0ZUZvcm06IGZ1bmN0aW9uKGZvcm0pIHtcbiAgICAgICAgdGhpcy5fZGF0ZUZvcm0gPSBmb3JtIHx8IHRoaXMuX2RhdGVGb3JtO1xuICAgICAgICB0aGlzLl9zZXRSZWdFeHAoKTtcbiAgICAgICAgdGhpcy5zZXREYXRlKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiB3aGV0aGVyIHRoZSBjYWxlbmRhciBpcyBvcGVuZWQgb3Igbm90XG4gICAgICogQGFwaVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSAtIHRydWUgaWYgb3BlbmVkLCBmYWxzZSBvdGhlcndpc2VcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGRhdGVwaWNrZXIuY2xvc2UoKTtcbiAgICAgKiBkYXRlcGlja2VyLmlzT3BlbmVkKCk7IC8vIGZhbHNlXG4gICAgICpcbiAgICAgKiBkYXRlcGlja2VyLm9wZW4oKTtcbiAgICAgKiBkYXRlcGlja2VyLmlzT3BlbmVkKCk7IC8vIHRydWVcbiAgICAgKi9cbiAgICBpc09wZW5lZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5fJHdyYXBwZXJFbGVtZW50LmNzcygnZGlzcGxheScpID09PSAnYmxvY2snKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIFRpbWVQaWNrZXIgaW5zdGFuY2VcbiAgICAgKiBAYXBpXG4gICAgICogQHJldHVybnMge1RpbWVQaWNrZXJ9IC0gVGltZVBpY2tlciBpbnN0YW5jZVxuICAgICAqIEBleGFtcGxlXG4gICAgICogdmFyIHRpbWVwaWNrZXIgPSB0aGlzLmdldFRpbWVwaWNrZXIoKTtcbiAgICAgKi9cbiAgICBnZXRUaW1lUGlja2VyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RpbWVQaWNrZXI7XG4gICAgfVxufSk7XG5cbnR1aS51dGlsLkN1c3RvbUV2ZW50cy5taXhpbihEYXRlUGlja2VyKTtcblxubW9kdWxlLmV4cG9ydHMgPSBEYXRlUGlja2VyO1xuXG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgbmhuZW50IG9uIDE1LiA0LiAyOC4uXG4gKiBAZmlsZW92ZXJ2aWV3IFNwaW5ib3ggQ29tcG9uZW50XG4gKiBAYXV0aG9yIE5ITiBlbnQgRkUgZGV2IDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+IDxtaW5reXUueWlAbmhuZW50LmNvbT5cbiAqIEBkZXBlbmRlbmN5IGpxdWVyeS0xLjguMywgY29kZS1zbmlwcGV0LTEuMC4yXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbCA9IHR1aS51dGlsLFxuICAgIGluQXJyYXkgPSB1dGlsLmluQXJyYXk7XG5cbi8qKlxuICogQGNvbnN0cnVjdG9yXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8SFRNTEVsZW1lbnR9IGNvbnRhaW5lciAtIGNvbnRhaW5lciBvZiBzcGluYm94XG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbl0gLSBvcHRpb24gZm9yIGluaXRpYWxpemF0aW9uXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24uZGVmYXVsdFZhbHVlID0gMF0gLSBpbml0aWFsIHNldHRpbmcgdmFsdWVcbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLnN0ZXAgPSAxXSAtIGlmIHN0ZXAgPSAyLCB2YWx1ZSA6IDAgLT4gMiAtPiA0IC0+IC4uLlxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24ubWF4ID0gOTAwNzE5OTI1NDc0MDk5MV0gLSBtYXggdmFsdWVcbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLm1pbiA9IC05MDA3MTk5MjU0NzQwOTkxXSAtIG1pbiB2YWx1ZVxuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb24udXBCdG5UYWcgPSBidXR0b24gSFRNTF0gLSB1cCBidXR0b24gaHRtbCBzdHJpbmdcbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9uLmRvd25CdG5UYWcgPSBidXR0b24gSFRNTF0gLSBkb3duIGJ1dHRvbiBodG1sIHN0cmluZ1xuICogQHBhcmFtIHtBcnJheX0gIFtvcHRpb24uZXhjbHVzaW9uID0gW11dIC0gdmFsdWUgdG8gYmUgZXhjbHVkZWQuIGlmIHRoaXMgaXMgWzEsM10sIDAgLT4gMiAtPiA0IC0+IDUgLT4uLi4uXG4gKi9cbnZhciBTcGluYm94ID0gdXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFNwaW5ib3gucHJvdG90eXBlICovIHtcbiAgICBpbml0OiBmdW5jdGlvbihjb250YWluZXIsIG9wdGlvbikge1xuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge2pRdWVyeX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuXyRjb250YWluZXJFbGVtZW50ID0gJChjb250YWluZXIpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7alF1ZXJ5fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fJGlucHV0RWxlbWVudCA9IHRoaXMuXyRjb250YWluZXJFbGVtZW50LmZpbmQoJ2lucHV0W3R5cGU9XCJ0ZXh0XCJdJyk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl92YWx1ZSA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9vcHRpb24gPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7alF1ZXJ5fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fJHVwQnV0dG9uID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge2pRdWVyeX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuXyRkb3duQnV0dG9uID0gbnVsbDtcblxuICAgICAgICB0aGlzLl9pbml0aWFsaXplKG9wdGlvbik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgd2l0aCBvcHRpb25cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uIC0gT3B0aW9uIGZvciBJbml0aWFsaXphdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICB0aGlzLl9zZXRPcHRpb24ob3B0aW9uKTtcbiAgICAgICAgdGhpcy5fYXNzaWduSFRNTEVsZW1lbnRzKCk7XG4gICAgICAgIHRoaXMuX2Fzc2lnbkRlZmF1bHRFdmVudHMoKTtcbiAgICAgICAgdGhpcy5zZXRWYWx1ZSh0aGlzLl9vcHRpb24uZGVmYXVsdFZhbHVlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGEgb3B0aW9uIHRvIGluc3RhbmNlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbiAtIE9wdGlvbiB0aGF0IHlvdSB3YW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0T3B0aW9uOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgdGhpcy5fb3B0aW9uID0ge1xuICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiAwLFxuICAgICAgICAgICAgc3RlcDogMSxcbiAgICAgICAgICAgIG1heDogTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIgfHwgOTAwNzE5OTI1NDc0MDk5MSxcbiAgICAgICAgICAgIG1pbjogTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVIgfHwgLTkwMDcxOTkyNTQ3NDA5OTEsXG4gICAgICAgICAgICB1cEJ0blRhZzogJzxidXR0b24gdHlwZT1cImJ1dHRvblwiPjxiPis8L2I+PC9idXR0b24+JyxcbiAgICAgICAgICAgIGRvd25CdG5UYWc6ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIj48Yj4tPC9iPjwvYnV0dG9uPidcbiAgICAgICAgfTtcbiAgICAgICAgdXRpbC5leHRlbmQodGhpcy5fb3B0aW9uLCBvcHRpb24pO1xuXG4gICAgICAgIGlmICghdXRpbC5pc0FycmF5KHRoaXMuX29wdGlvbi5leGNsdXNpb24pKSB7XG4gICAgICAgICAgICB0aGlzLl9vcHRpb24uZXhjbHVzaW9uID0gW107XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuX2lzVmFsaWRPcHRpb24oKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTcGluYm94IG9wdGlvbiBpcyBpbnZhaWxkJyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogaXMgYSB2YWxpZCBvcHRpb24/XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzVmFsaWRPcHRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3B0ID0gdGhpcy5fb3B0aW9uO1xuXG4gICAgICAgIHJldHVybiAodGhpcy5faXNWYWxpZFZhbHVlKG9wdC5kZWZhdWx0VmFsdWUpICYmIHRoaXMuX2lzVmFsaWRTdGVwKG9wdC5zdGVwKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGlzIGEgdmFsaWQgdmFsdWU/XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIGZvciBzcGluYm94XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzVmFsaWRWYWx1ZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgdmFyIG9wdCxcbiAgICAgICAgICAgIGlzQmV0d2VlbixcbiAgICAgICAgICAgIGlzTm90SW5BcnJheTtcblxuICAgICAgICBpZiAoIXV0aWwuaXNOdW1iZXIodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBvcHQgPSB0aGlzLl9vcHRpb247XG4gICAgICAgIGlzQmV0d2VlbiA9IHZhbHVlIDw9IG9wdC5tYXggJiYgdmFsdWUgPj0gb3B0Lm1pbjtcbiAgICAgICAgaXNOb3RJbkFycmF5ID0gKGluQXJyYXkodmFsdWUsIG9wdC5leGNsdXNpb24pID09PSAtMSk7XG5cbiAgICAgICAgcmV0dXJuIChpc0JldHdlZW4gJiYgaXNOb3RJbkFycmF5KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogaXMgYSB2YWxpZCBzdGVwP1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIGZvciBzcGluYm94IHVwL2Rvd25cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNWYWxpZFN0ZXA6IGZ1bmN0aW9uKHN0ZXApIHtcbiAgICAgICAgdmFyIG1heFN0ZXAgPSAodGhpcy5fb3B0aW9uLm1heCAtIHRoaXMuX29wdGlvbi5taW4pO1xuXG4gICAgICAgIHJldHVybiAodXRpbC5pc051bWJlcihzdGVwKSAmJiBzdGVwIDwgbWF4U3RlcCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFzc2lnbiBlbGVtZW50cyB0byBpbnNpZGUgb2YgY29udGFpbmVyLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Fzc2lnbkhUTUxFbGVtZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX3NldElucHV0U2l6ZUFuZE1heExlbmd0aCgpO1xuICAgICAgICB0aGlzLl9tYWtlQnV0dG9uKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1ha2UgdXAvZG93biBidXR0b25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyICRpbnB1dCA9IHRoaXMuXyRpbnB1dEVsZW1lbnQsXG4gICAgICAgICAgICAkdXBCdG4gPSB0aGlzLl8kdXBCdXR0b24gPSAkKHRoaXMuX29wdGlvbi51cEJ0blRhZyksXG4gICAgICAgICAgICAkZG93bkJ0biA9IHRoaXMuXyRkb3duQnV0dG9uID0gJCh0aGlzLl9vcHRpb24uZG93bkJ0blRhZyk7XG5cbiAgICAgICAgJHVwQnRuLmluc2VydEJlZm9yZSgkaW5wdXQpO1xuICAgICAgICAkdXBCdG4ud3JhcCgnPGRpdj48L2Rpdj4nKTtcbiAgICAgICAgJGRvd25CdG4uaW5zZXJ0QWZ0ZXIoJGlucHV0KTtcbiAgICAgICAgJGRvd25CdG4ud3JhcCgnPGRpdj48L2Rpdj4nKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHNpemUvbWF4bGVuZ3RoIGF0dHJpYnV0ZXMgb2YgaW5wdXQgZWxlbWVudC5cbiAgICAgKiBEZWZhdWx0IHZhbHVlIGlzIGEgZGlnaXRzIG9mIGEgbG9uZ2VyIHZhbHVlIG9mIG9wdGlvbi5taW4gb3Igb3B0aW9uLm1heFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldElucHV0U2l6ZUFuZE1heExlbmd0aDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkaW5wdXQgPSB0aGlzLl8kaW5wdXRFbGVtZW50LFxuICAgICAgICAgICAgbWluVmFsdWVMZW5ndGggPSBTdHJpbmcodGhpcy5fb3B0aW9uLm1pbikubGVuZ3RoLFxuICAgICAgICAgICAgbWF4VmFsdWVMZW5ndGggPSBTdHJpbmcodGhpcy5fb3B0aW9uLm1heCkubGVuZ3RoLFxuICAgICAgICAgICAgbWF4bGVuZ3RoID0gTWF0aC5tYXgobWluVmFsdWVMZW5ndGgsIG1heFZhbHVlTGVuZ3RoKTtcblxuICAgICAgICBpZiAoISRpbnB1dC5hdHRyKCdzaXplJykpIHtcbiAgICAgICAgICAgICRpbnB1dC5hdHRyKCdzaXplJywgbWF4bGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoISRpbnB1dC5hdHRyKCdtYXhsZW5ndGgnKSkge1xuICAgICAgICAgICAgJGlucHV0LmF0dHIoJ21heGxlbmd0aCcsIG1heGxlbmd0aCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXNzaWduIGRlZmF1bHQgZXZlbnRzIHRvIHVwL2Rvd24gYnV0dG9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXNzaWduRGVmYXVsdEV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvbkNsaWNrID0gdXRpbC5iaW5kKHRoaXMuX29uQ2xpY2tCdXR0b24sIHRoaXMpLFxuICAgICAgICAgICAgb25LZXlEb3duID0gdXRpbC5iaW5kKHRoaXMuX29uS2V5RG93bklucHV0RWxlbWVudCwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5fJHVwQnV0dG9uLm9uKCdjbGljaycsIHtpc0Rvd246IGZhbHNlfSwgb25DbGljayk7XG4gICAgICAgIHRoaXMuXyRkb3duQnV0dG9uLm9uKCdjbGljaycsIHtpc0Rvd246IHRydWV9LCBvbkNsaWNrKTtcbiAgICAgICAgdGhpcy5fJGlucHV0RWxlbWVudC5vbigna2V5ZG93bicsIG9uS2V5RG93bik7XG4gICAgICAgIHRoaXMuXyRpbnB1dEVsZW1lbnQub24oJ2NoYW5nZScsIHV0aWwuYmluZCh0aGlzLl9vbkNoYW5nZUlucHV0LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBpbnB1dCB2YWx1ZSB3aGVuIHVzZXIgY2xpY2sgYSBidXR0b24uXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc0Rvd24gLSBJZiBhIHVzZXIgY2xpY2tlZCBhIGRvd24tYnV0dHRvbiwgdGhpcyB2YWx1ZSBpcyB0cnVlLiAgRWxzZSBpZiBhIHVzZXIgY2xpY2tlZCBhIHVwLWJ1dHRvbiwgdGhpcyB2YWx1ZSBpcyBmYWxzZS5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXROZXh0VmFsdWU6IGZ1bmN0aW9uKGlzRG93bikge1xuICAgICAgICB2YXIgb3B0ID0gdGhpcy5fb3B0aW9uLFxuICAgICAgICAgICAgc3RlcCA9IG9wdC5zdGVwLFxuICAgICAgICAgICAgbWluID0gb3B0Lm1pbixcbiAgICAgICAgICAgIG1heCA9IG9wdC5tYXgsXG4gICAgICAgICAgICBleGNsdXNpb24gPSBvcHQuZXhjbHVzaW9uLFxuICAgICAgICAgICAgbmV4dFZhbHVlID0gdGhpcy5nZXRWYWx1ZSgpO1xuXG4gICAgICAgIGlmIChpc0Rvd24pIHtcbiAgICAgICAgICAgIHN0ZXAgPSAtc3RlcDtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIG5leHRWYWx1ZSArPSBzdGVwO1xuICAgICAgICAgICAgaWYgKG5leHRWYWx1ZSA+IG1heCkge1xuICAgICAgICAgICAgICAgIG5leHRWYWx1ZSA9IG1pbjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobmV4dFZhbHVlIDwgbWluKSB7XG4gICAgICAgICAgICAgICAgbmV4dFZhbHVlID0gbWF4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IHdoaWxlIChpbkFycmF5KG5leHRWYWx1ZSwgZXhjbHVzaW9uKSA+IC0xKTtcblxuICAgICAgICB0aGlzLnNldFZhbHVlKG5leHRWYWx1ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIERPTShVcC9Eb3duIGJ1dHRvbikgQ2xpY2sgRXZlbnQgaGFuZGxlclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IGV2ZW50LW9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uQ2xpY2tCdXR0b246IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHRoaXMuX3NldE5leHRWYWx1ZShldmVudC5kYXRhLmlzRG93bik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIERPTShJbnB1dCBlbGVtZW50KSBLZXlkb3duIEV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCBldmVudC1vYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbktleURvd25JbnB1dEVsZW1lbnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHZhciBrZXlDb2RlID0gZXZlbnQud2hpY2ggfHwgZXZlbnQua2V5Q29kZSxcbiAgICAgICAgICAgIGlzRG93bjtcbiAgICAgICAgc3dpdGNoIChrZXlDb2RlKSB7XG4gICAgICAgICAgICBjYXNlIDM4OiBpc0Rvd24gPSBmYWxzZTsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDQwOiBpc0Rvd24gPSB0cnVlOyBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6IHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3NldE5leHRWYWx1ZShpc0Rvd24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBET00oSW5wdXQgZWxlbWVudCkgQ2hhbmdlIEV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkNoYW5nZUlucHV0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG5ld1ZhbHVlID0gTnVtYmVyKHRoaXMuXyRpbnB1dEVsZW1lbnQudmFsKCkpLFxuICAgICAgICAgICAgaXNDaGFuZ2UgPSB0aGlzLl9pc1ZhbGlkVmFsdWUobmV3VmFsdWUpICYmIHRoaXMuX3ZhbHVlICE9PSBuZXdWYWx1ZSxcbiAgICAgICAgICAgIG5leHRWYWx1ZSA9IChpc0NoYW5nZSkgPyBuZXdWYWx1ZSA6IHRoaXMuX3ZhbHVlO1xuXG4gICAgICAgIHRoaXMuX3ZhbHVlID0gbmV4dFZhbHVlO1xuICAgICAgICB0aGlzLl8kaW5wdXRFbGVtZW50LnZhbChuZXh0VmFsdWUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgc3RlcCBvZiBzcGluYm94XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0ZXAgZm9yIHNwaW5ib3hcbiAgICAgKi9cbiAgICBzZXRTdGVwOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgIGlmICghdGhpcy5faXNWYWxpZFN0ZXAoc3RlcCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9vcHRpb24uc3RlcCA9IHN0ZXA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGdldCBzdGVwIG9mIHNwaW5ib3hcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBzdGVwXG4gICAgICovXG4gICAgZ2V0U3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vcHRpb24uc3RlcDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGEgaW5wdXQgdmFsdWUuXG4gICAgICogQHJldHVybnMge251bWJlcn0gRGF0YSBpbiBpbnB1dC1ib3hcbiAgICAgKi9cbiAgICBnZXRWYWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl92YWx1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGEgdmFsdWUgdG8gaW5wdXQtYm94LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIFZhbHVlIHRoYXQgeW91IHdhbnRcbiAgICAgKi9cbiAgICBzZXRWYWx1ZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgdGhpcy5fJGlucHV0RWxlbWVudC52YWwodmFsdWUpLmNoYW5nZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gYSBvcHRpb24gb2YgaW5zdGFuY2UuXG4gICAgICogQHJldHVybnMge09iamVjdH0gT3B0aW9uIG9mIGluc3RhbmNlXG4gICAgICovXG4gICAgZ2V0T3B0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIHZhbHVlIHRoYXQgd2lsbCBiZSBleGNsdWRlZC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBWYWx1ZSB0aGF0IHdpbGwgYmUgZXhjbHVkZWQuXG4gICAgICovXG4gICAgYWRkRXhjbHVzaW9uOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICB2YXIgZXhjbHVzaW9uID0gdGhpcy5fb3B0aW9uLmV4Y2x1c2lvbjtcblxuICAgICAgICBpZiAoaW5BcnJheSh2YWx1ZSwgZXhjbHVzaW9uKSA+IC0xKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZXhjbHVzaW9uLnB1c2godmFsdWUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgYSB2YWx1ZSB3aGljaCB3YXMgZXhjbHVkZWQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gVmFsdWUgdGhhdCB3aWxsIGJlIHJlbW92ZWQgZnJvbSBhIGV4Y2x1c2lvbiBsaXN0IG9mIGluc3RhbmNlXG4gICAgICovXG4gICAgcmVtb3ZlRXhjbHVzaW9uOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICB2YXIgZXhjbHVzaW9uID0gdGhpcy5fb3B0aW9uLmV4Y2x1c2lvbixcbiAgICAgICAgICAgIGluZGV4ID0gaW5BcnJheSh2YWx1ZSwgZXhjbHVzaW9uKTtcblxuICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZXhjbHVzaW9uLnNwbGljZShpbmRleCwgMSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGdldCBjb250YWluZXIgZWxlbWVudFxuICAgICAqIEByZXR1cm4ge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gICAgICovXG4gICAgZ2V0Q29udGFpbmVyRWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl8kY29udGFpbmVyRWxlbWVudFswXTtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTcGluYm94O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRpbWVQaWNrZXIgQ29tcG9uZW50XG4gKiBAYXV0aG9yIE5ITiBlbnQgRkUgZGV2IDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+IDxtaW5reXUueWlAbmhuZW50LmNvbT5cbiAqIEBkZXBlbmRlbmN5IGpxdWVyeS0xLjguMywgY29kZS1zbmlwcGV0LTEuMC4yLCBzcGluYm94LmpzXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbCA9IHR1aS51dGlsLFxuICAgIFNwaW5ib3ggPSByZXF1aXJlKCcuL3NwaW5ib3gnKSxcbiAgICB0aW1lUmVnRXhwID0gL1xccyooXFxkezEsMn0pXFxzKjpcXHMqKFxcZHsxLDJ9KVxccyooW2FwXVttXSk/KD86W1xcc1xcU10qKS9pLFxuICAgIHRpbWVQaWNrZXJUYWcgPSAnPHRhYmxlIGNsYXNzPVwidGltZXBpY2tlclwiPjx0ciBjbGFzcz1cInRpbWVwaWNrZXItcm93XCI+PC90cj48L3RhYmxlPicsXG4gICAgY29sdW1uVGFnID0gJzx0ZCBjbGFzcz1cInRpbWVwaWNrZXItY29sdW1uXCI+PC90ZD4nLFxuICAgIHNwaW5Cb3hUYWcgPSAnPHRkIGNsYXNzPVwidGltZXBpY2tlci1jb2x1bW4gdGltZXBpY2tlci1zcGluYm94XCI+PGRpdj48aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInRpbWVwaWNrZXItc3BpbmJveC1pbnB1dFwiPjwvZGl2PjwvdGQ+JyxcbiAgICB1cEJ0blRhZyA9ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cInRpbWVwaWNrZXItYnRuIHRpbWVwaWNrZXItYnRuLXVwXCI+PGI+KzwvYj48L2J1dHRvbj4nLFxuICAgIGRvd25CdG5UYWcgPSAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJ0aW1lcGlja2VyLWJ0biB0aW1lcGlja2VyLWJ0bi1kb3duXCI+PGI+LTwvYj48L2J1dHRvbj4nO1xuXG4vKipcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25dIC0gb3B0aW9uIGZvciBpbml0aWFsaXphdGlvblxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLmRlZmF1bHRIb3VyID0gMF0gLSBpbml0aWFsIHNldHRpbmcgdmFsdWUgb2YgaG91clxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24uZGVmYXVsdE1pbnV0ZSA9IDBdIC0gaW5pdGlhbCBzZXR0aW5nIHZhbHVlIG9mIG1pbnV0ZVxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gW29wdGlvbi5pbnB1dEVsZW1lbnQgPSBudWxsXSAtIG9wdGlvbmFsIGlucHV0IGVsZW1lbnQgd2l0aCB0aW1lcGlja2VyXG4gKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbi5ob3VyU3RlcCA9IDFdIC0gc3RlcCBvZiBob3VyIHNwaW5ib3guIGlmIHN0ZXAgPSAyLCBob3VyIHZhbHVlIDEgLT4gMyAtPiA1IC0+IC4uLlxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24ubWludXRlU3RlcCA9IDFdIC0gc3RlcCBvZiBtaW51dGUgc3BpbmJveC4gaWYgc3RlcCA9IDIsIG1pbnV0ZSB2YWx1ZSAxIC0+IDMgLT4gNSAtPiAuLi5cbiAqIEBwYXJhbSB7QXJyYXl9IFtvcHRpb24uaG91ckV4Y2x1c2lvbiA9IG51bGxdIC0gaG91ciB2YWx1ZSB0byBiZSBleGNsdWRlZC4gaWYgaG91ciBbMSwzXSBpcyBleGNsdWRlZCwgaG91ciB2YWx1ZSAwIC0+IDIgLT4gNCAtPiA1IC0+IC4uLlxuICogQHBhcmFtIHtBcnJheX0gW29wdGlvbi5taW51dGVFeGNsdXNpb24gPSBudWxsXSAtIG1pbnV0ZSB2YWx1ZSB0byBiZSBleGNsdWRlZC4gaWYgbWludXRlIFsxLDNdIGlzIGV4Y2x1ZGVkLCBtaW51dGUgdmFsdWUgMCAtPiAyIC0+IDQgLT4gNSAtPiAuLi5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbi5zaG93TWVyaWRpYW4gPSBmYWxzZV0gLSBpcyB0aW1lIGV4cHJlc3Npb24tXCJoaDptbSBBTS9QTVwiP1xuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb24ucG9zaXRpb24gPSB7fV0gLSBsZWZ0LCB0b3AgcG9zaXRpb24gb2YgdGltZXBpY2tlciBlbGVtZW50XG4gKi9cbnZhciBUaW1lUGlja2VyID0gdXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFRpbWVQaWNrZXIucHJvdG90eXBlICovIHtcbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtqUXVlcnl9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLiR0aW1lUGlja2VyRWxlbWVudCA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtqUXVlcnl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl8kaW5wdXRFbGVtZW50ID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge2pRdWVyeX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuXyRtZXJpZGlhbkVsZW1lbnQgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7U3BpbmJveH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2hvdXJTcGluYm94ID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge1NwaW5ib3h9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9taW51dGVTcGluYm94ID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogdGltZSBwaWNrZXIgZWxlbWVudCBzaG93IHVwP1xuICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2lzU2hvd24gPSBmYWxzZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge09iamVjdH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX29wdGlvbiA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9ob3VyID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX21pbnV0ZSA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5faW5pdGlhbGl6ZShvcHRpb24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIHdpdGggb3B0aW9uXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbiBmb3IgdGltZSBwaWNrZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbml0aWFsaXplOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgdGhpcy5fc2V0T3B0aW9uKG9wdGlvbik7XG4gICAgICAgIHRoaXMuX21ha2VTcGluYm94ZXMoKTtcbiAgICAgICAgdGhpcy5fbWFrZVRpbWVQaWNrZXJFbGVtZW50KCk7XG4gICAgICAgIHRoaXMuX2Fzc2lnbkRlZmF1bHRFdmVudHMoKTtcbiAgICAgICAgdGhpcy5mcm9tU3BpbmJveGVzKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBvcHRpb25cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uIGZvciB0aW1lIHBpY2tlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldE9wdGlvbjogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIHRoaXMuX29wdGlvbiA9IHtcbiAgICAgICAgICAgIGRlZmF1bHRIb3VyOiAwLFxuICAgICAgICAgICAgZGVmYXVsdE1pbnV0ZTogMCxcbiAgICAgICAgICAgIGlucHV0RWxlbWVudDogbnVsbCxcbiAgICAgICAgICAgIGhvdXJTdGVwOiAxLFxuICAgICAgICAgICAgbWludXRlU3RlcDogMSxcbiAgICAgICAgICAgIGhvdXJFeGNsdXNpb246IG51bGwsXG4gICAgICAgICAgICBtaW51dGVFeGNsdXNpb246IG51bGwsXG4gICAgICAgICAgICBzaG93TWVyaWRpYW46IGZhbHNlLFxuICAgICAgICAgICAgcG9zaXRpb246IHt9XG4gICAgICAgIH07XG5cbiAgICAgICAgdXRpbC5leHRlbmQodGhpcy5fb3B0aW9uLCBvcHRpb24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBtYWtlIHNwaW5ib3hlcyAoaG91ciAmIG1pbnV0ZSlcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlU3BpbmJveGVzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wdCA9IHRoaXMuX29wdGlvbjtcblxuICAgICAgICB0aGlzLl9ob3VyU3BpbmJveCA9IG5ldyBTcGluYm94KHNwaW5Cb3hUYWcsIHtcbiAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogb3B0LmRlZmF1bHRIb3VyLFxuICAgICAgICAgICAgbWluOiAwLFxuICAgICAgICAgICAgbWF4OiAyMyxcbiAgICAgICAgICAgIHN0ZXA6IG9wdC5ob3VyU3RlcCxcbiAgICAgICAgICAgIHVwQnRuVGFnOiB1cEJ0blRhZyxcbiAgICAgICAgICAgIGRvd25CdG5UYWc6IGRvd25CdG5UYWcsXG4gICAgICAgICAgICBleGNsdXNpb246IG9wdC5ob3VyRXhjbHVzaW9uXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuX21pbnV0ZVNwaW5ib3ggPSBuZXcgU3BpbmJveChzcGluQm94VGFnLCB7XG4gICAgICAgICAgICBkZWZhdWx0VmFsdWU6IG9wdC5kZWZhdWx0TWludXRlLFxuICAgICAgICAgICAgbWluOiAwLFxuICAgICAgICAgICAgbWF4OiA1OSxcbiAgICAgICAgICAgIHN0ZXA6IG9wdC5taW51dGVTdGVwLFxuICAgICAgICAgICAgdXBCdG5UYWc6IHVwQnRuVGFnLFxuICAgICAgICAgICAgZG93bkJ0blRhZzogZG93bkJ0blRhZyxcbiAgICAgICAgICAgIGV4Y2x1c2lvbjogb3B0Lm1pbnV0ZUV4Y2x1c2lvblxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogbWFrZSB0aW1lcGlja2VyIGNvbnRhaW5lclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VUaW1lUGlja2VyRWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcHQgPSB0aGlzLl9vcHRpb24sXG4gICAgICAgICAgICAkdHAgPSAkKHRpbWVQaWNrZXJUYWcpLFxuICAgICAgICAgICAgJHRwUm93ID0gJHRwLmZpbmQoJy50aW1lcGlja2VyLXJvdycpLFxuICAgICAgICAgICAgJG1lcmlkaWFuLFxuICAgICAgICAgICAgJGNvbG9uID0gJChjb2x1bW5UYWcpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCdjb2xvbicpXG4gICAgICAgICAgICAgICAgLmFwcGVuZCgnOicpO1xuXG5cbiAgICAgICAgJHRwUm93LmFwcGVuZCh0aGlzLl9ob3VyU3BpbmJveC5nZXRDb250YWluZXJFbGVtZW50KCksICRjb2xvbiwgdGhpcy5fbWludXRlU3BpbmJveC5nZXRDb250YWluZXJFbGVtZW50KCkpO1xuXG4gICAgICAgIGlmIChvcHQuc2hvd01lcmlkaWFuKSB7XG4gICAgICAgICAgICAkbWVyaWRpYW4gPSAkKGNvbHVtblRhZylcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ21lcmlkaWFuJylcbiAgICAgICAgICAgICAgICAuYXBwZW5kKHRoaXMuX2lzUE0gPyAnUE0nIDogJ0FNJyk7XG4gICAgICAgICAgICB0aGlzLl8kbWVyaWRpYW5FbGVtZW50ID0gJG1lcmlkaWFuO1xuICAgICAgICAgICAgJHRwUm93LmFwcGVuZCgkbWVyaWRpYW4pO1xuICAgICAgICB9XG5cbiAgICAgICAgJHRwLmhpZGUoKTtcbiAgICAgICAgJCgnYm9keScpLmFwcGVuZCgkdHApO1xuICAgICAgICB0aGlzLiR0aW1lUGlja2VyRWxlbWVudCA9ICR0cDtcblxuICAgICAgICBpZiAob3B0LmlucHV0RWxlbWVudCkge1xuICAgICAgICAgICAgJHRwLmNzcygncG9zaXRpb24nLCAnYWJzb2x1dGUnKTtcbiAgICAgICAgICAgIHRoaXMuXyRpbnB1dEVsZW1lbnQgPSAkKG9wdC5pbnB1dEVsZW1lbnQpO1xuICAgICAgICAgICAgdGhpcy5fc2V0RGVmYXVsdFBvc2l0aW9uKHRoaXMuXyRpbnB1dEVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCBwb3NpdGlvbiBvZiB0aW1lcGlja2VyIGNvbnRhaW5lclxuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSAkaW5wdXQganF1ZXJ5LW9iamVjdCAoZWxlbWVudClcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXREZWZhdWx0UG9zaXRpb246IGZ1bmN0aW9uKCRpbnB1dCkge1xuICAgICAgICB2YXIgaW5wdXRFbCA9ICRpbnB1dFswXSxcbiAgICAgICAgICAgIHBvc2l0aW9uID0gdGhpcy5fb3B0aW9uLnBvc2l0aW9uLFxuICAgICAgICAgICAgeCA9IHBvc2l0aW9uLngsXG4gICAgICAgICAgICB5ID0gcG9zaXRpb24ueTtcblxuICAgICAgICBpZiAoIXV0aWwuaXNOdW1iZXIoeCkgfHwgIXV0aWwuaXNOdW1iZXIoeSkpIHtcbiAgICAgICAgICAgIHggPSBpbnB1dEVsLm9mZnNldExlZnQ7XG4gICAgICAgICAgICB5ID0gaW5wdXRFbC5vZmZzZXRUb3AgKyBpbnB1dEVsLm9mZnNldEhlaWdodCArIDM7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRYWVBvc2l0aW9uKHgsIHkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBhc3NpZ24gZGVmYXVsdCBldmVudHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hc3NpZ25EZWZhdWx0RXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyICRpbnB1dCA9IHRoaXMuXyRpbnB1dEVsZW1lbnQ7XG5cbiAgICAgICAgaWYgKCRpbnB1dCkge1xuICAgICAgICAgICAgdGhpcy5fYXNzaWduRXZlbnRzVG9JbnB1dEVsZW1lbnQoKTtcbiAgICAgICAgICAgIHRoaXMub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICRpbnB1dC52YWwodGhpcy5nZXRUaW1lKCkpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy4kdGltZVBpY2tlckVsZW1lbnQub24oJ2NoYW5nZScsIHV0aWwuYmluZCh0aGlzLl9vbkNoYW5nZVRpbWVQaWNrZXIsIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogYXR0YWNoIGV2ZW50IHRvIElucHV0IGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hc3NpZ25FdmVudHNUb0lucHV0RWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICRpbnB1dCA9IHRoaXMuXyRpbnB1dEVsZW1lbnQ7XG5cbiAgICAgICAgJGlucHV0Lm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBzZWxmLm9wZW4oZXZlbnQpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkaW5wdXQub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCFzZWxmLnNldFRpbWVGcm9tSW5wdXRFbGVtZW50KCkpIHtcbiAgICAgICAgICAgICAgICAkaW5wdXQudmFsKHNlbGYuZ2V0VGltZSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGRvbSBldmVudCBoYW5kbGVyICh0aW1lcGlja2VyKVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uQ2hhbmdlVGltZVBpY2tlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZnJvbVNwaW5ib3hlcygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBpcyBjbGlja2VkIGluc2lkZSBvZiBjb250YWluZXI/XG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgZXZlbnQtb2JqZWN0XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzQ2xpY2tlZEluc2lkZTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyIGlzQ29udGFpbnMgPSAkLmNvbnRhaW5zKHRoaXMuJHRpbWVQaWNrZXJFbGVtZW50WzBdLCBldmVudC50YXJnZXQpLFxuICAgICAgICAgICAgaXNJbnB1dEVsZW1lbnQgPSAodGhpcy5fJGlucHV0RWxlbWVudCAmJiB0aGlzLl8kaW5wdXRFbGVtZW50WzBdID09PSBldmVudC50YXJnZXQpO1xuXG4gICAgICAgIHJldHVybiBpc0NvbnRhaW5zIHx8IGlzSW5wdXRFbGVtZW50O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiB0cmFuc2Zvcm0gdGltZSBpbnRvIGZvcm1hdHRlZCBzdHJpbmdcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0aW1lIHN0cmluZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Zvcm1Ub1RpbWVGb3JtYXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaG91ciA9IHRoaXMuX2hvdXIsXG4gICAgICAgICAgICBtaW51dGUgPSB0aGlzLl9taW51dGUsXG4gICAgICAgICAgICBwb3N0Zml4ID0gdGhpcy5fZ2V0UG9zdGZpeCgpLFxuICAgICAgICAgICAgZm9ybWF0dGVkSG91cixcbiAgICAgICAgICAgIGZvcm1hdHRlZE1pbnV0ZTtcblxuICAgICAgICBpZiAodGhpcy5fb3B0aW9uLnNob3dNZXJpZGlhbikge1xuICAgICAgICAgICAgaG91ciAlPSAxMjtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvcm1hdHRlZEhvdXIgPSAoaG91ciA8IDEwKSA/ICcwJyArIGhvdXIgOiBob3VyO1xuICAgICAgICBmb3JtYXR0ZWRNaW51dGUgPSAobWludXRlIDwgMTApID8gJzAnICsgbWludXRlIDogbWludXRlO1xuICAgICAgICByZXR1cm4gZm9ybWF0dGVkSG91ciArICc6JyArIGZvcm1hdHRlZE1pbnV0ZSArIHBvc3RmaXg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCB0aGUgYm9vbGVhbiB2YWx1ZSAnaXNQTScgd2hlbiBBTS9QTSBvcHRpb24gaXMgdHJ1ZS5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRJc1BNOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5faXNQTSA9ICh0aGlzLl9ob3VyID4gMTEpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBnZXQgcG9zdGZpeCB3aGVuIEFNL1BNIG9wdGlvbiBpcyB0cnVlLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHBvc3RmaXggKEFNL1BNKVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFBvc3RmaXg6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcG9zdGZpeCA9ICcnO1xuXG4gICAgICAgIGlmICh0aGlzLl9vcHRpb24uc2hvd01lcmlkaWFuKSB7XG4gICAgICAgICAgICBwb3N0Zml4ID0gKHRoaXMuX2lzUE0pID8gJyBQTScgOiAnIEFNJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcG9zdGZpeDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IHBvc2l0aW9uIG9mIGNvbnRhaW5lclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gaXQgd2lsbCBiZSBvZmZzZXRMZWZ0IG9mIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geSAtIGl0IHdpbGwgYmUgb2Zmc2V0VG9wIG9mIGVsZW1lbnRcbiAgICAgKi9cbiAgICBzZXRYWVBvc2l0aW9uOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIHZhciBwb3NpdGlvbjtcblxuICAgICAgICBpZiAoIXV0aWwuaXNOdW1iZXIoeCkgfHwgIXV0aWwuaXNOdW1iZXIoeSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHBvc2l0aW9uID0gdGhpcy5fb3B0aW9uLnBvc2l0aW9uO1xuICAgICAgICBwb3NpdGlvbi54ID0geDtcbiAgICAgICAgcG9zaXRpb24ueSA9IHk7XG4gICAgICAgIHRoaXMuJHRpbWVQaWNrZXJFbGVtZW50LmNzcyh7bGVmdDogeCwgdG9wOiB5fSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNob3cgdGltZSBwaWNrZXIgZWxlbWVudFxuICAgICAqL1xuICAgIHNob3c6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLiR0aW1lUGlja2VyRWxlbWVudC5zaG93KCk7XG4gICAgICAgIHRoaXMuX2lzU2hvd24gPSB0cnVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBoaWRlIHRpbWUgcGlja2VyIGVsZW1lbnRcbiAgICAgKi9cbiAgICBoaWRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy4kdGltZVBpY2tlckVsZW1lbnQuaGlkZSgpO1xuICAgICAgICB0aGlzLl9pc1Nob3duID0gZmFsc2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGxpc3RlbmVyIHRvIHNob3cgY29udGFpbmVyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgZXZlbnQtb2JqZWN0XG4gICAgICovXG4gICAgb3BlbjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzU2hvd24pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsIHV0aWwuYmluZCh0aGlzLmNsb3NlLCB0aGlzKSk7XG4gICAgICAgIHRoaXMuc2hvdygpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBPcGVuIGV2ZW50IC0gVGltZVBpY2tlclxuICAgICAgICAgKiBAZXZlbnQgVGltZVBpY2tlciNvcGVuXG4gICAgICAgICAqIEBwYXJhbSB7KGpRdWVyeS5FdmVudHx1bmRlZmluZWQpfSAtIENsaWNrIHRoZSBpbnB1dCBlbGVtZW50XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmZpcmUoJ29wZW4nLCBldmVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGxpc3RlbmVyIHRvIGhpZGUgY29udGFpbmVyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgZXZlbnQtb2JqZWN0XG4gICAgICovXG4gICAgY2xvc2U6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmICghdGhpcy5faXNTaG93biB8fCB0aGlzLl9pc0NsaWNrZWRJbnNpZGUoZXZlbnQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAkKGRvY3VtZW50KS5vZmYoZXZlbnQpO1xuICAgICAgICB0aGlzLmhpZGUoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogSGlkZSBldmVudCAtIFRpbWVwaWNrZXJcbiAgICAgICAgICogQGV2ZW50IFRpbWVQaWNrZXIjY2xvc2VcbiAgICAgICAgICogQHBhcmFtIHsoalF1ZXJ5LkV2ZW50fHVuZGVmaW5lZCl9IC0gQ2xpY2sgdGhlIGRvY3VtZW50IChub3QgVGltZVBpY2tlcilcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZmlyZSgnY2xvc2UnLCBldmVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCB2YWx1ZXMgaW4gc3BpbmJveGVzIGZyb20gdGltZVxuICAgICAqL1xuICAgIHRvU3BpbmJveGVzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGhvdXIgPSB0aGlzLl9ob3VyLFxuICAgICAgICAgICAgbWludXRlID0gdGhpcy5fbWludXRlO1xuXG4gICAgICAgIHRoaXMuX2hvdXJTcGluYm94LnNldFZhbHVlKGhvdXIpO1xuICAgICAgICB0aGlzLl9taW51dGVTcGluYm94LnNldFZhbHVlKG1pbnV0ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCB0aW1lIGZyb20gc3BpbmJveGVzIHZhbHVlc1xuICAgICAqL1xuICAgIGZyb21TcGluYm94ZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaG91ciA9IHRoaXMuX2hvdXJTcGluYm94LmdldFZhbHVlKCksXG4gICAgICAgICAgICBtaW51dGUgPSB0aGlzLl9taW51dGVTcGluYm94LmdldFZhbHVlKCk7XG5cbiAgICAgICAgdGhpcy5zZXRUaW1lKGhvdXIsIG1pbnV0ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCB0aW1lIGZyb20gaW5wdXQgZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fGpRdWVyeX0gW2lucHV0RWxlbWVudF0ganF1ZXJ5IG9iamVjdCAoZWxlbWVudClcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSByZXN1bHQgb2Ygc2V0IHRpbWVcbiAgICAgKi9cbiAgICBzZXRUaW1lRnJvbUlucHV0RWxlbWVudDogZnVuY3Rpb24oaW5wdXRFbGVtZW50KSB7XG4gICAgICAgIHZhciBpbnB1dCA9ICQoaW5wdXRFbGVtZW50KVswXSB8fCB0aGlzLl8kaW5wdXRFbGVtZW50WzBdO1xuICAgICAgICByZXR1cm4gISEoaW5wdXQgJiYgdGhpcy5zZXRUaW1lRnJvbVN0cmluZyhpbnB1dC52YWx1ZSkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgaG91clxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBob3VyIGZvciB0aW1lIHBpY2tlclxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHJlc3VsdCBvZiBzZXQgdGltZVxuICAgICAqL1xuICAgIHNldEhvdXI6IGZ1bmN0aW9uKGhvdXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0VGltZShob3VyLCB0aGlzLl9taW51dGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgbWludXRlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbnV0ZSBmb3IgdGltZSBwaWNrZXJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSByZXN1bHQgb2Ygc2V0IHRpbWVcbiAgICAgKi9cbiAgICBzZXRNaW51dGU6IGZ1bmN0aW9uKG1pbnV0ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRUaW1lKHRoaXMuX2hvdXIsIG1pbnV0ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCB0aW1lXG4gICAgICogQGFwaVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBob3VyIGZvciB0aW1lIHBpY2tlclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW51dGUgZm9yIHRpbWUgcGlja2VyXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gcmVzdWx0IG9mIHNldCB0aW1lXG4gICAgICovXG4gICAgc2V0VGltZTogZnVuY3Rpb24oaG91ciwgbWludXRlKSB7XG4gICAgICAgIHZhciBpc051bWJlciA9ICh1dGlsLmlzTnVtYmVyKGhvdXIpICYmIHV0aWwuaXNOdW1iZXIobWludXRlKSksXG4gICAgICAgICAgICBpc0NoYW5nZSA9ICh0aGlzLl9ob3VyICE9PSBob3VyIHx8IHRoaXMuX21pbnV0ZSAhPT0gbWludXRlKSxcbiAgICAgICAgICAgIGlzVmFsaWQgPSAoaG91ciA8IDI0ICYmIG1pbnV0ZSA8IDYwKTtcblxuICAgICAgICBpZiAoIWlzTnVtYmVyIHx8ICFpc0NoYW5nZSB8fCAhaXNWYWxpZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5faG91ciA9IGhvdXI7XG4gICAgICAgIHRoaXMuX21pbnV0ZSA9IG1pbnV0ZTtcbiAgICAgICAgdGhpcy5fc2V0SXNQTSgpO1xuICAgICAgICB0aGlzLnRvU3BpbmJveGVzKCk7XG4gICAgICAgIGlmICh0aGlzLl8kbWVyaWRpYW5FbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLl8kbWVyaWRpYW5FbGVtZW50Lmh0bWwodGhpcy5fZ2V0UG9zdGZpeCgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDaGFuZ2UgZXZlbnQgLSBUaW1lUGlja2VyXG4gICAgICAgICAqIEBldmVudCBUaW1lUGlja2VyI2NoYW5nZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5maXJlKCdjaGFuZ2UnKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCB0aW1lIGZyb20gdGltZS1zdHJpbmdcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGltZVN0cmluZyB0aW1lLXN0cmluZ1xuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHJlc3VsdCBvZiBzZXQgdGltZVxuICAgICAqL1xuICAgIHNldFRpbWVGcm9tU3RyaW5nOiBmdW5jdGlvbih0aW1lU3RyaW5nKSB7XG4gICAgICAgIHZhciBob3VyLFxuICAgICAgICAgICAgbWludXRlLFxuICAgICAgICAgICAgcG9zdGZpeCxcbiAgICAgICAgICAgIGlzUE07XG5cbiAgICAgICAgaWYgKHRpbWVSZWdFeHAudGVzdCh0aW1lU3RyaW5nKSkge1xuICAgICAgICAgICAgaG91ciA9IE51bWJlcihSZWdFeHAuJDEpO1xuICAgICAgICAgICAgbWludXRlID0gTnVtYmVyKFJlZ0V4cC4kMik7XG4gICAgICAgICAgICBwb3N0Zml4ID0gUmVnRXhwLiQzLnRvVXBwZXJDYXNlKCk7XG5cbiAgICAgICAgICAgIGlmIChob3VyIDwgMjQgJiYgdGhpcy5fb3B0aW9uLnNob3dNZXJpZGlhbikge1xuICAgICAgICAgICAgICAgIGlmIChwb3N0Zml4ID09PSAnUE0nKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzUE0gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocG9zdGZpeCA9PT0gJ0FNJykge1xuICAgICAgICAgICAgICAgICAgICBpc1BNID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaXNQTSA9IHRoaXMuX2lzUE07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGlzUE0pIHtcbiAgICAgICAgICAgICAgICAgICAgaG91ciArPSAxMjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0VGltZShob3VyLCBtaW51dGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgc3RlcCBvZiBob3VyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0ZXAgZm9yIHRpbWUgcGlja2VyXG4gICAgICovXG4gICAgc2V0SG91clN0ZXA6IGZ1bmN0aW9uKHN0ZXApIHtcbiAgICAgICAgdGhpcy5faG91clNwaW5ib3guc2V0U3RlcChzdGVwKTtcbiAgICAgICAgdGhpcy5fb3B0aW9uLmhvdXJTdGVwID0gdGhpcy5faG91clNwaW5ib3guZ2V0U3RlcCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgc3RlcCBvZiBtaW51dGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RlcCBmb3IgdGltZSBwaWNrZXJcbiAgICAgKi9cbiAgICBzZXRNaW51dGVTdGVwOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgIHRoaXMuX21pbnV0ZVNwaW5ib3guc2V0U3RlcChzdGVwKTtcbiAgICAgICAgdGhpcy5fb3B0aW9uLm1pbnV0ZVN0ZXAgPSB0aGlzLl9taW51dGVTcGluYm94LmdldFN0ZXAoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogYWRkIGEgc3BlY2lmaWMgaG91ciB0byBleGNsdWRlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhvdXIgZm9yIGV4Y2x1c2lvblxuICAgICAqL1xuICAgIGFkZEhvdXJFeGNsdXNpb246IGZ1bmN0aW9uKGhvdXIpIHtcbiAgICAgICAgdGhpcy5faG91clNwaW5ib3guYWRkRXhjbHVzaW9uKGhvdXIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBhZGQgYSBzcGVjaWZpYyBtaW51dGUgdG8gZXhjbHVkZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW51dGUgZm9yIGV4Y2x1c2lvblxuICAgICAqL1xuICAgIGFkZE1pbnV0ZUV4Y2x1c2lvbjogZnVuY3Rpb24obWludXRlKSB7XG4gICAgICAgIHRoaXMuX21pbnV0ZVNwaW5ib3guYWRkRXhjbHVzaW9uKG1pbnV0ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGdldCBzdGVwIG9mIGhvdXJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBob3VyIHVwL2Rvd24gc3RlcFxuICAgICAqL1xuICAgIGdldEhvdXJTdGVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbi5ob3VyU3RlcDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogZ2V0IHN0ZXAgb2YgbWludXRlXG4gICAgICogQHJldHVybnMge251bWJlcn0gbWludXRlIHVwL2Rvd24gc3RlcFxuICAgICAqL1xuICAgIGdldE1pbnV0ZVN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9uLm1pbnV0ZVN0ZXA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJlbW92ZSBob3VyIGZyb20gZXhjbHVzaW9uIGxpc3RcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaG91ciB0aGF0IHlvdSB3YW50IHRvIHJlbW92ZVxuICAgICAqL1xuICAgIHJlbW92ZUhvdXJFeGNsdXNpb246IGZ1bmN0aW9uKGhvdXIpIHtcbiAgICAgICAgdGhpcy5faG91clNwaW5ib3gucmVtb3ZlRXhjbHVzaW9uKGhvdXIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZW1vdmUgbWludXRlIGZyb20gZXhjbHVzaW9uIGxpc3RcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWludXRlIHRoYXQgeW91IHdhbnQgdG8gcmVtb3ZlXG4gICAgICovXG4gICAgcmVtb3ZlTWludXRlRXhjbHVzaW9uOiBmdW5jdGlvbihtaW51dGUpIHtcbiAgICAgICAgdGhpcy5fbWludXRlU3BpbmJveC5yZW1vdmVFeGNsdXNpb24obWludXRlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogZ2V0IGhvdXJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBob3VyXG4gICAgICovXG4gICAgZ2V0SG91cjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ob3VyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBnZXQgbWludXRlXG4gICAgICogQHJldHVybnMge251bWJlcn0gbWludXRlXG4gICAgICovXG4gICAgZ2V0TWludXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21pbnV0ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogZ2V0IHRpbWVcbiAgICAgKiBAYXBpXG4gICAgICogQHJldHVybnMge3N0cmluZ30gJ2hoOm1tIChBTS9QTSknXG4gICAgICovXG4gICAgZ2V0VGltZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9mb3JtVG9UaW1lRm9ybWF0KCk7XG4gICAgfVxufSk7XG50dWkudXRpbC5DdXN0b21FdmVudHMubWl4aW4oVGltZVBpY2tlcik7XG5cbm1vZHVsZS5leHBvcnRzID0gVGltZVBpY2tlcjtcblxuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFV0aWxzIGZvciBjYWxlbmRhciBjb21wb25lbnRcbiAqIEBhdXRob3IgTkhOIE5ldC4gRkUgZGV2IHRlYW0uIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKiBAZGVwZW5kZW5jeSBuZS1jb2RlLXNuaXBwZXQgfjEuMC4yXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFV0aWxzIG9mIGNhbGVuZGFyXG4gKiBAbmFtZXNwYWNlIHV0aWxzXG4gKi9cbnZhciB1dGlscyA9IHtcbiAgICAvKipcbiAgICAgKiBSZXR1cm4gZGF0ZSBoYXNoIGJ5IHBhcmFtZXRlci5cbiAgICAgKiAgaWYgdGhlcmUgYXJlIDMgcGFyYW1ldGVyLCB0aGUgcGFyYW1ldGVyIGlzIGNvcmduaXplZCBEYXRlIG9iamVjdFxuICAgICAqICBpZiB0aGVyZSBhcmUgbm8gcGFyYW1ldGVyLCByZXR1cm4gdG9kYXkncyBoYXNoIGRhdGVcbiAgICAgKiBAZnVuY3Rpb24gZ2V0RGF0ZUhhc2hUYWJsZVxuICAgICAqIEBtZW1iZXJvZiB1dGlsc1xuICAgICAqIEBwYXJhbSB7RGF0ZXxudW1iZXJ9IFt5ZWFyXSBBIGRhdGUgaW5zdGFuY2Ugb3IgeWVhclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbbW9udGhdIEEgbW9udGhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW2RhdGVdIEEgZGF0ZVxuICAgICAqIEByZXR1cm5zIHt7eWVhcjogKiwgbW9udGg6ICosIGRhdGU6ICp9fSBcbiAgICAgKi9cbiAgICBnZXREYXRlSGFzaFRhYmxlOiBmdW5jdGlvbih5ZWFyLCBtb250aCwgZGF0ZSkge1xuICAgICAgICB2YXIgbkRhdGU7XG5cbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzKSB7XG4gICAgICAgICAgICBuRGF0ZSA9IGFyZ3VtZW50c1swXSB8fCBuZXcgRGF0ZSgpO1xuXG4gICAgICAgICAgICB5ZWFyID0gbkRhdGUuZ2V0RnVsbFllYXIoKTtcbiAgICAgICAgICAgIG1vbnRoID0gbkRhdGUuZ2V0TW9udGgoKSArIDE7XG4gICAgICAgICAgICBkYXRlID0gbkRhdGUuZ2V0RGF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHllYXI6IHllYXIsXG4gICAgICAgICAgICBtb250aDogbW9udGgsXG4gICAgICAgICAgICBkYXRlOiBkYXRlXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0b2RheSB0aGF0IHNhdmVkIG9uIGNvbXBvbmVudCBvciBjcmVhdGUgbmV3IGRhdGUuXG4gICAgICogQGZ1bmN0aW9uIGdldFRvZGF5XG4gICAgICogQHJldHVybnMge3t5ZWFyOiAqLCBtb250aDogKiwgZGF0ZTogKn19XG4gICAgICogQG1lbWJlcm9mIHV0aWxzXG4gICAgICovXG4gICAgZ2V0VG9kYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgIHJldHVybiB1dGlscy5nZXREYXRlSGFzaFRhYmxlKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB3ZWVrcyBjb3VudCBieSBwYXJhbWVudGVyXG4gICAgICogQGZ1bmN0aW9uIGdldFdlZWtzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHllYXIgQSB5ZWFyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1vbnRoIEEgbW9udGhcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IOyjvCAoNH42KVxuICAgICAqIEBtZW1iZXJvZiB1dGlsc1xuICAgICAqKi9cbiAgICBnZXRXZWVrczogZnVuY3Rpb24oeWVhciwgbW9udGgpIHtcbiAgICAgICAgdmFyIGZpcnN0RGF5ID0gdXRpbHMuZ2V0Rmlyc3REYXkoeWVhciwgbW9udGgpLFxuICAgICAgICAgICAgbGFzdERhdGUgPSB1dGlscy5nZXRMYXN0RGF0ZSh5ZWFyLCBtb250aCk7XG5cbiAgICAgICAgcmV0dXJuIE1hdGguY2VpbCgoZmlyc3REYXkgKyBsYXN0RGF0ZSkgLyA3KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHVuaXggdGltZSBmcm9tIGRhdGUgaGFzaFxuICAgICAqIEBmdW5jdGlvbiBnZXRUaW1lXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGUgQSBkYXRlIGhhc2hcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGF0ZS55ZWFyIEEgeWVhclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBkYXRlLm1vbnRoIEEgbW9udGhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGF0ZS5kYXRlIEEgZGF0ZVxuICAgICAqIEByZXR1cm4ge251bWJlcn0gXG4gICAgICogQG1lbWJlcm9mIHV0aWxzXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB1dGlscy5nZXRUaW1lKHt5ZWFyOjIwMTAsIG1vbnRoOjUsIGRhdGU6MTJ9KTsgLy8gMTI3MzU5MDAwMDAwMFxuICAgICAqKi9cbiAgICBnZXRUaW1lOiBmdW5jdGlvbihkYXRlKSB7XG4gICAgICAgIHJldHVybiB1dGlscy5nZXREYXRlT2JqZWN0KGRhdGUpLmdldFRpbWUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHdoaWNoIGRheSBpcyBmaXJzdCBieSBwYXJhbWV0ZXJzIHRoYXQgaW5jbHVkZSB5ZWFyIGFuZCBtb250aCBpbmZvcm1hdGlvbi5cbiAgICAgKiBAZnVuY3Rpb24gZ2V0Rmlyc3REYXlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geWVhciBBIHllYXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbW9udGggQSBtb250aFxuICAgICAqIEByZXR1cm4ge251bWJlcn0gKDB+NilcbiAgICAgKiBAbWVtYmVyb2YgdXRpbHNcbiAgICAgKiovXG4gICAgZ2V0Rmlyc3REYXk6IGZ1bmN0aW9uKHllYXIsIG1vbnRoKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZSh5ZWFyLCBtb250aCAtIDEsIDEpLmdldERheSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgd2hpY2ggZGF5IGlzIGxhc3QgYnkgcGFyYW1ldGVycyB0aGF0IGluY2x1ZGUgeWVhciBhbmQgbW9udGggaW5mb3JtYXRpb24uXG4gICAgICogQGZ1bmN0aW9uIGdldExhc3REYXlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geWVhciBBIHllYXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbW9udGggQSBtb250aFxuICAgICAqIEByZXR1cm4ge251bWJlcn0gKDB+NilcbiAgICAgKiBAbWVtYmVyb2YgdXRpbHNcbiAgICAgKiovXG4gICAgZ2V0TGFzdERheTogZnVuY3Rpb24oeWVhciwgbW9udGgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHllYXIsIG1vbnRoLCAwKS5nZXREYXkoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGxhc3QgZGF0ZSBieSBwYXJhbWV0ZXJzIHRoYXQgaW5jbHVkZSB5ZWFyIGFuZCBtb250aCBpbmZvcm1hdGlvbi5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0ge251bWJlcn0geWVhciBBIHllYXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbW9udGggQSBtb250aFxuICAgICAqIEByZXR1cm4ge251bWJlcn0gKDF+MzEpXG4gICAgICogQG1lbWJlcm9mIHV0aWxzXG4gICAgICoqL1xuICAgIGdldExhc3REYXRlOiBmdW5jdGlvbih5ZWFyLCBtb250aCkge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoeWVhciwgbW9udGgsIDApLmdldERhdGUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGRhdGUgaW5zdGFuY2UuXG4gICAgICogQGZ1bmN0aW9uIGdldERhdGVPYmplY3RcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0ZSBBIGRhdGUgaGFzaFxuICAgICAqIEByZXR1cm4ge0RhdGV9IERhdGUgIFxuICAgICAqIEBtZW1iZXJvZiB1dGlsc1xuICAgICAqIEBleGFtcGxlXG4gICAgICogIHV0aWxzLmdldERhdGVPYmplY3Qoe3llYXI6MjAxMCwgbW9udGg6NSwgZGF0ZToxMn0pO1xuICAgICAqICB1dGlscy5nZXREYXRlT2JqZWN0KDIwMTAsIDUsIDEyKTsgLy95ZWFyLG1vbnRoLGRhdGVcbiAgICAgKiovXG4gICAgZ2V0RGF0ZU9iamVjdDogZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGFyZ3VtZW50c1swXSwgYXJndW1lbnRzWzFdIC0gMSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IERhdGUoZGF0ZS55ZWFyLCBkYXRlLm1vbnRoIC0gMSwgZGF0ZS5kYXRlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHJlbGF0ZWQgZGF0ZSBoYXNoIHdpdGggcGFyYW1ldGVycyB0aGF0IGluY2x1ZGUgZGF0ZSBpbmZvcm1hdGlvbi5cbiAgICAgKiBAZnVuY3Rpb24gZ2V0UmVsYXRpdmVEYXRlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHllYXIgQSByZWxhdGVkIHZhbHVlIGZvciB5ZWFyKHlvdSBjYW4gdXNlICsvLSlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbW9udGggQSByZWxhdGVkIHZhbHVlIGZvciBtb250aCAoeW91IGNhbiB1c2UgKy8tKVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBkYXRlIEEgcmVsYXRlZCB2YWx1ZSBmb3IgZGF5ICh5b3UgY2FuIHVzZSArLy0pXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGVPYmogc3RhbmRhcmQgZGF0ZSBoYXNoXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBkYXRlT2JqIFxuICAgICAqIEBtZW1iZXJvZiB1dGlsc1xuICAgICAqIEBleGFtcGxlXG4gICAgICogIHV0aWxzLmdldFJlbGF0aXZlRGF0ZSgxLCAwLCAwLCB7eWVhcjoyMDAwLCBtb250aDoxLCBkYXRlOjF9KTsgLy8ge3llYXI6MjAwMSwgbW9udGg6MSwgZGF0ZToxfVxuICAgICAqICB1dGlscy5nZXRSZWxhdGl2ZURhdGUoMCwgMCwgLTEsIHt5ZWFyOjIwMTAsIG1vbnRoOjEsIGRhdGU6MX0pOyAvLyB7eWVhcjoyMDA5LCBtb250aDoxMiwgZGF0ZTozMX1cbiAgICAgKiovXG4gICAgZ2V0UmVsYXRpdmVEYXRlOiBmdW5jdGlvbih5ZWFyLCBtb250aCwgZGF0ZSwgZGF0ZU9iaikge1xuICAgICAgICB2YXIgblllYXIgPSAoZGF0ZU9iai55ZWFyICsgeWVhciksXG4gICAgICAgICAgICBuTW9udGggPSAoZGF0ZU9iai5tb250aCArIG1vbnRoIC0gMSksXG4gICAgICAgICAgICBuRGF0ZSA9IChkYXRlT2JqLmRhdGUgKyBkYXRlKSxcbiAgICAgICAgICAgIG5EYXRlT2JqID0gbmV3IERhdGUoblllYXIsIG5Nb250aCwgbkRhdGUpO1xuXG4gICAgICAgIHJldHVybiB1dGlscy5nZXREYXRlSGFzaFRhYmxlKG5EYXRlT2JqKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZmllbGRcbiAgICAgKiBAcGFyYW0gdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7e2ZvdW5kOiBib29sZWFuLCBpbmRleDogKn19XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBzZWFyY2g6IGZ1bmN0aW9uKGZpZWxkLCB2YWx1ZSkge1xuICAgICAgICB2YXIgZW5kID0gZmFsc2UsXG4gICAgICAgICAgICBmb3VuZCA9IGZhbHNlLFxuICAgICAgICAgICAgbG93ID0gMCxcbiAgICAgICAgICAgIGhpZ2ggPSBmaWVsZC5sZW5ndGggLSAxLFxuICAgICAgICAgICAgaW5kZXgsIGZpZWxkVmFsdWU7XG5cbiAgICAgICAgd2hpbGUgKCFmb3VuZCAmJiAhZW5kKSB7XG4gICAgICAgICAgICBpbmRleCA9IE1hdGguZmxvb3IoKGxvdyArIGhpZ2gpIC8gMik7XG4gICAgICAgICAgICBmaWVsZFZhbHVlID0gZmllbGRbaW5kZXhdO1xuXG4gICAgICAgICAgICBpZiAoZmllbGRWYWx1ZSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGZpZWxkVmFsdWUgPCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGxvdyA9IGluZGV4ICsgMTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGlnaCA9IGluZGV4IC0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVuZCA9IChsb3cgPiBoaWdoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmb3VuZDogZm91bmQsXG4gICAgICAgICAgICBpbmRleDogKGZvdW5kIHx8IGZpZWxkVmFsdWUgPiB2YWx1ZSkgPyBpbmRleCA6IGluZGV4ICsgMVxuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB1dGlscztcbiJdfQ==
