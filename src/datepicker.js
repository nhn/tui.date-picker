/**
 * @fileoverview This component provides a calendar for picking a date & time.
 * @author NHN ent FE dev Lab <dl_javascript@nhnent.com>
 */
'use strict';

var dateUtil = require('./utils');

var util = tui.util;
var extend = util.extend;
var bind = util.bind;
var forEach = util.forEach;
var isNumber = util.isNumber;
var compareJSON = util.compareJSON;
var isGreaterThanOrEqualTo = function(a, b, comparingLevel) {
    comparingLevel = comparingLevel || 1;

    return Math.floor((a / comparingLevel)) >= Math.floor((b / comparingLevel));
};

var inArray = util.inArray;
var formatRegExp = /yyyy|yy|mm|m|dd|d/gi;
var mapForConverting = {
    yyyy: {
        expression: '(\\d{4}|\\d{2})',
        type: 'year'
    },
    yy: {
        expression: '(\\d{4}|\\d{2})',
        type: 'year'
    },
    y: {
        expression: '(\\d{4}|\\d{2})',
        type: 'year'
    },
    mm: {
        expression: '(1[012]|0[1-9]|[1-9]\\b)',
        type: 'month'
    },
    m: {
        expression: '(1[012]|0[1-9]|[1-9]\\b)',
        type: 'month'
    },
    dd: {
        expression: '([12]\\d{1}|3[01]|0[1-9]|[1-9]\\b)',
        type: 'date'
    },
    d: {
        expression: '([12]\\d{1}|3[01]|0[1-9]|[1-9]\\b)',
        type: 'date'
    }
};
var DATE_LAYER = 'date';
var MONTH_LAYER = 'month';
var YEAR_LAYER = 'year';
var MIN_YEAR = 1900;
var MAX_YEAR = 2999;
var WRAPPER_TAG = '<div style="position:absolute;"></div>';
var MIN_EDGE = Number(new Date(0));
var MAX_EDGE = Number(new Date(2999, 11, 31));
var YEAR_TO_MS = 31536000000;
var MONTH_TO_MS = 2628000000;
var RELATIVE_MONTH_VALUE_KEY = 'relativeMonthValue';

var layers = [DATE_LAYER, MONTH_LAYER, YEAR_LAYER];
var positionFromBoundingKeyMapper = {
    left: 'left',
    top: 'bottom'
};
var dateKeys = ['dd', 'd'];
var monthKeys = ['mm', 'm'];
var yearKeys = ['yyyy', 'yy', 'y'];

/**
 * A number, or a string containing a number.
 * @typedef {Object} dateHash
 * @property {number} year - 1970~2999
 * @property {number} month - 1~12
 * @property {number} date - 1~31
 */

/**
 * @typedef {Function} Calendar
 * @see {@link https://github.com/nhnent/tui.component.calendar}
 */

