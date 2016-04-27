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
 * You can get a date from 'getYear', 'getMonth', 'getDayInMonth', 'getDateHash'
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
        this._ranges = tui.util.filter(this._ranges, function(range) {
            return (this._isValidDate(range[0]) && this._isValidDate(range[1]));
        }, this);

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

        tui.util.forEach(this._ranges, function(range) {
            this._updateTimeRange({
                start: utils.getTime(range[0]),
                end: utils.getTime(range[1])
            });
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
            start: this._startTimes[index],
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
        }, this);
        this.on('close', function() {
            this._timePicker.off('change', onChangeTimePicker);
        }, this);
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
        var inRange = true,
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
            $prevYearBtn = $header.find('[class*="btn-prev-year"]').hide(),
            $prevMonthBtn = $header.find('[class*="btn-prev-month"]').hide(),
            $nextYearBtn = $header.find('[class*="btn-next-year"]').hide(),
            $nextMonthBtn = $header.find('[class*="btn-next-month"]').hide(),
            shownDateHash = this._calendar.getDate(),
            shownDate = new Date(shownDateHash.year, shownDateHash.month - 1),
            startDate = new Date(this._startTimes[0] || CONSTANTS.MIN_EDGE).setDate(1),
            endDate = new Date(this._endTimes.slice(-1)[0] || CONSTANTS.MAX_EDGE).setDate(1),// arr.slice(-1)[0] === arr[arr.length - 1]
            startDifference = shownDate - startDate,
            endDifference = endDate - shownDate;

        if (startDifference > 0) {
            $prevMonthBtn.show();
            if (startDifference >= CONSTANTS.YEAR_TO_MS) {
                $prevYearBtn.show();
            }
        }

        if (endDifference > 0) {
            $nextMonthBtn.show();
            if (endDifference >= CONSTANTS.YEAR_TO_MS) {
                $nextYearBtn.show();
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
     * Bind a (mousedown|touchstart) event of document
     * @private
     */
    _bindOnMousedownDocument: function() {
        var eventType = (this.useTouchEvent) ? 'touchstart' : 'mousedown';
        $(document).on(eventType, this._proxyHandlers.onMousedownDocument);
    },

    /**
     * Unbind mousedown,touchstart events of document
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
        if (this._isValidDate(startHash) && this._isValidDate(endHash)) {
            this._ranges.push([startHash, endHash]);
            this._setSelectableRanges();
            this._calendar.draw();
        }
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
        var eventType = (this.useTouchEvent) ? 'touchend' : 'click',
            $opener = $(opener);

        opener = $opener[0];
        if (opener && inArray(opener, this._openers) < 0) {
            this._openers.push(opener);
            $opener.on(eventType, this._proxyHandlers.onClickOpener);
        }
    },

    /**
     * remove opener
     * @api
     * @param {HTMLElement|jQuery|string} opener - element or selector
     */
    removeOpener: function(opener) {
        var $opener = $(opener),
            index = inArray($opener[0], this._openers);

        if (index > -1) {
            $opener.off('click touchend', this._proxyHandlers.onClickOpener);
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
     * @returns {dateHash} - dateHash having year, month and day-in-month
     * @example
     * // 2015-04-13
     * datepicker.getDateHash(); // {year: 2015, month: 4, date: 13}
     */
    getDateHash: function() {
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
     * Binary search
     * @param {Array} field - Search field
     * @param {Array} value - Search target
     * @returns {{found: boolean, index: number}} Result
     * @private
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
        }
    }
};

module.exports = utils;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9kYXRlcGlja2VyLmpzIiwic3JjL3NwaW5ib3guanMiLCJzcmMvdGltZXBpY2tlci5qcyIsInNyYy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6d0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM2tCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInR1aS51dGlsLmRlZmluZU5hbWVzcGFjZSgndHVpLmNvbXBvbmVudC5TcGluYm94JywgcmVxdWlyZSgnLi9zcmMvc3BpbmJveCcpKTtcbnR1aS51dGlsLmRlZmluZU5hbWVzcGFjZSgndHVpLmNvbXBvbmVudC5UaW1lUGlja2VyJywgcmVxdWlyZSgnLi9zcmMvdGltZXBpY2tlcicpKTtcbnR1aS51dGlsLmRlZmluZU5hbWVzcGFjZSgndHVpLmNvbXBvbmVudC5EYXRlUGlja2VyJywgcmVxdWlyZSgnLi9zcmMvZGF0ZXBpY2tlcicpKTtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBuaG5lbnQgb24gMTUuIDUuIDE0Li5cbiAqIEBmaWxlb3ZlcnZpZXcgVGhpcyBjb21wb25lbnQgcHJvdmlkZXMgYSBjYWxlbmRhciBmb3IgcGlja2luZyBhIGRhdGUgJiB0aW1lLlxuICogQGF1dGhvciBOSE4gZW50IEZFIGRldiA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPiA8bWlua3l1LnlpQG5obmVudC5jb20+XG4gKiBAZGVwZW5kZW5jeSBqcXVlcnktMS44LjMsIGNvZGUtc25pcHBldC0xLjAuMiwgY29tcG9uZW50LWNhbGVuZGFyLTEuMC4xLCB0aW1lUGlja2VyLmpzXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciBpbkFycmF5ID0gdHVpLnV0aWwuaW5BcnJheSxcbiAgICBmb3JtYXRSZWdFeHAgPSAveXl5eXx5eXxtbXxtfGRkfGQvZ2ksXG4gICAgbWFwRm9yQ29udmVydGluZyA9IHtcbiAgICAgICAgeXl5eToge2V4cHJlc3Npb246ICcoXFxcXGR7NH18XFxcXGR7Mn0pJywgdHlwZTogJ3llYXInfSxcbiAgICAgICAgeXk6IHtleHByZXNzaW9uOiAnKFxcXFxkezR9fFxcXFxkezJ9KScsIHR5cGU6ICd5ZWFyJ30sXG4gICAgICAgIHk6IHtleHByZXNzaW9uOiAnKFxcXFxkezR9fFxcXFxkezJ9KScsIHR5cGU6ICd5ZWFyJ30sXG4gICAgICAgIG1tOiB7ZXhwcmVzc2lvbjogJygxWzAxMl18MFsxLTldfFsxLTldXFxcXGIpJywgdHlwZTogJ21vbnRoJ30sXG4gICAgICAgIG06IHtleHByZXNzaW9uOiAnKDFbMDEyXXwwWzEtOV18WzEtOV1cXFxcYiknLCB0eXBlOiAnbW9udGgnfSxcbiAgICAgICAgZGQ6IHtleHByZXNzaW9uOiAnKFsxMl1cXFxcZHsxfXwzWzAxXXwwWzEtOV18WzEtOV1cXFxcYiknLCB0eXBlOiAnZGF0ZSd9LFxuICAgICAgICBkOiB7ZXhwcmVzc2lvbjogJyhbMTJdXFxcXGR7MX18M1swMV18MFsxLTldfFsxLTldXFxcXGIpJywgdHlwZTogJ2RhdGUnfVxuICAgIH0sXG4gICAgQ09OU1RBTlRTID0ge1xuICAgICAgICBNSU5fWUVBUjogMTk3MCxcbiAgICAgICAgTUFYX1lFQVI6IDI5OTksXG4gICAgICAgIE1PTlRIX0RBWVM6IFswLCAzMSwgMjgsIDMxLCAzMCwgMzEsIDMwLCAzMSwgMzEsIDMwLCAzMSwgMzAsIDMxXSxcbiAgICAgICAgV1JBUFBFUl9UQUc6ICc8ZGl2IHN0eWxlPVwicG9zaXRpb246YWJzb2x1dGU7XCI+PC9kaXY+JyxcbiAgICAgICAgTUlOX0VER0U6ICtuZXcgRGF0ZSgwKSxcbiAgICAgICAgTUFYX0VER0U6ICtuZXcgRGF0ZSgyOTk5LCAxMSwgMzEpLFxuICAgICAgICBZRUFSX1RPX01TOiAzMTUzNjAwMDAwMFxuICAgIH07XG5cbi8qKlxuICogQSBudW1iZXIsIG9yIGEgc3RyaW5nIGNvbnRhaW5pbmcgYSBudW1iZXIuXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBkYXRlSGFzaFxuICogQHByb3BlcnR5IHtudW1iZXJ9IHllYXIgLSAxOTcwfjI5OTlcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBtb250aCAtIDF+MTJcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBkYXRlIC0gMX4zMVxuICovXG5cbi8qKlxuICogQ3JlYXRlIERhdGVQaWNrZXI8YnI+XG4gKiBZb3UgY2FuIGdldCBhIGRhdGUgZnJvbSAnZ2V0WWVhcicsICdnZXRNb250aCcsICdnZXREYXlJbk1vbnRoJywgJ2dldERhdGVIYXNoJ1xuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uIC0gb3B0aW9ucyBmb3IgRGF0ZVBpY2tlclxuICogICAgICBAcGFyYW0ge0hUTUxFbGVtZW50fHN0cmluZ30gb3B0aW9uLmVsZW1lbnQgLSBpbnB1dCBlbGVtZW50KG9yIHNlbGVjdG9yKSBvZiBEYXRlUGlja2VyXG4gKiAgICAgIEBwYXJhbSB7ZGF0ZUhhc2h9IFtvcHRpb24uZGF0ZSA9IHRvZGF5XSAtIGluaXRpYWwgZGF0ZSBvYmplY3RcbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IFtvcHRpb24uZGF0ZUZvcm0gPSAneXl5eS1tbS1kZCddIC0gZm9ybWF0IG9mIGRhdGUgc3RyaW5nXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9uLmRlZmF1bHRDZW50dXJ5ID0gMjBdIC0gaWYgeWVhci1mb3JtYXQgaXMgeXksIHRoaXMgdmFsdWUgaXMgcHJlcGVuZGVkIGF1dG9tYXRpY2FsbHkuXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9uLnNlbGVjdGFibGVDbGFzc05hbWUgPSAnc2VsZWN0YWJsZSddIC0gZm9yIHNlbGVjdGFibGUgZGF0ZSBlbGVtZW50c1xuICogICAgICBAcGFyYW0ge3N0cmluZ30gW29wdGlvbi5zZWxlY3RlZENsYXNzTmFtZSA9ICdzZWxlY3RlZCddIC0gZm9yIHNlbGVjdGVkIGRhdGUgZWxlbWVudFxuICogICAgICBAcGFyYW0ge0FycmF5LjxBcnJheS48ZGF0ZUhhc2g+Pn0gW29wdGlvbnMuc2VsZWN0YWJsZVJhbmdlc10gLSBTZWxlY3RhYmxlIGRhdGUgcmFuZ2VzLCBTZWUgZXhhbXBsZVxuICogICAgICBAcGFyYW0ge09iamVjdH0gW29wdGlvbi5wb3NdIC0gY2FsZW5kYXIgcG9zaXRpb24gc3R5bGUgdmFsdWVcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLnBvcy5sZWZ0XSAtIHBvc2l0aW9uIGxlZnQgb2YgY2FsZW5kYXJcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLnBvcy50b3BdIC0gcG9zaXRpb24gdG9wIG9mIGNhbGVuZGFyXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gW29wdGlvbi5wb3MuekluZGV4XSAtIHotaW5kZXggb2YgY2FsZW5kYXJcbiAqICAgICAgQHBhcmFtIHtPYmplY3R9IFtvcHRpb24ub3BlbmVycyA9IFtlbGVtZW50XV0gLSBvcGVuZXIgYnV0dG9uIGxpc3QgKGV4YW1wbGUgLSBpY29uLCBidXR0b24sIGV0Yy4pXG4gKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbi5zaG93QWx3YXlzID0gZmFsc2VdIC0gd2hldGhlciB0aGUgZGF0ZXBpY2tlciBzaG93cyB0aGUgY2FsZW5kYXIgYWx3YXlzXG4gKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbi51c2VUb3VjaEV2ZW50ID0gdHJ1ZV0gLSB3aGV0aGVyIHRoZSBkYXRlcGlja2VyIHVzZXMgdG91Y2ggZXZlbnRzXG4gKiAgICAgIEBwYXJhbSB7dHVpLmNvbXBvbmVudC5UaW1lUGlja2VyfSBbb3B0aW9uLnRpbWVQaWNrZXJdIC0gVGltZVBpY2tlciBpbnN0YW5jZVxuICogQHBhcmFtIHt0dWkuY29tcG9uZW50LkNhbGVuZGFyfSBjYWxlbmRhciAtIENhbGVuZGFyIGluc3RhbmNlXG4gKiBAZXhhbXBsZVxuICogICB2YXIgY2FsZW5kYXIgPSBuZXcgdHVpLmNvbXBvbmVudC5DYWxlbmRhcih7XG4gKiAgICAgICBlbGVtZW50OiAnI2xheWVyJyxcbiAqICAgICAgIHRpdGxlRm9ybWF0OiAneXl5eeuFhCBt7JuUJyxcbiAqICAgICAgIHRvZGF5Rm9ybWF0OiAneXl5eeuFhCBtbeyblCBkZOydvCAoRCknXG4gKiAgIH0pO1xuICpcbiAqICAgdmFyIHRpbWVQaWNrZXIgPSBuZXcgdHVpLmNvbXBvbmVudC5UaW1lUGlja2VyKHtcbiAqICAgICAgIHNob3dNZXJpZGlhbjogdHJ1ZSxcbiAqICAgICAgIGRlZmF1bHRIb3VyOiAxMyxcbiAqICAgICAgIGRlZmF1bHRNaW51dGU6IDI0XG4gKiAgIH0pO1xuICpcbiAqICAgdmFyIHJhbmdlMSA9IFtcbiAqICAgICAgICAgIHt5ZWFyOiAyMDE1LCBtb250aDoxLCBkYXRlOiAxfSxcbiAqICAgICAgICAgIHt5ZWFyOiAyMDE1LCBtb250aDoyLCBkYXRlOiAxfVxuICogICAgICBdLFxuICogICAgICByYW5nZTIgPSBbXG4gKiAgICAgICAgICB7eWVhcjogMjAxNSwgbW9udGg6MywgZGF0ZTogMX0sXG4gKiAgICAgICAgICB7eWVhcjogMjAxNSwgbW9udGg6NCwgZGF0ZTogMX1cbiAqICAgICAgXSxcbiAqICAgICAgcmFuZ2UzID0gW1xuICogICAgICAgICAge3llYXI6IDIwMTUsIG1vbnRoOjYsIGRhdGU6IDF9LFxuICogICAgICAgICAge3llYXI6IDIwMTUsIG1vbnRoOjcsIGRhdGU6IDF9XG4gKiAgICAgIF07XG4gKlxuICogICB2YXIgcGlja2VyMSA9IG5ldyB0dWkuY29tcG9uZW50LkRhdGVQaWNrZXIoe1xuICogICAgICAgZWxlbWVudDogJyNwaWNrZXInLFxuICogICAgICAgZGF0ZUZvcm06ICd5eXl564WEIG1t7JuUIGRk7J28IC0gJyxcbiAqICAgICAgIGRhdGU6IHt5ZWFyOiAyMDE1LCBtb250aDogMSwgZGF0ZTogMSB9LFxuICogICAgICAgc2VsZWN0YWJsZVJhbmdlczogW3JhbmdlMSwgcmFuZ2UyLCByYW5nZTNdLFxuICogICAgICAgb3BlbmVyczogWycjb3BlbmVyJ10sXG4gKiAgICAgICB0aW1lUGlja2VyOiB0aW1lUGlja2VyXG4gKiAgIH0sIGNhbGVuZGFyKTtcbiAqXG4gKiAgIC8vIENsb3NlIGNhbGVuZGFyIHdoZW4gc2VsZWN0IGEgZGF0ZVxuICogICAkKCcjbGF5ZXInKS5vbignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICogICAgICAgdmFyICRlbCA9ICQoZXZlbnQudGFyZ2V0KTtcbiAqXG4gKiAgICAgICBpZiAoJGVsLmhhc0NsYXNzKCdzZWxlY3RhYmxlJykpIHtcbiAqICAgICAgICAgICBwaWNrZXIxLmNsb3NlKCk7XG4gKiAgICAgICB9XG4gKiAgIH0pO1xuICovXG52YXIgRGF0ZVBpY2tlciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgRGF0ZVBpY2tlci5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9uLCBjYWxlbmRhcikge1xuICAgICAgICAvLyBzZXQgZGVmYXVsdHNcbiAgICAgICAgb3B0aW9uID0gdHVpLnV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgIGRhdGVGb3JtOiAneXl5eS1tbS1kZCAnLFxuICAgICAgICAgICAgZGVmYXVsdENlbnR1cnk6ICcyMCcsXG4gICAgICAgICAgICBzZWxlY3RhYmxlQ2xhc3NOYW1lOiAnc2VsZWN0YWJsZScsXG4gICAgICAgICAgICBzZWxlY3RlZENsYXNzTmFtZTogJ3NlbGVjdGVkJyxcbiAgICAgICAgICAgIHNlbGVjdGFibGVSYW5nZXM6IFtdLFxuICAgICAgICAgICAgc2hvd0Fsd2F5czogZmFsc2UsXG4gICAgICAgICAgICB1c2VUb3VjaEV2ZW50OiB0cnVlXG4gICAgICAgIH0sIG9wdGlvbik7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENhbGVuZGFyIGluc3RhbmNlXG4gICAgICAgICAqIEB0eXBlIHtDYWxlbmRhcn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2NhbGVuZGFyID0gY2FsZW5kYXI7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEVsZW1lbnQgZm9yIGRpc3BsYXlpbmcgYSBkYXRlIHZhbHVlXG4gICAgICAgICAqIEB0eXBlIHtIVE1MRWxlbWVudH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuXyRlbGVtZW50ID0gJChvcHRpb24uZWxlbWVudCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEVsZW1lbnQgd3JhcHBpbmcgY2FsZW5kYXJcbiAgICAgICAgICogQHR5cGUge0hUTUxFbGVtZW50fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fJHdyYXBwZXJFbGVtZW50ID0gJChDT05TVEFOVFMuV1JBUFBFUl9UQUcpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGb3JtYXQgb2YgZGF0ZSBzdHJpbmdcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2RhdGVGb3JtID0gb3B0aW9uLmRhdGVGb3JtO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZWdFeHAgaW5zdGFuY2UgZm9yIGZvcm1hdCBvZiBkYXRlIHN0cmluZ1xuICAgICAgICAgKiBAdHlwZSB7UmVnRXhwfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fcmVnRXhwID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQXJyYXkgc2F2aW5nIGEgb3JkZXIgb2YgZm9ybWF0XG4gICAgICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHNlZSB7dHVpLmNvbXBvbmVudC5EYXRlUGlja2VyLnByb3RvdHlwZS5zZXREYXRlRm9ybX1cbiAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICogLy8gSWYgdGhlIGZvcm1hdCBpcyBhICdtbS1kZCwgeXl5eSdcbiAgICAgICAgICogLy8gYHRoaXMuX2Zvcm1PcmRlcmAgaXMgWydtb250aCcsICdkYXRlJywgJ3llYXInXVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fZm9ybU9yZGVyID0gW107XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIE9iamVjdCBoYXZpbmcgZGF0ZSB2YWx1ZXNcbiAgICAgICAgICogQHR5cGUge2RhdGVIYXNofVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fZGF0ZSA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoaXMgdmFsdWUgaXMgcHJlcGVuZGVkIGF1dG9tYXRpY2FsbHkgd2hlbiB5ZWFyLWZvcm1hdCBpcyAneXknXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqIC8vXG4gICAgICAgICAqIC8vIElmIHRoaXMgdmFsdWUgaXMgJzIwJywgdGhlIGZvcm1hdCBpcyAneXktbW0tZGQnIGFuZCB0aGUgZGF0ZSBzdHJpbmcgaXMgJzE1LTA0LTEyJyxcbiAgICAgICAgICogLy8gdGhlIGRhdGUgdmFsdWUgb2JqZWN0IGlzXG4gICAgICAgICAqIC8vICB7XG4gICAgICAgICAqIC8vICAgICAgeWVhcjogMjAxNSxcbiAgICAgICAgICogLy8gICAgICBtb250aDogNCxcbiAgICAgICAgICogLy8gICAgICBkYXRlOiAxMlxuICAgICAgICAgKiAvLyAgfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fZGVmYXVsdENlbnR1cnkgPSBvcHRpb24uZGVmYXVsdENlbnR1cnk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENsYXNzIG5hbWUgZm9yIHNlbGVjdGFibGUgZGF0ZSBlbGVtZW50c1xuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fc2VsZWN0YWJsZUNsYXNzTmFtZSA9IG9wdGlvbi5zZWxlY3RhYmxlQ2xhc3NOYW1lO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDbGFzcyBuYW1lIGZvciBzZWxlY3RlZCBkYXRlIGVsZW1lbnRcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3NlbGVjdGVkQ2xhc3NOYW1lID0gb3B0aW9uLnNlbGVjdGVkQ2xhc3NOYW1lO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJdCBpcyBzdGFydCB0aW1lc3RhbXBzIGZyb20gdGhpcy5fcmFuZ2VzXG4gICAgICAgICAqIEB0eXBlIHtBcnJheS48bnVtYmVyPn1cbiAgICAgICAgICogQHNpbmNlIDEuMi4wXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9zdGFydFRpbWVzID0gW107XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEl0IGlzIGVuZCB0aW1lc3RhbXBzIGZyb20gdGhpcy5fcmFuZ2VzXG4gICAgICAgICAqIEB0eXBlIHtBcnJheS48bnVtYmVyPn1cbiAgICAgICAgICogQHNpbmNlIDEuMi4wXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9lbmRUaW1lcyA9IFtdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZWxlY3RhYmxlIGRhdGUgcmFuZ2VzXG4gICAgICAgICAqIEB0eXBlIHtBcnJheS48QXJyYXkuPGRhdGVIYXNoPj59XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBzaW5jZSAxLjIuMFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fcmFuZ2VzID0gb3B0aW9uLnNlbGVjdGFibGVSYW5nZXM7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRpbWVQaWNrZXIgaW5zdGFuY2VcbiAgICAgICAgICogQHR5cGUge1RpbWVQaWNrZXJ9XG4gICAgICAgICAqIEBzaW5jZSAxLjEuMFxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fdGltZVBpY2tlciA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHBvc2l0aW9uIC0gbGVmdCAmIHRvcCAmIHpJbmRleFxuICAgICAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAc2luY2UgMS4xLjFcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3BvcyA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIG9wZW5lcnMgLSBvcGVuZXIgbGlzdFxuICAgICAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBzaW5jZSAxLjEuMVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fb3BlbmVycyA9IFtdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBIYW5kbGVycyBiaW5kaW5nIGNvbnRleHRcbiAgICAgICAgICogQHR5cGUge09iamVjdH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3Byb3h5SGFuZGxlcnMgPSB7fTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogV2hldGhlciB0aGUgZGF0ZXBpY2tlciBzaG93cyBhbHdheXNcbiAgICAgICAgICogQGFwaVxuICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgICAgICogQHNpbmNlIDEuMi4wXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqIGRhdGVwaWNrZXIuc2hvd0Fsd2F5cyA9IHRydWU7XG4gICAgICAgICAqIGRhdGVwaWNrZXIub3BlbigpO1xuICAgICAgICAgKiAvLyBUaGUgZGF0ZXBpY2tlciB3aWxsIGJlIG5vdCBjbG9zZWQgaWYgeW91IGNsaWNrIHRoZSBvdXRzaWRlIG9mIHRoZSBkYXRlcGlja2VyXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnNob3dBbHdheXMgPSBvcHRpb24uc2hvd0Fsd2F5cztcblxuICAgICAgICAvKipcbiAgICAgICAgICogV2hldGhlciB0aGUgZGF0ZXBpY2tlciB1c2UgdG91Y2ggZXZlbnQuXG4gICAgICAgICAqIEBhcGlcbiAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICAgICAqIEBzaW5jZSAxLjIuMFxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKiBkYXRlcGlja2VyLnVzZVRvdWNoRXZlbnQgPSBmYWxzZTtcbiAgICAgICAgICogLy8gVGhlIGRhdGVwaWNrZXIgd2lsbCBiZSB1c2Ugb25seSAnY2xpY2snLCAnbW91c2Vkb3duJyBldmVudHNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudXNlVG91Y2hFdmVudCA9ICEhKFxuICAgICAgICAgICAgKCgnY3JlYXRlVG91Y2gnIGluIGRvY3VtZW50KSB8fCAoJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQpKSAmJlxuICAgICAgICAgICAgb3B0aW9uLnVzZVRvdWNoRXZlbnRcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLl9pbml0aWFsaXplRGF0ZVBpY2tlcihvcHRpb24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIG1ldGhvZFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb24gLSB1c2VyIG9wdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXRpYWxpemVEYXRlUGlja2VyOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgdGhpcy5fcmFuZ2VzID0gdHVpLnV0aWwuZmlsdGVyKHRoaXMuX3JhbmdlcywgZnVuY3Rpb24ocmFuZ2UpIHtcbiAgICAgICAgICAgIHJldHVybiAodGhpcy5faXNWYWxpZERhdGUocmFuZ2VbMF0pICYmIHRoaXMuX2lzVmFsaWREYXRlKHJhbmdlWzFdKSk7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHRoaXMuX3NldFNlbGVjdGFibGVSYW5nZXMoKTtcbiAgICAgICAgdGhpcy5fc2V0V3JhcHBlckVsZW1lbnQoKTtcbiAgICAgICAgdGhpcy5fc2V0RGVmYXVsdERhdGUob3B0aW9uLmRhdGUpO1xuICAgICAgICB0aGlzLl9zZXREZWZhdWx0UG9zaXRpb24ob3B0aW9uLnBvcyk7XG4gICAgICAgIHRoaXMuX3NldFByb3h5SGFuZGxlcnMoKTtcbiAgICAgICAgdGhpcy5fYmluZE9wZW5lckV2ZW50KG9wdGlvbi5vcGVuZXJzKTtcbiAgICAgICAgdGhpcy5fc2V0VGltZVBpY2tlcihvcHRpb24udGltZVBpY2tlcik7XG4gICAgICAgIHRoaXMuc2V0RGF0ZUZvcm0oKTtcbiAgICAgICAgdGhpcy5fJHdyYXBwZXJFbGVtZW50LmhpZGUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHdyYXBwZXIgZWxlbWVudCg9IGNvbnRhaW5lcilcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRXcmFwcGVyRWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkd3JhcHBlckVsZW1lbnQgPSB0aGlzLl8kd3JhcHBlckVsZW1lbnQ7XG5cbiAgICAgICAgJHdyYXBwZXJFbGVtZW50LmFwcGVuZCh0aGlzLl9jYWxlbmRhci4kZWxlbWVudCk7XG4gICAgICAgIGlmICh0aGlzLl8kZWxlbWVudFswXSkge1xuICAgICAgICAgICAgJHdyYXBwZXJFbGVtZW50Lmluc2VydEFmdGVyKHRoaXMuXyRlbGVtZW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICR3cmFwcGVyRWxlbWVudC5hcHBlbmRUbyhkb2N1bWVudC5ib2R5KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgZGVmYXVsdCBkYXRlXG4gICAgICogQHBhcmFtIHt7eWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXRlOiBudW1iZXJ9fERhdGV9IG9wRGF0ZSBbb3B0aW9uLmRhdGVdIC0gdXNlciBzZXR0aW5nOiBkYXRlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0RGVmYXVsdERhdGU6IGZ1bmN0aW9uKG9wRGF0ZSkge1xuICAgICAgICB2YXIgaXNOdW1iZXIgPSB0dWkudXRpbC5pc051bWJlcjtcblxuICAgICAgICBpZiAoIW9wRGF0ZSkge1xuICAgICAgICAgICAgdGhpcy5fZGF0ZSA9IHV0aWxzLmdldFRvZGF5KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9kYXRlID0ge1xuICAgICAgICAgICAgICAgIHllYXI6IGlzTnVtYmVyKG9wRGF0ZS55ZWFyKSA/IG9wRGF0ZS55ZWFyIDogQ09OU1RBTlRTLk1JTl9ZRUFSLFxuICAgICAgICAgICAgICAgIG1vbnRoOiBpc051bWJlcihvcERhdGUubW9udGgpID8gb3BEYXRlLm1vbnRoIDogMSxcbiAgICAgICAgICAgICAgICBkYXRlOiBpc051bWJlcihvcERhdGUuZGF0ZSkgPyBvcERhdGUuZGF0ZSA6IDFcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2F2ZSBkZWZhdWx0IHN0eWxlLXBvc2l0aW9uIG9mIGNhbGVuZGFyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wUG9zIFtvcHRpb24ucG9zXSAtIHVzZXIgc2V0dGluZzogcG9zaXRpb24obGVmdCwgdG9wLCB6SW5kZXgpXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0RGVmYXVsdFBvc2l0aW9uOiBmdW5jdGlvbihvcFBvcykge1xuICAgICAgICB2YXIgcG9zID0gdGhpcy5fcG9zID0gb3BQb3MgfHwge30sXG4gICAgICAgICAgICBib3VuZCA9IHRoaXMuX2dldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgIHBvcy5sZWZ0ID0gcG9zLmxlZnQgfHwgYm91bmQubGVmdCB8fCAwO1xuICAgICAgICBwb3MudG9wID0gcG9zLnRvcCB8fCBib3VuZC5ib3R0b20gfHwgMDtcbiAgICAgICAgcG9zLnpJbmRleCA9IHBvcy56SW5kZXggfHwgOTk5OTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHN0YXJ0L2VuZCBlZGdlIGZyb20gc2VsZWN0YWJsZS1yYW5nZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRTZWxlY3RhYmxlUmFuZ2VzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fc3RhcnRUaW1lcyA9IFtdO1xuICAgICAgICB0aGlzLl9lbmRUaW1lcyA9IFtdO1xuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2godGhpcy5fcmFuZ2VzLCBmdW5jdGlvbihyYW5nZSkge1xuICAgICAgICAgICAgdGhpcy5fdXBkYXRlVGltZVJhbmdlKHtcbiAgICAgICAgICAgICAgICBzdGFydDogdXRpbHMuZ2V0VGltZShyYW5nZVswXSksXG4gICAgICAgICAgICAgICAgZW5kOiB1dGlscy5nZXRUaW1lKHJhbmdlWzFdKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgdGltZSByYW5nZSAoc3RhcnRUaW1lcywgZW5kVGltZXMpXG4gICAgICogQHBhcmFtIHt7c3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXJ9fSBuZXdUaW1lUmFuZ2UgLSBUaW1lIHJhbmdlIGZvciB1cGRhdGVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF91cGRhdGVUaW1lUmFuZ2U6IGZ1bmN0aW9uKG5ld1RpbWVSYW5nZSkge1xuICAgICAgICB2YXIgaW5kZXgsIGV4aXN0aW5nVGltZVJhbmdlLCBtZXJnZWRUaW1lUmFuZ2U7XG5cbiAgICAgICAgaW5kZXggPSB0aGlzLl9zZWFyY2hTdGFydFRpbWUobmV3VGltZVJhbmdlLnN0YXJ0KS5pbmRleDtcbiAgICAgICAgZXhpc3RpbmdUaW1lUmFuZ2UgPSB7XG4gICAgICAgICAgICBzdGFydDogdGhpcy5fc3RhcnRUaW1lc1tpbmRleF0sXG4gICAgICAgICAgICBlbmQ6IHRoaXMuX2VuZFRpbWVzW2luZGV4XVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICh0aGlzLl9pc092ZXJsYXBwZWRUaW1lUmFuZ2UoZXhpc3RpbmdUaW1lUmFuZ2UsIG5ld1RpbWVSYW5nZSkpIHtcbiAgICAgICAgICAgIG1lcmdlZFRpbWVSYW5nZSA9IHRoaXMuX21lcmdlVGltZVJhbmdlcyhleGlzdGluZ1RpbWVSYW5nZSwgbmV3VGltZVJhbmdlKTtcbiAgICAgICAgICAgIHRoaXMuX3N0YXJ0VGltZXMuc3BsaWNlKGluZGV4LCAxLCBtZXJnZWRUaW1lUmFuZ2Uuc3RhcnQpO1xuICAgICAgICAgICAgdGhpcy5fZW5kVGltZXMuc3BsaWNlKGluZGV4LCAxLCBtZXJnZWRUaW1lUmFuZ2UuZW5kKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3N0YXJ0VGltZXMuc3BsaWNlKGluZGV4LCAwLCBuZXdUaW1lUmFuZ2Uuc3RhcnQpO1xuICAgICAgICAgICAgdGhpcy5fZW5kVGltZXMuc3BsaWNlKGluZGV4LCAwLCBuZXdUaW1lUmFuZ2UuZW5kKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHRoZSByYW5nZXMgYXJlIG92ZXJsYXBwZWRcbiAgICAgKiBAcGFyYW0ge3tzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcn19IGV4aXN0aW5nVGltZVJhbmdlIC0gRXhpc3RpbmcgdGltZSByYW5nZVxuICAgICAqIEBwYXJhbSB7e3N0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyfX0gbmV3VGltZVJhbmdlIC0gTmV3IHRpbWUgcmFuZ2VcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gV2hldGhlciB0aGUgcmFuZ2VzIGFyZSBvdmVybGFwcGVkXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNPdmVybGFwcGVkVGltZVJhbmdlOiBmdW5jdGlvbihleGlzdGluZ1RpbWVSYW5nZSwgbmV3VGltZVJhbmdlKSB7XG4gICAgICAgIHZhciBleGlzdGluZ1N0YXJ0ID0gZXhpc3RpbmdUaW1lUmFuZ2Uuc3RhcnQsXG4gICAgICAgICAgICBleGlzdGluZ0VuZCA9IGV4aXN0aW5nVGltZVJhbmdlLmVuZCxcbiAgICAgICAgICAgIG5ld1N0YXJ0ID0gbmV3VGltZVJhbmdlLnN0YXJ0LFxuICAgICAgICAgICAgbmV3RW5kID0gbmV3VGltZVJhbmdlLmVuZCxcbiAgICAgICAgICAgIGlzVHJ1dGh5ID0gZXhpc3RpbmdTdGFydCAmJiBleGlzdGluZ0VuZCAmJiBuZXdTdGFydCAmJiBuZXdFbmQsXG4gICAgICAgICAgICBpc092ZXJsYXBwZWQgPSAhKFxuICAgICAgICAgICAgICAgIChuZXdTdGFydCA8IGV4aXN0aW5nU3RhcnQgJiYgbmV3RW5kIDwgZXhpc3RpbmdTdGFydCkgfHxcbiAgICAgICAgICAgICAgICAobmV3U3RhcnQgPiBleGlzdGluZ0VuZCAmJiBuZXdFbmQgPiBleGlzdGluZ0VuZClcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIGlzVHJ1dGh5ICYmIGlzT3ZlcmxhcHBlZDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTWVyZ2UgdGhlIG92ZXJsYXBwZWQgdGltZSByYW5nZXNcbiAgICAgKiBAcGFyYW0ge3tzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcn19IGV4aXN0aW5nVGltZVJhbmdlIC0gRXhpc3RpbmcgdGltZSByYW5nZVxuICAgICAqIEBwYXJhbSB7e3N0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyfX0gbmV3VGltZVJhbmdlIC0gTmV3IHRpbWUgcmFuZ2VcbiAgICAgKiBAcmV0dXJucyB7e3N0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyfX0gTWVyZ2VkIHRpbWUgcmFuZ2VcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tZXJnZVRpbWVSYW5nZXM6IGZ1bmN0aW9uKGV4aXN0aW5nVGltZVJhbmdlLCBuZXdUaW1lUmFuZ2UpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YXJ0OiBNYXRoLm1pbihleGlzdGluZ1RpbWVSYW5nZS5zdGFydCwgbmV3VGltZVJhbmdlLnN0YXJ0KSxcbiAgICAgICAgICAgIGVuZDogTWF0aC5tYXgoZXhpc3RpbmdUaW1lUmFuZ2UuZW5kLCBuZXdUaW1lUmFuZ2UuZW5kKVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZWFyY2ggdGltZXN0YW1wIGluIHN0YXJ0VGltZXNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGltZXN0YW1wIC0gdGltZXN0YW1wXG4gICAgICogQHJldHVybnMge3tmb3VuZDogYm9vbGVhbiwgaW5kZXg6IG51bWJlcn19IHJlc3VsdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NlYXJjaFN0YXJ0VGltZTogZnVuY3Rpb24odGltZXN0YW1wKSB7XG4gICAgICAgIHJldHVybiB1dGlscy5zZWFyY2godGhpcy5fc3RhcnRUaW1lcywgdGltZXN0YW1wKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2VhcmNoIHRpbWVzdGFtcCBpbiBlbmRUaW1lc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lc3RhbXAgLSB0aW1lc3RhbXBcbiAgICAgKiBAcmV0dXJucyB7e2ZvdW5kOiBib29sZWFuLCBpbmRleDogbnVtYmVyfX0gcmVzdWx0XG4gICAgICovXG4gICAgX3NlYXJjaEVuZFRpbWU6IGZ1bmN0aW9uKHRpbWVzdGFtcCkge1xuICAgICAgICByZXR1cm4gdXRpbHMuc2VhcmNoKHRoaXMuX2VuZFRpbWVzLCB0aW1lc3RhbXApO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdG9yZSBvcGVuZXIgZWxlbWVudCBsaXN0XG4gICAgICogQHBhcmFtIHtBcnJheX0gb3BPcGVuZXJzIFtvcHRpb24ub3BlbmVyc10gLSBvcGVuZXIgZWxlbWVudCBsaXN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0T3BlbmVyczogZnVuY3Rpb24ob3BPcGVuZXJzKSB7XG4gICAgICAgIHRoaXMuYWRkT3BlbmVyKHRoaXMuXyRlbGVtZW50KTtcbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChvcE9wZW5lcnMsIGZ1bmN0aW9uKG9wZW5lcikge1xuICAgICAgICAgICAgdGhpcy5hZGRPcGVuZXIob3BlbmVyKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBUaW1lUGlja2VyIGluc3RhbmNlXG4gICAgICogQHBhcmFtIHt0dWkuY29tcG9uZW50LlRpbWVQaWNrZXJ9IFtvcFRpbWVQaWNrZXJdIC0gVGltZVBpY2tlciBpbnN0YW5jZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldFRpbWVQaWNrZXI6IGZ1bmN0aW9uKG9wVGltZVBpY2tlcikge1xuICAgICAgICBpZiAoIW9wVGltZVBpY2tlcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fdGltZVBpY2tlciA9IG9wVGltZVBpY2tlcjtcbiAgICAgICAgdGhpcy5fYmluZEN1c3RvbUV2ZW50V2l0aFRpbWVQaWNrZXIoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBjdXN0b20gZXZlbnQgd2l0aCBUaW1lUGlja2VyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYmluZEN1c3RvbUV2ZW50V2l0aFRpbWVQaWNrZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb25DaGFuZ2VUaW1lUGlja2VyID0gdHVpLnV0aWwuYmluZCh0aGlzLnNldERhdGUsIHRoaXMpO1xuXG4gICAgICAgIHRoaXMub24oJ29wZW4nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuX3RpbWVQaWNrZXIuc2V0VGltZUZyb21JbnB1dEVsZW1lbnQodGhpcy5fJGVsZW1lbnQpO1xuICAgICAgICAgICAgdGhpcy5fdGltZVBpY2tlci5vbignY2hhbmdlJywgb25DaGFuZ2VUaW1lUGlja2VyKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIHRoaXMub24oJ2Nsb3NlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLl90aW1lUGlja2VyLm9mZignY2hhbmdlJywgb25DaGFuZ2VUaW1lUGlja2VyKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrIHZhbGlkYXRpb24gb2YgYSB5ZWFyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHllYXIgLSB5ZWFyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IC0gd2hldGhlciB0aGUgeWVhciBpcyB2YWxpZCBvciBub3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc1ZhbGlkWWVhcjogZnVuY3Rpb24oeWVhcikge1xuICAgICAgICByZXR1cm4gdHVpLnV0aWwuaXNOdW1iZXIoeWVhcikgJiYgeWVhciA+IENPTlNUQU5UUy5NSU5fWUVBUiAmJiB5ZWFyIDwgQ09OU1RBTlRTLk1BWF9ZRUFSO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayB2YWxpZGF0aW9uIG9mIGEgbW9udGhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbW9udGggLSBtb250aFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSAtIHdoZXRoZXIgdGhlIG1vbnRoIGlzIHZhbGlkIG9yIG5vdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzVmFsaWRNb250aDogZnVuY3Rpb24obW9udGgpIHtcbiAgICAgICAgcmV0dXJuIHR1aS51dGlsLmlzTnVtYmVyKG1vbnRoKSAmJiBtb250aCA+IDAgJiYgbW9udGggPCAxMztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgdmFsaWRhdGlvbiBvZiB2YWx1ZXMgaW4gYSBkYXRlIG9iamVjdCBoYXZpbmcgeWVhciwgbW9udGgsIGRheS1pbi1tb250aFxuICAgICAqIEBwYXJhbSB7ZGF0ZUhhc2h9IGRhdGVIYXNoIC0gZGF0ZUhhc2hcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSB3aGV0aGVyIHRoZSBkYXRlIG9iamVjdCBpcyB2YWxpZCBvciBub3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc1ZhbGlkRGF0ZTogZnVuY3Rpb24oZGF0ZWhhc2gpIHtcbiAgICAgICAgdmFyIHllYXIsIG1vbnRoLCBkYXRlLCBpc0xlYXBZZWFyLCBsYXN0RGF5SW5Nb250aCwgaXNCZXR3ZWVuO1xuXG4gICAgICAgIGlmICghZGF0ZWhhc2gpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHllYXIgPSBkYXRlaGFzaC55ZWFyO1xuICAgICAgICBtb250aCA9IGRhdGVoYXNoLm1vbnRoO1xuICAgICAgICBkYXRlID0gZGF0ZWhhc2guZGF0ZTtcbiAgICAgICAgaXNMZWFwWWVhciA9ICh5ZWFyICUgNCA9PT0gMCkgJiYgKHllYXIgJSAxMDAgIT09IDApIHx8ICh5ZWFyICUgNDAwID09PSAwKTtcbiAgICAgICAgaWYgKCF0aGlzLl9pc1ZhbGlkWWVhcih5ZWFyKSB8fCAhdGhpcy5faXNWYWxpZE1vbnRoKG1vbnRoKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgbGFzdERheUluTW9udGggPSBDT05TVEFOVFMuTU9OVEhfREFZU1ttb250aF07XG4gICAgICAgIGlmIChpc0xlYXBZZWFyICYmIG1vbnRoID09PSAyKSB7XG4gICAgICAgICAgICAgICAgbGFzdERheUluTW9udGggPSAyOTtcbiAgICAgICAgfVxuICAgICAgICBpc0JldHdlZW4gPSAhISh0dWkudXRpbC5pc051bWJlcihkYXRlKSAmJiAoZGF0ZSA+IDApICYmIChkYXRlIDw9IGxhc3REYXlJbk1vbnRoKSk7XG5cbiAgICAgICAgcmV0dXJuIGlzQmV0d2VlbjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgYW4gZWxlbWVudCBpcyBhbiBvcGVuZXIuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBvcGVuZXIgdHJ1ZS9mYWxzZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzT3BlbmVyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2godGhpcy5fb3BlbmVycywgZnVuY3Rpb24ob3BlbmVyKSB7XG4gICAgICAgICAgICBpZiAodGFyZ2V0ID09PSBvcGVuZXIgfHwgJC5jb250YWlucyhvcGVuZXIsIHRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBzdHlsZS1wb3NpdGlvbiBvZiBjYWxlbmRhclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FycmFuZ2VMYXllcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzdHlsZSA9IHRoaXMuXyR3cmFwcGVyRWxlbWVudFswXS5zdHlsZSxcbiAgICAgICAgICAgIHBvcyA9IHRoaXMuX3BvcztcblxuICAgICAgICBzdHlsZS5sZWZ0ID0gcG9zLmxlZnQgKyAncHgnO1xuICAgICAgICBzdHlsZS50b3AgPSBwb3MudG9wICsgJ3B4JztcbiAgICAgICAgc3R5bGUuekluZGV4ID0gcG9zLnpJbmRleDtcbiAgICAgICAgdGhpcy5fJHdyYXBwZXJFbGVtZW50LmFwcGVuZCh0aGlzLl9jYWxlbmRhci4kZWxlbWVudCk7XG4gICAgICAgIGlmICh0aGlzLl90aW1lUGlja2VyKSB7XG4gICAgICAgICAgICB0aGlzLl8kd3JhcHBlckVsZW1lbnQuYXBwZW5kKHRoaXMuX3RpbWVQaWNrZXIuJHRpbWVQaWNrZXJFbGVtZW50KTtcbiAgICAgICAgICAgIHRoaXMuX3RpbWVQaWNrZXIuc2hvdygpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBib3VuZGluZ0NsaWVudFJlY3Qgb2YgYW4gZWxlbWVudFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR8alF1ZXJ5fSBbZWxlbWVudF0gLSBlbGVtZW50XG4gICAgICogQHJldHVybnMge09iamVjdH0gLSBhbiBvYmplY3QgaGF2aW5nIGxlZnQsIHRvcCwgYm90dG9tLCByaWdodCBvZiBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Qm91bmRpbmdDbGllbnRSZWN0OiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIHZhciBlbCA9ICQoZWxlbWVudClbMF0gfHwgdGhpcy5fJGVsZW1lbnRbMF0sXG4gICAgICAgICAgICBib3VuZCxcbiAgICAgICAgICAgIGNlaWw7XG5cbiAgICAgICAgaWYgKCFlbCkge1xuICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgYm91bmQgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY2VpbCA9IE1hdGguY2VpbDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxlZnQ6IGNlaWwoYm91bmQubGVmdCksXG4gICAgICAgICAgICB0b3A6IGNlaWwoYm91bmQudG9wKSxcbiAgICAgICAgICAgIGJvdHRvbTogY2VpbChib3VuZC5ib3R0b20pLFxuICAgICAgICAgICAgcmlnaHQ6IGNlaWwoYm91bmQucmlnaHQpXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBkYXRlIGZyb20gc3RyaW5nXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0ciAtIGRhdGUgc3RyaW5nXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0RGF0ZUZyb21TdHJpbmc6IGZ1bmN0aW9uKHN0cikge1xuICAgICAgICB2YXIgZGF0ZSA9IHRoaXMuX2V4dHJhY3REYXRlKHN0cik7XG5cbiAgICAgICAgaWYgKGRhdGUgJiYgdGhpcy5faXNTZWxlY3RhYmxlKGRhdGUpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fdGltZVBpY2tlcikge1xuICAgICAgICAgICAgICAgIHRoaXMuX3RpbWVQaWNrZXIuc2V0VGltZUZyb21JbnB1dEVsZW1lbnQodGhpcy5fJGVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXREYXRlKGRhdGUueWVhciwgZGF0ZS5tb250aCwgZGF0ZS5kYXRlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0RGF0ZSgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBmb3JtZWQgZGF0ZS1zdHJpbmcgZnJvbSBkYXRlIG9iamVjdFxuICAgICAqIEByZXR1cm4ge3N0cmluZ30gLSBmb3JtZWQgZGF0ZS1zdHJpbmdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mb3JtZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgeWVhciA9IHRoaXMuX2RhdGUueWVhcixcbiAgICAgICAgICAgIG1vbnRoID0gdGhpcy5fZGF0ZS5tb250aCxcbiAgICAgICAgICAgIGRhdGUgPSB0aGlzLl9kYXRlLmRhdGUsXG4gICAgICAgICAgICBmb3JtID0gdGhpcy5fZGF0ZUZvcm0sXG4gICAgICAgICAgICByZXBsYWNlTWFwLFxuICAgICAgICAgICAgZGF0ZVN0cmluZztcblxuICAgICAgICBtb250aCA9IG1vbnRoIDwgMTAgPyAoJzAnICsgbW9udGgpIDogbW9udGg7XG4gICAgICAgIGRhdGUgPSBkYXRlIDwgMTAgPyAoJzAnICsgZGF0ZSkgOiBkYXRlO1xuXG4gICAgICAgIHJlcGxhY2VNYXAgPSB7XG4gICAgICAgICAgICB5eXl5OiB5ZWFyLFxuICAgICAgICAgICAgeXk6IFN0cmluZyh5ZWFyKS5zdWJzdHIoMiwgMiksXG4gICAgICAgICAgICBtbTogbW9udGgsXG4gICAgICAgICAgICBtOiBOdW1iZXIobW9udGgpLFxuICAgICAgICAgICAgZGQ6IGRhdGUsXG4gICAgICAgICAgICBkOiBOdW1iZXIoZGF0ZSlcbiAgICAgICAgfTtcblxuICAgICAgICBkYXRlU3RyaW5nID0gZm9ybS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gcmVwbGFjZU1hcFtrZXkudG9Mb3dlckNhc2UoKV0gfHwgJyc7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBkYXRlU3RyaW5nO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFeHRyYWN0IGRhdGUtb2JqZWN0IGZyb20gaW5wdXQgc3RyaW5nIHdpdGggY29tcGFyaW5nIGRhdGUtZm9ybWF0PGJyPlxuICAgICAqIElmIGNhbiBub3QgZXh0cmFjdCwgcmV0dXJuIGZhbHNlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHN0ciAtIGlucHV0IHN0cmluZyh0ZXh0KVxuICAgICAqIEByZXR1cm5zIHtkYXRlSGFzaHxmYWxzZX0gLSBleHRyYWN0ZWQgZGF0ZSBvYmplY3Qgb3IgZmFsc2VcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9leHRyYWN0RGF0ZTogZnVuY3Rpb24oc3RyKSB7XG4gICAgICAgIHZhciBmb3JtT3JkZXIgPSB0aGlzLl9mb3JtT3JkZXIsXG4gICAgICAgICAgICByZXN1bHREYXRlID0ge30sXG4gICAgICAgICAgICByZWdFeHAgPSB0aGlzLl9yZWdFeHA7XG5cbiAgICAgICAgcmVnRXhwLmxhc3RJbmRleCA9IDA7XG4gICAgICAgIGlmIChyZWdFeHAudGVzdChzdHIpKSB7XG4gICAgICAgICAgICByZXN1bHREYXRlW2Zvcm1PcmRlclswXV0gPSBOdW1iZXIoUmVnRXhwLiQxKTtcbiAgICAgICAgICAgIHJlc3VsdERhdGVbZm9ybU9yZGVyWzFdXSA9IE51bWJlcihSZWdFeHAuJDIpO1xuICAgICAgICAgICAgcmVzdWx0RGF0ZVtmb3JtT3JkZXJbMl1dID0gTnVtYmVyKFJlZ0V4cC4kMyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoU3RyaW5nKHJlc3VsdERhdGUueWVhcikubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICByZXN1bHREYXRlLnllYXIgPSBOdW1iZXIodGhpcy5fZGVmYXVsdENlbnR1cnkgKyByZXN1bHREYXRlLnllYXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdERhdGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgYSBkYXRlSGFzaCBpcyBzZWxlY3RhYmxlXG4gICAgICogQHBhcmFtIHtkYXRlSGFzaH0gZGF0ZUhhc2ggLSBkYXRlSGFzaFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSAtIFdoZXRoZXIgYSBkYXRlSGFzaCBpcyBzZWxlY3RhYmxlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNTZWxlY3RhYmxlOiBmdW5jdGlvbihkYXRlSGFzaCkge1xuICAgICAgICB2YXIgaW5SYW5nZSA9IHRydWUsXG4gICAgICAgICAgICBzdGFydFRpbWVzLCBzdGFydFRpbWUsIHJlc3VsdCwgdGltZXN0YW1wO1xuXG4gICAgICAgIGlmICghdGhpcy5faXNWYWxpZERhdGUoZGF0ZUhhc2gpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBzdGFydFRpbWVzID0gdGhpcy5fc3RhcnRUaW1lcztcbiAgICAgICAgdGltZXN0YW1wID0gdXRpbHMuZ2V0VGltZShkYXRlSGFzaCk7XG5cbiAgICAgICAgaWYgKHN0YXJ0VGltZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9zZWFyY2hFbmRUaW1lKHRpbWVzdGFtcCk7XG4gICAgICAgICAgICBzdGFydFRpbWUgPSBzdGFydFRpbWVzW3Jlc3VsdC5pbmRleF07XG4gICAgICAgICAgICBpblJhbmdlID0gcmVzdWx0LmZvdW5kIHx8ICh0aW1lc3RhbXAgPj0gc3RhcnRUaW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpblJhbmdlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgc2VsZWN0YWJsZS1jbGFzcy1uYW1lIHRvIHNlbGVjdGFibGUgZGF0ZSBlbGVtZW50LlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR8alF1ZXJ5fSBlbGVtZW50IC0gZGF0ZSBlbGVtZW50XG4gICAgICogQHBhcmFtIHt7eWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXRlOiBudW1iZXJ9fSBkYXRlSGFzaCAtIGRhdGUgb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0U2VsZWN0YWJsZUNsYXNzTmFtZTogZnVuY3Rpb24oZWxlbWVudCwgZGF0ZUhhc2gpIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzU2VsZWN0YWJsZShkYXRlSGFzaCkpIHtcbiAgICAgICAgICAgICQoZWxlbWVudCkuYWRkQ2xhc3ModGhpcy5fc2VsZWN0YWJsZUNsYXNzTmFtZSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHNlbGVjdGVkLWNsYXNzLW5hbWUgdG8gc2VsZWN0ZWQgZGF0ZSBlbGVtZW50XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudHxqUXVlcnl9IGVsZW1lbnQgLSBkYXRlIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3t5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRhdGU6IG51bWJlcn19IGRhdGVIYXNoIC0gZGF0ZSBvYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRTZWxlY3RlZENsYXNzTmFtZTogZnVuY3Rpb24oZWxlbWVudCwgZGF0ZUhhc2gpIHtcbiAgICAgICAgdmFyIHllYXIgPSB0aGlzLl9kYXRlLnllYXIsXG4gICAgICAgICAgICBtb250aCA9IHRoaXMuX2RhdGUubW9udGgsXG4gICAgICAgICAgICBkYXRlID0gdGhpcy5fZGF0ZS5kYXRlLFxuICAgICAgICAgICAgaXNTZWxlY3RlZCA9ICh5ZWFyID09PSBkYXRlSGFzaC55ZWFyKSAmJiAobW9udGggPT09IGRhdGVIYXNoLm1vbnRoKSAmJiAoZGF0ZSA9PT0gZGF0ZUhhc2guZGF0ZSk7XG5cbiAgICAgICAgaWYgKGlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICQoZWxlbWVudCkuYWRkQ2xhc3ModGhpcy5fc2VsZWN0ZWRDbGFzc05hbWUpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCB2YWx1ZSBhIGRhdGUtc3RyaW5nIG9mIGN1cnJlbnQgdGhpcyBpbnN0YW5jZSB0byBpbnB1dCBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0VmFsdWVUb0lucHV0RWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkYXRlU3RyaW5nID0gdGhpcy5fZm9ybWVkKCksXG4gICAgICAgICAgICB0aW1lU3RyaW5nID0gJyc7XG5cbiAgICAgICAgaWYgKHRoaXMuX3RpbWVQaWNrZXIpIHtcbiAgICAgICAgICAgIHRpbWVTdHJpbmcgPSB0aGlzLl90aW1lUGlja2VyLmdldFRpbWUoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl8kZWxlbWVudC52YWwoZGF0ZVN0cmluZyArIHRpbWVTdHJpbmcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQob3IgbWFrZSkgUmVnRXhwIGluc3RhbmNlIGZyb20gdGhlIGRhdGUtZm9ybWF0IG9mIHRoaXMgaW5zdGFuY2UuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0UmVnRXhwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlZ0V4cFN0ciA9ICdeJyxcbiAgICAgICAgICAgIGluZGV4ID0gMCxcbiAgICAgICAgICAgIGZvcm1PcmRlciA9IHRoaXMuX2Zvcm1PcmRlcjtcblxuICAgICAgICB0aGlzLl9kYXRlRm9ybS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oc3RyKSB7XG4gICAgICAgICAgICB2YXIga2V5ID0gc3RyLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgICAgIHJlZ0V4cFN0ciArPSAobWFwRm9yQ29udmVydGluZ1trZXldLmV4cHJlc3Npb24gKyAnW1xcXFxEXFxcXHNdKicpO1xuICAgICAgICAgICAgZm9ybU9yZGVyW2luZGV4XSA9IG1hcEZvckNvbnZlcnRpbmdba2V5XS50eXBlO1xuICAgICAgICAgICAgaW5kZXggKz0gMTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX3JlZ0V4cCA9IG5ldyBSZWdFeHAocmVnRXhwU3RyLCAnZ2knKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGV2ZW50IGhhbmRsZXJzIHRvIGJpbmQgY29udGV4dCBhbmQgdGhlbiBzdG9yZS5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRQcm94eUhhbmRsZXJzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHByb3hpZXMgPSB0aGlzLl9wcm94eUhhbmRsZXJzLFxuICAgICAgICAgICAgYmluZCA9IHR1aS51dGlsLmJpbmQ7XG5cbiAgICAgICAgLy8gRXZlbnQgaGFuZGxlcnMgZm9yIGVsZW1lbnRcbiAgICAgICAgcHJveGllcy5vbk1vdXNlZG93bkRvY3VtZW50ID0gYmluZCh0aGlzLl9vbk1vdXNlZG93bkRvY3VtZW50LCB0aGlzKTtcbiAgICAgICAgcHJveGllcy5vbktleWRvd25FbGVtZW50ID0gYmluZCh0aGlzLl9vbktleWRvd25FbGVtZW50LCB0aGlzKTtcbiAgICAgICAgcHJveGllcy5vbkNsaWNrQ2FsZW5kYXIgPSBiaW5kKHRoaXMuX29uQ2xpY2tDYWxlbmRhciwgdGhpcyk7XG4gICAgICAgIHByb3hpZXMub25DbGlja09wZW5lciA9IGJpbmQodGhpcy5fb25DbGlja09wZW5lciwgdGhpcyk7XG5cbiAgICAgICAgLy8gRXZlbnQgaGFuZGxlcnMgZm9yIGN1c3RvbSBldmVudCBvZiBjYWxlbmRhclxuICAgICAgICBwcm94aWVzLm9uQmVmb3JlRHJhd0NhbGVuZGFyID0gYmluZCh0aGlzLl9vbkJlZm9yZURyYXdDYWxlbmRhciwgdGhpcyk7XG4gICAgICAgIHByb3hpZXMub25EcmF3Q2FsZW5kYXIgPSBiaW5kKHRoaXMuX29uRHJhd0NhbGVuZGFyLCB0aGlzKTtcbiAgICAgICAgcHJveGllcy5vbkFmdGVyRHJhd0NhbGVuZGFyID0gYmluZCh0aGlzLl9vbkFmdGVyRHJhd0NhbGVuZGFyLCB0aGlzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXZlbnQgaGFuZGxlciBmb3IgbW91c2Vkb3duIG9mIGRvY3VtZW50PGJyPlxuICAgICAqIC0gV2hlbiBjbGljayB0aGUgb3V0IG9mIGxheWVyLCBjbG9zZSB0aGUgbGF5ZXJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCAtIGV2ZW50IG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uTW91c2Vkb3duRG9jdW1lbnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHZhciBpc0NvbnRhaW5zID0gJC5jb250YWlucyh0aGlzLl8kd3JhcHBlckVsZW1lbnRbMF0sIGV2ZW50LnRhcmdldCk7XG5cbiAgICAgICAgaWYgKCghaXNDb250YWlucyAmJiAhdGhpcy5faXNPcGVuZXIoZXZlbnQudGFyZ2V0KSkpIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFdmVudCBoYW5kbGVyIGZvciBlbnRlci1rZXkgZG93biBvZiBpbnB1dCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtFdmVudH0gW2V2ZW50XSAtIGV2ZW50IG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uS2V5ZG93bkVsZW1lbnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmICghZXZlbnQgfHwgZXZlbnQua2V5Q29kZSAhPT0gMTMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zZXREYXRlRnJvbVN0cmluZyh0aGlzLl8kZWxlbWVudC52YWwoKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV2ZW50IGhhbmRsZXIgZm9yIGNsaWNrIG9mIGNhbGVuZGFyPGJyPlxuICAgICAqIC0gVXBkYXRlIGRhdGUgZm9ybSBldmVudC10YXJnZXRcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCAtIGV2ZW50IG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uQ2xpY2tDYWxlbmRhcjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldCxcbiAgICAgICAgICAgIGNsYXNzTmFtZSA9IHRhcmdldC5jbGFzc05hbWUsXG4gICAgICAgICAgICB2YWx1ZSA9IE51bWJlcigodGFyZ2V0LmlubmVyVGV4dCB8fCB0YXJnZXQudGV4dENvbnRlbnQgfHwgdGFyZ2V0Lm5vZGVWYWx1ZSkpLFxuICAgICAgICAgICAgc2hvd25EYXRlLFxuICAgICAgICAgICAgcmVsYXRpdmVNb250aCxcbiAgICAgICAgICAgIGRhdGU7XG5cbiAgICAgICAgaWYgKHZhbHVlICYmICFpc05hTih2YWx1ZSkpIHtcbiAgICAgICAgICAgIGlmIChjbGFzc05hbWUuaW5kZXhPZigncHJldi1tb250aCcpID4gLTEpIHtcbiAgICAgICAgICAgICAgICByZWxhdGl2ZU1vbnRoID0gLTE7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNsYXNzTmFtZS5pbmRleE9mKCduZXh0LW1vbnRoJykgPiAtMSkge1xuICAgICAgICAgICAgICAgIHJlbGF0aXZlTW9udGggPSAxO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZWxhdGl2ZU1vbnRoID0gMDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2hvd25EYXRlID0gdGhpcy5fY2FsZW5kYXIuZ2V0RGF0ZSgpO1xuICAgICAgICAgICAgc2hvd25EYXRlLmRhdGUgPSB2YWx1ZTtcbiAgICAgICAgICAgIGRhdGUgPSB1dGlscy5nZXRSZWxhdGl2ZURhdGUoMCwgcmVsYXRpdmVNb250aCwgMCwgc2hvd25EYXRlKTtcbiAgICAgICAgICAgIHRoaXMuc2V0RGF0ZShkYXRlLnllYXIsIGRhdGUubW9udGgsIGRhdGUuZGF0ZSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXZlbnQgaGFuZGxlciBmb3IgY2xpY2sgb2Ygb3BlbmVyLWVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkNsaWNrT3BlbmVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5vcGVuKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV2ZW50IGhhbmRsZXIgZm9yICdiZWZvcmVEcmF3Jy1jdXN0b20gZXZlbnQgb2YgY2FsZW5kYXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBzZWUge3R1aS5jb21wb25lbnQuQ2FsZW5kYXIuZHJhd31cbiAgICAgKi9cbiAgICBfb25CZWZvcmVEcmF3Q2FsZW5kYXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl91bmJpbmRPbkNsaWNrQ2FsZW5kYXIoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXZlbnQgaGFuZGxlciBmb3IgJ2RyYXcnLWN1c3RvbSBldmVudCBvZiBjYWxlbmRhclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudERhdGEgLSBjdXN0b20gZXZlbnQgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHNlZSB7dHVpLmNvbXBvbmVudC5DYWxlbmRhci5kcmF3fVxuICAgICAqL1xuICAgIF9vbkRyYXdDYWxlbmRhcjogZnVuY3Rpb24oZXZlbnREYXRhKSB7XG4gICAgICAgIHZhciBkYXRlSGFzaCA9IHtcbiAgICAgICAgICAgIHllYXI6IGV2ZW50RGF0YS55ZWFyLFxuICAgICAgICAgICAgbW9udGg6IGV2ZW50RGF0YS5tb250aCxcbiAgICAgICAgICAgIGRhdGU6IGV2ZW50RGF0YS5kYXRlXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX3NldFNlbGVjdGFibGVDbGFzc05hbWUoZXZlbnREYXRhLiRkYXRlQ29udGFpbmVyLCBkYXRlSGFzaCk7XG4gICAgICAgIHRoaXMuX3NldFNlbGVjdGVkQ2xhc3NOYW1lKGV2ZW50RGF0YS4kZGF0ZUNvbnRhaW5lciwgZGF0ZUhhc2gpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFdmVudCBoYW5kbGVyIGZvciAnYWZ0ZXJEcmF3Jy1jdXN0b20gZXZlbnQgb2YgY2FsZW5kYXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBzZWUge3R1aS5jb21wb25lbnQuQ2FsZW5kYXIuZHJhd31cbiAgICAgKi9cbiAgICBfb25BZnRlckRyYXdDYWxlbmRhcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX3Nob3dPbmx5VmFsaWRCdXR0b25zKCk7XG4gICAgICAgIHRoaXMuX2JpbmRPbkNsaWNrQ2FsZW5kYXIoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2hvdyBvbmx5IHZhbGlkIGJ1dHRvbnMgaW4gY2FsZW5kYXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zaG93T25seVZhbGlkQnV0dG9uczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkaGVhZGVyID0gdGhpcy5fY2FsZW5kYXIuJGhlYWRlcixcbiAgICAgICAgICAgICRwcmV2WWVhckJ0biA9ICRoZWFkZXIuZmluZCgnW2NsYXNzKj1cImJ0bi1wcmV2LXllYXJcIl0nKS5oaWRlKCksXG4gICAgICAgICAgICAkcHJldk1vbnRoQnRuID0gJGhlYWRlci5maW5kKCdbY2xhc3MqPVwiYnRuLXByZXYtbW9udGhcIl0nKS5oaWRlKCksXG4gICAgICAgICAgICAkbmV4dFllYXJCdG4gPSAkaGVhZGVyLmZpbmQoJ1tjbGFzcyo9XCJidG4tbmV4dC15ZWFyXCJdJykuaGlkZSgpLFxuICAgICAgICAgICAgJG5leHRNb250aEJ0biA9ICRoZWFkZXIuZmluZCgnW2NsYXNzKj1cImJ0bi1uZXh0LW1vbnRoXCJdJykuaGlkZSgpLFxuICAgICAgICAgICAgc2hvd25EYXRlSGFzaCA9IHRoaXMuX2NhbGVuZGFyLmdldERhdGUoKSxcbiAgICAgICAgICAgIHNob3duRGF0ZSA9IG5ldyBEYXRlKHNob3duRGF0ZUhhc2gueWVhciwgc2hvd25EYXRlSGFzaC5tb250aCAtIDEpLFxuICAgICAgICAgICAgc3RhcnREYXRlID0gbmV3IERhdGUodGhpcy5fc3RhcnRUaW1lc1swXSB8fCBDT05TVEFOVFMuTUlOX0VER0UpLnNldERhdGUoMSksXG4gICAgICAgICAgICBlbmREYXRlID0gbmV3IERhdGUodGhpcy5fZW5kVGltZXMuc2xpY2UoLTEpWzBdIHx8IENPTlNUQU5UUy5NQVhfRURHRSkuc2V0RGF0ZSgxKSwvLyBhcnIuc2xpY2UoLTEpWzBdID09PSBhcnJbYXJyLmxlbmd0aCAtIDFdXG4gICAgICAgICAgICBzdGFydERpZmZlcmVuY2UgPSBzaG93bkRhdGUgLSBzdGFydERhdGUsXG4gICAgICAgICAgICBlbmREaWZmZXJlbmNlID0gZW5kRGF0ZSAtIHNob3duRGF0ZTtcblxuICAgICAgICBpZiAoc3RhcnREaWZmZXJlbmNlID4gMCkge1xuICAgICAgICAgICAgJHByZXZNb250aEJ0bi5zaG93KCk7XG4gICAgICAgICAgICBpZiAoc3RhcnREaWZmZXJlbmNlID49IENPTlNUQU5UUy5ZRUFSX1RPX01TKSB7XG4gICAgICAgICAgICAgICAgJHByZXZZZWFyQnRuLnNob3coKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbmREaWZmZXJlbmNlID4gMCkge1xuICAgICAgICAgICAgJG5leHRNb250aEJ0bi5zaG93KCk7XG4gICAgICAgICAgICBpZiAoZW5kRGlmZmVyZW5jZSA+PSBDT05TVEFOVFMuWUVBUl9UT19NUykge1xuICAgICAgICAgICAgICAgICRuZXh0WWVhckJ0bi5zaG93KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBvcGVuZXItZWxlbWVudHMgZXZlbnRcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBvcE9wZW5lcnMgW29wdGlvbi5vcGVuZXJzXSAtIGxpc3Qgb2Ygb3BlbmVyIGVsZW1lbnRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYmluZE9wZW5lckV2ZW50OiBmdW5jdGlvbihvcE9wZW5lcnMpIHtcbiAgICAgICAgdGhpcy5fc2V0T3BlbmVycyhvcE9wZW5lcnMpO1xuICAgICAgICB0aGlzLl8kZWxlbWVudC5vbigna2V5ZG93bicsIHRoaXMuX3Byb3h5SGFuZGxlcnMub25LZXlkb3duRWxlbWVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgYSAobW91c2Vkb3dufHRvdWNoc3RhcnQpIGV2ZW50IG9mIGRvY3VtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYmluZE9uTW91c2Vkb3duRG9jdW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZXZlbnRUeXBlID0gKHRoaXMudXNlVG91Y2hFdmVudCkgPyAndG91Y2hzdGFydCcgOiAnbW91c2Vkb3duJztcbiAgICAgICAgJChkb2N1bWVudCkub24oZXZlbnRUeXBlLCB0aGlzLl9wcm94eUhhbmRsZXJzLm9uTW91c2Vkb3duRG9jdW1lbnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVbmJpbmQgbW91c2Vkb3duLHRvdWNoc3RhcnQgZXZlbnRzIG9mIGRvY3VtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfdW5iaW5kT25Nb3VzZWRvd25Eb2N1bWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgICQoZG9jdW1lbnQpLm9mZignbW91c2Vkb3duIHRvdWNoc3RhcnQnLCB0aGlzLl9wcm94eUhhbmRsZXJzLm9uTW91c2Vkb3duRG9jdW1lbnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCaW5kIGNsaWNrIGV2ZW50IG9mIGNhbGVuZGFyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYmluZE9uQ2xpY2tDYWxlbmRhcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBoYW5kbGVyID0gdGhpcy5fcHJveHlIYW5kbGVycy5vbkNsaWNrQ2FsZW5kYXIsXG4gICAgICAgICAgICBldmVudFR5cGUgPSAodGhpcy51c2VUb3VjaEV2ZW50KSA/ICd0b3VjaGVuZCcgOiAnY2xpY2snO1xuICAgICAgICB0aGlzLl8kd3JhcHBlckVsZW1lbnQuZmluZCgnLicgKyB0aGlzLl9zZWxlY3RhYmxlQ2xhc3NOYW1lKS5vbihldmVudFR5cGUsIGhhbmRsZXIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVbmJpbmQgY2xpY2sgZXZlbnQgb2YgY2FsZW5kYXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF91bmJpbmRPbkNsaWNrQ2FsZW5kYXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaGFuZGxlciA9IHRoaXMuX3Byb3h5SGFuZGxlcnMub25DbGlja0NhbGVuZGFyO1xuICAgICAgICB0aGlzLl8kd3JhcHBlckVsZW1lbnQuZmluZCgnLicgKyB0aGlzLl9zZWxlY3RhYmxlQ2xhc3NOYW1lKS5vZmYoJ2NsaWNrIHRvdWNoZW5kJywgaGFuZGxlcik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgY3VzdG9tIGV2ZW50IG9mIGNhbGVuZGFyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYmluZENhbGVuZGFyQ3VzdG9tRXZlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcHJveHlIYW5kbGVycyA9IHRoaXMuX3Byb3h5SGFuZGxlcnMsXG4gICAgICAgICAgICBvbkJlZm9yZURyYXcgPSBwcm94eUhhbmRsZXJzLm9uQmVmb3JlRHJhd0NhbGVuZGFyLFxuICAgICAgICAgICAgb25EcmF3ID0gcHJveHlIYW5kbGVycy5vbkRyYXdDYWxlbmRhcixcbiAgICAgICAgICAgIG9uQWZ0ZXJEcmF3ID0gcHJveHlIYW5kbGVycy5vbkFmdGVyRHJhd0NhbGVuZGFyO1xuXG4gICAgICAgIHRoaXMuX2NhbGVuZGFyLm9uKHtcbiAgICAgICAgICAgICdiZWZvcmVEcmF3Jzogb25CZWZvcmVEcmF3LFxuICAgICAgICAgICAgJ2RyYXcnOiBvbkRyYXcsXG4gICAgICAgICAgICAnYWZ0ZXJEcmF3Jzogb25BZnRlckRyYXdcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgLyoqXG4gICAgKiBVbmJpbmQgY3VzdG9tIGV2ZW50IG9mIGNhbGVuZGFyXG4gICAgKiBAcHJpdmF0ZVxuICAgICovXG4gICAgX3VuYmluZENhbGVuZGFyQ3VzdG9tRXZlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgIHZhciBwcm94eUhhbmRsZXJzID0gdGhpcy5fcHJveHlIYW5kbGVycyxcbiAgICAgICAgICAgb25CZWZvcmVEcmF3ID0gcHJveHlIYW5kbGVycy5vbkJlZm9yZURyYXdDYWxlbmRhcixcbiAgICAgICAgICAgb25EcmF3ID0gcHJveHlIYW5kbGVycy5vbkRyYXdDYWxlbmRhcixcbiAgICAgICAgICAgb25BZnRlckRyYXcgPSBwcm94eUhhbmRsZXJzLm9uQWZ0ZXJEcmF3Q2FsZW5kYXI7XG5cbiAgICAgICB0aGlzLl9jYWxlbmRhci5vZmYoe1xuICAgICAgICAgICAnYmVmb3JlRHJhdyc6IG9uQmVmb3JlRHJhdyxcbiAgICAgICAgICAgJ2RyYXcnOiBvbkRyYXcsXG4gICAgICAgICAgICdhZnRlckRyYXcnOiBvbkFmdGVyRHJhd1xuICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgYSByYW5nZVxuICAgICAqIEBhcGlcbiAgICAgKiBAcGFyYW0ge2RhdGVIYXNofSBzdGFydEhhc2ggLSBTdGFydCBkYXRlSGFzaFxuICAgICAqIEBwYXJhbSB7ZGF0ZUhhc2h9IGVuZEhhc2ggLSBFbmQgZGF0ZUhhc2hcbiAgICAgKiBAc2luY2UgMS4yLjBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHZhciBzdGFydCA9IHt5ZWFyOiAyMDE1LCBtb250aDogMiwgZGF0ZTogM30sXG4gICAgICogICAgIGVuZCA9IHt5ZWFyOiAyMDE1LCBtb250aDogMywgZGF0ZTogNn07XG4gICAgICpcbiAgICAgKiBkYXRlcGlja2VyLmFkZFJhbmdlKHN0YXJ0LCBlbmQpO1xuICAgICAqL1xuICAgIGFkZFJhbmdlOiBmdW5jdGlvbihzdGFydEhhc2gsIGVuZEhhc2gpIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzVmFsaWREYXRlKHN0YXJ0SGFzaCkgJiYgdGhpcy5faXNWYWxpZERhdGUoZW5kSGFzaCkpIHtcbiAgICAgICAgICAgIHRoaXMuX3Jhbmdlcy5wdXNoKFtzdGFydEhhc2gsIGVuZEhhc2hdKTtcbiAgICAgICAgICAgIHRoaXMuX3NldFNlbGVjdGFibGVSYW5nZXMoKTtcbiAgICAgICAgICAgIHRoaXMuX2NhbGVuZGFyLmRyYXcoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgYSByYW5nZVxuICAgICAqIEBwYXJhbSB7ZGF0ZUhhc2h9IHN0YXJ0SGFzaCAtIFN0YXJ0IGRhdGVIYXNoXG4gICAgICogQHBhcmFtIHtkYXRlSGFzaH0gZW5kSGFzaCAtIEVuZCBkYXRlSGFzaFxuICAgICAqIEBzaW5jZSAxLjIuMFxuICAgICAqIEBleGFtcGxlXG4gICAgICogdmFyIHN0YXJ0ID0ge3llYXI6IDIwMTUsIG1vbnRoOiAyLCBkYXRlOiAzfSxcbiAgICAgKiAgICAgZW5kID0ge3llYXI6IDIwMTUsIG1vbnRoOiAzLCBkYXRlOiA2fTtcbiAgICAgKlxuICAgICAqIGRhdGVwaWNrZXIuYWRkUmFuZ2Uoc3RhcnQsIGVuZCk7XG4gICAgICogZGF0ZXBpY2tlci5yZW1vdmVSYW5nZShzdGFydCwgZW5kKTtcbiAgICAgKi9cbiAgICByZW1vdmVSYW5nZTogZnVuY3Rpb24oc3RhcnRIYXNoLCBlbmRIYXNoKSB7XG4gICAgICAgIHZhciByYW5nZXMgPSB0aGlzLl9yYW5nZXMsXG4gICAgICAgICAgICB0YXJnZXQgPSBbc3RhcnRIYXNoLCBlbmRIYXNoXTtcblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKHJhbmdlcywgZnVuY3Rpb24ocmFuZ2UsIGluZGV4KSB7XG4gICAgICAgICAgICBpZiAodHVpLnV0aWwuY29tcGFyZUpTT04odGFyZ2V0LCByYW5nZSkpIHtcbiAgICAgICAgICAgICAgICByYW5nZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9zZXRTZWxlY3RhYmxlUmFuZ2VzKCk7XG4gICAgICAgIHRoaXMuX2NhbGVuZGFyLmRyYXcoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHBvc2l0aW9uLWxlZnQsIHRvcCBvZiBjYWxlbmRhclxuICAgICAqIEBhcGlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geCAtIHBvc2l0aW9uLWxlZnRcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geSAtIHBvc2l0aW9uLXRvcFxuICAgICAqIEBzaW5jZSAxLjEuMVxuICAgICAqL1xuICAgIHNldFhZOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIHZhciBwb3MgPSB0aGlzLl9wb3MsXG4gICAgICAgICAgICBpc051bWJlciA9IHR1aS51dGlsLmlzTnVtYmVyO1xuXG4gICAgICAgIHBvcy5sZWZ0ID0gaXNOdW1iZXIoeCkgPyB4IDogcG9zLmxlZnQ7XG4gICAgICAgIHBvcy50b3AgPSBpc051bWJlcih5KSA/IHkgOiBwb3MudG9wO1xuICAgICAgICB0aGlzLl9hcnJhbmdlTGF5ZXIoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHotaW5kZXggb2YgY2FsZW5kYXJcbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHpJbmRleCAtIHotaW5kZXggdmFsdWVcbiAgICAgKiBAc2luY2UgMS4xLjFcbiAgICAgKi9cbiAgICBzZXRaSW5kZXg6IGZ1bmN0aW9uKHpJbmRleCkge1xuICAgICAgICBpZiAoIXR1aS51dGlsLmlzTnVtYmVyKHpJbmRleCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3Bvcy56SW5kZXggPSB6SW5kZXg7XG4gICAgICAgIHRoaXMuX2FycmFuZ2VMYXllcigpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBhZGQgb3BlbmVyXG4gICAgICogQGFwaVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR8alF1ZXJ5fHN0cmluZ30gb3BlbmVyIC0gZWxlbWVudCBvciBzZWxlY3RvclxuICAgICAqL1xuICAgIGFkZE9wZW5lcjogZnVuY3Rpb24ob3BlbmVyKSB7XG4gICAgICAgIHZhciBldmVudFR5cGUgPSAodGhpcy51c2VUb3VjaEV2ZW50KSA/ICd0b3VjaGVuZCcgOiAnY2xpY2snLFxuICAgICAgICAgICAgJG9wZW5lciA9ICQob3BlbmVyKTtcblxuICAgICAgICBvcGVuZXIgPSAkb3BlbmVyWzBdO1xuICAgICAgICBpZiAob3BlbmVyICYmIGluQXJyYXkob3BlbmVyLCB0aGlzLl9vcGVuZXJzKSA8IDApIHtcbiAgICAgICAgICAgIHRoaXMuX29wZW5lcnMucHVzaChvcGVuZXIpO1xuICAgICAgICAgICAgJG9wZW5lci5vbihldmVudFR5cGUsIHRoaXMuX3Byb3h5SGFuZGxlcnMub25DbGlja09wZW5lcik7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogcmVtb3ZlIG9wZW5lclxuICAgICAqIEBhcGlcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fGpRdWVyeXxzdHJpbmd9IG9wZW5lciAtIGVsZW1lbnQgb3Igc2VsZWN0b3JcbiAgICAgKi9cbiAgICByZW1vdmVPcGVuZXI6IGZ1bmN0aW9uKG9wZW5lcikge1xuICAgICAgICB2YXIgJG9wZW5lciA9ICQob3BlbmVyKSxcbiAgICAgICAgICAgIGluZGV4ID0gaW5BcnJheSgkb3BlbmVyWzBdLCB0aGlzLl9vcGVuZXJzKTtcblxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgJG9wZW5lci5vZmYoJ2NsaWNrIHRvdWNoZW5kJywgdGhpcy5fcHJveHlIYW5kbGVycy5vbkNsaWNrT3BlbmVyKTtcbiAgICAgICAgICAgIHRoaXMuX29wZW5lcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPcGVuIGNhbGVuZGFyIHdpdGggYXJyYW5naW5nIHBvc2l0aW9uXG4gICAgICogQGFwaVxuICAgICAqIEBleGFtcGxlXG4gICAgICogZGF0ZXBpY2tlci5vcGVuKCk7XG4gICAgICovXG4gICAgb3BlbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmlzT3BlbmVkKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2FycmFuZ2VMYXllcigpO1xuICAgICAgICB0aGlzLl9iaW5kQ2FsZW5kYXJDdXN0b21FdmVudCgpO1xuICAgICAgICB0aGlzLl9jYWxlbmRhci5kcmF3KHRoaXMuX2RhdGUueWVhciwgdGhpcy5fZGF0ZS5tb250aCwgZmFsc2UpO1xuICAgICAgICB0aGlzLl8kd3JhcHBlckVsZW1lbnQuc2hvdygpO1xuICAgICAgICBpZiAoIXRoaXMuc2hvd0Fsd2F5cykge1xuICAgICAgICAgICAgdGhpcy5fYmluZE9uTW91c2Vkb3duRG9jdW1lbnQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAYXBpXG4gICAgICAgICAqIEBldmVudCBEYXRlUGlja2VyI29wZW5cbiAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICogZGF0ZVBpY2tlci5vbignb3BlbicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgKiAgICAgYWxlcnQoJ29wZW4nKTtcbiAgICAgICAgICogfSk7XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmZpcmUoJ29wZW4nKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xvc2UgY2FsZW5kYXIgd2l0aCB1bmJpbmRpbmcgc29tZSBldmVudHNcbiAgICAgKiBAYXBpXG4gICAgICogQGV4bWFwbGVcbiAgICAgKiBkYXRlcGlja2VyLmNsb3NlKCk7XG4gICAgICovXG4gICAgY2xvc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNPcGVuZWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3VuYmluZENhbGVuZGFyQ3VzdG9tRXZlbnQoKTtcbiAgICAgICAgdGhpcy5fdW5iaW5kT25Nb3VzZWRvd25Eb2N1bWVudCgpO1xuICAgICAgICB0aGlzLl8kd3JhcHBlckVsZW1lbnQuaGlkZSgpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDbG9zZSBldmVudCAtIERhdGVQaWNrZXJcbiAgICAgICAgICogQGFwaVxuICAgICAgICAgKiBAZXZlbnQgRGF0ZVBpY2tlciNjbG9zZVxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKiBkYXRlUGlja2VyLm9uKCdjbG9zZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgKiAgICAgYWxlcnQoJ2Nsb3NlJyk7XG4gICAgICAgICAqIH0pO1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5maXJlKCdjbG9zZScpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZGF0ZS1vYmplY3Qgb2YgY3VycmVudCBEYXRlUGlja2VyIGluc3RhbmNlLlxuICAgICAqIEBhcGlcbiAgICAgKiBAcmV0dXJucyB7ZGF0ZUhhc2h9IC0gZGF0ZUhhc2ggaGF2aW5nIHllYXIsIG1vbnRoIGFuZCBkYXktaW4tbW9udGhcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIDIwMTUtMDQtMTNcbiAgICAgKiBkYXRlcGlja2VyLmdldERhdGVIYXNoKCk7IC8vIHt5ZWFyOiAyMDE1LCBtb250aDogNCwgZGF0ZTogMTN9XG4gICAgICovXG4gICAgZ2V0RGF0ZUhhc2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdHVpLnV0aWwuZXh0ZW5kKHt9LCB0aGlzLl9kYXRlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHllYXJcbiAgICAgKiBAYXBpXG4gICAgICogQHJldHVybnMge251bWJlcn0gLSB5ZWFyXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyAyMDE1LTA0LTEzXG4gICAgICogZGF0ZXBpY2tlci5nZXRZZWFyKCk7IC8vIDIwMTVcbiAgICAgKi9cbiAgICBnZXRZZWFyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGUueWVhcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIG1vbnRoXG4gICAgICogQGFwaVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IC0gbW9udGhcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIDIwMTUtMDQtMTNcbiAgICAgKiBkYXRlcGlja2VyLmdldE1vbnRoKCk7IC8vIDRcbiAgICAgKi9cbiAgICBnZXRNb250aDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kYXRlLm1vbnRoO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gZGF5LWluLW1vbnRoXG4gICAgICogQGFwaVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IC0gZGF5LWluLW1vbnRoXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAvLyAyMDE1LTA0LTEzXG4gICAgICogZGF0ZXBpY2tlci5nZXREYXlJbk1vbnRoKCk7IC8vIDEzXG4gICAgICovXG4gICAgZ2V0RGF5SW5Nb250aDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kYXRlLmRhdGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBkYXRlIGZyb20gdmFsdWVzKHllYXIsIG1vbnRoLCBkYXRlKSBhbmQgdGhlbiBmaXJlICd1cGRhdGUnIGN1c3RvbSBldmVudFxuICAgICAqIEBhcGlcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFt5ZWFyXSAtIHllYXJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFttb250aF0gLSBtb250aFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW2RhdGVdIC0gZGF5IGluIG1vbnRoXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBkYXRlcGlja2VyLnNldERhdGUoMjAxNCwgMTIsIDMpOyAvLyAyMDE0LTEyLSAwM1xuICAgICAqIGRhdGVwaWNrZXIuc2V0RGF0ZShudWxsLCAxMSwgMjMpOyAvLyAyMDE0LTExLTIzXG4gICAgICogZGF0ZXBpY2tlci5zZXREYXRlKCcyMDE1JywgJzUnLCAzKTsgLy8gMjAxNS0wNS0wM1xuICAgICAqL1xuICAgIHNldERhdGU6IGZ1bmN0aW9uKHllYXIsIG1vbnRoLCBkYXRlKSB7XG4gICAgICAgIHZhciBkYXRlT2JqID0gdGhpcy5fZGF0ZSxcbiAgICAgICAgICAgIG5ld0RhdGVPYmogPSB7fTtcblxuICAgICAgICBuZXdEYXRlT2JqLnllYXIgPSB5ZWFyIHx8IGRhdGVPYmoueWVhcjtcbiAgICAgICAgbmV3RGF0ZU9iai5tb250aCA9IG1vbnRoIHx8IGRhdGVPYmoubW9udGg7XG4gICAgICAgIG5ld0RhdGVPYmouZGF0ZSA9IGRhdGUgfHwgZGF0ZU9iai5kYXRlO1xuXG4gICAgICAgIGlmICh0aGlzLl9pc1NlbGVjdGFibGUobmV3RGF0ZU9iaikpIHtcbiAgICAgICAgICAgIHR1aS51dGlsLmV4dGVuZChkYXRlT2JqLCBuZXdEYXRlT2JqKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zZXRWYWx1ZVRvSW5wdXRFbGVtZW50KCk7XG4gICAgICAgIHRoaXMuX2NhbGVuZGFyLmRyYXcoZGF0ZU9iai55ZWFyLCBkYXRlT2JqLm1vbnRoLCBmYWxzZSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFVwZGF0ZSBldmVudFxuICAgICAgICAgKiBAYXBpXG4gICAgICAgICAqIEBldmVudCBEYXRlUGlja2VyI3VwZGF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5maXJlKCd1cGRhdGUnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IG9yIHVwZGF0ZSBkYXRlLWZvcm1cbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IFtmb3JtXSAtIGRhdGUtZm9ybWF0XG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBkYXRlcGlja2VyLnNldERhdGVGb3JtKCd5eXl5LW1tLWRkJyk7XG4gICAgICogZGF0ZXBpY2tlci5zZXREYXRlRm9ybSgnbW0tZGQsIHl5eXknKTtcbiAgICAgKiBkYXRlcGlja2VyLnNldERhdGVGb3JtKCd5L20vZCcpO1xuICAgICAqIGRhdGVwaWNrZXIuc2V0RGF0ZUZvcm0oJ3l5L21tL2RkJyk7XG4gICAgICovXG4gICAgc2V0RGF0ZUZvcm06IGZ1bmN0aW9uKGZvcm0pIHtcbiAgICAgICAgdGhpcy5fZGF0ZUZvcm0gPSBmb3JtIHx8IHRoaXMuX2RhdGVGb3JtO1xuICAgICAgICB0aGlzLl9zZXRSZWdFeHAoKTtcbiAgICAgICAgdGhpcy5zZXREYXRlKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiB3aGV0aGVyIHRoZSBjYWxlbmRhciBpcyBvcGVuZWQgb3Igbm90XG4gICAgICogQGFwaVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSAtIHRydWUgaWYgb3BlbmVkLCBmYWxzZSBvdGhlcndpc2VcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGRhdGVwaWNrZXIuY2xvc2UoKTtcbiAgICAgKiBkYXRlcGlja2VyLmlzT3BlbmVkKCk7IC8vIGZhbHNlXG4gICAgICpcbiAgICAgKiBkYXRlcGlja2VyLm9wZW4oKTtcbiAgICAgKiBkYXRlcGlja2VyLmlzT3BlbmVkKCk7IC8vIHRydWVcbiAgICAgKi9cbiAgICBpc09wZW5lZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5fJHdyYXBwZXJFbGVtZW50LmNzcygnZGlzcGxheScpID09PSAnYmxvY2snKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIFRpbWVQaWNrZXIgaW5zdGFuY2VcbiAgICAgKiBAYXBpXG4gICAgICogQHJldHVybnMge1RpbWVQaWNrZXJ9IC0gVGltZVBpY2tlciBpbnN0YW5jZVxuICAgICAqIEBleGFtcGxlXG4gICAgICogdmFyIHRpbWVwaWNrZXIgPSB0aGlzLmdldFRpbWVwaWNrZXIoKTtcbiAgICAgKi9cbiAgICBnZXRUaW1lUGlja2VyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RpbWVQaWNrZXI7XG4gICAgfVxufSk7XG5cbnR1aS51dGlsLkN1c3RvbUV2ZW50cy5taXhpbihEYXRlUGlja2VyKTtcblxubW9kdWxlLmV4cG9ydHMgPSBEYXRlUGlja2VyO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IG5obmVudCBvbiAxNS4gNC4gMjguLlxuICogQGZpbGVvdmVydmlldyBTcGluYm94IENvbXBvbmVudFxuICogQGF1dGhvciBOSE4gZW50IEZFIGRldiA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPiA8bWlua3l1LnlpQG5obmVudC5jb20+XG4gKiBAZGVwZW5kZW5jeSBqcXVlcnktMS44LjMsIGNvZGUtc25pcHBldC0xLjAuMlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWwgPSB0dWkudXRpbCxcbiAgICBpbkFycmF5ID0gdXRpbC5pbkFycmF5O1xuXG4vKipcbiAqIEBjb25zdHJ1Y3RvclxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfEhUTUxFbGVtZW50fSBjb250YWluZXIgLSBjb250YWluZXIgb2Ygc3BpbmJveFxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25dIC0gb3B0aW9uIGZvciBpbml0aWFsaXphdGlvblxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLmRlZmF1bHRWYWx1ZSA9IDBdIC0gaW5pdGlhbCBzZXR0aW5nIHZhbHVlXG4gKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbi5zdGVwID0gMV0gLSBpZiBzdGVwID0gMiwgdmFsdWUgOiAwIC0+IDIgLT4gNCAtPiAuLi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLm1heCA9IDkwMDcxOTkyNTQ3NDA5OTFdIC0gbWF4IHZhbHVlXG4gKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbi5taW4gPSAtOTAwNzE5OTI1NDc0MDk5MV0gLSBtaW4gdmFsdWVcbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9uLnVwQnRuVGFnID0gYnV0dG9uIEhUTUxdIC0gdXAgYnV0dG9uIGh0bWwgc3RyaW5nXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbi5kb3duQnRuVGFnID0gYnV0dG9uIEhUTUxdIC0gZG93biBidXR0b24gaHRtbCBzdHJpbmdcbiAqIEBwYXJhbSB7QXJyYXl9ICBbb3B0aW9uLmV4Y2x1c2lvbiA9IFtdXSAtIHZhbHVlIHRvIGJlIGV4Y2x1ZGVkLiBpZiB0aGlzIGlzIFsxLDNdLCAwIC0+IDIgLT4gNCAtPiA1IC0+Li4uLlxuICovXG52YXIgU3BpbmJveCA9IHV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBTcGluYm94LnByb3RvdHlwZSAqLyB7XG4gICAgaW5pdDogZnVuY3Rpb24oY29udGFpbmVyLCBvcHRpb24pIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtqUXVlcnl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl8kY29udGFpbmVyRWxlbWVudCA9ICQoY29udGFpbmVyKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge2pRdWVyeX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuXyRpbnB1dEVsZW1lbnQgPSB0aGlzLl8kY29udGFpbmVyRWxlbWVudC5maW5kKCdpbnB1dFt0eXBlPVwidGV4dFwiXScpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fdmFsdWUgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fb3B0aW9uID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge2pRdWVyeX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuXyR1cEJ1dHRvbiA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtqUXVlcnl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl8kZG93bkJ1dHRvbiA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5faW5pdGlhbGl6ZShvcHRpb24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIHdpdGggb3B0aW9uXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbiAtIE9wdGlvbiBmb3IgSW5pdGlhbGl6YXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbml0aWFsaXplOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgdGhpcy5fc2V0T3B0aW9uKG9wdGlvbik7XG4gICAgICAgIHRoaXMuX2Fzc2lnbkhUTUxFbGVtZW50cygpO1xuICAgICAgICB0aGlzLl9hc3NpZ25EZWZhdWx0RXZlbnRzKCk7XG4gICAgICAgIHRoaXMuc2V0VmFsdWUodGhpcy5fb3B0aW9uLmRlZmF1bHRWYWx1ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBhIG9wdGlvbiB0byBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb24gLSBPcHRpb24gdGhhdCB5b3Ugd2FudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldE9wdGlvbjogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIHRoaXMuX29wdGlvbiA9IHtcbiAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogMCxcbiAgICAgICAgICAgIHN0ZXA6IDEsXG4gICAgICAgICAgICBtYXg6IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSIHx8IDkwMDcxOTkyNTQ3NDA5OTEsXG4gICAgICAgICAgICBtaW46IE51bWJlci5NSU5fU0FGRV9JTlRFR0VSIHx8IC05MDA3MTk5MjU0NzQwOTkxLFxuICAgICAgICAgICAgdXBCdG5UYWc6ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIj48Yj4rPC9iPjwvYnV0dG9uPicsXG4gICAgICAgICAgICBkb3duQnRuVGFnOiAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCI+PGI+LTwvYj48L2J1dHRvbj4nXG4gICAgICAgIH07XG4gICAgICAgIHV0aWwuZXh0ZW5kKHRoaXMuX29wdGlvbiwgb3B0aW9uKTtcblxuICAgICAgICBpZiAoIXV0aWwuaXNBcnJheSh0aGlzLl9vcHRpb24uZXhjbHVzaW9uKSkge1xuICAgICAgICAgICAgdGhpcy5fb3B0aW9uLmV4Y2x1c2lvbiA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLl9pc1ZhbGlkT3B0aW9uKCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU3BpbmJveCBvcHRpb24gaXMgaW52YWlsZCcpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGlzIGEgdmFsaWQgb3B0aW9uP1xuICAgICAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc1ZhbGlkT3B0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wdCA9IHRoaXMuX29wdGlvbjtcblxuICAgICAgICByZXR1cm4gKHRoaXMuX2lzVmFsaWRWYWx1ZShvcHQuZGVmYXVsdFZhbHVlKSAmJiB0aGlzLl9pc1ZhbGlkU3RlcChvcHQuc3RlcCkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBpcyBhIHZhbGlkIHZhbHVlP1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSBmb3Igc3BpbmJveFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc1ZhbGlkVmFsdWU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHZhciBvcHQsXG4gICAgICAgICAgICBpc0JldHdlZW4sXG4gICAgICAgICAgICBpc05vdEluQXJyYXk7XG5cbiAgICAgICAgaWYgKCF1dGlsLmlzTnVtYmVyKHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgb3B0ID0gdGhpcy5fb3B0aW9uO1xuICAgICAgICBpc0JldHdlZW4gPSB2YWx1ZSA8PSBvcHQubWF4ICYmIHZhbHVlID49IG9wdC5taW47XG4gICAgICAgIGlzTm90SW5BcnJheSA9IChpbkFycmF5KHZhbHVlLCBvcHQuZXhjbHVzaW9uKSA9PT0gLTEpO1xuXG4gICAgICAgIHJldHVybiAoaXNCZXR3ZWVuICYmIGlzTm90SW5BcnJheSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGlzIGEgdmFsaWQgc3RlcD9cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RlcCBmb3Igc3BpbmJveCB1cC9kb3duXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzVmFsaWRTdGVwOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgIHZhciBtYXhTdGVwID0gKHRoaXMuX29wdGlvbi5tYXggLSB0aGlzLl9vcHRpb24ubWluKTtcblxuICAgICAgICByZXR1cm4gKHV0aWwuaXNOdW1iZXIoc3RlcCkgJiYgc3RlcCA8IG1heFN0ZXApO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBc3NpZ24gZWxlbWVudHMgdG8gaW5zaWRlIG9mIGNvbnRhaW5lci5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hc3NpZ25IVE1MRWxlbWVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9zZXRJbnB1dFNpemVBbmRNYXhMZW5ndGgoKTtcbiAgICAgICAgdGhpcy5fbWFrZUJ1dHRvbigpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNYWtlIHVwL2Rvd24gYnV0dG9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUJ1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkaW5wdXQgPSB0aGlzLl8kaW5wdXRFbGVtZW50LFxuICAgICAgICAgICAgJHVwQnRuID0gdGhpcy5fJHVwQnV0dG9uID0gJCh0aGlzLl9vcHRpb24udXBCdG5UYWcpLFxuICAgICAgICAgICAgJGRvd25CdG4gPSB0aGlzLl8kZG93bkJ1dHRvbiA9ICQodGhpcy5fb3B0aW9uLmRvd25CdG5UYWcpO1xuXG4gICAgICAgICR1cEJ0bi5pbnNlcnRCZWZvcmUoJGlucHV0KTtcbiAgICAgICAgJHVwQnRuLndyYXAoJzxkaXY+PC9kaXY+Jyk7XG4gICAgICAgICRkb3duQnRuLmluc2VydEFmdGVyKCRpbnB1dCk7XG4gICAgICAgICRkb3duQnRuLndyYXAoJzxkaXY+PC9kaXY+Jyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBzaXplL21heGxlbmd0aCBhdHRyaWJ1dGVzIG9mIGlucHV0IGVsZW1lbnQuXG4gICAgICogRGVmYXVsdCB2YWx1ZSBpcyBhIGRpZ2l0cyBvZiBhIGxvbmdlciB2YWx1ZSBvZiBvcHRpb24ubWluIG9yIG9wdGlvbi5tYXhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRJbnB1dFNpemVBbmRNYXhMZW5ndGg6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJGlucHV0ID0gdGhpcy5fJGlucHV0RWxlbWVudCxcbiAgICAgICAgICAgIG1pblZhbHVlTGVuZ3RoID0gU3RyaW5nKHRoaXMuX29wdGlvbi5taW4pLmxlbmd0aCxcbiAgICAgICAgICAgIG1heFZhbHVlTGVuZ3RoID0gU3RyaW5nKHRoaXMuX29wdGlvbi5tYXgpLmxlbmd0aCxcbiAgICAgICAgICAgIG1heGxlbmd0aCA9IE1hdGgubWF4KG1pblZhbHVlTGVuZ3RoLCBtYXhWYWx1ZUxlbmd0aCk7XG5cbiAgICAgICAgaWYgKCEkaW5wdXQuYXR0cignc2l6ZScpKSB7XG4gICAgICAgICAgICAkaW5wdXQuYXR0cignc2l6ZScsIG1heGxlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEkaW5wdXQuYXR0cignbWF4bGVuZ3RoJykpIHtcbiAgICAgICAgICAgICRpbnB1dC5hdHRyKCdtYXhsZW5ndGgnLCBtYXhsZW5ndGgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFzc2lnbiBkZWZhdWx0IGV2ZW50cyB0byB1cC9kb3duIGJ1dHRvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Fzc2lnbkRlZmF1bHRFdmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb25DbGljayA9IHV0aWwuYmluZCh0aGlzLl9vbkNsaWNrQnV0dG9uLCB0aGlzKSxcbiAgICAgICAgICAgIG9uS2V5RG93biA9IHV0aWwuYmluZCh0aGlzLl9vbktleURvd25JbnB1dEVsZW1lbnQsIHRoaXMpO1xuXG4gICAgICAgIHRoaXMuXyR1cEJ1dHRvbi5vbignY2xpY2snLCB7aXNEb3duOiBmYWxzZX0sIG9uQ2xpY2spO1xuICAgICAgICB0aGlzLl8kZG93bkJ1dHRvbi5vbignY2xpY2snLCB7aXNEb3duOiB0cnVlfSwgb25DbGljayk7XG4gICAgICAgIHRoaXMuXyRpbnB1dEVsZW1lbnQub24oJ2tleWRvd24nLCBvbktleURvd24pO1xuICAgICAgICB0aGlzLl8kaW5wdXRFbGVtZW50Lm9uKCdjaGFuZ2UnLCB1dGlsLmJpbmQodGhpcy5fb25DaGFuZ2VJbnB1dCwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgaW5wdXQgdmFsdWUgd2hlbiB1c2VyIGNsaWNrIGEgYnV0dG9uLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNEb3duIC0gSWYgYSB1c2VyIGNsaWNrZWQgYSBkb3duLWJ1dHR0b24sIHRoaXMgdmFsdWUgaXMgdHJ1ZS4gIEVsc2UgaWYgYSB1c2VyIGNsaWNrZWQgYSB1cC1idXR0b24sIHRoaXMgdmFsdWUgaXMgZmFsc2UuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0TmV4dFZhbHVlOiBmdW5jdGlvbihpc0Rvd24pIHtcbiAgICAgICAgdmFyIG9wdCA9IHRoaXMuX29wdGlvbixcbiAgICAgICAgICAgIHN0ZXAgPSBvcHQuc3RlcCxcbiAgICAgICAgICAgIG1pbiA9IG9wdC5taW4sXG4gICAgICAgICAgICBtYXggPSBvcHQubWF4LFxuICAgICAgICAgICAgZXhjbHVzaW9uID0gb3B0LmV4Y2x1c2lvbixcbiAgICAgICAgICAgIG5leHRWYWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblxuICAgICAgICBpZiAoaXNEb3duKSB7XG4gICAgICAgICAgICBzdGVwID0gLXN0ZXA7XG4gICAgICAgIH1cblxuICAgICAgICBkbyB7XG4gICAgICAgICAgICBuZXh0VmFsdWUgKz0gc3RlcDtcbiAgICAgICAgICAgIGlmIChuZXh0VmFsdWUgPiBtYXgpIHtcbiAgICAgICAgICAgICAgICBuZXh0VmFsdWUgPSBtaW47XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5leHRWYWx1ZSA8IG1pbikge1xuICAgICAgICAgICAgICAgIG5leHRWYWx1ZSA9IG1heDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSB3aGlsZSAoaW5BcnJheShuZXh0VmFsdWUsIGV4Y2x1c2lvbikgPiAtMSk7XG5cbiAgICAgICAgdGhpcy5zZXRWYWx1ZShuZXh0VmFsdWUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBET00oVXAvRG93biBidXR0b24pIENsaWNrIEV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCBldmVudC1vYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkNsaWNrQnV0dG9uOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB0aGlzLl9zZXROZXh0VmFsdWUoZXZlbnQuZGF0YS5pc0Rvd24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBET00oSW5wdXQgZWxlbWVudCkgS2V5ZG93biBFdmVudCBoYW5kbGVyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgZXZlbnQtb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25LZXlEb3duSW5wdXRFbGVtZW50OiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIga2V5Q29kZSA9IGV2ZW50LndoaWNoIHx8IGV2ZW50LmtleUNvZGUsXG4gICAgICAgICAgICBpc0Rvd247XG4gICAgICAgIHN3aXRjaCAoa2V5Q29kZSkge1xuICAgICAgICAgICAgY2FzZSAzODogaXNEb3duID0gZmFsc2U7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA0MDogaXNEb3duID0gdHJ1ZTsgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OiByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9zZXROZXh0VmFsdWUoaXNEb3duKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRE9NKElucHV0IGVsZW1lbnQpIENoYW5nZSBFdmVudCBoYW5kbGVyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25DaGFuZ2VJbnB1dDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBuZXdWYWx1ZSA9IE51bWJlcih0aGlzLl8kaW5wdXRFbGVtZW50LnZhbCgpKSxcbiAgICAgICAgICAgIGlzQ2hhbmdlID0gdGhpcy5faXNWYWxpZFZhbHVlKG5ld1ZhbHVlKSAmJiB0aGlzLl92YWx1ZSAhPT0gbmV3VmFsdWUsXG4gICAgICAgICAgICBuZXh0VmFsdWUgPSAoaXNDaGFuZ2UpID8gbmV3VmFsdWUgOiB0aGlzLl92YWx1ZTtcblxuICAgICAgICB0aGlzLl92YWx1ZSA9IG5leHRWYWx1ZTtcbiAgICAgICAgdGhpcy5fJGlucHV0RWxlbWVudC52YWwobmV4dFZhbHVlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IHN0ZXAgb2Ygc3BpbmJveFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIGZvciBzcGluYm94XG4gICAgICovXG4gICAgc2V0U3RlcDogZnVuY3Rpb24oc3RlcCkge1xuICAgICAgICBpZiAoIXRoaXMuX2lzVmFsaWRTdGVwKHN0ZXApKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fb3B0aW9uLnN0ZXAgPSBzdGVwO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBnZXQgc3RlcCBvZiBzcGluYm94XG4gICAgICogQHJldHVybnMge251bWJlcn0gc3RlcFxuICAgICAqL1xuICAgIGdldFN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9uLnN0ZXA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBhIGlucHV0IHZhbHVlLlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IERhdGEgaW4gaW5wdXQtYm94XG4gICAgICovXG4gICAgZ2V0VmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBhIHZhbHVlIHRvIGlucHV0LWJveC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBWYWx1ZSB0aGF0IHlvdSB3YW50XG4gICAgICovXG4gICAgc2V0VmFsdWU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuXyRpbnB1dEVsZW1lbnQudmFsKHZhbHVlKS5jaGFuZ2UoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGEgb3B0aW9uIG9mIGluc3RhbmNlLlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IE9wdGlvbiBvZiBpbnN0YW5jZVxuICAgICAqL1xuICAgIGdldE9wdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vcHRpb247XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCB2YWx1ZSB0aGF0IHdpbGwgYmUgZXhjbHVkZWQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gVmFsdWUgdGhhdCB3aWxsIGJlIGV4Y2x1ZGVkLlxuICAgICAqL1xuICAgIGFkZEV4Y2x1c2lvbjogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgdmFyIGV4Y2x1c2lvbiA9IHRoaXMuX29wdGlvbi5leGNsdXNpb247XG5cbiAgICAgICAgaWYgKGluQXJyYXkodmFsdWUsIGV4Y2x1c2lvbikgPiAtMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGV4Y2x1c2lvbi5wdXNoKHZhbHVlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGEgdmFsdWUgd2hpY2ggd2FzIGV4Y2x1ZGVkLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIFZhbHVlIHRoYXQgd2lsbCBiZSByZW1vdmVkIGZyb20gYSBleGNsdXNpb24gbGlzdCBvZiBpbnN0YW5jZVxuICAgICAqL1xuICAgIHJlbW92ZUV4Y2x1c2lvbjogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgdmFyIGV4Y2x1c2lvbiA9IHRoaXMuX29wdGlvbi5leGNsdXNpb24sXG4gICAgICAgICAgICBpbmRleCA9IGluQXJyYXkodmFsdWUsIGV4Y2x1c2lvbik7XG5cbiAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGV4Y2x1c2lvbi5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBnZXQgY29udGFpbmVyIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH0gZWxlbWVudFxuICAgICAqL1xuICAgIGdldENvbnRhaW5lckVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fJGNvbnRhaW5lckVsZW1lbnRbMF07XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU3BpbmJveDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBUaW1lUGlja2VyIENvbXBvbmVudFxuICogQGF1dGhvciBOSE4gZW50IEZFIGRldiA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPiA8bWlua3l1LnlpQG5obmVudC5jb20+XG4gKiBAZGVwZW5kZW5jeSBqcXVlcnktMS44LjMsIGNvZGUtc25pcHBldC0xLjAuMiwgc3BpbmJveC5qc1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWwgPSB0dWkudXRpbCxcbiAgICBTcGluYm94ID0gcmVxdWlyZSgnLi9zcGluYm94JyksXG4gICAgdGltZVJlZ0V4cCA9IC9cXHMqKFxcZHsxLDJ9KVxccyo6XFxzKihcXGR7MSwyfSlcXHMqKFthcF1bbV0pPyg/OltcXHNcXFNdKikvaSxcbiAgICB0aW1lUGlja2VyVGFnID0gJzx0YWJsZSBjbGFzcz1cInRpbWVwaWNrZXJcIj48dHIgY2xhc3M9XCJ0aW1lcGlja2VyLXJvd1wiPjwvdHI+PC90YWJsZT4nLFxuICAgIGNvbHVtblRhZyA9ICc8dGQgY2xhc3M9XCJ0aW1lcGlja2VyLWNvbHVtblwiPjwvdGQ+JyxcbiAgICBzcGluQm94VGFnID0gJzx0ZCBjbGFzcz1cInRpbWVwaWNrZXItY29sdW1uIHRpbWVwaWNrZXItc3BpbmJveFwiPjxkaXY+PGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJ0aW1lcGlja2VyLXNwaW5ib3gtaW5wdXRcIj48L2Rpdj48L3RkPicsXG4gICAgdXBCdG5UYWcgPSAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJ0aW1lcGlja2VyLWJ0biB0aW1lcGlja2VyLWJ0bi11cFwiPjxiPis8L2I+PC9idXR0b24+JyxcbiAgICBkb3duQnRuVGFnID0gJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwidGltZXBpY2tlci1idG4gdGltZXBpY2tlci1idG4tZG93blwiPjxiPi08L2I+PC9idXR0b24+JztcblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uXSAtIG9wdGlvbiBmb3IgaW5pdGlhbGl6YXRpb25cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbi5kZWZhdWx0SG91ciA9IDBdIC0gaW5pdGlhbCBzZXR0aW5nIHZhbHVlIG9mIGhvdXJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLmRlZmF1bHRNaW51dGUgPSAwXSAtIGluaXRpYWwgc2V0dGluZyB2YWx1ZSBvZiBtaW51dGVcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IFtvcHRpb24uaW5wdXRFbGVtZW50ID0gbnVsbF0gLSBvcHRpb25hbCBpbnB1dCBlbGVtZW50IHdpdGggdGltZXBpY2tlclxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24uaG91clN0ZXAgPSAxXSAtIHN0ZXAgb2YgaG91ciBzcGluYm94LiBpZiBzdGVwID0gMiwgaG91ciB2YWx1ZSAxIC0+IDMgLT4gNSAtPiAuLi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLm1pbnV0ZVN0ZXAgPSAxXSAtIHN0ZXAgb2YgbWludXRlIHNwaW5ib3guIGlmIHN0ZXAgPSAyLCBtaW51dGUgdmFsdWUgMSAtPiAzIC0+IDUgLT4gLi4uXG4gKiBAcGFyYW0ge0FycmF5fSBbb3B0aW9uLmhvdXJFeGNsdXNpb24gPSBudWxsXSAtIGhvdXIgdmFsdWUgdG8gYmUgZXhjbHVkZWQuIGlmIGhvdXIgWzEsM10gaXMgZXhjbHVkZWQsIGhvdXIgdmFsdWUgMCAtPiAyIC0+IDQgLT4gNSAtPiAuLi5cbiAqIEBwYXJhbSB7QXJyYXl9IFtvcHRpb24ubWludXRlRXhjbHVzaW9uID0gbnVsbF0gLSBtaW51dGUgdmFsdWUgdG8gYmUgZXhjbHVkZWQuIGlmIG1pbnV0ZSBbMSwzXSBpcyBleGNsdWRlZCwgbWludXRlIHZhbHVlIDAgLT4gMiAtPiA0IC0+IDUgLT4gLi4uXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb24uc2hvd01lcmlkaWFuID0gZmFsc2VdIC0gaXMgdGltZSBleHByZXNzaW9uLVwiaGg6bW0gQU0vUE1cIj9cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uLnBvc2l0aW9uID0ge31dIC0gbGVmdCwgdG9wIHBvc2l0aW9uIG9mIHRpbWVwaWNrZXIgZWxlbWVudFxuICovXG52YXIgVGltZVBpY2tlciA9IHV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBUaW1lUGlja2VyLnByb3RvdHlwZSAqLyB7XG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7alF1ZXJ5fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy4kdGltZVBpY2tlckVsZW1lbnQgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7alF1ZXJ5fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fJGlucHV0RWxlbWVudCA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtqUXVlcnl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl8kbWVyaWRpYW5FbGVtZW50ID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge1NwaW5ib3h9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9ob3VyU3BpbmJveCA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtTcGluYm94fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fbWludXRlU3BpbmJveCA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHRpbWUgcGlja2VyIGVsZW1lbnQgc2hvdyB1cD9cbiAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9pc1Nob3duID0gZmFsc2U7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9vcHRpb24gPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5faG91ciA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9taW51dGUgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuX2luaXRpYWxpemUob3B0aW9uKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSB3aXRoIG9wdGlvblxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb24gZm9yIHRpbWUgcGlja2VyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIHRoaXMuX3NldE9wdGlvbihvcHRpb24pO1xuICAgICAgICB0aGlzLl9tYWtlU3BpbmJveGVzKCk7XG4gICAgICAgIHRoaXMuX21ha2VUaW1lUGlja2VyRWxlbWVudCgpO1xuICAgICAgICB0aGlzLl9hc3NpZ25EZWZhdWx0RXZlbnRzKCk7XG4gICAgICAgIHRoaXMuZnJvbVNwaW5ib3hlcygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgb3B0aW9uXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbiBmb3IgdGltZSBwaWNrZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRPcHRpb246IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICB0aGlzLl9vcHRpb24gPSB7XG4gICAgICAgICAgICBkZWZhdWx0SG91cjogMCxcbiAgICAgICAgICAgIGRlZmF1bHRNaW51dGU6IDAsXG4gICAgICAgICAgICBpbnB1dEVsZW1lbnQ6IG51bGwsXG4gICAgICAgICAgICBob3VyU3RlcDogMSxcbiAgICAgICAgICAgIG1pbnV0ZVN0ZXA6IDEsXG4gICAgICAgICAgICBob3VyRXhjbHVzaW9uOiBudWxsLFxuICAgICAgICAgICAgbWludXRlRXhjbHVzaW9uOiBudWxsLFxuICAgICAgICAgICAgc2hvd01lcmlkaWFuOiBmYWxzZSxcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7fVxuICAgICAgICB9O1xuXG4gICAgICAgIHV0aWwuZXh0ZW5kKHRoaXMuX29wdGlvbiwgb3B0aW9uKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogbWFrZSBzcGluYm94ZXMgKGhvdXIgJiBtaW51dGUpXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVNwaW5ib3hlczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcHQgPSB0aGlzLl9vcHRpb247XG5cbiAgICAgICAgdGhpcy5faG91clNwaW5ib3ggPSBuZXcgU3BpbmJveChzcGluQm94VGFnLCB7XG4gICAgICAgICAgICBkZWZhdWx0VmFsdWU6IG9wdC5kZWZhdWx0SG91cixcbiAgICAgICAgICAgIG1pbjogMCxcbiAgICAgICAgICAgIG1heDogMjMsXG4gICAgICAgICAgICBzdGVwOiBvcHQuaG91clN0ZXAsXG4gICAgICAgICAgICB1cEJ0blRhZzogdXBCdG5UYWcsXG4gICAgICAgICAgICBkb3duQnRuVGFnOiBkb3duQnRuVGFnLFxuICAgICAgICAgICAgZXhjbHVzaW9uOiBvcHQuaG91ckV4Y2x1c2lvblxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9taW51dGVTcGluYm94ID0gbmV3IFNwaW5ib3goc3BpbkJveFRhZywge1xuICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiBvcHQuZGVmYXVsdE1pbnV0ZSxcbiAgICAgICAgICAgIG1pbjogMCxcbiAgICAgICAgICAgIG1heDogNTksXG4gICAgICAgICAgICBzdGVwOiBvcHQubWludXRlU3RlcCxcbiAgICAgICAgICAgIHVwQnRuVGFnOiB1cEJ0blRhZyxcbiAgICAgICAgICAgIGRvd25CdG5UYWc6IGRvd25CdG5UYWcsXG4gICAgICAgICAgICBleGNsdXNpb246IG9wdC5taW51dGVFeGNsdXNpb25cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG1ha2UgdGltZXBpY2tlciBjb250YWluZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlVGltZVBpY2tlckVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3B0ID0gdGhpcy5fb3B0aW9uLFxuICAgICAgICAgICAgJHRwID0gJCh0aW1lUGlja2VyVGFnKSxcbiAgICAgICAgICAgICR0cFJvdyA9ICR0cC5maW5kKCcudGltZXBpY2tlci1yb3cnKSxcbiAgICAgICAgICAgICRtZXJpZGlhbixcbiAgICAgICAgICAgICRjb2xvbiA9ICQoY29sdW1uVGFnKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnY29sb24nKVxuICAgICAgICAgICAgICAgIC5hcHBlbmQoJzonKTtcblxuXG4gICAgICAgICR0cFJvdy5hcHBlbmQodGhpcy5faG91clNwaW5ib3guZ2V0Q29udGFpbmVyRWxlbWVudCgpLCAkY29sb24sIHRoaXMuX21pbnV0ZVNwaW5ib3guZ2V0Q29udGFpbmVyRWxlbWVudCgpKTtcblxuICAgICAgICBpZiAob3B0LnNob3dNZXJpZGlhbikge1xuICAgICAgICAgICAgJG1lcmlkaWFuID0gJChjb2x1bW5UYWcpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCdtZXJpZGlhbicpXG4gICAgICAgICAgICAgICAgLmFwcGVuZCh0aGlzLl9pc1BNID8gJ1BNJyA6ICdBTScpO1xuICAgICAgICAgICAgdGhpcy5fJG1lcmlkaWFuRWxlbWVudCA9ICRtZXJpZGlhbjtcbiAgICAgICAgICAgICR0cFJvdy5hcHBlbmQoJG1lcmlkaWFuKTtcbiAgICAgICAgfVxuXG4gICAgICAgICR0cC5oaWRlKCk7XG4gICAgICAgICQoJ2JvZHknKS5hcHBlbmQoJHRwKTtcbiAgICAgICAgdGhpcy4kdGltZVBpY2tlckVsZW1lbnQgPSAkdHA7XG5cbiAgICAgICAgaWYgKG9wdC5pbnB1dEVsZW1lbnQpIHtcbiAgICAgICAgICAgICR0cC5jc3MoJ3Bvc2l0aW9uJywgJ2Fic29sdXRlJyk7XG4gICAgICAgICAgICB0aGlzLl8kaW5wdXRFbGVtZW50ID0gJChvcHQuaW5wdXRFbGVtZW50KTtcbiAgICAgICAgICAgIHRoaXMuX3NldERlZmF1bHRQb3NpdGlvbih0aGlzLl8kaW5wdXRFbGVtZW50KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgcG9zaXRpb24gb2YgdGltZXBpY2tlciBjb250YWluZXJcbiAgICAgKiBAcGFyYW0ge2pRdWVyeX0gJGlucHV0IGpxdWVyeS1vYmplY3QgKGVsZW1lbnQpXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0RGVmYXVsdFBvc2l0aW9uOiBmdW5jdGlvbigkaW5wdXQpIHtcbiAgICAgICAgdmFyIGlucHV0RWwgPSAkaW5wdXRbMF0sXG4gICAgICAgICAgICBwb3NpdGlvbiA9IHRoaXMuX29wdGlvbi5wb3NpdGlvbixcbiAgICAgICAgICAgIHggPSBwb3NpdGlvbi54LFxuICAgICAgICAgICAgeSA9IHBvc2l0aW9uLnk7XG5cbiAgICAgICAgaWYgKCF1dGlsLmlzTnVtYmVyKHgpIHx8ICF1dGlsLmlzTnVtYmVyKHkpKSB7XG4gICAgICAgICAgICB4ID0gaW5wdXRFbC5vZmZzZXRMZWZ0O1xuICAgICAgICAgICAgeSA9IGlucHV0RWwub2Zmc2V0VG9wICsgaW5wdXRFbC5vZmZzZXRIZWlnaHQgKyAzO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0WFlQb3NpdGlvbih4LCB5KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogYXNzaWduIGRlZmF1bHQgZXZlbnRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXNzaWduRGVmYXVsdEV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkaW5wdXQgPSB0aGlzLl8kaW5wdXRFbGVtZW50O1xuXG4gICAgICAgIGlmICgkaW5wdXQpIHtcbiAgICAgICAgICAgIHRoaXMuX2Fzc2lnbkV2ZW50c1RvSW5wdXRFbGVtZW50KCk7XG4gICAgICAgICAgICB0aGlzLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkaW5wdXQudmFsKHRoaXMuZ2V0VGltZSgpKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuJHRpbWVQaWNrZXJFbGVtZW50Lm9uKCdjaGFuZ2UnLCB1dGlsLmJpbmQodGhpcy5fb25DaGFuZ2VUaW1lUGlja2VyLCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGF0dGFjaCBldmVudCB0byBJbnB1dCBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXNzaWduRXZlbnRzVG9JbnB1dEVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICAkaW5wdXQgPSB0aGlzLl8kaW5wdXRFbGVtZW50O1xuXG4gICAgICAgICRpbnB1dC5vbignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgc2VsZi5vcGVuKGV2ZW50KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJGlucHV0Lm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICghc2VsZi5zZXRUaW1lRnJvbUlucHV0RWxlbWVudCgpKSB7XG4gICAgICAgICAgICAgICAgJGlucHV0LnZhbChzZWxmLmdldFRpbWUoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBkb20gZXZlbnQgaGFuZGxlciAodGltZXBpY2tlcilcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkNoYW5nZVRpbWVQaWNrZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmZyb21TcGluYm94ZXMoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogaXMgY2xpY2tlZCBpbnNpZGUgb2YgY29udGFpbmVyP1xuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IGV2ZW50LW9iamVjdFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc0NsaWNrZWRJbnNpZGU6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHZhciBpc0NvbnRhaW5zID0gJC5jb250YWlucyh0aGlzLiR0aW1lUGlja2VyRWxlbWVudFswXSwgZXZlbnQudGFyZ2V0KSxcbiAgICAgICAgICAgIGlzSW5wdXRFbGVtZW50ID0gKHRoaXMuXyRpbnB1dEVsZW1lbnQgJiYgdGhpcy5fJGlucHV0RWxlbWVudFswXSA9PT0gZXZlbnQudGFyZ2V0KTtcblxuICAgICAgICByZXR1cm4gaXNDb250YWlucyB8fCBpc0lucHV0RWxlbWVudDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogdHJhbnNmb3JtIHRpbWUgaW50byBmb3JtYXR0ZWQgc3RyaW5nXG4gICAgICogQHJldHVybnMge3N0cmluZ30gdGltZSBzdHJpbmdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mb3JtVG9UaW1lRm9ybWF0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGhvdXIgPSB0aGlzLl9ob3VyLFxuICAgICAgICAgICAgbWludXRlID0gdGhpcy5fbWludXRlLFxuICAgICAgICAgICAgcG9zdGZpeCA9IHRoaXMuX2dldFBvc3RmaXgoKSxcbiAgICAgICAgICAgIGZvcm1hdHRlZEhvdXIsXG4gICAgICAgICAgICBmb3JtYXR0ZWRNaW51dGU7XG5cbiAgICAgICAgaWYgKHRoaXMuX29wdGlvbi5zaG93TWVyaWRpYW4pIHtcbiAgICAgICAgICAgIGhvdXIgJT0gMTI7XG4gICAgICAgIH1cblxuICAgICAgICBmb3JtYXR0ZWRIb3VyID0gKGhvdXIgPCAxMCkgPyAnMCcgKyBob3VyIDogaG91cjtcbiAgICAgICAgZm9ybWF0dGVkTWludXRlID0gKG1pbnV0ZSA8IDEwKSA/ICcwJyArIG1pbnV0ZSA6IG1pbnV0ZTtcbiAgICAgICAgcmV0dXJuIGZvcm1hdHRlZEhvdXIgKyAnOicgKyBmb3JtYXR0ZWRNaW51dGUgKyBwb3N0Zml4O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgdGhlIGJvb2xlYW4gdmFsdWUgJ2lzUE0nIHdoZW4gQU0vUE0gb3B0aW9uIGlzIHRydWUuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0SXNQTTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2lzUE0gPSAodGhpcy5faG91ciA+IDExKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogZ2V0IHBvc3RmaXggd2hlbiBBTS9QTSBvcHRpb24gaXMgdHJ1ZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBwb3N0Zml4IChBTS9QTSlcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRQb3N0Zml4OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBvc3RmaXggPSAnJztcblxuICAgICAgICBpZiAodGhpcy5fb3B0aW9uLnNob3dNZXJpZGlhbikge1xuICAgICAgICAgICAgcG9zdGZpeCA9ICh0aGlzLl9pc1BNKSA/ICcgUE0nIDogJyBBTSc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBvc3RmaXg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCBwb3NpdGlvbiBvZiBjb250YWluZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geCAtIGl0IHdpbGwgYmUgb2Zmc2V0TGVmdCBvZiBlbGVtZW50XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHkgLSBpdCB3aWxsIGJlIG9mZnNldFRvcCBvZiBlbGVtZW50XG4gICAgICovXG4gICAgc2V0WFlQb3NpdGlvbjogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICB2YXIgcG9zaXRpb247XG5cbiAgICAgICAgaWYgKCF1dGlsLmlzTnVtYmVyKHgpIHx8ICF1dGlsLmlzTnVtYmVyKHkpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBwb3NpdGlvbiA9IHRoaXMuX29wdGlvbi5wb3NpdGlvbjtcbiAgICAgICAgcG9zaXRpb24ueCA9IHg7XG4gICAgICAgIHBvc2l0aW9uLnkgPSB5O1xuICAgICAgICB0aGlzLiR0aW1lUGlja2VyRWxlbWVudC5jc3Moe2xlZnQ6IHgsIHRvcDogeX0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzaG93IHRpbWUgcGlja2VyIGVsZW1lbnRcbiAgICAgKi9cbiAgICBzaG93OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy4kdGltZVBpY2tlckVsZW1lbnQuc2hvdygpO1xuICAgICAgICB0aGlzLl9pc1Nob3duID0gdHJ1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogaGlkZSB0aW1lIHBpY2tlciBlbGVtZW50XG4gICAgICovXG4gICAgaGlkZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuJHRpbWVQaWNrZXJFbGVtZW50LmhpZGUoKTtcbiAgICAgICAgdGhpcy5faXNTaG93biA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBsaXN0ZW5lciB0byBzaG93IGNvbnRhaW5lclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IGV2ZW50LW9iamVjdFxuICAgICAqL1xuICAgIG9wZW46IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLl9pc1Nob3duKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCB1dGlsLmJpbmQodGhpcy5jbG9zZSwgdGhpcykpO1xuICAgICAgICB0aGlzLnNob3coKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogT3BlbiBldmVudCAtIFRpbWVQaWNrZXJcbiAgICAgICAgICogQGV2ZW50IFRpbWVQaWNrZXIjb3BlblxuICAgICAgICAgKiBAcGFyYW0geyhqUXVlcnkuRXZlbnR8dW5kZWZpbmVkKX0gLSBDbGljayB0aGUgaW5wdXQgZWxlbWVudFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5maXJlKCdvcGVuJywgZXZlbnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBsaXN0ZW5lciB0byBoaWRlIGNvbnRhaW5lclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IGV2ZW50LW9iamVjdFxuICAgICAqL1xuICAgIGNsb3NlOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBpZiAoIXRoaXMuX2lzU2hvd24gfHwgdGhpcy5faXNDbGlja2VkSW5zaWRlKGV2ZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgJChkb2N1bWVudCkub2ZmKGV2ZW50KTtcbiAgICAgICAgdGhpcy5oaWRlKCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEhpZGUgZXZlbnQgLSBUaW1lcGlja2VyXG4gICAgICAgICAqIEBldmVudCBUaW1lUGlja2VyI2Nsb3NlXG4gICAgICAgICAqIEBwYXJhbSB7KGpRdWVyeS5FdmVudHx1bmRlZmluZWQpfSAtIENsaWNrIHRoZSBkb2N1bWVudCAobm90IFRpbWVQaWNrZXIpXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmZpcmUoJ2Nsb3NlJywgZXZlbnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgdmFsdWVzIGluIHNwaW5ib3hlcyBmcm9tIHRpbWVcbiAgICAgKi9cbiAgICB0b1NwaW5ib3hlczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBob3VyID0gdGhpcy5faG91cixcbiAgICAgICAgICAgIG1pbnV0ZSA9IHRoaXMuX21pbnV0ZTtcblxuICAgICAgICB0aGlzLl9ob3VyU3BpbmJveC5zZXRWYWx1ZShob3VyKTtcbiAgICAgICAgdGhpcy5fbWludXRlU3BpbmJveC5zZXRWYWx1ZShtaW51dGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgdGltZSBmcm9tIHNwaW5ib3hlcyB2YWx1ZXNcbiAgICAgKi9cbiAgICBmcm9tU3BpbmJveGVzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGhvdXIgPSB0aGlzLl9ob3VyU3BpbmJveC5nZXRWYWx1ZSgpLFxuICAgICAgICAgICAgbWludXRlID0gdGhpcy5fbWludXRlU3BpbmJveC5nZXRWYWx1ZSgpO1xuXG4gICAgICAgIHRoaXMuc2V0VGltZShob3VyLCBtaW51dGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgdGltZSBmcm9tIGlucHV0IGVsZW1lbnQuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudHxqUXVlcnl9IFtpbnB1dEVsZW1lbnRdIGpxdWVyeSBvYmplY3QgKGVsZW1lbnQpXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gcmVzdWx0IG9mIHNldCB0aW1lXG4gICAgICovXG4gICAgc2V0VGltZUZyb21JbnB1dEVsZW1lbnQ6IGZ1bmN0aW9uKGlucHV0RWxlbWVudCkge1xuICAgICAgICB2YXIgaW5wdXQgPSAkKGlucHV0RWxlbWVudClbMF0gfHwgdGhpcy5fJGlucHV0RWxlbWVudFswXTtcbiAgICAgICAgcmV0dXJuICEhKGlucHV0ICYmIHRoaXMuc2V0VGltZUZyb21TdHJpbmcoaW5wdXQudmFsdWUpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IGhvdXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaG91ciBmb3IgdGltZSBwaWNrZXJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSByZXN1bHQgb2Ygc2V0IHRpbWVcbiAgICAgKi9cbiAgICBzZXRIb3VyOiBmdW5jdGlvbihob3VyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldFRpbWUoaG91ciwgdGhpcy5fbWludXRlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IG1pbnV0ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW51dGUgZm9yIHRpbWUgcGlja2VyXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gcmVzdWx0IG9mIHNldCB0aW1lXG4gICAgICovXG4gICAgc2V0TWludXRlOiBmdW5jdGlvbihtaW51dGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0VGltZSh0aGlzLl9ob3VyLCBtaW51dGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgdGltZVxuICAgICAqIEBhcGlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaG91ciBmb3IgdGltZSBwaWNrZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWludXRlIGZvciB0aW1lIHBpY2tlclxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHJlc3VsdCBvZiBzZXQgdGltZVxuICAgICAqL1xuICAgIHNldFRpbWU6IGZ1bmN0aW9uKGhvdXIsIG1pbnV0ZSkge1xuICAgICAgICB2YXIgaXNOdW1iZXIgPSAodXRpbC5pc051bWJlcihob3VyKSAmJiB1dGlsLmlzTnVtYmVyKG1pbnV0ZSkpLFxuICAgICAgICAgICAgaXNDaGFuZ2UgPSAodGhpcy5faG91ciAhPT0gaG91ciB8fCB0aGlzLl9taW51dGUgIT09IG1pbnV0ZSksXG4gICAgICAgICAgICBpc1ZhbGlkID0gKGhvdXIgPCAyNCAmJiBtaW51dGUgPCA2MCk7XG5cbiAgICAgICAgaWYgKCFpc051bWJlciB8fCAhaXNDaGFuZ2UgfHwgIWlzVmFsaWQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2hvdXIgPSBob3VyO1xuICAgICAgICB0aGlzLl9taW51dGUgPSBtaW51dGU7XG4gICAgICAgIHRoaXMuX3NldElzUE0oKTtcbiAgICAgICAgdGhpcy50b1NwaW5ib3hlcygpO1xuICAgICAgICBpZiAodGhpcy5fJG1lcmlkaWFuRWxlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5fJG1lcmlkaWFuRWxlbWVudC5odG1sKHRoaXMuX2dldFBvc3RmaXgoKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2hhbmdlIGV2ZW50IC0gVGltZVBpY2tlclxuICAgICAgICAgKiBAZXZlbnQgVGltZVBpY2tlciNjaGFuZ2VcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZmlyZSgnY2hhbmdlJyk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgdGltZSBmcm9tIHRpbWUtc3RyaW5nXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRpbWVTdHJpbmcgdGltZS1zdHJpbmdcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSByZXN1bHQgb2Ygc2V0IHRpbWVcbiAgICAgKi9cbiAgICBzZXRUaW1lRnJvbVN0cmluZzogZnVuY3Rpb24odGltZVN0cmluZykge1xuICAgICAgICB2YXIgaG91cixcbiAgICAgICAgICAgIG1pbnV0ZSxcbiAgICAgICAgICAgIHBvc3RmaXgsXG4gICAgICAgICAgICBpc1BNO1xuXG4gICAgICAgIGlmICh0aW1lUmVnRXhwLnRlc3QodGltZVN0cmluZykpIHtcbiAgICAgICAgICAgIGhvdXIgPSBOdW1iZXIoUmVnRXhwLiQxKTtcbiAgICAgICAgICAgIG1pbnV0ZSA9IE51bWJlcihSZWdFeHAuJDIpO1xuICAgICAgICAgICAgcG9zdGZpeCA9IFJlZ0V4cC4kMy50b1VwcGVyQ2FzZSgpO1xuXG4gICAgICAgICAgICBpZiAoaG91ciA8IDI0ICYmIHRoaXMuX29wdGlvbi5zaG93TWVyaWRpYW4pIHtcbiAgICAgICAgICAgICAgICBpZiAocG9zdGZpeCA9PT0gJ1BNJykge1xuICAgICAgICAgICAgICAgICAgICBpc1BNID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBvc3RmaXggPT09ICdBTScpIHtcbiAgICAgICAgICAgICAgICAgICAgaXNQTSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlzUE0gPSB0aGlzLl9pc1BNO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChpc1BNKSB7XG4gICAgICAgICAgICAgICAgICAgIGhvdXIgKz0gMTI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnNldFRpbWUoaG91ciwgbWludXRlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IHN0ZXAgb2YgaG91clxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIGZvciB0aW1lIHBpY2tlclxuICAgICAqL1xuICAgIHNldEhvdXJTdGVwOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgIHRoaXMuX2hvdXJTcGluYm94LnNldFN0ZXAoc3RlcCk7XG4gICAgICAgIHRoaXMuX29wdGlvbi5ob3VyU3RlcCA9IHRoaXMuX2hvdXJTcGluYm94LmdldFN0ZXAoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IHN0ZXAgb2YgbWludXRlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0ZXAgZm9yIHRpbWUgcGlja2VyXG4gICAgICovXG4gICAgc2V0TWludXRlU3RlcDogZnVuY3Rpb24oc3RlcCkge1xuICAgICAgICB0aGlzLl9taW51dGVTcGluYm94LnNldFN0ZXAoc3RlcCk7XG4gICAgICAgIHRoaXMuX29wdGlvbi5taW51dGVTdGVwID0gdGhpcy5fbWludXRlU3BpbmJveC5nZXRTdGVwKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGFkZCBhIHNwZWNpZmljIGhvdXIgdG8gZXhjbHVkZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBob3VyIGZvciBleGNsdXNpb25cbiAgICAgKi9cbiAgICBhZGRIb3VyRXhjbHVzaW9uOiBmdW5jdGlvbihob3VyKSB7XG4gICAgICAgIHRoaXMuX2hvdXJTcGluYm94LmFkZEV4Y2x1c2lvbihob3VyKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogYWRkIGEgc3BlY2lmaWMgbWludXRlIHRvIGV4Y2x1ZGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWludXRlIGZvciBleGNsdXNpb25cbiAgICAgKi9cbiAgICBhZGRNaW51dGVFeGNsdXNpb246IGZ1bmN0aW9uKG1pbnV0ZSkge1xuICAgICAgICB0aGlzLl9taW51dGVTcGluYm94LmFkZEV4Y2x1c2lvbihtaW51dGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBnZXQgc3RlcCBvZiBob3VyXG4gICAgICogQHJldHVybnMge251bWJlcn0gaG91ciB1cC9kb3duIHN0ZXBcbiAgICAgKi9cbiAgICBnZXRIb3VyU3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vcHRpb24uaG91clN0ZXA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGdldCBzdGVwIG9mIG1pbnV0ZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG1pbnV0ZSB1cC9kb3duIHN0ZXBcbiAgICAgKi9cbiAgICBnZXRNaW51dGVTdGVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbi5taW51dGVTdGVwO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZW1vdmUgaG91ciBmcm9tIGV4Y2x1c2lvbiBsaXN0XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhvdXIgdGhhdCB5b3Ugd2FudCB0byByZW1vdmVcbiAgICAgKi9cbiAgICByZW1vdmVIb3VyRXhjbHVzaW9uOiBmdW5jdGlvbihob3VyKSB7XG4gICAgICAgIHRoaXMuX2hvdXJTcGluYm94LnJlbW92ZUV4Y2x1c2lvbihob3VyKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogcmVtb3ZlIG1pbnV0ZSBmcm9tIGV4Y2x1c2lvbiBsaXN0XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbnV0ZSB0aGF0IHlvdSB3YW50IHRvIHJlbW92ZVxuICAgICAqL1xuICAgIHJlbW92ZU1pbnV0ZUV4Y2x1c2lvbjogZnVuY3Rpb24obWludXRlKSB7XG4gICAgICAgIHRoaXMuX21pbnV0ZVNwaW5ib3gucmVtb3ZlRXhjbHVzaW9uKG1pbnV0ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGdldCBob3VyXG4gICAgICogQHJldHVybnMge251bWJlcn0gaG91clxuICAgICAqL1xuICAgIGdldEhvdXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faG91cjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogZ2V0IG1pbnV0ZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IG1pbnV0ZVxuICAgICAqL1xuICAgIGdldE1pbnV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9taW51dGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGdldCB0aW1lXG4gICAgICogQGFwaVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9ICdoaDptbSAoQU0vUE0pJ1xuICAgICAqL1xuICAgIGdldFRpbWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZm9ybVRvVGltZUZvcm1hdCgpO1xuICAgIH1cbn0pO1xudHVpLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKFRpbWVQaWNrZXIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWVQaWNrZXI7XG5cbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBVdGlscyBmb3IgY2FsZW5kYXIgY29tcG9uZW50XG4gKiBAYXV0aG9yIE5ITiBOZXQuIEZFIGRldiB0ZWFtLiA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICogQGRlcGVuZGVuY3kgbmUtY29kZS1zbmlwcGV0IH4xLjAuMlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBVdGlscyBvZiBjYWxlbmRhclxuICogQG5hbWVzcGFjZSB1dGlsc1xuICovXG52YXIgdXRpbHMgPSB7XG4gICAgLyoqXG4gICAgICogUmV0dXJuIGRhdGUgaGFzaCBieSBwYXJhbWV0ZXIuXG4gICAgICogIGlmIHRoZXJlIGFyZSAzIHBhcmFtZXRlciwgdGhlIHBhcmFtZXRlciBpcyBjb3Jnbml6ZWQgRGF0ZSBvYmplY3RcbiAgICAgKiAgaWYgdGhlcmUgYXJlIG5vIHBhcmFtZXRlciwgcmV0dXJuIHRvZGF5J3MgaGFzaCBkYXRlXG4gICAgICogQGZ1bmN0aW9uIGdldERhdGVIYXNoVGFibGVcbiAgICAgKiBAbWVtYmVyb2YgdXRpbHNcbiAgICAgKiBAcGFyYW0ge0RhdGV8bnVtYmVyfSBbeWVhcl0gQSBkYXRlIGluc3RhbmNlIG9yIHllYXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW21vbnRoXSBBIG1vbnRoXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtkYXRlXSBBIGRhdGVcbiAgICAgKiBAcmV0dXJucyB7e3llYXI6ICosIG1vbnRoOiAqLCBkYXRlOiAqfX0gXG4gICAgICovXG4gICAgZ2V0RGF0ZUhhc2hUYWJsZTogZnVuY3Rpb24oeWVhciwgbW9udGgsIGRhdGUpIHtcbiAgICAgICAgdmFyIG5EYXRlO1xuXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMykge1xuICAgICAgICAgICAgbkRhdGUgPSBhcmd1bWVudHNbMF0gfHwgbmV3IERhdGUoKTtcblxuICAgICAgICAgICAgeWVhciA9IG5EYXRlLmdldEZ1bGxZZWFyKCk7XG4gICAgICAgICAgICBtb250aCA9IG5EYXRlLmdldE1vbnRoKCkgKyAxO1xuICAgICAgICAgICAgZGF0ZSA9IG5EYXRlLmdldERhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB5ZWFyOiB5ZWFyLFxuICAgICAgICAgICAgbW9udGg6IG1vbnRoLFxuICAgICAgICAgICAgZGF0ZTogZGF0ZVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdG9kYXkgdGhhdCBzYXZlZCBvbiBjb21wb25lbnQgb3IgY3JlYXRlIG5ldyBkYXRlLlxuICAgICAqIEBmdW5jdGlvbiBnZXRUb2RheVxuICAgICAqIEByZXR1cm5zIHt7eWVhcjogKiwgbW9udGg6ICosIGRhdGU6ICp9fVxuICAgICAqIEBtZW1iZXJvZiB1dGlsc1xuICAgICAqL1xuICAgIGdldFRvZGF5OiBmdW5jdGlvbigpIHtcbiAgICAgICByZXR1cm4gdXRpbHMuZ2V0RGF0ZUhhc2hUYWJsZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgd2Vla3MgY291bnQgYnkgcGFyYW1lbnRlclxuICAgICAqIEBmdW5jdGlvbiBnZXRXZWVrc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5ZWFyIEEgeWVhclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtb250aCBBIG1vbnRoXG4gICAgICogQHJldHVybiB7bnVtYmVyfSDso7wgKDR+NilcbiAgICAgKiBAbWVtYmVyb2YgdXRpbHNcbiAgICAgKiovXG4gICAgZ2V0V2Vla3M6IGZ1bmN0aW9uKHllYXIsIG1vbnRoKSB7XG4gICAgICAgIHZhciBmaXJzdERheSA9IHV0aWxzLmdldEZpcnN0RGF5KHllYXIsIG1vbnRoKSxcbiAgICAgICAgICAgIGxhc3REYXRlID0gdXRpbHMuZ2V0TGFzdERhdGUoeWVhciwgbW9udGgpO1xuXG4gICAgICAgIHJldHVybiBNYXRoLmNlaWwoKGZpcnN0RGF5ICsgbGFzdERhdGUpIC8gNyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB1bml4IHRpbWUgZnJvbSBkYXRlIGhhc2hcbiAgICAgKiBAZnVuY3Rpb24gZ2V0VGltZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRlIEEgZGF0ZSBoYXNoXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGRhdGUueWVhciBBIHllYXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGF0ZS5tb250aCBBIG1vbnRoXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGRhdGUuZGF0ZSBBIGRhdGVcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IFxuICAgICAqIEBtZW1iZXJvZiB1dGlsc1xuICAgICAqIEBleGFtcGxlXG4gICAgICogdXRpbHMuZ2V0VGltZSh7eWVhcjoyMDEwLCBtb250aDo1LCBkYXRlOjEyfSk7IC8vIDEyNzM1OTAwMDAwMDBcbiAgICAgKiovXG4gICAgZ2V0VGltZTogZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgICByZXR1cm4gdXRpbHMuZ2V0RGF0ZU9iamVjdChkYXRlKS5nZXRUaW1lKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB3aGljaCBkYXkgaXMgZmlyc3QgYnkgcGFyYW1ldGVycyB0aGF0IGluY2x1ZGUgeWVhciBhbmQgbW9udGggaW5mb3JtYXRpb24uXG4gICAgICogQGZ1bmN0aW9uIGdldEZpcnN0RGF5XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHllYXIgQSB5ZWFyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1vbnRoIEEgbW9udGhcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9ICgwfjYpXG4gICAgICogQG1lbWJlcm9mIHV0aWxzXG4gICAgICoqL1xuICAgIGdldEZpcnN0RGF5OiBmdW5jdGlvbih5ZWFyLCBtb250aCkge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoeWVhciwgbW9udGggLSAxLCAxKS5nZXREYXkoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHdoaWNoIGRheSBpcyBsYXN0IGJ5IHBhcmFtZXRlcnMgdGhhdCBpbmNsdWRlIHllYXIgYW5kIG1vbnRoIGluZm9ybWF0aW9uLlxuICAgICAqIEBmdW5jdGlvbiBnZXRMYXN0RGF5XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHllYXIgQSB5ZWFyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1vbnRoIEEgbW9udGhcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9ICgwfjYpXG4gICAgICogQG1lbWJlcm9mIHV0aWxzXG4gICAgICoqL1xuICAgIGdldExhc3REYXk6IGZ1bmN0aW9uKHllYXIsIG1vbnRoKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgMCkuZ2V0RGF5KCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBsYXN0IGRhdGUgYnkgcGFyYW1ldGVycyB0aGF0IGluY2x1ZGUgeWVhciBhbmQgbW9udGggaW5mb3JtYXRpb24uXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHllYXIgQSB5ZWFyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1vbnRoIEEgbW9udGhcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9ICgxfjMxKVxuICAgICAqIEBtZW1iZXJvZiB1dGlsc1xuICAgICAqKi9cbiAgICBnZXRMYXN0RGF0ZTogZnVuY3Rpb24oeWVhciwgbW9udGgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHllYXIsIG1vbnRoLCAwKS5nZXREYXRlKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBkYXRlIGluc3RhbmNlLlxuICAgICAqIEBmdW5jdGlvbiBnZXREYXRlT2JqZWN0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGUgQSBkYXRlIGhhc2hcbiAgICAgKiBAcmV0dXJuIHtEYXRlfSBEYXRlICBcbiAgICAgKiBAbWVtYmVyb2YgdXRpbHNcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqICB1dGlscy5nZXREYXRlT2JqZWN0KHt5ZWFyOjIwMTAsIG1vbnRoOjUsIGRhdGU6MTJ9KTtcbiAgICAgKiAgdXRpbHMuZ2V0RGF0ZU9iamVjdCgyMDEwLCA1LCAxMik7IC8veWVhcixtb250aCxkYXRlXG4gICAgICoqL1xuICAgIGdldERhdGVPYmplY3Q6IGZ1bmN0aW9uKGRhdGUpIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZShhcmd1bWVudHNbMF0sIGFyZ3VtZW50c1sxXSAtIDEsIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGRhdGUueWVhciwgZGF0ZS5tb250aCAtIDEsIGRhdGUuZGF0ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCByZWxhdGVkIGRhdGUgaGFzaCB3aXRoIHBhcmFtZXRlcnMgdGhhdCBpbmNsdWRlIGRhdGUgaW5mb3JtYXRpb24uXG4gICAgICogQGZ1bmN0aW9uIGdldFJlbGF0aXZlRGF0ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5ZWFyIEEgcmVsYXRlZCB2YWx1ZSBmb3IgeWVhcih5b3UgY2FuIHVzZSArLy0pXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1vbnRoIEEgcmVsYXRlZCB2YWx1ZSBmb3IgbW9udGggKHlvdSBjYW4gdXNlICsvLSlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGF0ZSBBIHJlbGF0ZWQgdmFsdWUgZm9yIGRheSAoeW91IGNhbiB1c2UgKy8tKVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRlT2JqIHN0YW5kYXJkIGRhdGUgaGFzaFxuICAgICAqIEByZXR1cm4ge09iamVjdH0gZGF0ZU9iaiBcbiAgICAgKiBAbWVtYmVyb2YgdXRpbHNcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqICB1dGlscy5nZXRSZWxhdGl2ZURhdGUoMSwgMCwgMCwge3llYXI6MjAwMCwgbW9udGg6MSwgZGF0ZToxfSk7IC8vIHt5ZWFyOjIwMDEsIG1vbnRoOjEsIGRhdGU6MX1cbiAgICAgKiAgdXRpbHMuZ2V0UmVsYXRpdmVEYXRlKDAsIDAsIC0xLCB7eWVhcjoyMDEwLCBtb250aDoxLCBkYXRlOjF9KTsgLy8ge3llYXI6MjAwOSwgbW9udGg6MTIsIGRhdGU6MzF9XG4gICAgICoqL1xuICAgIGdldFJlbGF0aXZlRGF0ZTogZnVuY3Rpb24oeWVhciwgbW9udGgsIGRhdGUsIGRhdGVPYmopIHtcbiAgICAgICAgdmFyIG5ZZWFyID0gKGRhdGVPYmoueWVhciArIHllYXIpLFxuICAgICAgICAgICAgbk1vbnRoID0gKGRhdGVPYmoubW9udGggKyBtb250aCAtIDEpLFxuICAgICAgICAgICAgbkRhdGUgPSAoZGF0ZU9iai5kYXRlICsgZGF0ZSksXG4gICAgICAgICAgICBuRGF0ZU9iaiA9IG5ldyBEYXRlKG5ZZWFyLCBuTW9udGgsIG5EYXRlKTtcblxuICAgICAgICByZXR1cm4gdXRpbHMuZ2V0RGF0ZUhhc2hUYWJsZShuRGF0ZU9iaik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmFyeSBzZWFyY2hcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBmaWVsZCAtIFNlYXJjaCBmaWVsZFxuICAgICAqIEBwYXJhbSB7QXJyYXl9IHZhbHVlIC0gU2VhcmNoIHRhcmdldFxuICAgICAqIEByZXR1cm5zIHt7Zm91bmQ6IGJvb2xlYW4sIGluZGV4OiBudW1iZXJ9fSBSZXN1bHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHNlYXJjaDogZnVuY3Rpb24oZmllbGQsIHZhbHVlKSB7XG4gICAgICAgIHZhciBmb3VuZCA9IGZhbHNlLFxuICAgICAgICAgICAgbG93ID0gMCxcbiAgICAgICAgICAgIGhpZ2ggPSBmaWVsZC5sZW5ndGggLSAxLFxuICAgICAgICAgICAgZW5kLCBpbmRleCwgZmllbGRWYWx1ZTtcblxuICAgICAgICB3aGlsZSAoIWZvdW5kICYmICFlbmQpIHtcbiAgICAgICAgICAgIGluZGV4ID0gTWF0aC5mbG9vcigobG93ICsgaGlnaCkgLyAyKTtcbiAgICAgICAgICAgIGZpZWxkVmFsdWUgPSBmaWVsZFtpbmRleF07XG5cbiAgICAgICAgICAgIGlmIChmaWVsZFZhbHVlID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZmllbGRWYWx1ZSA8IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgbG93ID0gaW5kZXggKyAxO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBoaWdoID0gaW5kZXggLSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZW5kID0gKGxvdyA+IGhpZ2gpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZvdW5kOiBmb3VuZCxcbiAgICAgICAgICAgIGluZGV4OiAoZm91bmQgfHwgZmllbGRWYWx1ZSA+IHZhbHVlKSA/IGluZGV4IDogaW5kZXggKyAxXG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHV0aWxzO1xuIl19
