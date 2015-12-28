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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9kYXRlcGlja2VyLmpzIiwic3JjL3NwaW5ib3guanMiLCJzcmMvdGltZXBpY2tlci5qcyIsInNyYy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzF3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbFdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMza0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidHVpLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCd0dWkuY29tcG9uZW50LlNwaW5ib3gnLCByZXF1aXJlKCcuL3NyYy9zcGluYm94JykpO1xudHVpLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCd0dWkuY29tcG9uZW50LlRpbWVQaWNrZXInLCByZXF1aXJlKCcuL3NyYy90aW1lcGlja2VyJykpO1xudHVpLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCd0dWkuY29tcG9uZW50LkRhdGVQaWNrZXInLCByZXF1aXJlKCcuL3NyYy9kYXRlcGlja2VyJykpO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IG5obmVudCBvbiAxNS4gNS4gMTQuLlxuICogQGZpbGVvdmVydmlldyBUaGlzIGNvbXBvbmVudCBwcm92aWRlcyBhIGNhbGVuZGFyIGZvciBwaWNraW5nIGEgZGF0ZSAmIHRpbWUuXG4gKiBAYXV0aG9yIE5ITiBlbnQgRkUgZGV2IDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+IDxtaW5reXUueWlAbmhuZW50LmNvbT5cbiAqIEBkZXBlbmRlbmN5IGpxdWVyeS0xLjguMywgY29kZS1zbmlwcGV0LTEuMC4yLCBjb21wb25lbnQtY2FsZW5kYXItMS4wLjEsIHRpbWVQaWNrZXIuanNcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIGluQXJyYXkgPSB0dWkudXRpbC5pbkFycmF5LFxuICAgIGZvcm1hdFJlZ0V4cCA9IC95eXl5fHl5fG1tfG18ZGR8ZC9naSxcbiAgICBtYXBGb3JDb252ZXJ0aW5nID0ge1xuICAgICAgICB5eXl5OiB7ZXhwcmVzc2lvbjogJyhcXFxcZHs0fXxcXFxcZHsyfSknLCB0eXBlOiAneWVhcid9LFxuICAgICAgICB5eToge2V4cHJlc3Npb246ICcoXFxcXGR7NH18XFxcXGR7Mn0pJywgdHlwZTogJ3llYXInfSxcbiAgICAgICAgeToge2V4cHJlc3Npb246ICcoXFxcXGR7NH18XFxcXGR7Mn0pJywgdHlwZTogJ3llYXInfSxcbiAgICAgICAgbW06IHtleHByZXNzaW9uOiAnKDFbMDEyXXwwWzEtOV18WzEtOV1cXFxcYiknLCB0eXBlOiAnbW9udGgnfSxcbiAgICAgICAgbToge2V4cHJlc3Npb246ICcoMVswMTJdfDBbMS05XXxbMS05XVxcXFxiKScsIHR5cGU6ICdtb250aCd9LFxuICAgICAgICBkZDoge2V4cHJlc3Npb246ICcoWzEyXVxcXFxkezF9fDNbMDFdfDBbMS05XXxbMS05XVxcXFxiKScsIHR5cGU6ICdkYXRlJ30sXG4gICAgICAgIGQ6IHtleHByZXNzaW9uOiAnKFsxMl1cXFxcZHsxfXwzWzAxXXwwWzEtOV18WzEtOV1cXFxcYiknLCB0eXBlOiAnZGF0ZSd9XG4gICAgfSxcbiAgICBDT05TVEFOVFMgPSB7XG4gICAgICAgIE1JTl9ZRUFSOiAxOTcwLFxuICAgICAgICBNQVhfWUVBUjogMjk5OSxcbiAgICAgICAgTU9OVEhfREFZUzogWzAsIDMxLCAyOCwgMzEsIDMwLCAzMSwgMzAsIDMxLCAzMSwgMzAsIDMxLCAzMCwgMzFdLFxuICAgICAgICBXUkFQUEVSX1RBRzogJzxkaXYgc3R5bGU9XCJwb3NpdGlvbjphYnNvbHV0ZTtcIj48L2Rpdj4nLFxuICAgICAgICBNSU5fRURHRTogK25ldyBEYXRlKDApLFxuICAgICAgICBNQVhfRURHRTogK25ldyBEYXRlKDI5OTksIDExLCAzMSksXG4gICAgICAgIFlFQVJfVE9fTVM6IDMxNTM2MDAwMDAwXG4gICAgfTtcblxuLyoqXG4gKiBBIG51bWJlciwgb3IgYSBzdHJpbmcgY29udGFpbmluZyBhIG51bWJlci5cbiAqIEB0eXBlZGVmIHtPYmplY3R9IGRhdGVIYXNoXG4gKiBAcHJvcGVydHkge251bWJlcn0geWVhciAtIDE5NzB+Mjk5OVxuICogQHByb3BlcnR5IHtudW1iZXJ9IG1vbnRoIC0gMX4xMlxuICogQHByb3BlcnR5IHtudW1iZXJ9IGRhdGUgLSAxfjMxXG4gKi9cblxuLyoqXG4gKiBDcmVhdGUgRGF0ZVBpY2tlcjxicj5cbiAqIFlvdSBjYW4gZ2V0IGEgZGF0ZSBmcm9tICdnZXRZZWFyJywgJ2dldE1vbnRoJywgJ2dldERheUluTW9udGgnLCAnZ2V0RGF0ZUhhc2gnXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb24gLSBvcHRpb25zIGZvciBEYXRlUGlja2VyXG4gKiAgICAgIEBwYXJhbSB7SFRNTEVsZW1lbnR8c3RyaW5nfSBvcHRpb24uZWxlbWVudCAtIGlucHV0IGVsZW1lbnQob3Igc2VsZWN0b3IpIG9mIERhdGVQaWNrZXJcbiAqICAgICAgQHBhcmFtIHtkYXRlSGFzaH0gW29wdGlvbi5kYXRlID0gdG9kYXldIC0gaW5pdGlhbCBkYXRlIG9iamVjdFxuICogICAgICBAcGFyYW0ge3N0cmluZ30gW29wdGlvbi5kYXRlRm9ybSA9ICd5eXl5LW1tLWRkJ10gLSBmb3JtYXQgb2YgZGF0ZSBzdHJpbmdcbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IFtvcHRpb24uZGVmYXVsdENlbnR1cnkgPSAyMF0gLSBpZiB5ZWFyLWZvcm1hdCBpcyB5eSwgdGhpcyB2YWx1ZSBpcyBwcmVwZW5kZWQgYXV0b21hdGljYWxseS5cbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IFtvcHRpb24uc2VsZWN0YWJsZUNsYXNzTmFtZSA9ICdzZWxlY3RhYmxlJ10gLSBmb3Igc2VsZWN0YWJsZSBkYXRlIGVsZW1lbnRzXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9uLnNlbGVjdGVkQ2xhc3NOYW1lID0gJ3NlbGVjdGVkJ10gLSBmb3Igc2VsZWN0ZWQgZGF0ZSBlbGVtZW50XG4gKiAgICAgIEBwYXJhbSB7QXJyYXkuPEFycmF5LjxkYXRlSGFzaD4+fSBbb3B0aW9ucy5zZWxlY3RhYmxlUmFuZ2VzXSAtIFNlbGVjdGFibGUgZGF0ZSByYW5nZXMsIFNlZSBleGFtcGxlXG4gKiAgICAgIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uLnBvc10gLSBjYWxlbmRhciBwb3NpdGlvbiBzdHlsZSB2YWx1ZVxuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24ucG9zLmxlZnRdIC0gcG9zaXRpb24gbGVmdCBvZiBjYWxlbmRhclxuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24ucG9zLnRvcF0gLSBwb3NpdGlvbiB0b3Agb2YgY2FsZW5kYXJcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLnBvcy56SW5kZXhdIC0gei1pbmRleCBvZiBjYWxlbmRhclxuICogICAgICBAcGFyYW0ge09iamVjdH0gW29wdGlvbi5vcGVuZXJzID0gW2VsZW1lbnRdXSAtIG9wZW5lciBidXR0b24gbGlzdCAoZXhhbXBsZSAtIGljb24sIGJ1dHRvbiwgZXRjLilcbiAqICAgICAgQHBhcmFtIHtib29sZWFufSBbb3B0aW9uLnNob3dBbHdheXMgPSBmYWxzZV0gLSB3aGV0aGVyIHRoZSBkYXRlcGlja2VyIHNob3dzIHRoZSBjYWxlbmRhciBhbHdheXNcbiAqICAgICAgQHBhcmFtIHtib29sZWFufSBbb3B0aW9uLnVzZVRvdWNoRXZlbnQgPSB0cnVlXSAtIHdoZXRoZXIgdGhlIGRhdGVwaWNrZXIgdXNlcyB0b3VjaCBldmVudHNcbiAqICAgICAgQHBhcmFtIHt0dWkuY29tcG9uZW50LlRpbWVQaWNrZXJ9IFtvcHRpb24udGltZVBpY2tlcl0gLSBUaW1lUGlja2VyIGluc3RhbmNlXG4gKiBAcGFyYW0ge3R1aS5jb21wb25lbnQuQ2FsZW5kYXJ9IGNhbGVuZGFyIC0gQ2FsZW5kYXIgaW5zdGFuY2VcbiAqIEBleGFtcGxlXG4gKiAgIHZhciBjYWxlbmRhciA9IG5ldyB0dWkuY29tcG9uZW50LkNhbGVuZGFyKHtcbiAqICAgICAgIGVsZW1lbnQ6ICcjbGF5ZXInLFxuICogICAgICAgdGl0bGVGb3JtYXQ6ICd5eXl564WEIG3sm5QnLFxuICogICAgICAgdG9kYXlGb3JtYXQ6ICd5eXl564WEIG1t7JuUIGRk7J28IChEKSdcbiAqICAgfSk7XG4gKlxuICogICB2YXIgdGltZVBpY2tlciA9IG5ldyB0dWkuY29tcG9uZW50LlRpbWVQaWNrZXIoe1xuICogICAgICAgc2hvd01lcmlkaWFuOiB0cnVlLFxuICogICAgICAgZGVmYXVsdEhvdXI6IDEzLFxuICogICAgICAgZGVmYXVsdE1pbnV0ZTogMjRcbiAqICAgfSk7XG4gKlxuICogICB2YXIgcmFuZ2UxID0gW1xuICogICAgICAgICAge3llYXI6IDIwMTUsIG1vbnRoOjEsIGRhdGU6IDF9LFxuICogICAgICAgICAge3llYXI6IDIwMTUsIG1vbnRoOjIsIGRhdGU6IDF9XG4gKiAgICAgIF0sXG4gKiAgICAgIHJhbmdlMiA9IFtcbiAqICAgICAgICAgIHt5ZWFyOiAyMDE1LCBtb250aDozLCBkYXRlOiAxfSxcbiAqICAgICAgICAgIHt5ZWFyOiAyMDE1LCBtb250aDo0LCBkYXRlOiAxfVxuICogICAgICBdLFxuICogICAgICByYW5nZTMgPSBbXG4gKiAgICAgICAgICB7eWVhcjogMjAxNSwgbW9udGg6NiwgZGF0ZTogMX0sXG4gKiAgICAgICAgICB7eWVhcjogMjAxNSwgbW9udGg6NywgZGF0ZTogMX1cbiAqICAgICAgXTtcbiAqXG4gKiAgIHZhciBwaWNrZXIxID0gbmV3IHR1aS5jb21wb25lbnQuRGF0ZVBpY2tlcih7XG4gKiAgICAgICBlbGVtZW50OiAnI3BpY2tlcicsXG4gKiAgICAgICBkYXRlRm9ybTogJ3l5eXnrhYQgbW3sm5QgZGTsnbwgLSAnLFxuICogICAgICAgZGF0ZToge3llYXI6IDIwMTUsIG1vbnRoOiAxLCBkYXRlOiAxIH0sXG4gKiAgICAgICBzZWxlY3RhYmxlUmFuZ2VzOiBbcmFuZ2UxLCByYW5nZTIsIHJhbmdlM10sXG4gKiAgICAgICBvcGVuZXJzOiBbJyNvcGVuZXInXSxcbiAqICAgICAgIHRpbWVQaWNrZXI6IHRpbWVQaWNrZXJcbiAqICAgfSwgY2FsZW5kYXIpO1xuICpcbiAqICAgLy8gQ2xvc2UgY2FsZW5kYXIgd2hlbiBzZWxlY3QgYSBkYXRlXG4gKiAgICQoJyNsYXllcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gKiAgICAgICB2YXIgJGVsID0gJChldmVudC50YXJnZXQpO1xuICpcbiAqICAgICAgIGlmICgkZWwuaGFzQ2xhc3MoJ3NlbGVjdGFibGUnKSkge1xuICogICAgICAgICAgIHBpY2tlcjEuY2xvc2UoKTtcbiAqICAgICAgIH1cbiAqICAgfSk7XG4gKi9cbnZhciBEYXRlUGlja2VyID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBEYXRlUGlja2VyLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb24sIGNhbGVuZGFyKSB7XG4gICAgICAgIC8vIHNldCBkZWZhdWx0c1xuICAgICAgICBvcHRpb24gPSB0dWkudXRpbC5leHRlbmQoe1xuICAgICAgICAgICAgZGF0ZUZvcm06ICd5eXl5LW1tLWRkICcsXG4gICAgICAgICAgICBkZWZhdWx0Q2VudHVyeTogJzIwJyxcbiAgICAgICAgICAgIHNlbGVjdGFibGVDbGFzc05hbWU6ICdzZWxlY3RhYmxlJyxcbiAgICAgICAgICAgIHNlbGVjdGVkQ2xhc3NOYW1lOiAnc2VsZWN0ZWQnLFxuICAgICAgICAgICAgc2VsZWN0YWJsZVJhbmdlczogW10sXG4gICAgICAgICAgICBzaG93QWx3YXlzOiBmYWxzZSxcbiAgICAgICAgICAgIHVzZVRvdWNoRXZlbnQ6IHRydWVcbiAgICAgICAgfSwgb3B0aW9uKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2FsZW5kYXIgaW5zdGFuY2VcbiAgICAgICAgICogQHR5cGUge0NhbGVuZGFyfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fY2FsZW5kYXIgPSBjYWxlbmRhcjtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRWxlbWVudCBmb3IgZGlzcGxheWluZyBhIGRhdGUgdmFsdWVcbiAgICAgICAgICogQHR5cGUge0hUTUxFbGVtZW50fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fJGVsZW1lbnQgPSAkKG9wdGlvbi5lbGVtZW50KTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRWxlbWVudCB3cmFwcGluZyBjYWxlbmRhclxuICAgICAgICAgKiBAdHlwZSB7SFRNTEVsZW1lbnR9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl8kd3JhcHBlckVsZW1lbnQgPSAkKENPTlNUQU5UUy5XUkFQUEVSX1RBRyk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZvcm1hdCBvZiBkYXRlIHN0cmluZ1xuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fZGF0ZUZvcm0gPSBvcHRpb24uZGF0ZUZvcm07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlZ0V4cCBpbnN0YW5jZSBmb3IgZm9ybWF0IG9mIGRhdGUgc3RyaW5nXG4gICAgICAgICAqIEB0eXBlIHtSZWdFeHB9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9yZWdFeHAgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBcnJheSBzYXZpbmcgYSBvcmRlciBvZiBmb3JtYXRcbiAgICAgICAgICogQHR5cGUge0FycmF5fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAc2VlIHt0dWkuY29tcG9uZW50LkRhdGVQaWNrZXIucHJvdG90eXBlLnNldERhdGVGb3JtfVxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKiAvLyBJZiB0aGUgZm9ybWF0IGlzIGEgJ21tLWRkLCB5eXl5J1xuICAgICAgICAgKiAvLyBgdGhpcy5fZm9ybU9yZGVyYCBpcyBbJ21vbnRoJywgJ2RhdGUnLCAneWVhciddXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9mb3JtT3JkZXIgPSBbXTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogT2JqZWN0IGhhdmluZyBkYXRlIHZhbHVlc1xuICAgICAgICAgKiBAdHlwZSB7ZGF0ZUhhc2h9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9kYXRlID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhpcyB2YWx1ZSBpcyBwcmVwZW5kZWQgYXV0b21hdGljYWxseSB3aGVuIHllYXItZm9ybWF0IGlzICd5eSdcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICogLy9cbiAgICAgICAgICogLy8gSWYgdGhpcyB2YWx1ZSBpcyAnMjAnLCB0aGUgZm9ybWF0IGlzICd5eS1tbS1kZCcgYW5kIHRoZSBkYXRlIHN0cmluZyBpcyAnMTUtMDQtMTInLFxuICAgICAgICAgKiAvLyB0aGUgZGF0ZSB2YWx1ZSBvYmplY3QgaXNcbiAgICAgICAgICogLy8gIHtcbiAgICAgICAgICogLy8gICAgICB5ZWFyOiAyMDE1LFxuICAgICAgICAgKiAvLyAgICAgIG1vbnRoOiA0LFxuICAgICAgICAgKiAvLyAgICAgIGRhdGU6IDEyXG4gICAgICAgICAqIC8vICB9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9kZWZhdWx0Q2VudHVyeSA9IG9wdGlvbi5kZWZhdWx0Q2VudHVyeTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2xhc3MgbmFtZSBmb3Igc2VsZWN0YWJsZSBkYXRlIGVsZW1lbnRzXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9zZWxlY3RhYmxlQ2xhc3NOYW1lID0gb3B0aW9uLnNlbGVjdGFibGVDbGFzc05hbWU7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENsYXNzIG5hbWUgZm9yIHNlbGVjdGVkIGRhdGUgZWxlbWVudFxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fc2VsZWN0ZWRDbGFzc05hbWUgPSBvcHRpb24uc2VsZWN0ZWRDbGFzc05hbWU7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEl0IGlzIHN0YXJ0IHRpbWVzdGFtcHMgZnJvbSB0aGlzLl9yYW5nZXNcbiAgICAgICAgICogQHR5cGUge0FycmF5LjxudW1iZXI+fVxuICAgICAgICAgKiBAc2luY2UgMS4yLjBcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3N0YXJ0VGltZXMgPSBbXTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogSXQgaXMgZW5kIHRpbWVzdGFtcHMgZnJvbSB0aGlzLl9yYW5nZXNcbiAgICAgICAgICogQHR5cGUge0FycmF5LjxudW1iZXI+fVxuICAgICAgICAgKiBAc2luY2UgMS4yLjBcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2VuZFRpbWVzID0gW107XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNlbGVjdGFibGUgZGF0ZSByYW5nZXNcbiAgICAgICAgICogQHR5cGUge0FycmF5LjxBcnJheS48ZGF0ZUhhc2g+Pn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHNpbmNlIDEuMi4wXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9yYW5nZXMgPSBvcHRpb24uc2VsZWN0YWJsZVJhbmdlcztcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGltZVBpY2tlciBpbnN0YW5jZVxuICAgICAgICAgKiBAdHlwZSB7VGltZVBpY2tlcn1cbiAgICAgICAgICogQHNpbmNlIDEuMS4wXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl90aW1lUGlja2VyID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogcG9zaXRpb24gLSBsZWZ0ICYgdG9wICYgekluZGV4XG4gICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBzaW5jZSAxLjEuMVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fcG9zID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogb3BlbmVycyAtIG9wZW5lciBsaXN0XG4gICAgICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHNpbmNlIDEuMS4xXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9vcGVuZXJzID0gW107XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEhhbmRsZXJzIGJpbmRpbmcgY29udGV4dFxuICAgICAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fcHJveHlIYW5kbGVycyA9IHt9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXaGV0aGVyIHRoZSBkYXRlcGlja2VyIHNob3dzIGFsd2F5c1xuICAgICAgICAgKiBAYXBpXG4gICAgICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAgICAgKiBAc2luY2UgMS4yLjBcbiAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICogZGF0ZXBpY2tlci5zaG93QWx3YXlzID0gdHJ1ZTtcbiAgICAgICAgICogZGF0ZXBpY2tlci5vcGVuKCk7XG4gICAgICAgICAqIC8vIFRoZSBkYXRlcGlja2VyIHdpbGwgYmUgbm90IGNsb3NlZCBpZiB5b3UgY2xpY2sgdGhlIG91dHNpZGUgb2YgdGhlIGRhdGVwaWNrZXJcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc2hvd0Fsd2F5cyA9IG9wdGlvbi5zaG93QWx3YXlzO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXaGV0aGVyIHRoZSBkYXRlcGlja2VyIHVzZSB0b3VjaCBldmVudC5cbiAgICAgICAgICogQGFwaVxuICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgICAgICogQHNpbmNlIDEuMi4wXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqIGRhdGVwaWNrZXIudXNlVG91Y2hFdmVudCA9IGZhbHNlO1xuICAgICAgICAgKiAvLyBUaGUgZGF0ZXBpY2tlciB3aWxsIGJlIHVzZSBvbmx5ICdjbGljaycsICdtb3VzZWRvd24nIGV2ZW50c1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy51c2VUb3VjaEV2ZW50ID0gISEoXG4gICAgICAgICAgICAoKCdjcmVhdGVUb3VjaCcgaW4gZG9jdW1lbnQpIHx8ICgnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudCkpICYmXG4gICAgICAgICAgICBvcHRpb24udXNlVG91Y2hFdmVudFxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMuX2luaXRpYWxpemVEYXRlUGlja2VyKG9wdGlvbik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgbWV0aG9kXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbiAtIHVzZXIgb3B0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5pdGlhbGl6ZURhdGVQaWNrZXI6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICB0aGlzLl9yYW5nZXMgPSB0dWkudXRpbC5maWx0ZXIodGhpcy5fcmFuZ2VzLCBmdW5jdGlvbihyYW5nZSkge1xuICAgICAgICAgICAgcmV0dXJuICh0aGlzLl9pc1ZhbGlkRGF0ZShyYW5nZVswXSkgJiYgdGhpcy5faXNWYWxpZERhdGUocmFuZ2VbMV0pKTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5fc2V0U2VsZWN0YWJsZVJhbmdlcygpO1xuICAgICAgICB0aGlzLl9zZXRXcmFwcGVyRWxlbWVudCgpO1xuICAgICAgICB0aGlzLl9zZXREZWZhdWx0RGF0ZShvcHRpb24uZGF0ZSk7XG4gICAgICAgIHRoaXMuX3NldERlZmF1bHRQb3NpdGlvbihvcHRpb24ucG9zKTtcbiAgICAgICAgdGhpcy5fc2V0UHJveHlIYW5kbGVycygpO1xuICAgICAgICB0aGlzLl9iaW5kT3BlbmVyRXZlbnQob3B0aW9uLm9wZW5lcnMpO1xuICAgICAgICB0aGlzLl9zZXRUaW1lUGlja2VyKG9wdGlvbi50aW1lUGlja2VyKTtcbiAgICAgICAgdGhpcy5zZXREYXRlRm9ybSgpO1xuICAgICAgICB0aGlzLl8kd3JhcHBlckVsZW1lbnQuaGlkZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgd3JhcHBlciBlbGVtZW50KD0gY29udGFpbmVyKVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldFdyYXBwZXJFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyICR3cmFwcGVyRWxlbWVudCA9IHRoaXMuXyR3cmFwcGVyRWxlbWVudDtcblxuICAgICAgICAkd3JhcHBlckVsZW1lbnQuYXBwZW5kKHRoaXMuX2NhbGVuZGFyLiRlbGVtZW50KTtcbiAgICAgICAgaWYgKHRoaXMuXyRlbGVtZW50WzBdKSB7XG4gICAgICAgICAgICAkd3JhcHBlckVsZW1lbnQuaW5zZXJ0QWZ0ZXIodGhpcy5fJGVsZW1lbnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJHdyYXBwZXJFbGVtZW50LmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBkZWZhdWx0IGRhdGVcbiAgICAgKiBAcGFyYW0ge3t5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRhdGU6IG51bWJlcn18RGF0ZX0gb3BEYXRlIFtvcHRpb24uZGF0ZV0gLSB1c2VyIHNldHRpbmc6IGRhdGVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXREZWZhdWx0RGF0ZTogZnVuY3Rpb24ob3BEYXRlKSB7XG4gICAgICAgIHZhciBpc051bWJlciA9IHR1aS51dGlsLmlzTnVtYmVyO1xuXG4gICAgICAgIGlmICghb3BEYXRlKSB7XG4gICAgICAgICAgICB0aGlzLl9kYXRlID0gdXRpbHMuZ2V0VG9kYXkoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2RhdGUgPSB7XG4gICAgICAgICAgICAgICAgeWVhcjogaXNOdW1iZXIob3BEYXRlLnllYXIpID8gb3BEYXRlLnllYXIgOiBDT05TVEFOVFMuTUlOX1lFQVIsXG4gICAgICAgICAgICAgICAgbW9udGg6IGlzTnVtYmVyKG9wRGF0ZS5tb250aCkgPyBvcERhdGUubW9udGggOiAxLFxuICAgICAgICAgICAgICAgIGRhdGU6IGlzTnVtYmVyKG9wRGF0ZS5kYXRlKSA/IG9wRGF0ZS5kYXRlIDogMVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTYXZlIGRlZmF1bHQgc3R5bGUtcG9zaXRpb24gb2YgY2FsZW5kYXJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3BQb3MgW29wdGlvbi5wb3NdIC0gdXNlciBzZXR0aW5nOiBwb3NpdGlvbihsZWZ0LCB0b3AsIHpJbmRleClcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXREZWZhdWx0UG9zaXRpb246IGZ1bmN0aW9uKG9wUG9zKSB7XG4gICAgICAgIHZhciBwb3MgPSB0aGlzLl9wb3MgPSBvcFBvcyB8fCB7fSxcbiAgICAgICAgICAgIGJvdW5kID0gdGhpcy5fZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgcG9zLmxlZnQgPSBwb3MubGVmdCB8fCBib3VuZC5sZWZ0IHx8IDA7XG4gICAgICAgIHBvcy50b3AgPSBwb3MudG9wIHx8IGJvdW5kLmJvdHRvbSB8fCAwO1xuICAgICAgICBwb3MuekluZGV4ID0gcG9zLnpJbmRleCB8fCA5OTk5O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgc3RhcnQvZW5kIGVkZ2UgZnJvbSBzZWxlY3RhYmxlLXJhbmdlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldFNlbGVjdGFibGVSYW5nZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9zdGFydFRpbWVzID0gW107XG4gICAgICAgIHRoaXMuX2VuZFRpbWVzID0gW107XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaCh0aGlzLl9yYW5nZXMsIGZ1bmN0aW9uKHJhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVUaW1lUmFuZ2Uoe1xuICAgICAgICAgICAgICAgIHN0YXJ0OiB1dGlscy5nZXRUaW1lKHJhbmdlWzBdKSxcbiAgICAgICAgICAgICAgICBlbmQ6IHV0aWxzLmdldFRpbWUocmFuZ2VbMV0pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSB0aW1lIHJhbmdlIChzdGFydFRpbWVzLCBlbmRUaW1lcylcbiAgICAgKiBAcGFyYW0ge3tzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcn19IG5ld1RpbWVSYW5nZSAtIFRpbWUgcmFuZ2UgZm9yIHVwZGF0ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3VwZGF0ZVRpbWVSYW5nZTogZnVuY3Rpb24obmV3VGltZVJhbmdlKSB7XG4gICAgICAgIHZhciBpbmRleCwgZXhpc3RpbmdUaW1lUmFuZ2UsIG1lcmdlZFRpbWVSYW5nZTtcblxuICAgICAgICBpbmRleCA9IHRoaXMuX3NlYXJjaFN0YXJ0VGltZShuZXdUaW1lUmFuZ2Uuc3RhcnQpLmluZGV4O1xuICAgICAgICBleGlzdGluZ1RpbWVSYW5nZSA9IHtcbiAgICAgICAgICAgIHN0YXJ0OiB0aGlzLl9zdGFydFRpbWVzW2luZGV4XSxcbiAgICAgICAgICAgIGVuZDogdGhpcy5fZW5kVGltZXNbaW5kZXhdXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMuX2lzT3ZlcmxhcHBlZFRpbWVSYW5nZShleGlzdGluZ1RpbWVSYW5nZSwgbmV3VGltZVJhbmdlKSkge1xuICAgICAgICAgICAgbWVyZ2VkVGltZVJhbmdlID0gdGhpcy5fbWVyZ2VUaW1lUmFuZ2VzKGV4aXN0aW5nVGltZVJhbmdlLCBuZXdUaW1lUmFuZ2UpO1xuICAgICAgICAgICAgdGhpcy5fc3RhcnRUaW1lcy5zcGxpY2UoaW5kZXgsIDEsIG1lcmdlZFRpbWVSYW5nZS5zdGFydCk7XG4gICAgICAgICAgICB0aGlzLl9lbmRUaW1lcy5zcGxpY2UoaW5kZXgsIDEsIG1lcmdlZFRpbWVSYW5nZS5lbmQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fc3RhcnRUaW1lcy5zcGxpY2UoaW5kZXgsIDAsIG5ld1RpbWVSYW5nZS5zdGFydCk7XG4gICAgICAgICAgICB0aGlzLl9lbmRUaW1lcy5zcGxpY2UoaW5kZXgsIDAsIG5ld1RpbWVSYW5nZS5lbmQpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIHJhbmdlcyBhcmUgb3ZlcmxhcHBlZFxuICAgICAqIEBwYXJhbSB7e3N0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyfX0gZXhpc3RpbmdUaW1lUmFuZ2UgLSBFeGlzdGluZyB0aW1lIHJhbmdlXG4gICAgICogQHBhcmFtIHt7c3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXJ9fSBuZXdUaW1lUmFuZ2UgLSBOZXcgdGltZSByYW5nZVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBXaGV0aGVyIHRoZSByYW5nZXMgYXJlIG92ZXJsYXBwZWRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc092ZXJsYXBwZWRUaW1lUmFuZ2U6IGZ1bmN0aW9uKGV4aXN0aW5nVGltZVJhbmdlLCBuZXdUaW1lUmFuZ2UpIHtcbiAgICAgICAgdmFyIGV4aXN0aW5nU3RhcnQgPSBleGlzdGluZ1RpbWVSYW5nZS5zdGFydCxcbiAgICAgICAgICAgIGV4aXN0aW5nRW5kID0gZXhpc3RpbmdUaW1lUmFuZ2UuZW5kLFxuICAgICAgICAgICAgbmV3U3RhcnQgPSBuZXdUaW1lUmFuZ2Uuc3RhcnQsXG4gICAgICAgICAgICBuZXdFbmQgPSBuZXdUaW1lUmFuZ2UuZW5kLFxuICAgICAgICAgICAgaXNUcnV0aHkgPSBleGlzdGluZ1N0YXJ0ICYmIGV4aXN0aW5nRW5kICYmIG5ld1N0YXJ0ICYmIG5ld0VuZCxcbiAgICAgICAgICAgIGlzT3ZlcmxhcHBlZCA9ICEoXG4gICAgICAgICAgICAgICAgKG5ld1N0YXJ0IDwgZXhpc3RpbmdTdGFydCAmJiBuZXdFbmQgPCBleGlzdGluZ1N0YXJ0KSB8fFxuICAgICAgICAgICAgICAgIChuZXdTdGFydCA+IGV4aXN0aW5nRW5kICYmIG5ld0VuZCA+IGV4aXN0aW5nRW5kKVxuICAgICAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gaXNUcnV0aHkgJiYgaXNPdmVybGFwcGVkO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNZXJnZSB0aGUgb3ZlcmxhcHBlZCB0aW1lIHJhbmdlc1xuICAgICAqIEBwYXJhbSB7e3N0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyfX0gZXhpc3RpbmdUaW1lUmFuZ2UgLSBFeGlzdGluZyB0aW1lIHJhbmdlXG4gICAgICogQHBhcmFtIHt7c3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXJ9fSBuZXdUaW1lUmFuZ2UgLSBOZXcgdGltZSByYW5nZVxuICAgICAqIEByZXR1cm5zIHt7c3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXJ9fSBNZXJnZWQgdGltZSByYW5nZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21lcmdlVGltZVJhbmdlczogZnVuY3Rpb24oZXhpc3RpbmdUaW1lUmFuZ2UsIG5ld1RpbWVSYW5nZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RhcnQ6IE1hdGgubWluKGV4aXN0aW5nVGltZVJhbmdlLnN0YXJ0LCBuZXdUaW1lUmFuZ2Uuc3RhcnQpLFxuICAgICAgICAgICAgZW5kOiBNYXRoLm1heChleGlzdGluZ1RpbWVSYW5nZS5lbmQsIG5ld1RpbWVSYW5nZS5lbmQpXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNlYXJjaCB0aW1lc3RhbXAgaW4gc3RhcnRUaW1lc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lc3RhbXAgLSB0aW1lc3RhbXBcbiAgICAgKiBAcmV0dXJucyB7e2ZvdW5kOiBib29sZWFuLCBpbmRleDogbnVtYmVyfX0gcmVzdWx0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2VhcmNoU3RhcnRUaW1lOiBmdW5jdGlvbih0aW1lc3RhbXApIHtcbiAgICAgICAgcmV0dXJuIHV0aWxzLnNlYXJjaCh0aGlzLl9zdGFydFRpbWVzLCB0aW1lc3RhbXApO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZWFyY2ggdGltZXN0YW1wIGluIGVuZFRpbWVzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRpbWVzdGFtcCAtIHRpbWVzdGFtcFxuICAgICAqIEByZXR1cm5zIHt7Zm91bmQ6IGJvb2xlYW4sIGluZGV4OiBudW1iZXJ9fSByZXN1bHRcbiAgICAgKi9cbiAgICBfc2VhcmNoRW5kVGltZTogZnVuY3Rpb24odGltZXN0YW1wKSB7XG4gICAgICAgIHJldHVybiB1dGlscy5zZWFyY2godGhpcy5fZW5kVGltZXMsIHRpbWVzdGFtcCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN0b3JlIG9wZW5lciBlbGVtZW50IGxpc3RcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBvcE9wZW5lcnMgW29wdGlvbi5vcGVuZXJzXSAtIG9wZW5lciBlbGVtZW50IGxpc3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRPcGVuZXJzOiBmdW5jdGlvbihvcE9wZW5lcnMpIHtcbiAgICAgICAgdGhpcy5hZGRPcGVuZXIodGhpcy5fJGVsZW1lbnQpO1xuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKG9wT3BlbmVycywgZnVuY3Rpb24ob3BlbmVyKSB7XG4gICAgICAgICAgICB0aGlzLmFkZE9wZW5lcihvcGVuZXIpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IFRpbWVQaWNrZXIgaW5zdGFuY2VcbiAgICAgKiBAcGFyYW0ge3R1aS5jb21wb25lbnQuVGltZVBpY2tlcn0gW29wVGltZVBpY2tlcl0gLSBUaW1lUGlja2VyIGluc3RhbmNlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0VGltZVBpY2tlcjogZnVuY3Rpb24ob3BUaW1lUGlja2VyKSB7XG4gICAgICAgIGlmICghb3BUaW1lUGlja2VyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl90aW1lUGlja2VyID0gb3BUaW1lUGlja2VyO1xuICAgICAgICB0aGlzLl9iaW5kQ3VzdG9tRXZlbnRXaXRoVGltZVBpY2tlcigpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCaW5kIGN1c3RvbSBldmVudCB3aXRoIFRpbWVQaWNrZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9iaW5kQ3VzdG9tRXZlbnRXaXRoVGltZVBpY2tlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvbkNoYW5nZVRpbWVQaWNrZXIgPSB0dWkudXRpbC5iaW5kKHRoaXMuc2V0RGF0ZSwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5vbignb3BlbicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5fdGltZVBpY2tlci5zZXRUaW1lRnJvbUlucHV0RWxlbWVudCh0aGlzLl8kZWxlbWVudCk7XG4gICAgICAgICAgICB0aGlzLl90aW1lUGlja2VyLm9uKCdjaGFuZ2UnLCBvbkNoYW5nZVRpbWVQaWNrZXIpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5vbignY2xvc2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuX3RpbWVQaWNrZXIub2ZmKCdjaGFuZ2UnLCBvbkNoYW5nZVRpbWVQaWNrZXIpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgdmFsaWRhdGlvbiBvZiBhIHllYXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geWVhciAtIHllYXJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSB3aGV0aGVyIHRoZSB5ZWFyIGlzIHZhbGlkIG9yIG5vdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzVmFsaWRZZWFyOiBmdW5jdGlvbih5ZWFyKSB7XG4gICAgICAgIHJldHVybiB0dWkudXRpbC5pc051bWJlcih5ZWFyKSAmJiB5ZWFyID4gQ09OU1RBTlRTLk1JTl9ZRUFSICYmIHllYXIgPCBDT05TVEFOVFMuTUFYX1lFQVI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrIHZhbGlkYXRpb24gb2YgYSBtb250aFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtb250aCAtIG1vbnRoXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IC0gd2hldGhlciB0aGUgbW9udGggaXMgdmFsaWQgb3Igbm90XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNWYWxpZE1vbnRoOiBmdW5jdGlvbihtb250aCkge1xuICAgICAgICByZXR1cm4gdHVpLnV0aWwuaXNOdW1iZXIobW9udGgpICYmIG1vbnRoID4gMCAmJiBtb250aCA8IDEzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayB2YWxpZGF0aW9uIG9mIHZhbHVlcyBpbiBhIGRhdGUgb2JqZWN0IGhhdmluZyB5ZWFyLCBtb250aCwgZGF5LWluLW1vbnRoXG4gICAgICogQHBhcmFtIHtkYXRlSGFzaH0gZGF0ZUhhc2ggLSBkYXRlSGFzaFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSAtIHdoZXRoZXIgdGhlIGRhdGUgb2JqZWN0IGlzIHZhbGlkIG9yIG5vdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzVmFsaWREYXRlOiBmdW5jdGlvbihkYXRlaGFzaCkge1xuICAgICAgICB2YXIgeWVhciwgbW9udGgsIGRhdGUsIGlzTGVhcFllYXIsIGxhc3REYXlJbk1vbnRoLCBpc0JldHdlZW47XG5cbiAgICAgICAgaWYgKCFkYXRlaGFzaCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgeWVhciA9IGRhdGVoYXNoLnllYXI7XG4gICAgICAgIG1vbnRoID0gZGF0ZWhhc2gubW9udGg7XG4gICAgICAgIGRhdGUgPSBkYXRlaGFzaC5kYXRlO1xuICAgICAgICBpc0xlYXBZZWFyID0gKHllYXIgJSA0ID09PSAwKSAmJiAoeWVhciAlIDEwMCAhPT0gMCkgfHwgKHllYXIgJSA0MDAgPT09IDApO1xuICAgICAgICBpZiAoIXRoaXMuX2lzVmFsaWRZZWFyKHllYXIpIHx8ICF0aGlzLl9pc1ZhbGlkTW9udGgobW9udGgpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBsYXN0RGF5SW5Nb250aCA9IENPTlNUQU5UUy5NT05USF9EQVlTW21vbnRoXTtcbiAgICAgICAgaWYgKGlzTGVhcFllYXIgJiYgbW9udGggPT09IDIpIHtcbiAgICAgICAgICAgICAgICBsYXN0RGF5SW5Nb250aCA9IDI5O1xuICAgICAgICB9XG4gICAgICAgIGlzQmV0d2VlbiA9ICEhKHR1aS51dGlsLmlzTnVtYmVyKGRhdGUpICYmIChkYXRlID4gMCkgJiYgKGRhdGUgPD0gbGFzdERheUluTW9udGgpKTtcblxuICAgICAgICByZXR1cm4gaXNCZXR3ZWVuO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBhbiBlbGVtZW50IGlzIGFuIG9wZW5lci5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSB0YXJnZXQgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSAtIG9wZW5lciB0cnVlL2ZhbHNlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNPcGVuZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaCh0aGlzLl9vcGVuZXJzLCBmdW5jdGlvbihvcGVuZXIpIHtcbiAgICAgICAgICAgIGlmICh0YXJnZXQgPT09IG9wZW5lciB8fCAkLmNvbnRhaW5zKG9wZW5lciwgdGFyZ2V0KSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHN0eWxlLXBvc2l0aW9uIG9mIGNhbGVuZGFyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXJyYW5nZUxheWVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHN0eWxlID0gdGhpcy5fJHdyYXBwZXJFbGVtZW50WzBdLnN0eWxlLFxuICAgICAgICAgICAgcG9zID0gdGhpcy5fcG9zO1xuXG4gICAgICAgIHN0eWxlLmxlZnQgPSBwb3MubGVmdCArICdweCc7XG4gICAgICAgIHN0eWxlLnRvcCA9IHBvcy50b3AgKyAncHgnO1xuICAgICAgICBzdHlsZS56SW5kZXggPSBwb3MuekluZGV4O1xuICAgICAgICB0aGlzLl8kd3JhcHBlckVsZW1lbnQuYXBwZW5kKHRoaXMuX2NhbGVuZGFyLiRlbGVtZW50KTtcbiAgICAgICAgaWYgKHRoaXMuX3RpbWVQaWNrZXIpIHtcbiAgICAgICAgICAgIHRoaXMuXyR3cmFwcGVyRWxlbWVudC5hcHBlbmQodGhpcy5fdGltZVBpY2tlci4kdGltZVBpY2tlckVsZW1lbnQpO1xuICAgICAgICAgICAgdGhpcy5fdGltZVBpY2tlci5zaG93KCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGJvdW5kaW5nQ2xpZW50UmVjdCBvZiBhbiBlbGVtZW50XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudHxqUXVlcnl9IFtlbGVtZW50XSAtIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSAtIGFuIG9iamVjdCBoYXZpbmcgbGVmdCwgdG9wLCBib3R0b20sIHJpZ2h0IG9mIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRCb3VuZGluZ0NsaWVudFJlY3Q6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgdmFyIGVsID0gJChlbGVtZW50KVswXSB8fCB0aGlzLl8kZWxlbWVudFswXSxcbiAgICAgICAgICAgIGJvdW5kLFxuICAgICAgICAgICAgY2VpbDtcblxuICAgICAgICBpZiAoIWVsKSB7XG4gICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgIH1cblxuICAgICAgICBib3VuZCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjZWlsID0gTWF0aC5jZWlsO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGVmdDogY2VpbChib3VuZC5sZWZ0KSxcbiAgICAgICAgICAgIHRvcDogY2VpbChib3VuZC50b3ApLFxuICAgICAgICAgICAgYm90dG9tOiBjZWlsKGJvdW5kLmJvdHRvbSksXG4gICAgICAgICAgICByaWdodDogY2VpbChib3VuZC5yaWdodClcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGRhdGUgZnJvbSBzdHJpbmdcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyIC0gZGF0ZSBzdHJpbmdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXREYXRlRnJvbVN0cmluZzogZnVuY3Rpb24oc3RyKSB7XG4gICAgICAgIHZhciBkYXRlID0gdGhpcy5fZXh0cmFjdERhdGUoc3RyKTtcblxuICAgICAgICBpZiAoZGF0ZSAmJiB0aGlzLl9pc1NlbGVjdGFibGUoZGF0ZSkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl90aW1lUGlja2VyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdGltZVBpY2tlci5zZXRUaW1lRnJvbUlucHV0RWxlbWVudCh0aGlzLl8kZWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldERhdGUoZGF0ZS55ZWFyLCBkYXRlLm1vbnRoLCBkYXRlLmRhdGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXREYXRlKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGZvcm1lZCBkYXRlLXN0cmluZyBmcm9tIGRhdGUgb2JqZWN0XG4gICAgICogQHJldHVybiB7c3RyaW5nfSAtIGZvcm1lZCBkYXRlLXN0cmluZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Zvcm1lZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB5ZWFyID0gdGhpcy5fZGF0ZS55ZWFyLFxuICAgICAgICAgICAgbW9udGggPSB0aGlzLl9kYXRlLm1vbnRoLFxuICAgICAgICAgICAgZGF0ZSA9IHRoaXMuX2RhdGUuZGF0ZSxcbiAgICAgICAgICAgIGZvcm0gPSB0aGlzLl9kYXRlRm9ybSxcbiAgICAgICAgICAgIHJlcGxhY2VNYXAsXG4gICAgICAgICAgICBkYXRlU3RyaW5nO1xuXG4gICAgICAgIG1vbnRoID0gbW9udGggPCAxMCA/ICgnMCcgKyBtb250aCkgOiBtb250aDtcbiAgICAgICAgZGF0ZSA9IGRhdGUgPCAxMCA/ICgnMCcgKyBkYXRlKSA6IGRhdGU7XG5cbiAgICAgICAgcmVwbGFjZU1hcCA9IHtcbiAgICAgICAgICAgIHl5eXk6IHllYXIsXG4gICAgICAgICAgICB5eTogU3RyaW5nKHllYXIpLnN1YnN0cigyLCAyKSxcbiAgICAgICAgICAgIG1tOiBtb250aCxcbiAgICAgICAgICAgIG06IE51bWJlcihtb250aCksXG4gICAgICAgICAgICBkZDogZGF0ZSxcbiAgICAgICAgICAgIGQ6IE51bWJlcihkYXRlKVxuICAgICAgICB9O1xuXG4gICAgICAgIGRhdGVTdHJpbmcgPSBmb3JtLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiByZXBsYWNlTWFwW2tleS50b0xvd2VyQ2FzZSgpXSB8fCAnJztcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGRhdGVTdHJpbmc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4dHJhY3QgZGF0ZS1vYmplY3QgZnJvbSBpbnB1dCBzdHJpbmcgd2l0aCBjb21wYXJpbmcgZGF0ZS1mb3JtYXQ8YnI+XG4gICAgICogSWYgY2FuIG5vdCBleHRyYWN0LCByZXR1cm4gZmFsc2VcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyIC0gaW5wdXQgc3RyaW5nKHRleHQpXG4gICAgICogQHJldHVybnMge2RhdGVIYXNofGZhbHNlfSAtIGV4dHJhY3RlZCBkYXRlIG9iamVjdCBvciBmYWxzZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2V4dHJhY3REYXRlOiBmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgdmFyIGZvcm1PcmRlciA9IHRoaXMuX2Zvcm1PcmRlcixcbiAgICAgICAgICAgIHJlc3VsdERhdGUgPSB7fSxcbiAgICAgICAgICAgIHJlZ0V4cCA9IHRoaXMuX3JlZ0V4cDtcblxuICAgICAgICByZWdFeHAubGFzdEluZGV4ID0gMDtcbiAgICAgICAgaWYgKHJlZ0V4cC50ZXN0KHN0cikpIHtcbiAgICAgICAgICAgIHJlc3VsdERhdGVbZm9ybU9yZGVyWzBdXSA9IE51bWJlcihSZWdFeHAuJDEpO1xuICAgICAgICAgICAgcmVzdWx0RGF0ZVtmb3JtT3JkZXJbMV1dID0gTnVtYmVyKFJlZ0V4cC4kMik7XG4gICAgICAgICAgICByZXN1bHREYXRlW2Zvcm1PcmRlclsyXV0gPSBOdW1iZXIoUmVnRXhwLiQzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChTdHJpbmcocmVzdWx0RGF0ZS55ZWFyKS5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgIHJlc3VsdERhdGUueWVhciA9IE51bWJlcih0aGlzLl9kZWZhdWx0Q2VudHVyeSArIHJlc3VsdERhdGUueWVhcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0RGF0ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBhIGRhdGVIYXNoIGlzIHNlbGVjdGFibGVcbiAgICAgKiBAcGFyYW0ge2RhdGVIYXNofSBkYXRlSGFzaCAtIGRhdGVIYXNoXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IC0gV2hldGhlciBhIGRhdGVIYXNoIGlzIHNlbGVjdGFibGVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc1NlbGVjdGFibGU6IGZ1bmN0aW9uKGRhdGVIYXNoKSB7XG4gICAgICAgIHZhciBpblJhbmdlID0gdHJ1ZSxcbiAgICAgICAgICAgIHN0YXJ0VGltZXMsIHN0YXJ0VGltZSwgcmVzdWx0LCB0aW1lc3RhbXA7XG5cbiAgICAgICAgaWYgKCF0aGlzLl9pc1ZhbGlkRGF0ZShkYXRlSGFzaCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXJ0VGltZXMgPSB0aGlzLl9zdGFydFRpbWVzO1xuICAgICAgICB0aW1lc3RhbXAgPSB1dGlscy5nZXRUaW1lKGRhdGVIYXNoKTtcblxuICAgICAgICBpZiAoc3RhcnRUaW1lcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX3NlYXJjaEVuZFRpbWUodGltZXN0YW1wKTtcbiAgICAgICAgICAgIHN0YXJ0VGltZSA9IHN0YXJ0VGltZXNbcmVzdWx0LmluZGV4XTtcbiAgICAgICAgICAgIGluUmFuZ2UgPSByZXN1bHQuZm91bmQgfHwgKHRpbWVzdGFtcCA+PSBzdGFydFRpbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGluUmFuZ2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBzZWxlY3RhYmxlLWNsYXNzLW5hbWUgdG8gc2VsZWN0YWJsZSBkYXRlIGVsZW1lbnQuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudHxqUXVlcnl9IGVsZW1lbnQgLSBkYXRlIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3t5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRhdGU6IG51bWJlcn19IGRhdGVIYXNoIC0gZGF0ZSBvYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRTZWxlY3RhYmxlQ2xhc3NOYW1lOiBmdW5jdGlvbihlbGVtZW50LCBkYXRlSGFzaCkge1xuICAgICAgICBpZiAodGhpcy5faXNTZWxlY3RhYmxlKGRhdGVIYXNoKSkge1xuICAgICAgICAgICAgJChlbGVtZW50KS5hZGRDbGFzcyh0aGlzLl9zZWxlY3RhYmxlQ2xhc3NOYW1lKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgc2VsZWN0ZWQtY2xhc3MtbmFtZSB0byBzZWxlY3RlZCBkYXRlIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fGpRdWVyeX0gZWxlbWVudCAtIGRhdGUgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e3llYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF0ZTogbnVtYmVyfX0gZGF0ZUhhc2ggLSBkYXRlIG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldFNlbGVjdGVkQ2xhc3NOYW1lOiBmdW5jdGlvbihlbGVtZW50LCBkYXRlSGFzaCkge1xuICAgICAgICB2YXIgeWVhciA9IHRoaXMuX2RhdGUueWVhcixcbiAgICAgICAgICAgIG1vbnRoID0gdGhpcy5fZGF0ZS5tb250aCxcbiAgICAgICAgICAgIGRhdGUgPSB0aGlzLl9kYXRlLmRhdGUsXG4gICAgICAgICAgICBpc1NlbGVjdGVkID0gKHllYXIgPT09IGRhdGVIYXNoLnllYXIpICYmIChtb250aCA9PT0gZGF0ZUhhc2gubW9udGgpICYmIChkYXRlID09PSBkYXRlSGFzaC5kYXRlKTtcblxuICAgICAgICBpZiAoaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgJChlbGVtZW50KS5hZGRDbGFzcyh0aGlzLl9zZWxlY3RlZENsYXNzTmFtZSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHZhbHVlIGEgZGF0ZS1zdHJpbmcgb2YgY3VycmVudCB0aGlzIGluc3RhbmNlIHRvIGlucHV0IGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRWYWx1ZVRvSW5wdXRFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGRhdGVTdHJpbmcgPSB0aGlzLl9mb3JtZWQoKSxcbiAgICAgICAgICAgIHRpbWVTdHJpbmcgPSAnJztcblxuICAgICAgICBpZiAodGhpcy5fdGltZVBpY2tlcikge1xuICAgICAgICAgICAgdGltZVN0cmluZyA9IHRoaXMuX3RpbWVQaWNrZXIuZ2V0VGltZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuXyRlbGVtZW50LnZhbChkYXRlU3RyaW5nICsgdGltZVN0cmluZyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldChvciBtYWtlKSBSZWdFeHAgaW5zdGFuY2UgZnJvbSB0aGUgZGF0ZS1mb3JtYXQgb2YgdGhpcyBpbnN0YW5jZS5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRSZWdFeHA6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVnRXhwU3RyID0gJ14nLFxuICAgICAgICAgICAgaW5kZXggPSAwLFxuICAgICAgICAgICAgZm9ybU9yZGVyID0gdGhpcy5fZm9ybU9yZGVyO1xuXG4gICAgICAgIHRoaXMuX2RhdGVGb3JtLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBzdHIudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAgICAgcmVnRXhwU3RyICs9IChtYXBGb3JDb252ZXJ0aW5nW2tleV0uZXhwcmVzc2lvbiArICdbXFxcXERcXFxcc10qJyk7XG4gICAgICAgICAgICBmb3JtT3JkZXJbaW5kZXhdID0gbWFwRm9yQ29udmVydGluZ1trZXldLnR5cGU7XG4gICAgICAgICAgICBpbmRleCArPSAxO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fcmVnRXhwID0gbmV3IFJlZ0V4cChyZWdFeHBTdHIsICdnaScpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgZXZlbnQgaGFuZGxlcnMgdG8gYmluZCBjb250ZXh0IGFuZCB0aGVuIHN0b3JlLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldFByb3h5SGFuZGxlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcHJveGllcyA9IHRoaXMuX3Byb3h5SGFuZGxlcnMsXG4gICAgICAgICAgICBiaW5kID0gdHVpLnV0aWwuYmluZDtcblxuICAgICAgICAvLyBFdmVudCBoYW5kbGVycyBmb3IgZWxlbWVudFxuICAgICAgICBwcm94aWVzLm9uTW91c2Vkb3duRG9jdW1lbnQgPSBiaW5kKHRoaXMuX29uTW91c2Vkb3duRG9jdW1lbnQsIHRoaXMpO1xuICAgICAgICBwcm94aWVzLm9uS2V5ZG93bkVsZW1lbnQgPSBiaW5kKHRoaXMuX29uS2V5ZG93bkVsZW1lbnQsIHRoaXMpO1xuICAgICAgICBwcm94aWVzLm9uQ2xpY2tDYWxlbmRhciA9IGJpbmQodGhpcy5fb25DbGlja0NhbGVuZGFyLCB0aGlzKTtcbiAgICAgICAgcHJveGllcy5vbkNsaWNrT3BlbmVyID0gYmluZCh0aGlzLl9vbkNsaWNrT3BlbmVyLCB0aGlzKTtcblxuICAgICAgICAvLyBFdmVudCBoYW5kbGVycyBmb3IgY3VzdG9tIGV2ZW50IG9mIGNhbGVuZGFyXG4gICAgICAgIHByb3hpZXMub25CZWZvcmVEcmF3Q2FsZW5kYXIgPSBiaW5kKHRoaXMuX29uQmVmb3JlRHJhd0NhbGVuZGFyLCB0aGlzKTtcbiAgICAgICAgcHJveGllcy5vbkRyYXdDYWxlbmRhciA9IGJpbmQodGhpcy5fb25EcmF3Q2FsZW5kYXIsIHRoaXMpO1xuICAgICAgICBwcm94aWVzLm9uQWZ0ZXJEcmF3Q2FsZW5kYXIgPSBiaW5kKHRoaXMuX29uQWZ0ZXJEcmF3Q2FsZW5kYXIsIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFdmVudCBoYW5kbGVyIGZvciBtb3VzZWRvd24gb2YgZG9jdW1lbnQ8YnI+XG4gICAgICogLSBXaGVuIGNsaWNrIHRoZSBvdXQgb2YgbGF5ZXIsIGNsb3NlIHRoZSBsYXllclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gZXZlbnQgb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25Nb3VzZWRvd25Eb2N1bWVudDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyIGlzQ29udGFpbnMgPSAkLmNvbnRhaW5zKHRoaXMuXyR3cmFwcGVyRWxlbWVudFswXSwgZXZlbnQudGFyZ2V0KTtcblxuICAgICAgICBpZiAoKCFpc0NvbnRhaW5zICYmICF0aGlzLl9pc09wZW5lcihldmVudC50YXJnZXQpKSkge1xuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV2ZW50IGhhbmRsZXIgZm9yIGVudGVyLWtleSBkb3duIG9mIGlucHV0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBbZXZlbnRdIC0gZXZlbnQgb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25LZXlkb3duRWxlbWVudDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKCFldmVudCB8fCBldmVudC5rZXlDb2RlICE9PSAxMykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3NldERhdGVGcm9tU3RyaW5nKHRoaXMuXyRlbGVtZW50LnZhbCgpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXZlbnQgaGFuZGxlciBmb3IgY2xpY2sgb2YgY2FsZW5kYXI8YnI+XG4gICAgICogLSBVcGRhdGUgZGF0ZSBmb3JtIGV2ZW50LXRhcmdldFxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gZXZlbnQgb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25DbGlja0NhbGVuZGFyOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LFxuICAgICAgICAgICAgY2xhc3NOYW1lID0gdGFyZ2V0LmNsYXNzTmFtZSxcbiAgICAgICAgICAgIHZhbHVlID0gTnVtYmVyKCh0YXJnZXQuaW5uZXJUZXh0IHx8IHRhcmdldC50ZXh0Q29udGVudCB8fCB0YXJnZXQubm9kZVZhbHVlKSksXG4gICAgICAgICAgICBzaG93bkRhdGUsXG4gICAgICAgICAgICByZWxhdGl2ZU1vbnRoLFxuICAgICAgICAgICAgZGF0ZTtcblxuICAgICAgICBpZiAodmFsdWUgJiYgIWlzTmFOKHZhbHVlKSkge1xuICAgICAgICAgICAgaWYgKGNsYXNzTmFtZS5pbmRleE9mKCdwcmV2LW1vbnRoJykgPiAtMSkge1xuICAgICAgICAgICAgICAgIHJlbGF0aXZlTW9udGggPSAtMTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY2xhc3NOYW1lLmluZGV4T2YoJ25leHQtbW9udGgnKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgcmVsYXRpdmVNb250aCA9IDE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlbGF0aXZlTW9udGggPSAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzaG93bkRhdGUgPSB0aGlzLl9jYWxlbmRhci5nZXREYXRlKCk7XG4gICAgICAgICAgICBzaG93bkRhdGUuZGF0ZSA9IHZhbHVlO1xuICAgICAgICAgICAgZGF0ZSA9IHV0aWxzLmdldFJlbGF0aXZlRGF0ZSgwLCByZWxhdGl2ZU1vbnRoLCAwLCBzaG93bkRhdGUpO1xuICAgICAgICAgICAgdGhpcy5zZXREYXRlKGRhdGUueWVhciwgZGF0ZS5tb250aCwgZGF0ZS5kYXRlKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFdmVudCBoYW5kbGVyIGZvciBjbGljayBvZiBvcGVuZXItZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uQ2xpY2tPcGVuZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLm9wZW4oKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXZlbnQgaGFuZGxlciBmb3IgJ2JlZm9yZURyYXcnLWN1c3RvbSBldmVudCBvZiBjYWxlbmRhclxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHNlZSB7dHVpLmNvbXBvbmVudC5DYWxlbmRhci5kcmF3fVxuICAgICAqL1xuICAgIF9vbkJlZm9yZURyYXdDYWxlbmRhcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX3VuYmluZE9uQ2xpY2tDYWxlbmRhcigpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFdmVudCBoYW5kbGVyIGZvciAnZHJhdyctY3VzdG9tIGV2ZW50IG9mIGNhbGVuZGFyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50RGF0YSAtIGN1c3RvbSBldmVudCBkYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAc2VlIHt0dWkuY29tcG9uZW50LkNhbGVuZGFyLmRyYXd9XG4gICAgICovXG4gICAgX29uRHJhd0NhbGVuZGFyOiBmdW5jdGlvbihldmVudERhdGEpIHtcbiAgICAgICAgdmFyIGRhdGVIYXNoID0ge1xuICAgICAgICAgICAgeWVhcjogZXZlbnREYXRhLnllYXIsXG4gICAgICAgICAgICBtb250aDogZXZlbnREYXRhLm1vbnRoLFxuICAgICAgICAgICAgZGF0ZTogZXZlbnREYXRhLmRhdGVcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5fc2V0U2VsZWN0YWJsZUNsYXNzTmFtZShldmVudERhdGEuJGRhdGVDb250YWluZXIsIGRhdGVIYXNoKTtcbiAgICAgICAgdGhpcy5fc2V0U2VsZWN0ZWRDbGFzc05hbWUoZXZlbnREYXRhLiRkYXRlQ29udGFpbmVyLCBkYXRlSGFzaCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV2ZW50IGhhbmRsZXIgZm9yICdhZnRlckRyYXcnLWN1c3RvbSBldmVudCBvZiBjYWxlbmRhclxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHNlZSB7dHVpLmNvbXBvbmVudC5DYWxlbmRhci5kcmF3fVxuICAgICAqL1xuICAgIF9vbkFmdGVyRHJhd0NhbGVuZGFyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fc2hvd09ubHlWYWxpZEJ1dHRvbnMoKTtcbiAgICAgICAgdGhpcy5fYmluZE9uQ2xpY2tDYWxlbmRhcigpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IG9ubHkgdmFsaWQgYnV0dG9ucyBpbiBjYWxlbmRhclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3Nob3dPbmx5VmFsaWRCdXR0b25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyICRoZWFkZXIgPSB0aGlzLl9jYWxlbmRhci4kaGVhZGVyLFxuICAgICAgICAgICAgJHByZXZZZWFyQnRuID0gJGhlYWRlci5maW5kKCdbY2xhc3MqPVwiYnRuLXByZXYteWVhclwiXScpLmhpZGUoKSxcbiAgICAgICAgICAgICRwcmV2TW9udGhCdG4gPSAkaGVhZGVyLmZpbmQoJ1tjbGFzcyo9XCJidG4tcHJldi1tb250aFwiXScpLmhpZGUoKSxcbiAgICAgICAgICAgICRuZXh0WWVhckJ0biA9ICRoZWFkZXIuZmluZCgnW2NsYXNzKj1cImJ0bi1uZXh0LXllYXJcIl0nKS5oaWRlKCksXG4gICAgICAgICAgICAkbmV4dE1vbnRoQnRuID0gJGhlYWRlci5maW5kKCdbY2xhc3MqPVwiYnRuLW5leHQtbW9udGhcIl0nKS5oaWRlKCksXG4gICAgICAgICAgICBzaG93bkRhdGVIYXNoID0gdGhpcy5fY2FsZW5kYXIuZ2V0RGF0ZSgpLFxuICAgICAgICAgICAgc2hvd25EYXRlID0gbmV3IERhdGUoc2hvd25EYXRlSGFzaC55ZWFyLCBzaG93bkRhdGVIYXNoLm1vbnRoIC0gMSksXG4gICAgICAgICAgICBzdGFydERhdGUgPSBuZXcgRGF0ZSh0aGlzLl9zdGFydFRpbWVzWzBdIHx8IENPTlNUQU5UUy5NSU5fRURHRSkuc2V0RGF0ZSgxKSxcbiAgICAgICAgICAgIGVuZERhdGUgPSBuZXcgRGF0ZSh0aGlzLl9lbmRUaW1lcy5zbGljZSgtMSlbMF0gfHwgQ09OU1RBTlRTLk1BWF9FREdFKS5zZXREYXRlKDEpLC8vIGFyci5zbGljZSgtMSlbMF0gPT09IGFyclthcnIubGVuZ3RoIC0gMV1cbiAgICAgICAgICAgIHN0YXJ0RGlmZmVyZW5jZSA9IHNob3duRGF0ZSAtIHN0YXJ0RGF0ZSxcbiAgICAgICAgICAgIGVuZERpZmZlcmVuY2UgPSBlbmREYXRlIC0gc2hvd25EYXRlO1xuXG4gICAgICAgIGlmIChzdGFydERpZmZlcmVuY2UgPiAwKSB7XG4gICAgICAgICAgICAkcHJldk1vbnRoQnRuLnNob3coKTtcbiAgICAgICAgICAgIGlmIChzdGFydERpZmZlcmVuY2UgPj0gQ09OU1RBTlRTLllFQVJfVE9fTVMpIHtcbiAgICAgICAgICAgICAgICAkcHJldlllYXJCdG4uc2hvdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVuZERpZmZlcmVuY2UgPiAwKSB7XG4gICAgICAgICAgICAkbmV4dE1vbnRoQnRuLnNob3coKTtcbiAgICAgICAgICAgIGlmIChlbmREaWZmZXJlbmNlID49IENPTlNUQU5UUy5ZRUFSX1RPX01TKSB7XG4gICAgICAgICAgICAgICAgJG5leHRZZWFyQnRuLnNob3coKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCaW5kIG9wZW5lci1lbGVtZW50cyBldmVudFxuICAgICAqIEBwYXJhbSB7QXJyYXl9IG9wT3BlbmVycyBbb3B0aW9uLm9wZW5lcnNdIC0gbGlzdCBvZiBvcGVuZXIgZWxlbWVudHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9iaW5kT3BlbmVyRXZlbnQ6IGZ1bmN0aW9uKG9wT3BlbmVycykge1xuICAgICAgICB0aGlzLl9zZXRPcGVuZXJzKG9wT3BlbmVycyk7XG4gICAgICAgIHRoaXMuXyRlbGVtZW50Lm9uKCdrZXlkb3duJywgdGhpcy5fcHJveHlIYW5kbGVycy5vbktleWRvd25FbGVtZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBhIChtb3VzZWRvd258dG91Y2hzdGFydCkgZXZlbnQgb2YgZG9jdW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9iaW5kT25Nb3VzZWRvd25Eb2N1bWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBldmVudFR5cGUgPSAodGhpcy51c2VUb3VjaEV2ZW50KSA/ICd0b3VjaHN0YXJ0JyA6ICdtb3VzZWRvd24nO1xuICAgICAgICAkKGRvY3VtZW50KS5vbihldmVudFR5cGUsIHRoaXMuX3Byb3h5SGFuZGxlcnMub25Nb3VzZWRvd25Eb2N1bWVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVuYmluZCBtb3VzZWRvd24sdG91Y2hzdGFydCBldmVudHMgb2YgZG9jdW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF91bmJpbmRPbk1vdXNlZG93bkRvY3VtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgJChkb2N1bWVudCkub2ZmKCdtb3VzZWRvd24gdG91Y2hzdGFydCcsIHRoaXMuX3Byb3h5SGFuZGxlcnMub25Nb3VzZWRvd25Eb2N1bWVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgY2xpY2sgZXZlbnQgb2YgY2FsZW5kYXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9iaW5kT25DbGlja0NhbGVuZGFyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGhhbmRsZXIgPSB0aGlzLl9wcm94eUhhbmRsZXJzLm9uQ2xpY2tDYWxlbmRhcixcbiAgICAgICAgICAgIGV2ZW50VHlwZSA9ICh0aGlzLnVzZVRvdWNoRXZlbnQpID8gJ3RvdWNoZW5kJyA6ICdjbGljayc7XG4gICAgICAgIHRoaXMuXyR3cmFwcGVyRWxlbWVudC5maW5kKCcuJyArIHRoaXMuX3NlbGVjdGFibGVDbGFzc05hbWUpLm9uKGV2ZW50VHlwZSwgaGFuZGxlcik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVuYmluZCBjbGljayBldmVudCBvZiBjYWxlbmRhclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3VuYmluZE9uQ2xpY2tDYWxlbmRhcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBoYW5kbGVyID0gdGhpcy5fcHJveHlIYW5kbGVycy5vbkNsaWNrQ2FsZW5kYXI7XG4gICAgICAgIHRoaXMuXyR3cmFwcGVyRWxlbWVudC5maW5kKCcuJyArIHRoaXMuX3NlbGVjdGFibGVDbGFzc05hbWUpLm9mZignY2xpY2sgdG91Y2hlbmQnLCBoYW5kbGVyKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBjdXN0b20gZXZlbnQgb2YgY2FsZW5kYXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9iaW5kQ2FsZW5kYXJDdXN0b21FdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwcm94eUhhbmRsZXJzID0gdGhpcy5fcHJveHlIYW5kbGVycyxcbiAgICAgICAgICAgIG9uQmVmb3JlRHJhdyA9IHByb3h5SGFuZGxlcnMub25CZWZvcmVEcmF3Q2FsZW5kYXIsXG4gICAgICAgICAgICBvbkRyYXcgPSBwcm94eUhhbmRsZXJzLm9uRHJhd0NhbGVuZGFyLFxuICAgICAgICAgICAgb25BZnRlckRyYXcgPSBwcm94eUhhbmRsZXJzLm9uQWZ0ZXJEcmF3Q2FsZW5kYXI7XG5cbiAgICAgICAgdGhpcy5fY2FsZW5kYXIub24oe1xuICAgICAgICAgICAgJ2JlZm9yZURyYXcnOiBvbkJlZm9yZURyYXcsXG4gICAgICAgICAgICAnZHJhdyc6IG9uRHJhdyxcbiAgICAgICAgICAgICdhZnRlckRyYXcnOiBvbkFmdGVyRHJhd1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAvKipcbiAgICAqIFVuYmluZCBjdXN0b20gZXZlbnQgb2YgY2FsZW5kYXJcbiAgICAqIEBwcml2YXRlXG4gICAgKi9cbiAgICBfdW5iaW5kQ2FsZW5kYXJDdXN0b21FdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgdmFyIHByb3h5SGFuZGxlcnMgPSB0aGlzLl9wcm94eUhhbmRsZXJzLFxuICAgICAgICAgICBvbkJlZm9yZURyYXcgPSBwcm94eUhhbmRsZXJzLm9uQmVmb3JlRHJhd0NhbGVuZGFyLFxuICAgICAgICAgICBvbkRyYXcgPSBwcm94eUhhbmRsZXJzLm9uRHJhd0NhbGVuZGFyLFxuICAgICAgICAgICBvbkFmdGVyRHJhdyA9IHByb3h5SGFuZGxlcnMub25BZnRlckRyYXdDYWxlbmRhcjtcblxuICAgICAgIHRoaXMuX2NhbGVuZGFyLm9mZih7XG4gICAgICAgICAgICdiZWZvcmVEcmF3Jzogb25CZWZvcmVEcmF3LFxuICAgICAgICAgICAnZHJhdyc6IG9uRHJhdyxcbiAgICAgICAgICAgJ2FmdGVyRHJhdyc6IG9uQWZ0ZXJEcmF3XG4gICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBhIHJhbmdlXG4gICAgICogQGFwaVxuICAgICAqIEBwYXJhbSB7ZGF0ZUhhc2h9IHN0YXJ0SGFzaCAtIFN0YXJ0IGRhdGVIYXNoXG4gICAgICogQHBhcmFtIHtkYXRlSGFzaH0gZW5kSGFzaCAtIEVuZCBkYXRlSGFzaFxuICAgICAqIEBzaW5jZSAxLjIuMFxuICAgICAqIEBleGFtcGxlXG4gICAgICogdmFyIHN0YXJ0ID0ge3llYXI6IDIwMTUsIG1vbnRoOiAyLCBkYXRlOiAzfSxcbiAgICAgKiAgICAgZW5kID0ge3llYXI6IDIwMTUsIG1vbnRoOiAzLCBkYXRlOiA2fTtcbiAgICAgKlxuICAgICAqIGRhdGVwaWNrZXIuYWRkUmFuZ2Uoc3RhcnQsIGVuZCk7XG4gICAgICovXG4gICAgYWRkUmFuZ2U6IGZ1bmN0aW9uKHN0YXJ0SGFzaCwgZW5kSGFzaCkge1xuICAgICAgICBpZiAodGhpcy5faXNWYWxpZERhdGUoc3RhcnRIYXNoKSAmJiB0aGlzLl9pc1ZhbGlkRGF0ZShlbmRIYXNoKSkge1xuICAgICAgICAgICAgdGhpcy5fcmFuZ2VzLnB1c2goW3N0YXJ0SGFzaCwgZW5kSGFzaF0pO1xuICAgICAgICAgICAgdGhpcy5fc2V0U2VsZWN0YWJsZVJhbmdlcygpO1xuICAgICAgICAgICAgdGhpcy5fY2FsZW5kYXIuZHJhdygpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBhIHJhbmdlXG4gICAgICogQHBhcmFtIHtkYXRlSGFzaH0gc3RhcnRIYXNoIC0gU3RhcnQgZGF0ZUhhc2hcbiAgICAgKiBAcGFyYW0ge2RhdGVIYXNofSBlbmRIYXNoIC0gRW5kIGRhdGVIYXNoXG4gICAgICogQHNpbmNlIDEuMi4wXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgc3RhcnQgPSB7eWVhcjogMjAxNSwgbW9udGg6IDIsIGRhdGU6IDN9LFxuICAgICAqICAgICBlbmQgPSB7eWVhcjogMjAxNSwgbW9udGg6IDMsIGRhdGU6IDZ9O1xuICAgICAqXG4gICAgICogZGF0ZXBpY2tlci5hZGRSYW5nZShzdGFydCwgZW5kKTtcbiAgICAgKiBkYXRlcGlja2VyLnJlbW92ZVJhbmdlKHN0YXJ0LCBlbmQpO1xuICAgICAqL1xuICAgIHJlbW92ZVJhbmdlOiBmdW5jdGlvbihzdGFydEhhc2gsIGVuZEhhc2gpIHtcbiAgICAgICAgdmFyIHJhbmdlcyA9IHRoaXMuX3JhbmdlcyxcbiAgICAgICAgICAgIHRhcmdldCA9IFtzdGFydEhhc2gsIGVuZEhhc2hdO1xuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2gocmFuZ2VzLCBmdW5jdGlvbihyYW5nZSwgaW5kZXgpIHtcbiAgICAgICAgICAgIGlmICh0dWkudXRpbC5jb21wYXJlSlNPTih0YXJnZXQsIHJhbmdlKSkge1xuICAgICAgICAgICAgICAgIHJhbmdlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX3NldFNlbGVjdGFibGVSYW5nZXMoKTtcbiAgICAgICAgdGhpcy5fY2FsZW5kYXIuZHJhdygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgcG9zaXRpb24tbGVmdCwgdG9wIG9mIGNhbGVuZGFyXG4gICAgICogQGFwaVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gcG9zaXRpb24tbGVmdFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gcG9zaXRpb24tdG9wXG4gICAgICogQHNpbmNlIDEuMS4xXG4gICAgICovXG4gICAgc2V0WFk6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgdmFyIHBvcyA9IHRoaXMuX3BvcyxcbiAgICAgICAgICAgIGlzTnVtYmVyID0gdHVpLnV0aWwuaXNOdW1iZXI7XG5cbiAgICAgICAgcG9zLmxlZnQgPSBpc051bWJlcih4KSA/IHggOiBwb3MubGVmdDtcbiAgICAgICAgcG9zLnRvcCA9IGlzTnVtYmVyKHkpID8geSA6IHBvcy50b3A7XG4gICAgICAgIHRoaXMuX2FycmFuZ2VMYXllcigpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgei1pbmRleCBvZiBjYWxlbmRhclxuICAgICAqIEBhcGlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gekluZGV4IC0gei1pbmRleCB2YWx1ZVxuICAgICAqIEBzaW5jZSAxLjEuMVxuICAgICAqL1xuICAgIHNldFpJbmRleDogZnVuY3Rpb24oekluZGV4KSB7XG4gICAgICAgIGlmICghdHVpLnV0aWwuaXNOdW1iZXIoekluZGV4KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fcG9zLnpJbmRleCA9IHpJbmRleDtcbiAgICAgICAgdGhpcy5fYXJyYW5nZUxheWVyKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGFkZCBvcGVuZXJcbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudHxqUXVlcnl8c3RyaW5nfSBvcGVuZXIgLSBlbGVtZW50IG9yIHNlbGVjdG9yXG4gICAgICovXG4gICAgYWRkT3BlbmVyOiBmdW5jdGlvbihvcGVuZXIpIHtcbiAgICAgICAgdmFyIGV2ZW50VHlwZSA9ICh0aGlzLnVzZVRvdWNoRXZlbnQpID8gJ3RvdWNoZW5kJyA6ICdjbGljaycsXG4gICAgICAgICAgICAkb3BlbmVyID0gJChvcGVuZXIpO1xuXG4gICAgICAgIG9wZW5lciA9ICRvcGVuZXJbMF07XG4gICAgICAgIGlmIChvcGVuZXIgJiYgaW5BcnJheShvcGVuZXIsIHRoaXMuX29wZW5lcnMpIDwgMCkge1xuICAgICAgICAgICAgdGhpcy5fb3BlbmVycy5wdXNoKG9wZW5lcik7XG4gICAgICAgICAgICAkb3BlbmVyLm9uKGV2ZW50VHlwZSwgdGhpcy5fcHJveHlIYW5kbGVycy5vbkNsaWNrT3BlbmVyKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZW1vdmUgb3BlbmVyXG4gICAgICogQGFwaVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR8alF1ZXJ5fHN0cmluZ30gb3BlbmVyIC0gZWxlbWVudCBvciBzZWxlY3RvclxuICAgICAqL1xuICAgIHJlbW92ZU9wZW5lcjogZnVuY3Rpb24ob3BlbmVyKSB7XG4gICAgICAgIHZhciAkb3BlbmVyID0gJChvcGVuZXIpLFxuICAgICAgICAgICAgaW5kZXggPSBpbkFycmF5KCRvcGVuZXJbMF0sIHRoaXMuX29wZW5lcnMpO1xuXG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAkb3BlbmVyLm9mZignY2xpY2sgdG91Y2hlbmQnLCB0aGlzLl9wcm94eUhhbmRsZXJzLm9uQ2xpY2tPcGVuZXIpO1xuICAgICAgICAgICAgdGhpcy5fb3BlbmVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE9wZW4gY2FsZW5kYXIgd2l0aCBhcnJhbmdpbmcgcG9zaXRpb25cbiAgICAgKiBAYXBpXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBkYXRlcGlja2VyLm9wZW4oKTtcbiAgICAgKi9cbiAgICBvcGVuOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNPcGVuZWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fYXJyYW5nZUxheWVyKCk7XG4gICAgICAgIHRoaXMuX2JpbmRDYWxlbmRhckN1c3RvbUV2ZW50KCk7XG4gICAgICAgIHRoaXMuX2NhbGVuZGFyLmRyYXcodGhpcy5fZGF0ZS55ZWFyLCB0aGlzLl9kYXRlLm1vbnRoLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuXyR3cmFwcGVyRWxlbWVudC5zaG93KCk7XG4gICAgICAgIGlmICghdGhpcy5zaG93QWx3YXlzKSB7XG4gICAgICAgICAgICB0aGlzLl9iaW5kT25Nb3VzZWRvd25Eb2N1bWVudCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBhcGlcbiAgICAgICAgICogQGV2ZW50IERhdGVQaWNrZXIjb3BlblxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKiBkYXRlUGlja2VyLm9uKCdvcGVuJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAqICAgICBhbGVydCgnb3BlbicpO1xuICAgICAgICAgKiB9KTtcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZmlyZSgnb3BlbicpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDbG9zZSBjYWxlbmRhciB3aXRoIHVuYmluZGluZyBzb21lIGV2ZW50c1xuICAgICAqIEBhcGlcbiAgICAgKiBAZXhtYXBsZVxuICAgICAqIGRhdGVwaWNrZXIuY2xvc2UoKTtcbiAgICAgKi9cbiAgICBjbG9zZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5pc09wZW5lZCgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fdW5iaW5kQ2FsZW5kYXJDdXN0b21FdmVudCgpO1xuICAgICAgICB0aGlzLl91bmJpbmRPbk1vdXNlZG93bkRvY3VtZW50KCk7XG4gICAgICAgIHRoaXMuXyR3cmFwcGVyRWxlbWVudC5oaWRlKCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENsb3NlIGV2ZW50IC0gRGF0ZVBpY2tlclxuICAgICAgICAgKiBAYXBpXG4gICAgICAgICAqIEBldmVudCBEYXRlUGlja2VyI2Nsb3NlXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqIGRhdGVQaWNrZXIub24oJ2Nsb3NlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAqICAgICBhbGVydCgnY2xvc2UnKTtcbiAgICAgICAgICogfSk7XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmZpcmUoJ2Nsb3NlJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBkYXRlLW9iamVjdCBvZiBjdXJyZW50IERhdGVQaWNrZXIgaW5zdGFuY2UuXG4gICAgICogQGFwaVxuICAgICAqIEByZXR1cm5zIHtkYXRlSGFzaH0gLSBkYXRlSGFzaCBoYXZpbmcgeWVhciwgbW9udGggYW5kIGRheS1pbi1tb250aFxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gMjAxNS0wNC0xM1xuICAgICAqIGRhdGVwaWNrZXIuZ2V0RGF0ZUhhc2goKTsgLy8ge3llYXI6IDIwMTUsIG1vbnRoOiA0LCBkYXRlOiAxM31cbiAgICAgKi9cbiAgICBnZXREYXRlSGFzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0dWkudXRpbC5leHRlbmQoe30sIHRoaXMuX2RhdGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4geWVhclxuICAgICAqIEBhcGlcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSAtIHllYXJcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIDIwMTUtMDQtMTNcbiAgICAgKiBkYXRlcGlja2VyLmdldFllYXIoKTsgLy8gMjAxNVxuICAgICAqL1xuICAgIGdldFllYXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGF0ZS55ZWFyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gbW9udGhcbiAgICAgKiBAYXBpXG4gICAgICogQHJldHVybnMge251bWJlcn0gLSBtb250aFxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gMjAxNS0wNC0xM1xuICAgICAqIGRhdGVwaWNrZXIuZ2V0TW9udGgoKTsgLy8gNFxuICAgICAqL1xuICAgIGdldE1vbnRoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGUubW9udGg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBkYXktaW4tbW9udGhcbiAgICAgKiBAYXBpXG4gICAgICogQHJldHVybnMge251bWJlcn0gLSBkYXktaW4tbW9udGhcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIDIwMTUtMDQtMTNcbiAgICAgKiBkYXRlcGlja2VyLmdldERheUluTW9udGgoKTsgLy8gMTNcbiAgICAgKi9cbiAgICBnZXREYXlJbk1vbnRoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGUuZGF0ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGRhdGUgZnJvbSB2YWx1ZXMoeWVhciwgbW9udGgsIGRhdGUpIGFuZCB0aGVuIGZpcmUgJ3VwZGF0ZScgY3VzdG9tIGV2ZW50XG4gICAgICogQGFwaVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW3llYXJdIC0geWVhclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW21vbnRoXSAtIG1vbnRoXG4gICAgICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbZGF0ZV0gLSBkYXkgaW4gbW9udGhcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGRhdGVwaWNrZXIuc2V0RGF0ZSgyMDE0LCAxMiwgMyk7IC8vIDIwMTQtMTItIDAzXG4gICAgICogZGF0ZXBpY2tlci5zZXREYXRlKG51bGwsIDExLCAyMyk7IC8vIDIwMTQtMTEtMjNcbiAgICAgKiBkYXRlcGlja2VyLnNldERhdGUoJzIwMTUnLCAnNScsIDMpOyAvLyAyMDE1LTA1LTAzXG4gICAgICovXG4gICAgc2V0RGF0ZTogZnVuY3Rpb24oeWVhciwgbW9udGgsIGRhdGUpIHtcbiAgICAgICAgdmFyIGRhdGVPYmogPSB0aGlzLl9kYXRlLFxuICAgICAgICAgICAgbmV3RGF0ZU9iaiA9IHt9O1xuXG4gICAgICAgIG5ld0RhdGVPYmoueWVhciA9IHllYXIgfHwgZGF0ZU9iai55ZWFyO1xuICAgICAgICBuZXdEYXRlT2JqLm1vbnRoID0gbW9udGggfHwgZGF0ZU9iai5tb250aDtcbiAgICAgICAgbmV3RGF0ZU9iai5kYXRlID0gZGF0ZSB8fCBkYXRlT2JqLmRhdGU7XG5cbiAgICAgICAgaWYgKHRoaXMuX2lzU2VsZWN0YWJsZShuZXdEYXRlT2JqKSkge1xuICAgICAgICAgICAgdHVpLnV0aWwuZXh0ZW5kKGRhdGVPYmosIG5ld0RhdGVPYmopO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3NldFZhbHVlVG9JbnB1dEVsZW1lbnQoKTtcbiAgICAgICAgdGhpcy5fY2FsZW5kYXIuZHJhdyhkYXRlT2JqLnllYXIsIGRhdGVPYmoubW9udGgsIGZhbHNlKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVXBkYXRlIGV2ZW50XG4gICAgICAgICAqIEBhcGlcbiAgICAgICAgICogQGV2ZW50IERhdGVQaWNrZXIjdXBkYXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmZpcmUoJ3VwZGF0ZScpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgb3IgdXBkYXRlIGRhdGUtZm9ybVxuICAgICAqIEBhcGlcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW2Zvcm1dIC0gZGF0ZS1mb3JtYXRcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGRhdGVwaWNrZXIuc2V0RGF0ZUZvcm0oJ3l5eXktbW0tZGQnKTtcbiAgICAgKiBkYXRlcGlja2VyLnNldERhdGVGb3JtKCdtbS1kZCwgeXl5eScpO1xuICAgICAqIGRhdGVwaWNrZXIuc2V0RGF0ZUZvcm0oJ3kvbS9kJyk7XG4gICAgICogZGF0ZXBpY2tlci5zZXREYXRlRm9ybSgneXkvbW0vZGQnKTtcbiAgICAgKi9cbiAgICBzZXREYXRlRm9ybTogZnVuY3Rpb24oZm9ybSkge1xuICAgICAgICB0aGlzLl9kYXRlRm9ybSA9IGZvcm0gfHwgdGhpcy5fZGF0ZUZvcm07XG4gICAgICAgIHRoaXMuX3NldFJlZ0V4cCgpO1xuICAgICAgICB0aGlzLnNldERhdGUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHdoZXRoZXIgdGhlIGNhbGVuZGFyIGlzIG9wZW5lZCBvciBub3RcbiAgICAgKiBAYXBpXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IC0gdHJ1ZSBpZiBvcGVuZWQsIGZhbHNlIG90aGVyd2lzZVxuICAgICAqIEBleGFtcGxlXG4gICAgICogZGF0ZXBpY2tlci5jbG9zZSgpO1xuICAgICAqIGRhdGVwaWNrZXIuaXNPcGVuZWQoKTsgLy8gZmFsc2VcbiAgICAgKlxuICAgICAqIGRhdGVwaWNrZXIub3BlbigpO1xuICAgICAqIGRhdGVwaWNrZXIuaXNPcGVuZWQoKTsgLy8gdHJ1ZVxuICAgICAqL1xuICAgIGlzT3BlbmVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLl8kd3JhcHBlckVsZW1lbnQuY3NzKCdkaXNwbGF5JykgPT09ICdibG9jaycpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gVGltZVBpY2tlciBpbnN0YW5jZVxuICAgICAqIEBhcGlcbiAgICAgKiBAcmV0dXJucyB7VGltZVBpY2tlcn0gLSBUaW1lUGlja2VyIGluc3RhbmNlXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgdGltZXBpY2tlciA9IHRoaXMuZ2V0VGltZXBpY2tlcigpO1xuICAgICAqL1xuICAgIGdldFRpbWVQaWNrZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdGltZVBpY2tlcjtcbiAgICB9XG59KTtcblxudHVpLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKERhdGVQaWNrZXIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERhdGVQaWNrZXI7XG5cbiIsIi8qKlxuICogQ3JlYXRlZCBieSBuaG5lbnQgb24gMTUuIDQuIDI4Li5cbiAqIEBmaWxlb3ZlcnZpZXcgU3BpbmJveCBDb21wb25lbnRcbiAqIEBhdXRob3IgTkhOIGVudCBGRSBkZXYgPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT4gPG1pbmt5dS55aUBuaG5lbnQuY29tPlxuICogQGRlcGVuZGVuY3kganF1ZXJ5LTEuOC4zLCBjb2RlLXNuaXBwZXQtMS4wLjJcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciB1dGlsID0gdHVpLnV0aWwsXG4gICAgaW5BcnJheSA9IHV0aWwuaW5BcnJheTtcblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xIVE1MRWxlbWVudH0gY29udGFpbmVyIC0gY29udGFpbmVyIG9mIHNwaW5ib3hcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uXSAtIG9wdGlvbiBmb3IgaW5pdGlhbGl6YXRpb25cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbi5kZWZhdWx0VmFsdWUgPSAwXSAtIGluaXRpYWwgc2V0dGluZyB2YWx1ZVxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24uc3RlcCA9IDFdIC0gaWYgc3RlcCA9IDIsIHZhbHVlIDogMCAtPiAyIC0+IDQgLT4gLi4uXG4gKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbi5tYXggPSA5MDA3MTk5MjU0NzQwOTkxXSAtIG1heCB2YWx1ZVxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24ubWluID0gLTkwMDcxOTkyNTQ3NDA5OTFdIC0gbWluIHZhbHVlXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbi51cEJ0blRhZyA9IGJ1dHRvbiBIVE1MXSAtIHVwIGJ1dHRvbiBodG1sIHN0cmluZ1xuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb24uZG93bkJ0blRhZyA9IGJ1dHRvbiBIVE1MXSAtIGRvd24gYnV0dG9uIGh0bWwgc3RyaW5nXG4gKiBAcGFyYW0ge0FycmF5fSAgW29wdGlvbi5leGNsdXNpb24gPSBbXV0gLSB2YWx1ZSB0byBiZSBleGNsdWRlZC4gaWYgdGhpcyBpcyBbMSwzXSwgMCAtPiAyIC0+IDQgLT4gNSAtPi4uLi5cbiAqL1xudmFyIFNwaW5ib3ggPSB1dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgU3BpbmJveC5wcm90b3R5cGUgKi8ge1xuICAgIGluaXQ6IGZ1bmN0aW9uKGNvbnRhaW5lciwgb3B0aW9uKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7alF1ZXJ5fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fJGNvbnRhaW5lckVsZW1lbnQgPSAkKGNvbnRhaW5lcik7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtqUXVlcnl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl8kaW5wdXRFbGVtZW50ID0gdGhpcy5fJGNvbnRhaW5lckVsZW1lbnQuZmluZCgnaW5wdXRbdHlwZT1cInRleHRcIl0nKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3ZhbHVlID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge09iamVjdH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX29wdGlvbiA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtqUXVlcnl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl8kdXBCdXR0b24gPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7alF1ZXJ5fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fJGRvd25CdXR0b24gPSBudWxsO1xuXG4gICAgICAgIHRoaXMuX2luaXRpYWxpemUob3B0aW9uKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSB3aXRoIG9wdGlvblxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb24gLSBPcHRpb24gZm9yIEluaXRpYWxpemF0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIHRoaXMuX3NldE9wdGlvbihvcHRpb24pO1xuICAgICAgICB0aGlzLl9hc3NpZ25IVE1MRWxlbWVudHMoKTtcbiAgICAgICAgdGhpcy5fYXNzaWduRGVmYXVsdEV2ZW50cygpO1xuICAgICAgICB0aGlzLnNldFZhbHVlKHRoaXMuX29wdGlvbi5kZWZhdWx0VmFsdWUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgYSBvcHRpb24gdG8gaW5zdGFuY2VcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uIC0gT3B0aW9uIHRoYXQgeW91IHdhbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRPcHRpb246IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICB0aGlzLl9vcHRpb24gPSB7XG4gICAgICAgICAgICBkZWZhdWx0VmFsdWU6IDAsXG4gICAgICAgICAgICBzdGVwOiAxLFxuICAgICAgICAgICAgbWF4OiBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUiB8fCA5MDA3MTk5MjU0NzQwOTkxLFxuICAgICAgICAgICAgbWluOiBOdW1iZXIuTUlOX1NBRkVfSU5URUdFUiB8fCAtOTAwNzE5OTI1NDc0MDk5MSxcbiAgICAgICAgICAgIHVwQnRuVGFnOiAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCI+PGI+KzwvYj48L2J1dHRvbj4nLFxuICAgICAgICAgICAgZG93bkJ0blRhZzogJzxidXR0b24gdHlwZT1cImJ1dHRvblwiPjxiPi08L2I+PC9idXR0b24+J1xuICAgICAgICB9O1xuICAgICAgICB1dGlsLmV4dGVuZCh0aGlzLl9vcHRpb24sIG9wdGlvbik7XG5cbiAgICAgICAgaWYgKCF1dGlsLmlzQXJyYXkodGhpcy5fb3B0aW9uLmV4Y2x1c2lvbikpIHtcbiAgICAgICAgICAgIHRoaXMuX29wdGlvbi5leGNsdXNpb24gPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5faXNWYWxpZE9wdGlvbigpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NwaW5ib3ggb3B0aW9uIGlzIGludmFpbGQnKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBpcyBhIHZhbGlkIG9wdGlvbj9cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNWYWxpZE9wdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcHQgPSB0aGlzLl9vcHRpb247XG5cbiAgICAgICAgcmV0dXJuICh0aGlzLl9pc1ZhbGlkVmFsdWUob3B0LmRlZmF1bHRWYWx1ZSkgJiYgdGhpcy5faXNWYWxpZFN0ZXAob3B0LnN0ZXApKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogaXMgYSB2YWxpZCB2YWx1ZT9cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgZm9yIHNwaW5ib3hcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNWYWxpZFZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICB2YXIgb3B0LFxuICAgICAgICAgICAgaXNCZXR3ZWVuLFxuICAgICAgICAgICAgaXNOb3RJbkFycmF5O1xuXG4gICAgICAgIGlmICghdXRpbC5pc051bWJlcih2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIG9wdCA9IHRoaXMuX29wdGlvbjtcbiAgICAgICAgaXNCZXR3ZWVuID0gdmFsdWUgPD0gb3B0Lm1heCAmJiB2YWx1ZSA+PSBvcHQubWluO1xuICAgICAgICBpc05vdEluQXJyYXkgPSAoaW5BcnJheSh2YWx1ZSwgb3B0LmV4Y2x1c2lvbikgPT09IC0xKTtcblxuICAgICAgICByZXR1cm4gKGlzQmV0d2VlbiAmJiBpc05vdEluQXJyYXkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBpcyBhIHZhbGlkIHN0ZXA/XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0ZXAgZm9yIHNwaW5ib3ggdXAvZG93blxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc1ZhbGlkU3RlcDogZnVuY3Rpb24oc3RlcCkge1xuICAgICAgICB2YXIgbWF4U3RlcCA9ICh0aGlzLl9vcHRpb24ubWF4IC0gdGhpcy5fb3B0aW9uLm1pbik7XG5cbiAgICAgICAgcmV0dXJuICh1dGlsLmlzTnVtYmVyKHN0ZXApICYmIHN0ZXAgPCBtYXhTdGVwKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXNzaWduIGVsZW1lbnRzIHRvIGluc2lkZSBvZiBjb250YWluZXIuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXNzaWduSFRNTEVsZW1lbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fc2V0SW5wdXRTaXplQW5kTWF4TGVuZ3RoKCk7XG4gICAgICAgIHRoaXMuX21ha2VCdXR0b24oKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTWFrZSB1cC9kb3duIGJ1dHRvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJGlucHV0ID0gdGhpcy5fJGlucHV0RWxlbWVudCxcbiAgICAgICAgICAgICR1cEJ0biA9IHRoaXMuXyR1cEJ1dHRvbiA9ICQodGhpcy5fb3B0aW9uLnVwQnRuVGFnKSxcbiAgICAgICAgICAgICRkb3duQnRuID0gdGhpcy5fJGRvd25CdXR0b24gPSAkKHRoaXMuX29wdGlvbi5kb3duQnRuVGFnKTtcblxuICAgICAgICAkdXBCdG4uaW5zZXJ0QmVmb3JlKCRpbnB1dCk7XG4gICAgICAgICR1cEJ0bi53cmFwKCc8ZGl2PjwvZGl2PicpO1xuICAgICAgICAkZG93bkJ0bi5pbnNlcnRBZnRlcigkaW5wdXQpO1xuICAgICAgICAkZG93bkJ0bi53cmFwKCc8ZGl2PjwvZGl2PicpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgc2l6ZS9tYXhsZW5ndGggYXR0cmlidXRlcyBvZiBpbnB1dCBlbGVtZW50LlxuICAgICAqIERlZmF1bHQgdmFsdWUgaXMgYSBkaWdpdHMgb2YgYSBsb25nZXIgdmFsdWUgb2Ygb3B0aW9uLm1pbiBvciBvcHRpb24ubWF4XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0SW5wdXRTaXplQW5kTWF4TGVuZ3RoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyICRpbnB1dCA9IHRoaXMuXyRpbnB1dEVsZW1lbnQsXG4gICAgICAgICAgICBtaW5WYWx1ZUxlbmd0aCA9IFN0cmluZyh0aGlzLl9vcHRpb24ubWluKS5sZW5ndGgsXG4gICAgICAgICAgICBtYXhWYWx1ZUxlbmd0aCA9IFN0cmluZyh0aGlzLl9vcHRpb24ubWF4KS5sZW5ndGgsXG4gICAgICAgICAgICBtYXhsZW5ndGggPSBNYXRoLm1heChtaW5WYWx1ZUxlbmd0aCwgbWF4VmFsdWVMZW5ndGgpO1xuXG4gICAgICAgIGlmICghJGlucHV0LmF0dHIoJ3NpemUnKSkge1xuICAgICAgICAgICAgJGlucHV0LmF0dHIoJ3NpemUnLCBtYXhsZW5ndGgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghJGlucHV0LmF0dHIoJ21heGxlbmd0aCcpKSB7XG4gICAgICAgICAgICAkaW5wdXQuYXR0cignbWF4bGVuZ3RoJywgbWF4bGVuZ3RoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBc3NpZ24gZGVmYXVsdCBldmVudHMgdG8gdXAvZG93biBidXR0b25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hc3NpZ25EZWZhdWx0RXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9uQ2xpY2sgPSB1dGlsLmJpbmQodGhpcy5fb25DbGlja0J1dHRvbiwgdGhpcyksXG4gICAgICAgICAgICBvbktleURvd24gPSB1dGlsLmJpbmQodGhpcy5fb25LZXlEb3duSW5wdXRFbGVtZW50LCB0aGlzKTtcblxuICAgICAgICB0aGlzLl8kdXBCdXR0b24ub24oJ2NsaWNrJywge2lzRG93bjogZmFsc2V9LCBvbkNsaWNrKTtcbiAgICAgICAgdGhpcy5fJGRvd25CdXR0b24ub24oJ2NsaWNrJywge2lzRG93bjogdHJ1ZX0sIG9uQ2xpY2spO1xuICAgICAgICB0aGlzLl8kaW5wdXRFbGVtZW50Lm9uKCdrZXlkb3duJywgb25LZXlEb3duKTtcbiAgICAgICAgdGhpcy5fJGlucHV0RWxlbWVudC5vbignY2hhbmdlJywgdXRpbC5iaW5kKHRoaXMuX29uQ2hhbmdlSW5wdXQsIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGlucHV0IHZhbHVlIHdoZW4gdXNlciBjbGljayBhIGJ1dHRvbi5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzRG93biAtIElmIGEgdXNlciBjbGlja2VkIGEgZG93bi1idXR0dG9uLCB0aGlzIHZhbHVlIGlzIHRydWUuICBFbHNlIGlmIGEgdXNlciBjbGlja2VkIGEgdXAtYnV0dG9uLCB0aGlzIHZhbHVlIGlzIGZhbHNlLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldE5leHRWYWx1ZTogZnVuY3Rpb24oaXNEb3duKSB7XG4gICAgICAgIHZhciBvcHQgPSB0aGlzLl9vcHRpb24sXG4gICAgICAgICAgICBzdGVwID0gb3B0LnN0ZXAsXG4gICAgICAgICAgICBtaW4gPSBvcHQubWluLFxuICAgICAgICAgICAgbWF4ID0gb3B0Lm1heCxcbiAgICAgICAgICAgIGV4Y2x1c2lvbiA9IG9wdC5leGNsdXNpb24sXG4gICAgICAgICAgICBuZXh0VmFsdWUgPSB0aGlzLmdldFZhbHVlKCk7XG5cbiAgICAgICAgaWYgKGlzRG93bikge1xuICAgICAgICAgICAgc3RlcCA9IC1zdGVwO1xuICAgICAgICB9XG5cbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgbmV4dFZhbHVlICs9IHN0ZXA7XG4gICAgICAgICAgICBpZiAobmV4dFZhbHVlID4gbWF4KSB7XG4gICAgICAgICAgICAgICAgbmV4dFZhbHVlID0gbWluO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuZXh0VmFsdWUgPCBtaW4pIHtcbiAgICAgICAgICAgICAgICBuZXh0VmFsdWUgPSBtYXg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gd2hpbGUgKGluQXJyYXkobmV4dFZhbHVlLCBleGNsdXNpb24pID4gLTEpO1xuXG4gICAgICAgIHRoaXMuc2V0VmFsdWUobmV4dFZhbHVlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRE9NKFVwL0Rvd24gYnV0dG9uKSBDbGljayBFdmVudCBoYW5kbGVyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgZXZlbnQtb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25DbGlja0J1dHRvbjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdGhpcy5fc2V0TmV4dFZhbHVlKGV2ZW50LmRhdGEuaXNEb3duKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRE9NKElucHV0IGVsZW1lbnQpIEtleWRvd24gRXZlbnQgaGFuZGxlclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IGV2ZW50LW9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uS2V5RG93bklucHV0RWxlbWVudDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyIGtleUNvZGUgPSBldmVudC53aGljaCB8fCBldmVudC5rZXlDb2RlLFxuICAgICAgICAgICAgaXNEb3duO1xuICAgICAgICBzd2l0Y2ggKGtleUNvZGUpIHtcbiAgICAgICAgICAgIGNhc2UgMzg6IGlzRG93biA9IGZhbHNlOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNDA6IGlzRG93biA9IHRydWU7IGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDogcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fc2V0TmV4dFZhbHVlKGlzRG93bik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIERPTShJbnB1dCBlbGVtZW50KSBDaGFuZ2UgRXZlbnQgaGFuZGxlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uQ2hhbmdlSW5wdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbmV3VmFsdWUgPSBOdW1iZXIodGhpcy5fJGlucHV0RWxlbWVudC52YWwoKSksXG4gICAgICAgICAgICBpc0NoYW5nZSA9IHRoaXMuX2lzVmFsaWRWYWx1ZShuZXdWYWx1ZSkgJiYgdGhpcy5fdmFsdWUgIT09IG5ld1ZhbHVlLFxuICAgICAgICAgICAgbmV4dFZhbHVlID0gKGlzQ2hhbmdlKSA/IG5ld1ZhbHVlIDogdGhpcy5fdmFsdWU7XG5cbiAgICAgICAgdGhpcy5fdmFsdWUgPSBuZXh0VmFsdWU7XG4gICAgICAgIHRoaXMuXyRpbnB1dEVsZW1lbnQudmFsKG5leHRWYWx1ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCBzdGVwIG9mIHNwaW5ib3hcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RlcCBmb3Igc3BpbmJveFxuICAgICAqL1xuICAgIHNldFN0ZXA6IGZ1bmN0aW9uKHN0ZXApIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pc1ZhbGlkU3RlcChzdGVwKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX29wdGlvbi5zdGVwID0gc3RlcDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogZ2V0IHN0ZXAgb2Ygc3BpbmJveFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHN0ZXBcbiAgICAgKi9cbiAgICBnZXRTdGVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbi5zdGVwO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gYSBpbnB1dCB2YWx1ZS5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBEYXRhIGluIGlucHV0LWJveFxuICAgICAqL1xuICAgIGdldFZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgYSB2YWx1ZSB0byBpbnB1dC1ib3guXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gVmFsdWUgdGhhdCB5b3Ugd2FudFxuICAgICAqL1xuICAgIHNldFZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICB0aGlzLl8kaW5wdXRFbGVtZW50LnZhbCh2YWx1ZSkuY2hhbmdlKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBhIG9wdGlvbiBvZiBpbnN0YW5jZS5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBPcHRpb24gb2YgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBnZXRPcHRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9uO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgdmFsdWUgdGhhdCB3aWxsIGJlIGV4Y2x1ZGVkLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIFZhbHVlIHRoYXQgd2lsbCBiZSBleGNsdWRlZC5cbiAgICAgKi9cbiAgICBhZGRFeGNsdXNpb246IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHZhciBleGNsdXNpb24gPSB0aGlzLl9vcHRpb24uZXhjbHVzaW9uO1xuXG4gICAgICAgIGlmIChpbkFycmF5KHZhbHVlLCBleGNsdXNpb24pID4gLTEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBleGNsdXNpb24ucHVzaCh2YWx1ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBhIHZhbHVlIHdoaWNoIHdhcyBleGNsdWRlZC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBWYWx1ZSB0aGF0IHdpbGwgYmUgcmVtb3ZlZCBmcm9tIGEgZXhjbHVzaW9uIGxpc3Qgb2YgaW5zdGFuY2VcbiAgICAgKi9cbiAgICByZW1vdmVFeGNsdXNpb246IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHZhciBleGNsdXNpb24gPSB0aGlzLl9vcHRpb24uZXhjbHVzaW9uLFxuICAgICAgICAgICAgaW5kZXggPSBpbkFycmF5KHZhbHVlLCBleGNsdXNpb24pO1xuXG4gICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBleGNsdXNpb24uc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogZ2V0IGNvbnRhaW5lciBlbGVtZW50XG4gICAgICogQHJldHVybiB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKi9cbiAgICBnZXRDb250YWluZXJFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuXyRjb250YWluZXJFbGVtZW50WzBdO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNwaW5ib3g7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGltZVBpY2tlciBDb21wb25lbnRcbiAqIEBhdXRob3IgTkhOIGVudCBGRSBkZXYgPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT4gPG1pbmt5dS55aUBuaG5lbnQuY29tPlxuICogQGRlcGVuZGVuY3kganF1ZXJ5LTEuOC4zLCBjb2RlLXNuaXBwZXQtMS4wLjIsIHNwaW5ib3guanNcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciB1dGlsID0gdHVpLnV0aWwsXG4gICAgU3BpbmJveCA9IHJlcXVpcmUoJy4vc3BpbmJveCcpLFxuICAgIHRpbWVSZWdFeHAgPSAvXFxzKihcXGR7MSwyfSlcXHMqOlxccyooXFxkezEsMn0pXFxzKihbYXBdW21dKT8oPzpbXFxzXFxTXSopL2ksXG4gICAgdGltZVBpY2tlclRhZyA9ICc8dGFibGUgY2xhc3M9XCJ0aW1lcGlja2VyXCI+PHRyIGNsYXNzPVwidGltZXBpY2tlci1yb3dcIj48L3RyPjwvdGFibGU+JyxcbiAgICBjb2x1bW5UYWcgPSAnPHRkIGNsYXNzPVwidGltZXBpY2tlci1jb2x1bW5cIj48L3RkPicsXG4gICAgc3BpbkJveFRhZyA9ICc8dGQgY2xhc3M9XCJ0aW1lcGlja2VyLWNvbHVtbiB0aW1lcGlja2VyLXNwaW5ib3hcIj48ZGl2PjxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwidGltZXBpY2tlci1zcGluYm94LWlucHV0XCI+PC9kaXY+PC90ZD4nLFxuICAgIHVwQnRuVGFnID0gJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwidGltZXBpY2tlci1idG4gdGltZXBpY2tlci1idG4tdXBcIj48Yj4rPC9iPjwvYnV0dG9uPicsXG4gICAgZG93bkJ0blRhZyA9ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cInRpbWVwaWNrZXItYnRuIHRpbWVwaWNrZXItYnRuLWRvd25cIj48Yj4tPC9iPjwvYnV0dG9uPic7XG5cbi8qKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbl0gLSBvcHRpb24gZm9yIGluaXRpYWxpemF0aW9uXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24uZGVmYXVsdEhvdXIgPSAwXSAtIGluaXRpYWwgc2V0dGluZyB2YWx1ZSBvZiBob3VyXG4gKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbi5kZWZhdWx0TWludXRlID0gMF0gLSBpbml0aWFsIHNldHRpbmcgdmFsdWUgb2YgbWludXRlXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBbb3B0aW9uLmlucHV0RWxlbWVudCA9IG51bGxdIC0gb3B0aW9uYWwgaW5wdXQgZWxlbWVudCB3aXRoIHRpbWVwaWNrZXJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLmhvdXJTdGVwID0gMV0gLSBzdGVwIG9mIGhvdXIgc3BpbmJveC4gaWYgc3RlcCA9IDIsIGhvdXIgdmFsdWUgMSAtPiAzIC0+IDUgLT4gLi4uXG4gKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbi5taW51dGVTdGVwID0gMV0gLSBzdGVwIG9mIG1pbnV0ZSBzcGluYm94LiBpZiBzdGVwID0gMiwgbWludXRlIHZhbHVlIDEgLT4gMyAtPiA1IC0+IC4uLlxuICogQHBhcmFtIHtBcnJheX0gW29wdGlvbi5ob3VyRXhjbHVzaW9uID0gbnVsbF0gLSBob3VyIHZhbHVlIHRvIGJlIGV4Y2x1ZGVkLiBpZiBob3VyIFsxLDNdIGlzIGV4Y2x1ZGVkLCBob3VyIHZhbHVlIDAgLT4gMiAtPiA0IC0+IDUgLT4gLi4uXG4gKiBAcGFyYW0ge0FycmF5fSBbb3B0aW9uLm1pbnV0ZUV4Y2x1c2lvbiA9IG51bGxdIC0gbWludXRlIHZhbHVlIHRvIGJlIGV4Y2x1ZGVkLiBpZiBtaW51dGUgWzEsM10gaXMgZXhjbHVkZWQsIG1pbnV0ZSB2YWx1ZSAwIC0+IDIgLT4gNCAtPiA1IC0+IC4uLlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9uLnNob3dNZXJpZGlhbiA9IGZhbHNlXSAtIGlzIHRpbWUgZXhwcmVzc2lvbi1cImhoOm1tIEFNL1BNXCI/XG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbi5wb3NpdGlvbiA9IHt9XSAtIGxlZnQsIHRvcCBwb3NpdGlvbiBvZiB0aW1lcGlja2VyIGVsZW1lbnRcbiAqL1xudmFyIFRpbWVQaWNrZXIgPSB1dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgVGltZVBpY2tlci5wcm90b3R5cGUgKi8ge1xuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge2pRdWVyeX1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuJHRpbWVQaWNrZXJFbGVtZW50ID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge2pRdWVyeX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuXyRpbnB1dEVsZW1lbnQgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7alF1ZXJ5fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fJG1lcmlkaWFuRWxlbWVudCA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtTcGluYm94fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5faG91clNwaW5ib3ggPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7U3BpbmJveH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX21pbnV0ZVNwaW5ib3ggPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiB0aW1lIHBpY2tlciBlbGVtZW50IHNob3cgdXA/XG4gICAgICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5faXNTaG93biA9IGZhbHNlO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fb3B0aW9uID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2hvdXIgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fbWludXRlID0gbnVsbDtcblxuICAgICAgICB0aGlzLl9pbml0aWFsaXplKG9wdGlvbik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgd2l0aCBvcHRpb25cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uIGZvciB0aW1lIHBpY2tlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICB0aGlzLl9zZXRPcHRpb24ob3B0aW9uKTtcbiAgICAgICAgdGhpcy5fbWFrZVNwaW5ib3hlcygpO1xuICAgICAgICB0aGlzLl9tYWtlVGltZVBpY2tlckVsZW1lbnQoKTtcbiAgICAgICAgdGhpcy5fYXNzaWduRGVmYXVsdEV2ZW50cygpO1xuICAgICAgICB0aGlzLmZyb21TcGluYm94ZXMoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IG9wdGlvblxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb24gZm9yIHRpbWUgcGlja2VyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0T3B0aW9uOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgdGhpcy5fb3B0aW9uID0ge1xuICAgICAgICAgICAgZGVmYXVsdEhvdXI6IDAsXG4gICAgICAgICAgICBkZWZhdWx0TWludXRlOiAwLFxuICAgICAgICAgICAgaW5wdXRFbGVtZW50OiBudWxsLFxuICAgICAgICAgICAgaG91clN0ZXA6IDEsXG4gICAgICAgICAgICBtaW51dGVTdGVwOiAxLFxuICAgICAgICAgICAgaG91ckV4Y2x1c2lvbjogbnVsbCxcbiAgICAgICAgICAgIG1pbnV0ZUV4Y2x1c2lvbjogbnVsbCxcbiAgICAgICAgICAgIHNob3dNZXJpZGlhbjogZmFsc2UsXG4gICAgICAgICAgICBwb3NpdGlvbjoge31cbiAgICAgICAgfTtcblxuICAgICAgICB1dGlsLmV4dGVuZCh0aGlzLl9vcHRpb24sIG9wdGlvbik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG1ha2Ugc3BpbmJveGVzIChob3VyICYgbWludXRlKVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VTcGluYm94ZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3B0ID0gdGhpcy5fb3B0aW9uO1xuXG4gICAgICAgIHRoaXMuX2hvdXJTcGluYm94ID0gbmV3IFNwaW5ib3goc3BpbkJveFRhZywge1xuICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiBvcHQuZGVmYXVsdEhvdXIsXG4gICAgICAgICAgICBtaW46IDAsXG4gICAgICAgICAgICBtYXg6IDIzLFxuICAgICAgICAgICAgc3RlcDogb3B0LmhvdXJTdGVwLFxuICAgICAgICAgICAgdXBCdG5UYWc6IHVwQnRuVGFnLFxuICAgICAgICAgICAgZG93bkJ0blRhZzogZG93bkJ0blRhZyxcbiAgICAgICAgICAgIGV4Y2x1c2lvbjogb3B0LmhvdXJFeGNsdXNpb25cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5fbWludXRlU3BpbmJveCA9IG5ldyBTcGluYm94KHNwaW5Cb3hUYWcsIHtcbiAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogb3B0LmRlZmF1bHRNaW51dGUsXG4gICAgICAgICAgICBtaW46IDAsXG4gICAgICAgICAgICBtYXg6IDU5LFxuICAgICAgICAgICAgc3RlcDogb3B0Lm1pbnV0ZVN0ZXAsXG4gICAgICAgICAgICB1cEJ0blRhZzogdXBCdG5UYWcsXG4gICAgICAgICAgICBkb3duQnRuVGFnOiBkb3duQnRuVGFnLFxuICAgICAgICAgICAgZXhjbHVzaW9uOiBvcHQubWludXRlRXhjbHVzaW9uXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBtYWtlIHRpbWVwaWNrZXIgY29udGFpbmVyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVRpbWVQaWNrZXJFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wdCA9IHRoaXMuX29wdGlvbixcbiAgICAgICAgICAgICR0cCA9ICQodGltZVBpY2tlclRhZyksXG4gICAgICAgICAgICAkdHBSb3cgPSAkdHAuZmluZCgnLnRpbWVwaWNrZXItcm93JyksXG4gICAgICAgICAgICAkbWVyaWRpYW4sXG4gICAgICAgICAgICAkY29sb24gPSAkKGNvbHVtblRhZylcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ2NvbG9uJylcbiAgICAgICAgICAgICAgICAuYXBwZW5kKCc6Jyk7XG5cblxuICAgICAgICAkdHBSb3cuYXBwZW5kKHRoaXMuX2hvdXJTcGluYm94LmdldENvbnRhaW5lckVsZW1lbnQoKSwgJGNvbG9uLCB0aGlzLl9taW51dGVTcGluYm94LmdldENvbnRhaW5lckVsZW1lbnQoKSk7XG5cbiAgICAgICAgaWYgKG9wdC5zaG93TWVyaWRpYW4pIHtcbiAgICAgICAgICAgICRtZXJpZGlhbiA9ICQoY29sdW1uVGFnKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnbWVyaWRpYW4nKVxuICAgICAgICAgICAgICAgIC5hcHBlbmQodGhpcy5faXNQTSA/ICdQTScgOiAnQU0nKTtcbiAgICAgICAgICAgIHRoaXMuXyRtZXJpZGlhbkVsZW1lbnQgPSAkbWVyaWRpYW47XG4gICAgICAgICAgICAkdHBSb3cuYXBwZW5kKCRtZXJpZGlhbik7XG4gICAgICAgIH1cblxuICAgICAgICAkdHAuaGlkZSgpO1xuICAgICAgICAkKCdib2R5JykuYXBwZW5kKCR0cCk7XG4gICAgICAgIHRoaXMuJHRpbWVQaWNrZXJFbGVtZW50ID0gJHRwO1xuXG4gICAgICAgIGlmIChvcHQuaW5wdXRFbGVtZW50KSB7XG4gICAgICAgICAgICAkdHAuY3NzKCdwb3NpdGlvbicsICdhYnNvbHV0ZScpO1xuICAgICAgICAgICAgdGhpcy5fJGlucHV0RWxlbWVudCA9ICQob3B0LmlucHV0RWxlbWVudCk7XG4gICAgICAgICAgICB0aGlzLl9zZXREZWZhdWx0UG9zaXRpb24odGhpcy5fJGlucHV0RWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IHBvc2l0aW9uIG9mIHRpbWVwaWNrZXIgY29udGFpbmVyXG4gICAgICogQHBhcmFtIHtqUXVlcnl9ICRpbnB1dCBqcXVlcnktb2JqZWN0IChlbGVtZW50KVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldERlZmF1bHRQb3NpdGlvbjogZnVuY3Rpb24oJGlucHV0KSB7XG4gICAgICAgIHZhciBpbnB1dEVsID0gJGlucHV0WzBdLFxuICAgICAgICAgICAgcG9zaXRpb24gPSB0aGlzLl9vcHRpb24ucG9zaXRpb24sXG4gICAgICAgICAgICB4ID0gcG9zaXRpb24ueCxcbiAgICAgICAgICAgIHkgPSBwb3NpdGlvbi55O1xuXG4gICAgICAgIGlmICghdXRpbC5pc051bWJlcih4KSB8fCAhdXRpbC5pc051bWJlcih5KSkge1xuICAgICAgICAgICAgeCA9IGlucHV0RWwub2Zmc2V0TGVmdDtcbiAgICAgICAgICAgIHkgPSBpbnB1dEVsLm9mZnNldFRvcCArIGlucHV0RWwub2Zmc2V0SGVpZ2h0ICsgMztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFhZUG9zaXRpb24oeCwgeSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGFzc2lnbiBkZWZhdWx0IGV2ZW50c1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Fzc2lnbkRlZmF1bHRFdmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJGlucHV0ID0gdGhpcy5fJGlucHV0RWxlbWVudDtcblxuICAgICAgICBpZiAoJGlucHV0KSB7XG4gICAgICAgICAgICB0aGlzLl9hc3NpZ25FdmVudHNUb0lucHV0RWxlbWVudCgpO1xuICAgICAgICAgICAgdGhpcy5vbignY2hhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJGlucHV0LnZhbCh0aGlzLmdldFRpbWUoKSk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLiR0aW1lUGlja2VyRWxlbWVudC5vbignY2hhbmdlJywgdXRpbC5iaW5kKHRoaXMuX29uQ2hhbmdlVGltZVBpY2tlciwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBhdHRhY2ggZXZlbnQgdG8gSW5wdXQgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Fzc2lnbkV2ZW50c1RvSW5wdXRFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgJGlucHV0ID0gdGhpcy5fJGlucHV0RWxlbWVudDtcblxuICAgICAgICAkaW5wdXQub24oJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHNlbGYub3BlbihldmVudCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRpbnB1dC5vbignY2hhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoIXNlbGYuc2V0VGltZUZyb21JbnB1dEVsZW1lbnQoKSkge1xuICAgICAgICAgICAgICAgICRpbnB1dC52YWwoc2VsZi5nZXRUaW1lKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogZG9tIGV2ZW50IGhhbmRsZXIgKHRpbWVwaWNrZXIpXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25DaGFuZ2VUaW1lUGlja2VyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5mcm9tU3BpbmJveGVzKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGlzIGNsaWNrZWQgaW5zaWRlIG9mIGNvbnRhaW5lcj9cbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCBldmVudC1vYmplY3RcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNDbGlja2VkSW5zaWRlOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgaXNDb250YWlucyA9ICQuY29udGFpbnModGhpcy4kdGltZVBpY2tlckVsZW1lbnRbMF0sIGV2ZW50LnRhcmdldCksXG4gICAgICAgICAgICBpc0lucHV0RWxlbWVudCA9ICh0aGlzLl8kaW5wdXRFbGVtZW50ICYmIHRoaXMuXyRpbnB1dEVsZW1lbnRbMF0gPT09IGV2ZW50LnRhcmdldCk7XG5cbiAgICAgICAgcmV0dXJuIGlzQ29udGFpbnMgfHwgaXNJbnB1dEVsZW1lbnQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHRyYW5zZm9ybSB0aW1lIGludG8gZm9ybWF0dGVkIHN0cmluZ1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHRpbWUgc3RyaW5nXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZm9ybVRvVGltZUZvcm1hdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBob3VyID0gdGhpcy5faG91cixcbiAgICAgICAgICAgIG1pbnV0ZSA9IHRoaXMuX21pbnV0ZSxcbiAgICAgICAgICAgIHBvc3RmaXggPSB0aGlzLl9nZXRQb3N0Zml4KCksXG4gICAgICAgICAgICBmb3JtYXR0ZWRIb3VyLFxuICAgICAgICAgICAgZm9ybWF0dGVkTWludXRlO1xuXG4gICAgICAgIGlmICh0aGlzLl9vcHRpb24uc2hvd01lcmlkaWFuKSB7XG4gICAgICAgICAgICBob3VyICU9IDEyO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9ybWF0dGVkSG91ciA9IChob3VyIDwgMTApID8gJzAnICsgaG91ciA6IGhvdXI7XG4gICAgICAgIGZvcm1hdHRlZE1pbnV0ZSA9IChtaW51dGUgPCAxMCkgPyAnMCcgKyBtaW51dGUgOiBtaW51dGU7XG4gICAgICAgIHJldHVybiBmb3JtYXR0ZWRIb3VyICsgJzonICsgZm9ybWF0dGVkTWludXRlICsgcG9zdGZpeDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IHRoZSBib29sZWFuIHZhbHVlICdpc1BNJyB3aGVuIEFNL1BNIG9wdGlvbiBpcyB0cnVlLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldElzUE06IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9pc1BNID0gKHRoaXMuX2hvdXIgPiAxMSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGdldCBwb3N0Zml4IHdoZW4gQU0vUE0gb3B0aW9uIGlzIHRydWUuXG4gICAgICogQHJldHVybnMge3N0cmluZ30gcG9zdGZpeCAoQU0vUE0pXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0UG9zdGZpeDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwb3N0Zml4ID0gJyc7XG5cbiAgICAgICAgaWYgKHRoaXMuX29wdGlvbi5zaG93TWVyaWRpYW4pIHtcbiAgICAgICAgICAgIHBvc3RmaXggPSAodGhpcy5faXNQTSkgPyAnIFBNJyA6ICcgQU0nO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwb3N0Zml4O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgcG9zaXRpb24gb2YgY29udGFpbmVyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHggLSBpdCB3aWxsIGJlIG9mZnNldExlZnQgb2YgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gaXQgd2lsbCBiZSBvZmZzZXRUb3Agb2YgZWxlbWVudFxuICAgICAqL1xuICAgIHNldFhZUG9zaXRpb246IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgdmFyIHBvc2l0aW9uO1xuXG4gICAgICAgIGlmICghdXRpbC5pc051bWJlcih4KSB8fCAhdXRpbC5pc051bWJlcih5KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcG9zaXRpb24gPSB0aGlzLl9vcHRpb24ucG9zaXRpb247XG4gICAgICAgIHBvc2l0aW9uLnggPSB4O1xuICAgICAgICBwb3NpdGlvbi55ID0geTtcbiAgICAgICAgdGhpcy4kdGltZVBpY2tlckVsZW1lbnQuY3NzKHtsZWZ0OiB4LCB0b3A6IHl9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2hvdyB0aW1lIHBpY2tlciBlbGVtZW50XG4gICAgICovXG4gICAgc2hvdzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuJHRpbWVQaWNrZXJFbGVtZW50LnNob3coKTtcbiAgICAgICAgdGhpcy5faXNTaG93biA9IHRydWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGhpZGUgdGltZSBwaWNrZXIgZWxlbWVudFxuICAgICAqL1xuICAgIGhpZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLiR0aW1lUGlja2VyRWxlbWVudC5oaWRlKCk7XG4gICAgICAgIHRoaXMuX2lzU2hvd24gPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogbGlzdGVuZXIgdG8gc2hvdyBjb250YWluZXJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCBldmVudC1vYmplY3RcbiAgICAgKi9cbiAgICBvcGVuOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBpZiAodGhpcy5faXNTaG93bikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgdXRpbC5iaW5kKHRoaXMuY2xvc2UsIHRoaXMpKTtcbiAgICAgICAgdGhpcy5zaG93KCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIE9wZW4gZXZlbnQgLSBUaW1lUGlja2VyXG4gICAgICAgICAqIEBldmVudCBUaW1lUGlja2VyI29wZW5cbiAgICAgICAgICogQHBhcmFtIHsoalF1ZXJ5LkV2ZW50fHVuZGVmaW5lZCl9IC0gQ2xpY2sgdGhlIGlucHV0IGVsZW1lbnRcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZmlyZSgnb3BlbicsIGV2ZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogbGlzdGVuZXIgdG8gaGlkZSBjb250YWluZXJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCBldmVudC1vYmplY3RcbiAgICAgKi9cbiAgICBjbG9zZTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pc1Nob3duIHx8IHRoaXMuX2lzQ2xpY2tlZEluc2lkZShldmVudCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgICQoZG9jdW1lbnQpLm9mZihldmVudCk7XG4gICAgICAgIHRoaXMuaGlkZSgpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBIaWRlIGV2ZW50IC0gVGltZXBpY2tlclxuICAgICAgICAgKiBAZXZlbnQgVGltZVBpY2tlciNjbG9zZVxuICAgICAgICAgKiBAcGFyYW0geyhqUXVlcnkuRXZlbnR8dW5kZWZpbmVkKX0gLSBDbGljayB0aGUgZG9jdW1lbnQgKG5vdCBUaW1lUGlja2VyKVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5maXJlKCdjbG9zZScsIGV2ZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IHZhbHVlcyBpbiBzcGluYm94ZXMgZnJvbSB0aW1lXG4gICAgICovXG4gICAgdG9TcGluYm94ZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaG91ciA9IHRoaXMuX2hvdXIsXG4gICAgICAgICAgICBtaW51dGUgPSB0aGlzLl9taW51dGU7XG5cbiAgICAgICAgdGhpcy5faG91clNwaW5ib3guc2V0VmFsdWUoaG91cik7XG4gICAgICAgIHRoaXMuX21pbnV0ZVNwaW5ib3guc2V0VmFsdWUobWludXRlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IHRpbWUgZnJvbSBzcGluYm94ZXMgdmFsdWVzXG4gICAgICovXG4gICAgZnJvbVNwaW5ib3hlczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBob3VyID0gdGhpcy5faG91clNwaW5ib3guZ2V0VmFsdWUoKSxcbiAgICAgICAgICAgIG1pbnV0ZSA9IHRoaXMuX21pbnV0ZVNwaW5ib3guZ2V0VmFsdWUoKTtcblxuICAgICAgICB0aGlzLnNldFRpbWUoaG91ciwgbWludXRlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IHRpbWUgZnJvbSBpbnB1dCBlbGVtZW50LlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR8alF1ZXJ5fSBbaW5wdXRFbGVtZW50XSBqcXVlcnkgb2JqZWN0IChlbGVtZW50KVxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHJlc3VsdCBvZiBzZXQgdGltZVxuICAgICAqL1xuICAgIHNldFRpbWVGcm9tSW5wdXRFbGVtZW50OiBmdW5jdGlvbihpbnB1dEVsZW1lbnQpIHtcbiAgICAgICAgdmFyIGlucHV0ID0gJChpbnB1dEVsZW1lbnQpWzBdIHx8IHRoaXMuXyRpbnB1dEVsZW1lbnRbMF07XG4gICAgICAgIHJldHVybiAhIShpbnB1dCAmJiB0aGlzLnNldFRpbWVGcm9tU3RyaW5nKGlucHV0LnZhbHVlKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCBob3VyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhvdXIgZm9yIHRpbWUgcGlja2VyXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gcmVzdWx0IG9mIHNldCB0aW1lXG4gICAgICovXG4gICAgc2V0SG91cjogZnVuY3Rpb24oaG91cikge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRUaW1lKGhvdXIsIHRoaXMuX21pbnV0ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCBtaW51dGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWludXRlIGZvciB0aW1lIHBpY2tlclxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHJlc3VsdCBvZiBzZXQgdGltZVxuICAgICAqL1xuICAgIHNldE1pbnV0ZTogZnVuY3Rpb24obWludXRlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldFRpbWUodGhpcy5faG91ciwgbWludXRlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IHRpbWVcbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhvdXIgZm9yIHRpbWUgcGlja2VyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbnV0ZSBmb3IgdGltZSBwaWNrZXJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSByZXN1bHQgb2Ygc2V0IHRpbWVcbiAgICAgKi9cbiAgICBzZXRUaW1lOiBmdW5jdGlvbihob3VyLCBtaW51dGUpIHtcbiAgICAgICAgdmFyIGlzTnVtYmVyID0gKHV0aWwuaXNOdW1iZXIoaG91cikgJiYgdXRpbC5pc051bWJlcihtaW51dGUpKSxcbiAgICAgICAgICAgIGlzQ2hhbmdlID0gKHRoaXMuX2hvdXIgIT09IGhvdXIgfHwgdGhpcy5fbWludXRlICE9PSBtaW51dGUpLFxuICAgICAgICAgICAgaXNWYWxpZCA9IChob3VyIDwgMjQgJiYgbWludXRlIDwgNjApO1xuXG4gICAgICAgIGlmICghaXNOdW1iZXIgfHwgIWlzQ2hhbmdlIHx8ICFpc1ZhbGlkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9ob3VyID0gaG91cjtcbiAgICAgICAgdGhpcy5fbWludXRlID0gbWludXRlO1xuICAgICAgICB0aGlzLl9zZXRJc1BNKCk7XG4gICAgICAgIHRoaXMudG9TcGluYm94ZXMoKTtcbiAgICAgICAgaWYgKHRoaXMuXyRtZXJpZGlhbkVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuXyRtZXJpZGlhbkVsZW1lbnQuaHRtbCh0aGlzLl9nZXRQb3N0Zml4KCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENoYW5nZSBldmVudCAtIFRpbWVQaWNrZXJcbiAgICAgICAgICogQGV2ZW50IFRpbWVQaWNrZXIjY2hhbmdlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmZpcmUoJ2NoYW5nZScpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IHRpbWUgZnJvbSB0aW1lLXN0cmluZ1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0aW1lU3RyaW5nIHRpbWUtc3RyaW5nXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gcmVzdWx0IG9mIHNldCB0aW1lXG4gICAgICovXG4gICAgc2V0VGltZUZyb21TdHJpbmc6IGZ1bmN0aW9uKHRpbWVTdHJpbmcpIHtcbiAgICAgICAgdmFyIGhvdXIsXG4gICAgICAgICAgICBtaW51dGUsXG4gICAgICAgICAgICBwb3N0Zml4LFxuICAgICAgICAgICAgaXNQTTtcblxuICAgICAgICBpZiAodGltZVJlZ0V4cC50ZXN0KHRpbWVTdHJpbmcpKSB7XG4gICAgICAgICAgICBob3VyID0gTnVtYmVyKFJlZ0V4cC4kMSk7XG4gICAgICAgICAgICBtaW51dGUgPSBOdW1iZXIoUmVnRXhwLiQyKTtcbiAgICAgICAgICAgIHBvc3RmaXggPSBSZWdFeHAuJDMudG9VcHBlckNhc2UoKTtcblxuICAgICAgICAgICAgaWYgKGhvdXIgPCAyNCAmJiB0aGlzLl9vcHRpb24uc2hvd01lcmlkaWFuKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBvc3RmaXggPT09ICdQTScpIHtcbiAgICAgICAgICAgICAgICAgICAgaXNQTSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwb3N0Zml4ID09PSAnQU0nKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzUE0gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpc1BNID0gdGhpcy5faXNQTTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoaXNQTSkge1xuICAgICAgICAgICAgICAgICAgICBob3VyICs9IDEyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5zZXRUaW1lKGhvdXIsIG1pbnV0ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCBzdGVwIG9mIGhvdXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RlcCBmb3IgdGltZSBwaWNrZXJcbiAgICAgKi9cbiAgICBzZXRIb3VyU3RlcDogZnVuY3Rpb24oc3RlcCkge1xuICAgICAgICB0aGlzLl9ob3VyU3BpbmJveC5zZXRTdGVwKHN0ZXApO1xuICAgICAgICB0aGlzLl9vcHRpb24uaG91clN0ZXAgPSB0aGlzLl9ob3VyU3BpbmJveC5nZXRTdGVwKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCBzdGVwIG9mIG1pbnV0ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIGZvciB0aW1lIHBpY2tlclxuICAgICAqL1xuICAgIHNldE1pbnV0ZVN0ZXA6IGZ1bmN0aW9uKHN0ZXApIHtcbiAgICAgICAgdGhpcy5fbWludXRlU3BpbmJveC5zZXRTdGVwKHN0ZXApO1xuICAgICAgICB0aGlzLl9vcHRpb24ubWludXRlU3RlcCA9IHRoaXMuX21pbnV0ZVNwaW5ib3guZ2V0U3RlcCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBhZGQgYSBzcGVjaWZpYyBob3VyIHRvIGV4Y2x1ZGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaG91ciBmb3IgZXhjbHVzaW9uXG4gICAgICovXG4gICAgYWRkSG91ckV4Y2x1c2lvbjogZnVuY3Rpb24oaG91cikge1xuICAgICAgICB0aGlzLl9ob3VyU3BpbmJveC5hZGRFeGNsdXNpb24oaG91cik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGFkZCBhIHNwZWNpZmljIG1pbnV0ZSB0byBleGNsdWRlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbnV0ZSBmb3IgZXhjbHVzaW9uXG4gICAgICovXG4gICAgYWRkTWludXRlRXhjbHVzaW9uOiBmdW5jdGlvbihtaW51dGUpIHtcbiAgICAgICAgdGhpcy5fbWludXRlU3BpbmJveC5hZGRFeGNsdXNpb24obWludXRlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogZ2V0IHN0ZXAgb2YgaG91clxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGhvdXIgdXAvZG93biBzdGVwXG4gICAgICovXG4gICAgZ2V0SG91clN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9uLmhvdXJTdGVwO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBnZXQgc3RlcCBvZiBtaW51dGVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBtaW51dGUgdXAvZG93biBzdGVwXG4gICAgICovXG4gICAgZ2V0TWludXRlU3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vcHRpb24ubWludXRlU3RlcDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogcmVtb3ZlIGhvdXIgZnJvbSBleGNsdXNpb24gbGlzdFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBob3VyIHRoYXQgeW91IHdhbnQgdG8gcmVtb3ZlXG4gICAgICovXG4gICAgcmVtb3ZlSG91ckV4Y2x1c2lvbjogZnVuY3Rpb24oaG91cikge1xuICAgICAgICB0aGlzLl9ob3VyU3BpbmJveC5yZW1vdmVFeGNsdXNpb24oaG91cik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJlbW92ZSBtaW51dGUgZnJvbSBleGNsdXNpb24gbGlzdFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW51dGUgdGhhdCB5b3Ugd2FudCB0byByZW1vdmVcbiAgICAgKi9cbiAgICByZW1vdmVNaW51dGVFeGNsdXNpb246IGZ1bmN0aW9uKG1pbnV0ZSkge1xuICAgICAgICB0aGlzLl9taW51dGVTcGluYm94LnJlbW92ZUV4Y2x1c2lvbihtaW51dGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBnZXQgaG91clxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGhvdXJcbiAgICAgKi9cbiAgICBnZXRIb3VyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hvdXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGdldCBtaW51dGVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBtaW51dGVcbiAgICAgKi9cbiAgICBnZXRNaW51dGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbWludXRlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBnZXQgdGltZVxuICAgICAqIEBhcGlcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSAnaGg6bW0gKEFNL1BNKSdcbiAgICAgKi9cbiAgICBnZXRUaW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Zvcm1Ub1RpbWVGb3JtYXQoKTtcbiAgICB9XG59KTtcbnR1aS51dGlsLkN1c3RvbUV2ZW50cy5taXhpbihUaW1lUGlja2VyKTtcblxubW9kdWxlLmV4cG9ydHMgPSBUaW1lUGlja2VyO1xuXG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVXRpbHMgZm9yIGNhbGVuZGFyIGNvbXBvbmVudFxuICogQGF1dGhvciBOSE4gTmV0LiBGRSBkZXYgdGVhbS4gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqIEBkZXBlbmRlbmN5IG5lLWNvZGUtc25pcHBldCB+MS4wLjJcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXRpbHMgb2YgY2FsZW5kYXJcbiAqIEBuYW1lc3BhY2UgdXRpbHNcbiAqL1xudmFyIHV0aWxzID0ge1xuICAgIC8qKlxuICAgICAqIFJldHVybiBkYXRlIGhhc2ggYnkgcGFyYW1ldGVyLlxuICAgICAqICBpZiB0aGVyZSBhcmUgMyBwYXJhbWV0ZXIsIHRoZSBwYXJhbWV0ZXIgaXMgY29yZ25pemVkIERhdGUgb2JqZWN0XG4gICAgICogIGlmIHRoZXJlIGFyZSBubyBwYXJhbWV0ZXIsIHJldHVybiB0b2RheSdzIGhhc2ggZGF0ZVxuICAgICAqIEBmdW5jdGlvbiBnZXREYXRlSGFzaFRhYmxlXG4gICAgICogQG1lbWJlcm9mIHV0aWxzXG4gICAgICogQHBhcmFtIHtEYXRlfG51bWJlcn0gW3llYXJdIEEgZGF0ZSBpbnN0YW5jZSBvciB5ZWFyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFttb250aF0gQSBtb250aFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbZGF0ZV0gQSBkYXRlXG4gICAgICogQHJldHVybnMge3t5ZWFyOiAqLCBtb250aDogKiwgZGF0ZTogKn19IFxuICAgICAqL1xuICAgIGdldERhdGVIYXNoVGFibGU6IGZ1bmN0aW9uKHllYXIsIG1vbnRoLCBkYXRlKSB7XG4gICAgICAgIHZhciBuRGF0ZTtcblxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgICAgIG5EYXRlID0gYXJndW1lbnRzWzBdIHx8IG5ldyBEYXRlKCk7XG5cbiAgICAgICAgICAgIHllYXIgPSBuRGF0ZS5nZXRGdWxsWWVhcigpO1xuICAgICAgICAgICAgbW9udGggPSBuRGF0ZS5nZXRNb250aCgpICsgMTtcbiAgICAgICAgICAgIGRhdGUgPSBuRGF0ZS5nZXREYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeWVhcjogeWVhcixcbiAgICAgICAgICAgIG1vbnRoOiBtb250aCxcbiAgICAgICAgICAgIGRhdGU6IGRhdGVcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRvZGF5IHRoYXQgc2F2ZWQgb24gY29tcG9uZW50IG9yIGNyZWF0ZSBuZXcgZGF0ZS5cbiAgICAgKiBAZnVuY3Rpb24gZ2V0VG9kYXlcbiAgICAgKiBAcmV0dXJucyB7e3llYXI6ICosIG1vbnRoOiAqLCBkYXRlOiAqfX1cbiAgICAgKiBAbWVtYmVyb2YgdXRpbHNcbiAgICAgKi9cbiAgICBnZXRUb2RheTogZnVuY3Rpb24oKSB7XG4gICAgICAgcmV0dXJuIHV0aWxzLmdldERhdGVIYXNoVGFibGUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHdlZWtzIGNvdW50IGJ5IHBhcmFtZW50ZXJcbiAgICAgKiBAZnVuY3Rpb24gZ2V0V2Vla3NcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geWVhciBBIHllYXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbW9udGggQSBtb250aFxuICAgICAqIEByZXR1cm4ge251bWJlcn0g7KO8ICg0fjYpXG4gICAgICogQG1lbWJlcm9mIHV0aWxzXG4gICAgICoqL1xuICAgIGdldFdlZWtzOiBmdW5jdGlvbih5ZWFyLCBtb250aCkge1xuICAgICAgICB2YXIgZmlyc3REYXkgPSB1dGlscy5nZXRGaXJzdERheSh5ZWFyLCBtb250aCksXG4gICAgICAgICAgICBsYXN0RGF0ZSA9IHV0aWxzLmdldExhc3REYXRlKHllYXIsIG1vbnRoKTtcblxuICAgICAgICByZXR1cm4gTWF0aC5jZWlsKChmaXJzdERheSArIGxhc3REYXRlKSAvIDcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdW5peCB0aW1lIGZyb20gZGF0ZSBoYXNoXG4gICAgICogQGZ1bmN0aW9uIGdldFRpbWVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0ZSBBIGRhdGUgaGFzaFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBkYXRlLnllYXIgQSB5ZWFyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGRhdGUubW9udGggQSBtb250aFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBkYXRlLmRhdGUgQSBkYXRlXG4gICAgICogQHJldHVybiB7bnVtYmVyfSBcbiAgICAgKiBAbWVtYmVyb2YgdXRpbHNcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHV0aWxzLmdldFRpbWUoe3llYXI6MjAxMCwgbW9udGg6NSwgZGF0ZToxMn0pOyAvLyAxMjczNTkwMDAwMDAwXG4gICAgICoqL1xuICAgIGdldFRpbWU6IGZ1bmN0aW9uKGRhdGUpIHtcbiAgICAgICAgcmV0dXJuIHV0aWxzLmdldERhdGVPYmplY3QoZGF0ZSkuZ2V0VGltZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgd2hpY2ggZGF5IGlzIGZpcnN0IGJ5IHBhcmFtZXRlcnMgdGhhdCBpbmNsdWRlIHllYXIgYW5kIG1vbnRoIGluZm9ybWF0aW9uLlxuICAgICAqIEBmdW5jdGlvbiBnZXRGaXJzdERheVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5ZWFyIEEgeWVhclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtb250aCBBIG1vbnRoXG4gICAgICogQHJldHVybiB7bnVtYmVyfSAoMH42KVxuICAgICAqIEBtZW1iZXJvZiB1dGlsc1xuICAgICAqKi9cbiAgICBnZXRGaXJzdERheTogZnVuY3Rpb24oeWVhciwgbW9udGgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHllYXIsIG1vbnRoIC0gMSwgMSkuZ2V0RGF5KCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB3aGljaCBkYXkgaXMgbGFzdCBieSBwYXJhbWV0ZXJzIHRoYXQgaW5jbHVkZSB5ZWFyIGFuZCBtb250aCBpbmZvcm1hdGlvbi5cbiAgICAgKiBAZnVuY3Rpb24gZ2V0TGFzdERheVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5ZWFyIEEgeWVhclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtb250aCBBIG1vbnRoXG4gICAgICogQHJldHVybiB7bnVtYmVyfSAoMH42KVxuICAgICAqIEBtZW1iZXJvZiB1dGlsc1xuICAgICAqKi9cbiAgICBnZXRMYXN0RGF5OiBmdW5jdGlvbih5ZWFyLCBtb250aCkge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoeWVhciwgbW9udGgsIDApLmdldERheSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgbGFzdCBkYXRlIGJ5IHBhcmFtZXRlcnMgdGhhdCBpbmNsdWRlIHllYXIgYW5kIG1vbnRoIGluZm9ybWF0aW9uLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5ZWFyIEEgeWVhclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtb250aCBBIG1vbnRoXG4gICAgICogQHJldHVybiB7bnVtYmVyfSAoMX4zMSlcbiAgICAgKiBAbWVtYmVyb2YgdXRpbHNcbiAgICAgKiovXG4gICAgZ2V0TGFzdERhdGU6IGZ1bmN0aW9uKHllYXIsIG1vbnRoKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgMCkuZ2V0RGF0ZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZGF0ZSBpbnN0YW5jZS5cbiAgICAgKiBAZnVuY3Rpb24gZ2V0RGF0ZU9iamVjdFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRlIEEgZGF0ZSBoYXNoXG4gICAgICogQHJldHVybiB7RGF0ZX0gRGF0ZSAgXG4gICAgICogQG1lbWJlcm9mIHV0aWxzXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAgdXRpbHMuZ2V0RGF0ZU9iamVjdCh7eWVhcjoyMDEwLCBtb250aDo1LCBkYXRlOjEyfSk7XG4gICAgICogIHV0aWxzLmdldERhdGVPYmplY3QoMjAxMCwgNSwgMTIpOyAvL3llYXIsbW9udGgsZGF0ZVxuICAgICAqKi9cbiAgICBnZXREYXRlT2JqZWN0OiBmdW5jdGlvbihkYXRlKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGUoYXJndW1lbnRzWzBdLCBhcmd1bWVudHNbMV0gLSAxLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShkYXRlLnllYXIsIGRhdGUubW9udGggLSAxLCBkYXRlLmRhdGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcmVsYXRlZCBkYXRlIGhhc2ggd2l0aCBwYXJhbWV0ZXJzIHRoYXQgaW5jbHVkZSBkYXRlIGluZm9ybWF0aW9uLlxuICAgICAqIEBmdW5jdGlvbiBnZXRSZWxhdGl2ZURhdGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geWVhciBBIHJlbGF0ZWQgdmFsdWUgZm9yIHllYXIoeW91IGNhbiB1c2UgKy8tKVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtb250aCBBIHJlbGF0ZWQgdmFsdWUgZm9yIG1vbnRoICh5b3UgY2FuIHVzZSArLy0pXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGRhdGUgQSByZWxhdGVkIHZhbHVlIGZvciBkYXkgKHlvdSBjYW4gdXNlICsvLSlcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0ZU9iaiBzdGFuZGFyZCBkYXRlIGhhc2hcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IGRhdGVPYmogXG4gICAgICogQG1lbWJlcm9mIHV0aWxzXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAgdXRpbHMuZ2V0UmVsYXRpdmVEYXRlKDEsIDAsIDAsIHt5ZWFyOjIwMDAsIG1vbnRoOjEsIGRhdGU6MX0pOyAvLyB7eWVhcjoyMDAxLCBtb250aDoxLCBkYXRlOjF9XG4gICAgICogIHV0aWxzLmdldFJlbGF0aXZlRGF0ZSgwLCAwLCAtMSwge3llYXI6MjAxMCwgbW9udGg6MSwgZGF0ZToxfSk7IC8vIHt5ZWFyOjIwMDksIG1vbnRoOjEyLCBkYXRlOjMxfVxuICAgICAqKi9cbiAgICBnZXRSZWxhdGl2ZURhdGU6IGZ1bmN0aW9uKHllYXIsIG1vbnRoLCBkYXRlLCBkYXRlT2JqKSB7XG4gICAgICAgIHZhciBuWWVhciA9IChkYXRlT2JqLnllYXIgKyB5ZWFyKSxcbiAgICAgICAgICAgIG5Nb250aCA9IChkYXRlT2JqLm1vbnRoICsgbW9udGggLSAxKSxcbiAgICAgICAgICAgIG5EYXRlID0gKGRhdGVPYmouZGF0ZSArIGRhdGUpLFxuICAgICAgICAgICAgbkRhdGVPYmogPSBuZXcgRGF0ZShuWWVhciwgbk1vbnRoLCBuRGF0ZSk7XG5cbiAgICAgICAgcmV0dXJuIHV0aWxzLmdldERhdGVIYXNoVGFibGUobkRhdGVPYmopO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCaW5hcnkgc2VhcmNoXG4gICAgICogQHBhcmFtIHtBcnJheX0gZmllbGQgLSBTZWFyY2ggZmllbGRcbiAgICAgKiBAcGFyYW0ge0FycmF5fSB2YWx1ZSAtIFNlYXJjaCB0YXJnZXRcbiAgICAgKiBAcmV0dXJucyB7e2ZvdW5kOiBib29sZWFuLCBpbmRleDogbnVtYmVyfX0gUmVzdWx0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBzZWFyY2g6IGZ1bmN0aW9uKGZpZWxkLCB2YWx1ZSkge1xuICAgICAgICB2YXIgZm91bmQgPSBmYWxzZSxcbiAgICAgICAgICAgIGxvdyA9IDAsXG4gICAgICAgICAgICBoaWdoID0gZmllbGQubGVuZ3RoIC0gMSxcbiAgICAgICAgICAgIGVuZCwgaW5kZXgsIGZpZWxkVmFsdWU7XG5cbiAgICAgICAgd2hpbGUgKCFmb3VuZCAmJiAhZW5kKSB7XG4gICAgICAgICAgICBpbmRleCA9IE1hdGguZmxvb3IoKGxvdyArIGhpZ2gpIC8gMik7XG4gICAgICAgICAgICBmaWVsZFZhbHVlID0gZmllbGRbaW5kZXhdO1xuXG4gICAgICAgICAgICBpZiAoZmllbGRWYWx1ZSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGZpZWxkVmFsdWUgPCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGxvdyA9IGluZGV4ICsgMTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGlnaCA9IGluZGV4IC0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVuZCA9IChsb3cgPiBoaWdoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmb3VuZDogZm91bmQsXG4gICAgICAgICAgICBpbmRleDogKGZvdW5kIHx8IGZpZWxkVmFsdWUgPiB2YWx1ZSkgPyBpbmRleCA6IGluZGV4ICsgMVxuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB1dGlscztcbiJdfQ==