/**
 * Create DatePicker<br>
 * You can get a date from 'getYear', 'getMonth', 'getDayInMonth', 'getDateHash'
 * @constructor
 * @param {Object} option - Options
 *      @param {HTMLElement|string|jQuery} option.element - Input element(or selector) of DatePicker
 *      @param {dateHash|'blank'} [option.date = today] - Initial date object. If no want initial datetime, type "blank"
 *      @param {string} [option.dateFormat = 'yyyy-mm-dd'] - Date string format
 *      @param {string} [option.defaultCentury = 20] - Default century for 'yy' format.
 *      @param {HTMLElement|string|jQuery} [option.parentElement] - The wrapper element will be inserted into
 *           this element. (since 1.3.0)
 *      @param {string} [option.selectableClassName = 'selectable'] - For selectable date elements
 *      @param {string} [option.selectedClassName = 'selected'] - For selected date element
 *      @param {boolean} [option.enableSetDateByEnterKey = true] - Set date when the 'Enter' key pressed (since 1.3.0)
 *      @param {Array.<Array.<dateHash>>} [options.selectableRanges] - Selectable date ranges.
 *                                                                      See this example "{@tutorial sample5}"
 *      @param {Object} [option.pos] - calendar position style value
 *          @param {number} [option.pos.left] - position left of calendar
 *          @param {number} [option.pos.top] - position top of calendar
 *          @param {number} [option.pos.zIndex] - z-index of calendar
 *      @param {Object} [option.openers = [element]] - opener button list (example - icon, button, etc.)
 *      @param {boolean} [option.showAlways = false] - whether the datepicker shows the calendar always
 *      @param {boolean} [option.useTouchEvent = true] - whether the datepicker uses touch events
 *      @param {TimePicker} [option.timePicker] - TimePicker instance
 * @param {Calendar} calendar - Calendar instance
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
 *       dateFormat: 'yyyy년 mm월 dd일 - ',
 *       //dateFormat: 'yyyy년 mm월',
 *       //dateFormat: 'yyyy년',
 *       date: {year: 2015, month: 1, date: 1}, // or string literal 'blank' without default date assign
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
 *
 * @tutorial sample1
 * @tutorial sample2
 * @tutorial sample5
 * @tutorial sample6
 */
var DatePicker = util.defineClass(/** @lends DatePicker.prototype */{
    init: function(option, calendar) {
        // set defaults
        option = extend({
            dateFormat: 'yyyy-mm-dd ',
            defaultCentury: '20',
            disabledClassName: 'disabled',
            selectableClassName: 'selectable',
            selectedClassName: 'selected',
            selectableRanges: [],
            enableSetDateByEnterKey: true,
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
        this._$wrapperElement = $(WRAPPER_TAG);

        /**
         * Format of date string
         * @type {string}
         * @private
         */
        this._dateFormat = option.dateForm || option.dateFormat;

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
         * @see {DatePicker.prototype.setDateForm}
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
         * Whether set date from the input value when the 'Enter' key pressed
         * @type {Boolean}
         * @since 1.3.0
         * @private
         */
        this._enableSetDateByEnterKey = option.enableSetDateByEnterKey;

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
         * Index of shown layer
         * @type {number}
         * @private
         */
        this._shownLayerIdx = 0;

        /**
         * State of picker enable
         * @type {boolean}
         * @private
         * @since 1.4.0
         */
        this._enabledState = true;

        /**
         * Class name for disabled date element
         * @type {string}
         * @private
         * @since 1.4.0
         */
        this._disabledClassName = option.disabledClassName;

        /**
         * Whether the datepicker shows always
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
        this._ranges = this._filterValidRanges(this._ranges);

        this._detachCalendarEvent();
        this._setSelectableRanges();
        this._setWrapperElement(option.parentElement);
        this._setDefaultDate(option.date);
        this._setDefaultPosition(option.pos);
        this._setProxyHandlers();
        this._setOpeners(option.openers);
        this._bindKeydownEvent(this._$element);
        this._setTimePicker(option.timePicker);
        this.setDateForm();

        this._$wrapperElement.hide();
        this._calendar.$element.show();
    },

    /**
     * Looks through each value in the ranges, returning an array of only valid ranges.
     * @param {Array.<Array.<dateHash>>} ranges - ranges
     * @returns {Array.<Array.<dateHash>>} filtered ranges
     * @private
     */
    _filterValidRanges: function(ranges) {
        var startHash, endHash;

        return util.filter(ranges, function(range) {
            startHash = range[0];
            endHash = range[1];
            this._setHashInRange(startHash, endHash);

            return (this._isValidDateHash(startHash) && this._isValidDateHash(endHash));
        }, this);
    },

    /**
     * Detach event on calendar
     * @private
     */
    _detachCalendarEvent: function() {
        this._calendar.detachEventToBody();
    },

    /**
     * Set wrapper element(= container)
     * @param {HTMLElement|jQuery} [parentElement] - parent element
     * @private
     */
    _setWrapperElement: function(parentElement) {
        var $wrapperElement = this._$wrapperElement;
        var $parentElement = $(parentElement);

        $wrapperElement.append(this._calendar.$element);

        if ($parentElement[0]) {
            $wrapperElement.appendTo($parentElement);
        } else if (this._$element[0]) {
            $wrapperElement.insertAfter(this._$element);
        } else {
            $wrapperElement.appendTo(document.body);
        }
    },

    /**
     * Set default date
     * @param {dateHash|string} opDate - user setting: date
     * @private
     * @todo Refactor: Integrate with "setDate" method.
     */
    _setDefaultDate: function(opDate) {
        if (/^blank$/i.test(opDate)) {
            return;
        }

        if (!opDate) {
            opDate = dateUtil.getToday();
        } else {
            opDate = {
                year: dateUtil.getSafeNumber(opDate.year, MIN_YEAR),
                month: dateUtil.getSafeNumber(opDate.month, 1),
                date: dateUtil.getSafeNumber(opDate.date, 1)
            };
        }

        this._setShownLayerIndexByForm();
        if (this._isSelectable(opDate, this._getCurrentLayer())) {
            this._date = opDate;
        }
    },

    /**
     * Save default style-position of calendar
     * @param {Object} opPos [option.pos] - user setting: position(left, top, zIndex)
     * @private
     */
    _setDefaultPosition: function(opPos) {
        var pos = this._pos = opPos || {};
        var bound = this._getBoundingClientRect();

        if (!isNumber(pos.zIndex)) {
            pos.zIndex = 9999;
        }

        util.forEach(positionFromBoundingKeyMapper, function(boundingKey, posKey) {
            if (!isNumber(pos[posKey])) {
                pos[posKey] = bound[boundingKey] || 0;
            }
        });
    },

    /**
     * Set start/end edge from selectable-ranges
     * @private
     */
    _setSelectableRanges: function() {
        this._startTimes = [];
        this._endTimes = [];

        forEach(this._ranges, function(range) {
            this._updateTimeRange({
                start: dateUtil.getTime(range[0]),
                end: dateUtil.getTime(range[1])
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
        return dateUtil.search(this._startTimes, timestamp);
    },

    /**
     * Search timestamp in endTimes
     * @private
     * @param {number} timestamp - timestamp
     * @returns {{found: boolean, index: number}} result
     */
    _searchEndTime: function(timestamp) {
        return dateUtil.search(this._endTimes, timestamp);
    },

    /**
     * Store opener element list
     * @param {Array} opOpeners [option.openers] - opener element list
     * @private
     */
    _setOpeners: function(opOpeners) {
        this.addOpener(this._$element);
        forEach(opOpeners, function(opener) {
            this.addOpener(opener);
        }, this);
    },

    /**
     * Set TimePicker instance
     * @param {TimePicker} [opTimePicker] - TimePicker instance
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
        var onChangeTimePicker = bind(this.setDate, this);

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
        return isNumber(year) && year >= MIN_YEAR && year <= MAX_YEAR;
    },

    /**
     * Check validation of a month
     * @param {number} month - month
     * @returns {boolean} - whether the month is valid or not
     * @private
     */
    _isValidMonth: function(month) {
        return isNumber(month) && month > 0 && month < 13;
    },

    /**
     * Whether the day-in-month is valid
     * @param {number} year - year
     * @param {number} month - month
     * @param {number} date - date
     * @returns {boolean}
     * @private
     */
    _isValidDayInMonth: function(year, month, date) {
        return isNumber(date) && (date > 0) && (date <= dateUtil.getLastDayInMonth(year, month));
    },

    /**
     * Whether the values in a dateHash are valid
     * @param {dateHash} dateHash - dateHash
     * @returns {boolean}
     * @private
     */
    _isValidDateHash: function(dateHash) {
        var year, month, date;

        if (!dateHash) {
            return false;
        }

        year = dateHash.year || this._date.year;
        month = dateHash.month || this._date.month;
        date = dateHash.date || this._date.date;

        return this._isValidYear(year) && this._isValidMonth(month) && this._isValidDayInMonth(year, month, date);
    },

    /**
     * Check an element is an opener.
     * @param {HTMLElement} target element
     * @returns {boolean} - opener true/false
     * @private
     */
    _isOpener: function(target) {
        var result = false;
        var openers = this._openers;
        var i = 0;
        var len = openers.length;

        for (; i < len; i += 1) {
            if (target === openers[i] || $.contains(openers[i], target)) {
                result = true;
                break;
            }
        }

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

        date = extend({}, this._date, date);

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
     * @returns {string} - formed date-string
     * @private
     */
    _makeDateString: function() {
        var year = this._date.year,
            month = this._date.month,
            date = this._date.date,
            format = this._dateFormat,
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

        dateString = format.replace(formatRegExp, function(key) {
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
            if (formOrder[0]) {
                resultDate[formOrder[0]] = Number(RegExp.$1);
            }

            if (formOrder[1]) {
                resultDate[formOrder[1]] = Number(RegExp.$2);
            }

            if (formOrder[2]) {
                resultDate[formOrder[2]] = Number(RegExp.$3);
            }
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
     * @param {string} [layerType = DATE_LAYER] - YEAR_LAYER | MONTH_LAYER | default
     * @returns {boolean} - Whether a dateHash is selectable
     * @private
     */
    _isSelectable: function(dateHash, layerType) {
        var startTimes = this._startTimes;
        var startTime, searchResult, timestamp, comparingLevel;

        dateHash = extend({}, dateHash);
        switch (layerType) {
            case YEAR_LAYER:
                dateHash.month = 1;
                dateHash.date = 1;
                comparingLevel = YEAR_TO_MS;
                break;
            case MONTH_LAYER:
                dateHash.date = 1;
                comparingLevel = MONTH_TO_MS;
                break;
            default:
                break;
        }

        if (!this._isValidDateHash(dateHash)) {
            return false;
        }
        if (!startTimes.length) { // No ranges. All dates are selectable.
            return true;
        }

        timestamp = dateUtil.getTime(dateHash);
        searchResult = this._searchEndTime(timestamp);
        startTime = startTimes[searchResult.index];

        return searchResult.found || isGreaterThanOrEqualTo(timestamp, startTime, comparingLevel);
    },

    /**
     * Set selectable-class-name to selectable date element.
     * @param {jQuery} $element - date element
     * @param {dateHash} dateHash - date object
     * @param {string} layerType - YEAR_LAYER | MONTH_LAYER | DATE_LAYER
     * @private
     */
    _setSelectableClassName: function($element, dateHash, layerType) {
        if (this._isSelectable(dateHash, layerType)) {
            $element.addClass(this._selectableClassName);
        }
    },

    /**
     * Set selected-class-name to selected date element
     * @param {HTMLElement|jQuery} element - date element
     * @param {{year: number, month: number, date: number}} dateHash - date object
     * @param {string} layerType - YEAR_LAYER | MONTH_LAYER | DATE_LAYER
     * @private
     */
    _setSelectedClassName: function(element, dateHash, layerType) {
        var curDateHash = this._date;
        var isSelected;

        switch (layerType) {
            case MONTH_LAYER:
                dateHash.date = curDateHash.date;
                break;
            case YEAR_LAYER:
                dateHash.date = curDateHash.date;
                dateHash.month = curDateHash.month;
                break;
            default:
                break;
        }

        isSelected = dateUtil.isEqualDateHash(curDateHash, dateHash);
        if (isSelected) {
            $(element).addClass(this._selectedClassName);
        }
    },

    /**
     * Set value a date-string of current this instance to input element
     * @private
     */
    _setValueToInputElement: function() {
        var dateString, timeString;

        if (!this._date) {
            return;
        }

        dateString = this._makeDateString();
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
        var regExpStr = '^';
        var formOrder = this._formOrder;

        var matchedKeys = this._dateFormat.match(formatRegExp);
        util.forEach(matchedKeys, function(key, index) {
            key = key.toLowerCase();
            regExpStr += (mapForConverting[key].expression + '[\\D\\s]*');
            formOrder[index] = mapForConverting[key].type;
        });

        this._regExp = new RegExp(regExpStr, 'gi');
    },

    /**
     * Set event handlers to bind context and then store.
     * @private
     */
    _setProxyHandlers: function() {
        var proxies = this._proxyHandlers;

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
     * @todo refactor - complexity
     * @private
     */
    _onClickCalendar: function(event) {
        var target = event.target;
        var className = target.className;
        var value = (target.innerText || target.textContent || target.nodeValue);
        var shownLayerIdx = this._calendar.shownLayerIdx;
        var shownDate = this._calendar.getDate();
        var startLayerIdx = this._shownLayerIdx;
        var dateHash, relativeMonth;

        if (className.indexOf('prev-month') > -1) {
            relativeMonth = -1;
        } else if (className.indexOf('next-month') > -1) {
            relativeMonth = 1;
        } else {
            relativeMonth = $(target).data(RELATIVE_MONTH_VALUE_KEY) || 0;
        }

        shownDate.date = (!shownLayerIdx) ? Number(value) : 1;
        dateHash = dateUtil.getRelativeDate(0, relativeMonth, 0, shownDate);

        if (startLayerIdx === shownLayerIdx) {
            this.setDate(dateHash.year, dateHash.month, dateHash.date);

            /**
             * Pick event
             * @event DatePicker#pick
             * @example
             * datepicker.on('pick', function() {
             *      return false; // Cancel to close layer
             *      // return true; // Layer is closed
             * });
             */
            if (!this.invoke('pick')) {
                return;
            }

            if (!this.showAlways) {
                this.close();
            }
        } else { // move previous layer
            this._calendar.draw(dateHash.year, dateHash.month, false, shownLayerIdx - 1);
        }
    },

    /**
     * Event handler for click of opener-element
     * @private
     */
    _onClickOpener: function() {
        var isOpened = this.isOpened();

        if (isOpened) {
            this.close();
        } else {
            this.open();
        }
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
     * @todo The eventData of calendar-'draw' should have a property indicating what is a being drawn layer.
     */
    _onDrawCalendar: function(eventData) {
        var $dateContainer = eventData.$dateContainer;
        var classNames = $dateContainer.attr('class');
        var dateHash = {
            year: eventData.year,
            month: eventData.month || 1,
            date: eventData.date || 1
        };
        var layerType;

        // 'date' and 'month' classNames can be duplicated (ex-'calendar-date.calendar-prev-month').
        // If the above 'todo' is resolved, this conditional statements are unnecessary.
        if (classNames.indexOf(DATE_LAYER) > -1) {
            layerType = DATE_LAYER;
        } else if (classNames.indexOf(MONTH_LAYER) > -1) {
            layerType = MONTH_LAYER;
        } else if (classNames.indexOf(YEAR_LAYER) > -1) {
            layerType = YEAR_LAYER;
        }

        this._setSelectableClassName($dateContainer, dateHash, layerType);
        if (this._date) {
            this._setSelectedClassName($dateContainer, dateHash, layerType);
        }
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
        var $header = this._calendar.$header;
        var $prevBtn = $header.find('[class*="btn-prev"]').hide();
        var $nextBtn = $header.find('[class*="btn-next"]').hide();
        var diffTime = this._getDiffTime();

        if (diffTime.start > 0) {
            $prevBtn.show();
        }

        if (diffTime.end > 0) {
            $nextBtn.show();
        }
    },

    /**
     * Bind keydown event handler to the target element
     * @param {jQuery} $targetEl - target element
     * @private
     */
    _bindKeydownEvent: function($targetEl) {
        if (this._enableSetDateByEnterKey) {
            $targetEl.on('keydown', this._proxyHandlers.onKeydownElement);
        }
    },

    /**
     * Unbind keydown event handler from the target element
     * @param {jQuery} $targetEl - target element
     * @private
     */
    _unbindKeydownEvent: function($targetEl) {
        if (this._enableSetDateByEnterKey) {
            $targetEl.off('keydown', this._proxyHandlers.onKeydownElement);
        }
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
     * Bind click event of opener
     * @param {HTMLElement|jQuery} element - Opener element
     * @private
     */
    _bindOnClickOpener: function(element) {
        var eventType = (this.useTouchEvent) ? 'touchend' : 'click';
        $(element).on(eventType, this._proxyHandlers.onClickOpener);
    },

    /**
     * Unbind click event of opener
     * @param {jQuery} element - Opener element
     * @private
     */
    _unbindOnClickOpener: function(element) {
        var eventType = (this.useTouchEvent) ? 'touchend' : 'click';
        $(element).on(eventType, this._proxyHandlers.onClickOpener);
    },

    /**
     * Get current layer type
     * @returns {string}
     * @private
     */
    _getCurrentLayer: function() {
        return layers[this._shownLayerIdx];
    },

    /**
     * Whether the layer-type should be shown.
     * @param {string} type - layer type (YEAR_LAYER, MONTH_LAYER, DATE_LAYER)
     * @returns {boolean}
     * @private
     */
    _shouldShowLayer: function(type) {
        var matchedLayers = this._dateFormat.match(formatRegExp);
        var functor = function(val) {
            return matchedLayers.indexOf(val) > -1;
        };
        var candidates;

        switch (type) {
            case DATE_LAYER:
                candidates = dateKeys;
                break;
            case MONTH_LAYER:
                candidates = monthKeys;
                break;
            case YEAR_LAYER:
                candidates = yearKeys;
                break;
            default:
                return false;
        }

        return !!util.filter(candidates, functor).length;
    },

    /**
     * Set shown layer by format
     * @private
     */
    _setShownLayerIndexByForm: function() {
        var layerIdx = 0;

        if (this._shouldShowLayer(YEAR_LAYER)) {
            layerIdx = layers.indexOf(YEAR_LAYER);
        }
        if (this._shouldShowLayer(MONTH_LAYER)) {
            layerIdx = layers.indexOf(MONTH_LAYER);
        }
        if (this._shouldShowLayer(DATE_LAYER)) {
            layerIdx = layers.indexOf(DATE_LAYER);
        }

        this._shownLayerIdx = layerIdx;
    },

    /**
     * Set hash date in range
     * @param {Object} startHash - Start date
     * @param {Object} endHash - End date
     * @private
     */
    _setHashInRange: function(startHash, endHash) {
        startHash.month = startHash.month || 1;
        endHash.month = endHash.month || 12;

        startHash.date = startHash.date || 1;
        endHash.date = endHash.date || dateUtil.getLastDayInMonth(endHash.year, endHash.month);
    },

    /**
     * Get difference start to end time
     * @private
     * @returns {Object} Time difference value
     */
    _getDiffTime: function() {
        var shownLayerIdx = this._calendar.shownLayerIdx;
        var shownDateHash = this._calendar.getDate();
        var shownDate = new Date(shownDateHash.year, shownDateHash.month - 1);
        var startDate = new Date(this._startTimes[0] || MIN_EDGE).setDate(1);
        var endDate = new Date(this._endTimes.slice(-1)[0] || MAX_EDGE).setDate(1);
        var yearRange, shownStartDate, shownEndDate, startDifference, endDifference;

        if (shownLayerIdx === 0) {
            startDifference = shownDate - startDate;
            endDifference = endDate - shownDate;
        } else if (shownLayerIdx === 1) {
            shownStartDate = new Date(shownDate).setMonth(0);
            shownEndDate = new Date(shownDate).setMonth(11);

            startDifference = shownStartDate - startDate;
            endDifference = endDate - shownEndDate;
        } else if (shownLayerIdx === 2) {
            yearRange = this._calendar._getInfoOfYearRange(shownDateHash.year);
            shownStartDate = Number(new Date(yearRange.startYear, 0));
            shownEndDate = Number(new Date(yearRange.endYear, 0));

            startDate = new Date(startDate).setMonth(0);
            endDate = new Date(endDate).setMonth(0);

            startDifference = shownStartDate - startDate;
            endDifference = endDate - shownEndDate;
        }

        return {
            start: startDifference,
            end: endDifference
        };
    },

    /**
     * Add a range
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
        startHash = extend({}, startHash);
        endHash = extend({}, endHash);

        this._setHashInRange(startHash, endHash);

        if (this._isValidDateHash(startHash) && this._isValidDateHash(endHash)) {
            this._ranges.push([startHash, endHash]);
            this._setSelectableRanges();
            this._calendar.draw(0, 0, false, this._shownLayerIdx);
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
        var ranges = this._ranges;
        var i = 0;
        var len = ranges.length;
        var target;

        startHash = extend({}, startHash);
        endHash = extend({}, endHash);

        this._setHashInRange(startHash, endHash);

        target = [startHash, endHash];

        for (; i < len; i += 1) {
            if (compareJSON(target, ranges[i])) {
                ranges.splice(i, 1);
                break;
            }
        }

        this._setSelectableRanges();
        this._calendar.draw(0, 0, false, this._shownLayerIdx);
    },

    /**
     * Set selectable ranges
     * @param {Array.<Array.<dateHash>>} ranges - The same with the selectableRanges option values
     * @since 1.3.0
     */
    setRanges: function(ranges) {
        this._ranges = this._filterValidRanges(ranges);
        this._setSelectableRanges();
    },

    /**
     * Set position-left, top of calendar
     * @param {number} x - position-left
     * @param {number} y - position-top
     * @since 1.1.1
     */
    setXY: function(x, y) {
        var pos = this._pos;

        pos.left = isNumber(x) ? x : pos.left;
        pos.top = isNumber(y) ? y : pos.top;
        this._arrangeLayer();
    },

    /**
     * Set z-index of calendar
     * @param {number} zIndex - z-index value
     * @since 1.1.1
     */
    setZIndex: function(zIndex) {
        if (!isNumber(zIndex)) {
            return;
        }

        this._pos.zIndex = zIndex;
        this._arrangeLayer();
    },

    /**
     * add opener
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
     * @example
     * datepicker.open();
     */
    open: function() {
        var date;

        if (this.isOpened() || !this._enabledState) {
            return;
        }

        date = this._date || dateUtil.getToday();

        this._arrangeLayer();
        this._bindCalendarCustomEvent();
        this._calendar.draw(date.year, date.month, false, this._shownLayerIdx);
        this._$wrapperElement.show();
        if (!this.showAlways) {
            this._bindOnMousedownDocument();
        }

        /**
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
     * @returns {?dateHash} - dateHash having year, month and day-in-month
     * @example
     * // 2015-04-13
     * datepicker.getDateHash(); // {year: 2015, month: 4, date: 13}
     */
    getDateHash: function() {
        var dateHash, depthIdx;

        if (!this._date) {
            return null;
        }

        dateHash = {};
        depthIdx = this._shownLayerIdx;

        extend(dateHash, this._date);

        if (depthIdx > 1) {
            delete dateHash.month;
        }

        if (depthIdx > 0) {
            delete dateHash.date;
        }

        return dateHash;
    },

    /**
     * Return year
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
     * @param {string|number} [year] - year
     * @param {string|number} [month] - month
     * @param {string|number} [date] - day in month
     * @example
     * datepicker.setDate(2014, 12, 3); // 2014-12- 03
     * datepicker.setDate(null, 11, 23); // 2014-11-23
     * datepicker.setDate('2015', '5', 3); // 2015-05-03
     * datepicker.setDate(2016, 10); // 2016-10
     * datepicker.setDate(2017); // 2017
     */
    setDate: function(year, month, date) {
        var dateObj = this._date || dateUtil.getToday();
        var prevDateObj = extend({}, this._date);
        var currentLayer = this._getCurrentLayer();
        var newDateObj = {
            year: year || dateObj.year,
            month: month || dateObj.month,
            date: date || dateObj.date
        };
        var shouldUpdate = (
            this._isSelectable(newDateObj, currentLayer)
            && !dateUtil.isEqualDateHash(prevDateObj, newDateObj)
        );

        if (shouldUpdate) {
            this._date = newDateObj;
            this._setValueToInputElement();
            this._calendar.draw(newDateObj.year, newDateObj.month, false, currentLayer);
            /**
             * Update event
             * @event DatePicker#update
             */
            this.fire('update');
        } else {
            this._setValueToInputElement();
        }
    },

    /**
     * Set or update date-form
     * @param {String} [format] - date-format
     * @example
     * datepicker.setDateForm('yyyy-mm-dd');
     * datepicker.setDateForm('mm-dd, yyyy');
     * datepicker.setDateForm('y/m/d');
     * datepicker.setDateForm('yy/mm/dd');
     */
    setDateForm: function(format) {
        this._dateFormat = format || this._dateFormat;

        this._setShownLayerIndexByForm();
        this._setRegExp();
        if (this._date) {
            this.setDate();
        }
    },

    /**
     * Return whether the calendar is opened or not
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
     * @returns {TimePicker} - TimePicker instance
     * @example
     * var timepicker = this.getTimepicker();
     */
    getTimePicker: function() {
        return this._timePicker;
    },

    /**
     * Set input element of this instance
     * @param {HTMLElement|jQuery} element - input element
     * @since 1.3.0
     */
    setElement: function(element) {
        var $currentEl = this._$element;
        var $newEl = $(element);

        if ($currentEl[0]) {
            this.removeOpener($currentEl);
            this._unbindKeydownEvent($currentEl);
        }

        this.addOpener($newEl);
        this._bindKeydownEvent($newEl);
        this._setDateFromString($newEl.val());
        this._$element = $newEl;
    },

    /**
     * Enable picker
     * @since 1.4.0
     * @example
     * datepicker.disable();
     * datepicker.enable();
     */
    enable: function() {
        var $openerEl;

        if (this._enabledState) {
            return;
        }
        this._enabledState = true;

        forEach(this._openers, function(openerEl, idx) {
            $openerEl = $(openerEl);
            $openerEl.removeAttr('disabled');
            $openerEl.removeClass(this._disabledClassName);
            this._bindOnClickOpener($openerEl);

            if (!idx) {
                this._bindKeydownEvent($openerEl);
            }
        }, this);
    },

    /**
     * Disable picker
     * @since 1.4.0
     * @example
     * datepicker.enable();
     * datepicker.disable();
     */
    disable: function() {
        var $openerEl;

        if (!this._enabledState) {
            return;
        }

        this._enabledState = false;
        this.close();

        forEach(this._openers, function(openerEl, idx) {
            $openerEl = $(openerEl);
            $openerEl.addClass(this._disabledClassName);
            $openerEl.prop('disabled', true);
            this._unbindOnClickOpener($openerEl);
            if (!idx) {
                this._unbindKeydownEvent($openerEl);
            }
        }, this);
    },

    /**
     * Destroy - delete wrapper element and attach events
     * @since 1.4.0
     */
    destroy: function() {
        var $currentEl = this._$element;

        if ($currentEl[0]) {
            this._unbindKeydownEvent($currentEl);
        }

        this._unbindOnMousedownDocument();
        this._unbindOnClickCalendar();
        this._unbindCalendarCustomEvent();
        this._$wrapperElement.remove();
    }
});

util.CustomEvents.mixin(DatePicker);

module.exports = DatePicker;
