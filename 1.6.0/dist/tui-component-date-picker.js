/*!
 * tui-component-date-picker.js
 * @version 1.6.0
 * @author NHNEnt FE Development Lab <dl_javascript@nhnent.com>
 * @license MIT
 */
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "dist";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var DatePicker = __webpack_require__(1);
	var TimePicker = __webpack_require__(3);
	var Spinbox = __webpack_require__(4);
	
	tui.util.defineNamespace('tui.component', {
	    DatePicker: DatePicker,
	    TimePicker: TimePicker,
	    Spinbox: Spinbox
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview This component provides a calendar for picking a date & time.
	 * @author NHN ent FE dev Lab <dl_javascript@nhnent.com>
	 */
	'use strict';
	
	var dateUtil = __webpack_require__(2);
	
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


/***/ },
/* 2 */
/***/ function(module, exports) {

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


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview TimePicker Component
	 * @author NHN ent FE Lab <dl_javascript@nhnent.com> <minkyu.yi@nhnent.com>
	 * @dependency jquery-1.8.3, code-snippet-1.0.2, spinbox.js
	 */
	
	'use strict';
	
	var Spinbox = __webpack_require__(4);
	var utils = __webpack_require__(2);
	
	var util = tui.util;
	var timeRegExp = /\s*(\d{1,2})\s*:\s*(\d{1,2})\s*([ap][m])?(?:[\s\S]*)/i;
	var timeSeperator = /\s+|:/g;
	var timePickerTag = '<table class="timepicker"><tr class="timepicker-row"></tr></table>';
	var columnTag = '<td class="timepicker-column"></td>';
	var spinBoxTag = '<td class="timepicker-column timepicker-spinbox">' +
	                '<div><input type="text" class="timepicker-spinbox-input"></div></td>';
	var upBtnTag = '<button type="button" class="timepicker-btn timepicker-btn-up"><b>+</b></button>';
	var downBtnTag = '<button type="button" class="timepicker-btn timepicker-btn-down"><b>-</b></button>';
	var meridiemTag = '<select><option value="AM">AM</option><option value="PM">PM</option></select>';
	
	/**
	 * @constructor
	 * @param {Object} [option] - option for initialization
	 *
	 * @param {number} [option.defaultHour = 0] - initial setting value of hour
	 * @param {number} [option.defaultMinute = 0] - initial setting value of minute
	 * @param {HTMLElement} [option.inputElement = null] - optional input element with timepicker
	 * @param {number} [option.hourStep = 1] - step of hour spinbox. if step = 2, hour value 1 -> 3 -> 5 -> ...
	 * @param {number} [option.minuteStep = 1] - step of minute spinbox. if step = 2, minute value 1 -> 3 -> 5 -> ...
	 * @param {Array} [option.hourExclusion = null] - hour value to be excluded.
	 *                                                if hour [1,3] is excluded, hour value 0 -> 2 -> 4 -> 5 -> ...
	 * @param {Array} [option.minuteExclusion = null] - minute value to be excluded.
	 *                                                  if minute [1,3] is excluded, minute value 0 -> 2 -> 4 -> 5 -> ...
	 * @param {boolean} [option.showMeridian = false] - is time expression-"hh:mm AM/PM"?
	 * @param {Object} [option.position = {}] - left, top position of timepicker element
	 *
	 * @tutorial sample3
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
	        this._setTime(this._option.defaultHour, this._option.defaultMinute, false);
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
	        var defaultHour = opt.defaultHour;
	
	        if (opt.showMeridian) {
	            defaultHour = utils.getMeridiemHour(defaultHour);
	        }
	
	        this._hourSpinbox = new Spinbox(spinBoxTag, {
	            defaultValue: defaultHour,
	            min: (opt.showMeridian) ? 1 : 0,
	            max: (opt.showMeridian) ? 12 : 23,
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
	        var opt = this._option;
	        var $tp = $(timePickerTag);
	        var $tpRow = $tp.find('.timepicker-row');
	        var $colon = $(columnTag).addClass('colon').append(':');
	        var $meridian;
	
	        $tpRow.append(this._hourSpinbox.getContainerElement(), $colon, this._minuteSpinbox.getContainerElement());
	
	        if (opt.showMeridian) {
	            $meridian = $(columnTag)
	                .addClass('meridian')
	                .append(meridiemTag);
	            this._$meridianElement = $meridian.find('select').eq(0);
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
	        var inputEl = $input[0];
	        var position = this._option.position;
	        var x = position.x;
	        var y = position.y;
	
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
	
	        this._hourSpinbox.on('change', util.bind(this._onChangeSpinbox, this));
	        this._minuteSpinbox.on('change', util.bind(this._onChangeSpinbox, this));
	
	        this.$timePickerElement.on('change', 'select', util.bind(this._onChangeMeridiem, this));
	    },
	
	    /**
	     * attach event to Input element
	     * @private
	     */
	    _assignEventsToInputElement: function() {
	        var self = this;
	        var $input = this._$inputElement;
	
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
	     * Custom event handler
	     * @param {string} type - Change type on spinbox (type: up, down, defualt)
	     * @private
	     */
	    _onChangeSpinbox: function(type) {
	        var hour = this._hourSpinbox.getValue();
	        var minute = this._minuteSpinbox.getValue();
	
	        if (this._option.showMeridian) {
	            if ((type === 'up' && hour === 12) ||
	                (type === 'down' && hour === 11)) {
	                this._isPM = !this._isPM;
	            }
	            hour = this._getOriginalHour(hour);
	        }
	
	        this._setTime(hour, minute, false);
	    },
	
	    /**
	     * DOM event handler
	     * @param {Event} event - Change event on meridiem element
	     * @private
	     */
	    _onChangeMeridiem: function(event) {
	        var isPM = (event.target.value === 'PM');
	        var currentHour = this._hour;
	        var hour = isPM ? (currentHour + 12) : (currentHour % 12);
	
	        this._setTime(hour, this._minuteSpinbox.getValue(), false);
	    },
	
	    /**
	     * is clicked inside of container?
	     * @param {Event} event event-object
	     * @returns {boolean} result
	     * @private
	     */
	    _isClickedInside: function(event) {
	        var isContains = $.contains(this.$timePickerElement[0], event.target);
	        var isInputElement = (this._$inputElement &&
	                            this._$inputElement[0] === event.target);
	
	        return isContains || isInputElement;
	    },
	
	    /**
	     * transform time into formatted string
	     * @returns {string} time string
	     * @private
	     */
	    _formToTimeFormat: function() {
	        var hour = this._hour;
	        var minute = this._minute;
	        var postfix = this._getPostfix();
	        var formattedHour, formattedMinute;
	
	        if (this._option.showMeridian) {
	            hour = utils.getMeridiemHour(hour);
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
	        if (!util.isNumber(x) || !util.isNumber(y)) {
	            return;
	        }
	
	        util.extend(this._option.position, {
	            x: x,
	            y: y
	        });
	        this.$timePickerElement.css({
	            left: x,
	            top: y
	        });
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
	        var hour = this._hour;
	        var minute = this._minute;
	
	        if (this._option.showMeridian) {
	            hour = utils.getMeridiemHour(hour);
	        }
	
	        this._hourSpinbox.setValue(hour);
	        this._minuteSpinbox.setValue(minute);
	    },
	
	    /**
	     * Get original hour from meridiem hour
	     * @private
	     * @param {hour} hour - Meridiem hour
	     * @returns {number} Original hour
	     */
	    _getOriginalHour: function(hour) {
	        var isPM = this._isPM;
	
	        if (isPM) {
	            hour = (hour < 12) ? (hour + 12) : 12;
	        } else {
	            hour = (hour < 12) ? (hour % 12) : 0;
	        }
	
	        return hour;
	    },
	
	    /**
	     * set time from input element.
	     * @param {HTMLElement|jQuery} [inputElement] jquery object (element)
	     * @returns {boolean} result of set time
	     */
	    setTimeFromInputElement: function(inputElement) {
	        var input = $(inputElement)[0] || this._$inputElement[0];
	
	        return !!(input && this.setTimeFromString(input.value));
	    },
	
	    /**
	     * set hour
	     * @param {number} hour for time picker
	     * @returns {boolean} result of set time
	     */
	    setHour: function(hour) {
	        return this._setTime(hour, this._minute, true);
	    },
	
	    /**
	     * set minute
	     * @param {number} minute for time picker
	     * @returns {boolean} result of set time
	     */
	    setMinute: function(minute) {
	        return this._setTime(this._hour, minute, true);
	    },
	
	    /**
	     * set time for extenal call
	     * @param {number} hour for time picker
	     * @param {number} minute for time picker
	     * @returns {boolean} result of set time
	     */
	    setTime: function(hour, minute) {
	        return this._setTime(hour, minute);
	    },
	
	    /**
	     * set time
	     * @param {number} hour for time picker
	     * @param {number} minute for time picker
	     * @param {boolean} isSetSpinbox whether spinbox set or not
	     * @returns {boolean} result of set time
	     * @private
	     */
	    _setTime: function(hour, minute, isSetSpinbox) {
	        var isNumber = (util.isNumber(hour) && util.isNumber(minute));
	        var isValid = (hour < 24 && minute < 60);
	        var postfix;
	
	        if (!isNumber || !isValid) {
	            return false;
	        }
	
	        this._hour = hour;
	        this._minute = minute;
	
	        this._setIsPM();
	
	        if (isSetSpinbox) {
	            this.toSpinboxes();
	        }
	
	        if (this._$meridianElement) {
	            postfix = this._getPostfix().replace(/\s+/, '');
	            this._$meridianElement.val(postfix);
	        }
	
	        /**
	         * Change event - TimePicker
	         * @event TimePicker#change
	         */
	        this.fire('change', isSetSpinbox);
	
	        return true;
	    },
	
	    /**
	     * set time from time-string
	     * @param {string} timeString time-string
	     * @returns {boolean} result of set time
	     * @todo Refactor: function complexity
	     */
	    setTimeFromString: function(timeString) {
	        var time, hour, minute, postfix, isPM;
	
	        if (timeRegExp.test(timeString)) {
	            time = timeString.split(timeSeperator);
	            hour = Number(time[0]);
	            minute = Number(time[1]);
	
	            if (hour < 24 && this._option.showMeridian) {
	                postfix = time[2].toUpperCase();
	
	                if (postfix === 'PM') {
	                    isPM = true;
	                } else if (postfix === 'AM') {
	                    isPM = (hour > 12);
	                } else {
	                    isPM = this._isPM;
	                }
	
	                if (isPM && hour < 12) {
	                    hour += 12;
	                } else if (!isPM && hour === 12) {
	                    hour = 0;
	                }
	            }
	        }
	
	        return this._setTime(hour, minute, true);
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
	     * @returns {string} 'hh:mm (AM/PM)'
	     */
	    getTime: function() {
	        return this._formToTimeFormat();
	    }
	});
	tui.util.CustomEvents.mixin(TimePicker);
	
	module.exports = TimePicker;


/***/ },
/* 4 */
/***/ function(module, exports) {

	/**
	 * Created by nhnent on 15. 4. 28..
	 * @fileoverview Spinbox Component
	 * @author NHN ent FE dev Lab <dl_javascript@nhnent.com>
	 * @dependency jquery-1.8.3, code-snippet-1.0.2
	 */
	
	'use strict';
	
	var util = tui.util;
	var inArray = util.inArray;
	
	/**
	 * @constructor
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
	 *
	 * @tutorial sample4
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
	
	        /**
	         * @type {string}
	         * @private
	         */
	        this._changeType = 'default';
	
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
	        this._$inputElement.on('focus', util.bind(function() {
	            this._changeType = 'default';
	        }, this));
	    },
	
	    /**
	     * Set input value when user click a button.
	     * @param {boolean} isDown - If a user clicked a down-buttton, this value is true.
	     *                           Else if a user clicked a up-button, this value is false.
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
	
	        this._changeType = isDown ? 'down' : 'up';
	
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
	        var keyCode = event.which || event.keyCode;
	        var isDown;
	
	        switch (keyCode) {
	            case 38:
	                isDown = false;
	                break;
	            case 40:
	                isDown = true;
	                break;
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
	
	        this.fire('change', this._changeType);
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
	     * @returns {HTMLElement} element
	     */
	    getContainerElement: function() {
	        return this._$containerElement[0];
	    }
	});
	
	tui.util.CustomEvents.mixin(Spinbox);
	
	module.exports = Spinbox;


/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMTQ1ZTFlNWQ4YmIzZDdmOTA2NjgiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovLy8uL3NyYy9kYXRlcGlja2VyLmpzIiwid2VicGFjazovLy8uL3NyYy91dGlscy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdGltZXBpY2tlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvc3BpbmJveC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUJBQWU7QUFDZjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7OztBQ3RDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDOzs7Ozs7O0FDVkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMEIsRUFBRSxLQUFLLEVBQUU7QUFDbkM7QUFDQSxNQUFLO0FBQ0w7QUFDQSwyQkFBMEIsRUFBRSxLQUFLLEVBQUU7QUFDbkM7QUFDQSxNQUFLO0FBQ0w7QUFDQSwyQkFBMEIsRUFBRSxLQUFLLEVBQUU7QUFDbkM7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBLCtCQUE4QixFQUFFO0FBQ2hDO0FBQ0EsTUFBSztBQUNMO0FBQ0EsK0JBQThCLEVBQUU7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtEQUFpRDtBQUNqRDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGNBQWEsT0FBTztBQUNwQixlQUFjLE9BQU87QUFDckIsZUFBYyxPQUFPO0FBQ3JCLGVBQWMsT0FBTztBQUNyQjs7QUFFQTtBQUNBLGNBQWEsU0FBUztBQUN0QixVQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLE9BQU87QUFDbEIsaUJBQWdCLDBCQUEwQjtBQUMxQyxpQkFBZ0IsaUJBQWlCO0FBQ2pDLGlCQUFnQixPQUFPO0FBQ3ZCLGlCQUFnQixPQUFPO0FBQ3ZCLGlCQUFnQiwwQkFBMEI7QUFDMUM7QUFDQSxpQkFBZ0IsT0FBTztBQUN2QixpQkFBZ0IsT0FBTztBQUN2QixpQkFBZ0IsUUFBUTtBQUN4QixpQkFBZ0IseUJBQXlCO0FBQ3pDLDRGQUEyRixrQkFBa0I7QUFDN0csaUJBQWdCLE9BQU87QUFDdkIscUJBQW9CLE9BQU87QUFDM0IscUJBQW9CLE9BQU87QUFDM0IscUJBQW9CLE9BQU87QUFDM0IsaUJBQWdCLE9BQU87QUFDdkIsaUJBQWdCLFFBQVE7QUFDeEIsaUJBQWdCLFFBQVE7QUFDeEIsaUJBQWdCLFdBQVc7QUFDM0IsWUFBVyxTQUFTO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU07QUFDTjtBQUNBO0FBQ0EsY0FBYSw2QkFBNkI7QUFDMUMsY0FBYTtBQUNiO0FBQ0E7QUFDQSxjQUFhLDZCQUE2QjtBQUMxQyxjQUFhO0FBQ2I7QUFDQTtBQUNBLGNBQWEsNkJBQTZCO0FBQzFDLGNBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFnQiw4QkFBOEI7QUFDOUM7QUFDQTtBQUNBO0FBQ0EsT0FBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTOztBQUVUO0FBQ0E7QUFDQSxtQkFBa0I7QUFDbEI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxtQkFBa0I7QUFDbEI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxtQkFBa0I7QUFDbEI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxtQkFBa0I7QUFDbEI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxtQkFBa0I7QUFDbEI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxtQkFBa0I7QUFDbEI7QUFDQSxrQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsbUJBQWtCO0FBQ2xCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsbUJBQWtCO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsbUJBQWtCO0FBQ2xCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsbUJBQWtCO0FBQ2xCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsbUJBQWtCO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxtQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLG1CQUFrQjtBQUNsQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsbUJBQWtCO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxtQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLG1CQUFrQjtBQUNsQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsbUJBQWtCO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxtQkFBa0I7QUFDbEI7QUFDQTtBQUNBOztBQUVBO0FB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QUFDQSxjQUFhO0FBQ2I7QUFDQTtBQUNBLFVBQVM7O0FBRVQ7O0FBRUE7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQSxnQkFBZSxNQUFNO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0EsZ0JBQWUsTUFBTTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0EsZ0JBQWUsT0FBTztBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQSxrQkFBaUIsT0FBTztBQUN4QjtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQSxrQkFBaUIsT0FBTztBQUN4QjtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQSxnQkFBZSxPQUFPO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBLGtCQUFpQixPQUFPO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBLGdCQUFlLE9BQU87QUFDdEI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0EsZ0JBQWUsT0FBTztBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBLGtCQUFpQixZQUFZO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQzs7QUFFRDs7QUFFQSIsImZpbGUiOiJ0dWktY29tcG9uZW50LWRhdGUtcGlja2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiZGlzdFwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDE0NWUxZTVkOGJiM2Q3ZjkwNjY4IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgRGF0ZVBpY2tlciA9IHJlcXVpcmUoJy4vZGF0ZXBpY2tlcicpO1xudmFyIFRpbWVQaWNrZXIgPSByZXF1aXJlKCcuL3RpbWVwaWNrZXInKTtcbnZhciBTcGluYm94ID0gcmVxdWlyZSgnLi9zcGluYm94Jyk7XG5cbnR1aS51dGlsLmRlZmluZU5hbWVzcGFjZSgndHVpLmNvbXBvbmVudCcsIHtcbiAgICBEYXRlUGlja2VyOiBEYXRlUGlja2VyLFxuICAgIFRpbWVQaWNrZXI6IFRpbWVQaWNrZXIsXG4gICAgU3BpbmJveDogU3BpbmJveFxufSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhpcyBjb21wb25lbnQgcHJvdmlkZXMgYSBjYWxlbmRhciBmb3IgcGlja2luZyBhIGRhdGUgJiB0aW1lLlxuICogQGF1dGhvciBOSE4gZW50IEZFIGRldiBMYWIgPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZGF0ZVV0aWwgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciB1dGlsID0gdHVpLnV0aWw7XG52YXIgZXh0ZW5kID0gdXRpbC5leHRlbmQ7XG52YXIgYmluZCA9IHV0aWwuYmluZDtcbnZhciBmb3JFYWNoID0gdXRpbC5mb3JFYWNoO1xudmFyIGlzTnVtYmVyID0gdXRpbC5pc051bWJlcjtcbnZhciBjb21wYXJlSlNPTiA9IHV0aWwuY29tcGFyZUpTT047XG52YXIgaXNHcmVhdGVyVGhhbk9yRXF1YWxUbyA9IGZ1bmN0aW9uKGEsIGIsIGNvbXBhcmluZ0xldmVsKSB7XG4gICAgY29tcGFyaW5nTGV2ZWwgPSBjb21wYXJpbmdMZXZlbCB8fCAxO1xuXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoKGEgLyBjb21wYXJpbmdMZXZlbCkpID49IE1hdGguZmxvb3IoKGIgLyBjb21wYXJpbmdMZXZlbCkpO1xufTtcblxudmFyIGluQXJyYXkgPSB1dGlsLmluQXJyYXk7XG52YXIgZm9ybWF0UmVnRXhwID0gL3l5eXl8eXl8bW18bXxkZHxkL2dpO1xudmFyIG1hcEZvckNvbnZlcnRpbmcgPSB7XG4gICAgeXl5eToge1xuICAgICAgICBleHByZXNzaW9uOiAnKFxcXFxkezR9fFxcXFxkezJ9KScsXG4gICAgICAgIHR5cGU6ICd5ZWFyJ1xuICAgIH0sXG4gICAgeXk6IHtcbiAgICAgICAgZXhwcmVzc2lvbjogJyhcXFxcZHs0fXxcXFxcZHsyfSknLFxuICAgICAgICB0eXBlOiAneWVhcidcbiAgICB9LFxuICAgIHk6IHtcbiAgICAgICAgZXhwcmVzc2lvbjogJyhcXFxcZHs0fXxcXFxcZHsyfSknLFxuICAgICAgICB0eXBlOiAneWVhcidcbiAgICB9LFxuICAgIG1tOiB7XG4gICAgICAgIGV4cHJlc3Npb246ICcoMVswMTJdfDBbMS05XXxbMS05XVxcXFxiKScsXG4gICAgICAgIHR5cGU6ICdtb250aCdcbiAgICB9LFxuICAgIG06IHtcbiAgICAgICAgZXhwcmVzc2lvbjogJygxWzAxMl18MFsxLTldfFsxLTldXFxcXGIpJyxcbiAgICAgICAgdHlwZTogJ21vbnRoJ1xuICAgIH0sXG4gICAgZGQ6IHtcbiAgICAgICAgZXhwcmVzc2lvbjogJyhbMTJdXFxcXGR7MX18M1swMV18MFsxLTldfFsxLTldXFxcXGIpJyxcbiAgICAgICAgdHlwZTogJ2RhdGUnXG4gICAgfSxcbiAgICBkOiB7XG4gICAgICAgIGV4cHJlc3Npb246ICcoWzEyXVxcXFxkezF9fDNbMDFdfDBbMS05XXxbMS05XVxcXFxiKScsXG4gICAgICAgIHR5cGU6ICdkYXRlJ1xuICAgIH1cbn07XG52YXIgREFURV9MQVlFUiA9ICdkYXRlJztcbnZhciBNT05USF9MQVlFUiA9ICdtb250aCc7XG52YXIgWUVBUl9MQVlFUiA9ICd5ZWFyJztcbnZhciBNSU5fWUVBUiA9IDE5MDA7XG52YXIgTUFYX1lFQVIgPSAyOTk5O1xudmFyIFdSQVBQRVJfVEFHID0gJzxkaXYgc3R5bGU9XCJwb3NpdGlvbjphYnNvbHV0ZTtcIj48L2Rpdj4nO1xudmFyIE1JTl9FREdFID0gTnVtYmVyKG5ldyBEYXRlKDApKTtcbnZhciBNQVhfRURHRSA9IE51bWJlcihuZXcgRGF0ZSgyOTk5LCAxMSwgMzEpKTtcbnZhciBZRUFSX1RPX01TID0gMzE1MzYwMDAwMDA7XG52YXIgTU9OVEhfVE9fTVMgPSAyNjI4MDAwMDAwO1xudmFyIFJFTEFUSVZFX01PTlRIX1ZBTFVFX0tFWSA9ICdyZWxhdGl2ZU1vbnRoVmFsdWUnO1xuXG52YXIgbGF5ZXJzID0gW0RBVEVfTEFZRVIsIE1PTlRIX0xBWUVSLCBZRUFSX0xBWUVSXTtcbnZhciBwb3NpdGlvbkZyb21Cb3VuZGluZ0tleU1hcHBlciA9IHtcbiAgICBsZWZ0OiAnbGVmdCcsXG4gICAgdG9wOiAnYm90dG9tJ1xufTtcbnZhciBkYXRlS2V5cyA9IFsnZGQnLCAnZCddO1xudmFyIG1vbnRoS2V5cyA9IFsnbW0nLCAnbSddO1xudmFyIHllYXJLZXlzID0gWyd5eXl5JywgJ3l5JywgJ3knXTtcblxuLyoqXG4gKiBBIG51bWJlciwgb3IgYSBzdHJpbmcgY29udGFpbmluZyBhIG51bWJlci5cbiAqIEB0eXBlZGVmIHtPYmplY3R9IGRhdGVIYXNoXG4gKiBAcHJvcGVydHkge251bWJlcn0geWVhciAtIDE5NzB+Mjk5OVxuICogQHByb3BlcnR5IHtudW1iZXJ9IG1vbnRoIC0gMX4xMlxuICogQHByb3BlcnR5IHtudW1iZXJ9IGRhdGUgLSAxfjMxXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7RnVuY3Rpb259IENhbGVuZGFyXG4gKiBAc2VlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vbmhuZW50L3R1aS5jb21wb25lbnQuY2FsZW5kYXJ9XG4gKi9cblxuLyoqXG4gKiBDcmVhdGUgRGF0ZVBpY2tlcjxicj5cbiAqIFlvdSBjYW4gZ2V0IGEgZGF0ZSBmcm9tICdnZXRZZWFyJywgJ2dldE1vbnRoJywgJ2dldERheUluTW9udGgnLCAnZ2V0RGF0ZUhhc2gnXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb24gLSBPcHRpb25zXG4gKiAgICAgIEBwYXJhbSB7SFRNTEVsZW1lbnR8c3RyaW5nfGpRdWVyeX0gb3B0aW9uLmVsZW1lbnQgLSBJbnB1dCBlbGVtZW50KG9yIHNlbGVjdG9yKSBvZiBEYXRlUGlja2VyXG4gKiAgICAgIEBwYXJhbSB7ZGF0ZUhhc2h8J2JsYW5rJ30gW29wdGlvbi5kYXRlID0gdG9kYXldIC0gSW5pdGlhbCBkYXRlIG9iamVjdC4gSWYgbm8gd2FudCBpbml0aWFsIGRhdGV0aW1lLCB0eXBlIFwiYmxhbmtcIlxuICogICAgICBAcGFyYW0ge3N0cmluZ30gW29wdGlvbi5kYXRlRm9ybWF0ID0gJ3l5eXktbW0tZGQnXSAtIERhdGUgc3RyaW5nIGZvcm1hdFxuICogICAgICBAcGFyYW0ge3N0cmluZ30gW29wdGlvbi5kZWZhdWx0Q2VudHVyeSA9IDIwXSAtIERlZmF1bHQgY2VudHVyeSBmb3IgJ3l5JyBmb3JtYXQuXG4gKiAgICAgIEBwYXJhbSB7SFRNTEVsZW1lbnR8c3RyaW5nfGpRdWVyeX0gW29wdGlvbi5wYXJlbnRFbGVtZW50XSAtIFRoZSB3cmFwcGVyIGVsZW1lbnQgd2lsbCBiZSBpbnNlcnRlZCBpbnRvXG4gKiAgICAgICAgICAgdGhpcyBlbGVtZW50LiAoc2luY2UgMS4zLjApXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9uLnNlbGVjdGFibGVDbGFzc05hbWUgPSAnc2VsZWN0YWJsZSddIC0gRm9yIHNlbGVjdGFibGUgZGF0ZSBlbGVtZW50c1xuICogICAgICBAcGFyYW0ge3N0cmluZ30gW29wdGlvbi5zZWxlY3RlZENsYXNzTmFtZSA9ICdzZWxlY3RlZCddIC0gRm9yIHNlbGVjdGVkIGRhdGUgZWxlbWVudFxuICogICAgICBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb24uZW5hYmxlU2V0RGF0ZUJ5RW50ZXJLZXkgPSB0cnVlXSAtIFNldCBkYXRlIHdoZW4gdGhlICdFbnRlcicga2V5IHByZXNzZWQgKHNpbmNlIDEuMy4wKVxuICogICAgICBAcGFyYW0ge0FycmF5LjxBcnJheS48ZGF0ZUhhc2g+Pn0gW29wdGlvbnMuc2VsZWN0YWJsZVJhbmdlc10gLSBTZWxlY3RhYmxlIGRhdGUgcmFuZ2VzLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2VlIHRoaXMgZXhhbXBsZSBcIntAdHV0b3JpYWwgc2FtcGxlNX1cIlxuICogICAgICBAcGFyYW0ge09iamVjdH0gW29wdGlvbi5wb3NdIC0gY2FsZW5kYXIgcG9zaXRpb24gc3R5bGUgdmFsdWVcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLnBvcy5sZWZ0XSAtIHBvc2l0aW9uIGxlZnQgb2YgY2FsZW5kYXJcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLnBvcy50b3BdIC0gcG9zaXRpb24gdG9wIG9mIGNhbGVuZGFyXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gW29wdGlvbi5wb3MuekluZGV4XSAtIHotaW5kZXggb2YgY2FsZW5kYXJcbiAqICAgICAgQHBhcmFtIHtPYmplY3R9IFtvcHRpb24ub3BlbmVycyA9IFtlbGVtZW50XV0gLSBvcGVuZXIgYnV0dG9uIGxpc3QgKGV4YW1wbGUgLSBpY29uLCBidXR0b24sIGV0Yy4pXG4gKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbi5zaG93QWx3YXlzID0gZmFsc2VdIC0gd2hldGhlciB0aGUgZGF0ZXBpY2tlciBzaG93cyB0aGUgY2FsZW5kYXIgYWx3YXlzXG4gKiAgICAgIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbi51c2VUb3VjaEV2ZW50ID0gdHJ1ZV0gLSB3aGV0aGVyIHRoZSBkYXRlcGlja2VyIHVzZXMgdG91Y2ggZXZlbnRzXG4gKiAgICAgIEBwYXJhbSB7VGltZVBpY2tlcn0gW29wdGlvbi50aW1lUGlja2VyXSAtIFRpbWVQaWNrZXIgaW5zdGFuY2VcbiAqIEBwYXJhbSB7Q2FsZW5kYXJ9IGNhbGVuZGFyIC0gQ2FsZW5kYXIgaW5zdGFuY2VcbiAqIEBleGFtcGxlXG4gKiAgIHZhciBjYWxlbmRhciA9IG5ldyB0dWkuY29tcG9uZW50LkNhbGVuZGFyKHtcbiAqICAgICAgIGVsZW1lbnQ6ICcjbGF5ZXInLFxuICogICAgICAgdGl0bGVGb3JtYXQ6ICd5eXl564WEIG3sm5QnLFxuICogICAgICAgdG9kYXlGb3JtYXQ6ICd5eXl564WEIG1t7JuUIGRk7J28IChEKSdcbiAqICAgfSk7XG4gKlxuICogICB2YXIgdGltZVBpY2tlciA9IG5ldyB0dWkuY29tcG9uZW50LlRpbWVQaWNrZXIoe1xuICogICAgICAgc2hvd01lcmlkaWFuOiB0cnVlLFxuICogICAgICAgZGVmYXVsdEhvdXI6IDEzLFxuICogICAgICAgZGVmYXVsdE1pbnV0ZTogMjRcbiAqICAgfSk7XG4gKlxuICogICB2YXIgcmFuZ2UxID0gW1xuICogICAgICAgICAge3llYXI6IDIwMTUsIG1vbnRoOjEsIGRhdGU6IDF9LFxuICogICAgICAgICAge3llYXI6IDIwMTUsIG1vbnRoOjIsIGRhdGU6IDF9XG4gKiAgICAgIF0sXG4gKiAgICAgIHJhbmdlMiA9IFtcbiAqICAgICAgICAgIHt5ZWFyOiAyMDE1LCBtb250aDozLCBkYXRlOiAxfSxcbiAqICAgICAgICAgIHt5ZWFyOiAyMDE1LCBtb250aDo0LCBkYXRlOiAxfVxuICogICAgICBdLFxuICogICAgICByYW5nZTMgPSBbXG4gKiAgICAgICAgICB7eWVhcjogMjAxNSwgbW9udGg6NiwgZGF0ZTogMX0sXG4gKiAgICAgICAgICB7eWVhcjogMjAxNSwgbW9udGg6NywgZGF0ZTogMX1cbiAqICAgICAgXTtcbiAqXG4gKiAgIHZhciBwaWNrZXIxID0gbmV3IHR1aS5jb21wb25lbnQuRGF0ZVBpY2tlcih7XG4gKiAgICAgICBlbGVtZW50OiAnI3BpY2tlcicsXG4gKiAgICAgICBkYXRlRm9ybWF0OiAneXl5eeuFhCBtbeyblCBkZOydvCAtICcsXG4gKiAgICAgICAvL2RhdGVGb3JtYXQ6ICd5eXl564WEIG1t7JuUJyxcbiAqICAgICAgIC8vZGF0ZUZvcm1hdDogJ3l5eXnrhYQnLFxuICogICAgICAgZGF0ZToge3llYXI6IDIwMTUsIG1vbnRoOiAxLCBkYXRlOiAxfSwgLy8gb3Igc3RyaW5nIGxpdGVyYWwgJ2JsYW5rJyB3aXRob3V0IGRlZmF1bHQgZGF0ZSBhc3NpZ25cbiAqICAgICAgIHNlbGVjdGFibGVSYW5nZXM6IFtyYW5nZTEsIHJhbmdlMiwgcmFuZ2UzXSxcbiAqICAgICAgIG9wZW5lcnM6IFsnI29wZW5lciddLFxuICogICAgICAgdGltZVBpY2tlcjogdGltZVBpY2tlclxuICogICB9LCBjYWxlbmRhcik7XG4gKlxuICogICAvLyBDbG9zZSBjYWxlbmRhciB3aGVuIHNlbGVjdCBhIGRhdGVcbiAqICAgJCgnI2xheWVyJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAqICAgICAgIHZhciAkZWwgPSAkKGV2ZW50LnRhcmdldCk7XG4gKlxuICogICAgICAgaWYgKCRlbC5oYXNDbGFzcygnc2VsZWN0YWJsZScpKSB7XG4gKiAgICAgICAgICAgcGlja2VyMS5jbG9zZSgpO1xuICogICAgICAgfVxuICogICB9KTtcbiAqXG4gKiBAdHV0b3JpYWwgc2FtcGxlMVxuICogQHR1dG9yaWFsIHNhbXBsZTJcbiAqIEB0dXRvcmlhbCBzYW1wbGU1XG4gKiBAdHV0b3JpYWwgc2FtcGxlNlxuICovXG52YXIgRGF0ZVBpY2tlciA9IHV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBEYXRlUGlja2VyLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb24sIGNhbGVuZGFyKSB7XG4gICAgICAgIC8vIHNldCBkZWZhdWx0c1xuICAgICAgICBvcHRpb24gPSBleHRlbmQoe1xuICAgICAgICAgICAgZGF0ZUZvcm1hdDogJ3l5eXktbW0tZGQgJyxcbiAgICAgICAgICAgIGRlZmF1bHRDZW50dXJ5OiAnMjAnLFxuICAgICAgICAgICAgZGlzYWJsZWRDbGFzc05hbWU6ICdkaXNhYmxlZCcsXG4gICAgICAgICAgICBzZWxlY3RhYmxlQ2xhc3NOYW1lOiAnc2VsZWN0YWJsZScsXG4gICAgICAgICAgICBzZWxlY3RlZENsYXNzTmFtZTogJ3NlbGVjdGVkJyxcbiAgICAgICAgICAgIHNlbGVjdGFibGVSYW5nZXM6IFtdLFxuICAgICAgICAgICAgZW5hYmxlU2V0RGF0ZUJ5RW50ZXJLZXk6IHRydWUsXG4gICAgICAgICAgICBzaG93QWx3YXlzOiBmYWxzZSxcbiAgICAgICAgICAgIHVzZVRvdWNoRXZlbnQ6IHRydWVcbiAgICAgICAgfSwgb3B0aW9uKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2FsZW5kYXIgaW5zdGFuY2VcbiAgICAgICAgICogQHR5cGUge0NhbGVuZGFyfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fY2FsZW5kYXIgPSBjYWxlbmRhcjtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRWxlbWVudCBmb3IgZGlzcGxheWluZyBhIGRhdGUgdmFsdWVcbiAgICAgICAgICogQHR5cGUge0hUTUxFbGVtZW50fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fJGVsZW1lbnQgPSAkKG9wdGlvbi5lbGVtZW50KTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRWxlbWVudCB3cmFwcGluZyBjYWxlbmRhclxuICAgICAgICAgKiBAdHlwZSB7SFRNTEVsZW1lbnR9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl8kd3JhcHBlckVsZW1lbnQgPSAkKFdSQVBQRVJfVEFHKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRm9ybWF0IG9mIGRhdGUgc3RyaW5nXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9kYXRlRm9ybWF0ID0gb3B0aW9uLmRhdGVGb3JtIHx8IG9wdGlvbi5kYXRlRm9ybWF0O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZWdFeHAgaW5zdGFuY2UgZm9yIGZvcm1hdCBvZiBkYXRlIHN0cmluZ1xuICAgICAgICAgKiBAdHlwZSB7UmVnRXhwfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fcmVnRXhwID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQXJyYXkgc2F2aW5nIGEgb3JkZXIgb2YgZm9ybWF0XG4gICAgICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHNlZSB7RGF0ZVBpY2tlci5wcm90b3R5cGUuc2V0RGF0ZUZvcm19XG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqIC8vIElmIHRoZSBmb3JtYXQgaXMgYSAnbW0tZGQsIHl5eXknXG4gICAgICAgICAqIC8vIGB0aGlzLl9mb3JtT3JkZXJgIGlzIFsnbW9udGgnLCAnZGF0ZScsICd5ZWFyJ11cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2Zvcm1PcmRlciA9IFtdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBPYmplY3QgaGF2aW5nIGRhdGUgdmFsdWVzXG4gICAgICAgICAqIEB0eXBlIHtkYXRlSGFzaH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2RhdGUgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGlzIHZhbHVlIGlzIHByZXBlbmRlZCBhdXRvbWF0aWNhbGx5IHdoZW4geWVhci1mb3JtYXQgaXMgJ3l5J1xuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKiAvL1xuICAgICAgICAgKiAvLyBJZiB0aGlzIHZhbHVlIGlzICcyMCcsIHRoZSBmb3JtYXQgaXMgJ3l5LW1tLWRkJyBhbmQgdGhlIGRhdGUgc3RyaW5nIGlzICcxNS0wNC0xMicsXG4gICAgICAgICAqIC8vIHRoZSBkYXRlIHZhbHVlIG9iamVjdCBpc1xuICAgICAgICAgKiAvLyAge1xuICAgICAgICAgKiAvLyAgICAgIHllYXI6IDIwMTUsXG4gICAgICAgICAqIC8vICAgICAgbW9udGg6IDQsXG4gICAgICAgICAqIC8vICAgICAgZGF0ZTogMTJcbiAgICAgICAgICogLy8gIH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2RlZmF1bHRDZW50dXJ5ID0gb3B0aW9uLmRlZmF1bHRDZW50dXJ5O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDbGFzcyBuYW1lIGZvciBzZWxlY3RhYmxlIGRhdGUgZWxlbWVudHNcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3NlbGVjdGFibGVDbGFzc05hbWUgPSBvcHRpb24uc2VsZWN0YWJsZUNsYXNzTmFtZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2xhc3MgbmFtZSBmb3Igc2VsZWN0ZWQgZGF0ZSBlbGVtZW50XG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9zZWxlY3RlZENsYXNzTmFtZSA9IG9wdGlvbi5zZWxlY3RlZENsYXNzTmFtZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogV2hldGhlciBzZXQgZGF0ZSBmcm9tIHRoZSBpbnB1dCB2YWx1ZSB3aGVuIHRoZSAnRW50ZXInIGtleSBwcmVzc2VkXG4gICAgICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAgICAgKiBAc2luY2UgMS4zLjBcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2VuYWJsZVNldERhdGVCeUVudGVyS2V5ID0gb3B0aW9uLmVuYWJsZVNldERhdGVCeUVudGVyS2V5O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJdCBpcyBzdGFydCB0aW1lc3RhbXBzIGZyb20gdGhpcy5fcmFuZ2VzXG4gICAgICAgICAqIEB0eXBlIHtBcnJheS48bnVtYmVyPn1cbiAgICAgICAgICogQHNpbmNlIDEuMi4wXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9zdGFydFRpbWVzID0gW107XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEl0IGlzIGVuZCB0aW1lc3RhbXBzIGZyb20gdGhpcy5fcmFuZ2VzXG4gICAgICAgICAqIEB0eXBlIHtBcnJheS48bnVtYmVyPn1cbiAgICAgICAgICogQHNpbmNlIDEuMi4wXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9lbmRUaW1lcyA9IFtdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZWxlY3RhYmxlIGRhdGUgcmFuZ2VzXG4gICAgICAgICAqIEB0eXBlIHtBcnJheS48QXJyYXkuPGRhdGVIYXNoPj59XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBzaW5jZSAxLjIuMFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fcmFuZ2VzID0gb3B0aW9uLnNlbGVjdGFibGVSYW5nZXM7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRpbWVQaWNrZXIgaW5zdGFuY2VcbiAgICAgICAgICogQHR5cGUge1RpbWVQaWNrZXJ9XG4gICAgICAgICAqIEBzaW5jZSAxLjEuMFxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fdGltZVBpY2tlciA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHBvc2l0aW9uIC0gbGVmdCAmIHRvcCAmIHpJbmRleFxuICAgICAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAc2luY2UgMS4xLjFcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3BvcyA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIG9wZW5lcnMgLSBvcGVuZXIgbGlzdFxuICAgICAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBzaW5jZSAxLjEuMVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fb3BlbmVycyA9IFtdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBIYW5kbGVycyBiaW5kaW5nIGNvbnRleHRcbiAgICAgICAgICogQHR5cGUge09iamVjdH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3Byb3h5SGFuZGxlcnMgPSB7fTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogSW5kZXggb2Ygc2hvd24gbGF5ZXJcbiAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3Nob3duTGF5ZXJJZHggPSAwO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTdGF0ZSBvZiBwaWNrZXIgZW5hYmxlXG4gICAgICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAc2luY2UgMS40LjBcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2VuYWJsZWRTdGF0ZSA9IHRydWU7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENsYXNzIG5hbWUgZm9yIGRpc2FibGVkIGRhdGUgZWxlbWVudFxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAc2luY2UgMS40LjBcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2Rpc2FibGVkQ2xhc3NOYW1lID0gb3B0aW9uLmRpc2FibGVkQ2xhc3NOYW1lO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXaGV0aGVyIHRoZSBkYXRlcGlja2VyIHNob3dzIGFsd2F5c1xuICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgICAgICogQHNpbmNlIDEuMi4wXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqIGRhdGVwaWNrZXIuc2hvd0Fsd2F5cyA9IHRydWU7XG4gICAgICAgICAqIGRhdGVwaWNrZXIub3BlbigpO1xuICAgICAgICAgKiAvLyBUaGUgZGF0ZXBpY2tlciB3aWxsIGJlIG5vdCBjbG9zZWQgaWYgeW91IGNsaWNrIHRoZSBvdXRzaWRlIG9mIHRoZSBkYXRlcGlja2VyXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnNob3dBbHdheXMgPSBvcHRpb24uc2hvd0Fsd2F5cztcblxuICAgICAgICAvKipcbiAgICAgICAgICogV2hldGhlciB0aGUgZGF0ZXBpY2tlciB1c2UgdG91Y2ggZXZlbnQuXG4gICAgICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAgICAgKiBAc2luY2UgMS4yLjBcbiAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICogZGF0ZXBpY2tlci51c2VUb3VjaEV2ZW50ID0gZmFsc2U7XG4gICAgICAgICAqIC8vIFRoZSBkYXRlcGlja2VyIHdpbGwgYmUgdXNlIG9ubHkgJ2NsaWNrJywgJ21vdXNlZG93bicgZXZlbnRzXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnVzZVRvdWNoRXZlbnQgPSAhIShcbiAgICAgICAgICAgICgoJ2NyZWF0ZVRvdWNoJyBpbiBkb2N1bWVudCkgfHwgKCdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50KSkgJiZcbiAgICAgICAgICAgIG9wdGlvbi51c2VUb3VjaEV2ZW50XG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5faW5pdGlhbGl6ZURhdGVQaWNrZXIob3B0aW9uKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBtZXRob2RcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uIC0gdXNlciBvcHRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbml0aWFsaXplRGF0ZVBpY2tlcjogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIHRoaXMuX3JhbmdlcyA9IHRoaXMuX2ZpbHRlclZhbGlkUmFuZ2VzKHRoaXMuX3Jhbmdlcyk7XG5cbiAgICAgICAgdGhpcy5fZGV0YWNoQ2FsZW5kYXJFdmVudCgpO1xuICAgICAgICB0aGlzLl9zZXRTZWxlY3RhYmxlUmFuZ2VzKCk7XG4gICAgICAgIHRoaXMuX3NldFdyYXBwZXJFbGVtZW50KG9wdGlvbi5wYXJlbnRFbGVtZW50KTtcbiAgICAgICAgdGhpcy5fc2V0RGVmYXVsdERhdGUob3B0aW9uLmRhdGUpO1xuICAgICAgICB0aGlzLl9zZXREZWZhdWx0UG9zaXRpb24ob3B0aW9uLnBvcyk7XG4gICAgICAgIHRoaXMuX3NldFByb3h5SGFuZGxlcnMoKTtcbiAgICAgICAgdGhpcy5fc2V0T3BlbmVycyhvcHRpb24ub3BlbmVycyk7XG4gICAgICAgIHRoaXMuX2JpbmRLZXlkb3duRXZlbnQodGhpcy5fJGVsZW1lbnQpO1xuICAgICAgICB0aGlzLl9zZXRUaW1lUGlja2VyKG9wdGlvbi50aW1lUGlja2VyKTtcbiAgICAgICAgdGhpcy5zZXREYXRlRm9ybSgpO1xuXG4gICAgICAgIHRoaXMuXyR3cmFwcGVyRWxlbWVudC5oaWRlKCk7XG4gICAgICAgIHRoaXMuX2NhbGVuZGFyLiRlbGVtZW50LnNob3coKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTG9va3MgdGhyb3VnaCBlYWNoIHZhbHVlIGluIHRoZSByYW5nZXMsIHJldHVybmluZyBhbiBhcnJheSBvZiBvbmx5IHZhbGlkIHJhbmdlcy5cbiAgICAgKiBAcGFyYW0ge0FycmF5LjxBcnJheS48ZGF0ZUhhc2g+Pn0gcmFuZ2VzIC0gcmFuZ2VzXG4gICAgICogQHJldHVybnMge0FycmF5LjxBcnJheS48ZGF0ZUhhc2g+Pn0gZmlsdGVyZWQgcmFuZ2VzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZmlsdGVyVmFsaWRSYW5nZXM6IGZ1bmN0aW9uKHJhbmdlcykge1xuICAgICAgICB2YXIgc3RhcnRIYXNoLCBlbmRIYXNoO1xuXG4gICAgICAgIHJldHVybiB1dGlsLmZpbHRlcihyYW5nZXMsIGZ1bmN0aW9uKHJhbmdlKSB7XG4gICAgICAgICAgICBzdGFydEhhc2ggPSByYW5nZVswXTtcbiAgICAgICAgICAgIGVuZEhhc2ggPSByYW5nZVsxXTtcbiAgICAgICAgICAgIHRoaXMuX3NldEhhc2hJblJhbmdlKHN0YXJ0SGFzaCwgZW5kSGFzaCk7XG5cbiAgICAgICAgICAgIHJldHVybiAodGhpcy5faXNWYWxpZERhdGVIYXNoKHN0YXJ0SGFzaCkgJiYgdGhpcy5faXNWYWxpZERhdGVIYXNoKGVuZEhhc2gpKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIERldGFjaCBldmVudCBvbiBjYWxlbmRhclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2RldGFjaENhbGVuZGFyRXZlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9jYWxlbmRhci5kZXRhY2hFdmVudFRvQm9keSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgd3JhcHBlciBlbGVtZW50KD0gY29udGFpbmVyKVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR8alF1ZXJ5fSBbcGFyZW50RWxlbWVudF0gLSBwYXJlbnQgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldFdyYXBwZXJFbGVtZW50OiBmdW5jdGlvbihwYXJlbnRFbGVtZW50KSB7XG4gICAgICAgIHZhciAkd3JhcHBlckVsZW1lbnQgPSB0aGlzLl8kd3JhcHBlckVsZW1lbnQ7XG4gICAgICAgIHZhciAkcGFyZW50RWxlbWVudCA9ICQocGFyZW50RWxlbWVudCk7XG5cbiAgICAgICAgJHdyYXBwZXJFbGVtZW50LmFwcGVuZCh0aGlzLl9jYWxlbmRhci4kZWxlbWVudCk7XG5cbiAgICAgICAgaWYgKCRwYXJlbnRFbGVtZW50WzBdKSB7XG4gICAgICAgICAgICAkd3JhcHBlckVsZW1lbnQuYXBwZW5kVG8oJHBhcmVudEVsZW1lbnQpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuXyRlbGVtZW50WzBdKSB7XG4gICAgICAgICAgICAkd3JhcHBlckVsZW1lbnQuaW5zZXJ0QWZ0ZXIodGhpcy5fJGVsZW1lbnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJHdyYXBwZXJFbGVtZW50LmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBkZWZhdWx0IGRhdGVcbiAgICAgKiBAcGFyYW0ge2RhdGVIYXNofHN0cmluZ30gb3BEYXRlIC0gdXNlciBzZXR0aW5nOiBkYXRlXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdG9kbyBSZWZhY3RvcjogSW50ZWdyYXRlIHdpdGggXCJzZXREYXRlXCIgbWV0aG9kLlxuICAgICAqL1xuICAgIF9zZXREZWZhdWx0RGF0ZTogZnVuY3Rpb24ob3BEYXRlKSB7XG4gICAgICAgIGlmICgvXmJsYW5rJC9pLnRlc3Qob3BEYXRlKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFvcERhdGUpIHtcbiAgICAgICAgICAgIG9wRGF0ZSA9IGRhdGVVdGlsLmdldFRvZGF5KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvcERhdGUgPSB7XG4gICAgICAgICAgICAgICAgeWVhcjogZGF0ZVV0aWwuZ2V0U2FmZU51bWJlcihvcERhdGUueWVhciwgTUlOX1lFQVIpLFxuICAgICAgICAgICAgICAgIG1vbnRoOiBkYXRlVXRpbC5nZXRTYWZlTnVtYmVyKG9wRGF0ZS5tb250aCwgMSksXG4gICAgICAgICAgICAgICAgZGF0ZTogZGF0ZVV0aWwuZ2V0U2FmZU51bWJlcihvcERhdGUuZGF0ZSwgMSlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9zZXRTaG93bkxheWVySW5kZXhCeUZvcm0oKTtcbiAgICAgICAgaWYgKHRoaXMuX2lzU2VsZWN0YWJsZShvcERhdGUsIHRoaXMuX2dldEN1cnJlbnRMYXllcigpKSkge1xuICAgICAgICAgICAgdGhpcy5fZGF0ZSA9IG9wRGF0ZTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTYXZlIGRlZmF1bHQgc3R5bGUtcG9zaXRpb24gb2YgY2FsZW5kYXJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3BQb3MgW29wdGlvbi5wb3NdIC0gdXNlciBzZXR0aW5nOiBwb3NpdGlvbihsZWZ0LCB0b3AsIHpJbmRleClcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXREZWZhdWx0UG9zaXRpb246IGZ1bmN0aW9uKG9wUG9zKSB7XG4gICAgICAgIHZhciBwb3MgPSB0aGlzLl9wb3MgPSBvcFBvcyB8fCB7fTtcbiAgICAgICAgdmFyIGJvdW5kID0gdGhpcy5fZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgaWYgKCFpc051bWJlcihwb3MuekluZGV4KSkge1xuICAgICAgICAgICAgcG9zLnpJbmRleCA9IDk5OTk7XG4gICAgICAgIH1cblxuICAgICAgICB1dGlsLmZvckVhY2gocG9zaXRpb25Gcm9tQm91bmRpbmdLZXlNYXBwZXIsIGZ1bmN0aW9uKGJvdW5kaW5nS2V5LCBwb3NLZXkpIHtcbiAgICAgICAgICAgIGlmICghaXNOdW1iZXIocG9zW3Bvc0tleV0pKSB7XG4gICAgICAgICAgICAgICAgcG9zW3Bvc0tleV0gPSBib3VuZFtib3VuZGluZ0tleV0gfHwgMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBzdGFydC9lbmQgZWRnZSBmcm9tIHNlbGVjdGFibGUtcmFuZ2VzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0U2VsZWN0YWJsZVJhbmdlczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX3N0YXJ0VGltZXMgPSBbXTtcbiAgICAgICAgdGhpcy5fZW5kVGltZXMgPSBbXTtcblxuICAgICAgICBmb3JFYWNoKHRoaXMuX3JhbmdlcywgZnVuY3Rpb24ocmFuZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVRpbWVSYW5nZSh7XG4gICAgICAgICAgICAgICAgc3RhcnQ6IGRhdGVVdGlsLmdldFRpbWUocmFuZ2VbMF0pLFxuICAgICAgICAgICAgICAgIGVuZDogZGF0ZVV0aWwuZ2V0VGltZShyYW5nZVsxXSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIHRpbWUgcmFuZ2UgKHN0YXJ0VGltZXMsIGVuZFRpbWVzKVxuICAgICAqIEBwYXJhbSB7e3N0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyfX0gbmV3VGltZVJhbmdlIC0gVGltZSByYW5nZSBmb3IgdXBkYXRlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfdXBkYXRlVGltZVJhbmdlOiBmdW5jdGlvbihuZXdUaW1lUmFuZ2UpIHtcbiAgICAgICAgdmFyIGluZGV4LCBleGlzdGluZ1RpbWVSYW5nZSwgbWVyZ2VkVGltZVJhbmdlO1xuXG4gICAgICAgIGluZGV4ID0gdGhpcy5fc2VhcmNoU3RhcnRUaW1lKG5ld1RpbWVSYW5nZS5zdGFydCkuaW5kZXg7XG4gICAgICAgIGV4aXN0aW5nVGltZVJhbmdlID0ge1xuICAgICAgICAgICAgc3RhcnQ6IHRoaXMuX3N0YXJ0VGltZXNbaW5kZXhdLFxuICAgICAgICAgICAgZW5kOiB0aGlzLl9lbmRUaW1lc1tpbmRleF1cbiAgICAgICAgfTtcblxuICAgICAgICBpZiAodGhpcy5faXNPdmVybGFwcGVkVGltZVJhbmdlKGV4aXN0aW5nVGltZVJhbmdlLCBuZXdUaW1lUmFuZ2UpKSB7XG4gICAgICAgICAgICBtZXJnZWRUaW1lUmFuZ2UgPSB0aGlzLl9tZXJnZVRpbWVSYW5nZXMoZXhpc3RpbmdUaW1lUmFuZ2UsIG5ld1RpbWVSYW5nZSk7XG4gICAgICAgICAgICB0aGlzLl9zdGFydFRpbWVzLnNwbGljZShpbmRleCwgMSwgbWVyZ2VkVGltZVJhbmdlLnN0YXJ0KTtcbiAgICAgICAgICAgIHRoaXMuX2VuZFRpbWVzLnNwbGljZShpbmRleCwgMSwgbWVyZ2VkVGltZVJhbmdlLmVuZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9zdGFydFRpbWVzLnNwbGljZShpbmRleCwgMCwgbmV3VGltZVJhbmdlLnN0YXJ0KTtcbiAgICAgICAgICAgIHRoaXMuX2VuZFRpbWVzLnNwbGljZShpbmRleCwgMCwgbmV3VGltZVJhbmdlLmVuZCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgcmFuZ2VzIGFyZSBvdmVybGFwcGVkXG4gICAgICogQHBhcmFtIHt7c3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXJ9fSBleGlzdGluZ1RpbWVSYW5nZSAtIEV4aXN0aW5nIHRpbWUgcmFuZ2VcbiAgICAgKiBAcGFyYW0ge3tzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcn19IG5ld1RpbWVSYW5nZSAtIE5ldyB0aW1lIHJhbmdlXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFdoZXRoZXIgdGhlIHJhbmdlcyBhcmUgb3ZlcmxhcHBlZFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzT3ZlcmxhcHBlZFRpbWVSYW5nZTogZnVuY3Rpb24oZXhpc3RpbmdUaW1lUmFuZ2UsIG5ld1RpbWVSYW5nZSkge1xuICAgICAgICB2YXIgZXhpc3RpbmdTdGFydCA9IGV4aXN0aW5nVGltZVJhbmdlLnN0YXJ0LFxuICAgICAgICAgICAgZXhpc3RpbmdFbmQgPSBleGlzdGluZ1RpbWVSYW5nZS5lbmQsXG4gICAgICAgICAgICBuZXdTdGFydCA9IG5ld1RpbWVSYW5nZS5zdGFydCxcbiAgICAgICAgICAgIG5ld0VuZCA9IG5ld1RpbWVSYW5nZS5lbmQsXG4gICAgICAgICAgICBpc1RydXRoeSA9IGV4aXN0aW5nU3RhcnQgJiYgZXhpc3RpbmdFbmQgJiYgbmV3U3RhcnQgJiYgbmV3RW5kLFxuICAgICAgICAgICAgaXNPdmVybGFwcGVkID0gIShcbiAgICAgICAgICAgICAgICAobmV3U3RhcnQgPCBleGlzdGluZ1N0YXJ0ICYmIG5ld0VuZCA8IGV4aXN0aW5nU3RhcnQpIHx8XG4gICAgICAgICAgICAgICAgKG5ld1N0YXJ0ID4gZXhpc3RpbmdFbmQgJiYgbmV3RW5kID4gZXhpc3RpbmdFbmQpXG4gICAgICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBpc1RydXRoeSAmJiBpc092ZXJsYXBwZWQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1lcmdlIHRoZSBvdmVybGFwcGVkIHRpbWUgcmFuZ2VzXG4gICAgICogQHBhcmFtIHt7c3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXJ9fSBleGlzdGluZ1RpbWVSYW5nZSAtIEV4aXN0aW5nIHRpbWUgcmFuZ2VcbiAgICAgKiBAcGFyYW0ge3tzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcn19IG5ld1RpbWVSYW5nZSAtIE5ldyB0aW1lIHJhbmdlXG4gICAgICogQHJldHVybnMge3tzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcn19IE1lcmdlZCB0aW1lIHJhbmdlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWVyZ2VUaW1lUmFuZ2VzOiBmdW5jdGlvbihleGlzdGluZ1RpbWVSYW5nZSwgbmV3VGltZVJhbmdlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdGFydDogTWF0aC5taW4oZXhpc3RpbmdUaW1lUmFuZ2Uuc3RhcnQsIG5ld1RpbWVSYW5nZS5zdGFydCksXG4gICAgICAgICAgICBlbmQ6IE1hdGgubWF4KGV4aXN0aW5nVGltZVJhbmdlLmVuZCwgbmV3VGltZVJhbmdlLmVuZClcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2VhcmNoIHRpbWVzdGFtcCBpbiBzdGFydFRpbWVzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRpbWVzdGFtcCAtIHRpbWVzdGFtcFxuICAgICAqIEByZXR1cm5zIHt7Zm91bmQ6IGJvb2xlYW4sIGluZGV4OiBudW1iZXJ9fSByZXN1bHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZWFyY2hTdGFydFRpbWU6IGZ1bmN0aW9uKHRpbWVzdGFtcCkge1xuICAgICAgICByZXR1cm4gZGF0ZVV0aWwuc2VhcmNoKHRoaXMuX3N0YXJ0VGltZXMsIHRpbWVzdGFtcCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNlYXJjaCB0aW1lc3RhbXAgaW4gZW5kVGltZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lc3RhbXAgLSB0aW1lc3RhbXBcbiAgICAgKiBAcmV0dXJucyB7e2ZvdW5kOiBib29sZWFuLCBpbmRleDogbnVtYmVyfX0gcmVzdWx0XG4gICAgICovXG4gICAgX3NlYXJjaEVuZFRpbWU6IGZ1bmN0aW9uKHRpbWVzdGFtcCkge1xuICAgICAgICByZXR1cm4gZGF0ZVV0aWwuc2VhcmNoKHRoaXMuX2VuZFRpbWVzLCB0aW1lc3RhbXApO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdG9yZSBvcGVuZXIgZWxlbWVudCBsaXN0XG4gICAgICogQHBhcmFtIHtBcnJheX0gb3BPcGVuZXJzIFtvcHRpb24ub3BlbmVyc10gLSBvcGVuZXIgZWxlbWVudCBsaXN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0T3BlbmVyczogZnVuY3Rpb24ob3BPcGVuZXJzKSB7XG4gICAgICAgIHRoaXMuYWRkT3BlbmVyKHRoaXMuXyRlbGVtZW50KTtcbiAgICAgICAgZm9yRWFjaChvcE9wZW5lcnMsIGZ1bmN0aW9uKG9wZW5lcikge1xuICAgICAgICAgICAgdGhpcy5hZGRPcGVuZXIob3BlbmVyKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBUaW1lUGlja2VyIGluc3RhbmNlXG4gICAgICogQHBhcmFtIHtUaW1lUGlja2VyfSBbb3BUaW1lUGlja2VyXSAtIFRpbWVQaWNrZXIgaW5zdGFuY2VcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRUaW1lUGlja2VyOiBmdW5jdGlvbihvcFRpbWVQaWNrZXIpIHtcbiAgICAgICAgaWYgKCFvcFRpbWVQaWNrZXIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3RpbWVQaWNrZXIgPSBvcFRpbWVQaWNrZXI7XG4gICAgICAgIHRoaXMuX2JpbmRDdXN0b21FdmVudFdpdGhUaW1lUGlja2VyKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgY3VzdG9tIGV2ZW50IHdpdGggVGltZVBpY2tlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2JpbmRDdXN0b21FdmVudFdpdGhUaW1lUGlja2VyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9uQ2hhbmdlVGltZVBpY2tlciA9IGJpbmQodGhpcy5zZXREYXRlLCB0aGlzKTtcblxuICAgICAgICB0aGlzLm9uKCdvcGVuJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLl90aW1lUGlja2VyLnNldFRpbWVGcm9tSW5wdXRFbGVtZW50KHRoaXMuXyRlbGVtZW50KTtcbiAgICAgICAgICAgIHRoaXMuX3RpbWVQaWNrZXIub24oJ2NoYW5nZScsIG9uQ2hhbmdlVGltZVBpY2tlcik7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB0aGlzLm9uKCdjbG9zZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5fdGltZVBpY2tlci5vZmYoJ2NoYW5nZScsIG9uQ2hhbmdlVGltZVBpY2tlcik7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayB2YWxpZGF0aW9uIG9mIGEgeWVhclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5ZWFyIC0geWVhclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSAtIHdoZXRoZXIgdGhlIHllYXIgaXMgdmFsaWQgb3Igbm90XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNWYWxpZFllYXI6IGZ1bmN0aW9uKHllYXIpIHtcbiAgICAgICAgcmV0dXJuIGlzTnVtYmVyKHllYXIpICYmIHllYXIgPj0gTUlOX1lFQVIgJiYgeWVhciA8PSBNQVhfWUVBUjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgdmFsaWRhdGlvbiBvZiBhIG1vbnRoXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1vbnRoIC0gbW9udGhcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSB3aGV0aGVyIHRoZSBtb250aCBpcyB2YWxpZCBvciBub3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc1ZhbGlkTW9udGg6IGZ1bmN0aW9uKG1vbnRoKSB7XG4gICAgICAgIHJldHVybiBpc051bWJlcihtb250aCkgJiYgbW9udGggPiAwICYmIG1vbnRoIDwgMTM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIGRheS1pbi1tb250aCBpcyB2YWxpZFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5ZWFyIC0geWVhclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtb250aCAtIG1vbnRoXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGRhdGUgLSBkYXRlXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNWYWxpZERheUluTW9udGg6IGZ1bmN0aW9uKHllYXIsIG1vbnRoLCBkYXRlKSB7XG4gICAgICAgIHJldHVybiBpc051bWJlcihkYXRlKSAmJiAoZGF0ZSA+IDApICYmIChkYXRlIDw9IGRhdGVVdGlsLmdldExhc3REYXlJbk1vbnRoKHllYXIsIG1vbnRoKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIHZhbHVlcyBpbiBhIGRhdGVIYXNoIGFyZSB2YWxpZFxuICAgICAqIEBwYXJhbSB7ZGF0ZUhhc2h9IGRhdGVIYXNoIC0gZGF0ZUhhc2hcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc1ZhbGlkRGF0ZUhhc2g6IGZ1bmN0aW9uKGRhdGVIYXNoKSB7XG4gICAgICAgIHZhciB5ZWFyLCBtb250aCwgZGF0ZTtcblxuICAgICAgICBpZiAoIWRhdGVIYXNoKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB5ZWFyID0gZGF0ZUhhc2gueWVhciB8fCB0aGlzLl9kYXRlLnllYXI7XG4gICAgICAgIG1vbnRoID0gZGF0ZUhhc2gubW9udGggfHwgdGhpcy5fZGF0ZS5tb250aDtcbiAgICAgICAgZGF0ZSA9IGRhdGVIYXNoLmRhdGUgfHwgdGhpcy5fZGF0ZS5kYXRlO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9pc1ZhbGlkWWVhcih5ZWFyKSAmJiB0aGlzLl9pc1ZhbGlkTW9udGgobW9udGgpICYmIHRoaXMuX2lzVmFsaWREYXlJbk1vbnRoKHllYXIsIG1vbnRoLCBkYXRlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgYW4gZWxlbWVudCBpcyBhbiBvcGVuZXIuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBvcGVuZXIgdHJ1ZS9mYWxzZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzT3BlbmVyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgICB2YXIgb3BlbmVycyA9IHRoaXMuX29wZW5lcnM7XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgdmFyIGxlbiA9IG9wZW5lcnMubGVuZ3RoO1xuXG4gICAgICAgIGZvciAoOyBpIDwgbGVuOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGlmICh0YXJnZXQgPT09IG9wZW5lcnNbaV0gfHwgJC5jb250YWlucyhvcGVuZXJzW2ldLCB0YXJnZXQpKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBzdHlsZS1wb3NpdGlvbiBvZiBjYWxlbmRhclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FycmFuZ2VMYXllcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzdHlsZSA9IHRoaXMuXyR3cmFwcGVyRWxlbWVudFswXS5zdHlsZSxcbiAgICAgICAgICAgIHBvcyA9IHRoaXMuX3BvcztcblxuICAgICAgICBzdHlsZS5sZWZ0ID0gcG9zLmxlZnQgKyAncHgnO1xuICAgICAgICBzdHlsZS50b3AgPSBwb3MudG9wICsgJ3B4JztcbiAgICAgICAgc3R5bGUuekluZGV4ID0gcG9zLnpJbmRleDtcbiAgICAgICAgdGhpcy5fJHdyYXBwZXJFbGVtZW50LmFwcGVuZCh0aGlzLl9jYWxlbmRhci4kZWxlbWVudCk7XG4gICAgICAgIGlmICh0aGlzLl90aW1lUGlja2VyKSB7XG4gICAgICAgICAgICB0aGlzLl8kd3JhcHBlckVsZW1lbnQuYXBwZW5kKHRoaXMuX3RpbWVQaWNrZXIuJHRpbWVQaWNrZXJFbGVtZW50KTtcbiAgICAgICAgICAgIHRoaXMuX3RpbWVQaWNrZXIuc2hvdygpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBib3VuZGluZ0NsaWVudFJlY3Qgb2YgYW4gZWxlbWVudFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR8alF1ZXJ5fSBbZWxlbWVudF0gLSBlbGVtZW50XG4gICAgICogQHJldHVybnMge09iamVjdH0gLSBhbiBvYmplY3QgaGF2aW5nIGxlZnQsIHRvcCwgYm90dG9tLCByaWdodCBvZiBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0Qm91bmRpbmdDbGllbnRSZWN0OiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIHZhciBlbCA9ICQoZWxlbWVudClbMF0gfHwgdGhpcy5fJGVsZW1lbnRbMF0sXG4gICAgICAgICAgICBib3VuZCxcbiAgICAgICAgICAgIGNlaWw7XG5cbiAgICAgICAgaWYgKCFlbCkge1xuICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgYm91bmQgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY2VpbCA9IE1hdGguY2VpbDtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGVmdDogY2VpbChib3VuZC5sZWZ0KSxcbiAgICAgICAgICAgIHRvcDogY2VpbChib3VuZC50b3ApLFxuICAgICAgICAgICAgYm90dG9tOiBjZWlsKGJvdW5kLmJvdHRvbSksXG4gICAgICAgICAgICByaWdodDogY2VpbChib3VuZC5yaWdodClcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGRhdGUgZnJvbSBzdHJpbmdcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyIC0gZGF0ZSBzdHJpbmdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXREYXRlRnJvbVN0cmluZzogZnVuY3Rpb24oc3RyKSB7XG4gICAgICAgIHZhciBkYXRlID0gdGhpcy5fZXh0cmFjdERhdGUoc3RyKTtcblxuICAgICAgICBkYXRlID0gZXh0ZW5kKHt9LCB0aGlzLl9kYXRlLCBkYXRlKTtcblxuICAgICAgICBpZiAoZGF0ZSAmJiB0aGlzLl9pc1NlbGVjdGFibGUoZGF0ZSkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl90aW1lUGlja2VyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdGltZVBpY2tlci5zZXRUaW1lRnJvbUlucHV0RWxlbWVudCh0aGlzLl8kZWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldERhdGUoZGF0ZS55ZWFyLCBkYXRlLm1vbnRoLCBkYXRlLmRhdGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXREYXRlKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGZvcm1lZCBkYXRlLXN0cmluZyBmcm9tIGRhdGUgb2JqZWN0XG4gICAgICogQHJldHVybnMge3N0cmluZ30gLSBmb3JtZWQgZGF0ZS1zdHJpbmdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlRGF0ZVN0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB5ZWFyID0gdGhpcy5fZGF0ZS55ZWFyLFxuICAgICAgICAgICAgbW9udGggPSB0aGlzLl9kYXRlLm1vbnRoLFxuICAgICAgICAgICAgZGF0ZSA9IHRoaXMuX2RhdGUuZGF0ZSxcbiAgICAgICAgICAgIGZvcm1hdCA9IHRoaXMuX2RhdGVGb3JtYXQsXG4gICAgICAgICAgICByZXBsYWNlTWFwLFxuICAgICAgICAgICAgZGF0ZVN0cmluZztcblxuICAgICAgICBtb250aCA9IG1vbnRoIDwgMTAgPyAoJzAnICsgbW9udGgpIDogbW9udGg7XG4gICAgICAgIGRhdGUgPSBkYXRlIDwgMTAgPyAoJzAnICsgZGF0ZSkgOiBkYXRlO1xuXG4gICAgICAgIHJlcGxhY2VNYXAgPSB7XG4gICAgICAgICAgICB5eXl5OiB5ZWFyLFxuICAgICAgICAgICAgeXk6IFN0cmluZyh5ZWFyKS5zdWJzdHIoMiwgMiksXG4gICAgICAgICAgICBtbTogbW9udGgsXG4gICAgICAgICAgICBtOiBOdW1iZXIobW9udGgpLFxuICAgICAgICAgICAgZGQ6IGRhdGUsXG4gICAgICAgICAgICBkOiBOdW1iZXIoZGF0ZSlcbiAgICAgICAgfTtcblxuICAgICAgICBkYXRlU3RyaW5nID0gZm9ybWF0LnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiByZXBsYWNlTWFwW2tleS50b0xvd2VyQ2FzZSgpXSB8fCAnJztcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGRhdGVTdHJpbmc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4dHJhY3QgZGF0ZS1vYmplY3QgZnJvbSBpbnB1dCBzdHJpbmcgd2l0aCBjb21wYXJpbmcgZGF0ZS1mb3JtYXQ8YnI+XG4gICAgICogSWYgY2FuIG5vdCBleHRyYWN0LCByZXR1cm4gZmFsc2VcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyIC0gaW5wdXQgc3RyaW5nKHRleHQpXG4gICAgICogQHJldHVybnMge2RhdGVIYXNofGZhbHNlfSAtIGV4dHJhY3RlZCBkYXRlIG9iamVjdCBvciBmYWxzZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2V4dHJhY3REYXRlOiBmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgdmFyIGZvcm1PcmRlciA9IHRoaXMuX2Zvcm1PcmRlcixcbiAgICAgICAgICAgIHJlc3VsdERhdGUgPSB7fSxcbiAgICAgICAgICAgIHJlZ0V4cCA9IHRoaXMuX3JlZ0V4cDtcblxuICAgICAgICByZWdFeHAubGFzdEluZGV4ID0gMDtcbiAgICAgICAgaWYgKHJlZ0V4cC50ZXN0KHN0cikpIHtcbiAgICAgICAgICAgIGlmIChmb3JtT3JkZXJbMF0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHREYXRlW2Zvcm1PcmRlclswXV0gPSBOdW1iZXIoUmVnRXhwLiQxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGZvcm1PcmRlclsxXSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdERhdGVbZm9ybU9yZGVyWzFdXSA9IE51bWJlcihSZWdFeHAuJDIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZm9ybU9yZGVyWzJdKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0RGF0ZVtmb3JtT3JkZXJbMl1dID0gTnVtYmVyKFJlZ0V4cC4kMyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoU3RyaW5nKHJlc3VsdERhdGUueWVhcikubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICByZXN1bHREYXRlLnllYXIgPSBOdW1iZXIodGhpcy5fZGVmYXVsdENlbnR1cnkgKyByZXN1bHREYXRlLnllYXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdERhdGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgYSBkYXRlSGFzaCBpcyBzZWxlY3RhYmxlXG4gICAgICogQHBhcmFtIHtkYXRlSGFzaH0gZGF0ZUhhc2ggLSBkYXRlSGFzaFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbbGF5ZXJUeXBlID0gREFURV9MQVlFUl0gLSBZRUFSX0xBWUVSIHwgTU9OVEhfTEFZRVIgfCBkZWZhdWx0XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IC0gV2hldGhlciBhIGRhdGVIYXNoIGlzIHNlbGVjdGFibGVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc1NlbGVjdGFibGU6IGZ1bmN0aW9uKGRhdGVIYXNoLCBsYXllclR5cGUpIHtcbiAgICAgICAgdmFyIHN0YXJ0VGltZXMgPSB0aGlzLl9zdGFydFRpbWVzO1xuICAgICAgICB2YXIgc3RhcnRUaW1lLCBzZWFyY2hSZXN1bHQsIHRpbWVzdGFtcCwgY29tcGFyaW5nTGV2ZWw7XG5cbiAgICAgICAgZGF0ZUhhc2ggPSBleHRlbmQoe30sIGRhdGVIYXNoKTtcbiAgICAgICAgc3dpdGNoIChsYXllclR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgWUVBUl9MQVlFUjpcbiAgICAgICAgICAgICAgICBkYXRlSGFzaC5tb250aCA9IDE7XG4gICAgICAgICAgICAgICAgZGF0ZUhhc2guZGF0ZSA9IDE7XG4gICAgICAgICAgICAgICAgY29tcGFyaW5nTGV2ZWwgPSBZRUFSX1RPX01TO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBNT05USF9MQVlFUjpcbiAgICAgICAgICAgICAgICBkYXRlSGFzaC5kYXRlID0gMTtcbiAgICAgICAgICAgICAgICBjb21wYXJpbmdMZXZlbCA9IE1PTlRIX1RPX01TO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5faXNWYWxpZERhdGVIYXNoKGRhdGVIYXNoKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghc3RhcnRUaW1lcy5sZW5ndGgpIHsgLy8gTm8gcmFuZ2VzLiBBbGwgZGF0ZXMgYXJlIHNlbGVjdGFibGUuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRpbWVzdGFtcCA9IGRhdGVVdGlsLmdldFRpbWUoZGF0ZUhhc2gpO1xuICAgICAgICBzZWFyY2hSZXN1bHQgPSB0aGlzLl9zZWFyY2hFbmRUaW1lKHRpbWVzdGFtcCk7XG4gICAgICAgIHN0YXJ0VGltZSA9IHN0YXJ0VGltZXNbc2VhcmNoUmVzdWx0LmluZGV4XTtcblxuICAgICAgICByZXR1cm4gc2VhcmNoUmVzdWx0LmZvdW5kIHx8IGlzR3JlYXRlclRoYW5PckVxdWFsVG8odGltZXN0YW1wLCBzdGFydFRpbWUsIGNvbXBhcmluZ0xldmVsKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHNlbGVjdGFibGUtY2xhc3MtbmFtZSB0byBzZWxlY3RhYmxlIGRhdGUgZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge2pRdWVyeX0gJGVsZW1lbnQgLSBkYXRlIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge2RhdGVIYXNofSBkYXRlSGFzaCAtIGRhdGUgb2JqZWN0XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGxheWVyVHlwZSAtIFlFQVJfTEFZRVIgfCBNT05USF9MQVlFUiB8IERBVEVfTEFZRVJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRTZWxlY3RhYmxlQ2xhc3NOYW1lOiBmdW5jdGlvbigkZWxlbWVudCwgZGF0ZUhhc2gsIGxheWVyVHlwZSkge1xuICAgICAgICBpZiAodGhpcy5faXNTZWxlY3RhYmxlKGRhdGVIYXNoLCBsYXllclR5cGUpKSB7XG4gICAgICAgICAgICAkZWxlbWVudC5hZGRDbGFzcyh0aGlzLl9zZWxlY3RhYmxlQ2xhc3NOYW1lKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgc2VsZWN0ZWQtY2xhc3MtbmFtZSB0byBzZWxlY3RlZCBkYXRlIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fGpRdWVyeX0gZWxlbWVudCAtIGRhdGUgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e3llYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF0ZTogbnVtYmVyfX0gZGF0ZUhhc2ggLSBkYXRlIG9iamVjdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsYXllclR5cGUgLSBZRUFSX0xBWUVSIHwgTU9OVEhfTEFZRVIgfCBEQVRFX0xBWUVSXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0U2VsZWN0ZWRDbGFzc05hbWU6IGZ1bmN0aW9uKGVsZW1lbnQsIGRhdGVIYXNoLCBsYXllclR5cGUpIHtcbiAgICAgICAgdmFyIGN1ckRhdGVIYXNoID0gdGhpcy5fZGF0ZTtcbiAgICAgICAgdmFyIGlzU2VsZWN0ZWQ7XG5cbiAgICAgICAgc3dpdGNoIChsYXllclR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgTU9OVEhfTEFZRVI6XG4gICAgICAgICAgICAgICAgZGF0ZUhhc2guZGF0ZSA9IGN1ckRhdGVIYXNoLmRhdGU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFlFQVJfTEFZRVI6XG4gICAgICAgICAgICAgICAgZGF0ZUhhc2guZGF0ZSA9IGN1ckRhdGVIYXNoLmRhdGU7XG4gICAgICAgICAgICAgICAgZGF0ZUhhc2gubW9udGggPSBjdXJEYXRlSGFzaC5tb250aDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpc1NlbGVjdGVkID0gZGF0ZVV0aWwuaXNFcXVhbERhdGVIYXNoKGN1ckRhdGVIYXNoLCBkYXRlSGFzaCk7XG4gICAgICAgIGlmIChpc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAkKGVsZW1lbnQpLmFkZENsYXNzKHRoaXMuX3NlbGVjdGVkQ2xhc3NOYW1lKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgdmFsdWUgYSBkYXRlLXN0cmluZyBvZiBjdXJyZW50IHRoaXMgaW5zdGFuY2UgdG8gaW5wdXQgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldFZhbHVlVG9JbnB1dEVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZGF0ZVN0cmluZywgdGltZVN0cmluZztcblxuICAgICAgICBpZiAoIXRoaXMuX2RhdGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGRhdGVTdHJpbmcgPSB0aGlzLl9tYWtlRGF0ZVN0cmluZygpO1xuICAgICAgICB0aW1lU3RyaW5nID0gJyc7XG5cbiAgICAgICAgaWYgKHRoaXMuX3RpbWVQaWNrZXIpIHtcbiAgICAgICAgICAgIHRpbWVTdHJpbmcgPSB0aGlzLl90aW1lUGlja2VyLmdldFRpbWUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuXyRlbGVtZW50LnZhbChkYXRlU3RyaW5nICsgdGltZVN0cmluZyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldChvciBtYWtlKSBSZWdFeHAgaW5zdGFuY2UgZnJvbSB0aGUgZGF0ZS1mb3JtYXQgb2YgdGhpcyBpbnN0YW5jZS5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRSZWdFeHA6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVnRXhwU3RyID0gJ14nO1xuICAgICAgICB2YXIgZm9ybU9yZGVyID0gdGhpcy5fZm9ybU9yZGVyO1xuXG4gICAgICAgIHZhciBtYXRjaGVkS2V5cyA9IHRoaXMuX2RhdGVGb3JtYXQubWF0Y2goZm9ybWF0UmVnRXhwKTtcbiAgICAgICAgdXRpbC5mb3JFYWNoKG1hdGNoZWRLZXlzLCBmdW5jdGlvbihrZXksIGluZGV4KSB7XG4gICAgICAgICAgICBrZXkgPSBrZXkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIHJlZ0V4cFN0ciArPSAobWFwRm9yQ29udmVydGluZ1trZXldLmV4cHJlc3Npb24gKyAnW1xcXFxEXFxcXHNdKicpO1xuICAgICAgICAgICAgZm9ybU9yZGVyW2luZGV4XSA9IG1hcEZvckNvbnZlcnRpbmdba2V5XS50eXBlO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9yZWdFeHAgPSBuZXcgUmVnRXhwKHJlZ0V4cFN0ciwgJ2dpJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBldmVudCBoYW5kbGVycyB0byBiaW5kIGNvbnRleHQgYW5kIHRoZW4gc3RvcmUuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0UHJveHlIYW5kbGVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwcm94aWVzID0gdGhpcy5fcHJveHlIYW5kbGVycztcblxuICAgICAgICAvLyBFdmVudCBoYW5kbGVycyBmb3IgZWxlbWVudFxuICAgICAgICBwcm94aWVzLm9uTW91c2Vkb3duRG9jdW1lbnQgPSBiaW5kKHRoaXMuX29uTW91c2Vkb3duRG9jdW1lbnQsIHRoaXMpO1xuICAgICAgICBwcm94aWVzLm9uS2V5ZG93bkVsZW1lbnQgPSBiaW5kKHRoaXMuX29uS2V5ZG93bkVsZW1lbnQsIHRoaXMpO1xuICAgICAgICBwcm94aWVzLm9uQ2xpY2tDYWxlbmRhciA9IGJpbmQodGhpcy5fb25DbGlja0NhbGVuZGFyLCB0aGlzKTtcbiAgICAgICAgcHJveGllcy5vbkNsaWNrT3BlbmVyID0gYmluZCh0aGlzLl9vbkNsaWNrT3BlbmVyLCB0aGlzKTtcblxuICAgICAgICAvLyBFdmVudCBoYW5kbGVycyBmb3IgY3VzdG9tIGV2ZW50IG9mIGNhbGVuZGFyXG4gICAgICAgIHByb3hpZXMub25CZWZvcmVEcmF3Q2FsZW5kYXIgPSBiaW5kKHRoaXMuX29uQmVmb3JlRHJhd0NhbGVuZGFyLCB0aGlzKTtcbiAgICAgICAgcHJveGllcy5vbkRyYXdDYWxlbmRhciA9IGJpbmQodGhpcy5fb25EcmF3Q2FsZW5kYXIsIHRoaXMpO1xuICAgICAgICBwcm94aWVzLm9uQWZ0ZXJEcmF3Q2FsZW5kYXIgPSBiaW5kKHRoaXMuX29uQWZ0ZXJEcmF3Q2FsZW5kYXIsIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFdmVudCBoYW5kbGVyIGZvciBtb3VzZWRvd24gb2YgZG9jdW1lbnQ8YnI+XG4gICAgICogLSBXaGVuIGNsaWNrIHRoZSBvdXQgb2YgbGF5ZXIsIGNsb3NlIHRoZSBsYXllclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gZXZlbnQgb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25Nb3VzZWRvd25Eb2N1bWVudDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyIGlzQ29udGFpbnMgPSAkLmNvbnRhaW5zKHRoaXMuXyR3cmFwcGVyRWxlbWVudFswXSwgZXZlbnQudGFyZ2V0KTtcblxuICAgICAgICBpZiAoKCFpc0NvbnRhaW5zICYmICF0aGlzLl9pc09wZW5lcihldmVudC50YXJnZXQpKSkge1xuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV2ZW50IGhhbmRsZXIgZm9yIGVudGVyLWtleSBkb3duIG9mIGlucHV0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBbZXZlbnRdIC0gZXZlbnQgb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25LZXlkb3duRWxlbWVudDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKCFldmVudCB8fCBldmVudC5rZXlDb2RlICE9PSAxMykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3NldERhdGVGcm9tU3RyaW5nKHRoaXMuXyRlbGVtZW50LnZhbCgpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXZlbnQgaGFuZGxlciBmb3IgY2xpY2sgb2YgY2FsZW5kYXI8YnI+XG4gICAgICogLSBVcGRhdGUgZGF0ZSBmb3JtIGV2ZW50LXRhcmdldFxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gZXZlbnQgb2JqZWN0XG4gICAgICogQHRvZG8gcmVmYWN0b3IgLSBjb21wbGV4aXR5XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25DbGlja0NhbGVuZGFyOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICB2YXIgY2xhc3NOYW1lID0gdGFyZ2V0LmNsYXNzTmFtZTtcbiAgICAgICAgdmFyIHZhbHVlID0gKHRhcmdldC5pbm5lclRleHQgfHwgdGFyZ2V0LnRleHRDb250ZW50IHx8IHRhcmdldC5ub2RlVmFsdWUpO1xuICAgICAgICB2YXIgc2hvd25MYXllcklkeCA9IHRoaXMuX2NhbGVuZGFyLnNob3duTGF5ZXJJZHg7XG4gICAgICAgIHZhciBzaG93bkRhdGUgPSB0aGlzLl9jYWxlbmRhci5nZXREYXRlKCk7XG4gICAgICAgIHZhciBzdGFydExheWVySWR4ID0gdGhpcy5fc2hvd25MYXllcklkeDtcbiAgICAgICAgdmFyIGRhdGVIYXNoLCByZWxhdGl2ZU1vbnRoO1xuXG4gICAgICAgIGlmIChjbGFzc05hbWUuaW5kZXhPZigncHJldi1tb250aCcpID4gLTEpIHtcbiAgICAgICAgICAgIHJlbGF0aXZlTW9udGggPSAtMTtcbiAgICAgICAgfSBlbHNlIGlmIChjbGFzc05hbWUuaW5kZXhPZignbmV4dC1tb250aCcpID4gLTEpIHtcbiAgICAgICAgICAgIHJlbGF0aXZlTW9udGggPSAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVsYXRpdmVNb250aCA9ICQodGFyZ2V0KS5kYXRhKFJFTEFUSVZFX01PTlRIX1ZBTFVFX0tFWSkgfHwgMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHNob3duRGF0ZS5kYXRlID0gKCFzaG93bkxheWVySWR4KSA/IE51bWJlcih2YWx1ZSkgOiAxO1xuICAgICAgICBkYXRlSGFzaCA9IGRhdGVVdGlsLmdldFJlbGF0aXZlRGF0ZSgwLCByZWxhdGl2ZU1vbnRoLCAwLCBzaG93bkRhdGUpO1xuXG4gICAgICAgIGlmIChzdGFydExheWVySWR4ID09PSBzaG93bkxheWVySWR4KSB7XG4gICAgICAgICAgICB0aGlzLnNldERhdGUoZGF0ZUhhc2gueWVhciwgZGF0ZUhhc2gubW9udGgsIGRhdGVIYXNoLmRhdGUpO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFBpY2sgZXZlbnRcbiAgICAgICAgICAgICAqIEBldmVudCBEYXRlUGlja2VyI3BpY2tcbiAgICAgICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAgICAgKiBkYXRlcGlja2VyLm9uKCdwaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgKiAgICAgIHJldHVybiBmYWxzZTsgLy8gQ2FuY2VsIHRvIGNsb3NlIGxheWVyXG4gICAgICAgICAgICAgKiAgICAgIC8vIHJldHVybiB0cnVlOyAvLyBMYXllciBpcyBjbG9zZWRcbiAgICAgICAgICAgICAqIH0pO1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZiAoIXRoaXMuaW52b2tlKCdwaWNrJykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5zaG93QWx3YXlzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgeyAvLyBtb3ZlIHByZXZpb3VzIGxheWVyXG4gICAgICAgICAgICB0aGlzLl9jYWxlbmRhci5kcmF3KGRhdGVIYXNoLnllYXIsIGRhdGVIYXNoLm1vbnRoLCBmYWxzZSwgc2hvd25MYXllcklkeCAtIDEpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV2ZW50IGhhbmRsZXIgZm9yIGNsaWNrIG9mIG9wZW5lci1lbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25DbGlja09wZW5lcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpc09wZW5lZCA9IHRoaXMuaXNPcGVuZWQoKTtcblxuICAgICAgICBpZiAoaXNPcGVuZWQpIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMub3BlbigpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV2ZW50IGhhbmRsZXIgZm9yICdiZWZvcmVEcmF3Jy1jdXN0b20gZXZlbnQgb2YgY2FsZW5kYXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBzZWUge3R1aS5jb21wb25lbnQuQ2FsZW5kYXIuZHJhd31cbiAgICAgKi9cbiAgICBfb25CZWZvcmVEcmF3Q2FsZW5kYXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl91bmJpbmRPbkNsaWNrQ2FsZW5kYXIoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXZlbnQgaGFuZGxlciBmb3IgJ2RyYXcnLWN1c3RvbSBldmVudCBvZiBjYWxlbmRhclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudERhdGEgLSBjdXN0b20gZXZlbnQgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHNlZSB7dHVpLmNvbXBvbmVudC5DYWxlbmRhci5kcmF3fVxuICAgICAqIEB0b2RvIFRoZSBldmVudERhdGEgb2YgY2FsZW5kYXItJ2RyYXcnIHNob3VsZCBoYXZlIGEgcHJvcGVydHkgaW5kaWNhdGluZyB3aGF0IGlzIGEgYmVpbmcgZHJhd24gbGF5ZXIuXG4gICAgICovXG4gICAgX29uRHJhd0NhbGVuZGFyOiBmdW5jdGlvbihldmVudERhdGEpIHtcbiAgICAgICAgdmFyICRkYXRlQ29udGFpbmVyID0gZXZlbnREYXRhLiRkYXRlQ29udGFpbmVyO1xuICAgICAgICB2YXIgY2xhc3NOYW1lcyA9ICRkYXRlQ29udGFpbmVyLmF0dHIoJ2NsYXNzJyk7XG4gICAgICAgIHZhciBkYXRlSGFzaCA9IHtcbiAgICAgICAgICAgIHllYXI6IGV2ZW50RGF0YS55ZWFyLFxuICAgICAgICAgICAgbW9udGg6IGV2ZW50RGF0YS5tb250aCB8fCAxLFxuICAgICAgICAgICAgZGF0ZTogZXZlbnREYXRhLmRhdGUgfHwgMVxuICAgICAgICB9O1xuICAgICAgICB2YXIgbGF5ZXJUeXBlO1xuXG4gICAgICAgIC8vICdkYXRlJyBhbmQgJ21vbnRoJyBjbGFzc05hbWVzIGNhbiBiZSBkdXBsaWNhdGVkIChleC0nY2FsZW5kYXItZGF0ZS5jYWxlbmRhci1wcmV2LW1vbnRoJykuXG4gICAgICAgIC8vIElmIHRoZSBhYm92ZSAndG9kbycgaXMgcmVzb2x2ZWQsIHRoaXMgY29uZGl0aW9uYWwgc3RhdGVtZW50cyBhcmUgdW5uZWNlc3NhcnkuXG4gICAgICAgIGlmIChjbGFzc05hbWVzLmluZGV4T2YoREFURV9MQVlFUikgPiAtMSkge1xuICAgICAgICAgICAgbGF5ZXJUeXBlID0gREFURV9MQVlFUjtcbiAgICAgICAgfSBlbHNlIGlmIChjbGFzc05hbWVzLmluZGV4T2YoTU9OVEhfTEFZRVIpID4gLTEpIHtcbiAgICAgICAgICAgIGxheWVyVHlwZSA9IE1PTlRIX0xBWUVSO1xuICAgICAgICB9IGVsc2UgaWYgKGNsYXNzTmFtZXMuaW5kZXhPZihZRUFSX0xBWUVSKSA+IC0xKSB7XG4gICAgICAgICAgICBsYXllclR5cGUgPSBZRUFSX0xBWUVSO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fc2V0U2VsZWN0YWJsZUNsYXNzTmFtZSgkZGF0ZUNvbnRhaW5lciwgZGF0ZUhhc2gsIGxheWVyVHlwZSk7XG4gICAgICAgIGlmICh0aGlzLl9kYXRlKSB7XG4gICAgICAgICAgICB0aGlzLl9zZXRTZWxlY3RlZENsYXNzTmFtZSgkZGF0ZUNvbnRhaW5lciwgZGF0ZUhhc2gsIGxheWVyVHlwZSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXZlbnQgaGFuZGxlciBmb3IgJ2FmdGVyRHJhdyctY3VzdG9tIGV2ZW50IG9mIGNhbGVuZGFyXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAc2VlIHt0dWkuY29tcG9uZW50LkNhbGVuZGFyLmRyYXd9XG4gICAgICovXG4gICAgX29uQWZ0ZXJEcmF3Q2FsZW5kYXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9zaG93T25seVZhbGlkQnV0dG9ucygpO1xuICAgICAgICB0aGlzLl9iaW5kT25DbGlja0NhbGVuZGFyKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgb25seSB2YWxpZCBidXR0b25zIGluIGNhbGVuZGFyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2hvd09ubHlWYWxpZEJ1dHRvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJGhlYWRlciA9IHRoaXMuX2NhbGVuZGFyLiRoZWFkZXI7XG4gICAgICAgIHZhciAkcHJldkJ0biA9ICRoZWFkZXIuZmluZCgnW2NsYXNzKj1cImJ0bi1wcmV2XCJdJykuaGlkZSgpO1xuICAgICAgICB2YXIgJG5leHRCdG4gPSAkaGVhZGVyLmZpbmQoJ1tjbGFzcyo9XCJidG4tbmV4dFwiXScpLmhpZGUoKTtcbiAgICAgICAgdmFyIGRpZmZUaW1lID0gdGhpcy5fZ2V0RGlmZlRpbWUoKTtcblxuICAgICAgICBpZiAoZGlmZlRpbWUuc3RhcnQgPiAwKSB7XG4gICAgICAgICAgICAkcHJldkJ0bi5zaG93KCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGlmZlRpbWUuZW5kID4gMCkge1xuICAgICAgICAgICAgJG5leHRCdG4uc2hvdygpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQga2V5ZG93biBldmVudCBoYW5kbGVyIHRvIHRoZSB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0RWwgLSB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2JpbmRLZXlkb3duRXZlbnQ6IGZ1bmN0aW9uKCR0YXJnZXRFbCkge1xuICAgICAgICBpZiAodGhpcy5fZW5hYmxlU2V0RGF0ZUJ5RW50ZXJLZXkpIHtcbiAgICAgICAgICAgICR0YXJnZXRFbC5vbigna2V5ZG93bicsIHRoaXMuX3Byb3h5SGFuZGxlcnMub25LZXlkb3duRWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5iaW5kIGtleWRvd24gZXZlbnQgaGFuZGxlciBmcm9tIHRoZSB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0RWwgLSB0YXJnZXQgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3VuYmluZEtleWRvd25FdmVudDogZnVuY3Rpb24oJHRhcmdldEVsKSB7XG4gICAgICAgIGlmICh0aGlzLl9lbmFibGVTZXREYXRlQnlFbnRlcktleSkge1xuICAgICAgICAgICAgJHRhcmdldEVsLm9mZigna2V5ZG93bicsIHRoaXMuX3Byb3h5SGFuZGxlcnMub25LZXlkb3duRWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBhIChtb3VzZWRvd258dG91Y2hzdGFydCkgZXZlbnQgb2YgZG9jdW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9iaW5kT25Nb3VzZWRvd25Eb2N1bWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBldmVudFR5cGUgPSAodGhpcy51c2VUb3VjaEV2ZW50KSA/ICd0b3VjaHN0YXJ0JyA6ICdtb3VzZWRvd24nO1xuICAgICAgICAkKGRvY3VtZW50KS5vbihldmVudFR5cGUsIHRoaXMuX3Byb3h5SGFuZGxlcnMub25Nb3VzZWRvd25Eb2N1bWVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVuYmluZCBtb3VzZWRvd24sdG91Y2hzdGFydCBldmVudHMgb2YgZG9jdW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF91bmJpbmRPbk1vdXNlZG93bkRvY3VtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgJChkb2N1bWVudCkub2ZmKCdtb3VzZWRvd24gdG91Y2hzdGFydCcsIHRoaXMuX3Byb3h5SGFuZGxlcnMub25Nb3VzZWRvd25Eb2N1bWVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgY2xpY2sgZXZlbnQgb2YgY2FsZW5kYXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9iaW5kT25DbGlja0NhbGVuZGFyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGhhbmRsZXIgPSB0aGlzLl9wcm94eUhhbmRsZXJzLm9uQ2xpY2tDYWxlbmRhcixcbiAgICAgICAgICAgIGV2ZW50VHlwZSA9ICh0aGlzLnVzZVRvdWNoRXZlbnQpID8gJ3RvdWNoZW5kJyA6ICdjbGljayc7XG4gICAgICAgIHRoaXMuXyR3cmFwcGVyRWxlbWVudC5maW5kKCcuJyArIHRoaXMuX3NlbGVjdGFibGVDbGFzc05hbWUpLm9uKGV2ZW50VHlwZSwgaGFuZGxlcik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVuYmluZCBjbGljayBldmVudCBvZiBjYWxlbmRhclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3VuYmluZE9uQ2xpY2tDYWxlbmRhcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBoYW5kbGVyID0gdGhpcy5fcHJveHlIYW5kbGVycy5vbkNsaWNrQ2FsZW5kYXI7XG4gICAgICAgIHRoaXMuXyR3cmFwcGVyRWxlbWVudC5maW5kKCcuJyArIHRoaXMuX3NlbGVjdGFibGVDbGFzc05hbWUpLm9mZignY2xpY2sgdG91Y2hlbmQnLCBoYW5kbGVyKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBjdXN0b20gZXZlbnQgb2YgY2FsZW5kYXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9iaW5kQ2FsZW5kYXJDdXN0b21FdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwcm94eUhhbmRsZXJzID0gdGhpcy5fcHJveHlIYW5kbGVycyxcbiAgICAgICAgICAgIG9uQmVmb3JlRHJhdyA9IHByb3h5SGFuZGxlcnMub25CZWZvcmVEcmF3Q2FsZW5kYXIsXG4gICAgICAgICAgICBvbkRyYXcgPSBwcm94eUhhbmRsZXJzLm9uRHJhd0NhbGVuZGFyLFxuICAgICAgICAgICAgb25BZnRlckRyYXcgPSBwcm94eUhhbmRsZXJzLm9uQWZ0ZXJEcmF3Q2FsZW5kYXI7XG5cbiAgICAgICAgdGhpcy5fY2FsZW5kYXIub24oe1xuICAgICAgICAgICAgJ2JlZm9yZURyYXcnOiBvbkJlZm9yZURyYXcsXG4gICAgICAgICAgICAnZHJhdyc6IG9uRHJhdyxcbiAgICAgICAgICAgICdhZnRlckRyYXcnOiBvbkFmdGVyRHJhd1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5iaW5kIGN1c3RvbSBldmVudCBvZiBjYWxlbmRhclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3VuYmluZENhbGVuZGFyQ3VzdG9tRXZlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcHJveHlIYW5kbGVycyA9IHRoaXMuX3Byb3h5SGFuZGxlcnMsXG4gICAgICAgICAgICBvbkJlZm9yZURyYXcgPSBwcm94eUhhbmRsZXJzLm9uQmVmb3JlRHJhd0NhbGVuZGFyLFxuICAgICAgICAgICAgb25EcmF3ID0gcHJveHlIYW5kbGVycy5vbkRyYXdDYWxlbmRhcixcbiAgICAgICAgICAgIG9uQWZ0ZXJEcmF3ID0gcHJveHlIYW5kbGVycy5vbkFmdGVyRHJhd0NhbGVuZGFyO1xuXG4gICAgICAgIHRoaXMuX2NhbGVuZGFyLm9mZih7XG4gICAgICAgICAgICAnYmVmb3JlRHJhdyc6IG9uQmVmb3JlRHJhdyxcbiAgICAgICAgICAgICdkcmF3Jzogb25EcmF3LFxuICAgICAgICAgICAgJ2FmdGVyRHJhdyc6IG9uQWZ0ZXJEcmF3XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCaW5kIGNsaWNrIGV2ZW50IG9mIG9wZW5lclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR8alF1ZXJ5fSBlbGVtZW50IC0gT3BlbmVyIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9iaW5kT25DbGlja09wZW5lcjogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICB2YXIgZXZlbnRUeXBlID0gKHRoaXMudXNlVG91Y2hFdmVudCkgPyAndG91Y2hlbmQnIDogJ2NsaWNrJztcbiAgICAgICAgJChlbGVtZW50KS5vbihldmVudFR5cGUsIHRoaXMuX3Byb3h5SGFuZGxlcnMub25DbGlja09wZW5lcik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVuYmluZCBjbGljayBldmVudCBvZiBvcGVuZXJcbiAgICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIE9wZW5lciBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfdW5iaW5kT25DbGlja09wZW5lcjogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICB2YXIgZXZlbnRUeXBlID0gKHRoaXMudXNlVG91Y2hFdmVudCkgPyAndG91Y2hlbmQnIDogJ2NsaWNrJztcbiAgICAgICAgJChlbGVtZW50KS5vbihldmVudFR5cGUsIHRoaXMuX3Byb3h5SGFuZGxlcnMub25DbGlja09wZW5lcik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjdXJyZW50IGxheWVyIHR5cGVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEN1cnJlbnRMYXllcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBsYXllcnNbdGhpcy5fc2hvd25MYXllcklkeF07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIGxheWVyLXR5cGUgc2hvdWxkIGJlIHNob3duLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gbGF5ZXIgdHlwZSAoWUVBUl9MQVlFUiwgTU9OVEhfTEFZRVIsIERBVEVfTEFZRVIpXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2hvdWxkU2hvd0xheWVyOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIHZhciBtYXRjaGVkTGF5ZXJzID0gdGhpcy5fZGF0ZUZvcm1hdC5tYXRjaChmb3JtYXRSZWdFeHApO1xuICAgICAgICB2YXIgZnVuY3RvciA9IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgcmV0dXJuIG1hdGNoZWRMYXllcnMuaW5kZXhPZih2YWwpID4gLTE7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBjYW5kaWRhdGVzO1xuXG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSBEQVRFX0xBWUVSOlxuICAgICAgICAgICAgICAgIGNhbmRpZGF0ZXMgPSBkYXRlS2V5cztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTU9OVEhfTEFZRVI6XG4gICAgICAgICAgICAgICAgY2FuZGlkYXRlcyA9IG1vbnRoS2V5cztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgWUVBUl9MQVlFUjpcbiAgICAgICAgICAgICAgICBjYW5kaWRhdGVzID0geWVhcktleXM7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAhIXV0aWwuZmlsdGVyKGNhbmRpZGF0ZXMsIGZ1bmN0b3IpLmxlbmd0aDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHNob3duIGxheWVyIGJ5IGZvcm1hdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldFNob3duTGF5ZXJJbmRleEJ5Rm9ybTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBsYXllcklkeCA9IDA7XG5cbiAgICAgICAgaWYgKHRoaXMuX3Nob3VsZFNob3dMYXllcihZRUFSX0xBWUVSKSkge1xuICAgICAgICAgICAgbGF5ZXJJZHggPSBsYXllcnMuaW5kZXhPZihZRUFSX0xBWUVSKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fc2hvdWxkU2hvd0xheWVyKE1PTlRIX0xBWUVSKSkge1xuICAgICAgICAgICAgbGF5ZXJJZHggPSBsYXllcnMuaW5kZXhPZihNT05USF9MQVlFUik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX3Nob3VsZFNob3dMYXllcihEQVRFX0xBWUVSKSkge1xuICAgICAgICAgICAgbGF5ZXJJZHggPSBsYXllcnMuaW5kZXhPZihEQVRFX0xBWUVSKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3Nob3duTGF5ZXJJZHggPSBsYXllcklkeDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGhhc2ggZGF0ZSBpbiByYW5nZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzdGFydEhhc2ggLSBTdGFydCBkYXRlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGVuZEhhc2ggLSBFbmQgZGF0ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldEhhc2hJblJhbmdlOiBmdW5jdGlvbihzdGFydEhhc2gsIGVuZEhhc2gpIHtcbiAgICAgICAgc3RhcnRIYXNoLm1vbnRoID0gc3RhcnRIYXNoLm1vbnRoIHx8IDE7XG4gICAgICAgIGVuZEhhc2gubW9udGggPSBlbmRIYXNoLm1vbnRoIHx8IDEyO1xuXG4gICAgICAgIHN0YXJ0SGFzaC5kYXRlID0gc3RhcnRIYXNoLmRhdGUgfHwgMTtcbiAgICAgICAgZW5kSGFzaC5kYXRlID0gZW5kSGFzaC5kYXRlIHx8IGRhdGVVdGlsLmdldExhc3REYXlJbk1vbnRoKGVuZEhhc2gueWVhciwgZW5kSGFzaC5tb250aCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBkaWZmZXJlbmNlIHN0YXJ0IHRvIGVuZCB0aW1lXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBUaW1lIGRpZmZlcmVuY2UgdmFsdWVcbiAgICAgKi9cbiAgICBfZ2V0RGlmZlRpbWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2hvd25MYXllcklkeCA9IHRoaXMuX2NhbGVuZGFyLnNob3duTGF5ZXJJZHg7XG4gICAgICAgIHZhciBzaG93bkRhdGVIYXNoID0gdGhpcy5fY2FsZW5kYXIuZ2V0RGF0ZSgpO1xuICAgICAgICB2YXIgc2hvd25EYXRlID0gbmV3IERhdGUoc2hvd25EYXRlSGFzaC55ZWFyLCBzaG93bkRhdGVIYXNoLm1vbnRoIC0gMSk7XG4gICAgICAgIHZhciBzdGFydERhdGUgPSBuZXcgRGF0ZSh0aGlzLl9zdGFydFRpbWVzWzBdIHx8IE1JTl9FREdFKS5zZXREYXRlKDEpO1xuICAgICAgICB2YXIgZW5kRGF0ZSA9IG5ldyBEYXRlKHRoaXMuX2VuZFRpbWVzLnNsaWNlKC0xKVswXSB8fCBNQVhfRURHRSkuc2V0RGF0ZSgxKTtcbiAgICAgICAgdmFyIHllYXJSYW5nZSwgc2hvd25TdGFydERhdGUsIHNob3duRW5kRGF0ZSwgc3RhcnREaWZmZXJlbmNlLCBlbmREaWZmZXJlbmNlO1xuXG4gICAgICAgIGlmIChzaG93bkxheWVySWR4ID09PSAwKSB7XG4gICAgICAgICAgICBzdGFydERpZmZlcmVuY2UgPSBzaG93bkRhdGUgLSBzdGFydERhdGU7XG4gICAgICAgICAgICBlbmREaWZmZXJlbmNlID0gZW5kRGF0ZSAtIHNob3duRGF0ZTtcbiAgICAgICAgfSBlbHNlIGlmIChzaG93bkxheWVySWR4ID09PSAxKSB7XG4gICAgICAgICAgICBzaG93blN0YXJ0RGF0ZSA9IG5ldyBEYXRlKHNob3duRGF0ZSkuc2V0TW9udGgoMCk7XG4gICAgICAgICAgICBzaG93bkVuZERhdGUgPSBuZXcgRGF0ZShzaG93bkRhdGUpLnNldE1vbnRoKDExKTtcblxuICAgICAgICAgICAgc3RhcnREaWZmZXJlbmNlID0gc2hvd25TdGFydERhdGUgLSBzdGFydERhdGU7XG4gICAgICAgICAgICBlbmREaWZmZXJlbmNlID0gZW5kRGF0ZSAtIHNob3duRW5kRGF0ZTtcbiAgICAgICAgfSBlbHNlIGlmIChzaG93bkxheWVySWR4ID09PSAyKSB7XG4gICAgICAgICAgICB5ZWFyUmFuZ2UgPSB0aGlzLl9jYWxlbmRhci5fZ2V0SW5mb09mWWVhclJhbmdlKHNob3duRGF0ZUhhc2gueWVhcik7XG4gICAgICAgICAgICBzaG93blN0YXJ0RGF0ZSA9IE51bWJlcihuZXcgRGF0ZSh5ZWFyUmFuZ2Uuc3RhcnRZZWFyLCAwKSk7XG4gICAgICAgICAgICBzaG93bkVuZERhdGUgPSBOdW1iZXIobmV3IERhdGUoeWVhclJhbmdlLmVuZFllYXIsIDApKTtcblxuICAgICAgICAgICAgc3RhcnREYXRlID0gbmV3IERhdGUoc3RhcnREYXRlKS5zZXRNb250aCgwKTtcbiAgICAgICAgICAgIGVuZERhdGUgPSBuZXcgRGF0ZShlbmREYXRlKS5zZXRNb250aCgwKTtcblxuICAgICAgICAgICAgc3RhcnREaWZmZXJlbmNlID0gc2hvd25TdGFydERhdGUgLSBzdGFydERhdGU7XG4gICAgICAgICAgICBlbmREaWZmZXJlbmNlID0gZW5kRGF0ZSAtIHNob3duRW5kRGF0ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdGFydDogc3RhcnREaWZmZXJlbmNlLFxuICAgICAgICAgICAgZW5kOiBlbmREaWZmZXJlbmNlXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBhIHJhbmdlXG4gICAgICogQHBhcmFtIHtkYXRlSGFzaH0gc3RhcnRIYXNoIC0gU3RhcnQgZGF0ZUhhc2hcbiAgICAgKiBAcGFyYW0ge2RhdGVIYXNofSBlbmRIYXNoIC0gRW5kIGRhdGVIYXNoXG4gICAgICogQHNpbmNlIDEuMi4wXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgc3RhcnQgPSB7eWVhcjogMjAxNSwgbW9udGg6IDIsIGRhdGU6IDN9LFxuICAgICAqICAgICBlbmQgPSB7eWVhcjogMjAxNSwgbW9udGg6IDMsIGRhdGU6IDZ9O1xuICAgICAqXG4gICAgICogZGF0ZXBpY2tlci5hZGRSYW5nZShzdGFydCwgZW5kKTtcbiAgICAgKi9cbiAgICBhZGRSYW5nZTogZnVuY3Rpb24oc3RhcnRIYXNoLCBlbmRIYXNoKSB7XG4gICAgICAgIHN0YXJ0SGFzaCA9IGV4dGVuZCh7fSwgc3RhcnRIYXNoKTtcbiAgICAgICAgZW5kSGFzaCA9IGV4dGVuZCh7fSwgZW5kSGFzaCk7XG5cbiAgICAgICAgdGhpcy5fc2V0SGFzaEluUmFuZ2Uoc3RhcnRIYXNoLCBlbmRIYXNoKTtcblxuICAgICAgICBpZiAodGhpcy5faXNWYWxpZERhdGVIYXNoKHN0YXJ0SGFzaCkgJiYgdGhpcy5faXNWYWxpZERhdGVIYXNoKGVuZEhhc2gpKSB7XG4gICAgICAgICAgICB0aGlzLl9yYW5nZXMucHVzaChbc3RhcnRIYXNoLCBlbmRIYXNoXSk7XG4gICAgICAgICAgICB0aGlzLl9zZXRTZWxlY3RhYmxlUmFuZ2VzKCk7XG4gICAgICAgICAgICB0aGlzLl9jYWxlbmRhci5kcmF3KDAsIDAsIGZhbHNlLCB0aGlzLl9zaG93bkxheWVySWR4KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgYSByYW5nZVxuICAgICAqIEBwYXJhbSB7ZGF0ZUhhc2h9IHN0YXJ0SGFzaCAtIFN0YXJ0IGRhdGVIYXNoXG4gICAgICogQHBhcmFtIHtkYXRlSGFzaH0gZW5kSGFzaCAtIEVuZCBkYXRlSGFzaFxuICAgICAqIEBzaW5jZSAxLjIuMFxuICAgICAqIEBleGFtcGxlXG4gICAgICogdmFyIHN0YXJ0ID0ge3llYXI6IDIwMTUsIG1vbnRoOiAyLCBkYXRlOiAzfSxcbiAgICAgKiAgICAgZW5kID0ge3llYXI6IDIwMTUsIG1vbnRoOiAzLCBkYXRlOiA2fTtcbiAgICAgKlxuICAgICAqIGRhdGVwaWNrZXIuYWRkUmFuZ2Uoc3RhcnQsIGVuZCk7XG4gICAgICogZGF0ZXBpY2tlci5yZW1vdmVSYW5nZShzdGFydCwgZW5kKTtcbiAgICAgKi9cbiAgICByZW1vdmVSYW5nZTogZnVuY3Rpb24oc3RhcnRIYXNoLCBlbmRIYXNoKSB7XG4gICAgICAgIHZhciByYW5nZXMgPSB0aGlzLl9yYW5nZXM7XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgdmFyIGxlbiA9IHJhbmdlcy5sZW5ndGg7XG4gICAgICAgIHZhciB0YXJnZXQ7XG5cbiAgICAgICAgc3RhcnRIYXNoID0gZXh0ZW5kKHt9LCBzdGFydEhhc2gpO1xuICAgICAgICBlbmRIYXNoID0gZXh0ZW5kKHt9LCBlbmRIYXNoKTtcblxuICAgICAgICB0aGlzLl9zZXRIYXNoSW5SYW5nZShzdGFydEhhc2gsIGVuZEhhc2gpO1xuXG4gICAgICAgIHRhcmdldCA9IFtzdGFydEhhc2gsIGVuZEhhc2hdO1xuXG4gICAgICAgIGZvciAoOyBpIDwgbGVuOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGlmIChjb21wYXJlSlNPTih0YXJnZXQsIHJhbmdlc1tpXSkpIHtcbiAgICAgICAgICAgICAgICByYW5nZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fc2V0U2VsZWN0YWJsZVJhbmdlcygpO1xuICAgICAgICB0aGlzLl9jYWxlbmRhci5kcmF3KDAsIDAsIGZhbHNlLCB0aGlzLl9zaG93bkxheWVySWR4KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHNlbGVjdGFibGUgcmFuZ2VzXG4gICAgICogQHBhcmFtIHtBcnJheS48QXJyYXkuPGRhdGVIYXNoPj59IHJhbmdlcyAtIFRoZSBzYW1lIHdpdGggdGhlIHNlbGVjdGFibGVSYW5nZXMgb3B0aW9uIHZhbHVlc1xuICAgICAqIEBzaW5jZSAxLjMuMFxuICAgICAqL1xuICAgIHNldFJhbmdlczogZnVuY3Rpb24ocmFuZ2VzKSB7XG4gICAgICAgIHRoaXMuX3JhbmdlcyA9IHRoaXMuX2ZpbHRlclZhbGlkUmFuZ2VzKHJhbmdlcyk7XG4gICAgICAgIHRoaXMuX3NldFNlbGVjdGFibGVSYW5nZXMoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHBvc2l0aW9uLWxlZnQsIHRvcCBvZiBjYWxlbmRhclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gcG9zaXRpb24tbGVmdFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gcG9zaXRpb24tdG9wXG4gICAgICogQHNpbmNlIDEuMS4xXG4gICAgICovXG4gICAgc2V0WFk6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgdmFyIHBvcyA9IHRoaXMuX3BvcztcblxuICAgICAgICBwb3MubGVmdCA9IGlzTnVtYmVyKHgpID8geCA6IHBvcy5sZWZ0O1xuICAgICAgICBwb3MudG9wID0gaXNOdW1iZXIoeSkgPyB5IDogcG9zLnRvcDtcbiAgICAgICAgdGhpcy5fYXJyYW5nZUxheWVyKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCB6LWluZGV4IG9mIGNhbGVuZGFyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHpJbmRleCAtIHotaW5kZXggdmFsdWVcbiAgICAgKiBAc2luY2UgMS4xLjFcbiAgICAgKi9cbiAgICBzZXRaSW5kZXg6IGZ1bmN0aW9uKHpJbmRleCkge1xuICAgICAgICBpZiAoIWlzTnVtYmVyKHpJbmRleCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3Bvcy56SW5kZXggPSB6SW5kZXg7XG4gICAgICAgIHRoaXMuX2FycmFuZ2VMYXllcigpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBhZGQgb3BlbmVyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudHxqUXVlcnl8c3RyaW5nfSBvcGVuZXIgLSBlbGVtZW50IG9yIHNlbGVjdG9yXG4gICAgICovXG4gICAgYWRkT3BlbmVyOiBmdW5jdGlvbihvcGVuZXIpIHtcbiAgICAgICAgdmFyIGV2ZW50VHlwZSA9ICh0aGlzLnVzZVRvdWNoRXZlbnQpID8gJ3RvdWNoZW5kJyA6ICdjbGljaycsXG4gICAgICAgICAgICAkb3BlbmVyID0gJChvcGVuZXIpO1xuXG4gICAgICAgIG9wZW5lciA9ICRvcGVuZXJbMF07XG4gICAgICAgIGlmIChvcGVuZXIgJiYgaW5BcnJheShvcGVuZXIsIHRoaXMuX29wZW5lcnMpIDwgMCkge1xuICAgICAgICAgICAgdGhpcy5fb3BlbmVycy5wdXNoKG9wZW5lcik7XG4gICAgICAgICAgICAkb3BlbmVyLm9uKGV2ZW50VHlwZSwgdGhpcy5fcHJveHlIYW5kbGVycy5vbkNsaWNrT3BlbmVyKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZW1vdmUgb3BlbmVyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudHxqUXVlcnl8c3RyaW5nfSBvcGVuZXIgLSBlbGVtZW50IG9yIHNlbGVjdG9yXG4gICAgICovXG4gICAgcmVtb3ZlT3BlbmVyOiBmdW5jdGlvbihvcGVuZXIpIHtcbiAgICAgICAgdmFyICRvcGVuZXIgPSAkKG9wZW5lciksXG4gICAgICAgICAgICBpbmRleCA9IGluQXJyYXkoJG9wZW5lclswXSwgdGhpcy5fb3BlbmVycyk7XG5cbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgICRvcGVuZXIub2ZmKCdjbGljayB0b3VjaGVuZCcsIHRoaXMuX3Byb3h5SGFuZGxlcnMub25DbGlja09wZW5lcik7XG4gICAgICAgICAgICB0aGlzLl9vcGVuZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT3BlbiBjYWxlbmRhciB3aXRoIGFycmFuZ2luZyBwb3NpdGlvblxuICAgICAqIEBleGFtcGxlXG4gICAgICogZGF0ZXBpY2tlci5vcGVuKCk7XG4gICAgICovXG4gICAgb3BlbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkYXRlO1xuXG4gICAgICAgIGlmICh0aGlzLmlzT3BlbmVkKCkgfHwgIXRoaXMuX2VuYWJsZWRTdGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZGF0ZSA9IHRoaXMuX2RhdGUgfHwgZGF0ZVV0aWwuZ2V0VG9kYXkoKTtcblxuICAgICAgICB0aGlzLl9hcnJhbmdlTGF5ZXIoKTtcbiAgICAgICAgdGhpcy5fYmluZENhbGVuZGFyQ3VzdG9tRXZlbnQoKTtcbiAgICAgICAgdGhpcy5fY2FsZW5kYXIuZHJhdyhkYXRlLnllYXIsIGRhdGUubW9udGgsIGZhbHNlLCB0aGlzLl9zaG93bkxheWVySWR4KTtcbiAgICAgICAgdGhpcy5fJHdyYXBwZXJFbGVtZW50LnNob3coKTtcbiAgICAgICAgaWYgKCF0aGlzLnNob3dBbHdheXMpIHtcbiAgICAgICAgICAgIHRoaXMuX2JpbmRPbk1vdXNlZG93bkRvY3VtZW50KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQGV2ZW50IERhdGVQaWNrZXIjb3BlblxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKiBkYXRlUGlja2VyLm9uKCdvcGVuJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAqICAgICBhbGVydCgnb3BlbicpO1xuICAgICAgICAgKiB9KTtcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZmlyZSgnb3BlbicpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDbG9zZSBjYWxlbmRhciB3aXRoIHVuYmluZGluZyBzb21lIGV2ZW50c1xuICAgICAqIEBleG1hcGxlXG4gICAgICogZGF0ZXBpY2tlci5jbG9zZSgpO1xuICAgICAqL1xuICAgIGNsb3NlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzT3BlbmVkKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl91bmJpbmRDYWxlbmRhckN1c3RvbUV2ZW50KCk7XG4gICAgICAgIHRoaXMuX3VuYmluZE9uTW91c2Vkb3duRG9jdW1lbnQoKTtcbiAgICAgICAgdGhpcy5fJHdyYXBwZXJFbGVtZW50LmhpZGUoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2xvc2UgZXZlbnQgLSBEYXRlUGlja2VyXG4gICAgICAgICAqIEBldmVudCBEYXRlUGlja2VyI2Nsb3NlXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqIGRhdGVQaWNrZXIub24oJ2Nsb3NlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAqICAgICBhbGVydCgnY2xvc2UnKTtcbiAgICAgICAgICogfSk7XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmZpcmUoJ2Nsb3NlJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBkYXRlLW9iamVjdCBvZiBjdXJyZW50IERhdGVQaWNrZXIgaW5zdGFuY2UuXG4gICAgICogQHJldHVybnMgez9kYXRlSGFzaH0gLSBkYXRlSGFzaCBoYXZpbmcgeWVhciwgbW9udGggYW5kIGRheS1pbi1tb250aFxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gMjAxNS0wNC0xM1xuICAgICAqIGRhdGVwaWNrZXIuZ2V0RGF0ZUhhc2goKTsgLy8ge3llYXI6IDIwMTUsIG1vbnRoOiA0LCBkYXRlOiAxM31cbiAgICAgKi9cbiAgICBnZXREYXRlSGFzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkYXRlSGFzaCwgZGVwdGhJZHg7XG5cbiAgICAgICAgaWYgKCF0aGlzLl9kYXRlKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGRhdGVIYXNoID0ge307XG4gICAgICAgIGRlcHRoSWR4ID0gdGhpcy5fc2hvd25MYXllcklkeDtcblxuICAgICAgICBleHRlbmQoZGF0ZUhhc2gsIHRoaXMuX2RhdGUpO1xuXG4gICAgICAgIGlmIChkZXB0aElkeCA+IDEpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBkYXRlSGFzaC5tb250aDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkZXB0aElkeCA+IDApIHtcbiAgICAgICAgICAgIGRlbGV0ZSBkYXRlSGFzaC5kYXRlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRhdGVIYXNoO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4geWVhclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IC0geWVhclxuICAgICAqIEBleGFtcGxlXG4gICAgICogLy8gMjAxNS0wNC0xM1xuICAgICAqIGRhdGVwaWNrZXIuZ2V0WWVhcigpOyAvLyAyMDE1XG4gICAgICovXG4gICAgZ2V0WWVhcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kYXRlLnllYXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBtb250aFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IC0gbW9udGhcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIDIwMTUtMDQtMTNcbiAgICAgKiBkYXRlcGlja2VyLmdldE1vbnRoKCk7IC8vIDRcbiAgICAgKi9cbiAgICBnZXRNb250aDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kYXRlLm1vbnRoO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gZGF5LWluLW1vbnRoXG4gICAgICogQHJldHVybnMge251bWJlcn0gLSBkYXktaW4tbW9udGhcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIC8vIDIwMTUtMDQtMTNcbiAgICAgKiBkYXRlcGlja2VyLmdldERheUluTW9udGgoKTsgLy8gMTNcbiAgICAgKi9cbiAgICBnZXREYXlJbk1vbnRoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGUuZGF0ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGRhdGUgZnJvbSB2YWx1ZXMoeWVhciwgbW9udGgsIGRhdGUpIGFuZCB0aGVuIGZpcmUgJ3VwZGF0ZScgY3VzdG9tIGV2ZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbeWVhcl0gLSB5ZWFyXG4gICAgICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbbW9udGhdIC0gbW9udGhcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IFtkYXRlXSAtIGRheSBpbiBtb250aFxuICAgICAqIEBleGFtcGxlXG4gICAgICogZGF0ZXBpY2tlci5zZXREYXRlKDIwMTQsIDEyLCAzKTsgLy8gMjAxNC0xMi0gMDNcbiAgICAgKiBkYXRlcGlja2VyLnNldERhdGUobnVsbCwgMTEsIDIzKTsgLy8gMjAxNC0xMS0yM1xuICAgICAqIGRhdGVwaWNrZXIuc2V0RGF0ZSgnMjAxNScsICc1JywgMyk7IC8vIDIwMTUtMDUtMDNcbiAgICAgKiBkYXRlcGlja2VyLnNldERhdGUoMjAxNiwgMTApOyAvLyAyMDE2LTEwXG4gICAgICogZGF0ZXBpY2tlci5zZXREYXRlKDIwMTcpOyAvLyAyMDE3XG4gICAgICovXG4gICAgc2V0RGF0ZTogZnVuY3Rpb24oeWVhciwgbW9udGgsIGRhdGUpIHtcbiAgICAgICAgdmFyIGRhdGVPYmogPSB0aGlzLl9kYXRlIHx8IGRhdGVVdGlsLmdldFRvZGF5KCk7XG4gICAgICAgIHZhciBwcmV2RGF0ZU9iaiA9IGV4dGVuZCh7fSwgdGhpcy5fZGF0ZSk7XG4gICAgICAgIHZhciBjdXJyZW50TGF5ZXIgPSB0aGlzLl9nZXRDdXJyZW50TGF5ZXIoKTtcbiAgICAgICAgdmFyIG5ld0RhdGVPYmogPSB7XG4gICAgICAgICAgICB5ZWFyOiB5ZWFyIHx8IGRhdGVPYmoueWVhcixcbiAgICAgICAgICAgIG1vbnRoOiBtb250aCB8fCBkYXRlT2JqLm1vbnRoLFxuICAgICAgICAgICAgZGF0ZTogZGF0ZSB8fCBkYXRlT2JqLmRhdGVcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHNob3VsZFVwZGF0ZSA9IChcbiAgICAgICAgICAgIHRoaXMuX2lzU2VsZWN0YWJsZShuZXdEYXRlT2JqLCBjdXJyZW50TGF5ZXIpXG4gICAgICAgICAgICAmJiAhZGF0ZVV0aWwuaXNFcXVhbERhdGVIYXNoKHByZXZEYXRlT2JqLCBuZXdEYXRlT2JqKVxuICAgICAgICApO1xuXG4gICAgICAgIGlmIChzaG91bGRVcGRhdGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2RhdGUgPSBuZXdEYXRlT2JqO1xuICAgICAgICAgICAgdGhpcy5fc2V0VmFsdWVUb0lucHV0RWxlbWVudCgpO1xuICAgICAgICAgICAgdGhpcy5fY2FsZW5kYXIuZHJhdyhuZXdEYXRlT2JqLnllYXIsIG5ld0RhdGVPYmoubW9udGgsIGZhbHNlLCBjdXJyZW50TGF5ZXIpO1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBVcGRhdGUgZXZlbnRcbiAgICAgICAgICAgICAqIEBldmVudCBEYXRlUGlja2VyI3VwZGF0ZVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmZpcmUoJ3VwZGF0ZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fc2V0VmFsdWVUb0lucHV0RWxlbWVudCgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBvciB1cGRhdGUgZGF0ZS1mb3JtXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IFtmb3JtYXRdIC0gZGF0ZS1mb3JtYXRcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGRhdGVwaWNrZXIuc2V0RGF0ZUZvcm0oJ3l5eXktbW0tZGQnKTtcbiAgICAgKiBkYXRlcGlja2VyLnNldERhdGVGb3JtKCdtbS1kZCwgeXl5eScpO1xuICAgICAqIGRhdGVwaWNrZXIuc2V0RGF0ZUZvcm0oJ3kvbS9kJyk7XG4gICAgICogZGF0ZXBpY2tlci5zZXREYXRlRm9ybSgneXkvbW0vZGQnKTtcbiAgICAgKi9cbiAgICBzZXREYXRlRm9ybTogZnVuY3Rpb24oZm9ybWF0KSB7XG4gICAgICAgIHRoaXMuX2RhdGVGb3JtYXQgPSBmb3JtYXQgfHwgdGhpcy5fZGF0ZUZvcm1hdDtcblxuICAgICAgICB0aGlzLl9zZXRTaG93bkxheWVySW5kZXhCeUZvcm0oKTtcbiAgICAgICAgdGhpcy5fc2V0UmVnRXhwKCk7XG4gICAgICAgIGlmICh0aGlzLl9kYXRlKSB7XG4gICAgICAgICAgICB0aGlzLnNldERhdGUoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gd2hldGhlciB0aGUgY2FsZW5kYXIgaXMgb3BlbmVkIG9yIG5vdFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSAtIHRydWUgaWYgb3BlbmVkLCBmYWxzZSBvdGhlcndpc2VcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGRhdGVwaWNrZXIuY2xvc2UoKTtcbiAgICAgKiBkYXRlcGlja2VyLmlzT3BlbmVkKCk7IC8vIGZhbHNlXG4gICAgICpcbiAgICAgKiBkYXRlcGlja2VyLm9wZW4oKTtcbiAgICAgKiBkYXRlcGlja2VyLmlzT3BlbmVkKCk7IC8vIHRydWVcbiAgICAgKi9cbiAgICBpc09wZW5lZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5fJHdyYXBwZXJFbGVtZW50LmNzcygnZGlzcGxheScpID09PSAnYmxvY2snKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIFRpbWVQaWNrZXIgaW5zdGFuY2VcbiAgICAgKiBAcmV0dXJucyB7VGltZVBpY2tlcn0gLSBUaW1lUGlja2VyIGluc3RhbmNlXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgdGltZXBpY2tlciA9IHRoaXMuZ2V0VGltZXBpY2tlcigpO1xuICAgICAqL1xuICAgIGdldFRpbWVQaWNrZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdGltZVBpY2tlcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGlucHV0IGVsZW1lbnQgb2YgdGhpcyBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR8alF1ZXJ5fSBlbGVtZW50IC0gaW5wdXQgZWxlbWVudFxuICAgICAqIEBzaW5jZSAxLjMuMFxuICAgICAqL1xuICAgIHNldEVsZW1lbnQ6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgdmFyICRjdXJyZW50RWwgPSB0aGlzLl8kZWxlbWVudDtcbiAgICAgICAgdmFyICRuZXdFbCA9ICQoZWxlbWVudCk7XG5cbiAgICAgICAgaWYgKCRjdXJyZW50RWxbMF0pIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlT3BlbmVyKCRjdXJyZW50RWwpO1xuICAgICAgICAgICAgdGhpcy5fdW5iaW5kS2V5ZG93bkV2ZW50KCRjdXJyZW50RWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hZGRPcGVuZXIoJG5ld0VsKTtcbiAgICAgICAgdGhpcy5fYmluZEtleWRvd25FdmVudCgkbmV3RWwpO1xuICAgICAgICB0aGlzLl9zZXREYXRlRnJvbVN0cmluZygkbmV3RWwudmFsKCkpO1xuICAgICAgICB0aGlzLl8kZWxlbWVudCA9ICRuZXdFbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRW5hYmxlIHBpY2tlclxuICAgICAqIEBzaW5jZSAxLjQuMFxuICAgICAqIEBleGFtcGxlXG4gICAgICogZGF0ZXBpY2tlci5kaXNhYmxlKCk7XG4gICAgICogZGF0ZXBpY2tlci5lbmFibGUoKTtcbiAgICAgKi9cbiAgICBlbmFibGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJG9wZW5lckVsO1xuXG4gICAgICAgIGlmICh0aGlzLl9lbmFibGVkU3RhdGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9lbmFibGVkU3RhdGUgPSB0cnVlO1xuXG4gICAgICAgIGZvckVhY2godGhpcy5fb3BlbmVycywgZnVuY3Rpb24ob3BlbmVyRWwsIGlkeCkge1xuICAgICAgICAgICAgJG9wZW5lckVsID0gJChvcGVuZXJFbCk7XG4gICAgICAgICAgICAkb3BlbmVyRWwucmVtb3ZlQXR0cignZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICRvcGVuZXJFbC5yZW1vdmVDbGFzcyh0aGlzLl9kaXNhYmxlZENsYXNzTmFtZSk7XG4gICAgICAgICAgICB0aGlzLl9iaW5kT25DbGlja09wZW5lcigkb3BlbmVyRWwpO1xuXG4gICAgICAgICAgICBpZiAoIWlkeCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2JpbmRLZXlkb3duRXZlbnQoJG9wZW5lckVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIERpc2FibGUgcGlja2VyXG4gICAgICogQHNpbmNlIDEuNC4wXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBkYXRlcGlja2VyLmVuYWJsZSgpO1xuICAgICAqIGRhdGVwaWNrZXIuZGlzYWJsZSgpO1xuICAgICAqL1xuICAgIGRpc2FibGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJG9wZW5lckVsO1xuXG4gICAgICAgIGlmICghdGhpcy5fZW5hYmxlZFN0YXRlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9lbmFibGVkU3RhdGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xuXG4gICAgICAgIGZvckVhY2godGhpcy5fb3BlbmVycywgZnVuY3Rpb24ob3BlbmVyRWwsIGlkeCkge1xuICAgICAgICAgICAgJG9wZW5lckVsID0gJChvcGVuZXJFbCk7XG4gICAgICAgICAgICAkb3BlbmVyRWwuYWRkQ2xhc3ModGhpcy5fZGlzYWJsZWRDbGFzc05hbWUpO1xuICAgICAgICAgICAgJG9wZW5lckVsLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLl91bmJpbmRPbkNsaWNrT3BlbmVyKCRvcGVuZXJFbCk7XG4gICAgICAgICAgICBpZiAoIWlkeCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3VuYmluZEtleWRvd25FdmVudCgkb3BlbmVyRWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRGVzdHJveSAtIGRlbGV0ZSB3cmFwcGVyIGVsZW1lbnQgYW5kIGF0dGFjaCBldmVudHNcbiAgICAgKiBAc2luY2UgMS40LjBcbiAgICAgKi9cbiAgICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyICRjdXJyZW50RWwgPSB0aGlzLl8kZWxlbWVudDtcblxuICAgICAgICBpZiAoJGN1cnJlbnRFbFswXSkge1xuICAgICAgICAgICAgdGhpcy5fdW5iaW5kS2V5ZG93bkV2ZW50KCRjdXJyZW50RWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fdW5iaW5kT25Nb3VzZWRvd25Eb2N1bWVudCgpO1xuICAgICAgICB0aGlzLl91bmJpbmRPbkNsaWNrQ2FsZW5kYXIoKTtcbiAgICAgICAgdGhpcy5fdW5iaW5kQ2FsZW5kYXJDdXN0b21FdmVudCgpO1xuICAgICAgICB0aGlzLl8kd3JhcHBlckVsZW1lbnQucmVtb3ZlKCk7XG4gICAgfVxufSk7XG5cbnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKERhdGVQaWNrZXIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERhdGVQaWNrZXI7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9kYXRlcGlja2VyLmpzXG4vLyBtb2R1bGUgaWQgPSAxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogQGZpbGVvdmVydmlldyBVdGlscyBmb3IgY2FsZW5kYXIgY29tcG9uZW50XG4gKiBAYXV0aG9yIE5ITiBOZXQuIEZFIGRldiBMYWIuIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKiBAZGVwZW5kZW5jeSB0dWktY29kZS1zbmlwcGV0IF4xLjAuMlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBVdGlscyBvZiBjYWxlbmRhclxuICogQG5hbWVzcGFjZSBkYXRlVXRpbFxuICogQGlnbm9yZVxuICovXG52YXIgdXRpbHMgPSB7XG4gICAgLyoqXG4gICAgICogUmV0dXJuIGRhdGUgaGFzaCBieSBwYXJhbWV0ZXIuXG4gICAgICogIGlmIHRoZXJlIGFyZSAzIHBhcmFtZXRlciwgdGhlIHBhcmFtZXRlciBpcyBjb3Jnbml6ZWQgRGF0ZSBvYmplY3RcbiAgICAgKiAgaWYgdGhlcmUgYXJlIG5vIHBhcmFtZXRlciwgcmV0dXJuIHRvZGF5J3MgaGFzaCBkYXRlXG4gICAgICogQHBhcmFtIHtEYXRlfG51bWJlcn0gW3llYXJdIEEgZGF0ZSBpbnN0YW5jZSBvciB5ZWFyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFttb250aF0gQSBtb250aFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbZGF0ZV0gQSBkYXRlXG4gICAgICogQHJldHVybnMge3t5ZWFyOiAqLCBtb250aDogKiwgZGF0ZTogKn19XG4gICAgICovXG4gICAgZ2V0RGF0ZUhhc2g6IGZ1bmN0aW9uKHllYXIsIG1vbnRoLCBkYXRlKSB7XG4gICAgICAgIHZhciBuRGF0ZTtcblxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgICAgIG5EYXRlID0gYXJndW1lbnRzWzBdIHx8IG5ldyBEYXRlKCk7XG5cbiAgICAgICAgICAgIHllYXIgPSBuRGF0ZS5nZXRGdWxsWWVhcigpO1xuICAgICAgICAgICAgbW9udGggPSBuRGF0ZS5nZXRNb250aCgpICsgMTtcbiAgICAgICAgICAgIGRhdGUgPSBuRGF0ZS5nZXREYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeWVhcjogeWVhcixcbiAgICAgICAgICAgIG1vbnRoOiBtb250aCxcbiAgICAgICAgICAgIGRhdGU6IGRhdGVcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRvZGF5IHRoYXQgc2F2ZWQgb24gY29tcG9uZW50IG9yIGNyZWF0ZSBuZXcgZGF0ZS5cbiAgICAgKiBAcmV0dXJucyB7e3llYXI6ICosIG1vbnRoOiAqLCBkYXRlOiAqfX1cbiAgICAgKi9cbiAgICBnZXRUb2RheTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB1dGlscy5nZXREYXRlSGFzaCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdW5peCB0aW1lIGZyb20gZGF0ZSBoYXNoXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGUgQSBkYXRlIGhhc2hcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGF0ZS55ZWFyIEEgeWVhclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBkYXRlLm1vbnRoIEEgbW9udGhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGF0ZS5kYXRlIEEgZGF0ZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB1dGlscy5nZXRUaW1lKHt5ZWFyOjIwMTAsIG1vbnRoOjUsIGRhdGU6MTJ9KTsgLy8gMTI3MzU5MDAwMDAwMFxuICAgICAqL1xuICAgIGdldFRpbWU6IGZ1bmN0aW9uKGRhdGUpIHtcbiAgICAgICAgcmV0dXJuIHV0aWxzLmdldERhdGVPYmplY3QoZGF0ZSkuZ2V0VGltZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgd2hpY2ggZGF5IGlzIGZpcnN0IGJ5IHBhcmFtZXRlcnMgdGhhdCBpbmNsdWRlIHllYXIgYW5kIG1vbnRoIGluZm9ybWF0aW9uLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5ZWFyIEEgeWVhclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtb250aCBBIG1vbnRoXG4gICAgICogQHJldHVybnMge251bWJlcn0gKDB+NilcbiAgICAgKi9cbiAgICBnZXRGaXJzdERheTogZnVuY3Rpb24oeWVhciwgbW9udGgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHllYXIsIG1vbnRoIC0gMSwgMSkuZ2V0RGF5KCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB3aGljaCBkYXkgaXMgbGFzdCBieSBwYXJhbWV0ZXJzIHRoYXQgaW5jbHVkZSB5ZWFyIGFuZCBtb250aCBpbmZvcm1hdGlvbi5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0geWVhciBBIHllYXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbW9udGggQSBtb250aFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9ICgwfjYpXG4gICAgICovXG4gICAgZ2V0TGFzdERheTogZnVuY3Rpb24oeWVhciwgbW9udGgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHllYXIsIG1vbnRoLCAwKS5nZXREYXkoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGxhc3QgZGF0ZSBieSBwYXJhbWV0ZXJzIHRoYXQgaW5jbHVkZSB5ZWFyIGFuZCBtb250aCBpbmZvcm1hdGlvbi5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0geWVhciBBIHllYXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbW9udGggQSBtb250aFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9ICgxfjMxKVxuICAgICAqL1xuICAgIGdldExhc3REYXlJbk1vbnRoOiBmdW5jdGlvbih5ZWFyLCBtb250aCkge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoeWVhciwgbW9udGgsIDApLmdldERhdGUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGRhdGUgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtkYXRlSGFzaH0gZGF0ZUhhc2ggQSBkYXRlIGhhc2hcbiAgICAgKiBAcmV0dXJucyB7RGF0ZX0gRGF0ZVxuICAgICAqIEBleGFtcGxlXG4gICAgICogIGRhdGVVdGlsLmdldERhdGVPYmplY3Qoe3llYXI6MjAxMCwgbW9udGg6NSwgZGF0ZToxMn0pO1xuICAgICAqICBkYXRlVXRpbC5nZXREYXRlT2JqZWN0KDIwMTAsIDUsIDEyKTsgLy95ZWFyLG1vbnRoLGRhdGVcbiAgICAgKi9cbiAgICBnZXREYXRlT2JqZWN0OiBmdW5jdGlvbihkYXRlSGFzaCkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGFyZ3VtZW50c1swXSwgYXJndW1lbnRzWzFdIC0gMSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShkYXRlSGFzaC55ZWFyLCBkYXRlSGFzaC5tb250aCAtIDEsIGRhdGVIYXNoLmRhdGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcmVsYXRlZCBkYXRlIGhhc2ggd2l0aCBwYXJhbWV0ZXJzIHRoYXQgaW5jbHVkZSBkYXRlIGluZm9ybWF0aW9uLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5ZWFyIEEgcmVsYXRlZCB2YWx1ZSBmb3IgeWVhcih5b3UgY2FuIHVzZSArLy0pXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1vbnRoIEEgcmVsYXRlZCB2YWx1ZSBmb3IgbW9udGggKHlvdSBjYW4gdXNlICsvLSlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGF0ZSBBIHJlbGF0ZWQgdmFsdWUgZm9yIGRheSAoeW91IGNhbiB1c2UgKy8tKVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRlT2JqIHN0YW5kYXJkIGRhdGUgaGFzaFxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IGRhdGVPYmpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqICBkYXRlVXRpbC5nZXRSZWxhdGl2ZURhdGUoMSwgMCwgMCwge3llYXI6MjAwMCwgbW9udGg6MSwgZGF0ZToxfSk7IC8vIHt5ZWFyOjIwMDEsIG1vbnRoOjEsIGRhdGU6MX1cbiAgICAgKiAgZGF0ZVV0aWwuZ2V0UmVsYXRpdmVEYXRlKDAsIDAsIC0xLCB7eWVhcjoyMDEwLCBtb250aDoxLCBkYXRlOjF9KTsgLy8ge3llYXI6MjAwOSwgbW9udGg6MTIsIGRhdGU6MzF9XG4gICAgICovXG4gICAgZ2V0UmVsYXRpdmVEYXRlOiBmdW5jdGlvbih5ZWFyLCBtb250aCwgZGF0ZSwgZGF0ZU9iaikge1xuICAgICAgICB2YXIgblllYXIgPSAoZGF0ZU9iai55ZWFyICsgeWVhciksXG4gICAgICAgICAgICBuTW9udGggPSAoZGF0ZU9iai5tb250aCArIG1vbnRoIC0gMSksXG4gICAgICAgICAgICBuRGF0ZSA9IChkYXRlT2JqLmRhdGUgKyBkYXRlKSxcbiAgICAgICAgICAgIG5EYXRlT2JqID0gbmV3IERhdGUoblllYXIsIG5Nb250aCwgbkRhdGUpO1xuXG4gICAgICAgIHJldHVybiB1dGlscy5nZXREYXRlSGFzaChuRGF0ZU9iaik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmFyeSBzZWFyY2hcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBmaWVsZCAtIFNlYXJjaCBmaWVsZFxuICAgICAqIEBwYXJhbSB7QXJyYXl9IHZhbHVlIC0gU2VhcmNoIHRhcmdldFxuICAgICAqIEByZXR1cm5zIHt7Zm91bmQ6IGJvb2xlYW4sIGluZGV4OiBudW1iZXJ9fSBSZXN1bHRcbiAgICAgKi9cbiAgICBzZWFyY2g6IGZ1bmN0aW9uKGZpZWxkLCB2YWx1ZSkge1xuICAgICAgICB2YXIgZm91bmQgPSBmYWxzZSxcbiAgICAgICAgICAgIGxvdyA9IDAsXG4gICAgICAgICAgICBoaWdoID0gZmllbGQubGVuZ3RoIC0gMSxcbiAgICAgICAgICAgIGVuZCwgaW5kZXgsIGZpZWxkVmFsdWU7XG5cbiAgICAgICAgd2hpbGUgKCFmb3VuZCAmJiAhZW5kKSB7XG4gICAgICAgICAgICBpbmRleCA9IE1hdGguZmxvb3IoKGxvdyArIGhpZ2gpIC8gMik7XG4gICAgICAgICAgICBmaWVsZFZhbHVlID0gZmllbGRbaW5kZXhdO1xuXG4gICAgICAgICAgICBpZiAoZmllbGRWYWx1ZSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGZpZWxkVmFsdWUgPCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGxvdyA9IGluZGV4ICsgMTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGlnaCA9IGluZGV4IC0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVuZCA9IChsb3cgPiBoaWdoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmb3VuZDogZm91bmQsXG4gICAgICAgICAgICBpbmRleDogKGZvdW5kIHx8IGZpZWxkVmFsdWUgPiB2YWx1ZSkgPyBpbmRleCA6IGluZGV4ICsgMVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgbWVyaWRpZW0gaG91clxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBob3VyIC0gT3JpZ2luYWwgaG91clxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IENvbnZlcnRlZCBtZXJpZGllbSBob3VyXG4gICAgICovXG4gICAgZ2V0TWVyaWRpZW1Ib3VyOiBmdW5jdGlvbihob3VyKSB7XG4gICAgICAgIGhvdXIgJT0gMTI7XG5cbiAgICAgICAgaWYgKGhvdXIgPT09IDApIHtcbiAgICAgICAgICAgIGhvdXIgPSAxMjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBob3VyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHRoZSB0d28gZGF0ZUhhc2ggb2JqZWN0cyBhcmUgZXF1YWxcbiAgICAgKiBAcGFyYW0ge2RhdGVIYXNofSBhIC0gZGF0ZUhhc2hcbiAgICAgKiBAcGFyYW0ge2RhdGVIYXNofSBiIC0gZGF0ZUhhc2hcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBpc0VxdWFsRGF0ZUhhc2g6IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEueWVhciA9PT0gYi55ZWFyXG4gICAgICAgICAgICAmJiBhLm1vbnRoID09PSBiLm1vbnRoXG4gICAgICAgICAgICAmJiBhLmRhdGUgPT09IGIuZGF0ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBudW1iZXIgb3IgZGVmYXVsdFxuICAgICAqIEBwYXJhbSB7Kn0gYW55IC0gQW55IHZhbHVlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGRlZmF1bHROdW1iZXIgLSBEZWZhdWx0IG51bWJlclxuICAgICAqIEB0aHJvd3MgV2lsbCB0aHJvdyBhbiBlcnJvciBpZiB0aGUgZGVmYXVsdE51bWJlciBpcyBpbnZhbGlkLlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgICovXG4gICAgZ2V0U2FmZU51bWJlcjogZnVuY3Rpb24oYW55LCBkZWZhdWx0TnVtYmVyKSB7XG4gICAgICAgIGlmIChpc05hTihkZWZhdWx0TnVtYmVyKSB8fCAhdHVpLnV0aWwuaXNOdW1iZXIoZGVmYXVsdE51bWJlcikpIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKCdUaGUgZGVmYXVsdE51bWJlciBtdXN0IGJlIGEgdmFsaWQgbnVtYmVyLicpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc05hTihhbnkpKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVmYXVsdE51bWJlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBOdW1iZXIoYW55KTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHV0aWxzO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvdXRpbHMuanNcbi8vIG1vZHVsZSBpZCA9IDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRpbWVQaWNrZXIgQ29tcG9uZW50XG4gKiBAYXV0aG9yIE5ITiBlbnQgRkUgTGFiIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+IDxtaW5reXUueWlAbmhuZW50LmNvbT5cbiAqIEBkZXBlbmRlbmN5IGpxdWVyeS0xLjguMywgY29kZS1zbmlwcGV0LTEuMC4yLCBzcGluYm94LmpzXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3BpbmJveCA9IHJlcXVpcmUoJy4vc3BpbmJveCcpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG52YXIgdXRpbCA9IHR1aS51dGlsO1xudmFyIHRpbWVSZWdFeHAgPSAvXFxzKihcXGR7MSwyfSlcXHMqOlxccyooXFxkezEsMn0pXFxzKihbYXBdW21dKT8oPzpbXFxzXFxTXSopL2k7XG52YXIgdGltZVNlcGVyYXRvciA9IC9cXHMrfDovZztcbnZhciB0aW1lUGlja2VyVGFnID0gJzx0YWJsZSBjbGFzcz1cInRpbWVwaWNrZXJcIj48dHIgY2xhc3M9XCJ0aW1lcGlja2VyLXJvd1wiPjwvdHI+PC90YWJsZT4nO1xudmFyIGNvbHVtblRhZyA9ICc8dGQgY2xhc3M9XCJ0aW1lcGlja2VyLWNvbHVtblwiPjwvdGQ+JztcbnZhciBzcGluQm94VGFnID0gJzx0ZCBjbGFzcz1cInRpbWVwaWNrZXItY29sdW1uIHRpbWVwaWNrZXItc3BpbmJveFwiPicgK1xuICAgICAgICAgICAgICAgICc8ZGl2PjxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwidGltZXBpY2tlci1zcGluYm94LWlucHV0XCI+PC9kaXY+PC90ZD4nO1xudmFyIHVwQnRuVGFnID0gJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwidGltZXBpY2tlci1idG4gdGltZXBpY2tlci1idG4tdXBcIj48Yj4rPC9iPjwvYnV0dG9uPic7XG52YXIgZG93bkJ0blRhZyA9ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cInRpbWVwaWNrZXItYnRuIHRpbWVwaWNrZXItYnRuLWRvd25cIj48Yj4tPC9iPjwvYnV0dG9uPic7XG52YXIgbWVyaWRpZW1UYWcgPSAnPHNlbGVjdD48b3B0aW9uIHZhbHVlPVwiQU1cIj5BTTwvb3B0aW9uPjxvcHRpb24gdmFsdWU9XCJQTVwiPlBNPC9vcHRpb24+PC9zZWxlY3Q+JztcblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uXSAtIG9wdGlvbiBmb3IgaW5pdGlhbGl6YXRpb25cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbi5kZWZhdWx0SG91ciA9IDBdIC0gaW5pdGlhbCBzZXR0aW5nIHZhbHVlIG9mIGhvdXJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLmRlZmF1bHRNaW51dGUgPSAwXSAtIGluaXRpYWwgc2V0dGluZyB2YWx1ZSBvZiBtaW51dGVcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IFtvcHRpb24uaW5wdXRFbGVtZW50ID0gbnVsbF0gLSBvcHRpb25hbCBpbnB1dCBlbGVtZW50IHdpdGggdGltZXBpY2tlclxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24uaG91clN0ZXAgPSAxXSAtIHN0ZXAgb2YgaG91ciBzcGluYm94LiBpZiBzdGVwID0gMiwgaG91ciB2YWx1ZSAxIC0+IDMgLT4gNSAtPiAuLi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLm1pbnV0ZVN0ZXAgPSAxXSAtIHN0ZXAgb2YgbWludXRlIHNwaW5ib3guIGlmIHN0ZXAgPSAyLCBtaW51dGUgdmFsdWUgMSAtPiAzIC0+IDUgLT4gLi4uXG4gKiBAcGFyYW0ge0FycmF5fSBbb3B0aW9uLmhvdXJFeGNsdXNpb24gPSBudWxsXSAtIGhvdXIgdmFsdWUgdG8gYmUgZXhjbHVkZWQuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGhvdXIgWzEsM10gaXMgZXhjbHVkZWQsIGhvdXIgdmFsdWUgMCAtPiAyIC0+IDQgLT4gNSAtPiAuLi5cbiAqIEBwYXJhbSB7QXJyYXl9IFtvcHRpb24ubWludXRlRXhjbHVzaW9uID0gbnVsbF0gLSBtaW51dGUgdmFsdWUgdG8gYmUgZXhjbHVkZWQuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgbWludXRlIFsxLDNdIGlzIGV4Y2x1ZGVkLCBtaW51dGUgdmFsdWUgMCAtPiAyIC0+IDQgLT4gNSAtPiAuLi5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbi5zaG93TWVyaWRpYW4gPSBmYWxzZV0gLSBpcyB0aW1lIGV4cHJlc3Npb24tXCJoaDptbSBBTS9QTVwiP1xuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb24ucG9zaXRpb24gPSB7fV0gLSBsZWZ0LCB0b3AgcG9zaXRpb24gb2YgdGltZXBpY2tlciBlbGVtZW50XG4gKlxuICogQHR1dG9yaWFsIHNhbXBsZTNcbiAqL1xudmFyIFRpbWVQaWNrZXIgPSB1dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgVGltZVBpY2tlci5wcm90b3R5cGUgKi8ge1xuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge2pRdWVyeX1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuJHRpbWVQaWNrZXJFbGVtZW50ID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge2pRdWVyeX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuXyRpbnB1dEVsZW1lbnQgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7alF1ZXJ5fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fJG1lcmlkaWFuRWxlbWVudCA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtTcGluYm94fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5faG91clNwaW5ib3ggPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7U3BpbmJveH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX21pbnV0ZVNwaW5ib3ggPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiB0aW1lIHBpY2tlciBlbGVtZW50IHNob3cgdXA/XG4gICAgICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5faXNTaG93biA9IGZhbHNlO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fb3B0aW9uID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2hvdXIgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fbWludXRlID0gbnVsbDtcblxuICAgICAgICB0aGlzLl9pbml0aWFsaXplKG9wdGlvbik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgd2l0aCBvcHRpb25cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uIGZvciB0aW1lIHBpY2tlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICB0aGlzLl9zZXRPcHRpb24ob3B0aW9uKTtcbiAgICAgICAgdGhpcy5fbWFrZVNwaW5ib3hlcygpO1xuICAgICAgICB0aGlzLl9tYWtlVGltZVBpY2tlckVsZW1lbnQoKTtcbiAgICAgICAgdGhpcy5fYXNzaWduRGVmYXVsdEV2ZW50cygpO1xuICAgICAgICB0aGlzLl9zZXRUaW1lKHRoaXMuX29wdGlvbi5kZWZhdWx0SG91ciwgdGhpcy5fb3B0aW9uLmRlZmF1bHRNaW51dGUsIGZhbHNlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IG9wdGlvblxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb24gZm9yIHRpbWUgcGlja2VyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0T3B0aW9uOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgdGhpcy5fb3B0aW9uID0ge1xuICAgICAgICAgICAgZGVmYXVsdEhvdXI6IDAsXG4gICAgICAgICAgICBkZWZhdWx0TWludXRlOiAwLFxuICAgICAgICAgICAgaW5wdXRFbGVtZW50OiBudWxsLFxuICAgICAgICAgICAgaG91clN0ZXA6IDEsXG4gICAgICAgICAgICBtaW51dGVTdGVwOiAxLFxuICAgICAgICAgICAgaG91ckV4Y2x1c2lvbjogbnVsbCxcbiAgICAgICAgICAgIG1pbnV0ZUV4Y2x1c2lvbjogbnVsbCxcbiAgICAgICAgICAgIHNob3dNZXJpZGlhbjogZmFsc2UsXG4gICAgICAgICAgICBwb3NpdGlvbjoge31cbiAgICAgICAgfTtcblxuICAgICAgICB1dGlsLmV4dGVuZCh0aGlzLl9vcHRpb24sIG9wdGlvbik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG1ha2Ugc3BpbmJveGVzIChob3VyICYgbWludXRlKVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VTcGluYm94ZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3B0ID0gdGhpcy5fb3B0aW9uO1xuICAgICAgICB2YXIgZGVmYXVsdEhvdXIgPSBvcHQuZGVmYXVsdEhvdXI7XG5cbiAgICAgICAgaWYgKG9wdC5zaG93TWVyaWRpYW4pIHtcbiAgICAgICAgICAgIGRlZmF1bHRIb3VyID0gdXRpbHMuZ2V0TWVyaWRpZW1Ib3VyKGRlZmF1bHRIb3VyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2hvdXJTcGluYm94ID0gbmV3IFNwaW5ib3goc3BpbkJveFRhZywge1xuICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiBkZWZhdWx0SG91cixcbiAgICAgICAgICAgIG1pbjogKG9wdC5zaG93TWVyaWRpYW4pID8gMSA6IDAsXG4gICAgICAgICAgICBtYXg6IChvcHQuc2hvd01lcmlkaWFuKSA/IDEyIDogMjMsXG4gICAgICAgICAgICBzdGVwOiBvcHQuaG91clN0ZXAsXG4gICAgICAgICAgICB1cEJ0blRhZzogdXBCdG5UYWcsXG4gICAgICAgICAgICBkb3duQnRuVGFnOiBkb3duQnRuVGFnLFxuICAgICAgICAgICAgZXhjbHVzaW9uOiBvcHQuaG91ckV4Y2x1c2lvblxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9taW51dGVTcGluYm94ID0gbmV3IFNwaW5ib3goc3BpbkJveFRhZywge1xuICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiBvcHQuZGVmYXVsdE1pbnV0ZSxcbiAgICAgICAgICAgIG1pbjogMCxcbiAgICAgICAgICAgIG1heDogNTksXG4gICAgICAgICAgICBzdGVwOiBvcHQubWludXRlU3RlcCxcbiAgICAgICAgICAgIHVwQnRuVGFnOiB1cEJ0blRhZyxcbiAgICAgICAgICAgIGRvd25CdG5UYWc6IGRvd25CdG5UYWcsXG4gICAgICAgICAgICBleGNsdXNpb246IG9wdC5taW51dGVFeGNsdXNpb25cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG1ha2UgdGltZXBpY2tlciBjb250YWluZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlVGltZVBpY2tlckVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3B0ID0gdGhpcy5fb3B0aW9uO1xuICAgICAgICB2YXIgJHRwID0gJCh0aW1lUGlja2VyVGFnKTtcbiAgICAgICAgdmFyICR0cFJvdyA9ICR0cC5maW5kKCcudGltZXBpY2tlci1yb3cnKTtcbiAgICAgICAgdmFyICRjb2xvbiA9ICQoY29sdW1uVGFnKS5hZGRDbGFzcygnY29sb24nKS5hcHBlbmQoJzonKTtcbiAgICAgICAgdmFyICRtZXJpZGlhbjtcblxuICAgICAgICAkdHBSb3cuYXBwZW5kKHRoaXMuX2hvdXJTcGluYm94LmdldENvbnRhaW5lckVsZW1lbnQoKSwgJGNvbG9uLCB0aGlzLl9taW51dGVTcGluYm94LmdldENvbnRhaW5lckVsZW1lbnQoKSk7XG5cbiAgICAgICAgaWYgKG9wdC5zaG93TWVyaWRpYW4pIHtcbiAgICAgICAgICAgICRtZXJpZGlhbiA9ICQoY29sdW1uVGFnKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnbWVyaWRpYW4nKVxuICAgICAgICAgICAgICAgIC5hcHBlbmQobWVyaWRpZW1UYWcpO1xuICAgICAgICAgICAgdGhpcy5fJG1lcmlkaWFuRWxlbWVudCA9ICRtZXJpZGlhbi5maW5kKCdzZWxlY3QnKS5lcSgwKTtcbiAgICAgICAgICAgICR0cFJvdy5hcHBlbmQoJG1lcmlkaWFuKTtcbiAgICAgICAgfVxuXG4gICAgICAgICR0cC5oaWRlKCk7XG4gICAgICAgICQoJ2JvZHknKS5hcHBlbmQoJHRwKTtcbiAgICAgICAgdGhpcy4kdGltZVBpY2tlckVsZW1lbnQgPSAkdHA7XG5cbiAgICAgICAgaWYgKG9wdC5pbnB1dEVsZW1lbnQpIHtcbiAgICAgICAgICAgICR0cC5jc3MoJ3Bvc2l0aW9uJywgJ2Fic29sdXRlJyk7XG4gICAgICAgICAgICB0aGlzLl8kaW5wdXRFbGVtZW50ID0gJChvcHQuaW5wdXRFbGVtZW50KTtcbiAgICAgICAgICAgIHRoaXMuX3NldERlZmF1bHRQb3NpdGlvbih0aGlzLl8kaW5wdXRFbGVtZW50KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgcG9zaXRpb24gb2YgdGltZXBpY2tlciBjb250YWluZXJcbiAgICAgKiBAcGFyYW0ge2pRdWVyeX0gJGlucHV0IGpxdWVyeS1vYmplY3QgKGVsZW1lbnQpXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0RGVmYXVsdFBvc2l0aW9uOiBmdW5jdGlvbigkaW5wdXQpIHtcbiAgICAgICAgdmFyIGlucHV0RWwgPSAkaW5wdXRbMF07XG4gICAgICAgIHZhciBwb3NpdGlvbiA9IHRoaXMuX29wdGlvbi5wb3NpdGlvbjtcbiAgICAgICAgdmFyIHggPSBwb3NpdGlvbi54O1xuICAgICAgICB2YXIgeSA9IHBvc2l0aW9uLnk7XG5cbiAgICAgICAgaWYgKCF1dGlsLmlzTnVtYmVyKHgpIHx8ICF1dGlsLmlzTnVtYmVyKHkpKSB7XG4gICAgICAgICAgICB4ID0gaW5wdXRFbC5vZmZzZXRMZWZ0O1xuICAgICAgICAgICAgeSA9IGlucHV0RWwub2Zmc2V0VG9wICsgaW5wdXRFbC5vZmZzZXRIZWlnaHQgKyAzO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0WFlQb3NpdGlvbih4LCB5KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogYXNzaWduIGRlZmF1bHQgZXZlbnRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXNzaWduRGVmYXVsdEV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkaW5wdXQgPSB0aGlzLl8kaW5wdXRFbGVtZW50O1xuXG4gICAgICAgIGlmICgkaW5wdXQpIHtcbiAgICAgICAgICAgIHRoaXMuX2Fzc2lnbkV2ZW50c1RvSW5wdXRFbGVtZW50KCk7XG4gICAgICAgICAgICB0aGlzLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkaW5wdXQudmFsKHRoaXMuZ2V0VGltZSgpKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5faG91clNwaW5ib3gub24oJ2NoYW5nZScsIHV0aWwuYmluZCh0aGlzLl9vbkNoYW5nZVNwaW5ib3gsIHRoaXMpKTtcbiAgICAgICAgdGhpcy5fbWludXRlU3BpbmJveC5vbignY2hhbmdlJywgdXRpbC5iaW5kKHRoaXMuX29uQ2hhbmdlU3BpbmJveCwgdGhpcykpO1xuXG4gICAgICAgIHRoaXMuJHRpbWVQaWNrZXJFbGVtZW50Lm9uKCdjaGFuZ2UnLCAnc2VsZWN0JywgdXRpbC5iaW5kKHRoaXMuX29uQ2hhbmdlTWVyaWRpZW0sIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogYXR0YWNoIGV2ZW50IHRvIElucHV0IGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hc3NpZ25FdmVudHNUb0lucHV0RWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyICRpbnB1dCA9IHRoaXMuXyRpbnB1dEVsZW1lbnQ7XG5cbiAgICAgICAgJGlucHV0Lm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBzZWxmLm9wZW4oZXZlbnQpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkaW5wdXQub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCFzZWxmLnNldFRpbWVGcm9tSW5wdXRFbGVtZW50KCkpIHtcbiAgICAgICAgICAgICAgICAkaW5wdXQudmFsKHNlbGYuZ2V0VGltZSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEN1c3RvbSBldmVudCBoYW5kbGVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBDaGFuZ2UgdHlwZSBvbiBzcGluYm94ICh0eXBlOiB1cCwgZG93biwgZGVmdWFsdClcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkNoYW5nZVNwaW5ib3g6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgdmFyIGhvdXIgPSB0aGlzLl9ob3VyU3BpbmJveC5nZXRWYWx1ZSgpO1xuICAgICAgICB2YXIgbWludXRlID0gdGhpcy5fbWludXRlU3BpbmJveC5nZXRWYWx1ZSgpO1xuXG4gICAgICAgIGlmICh0aGlzLl9vcHRpb24uc2hvd01lcmlkaWFuKSB7XG4gICAgICAgICAgICBpZiAoKHR5cGUgPT09ICd1cCcgJiYgaG91ciA9PT0gMTIpIHx8XG4gICAgICAgICAgICAgICAgKHR5cGUgPT09ICdkb3duJyAmJiBob3VyID09PSAxMSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pc1BNID0gIXRoaXMuX2lzUE07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBob3VyID0gdGhpcy5fZ2V0T3JpZ2luYWxIb3VyKGhvdXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fc2V0VGltZShob3VyLCBtaW51dGUsIGZhbHNlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRE9NIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCAtIENoYW5nZSBldmVudCBvbiBtZXJpZGllbSBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25DaGFuZ2VNZXJpZGllbTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyIGlzUE0gPSAoZXZlbnQudGFyZ2V0LnZhbHVlID09PSAnUE0nKTtcbiAgICAgICAgdmFyIGN1cnJlbnRIb3VyID0gdGhpcy5faG91cjtcbiAgICAgICAgdmFyIGhvdXIgPSBpc1BNID8gKGN1cnJlbnRIb3VyICsgMTIpIDogKGN1cnJlbnRIb3VyICUgMTIpO1xuXG4gICAgICAgIHRoaXMuX3NldFRpbWUoaG91ciwgdGhpcy5fbWludXRlU3BpbmJveC5nZXRWYWx1ZSgpLCBmYWxzZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGlzIGNsaWNrZWQgaW5zaWRlIG9mIGNvbnRhaW5lcj9cbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCBldmVudC1vYmplY3RcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNDbGlja2VkSW5zaWRlOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgaXNDb250YWlucyA9ICQuY29udGFpbnModGhpcy4kdGltZVBpY2tlckVsZW1lbnRbMF0sIGV2ZW50LnRhcmdldCk7XG4gICAgICAgIHZhciBpc0lucHV0RWxlbWVudCA9ICh0aGlzLl8kaW5wdXRFbGVtZW50ICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fJGlucHV0RWxlbWVudFswXSA9PT0gZXZlbnQudGFyZ2V0KTtcblxuICAgICAgICByZXR1cm4gaXNDb250YWlucyB8fCBpc0lucHV0RWxlbWVudDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogdHJhbnNmb3JtIHRpbWUgaW50byBmb3JtYXR0ZWQgc3RyaW5nXG4gICAgICogQHJldHVybnMge3N0cmluZ30gdGltZSBzdHJpbmdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mb3JtVG9UaW1lRm9ybWF0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGhvdXIgPSB0aGlzLl9ob3VyO1xuICAgICAgICB2YXIgbWludXRlID0gdGhpcy5fbWludXRlO1xuICAgICAgICB2YXIgcG9zdGZpeCA9IHRoaXMuX2dldFBvc3RmaXgoKTtcbiAgICAgICAgdmFyIGZvcm1hdHRlZEhvdXIsIGZvcm1hdHRlZE1pbnV0ZTtcblxuICAgICAgICBpZiAodGhpcy5fb3B0aW9uLnNob3dNZXJpZGlhbikge1xuICAgICAgICAgICAgaG91ciA9IHV0aWxzLmdldE1lcmlkaWVtSG91cihob3VyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvcm1hdHRlZEhvdXIgPSAoaG91ciA8IDEwKSA/ICcwJyArIGhvdXIgOiBob3VyO1xuICAgICAgICBmb3JtYXR0ZWRNaW51dGUgPSAobWludXRlIDwgMTApID8gJzAnICsgbWludXRlIDogbWludXRlO1xuXG4gICAgICAgIHJldHVybiBmb3JtYXR0ZWRIb3VyICsgJzonICsgZm9ybWF0dGVkTWludXRlICsgcG9zdGZpeDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IHRoZSBib29sZWFuIHZhbHVlICdpc1BNJyB3aGVuIEFNL1BNIG9wdGlvbiBpcyB0cnVlLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldElzUE06IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9pc1BNID0gKHRoaXMuX2hvdXIgPiAxMSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGdldCBwb3N0Zml4IHdoZW4gQU0vUE0gb3B0aW9uIGlzIHRydWUuXG4gICAgICogQHJldHVybnMge3N0cmluZ30gcG9zdGZpeCAoQU0vUE0pXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0UG9zdGZpeDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwb3N0Zml4ID0gJyc7XG5cbiAgICAgICAgaWYgKHRoaXMuX29wdGlvbi5zaG93TWVyaWRpYW4pIHtcbiAgICAgICAgICAgIHBvc3RmaXggPSAodGhpcy5faXNQTSkgPyAnIFBNJyA6ICcgQU0nO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBvc3RmaXg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCBwb3NpdGlvbiBvZiBjb250YWluZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geCAtIGl0IHdpbGwgYmUgb2Zmc2V0TGVmdCBvZiBlbGVtZW50XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHkgLSBpdCB3aWxsIGJlIG9mZnNldFRvcCBvZiBlbGVtZW50XG4gICAgICovXG4gICAgc2V0WFlQb3NpdGlvbjogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICBpZiAoIXV0aWwuaXNOdW1iZXIoeCkgfHwgIXV0aWwuaXNOdW1iZXIoeSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHV0aWwuZXh0ZW5kKHRoaXMuX29wdGlvbi5wb3NpdGlvbiwge1xuICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgIHk6IHlcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuJHRpbWVQaWNrZXJFbGVtZW50LmNzcyh7XG4gICAgICAgICAgICBsZWZ0OiB4LFxuICAgICAgICAgICAgdG9wOiB5XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzaG93IHRpbWUgcGlja2VyIGVsZW1lbnRcbiAgICAgKi9cbiAgICBzaG93OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy4kdGltZVBpY2tlckVsZW1lbnQuc2hvdygpO1xuICAgICAgICB0aGlzLl9pc1Nob3duID0gdHJ1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogaGlkZSB0aW1lIHBpY2tlciBlbGVtZW50XG4gICAgICovXG4gICAgaGlkZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuJHRpbWVQaWNrZXJFbGVtZW50LmhpZGUoKTtcbiAgICAgICAgdGhpcy5faXNTaG93biA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBsaXN0ZW5lciB0byBzaG93IGNvbnRhaW5lclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IGV2ZW50LW9iamVjdFxuICAgICAqL1xuICAgIG9wZW46IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLl9pc1Nob3duKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCB1dGlsLmJpbmQodGhpcy5jbG9zZSwgdGhpcykpO1xuICAgICAgICB0aGlzLnNob3coKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogT3BlbiBldmVudCAtIFRpbWVQaWNrZXJcbiAgICAgICAgICogQGV2ZW50IFRpbWVQaWNrZXIjb3BlblxuICAgICAgICAgKiBAcGFyYW0geyhqUXVlcnkuRXZlbnR8dW5kZWZpbmVkKX0gLSBDbGljayB0aGUgaW5wdXQgZWxlbWVudFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5maXJlKCdvcGVuJywgZXZlbnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBsaXN0ZW5lciB0byBoaWRlIGNvbnRhaW5lclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IGV2ZW50LW9iamVjdFxuICAgICAqL1xuICAgIGNsb3NlOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBpZiAoIXRoaXMuX2lzU2hvd24gfHwgdGhpcy5faXNDbGlja2VkSW5zaWRlKGV2ZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgJChkb2N1bWVudCkub2ZmKGV2ZW50KTtcbiAgICAgICAgdGhpcy5oaWRlKCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEhpZGUgZXZlbnQgLSBUaW1lcGlja2VyXG4gICAgICAgICAqIEBldmVudCBUaW1lUGlja2VyI2Nsb3NlXG4gICAgICAgICAqIEBwYXJhbSB7KGpRdWVyeS5FdmVudHx1bmRlZmluZWQpfSAtIENsaWNrIHRoZSBkb2N1bWVudCAobm90IFRpbWVQaWNrZXIpXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmZpcmUoJ2Nsb3NlJywgZXZlbnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgdmFsdWVzIGluIHNwaW5ib3hlcyBmcm9tIHRpbWVcbiAgICAgKi9cbiAgICB0b1NwaW5ib3hlczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBob3VyID0gdGhpcy5faG91cjtcbiAgICAgICAgdmFyIG1pbnV0ZSA9IHRoaXMuX21pbnV0ZTtcblxuICAgICAgICBpZiAodGhpcy5fb3B0aW9uLnNob3dNZXJpZGlhbikge1xuICAgICAgICAgICAgaG91ciA9IHV0aWxzLmdldE1lcmlkaWVtSG91cihob3VyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2hvdXJTcGluYm94LnNldFZhbHVlKGhvdXIpO1xuICAgICAgICB0aGlzLl9taW51dGVTcGluYm94LnNldFZhbHVlKG1pbnV0ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBvcmlnaW5hbCBob3VyIGZyb20gbWVyaWRpZW0gaG91clxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtob3VyfSBob3VyIC0gTWVyaWRpZW0gaG91clxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IE9yaWdpbmFsIGhvdXJcbiAgICAgKi9cbiAgICBfZ2V0T3JpZ2luYWxIb3VyOiBmdW5jdGlvbihob3VyKSB7XG4gICAgICAgIHZhciBpc1BNID0gdGhpcy5faXNQTTtcblxuICAgICAgICBpZiAoaXNQTSkge1xuICAgICAgICAgICAgaG91ciA9IChob3VyIDwgMTIpID8gKGhvdXIgKyAxMikgOiAxMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhvdXIgPSAoaG91ciA8IDEyKSA/IChob3VyICUgMTIpIDogMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBob3VyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgdGltZSBmcm9tIGlucHV0IGVsZW1lbnQuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudHxqUXVlcnl9IFtpbnB1dEVsZW1lbnRdIGpxdWVyeSBvYmplY3QgKGVsZW1lbnQpXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdCBvZiBzZXQgdGltZVxuICAgICAqL1xuICAgIHNldFRpbWVGcm9tSW5wdXRFbGVtZW50OiBmdW5jdGlvbihpbnB1dEVsZW1lbnQpIHtcbiAgICAgICAgdmFyIGlucHV0ID0gJChpbnB1dEVsZW1lbnQpWzBdIHx8IHRoaXMuXyRpbnB1dEVsZW1lbnRbMF07XG5cbiAgICAgICAgcmV0dXJuICEhKGlucHV0ICYmIHRoaXMuc2V0VGltZUZyb21TdHJpbmcoaW5wdXQudmFsdWUpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IGhvdXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaG91ciBmb3IgdGltZSBwaWNrZXJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0IG9mIHNldCB0aW1lXG4gICAgICovXG4gICAgc2V0SG91cjogZnVuY3Rpb24oaG91cikge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0VGltZShob3VyLCB0aGlzLl9taW51dGUsIHRydWUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgbWludXRlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbnV0ZSBmb3IgdGltZSBwaWNrZXJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0IG9mIHNldCB0aW1lXG4gICAgICovXG4gICAgc2V0TWludXRlOiBmdW5jdGlvbihtaW51dGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldFRpbWUodGhpcy5faG91ciwgbWludXRlLCB0cnVlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IHRpbWUgZm9yIGV4dGVuYWwgY2FsbFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBob3VyIGZvciB0aW1lIHBpY2tlclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW51dGUgZm9yIHRpbWUgcGlja2VyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdCBvZiBzZXQgdGltZVxuICAgICAqL1xuICAgIHNldFRpbWU6IGZ1bmN0aW9uKGhvdXIsIG1pbnV0ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0VGltZShob3VyLCBtaW51dGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgdGltZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBob3VyIGZvciB0aW1lIHBpY2tlclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW51dGUgZm9yIHRpbWUgcGlja2VyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc1NldFNwaW5ib3ggd2hldGhlciBzcGluYm94IHNldCBvciBub3RcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0IG9mIHNldCB0aW1lXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0VGltZTogZnVuY3Rpb24oaG91ciwgbWludXRlLCBpc1NldFNwaW5ib3gpIHtcbiAgICAgICAgdmFyIGlzTnVtYmVyID0gKHV0aWwuaXNOdW1iZXIoaG91cikgJiYgdXRpbC5pc051bWJlcihtaW51dGUpKTtcbiAgICAgICAgdmFyIGlzVmFsaWQgPSAoaG91ciA8IDI0ICYmIG1pbnV0ZSA8IDYwKTtcbiAgICAgICAgdmFyIHBvc3RmaXg7XG5cbiAgICAgICAgaWYgKCFpc051bWJlciB8fCAhaXNWYWxpZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5faG91ciA9IGhvdXI7XG4gICAgICAgIHRoaXMuX21pbnV0ZSA9IG1pbnV0ZTtcblxuICAgICAgICB0aGlzLl9zZXRJc1BNKCk7XG5cbiAgICAgICAgaWYgKGlzU2V0U3BpbmJveCkge1xuICAgICAgICAgICAgdGhpcy50b1NwaW5ib3hlcygpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuXyRtZXJpZGlhbkVsZW1lbnQpIHtcbiAgICAgICAgICAgIHBvc3RmaXggPSB0aGlzLl9nZXRQb3N0Zml4KCkucmVwbGFjZSgvXFxzKy8sICcnKTtcbiAgICAgICAgICAgIHRoaXMuXyRtZXJpZGlhbkVsZW1lbnQudmFsKHBvc3RmaXgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENoYW5nZSBldmVudCAtIFRpbWVQaWNrZXJcbiAgICAgICAgICogQGV2ZW50IFRpbWVQaWNrZXIjY2hhbmdlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmZpcmUoJ2NoYW5nZScsIGlzU2V0U3BpbmJveCk7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCB0aW1lIGZyb20gdGltZS1zdHJpbmdcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGltZVN0cmluZyB0aW1lLXN0cmluZ1xuICAgICAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHQgb2Ygc2V0IHRpbWVcbiAgICAgKiBAdG9kbyBSZWZhY3RvcjogZnVuY3Rpb24gY29tcGxleGl0eVxuICAgICAqL1xuICAgIHNldFRpbWVGcm9tU3RyaW5nOiBmdW5jdGlvbih0aW1lU3RyaW5nKSB7XG4gICAgICAgIHZhciB0aW1lLCBob3VyLCBtaW51dGUsIHBvc3RmaXgsIGlzUE07XG5cbiAgICAgICAgaWYgKHRpbWVSZWdFeHAudGVzdCh0aW1lU3RyaW5nKSkge1xuICAgICAgICAgICAgdGltZSA9IHRpbWVTdHJpbmcuc3BsaXQodGltZVNlcGVyYXRvcik7XG4gICAgICAgICAgICBob3VyID0gTnVtYmVyKHRpbWVbMF0pO1xuICAgICAgICAgICAgbWludXRlID0gTnVtYmVyKHRpbWVbMV0pO1xuXG4gICAgICAgICAgICBpZiAoaG91ciA8IDI0ICYmIHRoaXMuX29wdGlvbi5zaG93TWVyaWRpYW4pIHtcbiAgICAgICAgICAgICAgICBwb3N0Zml4ID0gdGltZVsyXS50b1VwcGVyQ2FzZSgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBvc3RmaXggPT09ICdQTScpIHtcbiAgICAgICAgICAgICAgICAgICAgaXNQTSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwb3N0Zml4ID09PSAnQU0nKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzUE0gPSAoaG91ciA+IDEyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpc1BNID0gdGhpcy5faXNQTTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoaXNQTSAmJiBob3VyIDwgMTIpIHtcbiAgICAgICAgICAgICAgICAgICAgaG91ciArPSAxMjtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFpc1BNICYmIGhvdXIgPT09IDEyKSB7XG4gICAgICAgICAgICAgICAgICAgIGhvdXIgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXRUaW1lKGhvdXIsIG1pbnV0ZSwgdHJ1ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCBzdGVwIG9mIGhvdXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RlcCBmb3IgdGltZSBwaWNrZXJcbiAgICAgKi9cbiAgICBzZXRIb3VyU3RlcDogZnVuY3Rpb24oc3RlcCkge1xuICAgICAgICB0aGlzLl9ob3VyU3BpbmJveC5zZXRTdGVwKHN0ZXApO1xuICAgICAgICB0aGlzLl9vcHRpb24uaG91clN0ZXAgPSB0aGlzLl9ob3VyU3BpbmJveC5nZXRTdGVwKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCBzdGVwIG9mIG1pbnV0ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIGZvciB0aW1lIHBpY2tlclxuICAgICAqL1xuICAgIHNldE1pbnV0ZVN0ZXA6IGZ1bmN0aW9uKHN0ZXApIHtcbiAgICAgICAgdGhpcy5fbWludXRlU3BpbmJveC5zZXRTdGVwKHN0ZXApO1xuICAgICAgICB0aGlzLl9vcHRpb24ubWludXRlU3RlcCA9IHRoaXMuX21pbnV0ZVNwaW5ib3guZ2V0U3RlcCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBhZGQgYSBzcGVjaWZpYyBob3VyIHRvIGV4Y2x1ZGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaG91ciBmb3IgZXhjbHVzaW9uXG4gICAgICovXG4gICAgYWRkSG91ckV4Y2x1c2lvbjogZnVuY3Rpb24oaG91cikge1xuICAgICAgICB0aGlzLl9ob3VyU3BpbmJveC5hZGRFeGNsdXNpb24oaG91cik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGFkZCBhIHNwZWNpZmljIG1pbnV0ZSB0byBleGNsdWRlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbnV0ZSBmb3IgZXhjbHVzaW9uXG4gICAgICovXG4gICAgYWRkTWludXRlRXhjbHVzaW9uOiBmdW5jdGlvbihtaW51dGUpIHtcbiAgICAgICAgdGhpcy5fbWludXRlU3BpbmJveC5hZGRFeGNsdXNpb24obWludXRlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogZ2V0IHN0ZXAgb2YgaG91clxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGhvdXIgdXAvZG93biBzdGVwXG4gICAgICovXG4gICAgZ2V0SG91clN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9uLmhvdXJTdGVwO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBnZXQgc3RlcCBvZiBtaW51dGVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBtaW51dGUgdXAvZG93biBzdGVwXG4gICAgICovXG4gICAgZ2V0TWludXRlU3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vcHRpb24ubWludXRlU3RlcDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogcmVtb3ZlIGhvdXIgZnJvbSBleGNsdXNpb24gbGlzdFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBob3VyIHRoYXQgeW91IHdhbnQgdG8gcmVtb3ZlXG4gICAgICovXG4gICAgcmVtb3ZlSG91ckV4Y2x1c2lvbjogZnVuY3Rpb24oaG91cikge1xuICAgICAgICB0aGlzLl9ob3VyU3BpbmJveC5yZW1vdmVFeGNsdXNpb24oaG91cik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJlbW92ZSBtaW51dGUgZnJvbSBleGNsdXNpb24gbGlzdFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW51dGUgdGhhdCB5b3Ugd2FudCB0byByZW1vdmVcbiAgICAgKi9cbiAgICByZW1vdmVNaW51dGVFeGNsdXNpb246IGZ1bmN0aW9uKG1pbnV0ZSkge1xuICAgICAgICB0aGlzLl9taW51dGVTcGluYm94LnJlbW92ZUV4Y2x1c2lvbihtaW51dGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBnZXQgaG91clxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGhvdXJcbiAgICAgKi9cbiAgICBnZXRIb3VyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hvdXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGdldCBtaW51dGVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBtaW51dGVcbiAgICAgKi9cbiAgICBnZXRNaW51dGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbWludXRlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBnZXQgdGltZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9ICdoaDptbSAoQU0vUE0pJ1xuICAgICAqL1xuICAgIGdldFRpbWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZm9ybVRvVGltZUZvcm1hdCgpO1xuICAgIH1cbn0pO1xudHVpLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKFRpbWVQaWNrZXIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWVQaWNrZXI7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy90aW1lcGlja2VyLmpzXG4vLyBtb2R1bGUgaWQgPSAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogQ3JlYXRlZCBieSBuaG5lbnQgb24gMTUuIDQuIDI4Li5cbiAqIEBmaWxlb3ZlcnZpZXcgU3BpbmJveCBDb21wb25lbnRcbiAqIEBhdXRob3IgTkhOIGVudCBGRSBkZXYgTGFiIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKiBAZGVwZW5kZW5jeSBqcXVlcnktMS44LjMsIGNvZGUtc25pcHBldC0xLjAuMlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWwgPSB0dWkudXRpbDtcbnZhciBpbkFycmF5ID0gdXRpbC5pbkFycmF5O1xuXG4vKipcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtTdHJpbmd8SFRNTEVsZW1lbnR9IGNvbnRhaW5lciAtIGNvbnRhaW5lciBvZiBzcGluYm94XG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbl0gLSBvcHRpb24gZm9yIGluaXRpYWxpemF0aW9uXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24uZGVmYXVsdFZhbHVlID0gMF0gLSBpbml0aWFsIHNldHRpbmcgdmFsdWVcbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLnN0ZXAgPSAxXSAtIGlmIHN0ZXAgPSAyLCB2YWx1ZSA6IDAgLT4gMiAtPiA0IC0+IC4uLlxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24ubWF4ID0gOTAwNzE5OTI1NDc0MDk5MV0gLSBtYXggdmFsdWVcbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLm1pbiA9IC05MDA3MTk5MjU0NzQwOTkxXSAtIG1pbiB2YWx1ZVxuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb24udXBCdG5UYWcgPSBidXR0b24gSFRNTF0gLSB1cCBidXR0b24gaHRtbCBzdHJpbmdcbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9uLmRvd25CdG5UYWcgPSBidXR0b24gSFRNTF0gLSBkb3duIGJ1dHRvbiBodG1sIHN0cmluZ1xuICogQHBhcmFtIHtBcnJheX0gIFtvcHRpb24uZXhjbHVzaW9uID0gW11dIC0gdmFsdWUgdG8gYmUgZXhjbHVkZWQuIGlmIHRoaXMgaXMgWzEsM10sIDAgLT4gMiAtPiA0IC0+IDUgLT4uLi4uXG4gKlxuICogQHR1dG9yaWFsIHNhbXBsZTRcbiAqL1xudmFyIFNwaW5ib3ggPSB1dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgU3BpbmJveC5wcm90b3R5cGUgKi8ge1xuICAgIGluaXQ6IGZ1bmN0aW9uKGNvbnRhaW5lciwgb3B0aW9uKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7alF1ZXJ5fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fJGNvbnRhaW5lckVsZW1lbnQgPSAkKGNvbnRhaW5lcik7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtqUXVlcnl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl8kaW5wdXRFbGVtZW50ID0gdGhpcy5fJGNvbnRhaW5lckVsZW1lbnQuZmluZCgnaW5wdXRbdHlwZT1cInRleHRcIl0nKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3ZhbHVlID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge09iamVjdH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX29wdGlvbiA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtqUXVlcnl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl8kdXBCdXR0b24gPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7alF1ZXJ5fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fJGRvd25CdXR0b24gPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fY2hhbmdlVHlwZSA9ICdkZWZhdWx0JztcblxuICAgICAgICB0aGlzLl9pbml0aWFsaXplKG9wdGlvbik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgd2l0aCBvcHRpb25cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uIC0gT3B0aW9uIGZvciBJbml0aWFsaXphdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICB0aGlzLl9zZXRPcHRpb24ob3B0aW9uKTtcbiAgICAgICAgdGhpcy5fYXNzaWduSFRNTEVsZW1lbnRzKCk7XG4gICAgICAgIHRoaXMuX2Fzc2lnbkRlZmF1bHRFdmVudHMoKTtcbiAgICAgICAgdGhpcy5zZXRWYWx1ZSh0aGlzLl9vcHRpb24uZGVmYXVsdFZhbHVlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGEgb3B0aW9uIHRvIGluc3RhbmNlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbiAtIE9wdGlvbiB0aGF0IHlvdSB3YW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0T3B0aW9uOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgdGhpcy5fb3B0aW9uID0ge1xuICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiAwLFxuICAgICAgICAgICAgc3RlcDogMSxcbiAgICAgICAgICAgIG1heDogTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIgfHwgOTAwNzE5OTI1NDc0MDk5MSxcbiAgICAgICAgICAgIG1pbjogTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVIgfHwgLTkwMDcxOTkyNTQ3NDA5OTEsXG4gICAgICAgICAgICB1cEJ0blRhZzogJzxidXR0b24gdHlwZT1cImJ1dHRvblwiPjxiPis8L2I+PC9idXR0b24+JyxcbiAgICAgICAgICAgIGRvd25CdG5UYWc6ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIj48Yj4tPC9iPjwvYnV0dG9uPidcbiAgICAgICAgfTtcbiAgICAgICAgdXRpbC5leHRlbmQodGhpcy5fb3B0aW9uLCBvcHRpb24pO1xuXG4gICAgICAgIGlmICghdXRpbC5pc0FycmF5KHRoaXMuX29wdGlvbi5leGNsdXNpb24pKSB7XG4gICAgICAgICAgICB0aGlzLl9vcHRpb24uZXhjbHVzaW9uID0gW107XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuX2lzVmFsaWRPcHRpb24oKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTcGluYm94IG9wdGlvbiBpcyBpbnZhaWxkJyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogaXMgYSB2YWxpZCBvcHRpb24/XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzVmFsaWRPcHRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3B0ID0gdGhpcy5fb3B0aW9uO1xuXG4gICAgICAgIHJldHVybiAodGhpcy5faXNWYWxpZFZhbHVlKG9wdC5kZWZhdWx0VmFsdWUpICYmIHRoaXMuX2lzVmFsaWRTdGVwKG9wdC5zdGVwKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGlzIGEgdmFsaWQgdmFsdWU/XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIGZvciBzcGluYm94XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzVmFsaWRWYWx1ZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgdmFyIG9wdCxcbiAgICAgICAgICAgIGlzQmV0d2VlbixcbiAgICAgICAgICAgIGlzTm90SW5BcnJheTtcblxuICAgICAgICBpZiAoIXV0aWwuaXNOdW1iZXIodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBvcHQgPSB0aGlzLl9vcHRpb247XG4gICAgICAgIGlzQmV0d2VlbiA9IHZhbHVlIDw9IG9wdC5tYXggJiYgdmFsdWUgPj0gb3B0Lm1pbjtcbiAgICAgICAgaXNOb3RJbkFycmF5ID0gKGluQXJyYXkodmFsdWUsIG9wdC5leGNsdXNpb24pID09PSAtMSk7XG5cbiAgICAgICAgcmV0dXJuIChpc0JldHdlZW4gJiYgaXNOb3RJbkFycmF5KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogaXMgYSB2YWxpZCBzdGVwP1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIGZvciBzcGluYm94IHVwL2Rvd25cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gcmVzdWx0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNWYWxpZFN0ZXA6IGZ1bmN0aW9uKHN0ZXApIHtcbiAgICAgICAgdmFyIG1heFN0ZXAgPSAodGhpcy5fb3B0aW9uLm1heCAtIHRoaXMuX29wdGlvbi5taW4pO1xuXG4gICAgICAgIHJldHVybiAodXRpbC5pc051bWJlcihzdGVwKSAmJiBzdGVwIDwgbWF4U3RlcCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFzc2lnbiBlbGVtZW50cyB0byBpbnNpZGUgb2YgY29udGFpbmVyLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Fzc2lnbkhUTUxFbGVtZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX3NldElucHV0U2l6ZUFuZE1heExlbmd0aCgpO1xuICAgICAgICB0aGlzLl9tYWtlQnV0dG9uKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1ha2UgdXAvZG93biBidXR0b25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyICRpbnB1dCA9IHRoaXMuXyRpbnB1dEVsZW1lbnQsXG4gICAgICAgICAgICAkdXBCdG4gPSB0aGlzLl8kdXBCdXR0b24gPSAkKHRoaXMuX29wdGlvbi51cEJ0blRhZyksXG4gICAgICAgICAgICAkZG93bkJ0biA9IHRoaXMuXyRkb3duQnV0dG9uID0gJCh0aGlzLl9vcHRpb24uZG93bkJ0blRhZyk7XG5cbiAgICAgICAgJHVwQnRuLmluc2VydEJlZm9yZSgkaW5wdXQpO1xuICAgICAgICAkdXBCdG4ud3JhcCgnPGRpdj48L2Rpdj4nKTtcbiAgICAgICAgJGRvd25CdG4uaW5zZXJ0QWZ0ZXIoJGlucHV0KTtcbiAgICAgICAgJGRvd25CdG4ud3JhcCgnPGRpdj48L2Rpdj4nKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHNpemUvbWF4bGVuZ3RoIGF0dHJpYnV0ZXMgb2YgaW5wdXQgZWxlbWVudC5cbiAgICAgKiBEZWZhdWx0IHZhbHVlIGlzIGEgZGlnaXRzIG9mIGEgbG9uZ2VyIHZhbHVlIG9mIG9wdGlvbi5taW4gb3Igb3B0aW9uLm1heFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldElucHV0U2l6ZUFuZE1heExlbmd0aDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkaW5wdXQgPSB0aGlzLl8kaW5wdXRFbGVtZW50LFxuICAgICAgICAgICAgbWluVmFsdWVMZW5ndGggPSBTdHJpbmcodGhpcy5fb3B0aW9uLm1pbikubGVuZ3RoLFxuICAgICAgICAgICAgbWF4VmFsdWVMZW5ndGggPSBTdHJpbmcodGhpcy5fb3B0aW9uLm1heCkubGVuZ3RoLFxuICAgICAgICAgICAgbWF4bGVuZ3RoID0gTWF0aC5tYXgobWluVmFsdWVMZW5ndGgsIG1heFZhbHVlTGVuZ3RoKTtcblxuICAgICAgICBpZiAoISRpbnB1dC5hdHRyKCdzaXplJykpIHtcbiAgICAgICAgICAgICRpbnB1dC5hdHRyKCdzaXplJywgbWF4bGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoISRpbnB1dC5hdHRyKCdtYXhsZW5ndGgnKSkge1xuICAgICAgICAgICAgJGlucHV0LmF0dHIoJ21heGxlbmd0aCcsIG1heGxlbmd0aCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXNzaWduIGRlZmF1bHQgZXZlbnRzIHRvIHVwL2Rvd24gYnV0dG9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXNzaWduRGVmYXVsdEV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvbkNsaWNrID0gdXRpbC5iaW5kKHRoaXMuX29uQ2xpY2tCdXR0b24sIHRoaXMpLFxuICAgICAgICAgICAgb25LZXlEb3duID0gdXRpbC5iaW5kKHRoaXMuX29uS2V5RG93bklucHV0RWxlbWVudCwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5fJHVwQnV0dG9uLm9uKCdjbGljaycsIHtpc0Rvd246IGZhbHNlfSwgb25DbGljayk7XG4gICAgICAgIHRoaXMuXyRkb3duQnV0dG9uLm9uKCdjbGljaycsIHtpc0Rvd246IHRydWV9LCBvbkNsaWNrKTtcbiAgICAgICAgdGhpcy5fJGlucHV0RWxlbWVudC5vbigna2V5ZG93bicsIG9uS2V5RG93bik7XG4gICAgICAgIHRoaXMuXyRpbnB1dEVsZW1lbnQub24oJ2NoYW5nZScsIHV0aWwuYmluZCh0aGlzLl9vbkNoYW5nZUlucHV0LCB0aGlzKSk7XG4gICAgICAgIHRoaXMuXyRpbnB1dEVsZW1lbnQub24oJ2ZvY3VzJywgdXRpbC5iaW5kKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5fY2hhbmdlVHlwZSA9ICdkZWZhdWx0JztcbiAgICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgaW5wdXQgdmFsdWUgd2hlbiB1c2VyIGNsaWNrIGEgYnV0dG9uLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNEb3duIC0gSWYgYSB1c2VyIGNsaWNrZWQgYSBkb3duLWJ1dHR0b24sIHRoaXMgdmFsdWUgaXMgdHJ1ZS5cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIEVsc2UgaWYgYSB1c2VyIGNsaWNrZWQgYSB1cC1idXR0b24sIHRoaXMgdmFsdWUgaXMgZmFsc2UuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0TmV4dFZhbHVlOiBmdW5jdGlvbihpc0Rvd24pIHtcbiAgICAgICAgdmFyIG9wdCA9IHRoaXMuX29wdGlvbixcbiAgICAgICAgICAgIHN0ZXAgPSBvcHQuc3RlcCxcbiAgICAgICAgICAgIG1pbiA9IG9wdC5taW4sXG4gICAgICAgICAgICBtYXggPSBvcHQubWF4LFxuICAgICAgICAgICAgZXhjbHVzaW9uID0gb3B0LmV4Y2x1c2lvbixcbiAgICAgICAgICAgIG5leHRWYWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblxuICAgICAgICBpZiAoaXNEb3duKSB7XG4gICAgICAgICAgICBzdGVwID0gLXN0ZXA7XG4gICAgICAgIH1cblxuICAgICAgICBkbyB7XG4gICAgICAgICAgICBuZXh0VmFsdWUgKz0gc3RlcDtcbiAgICAgICAgICAgIGlmIChuZXh0VmFsdWUgPiBtYXgpIHtcbiAgICAgICAgICAgICAgICBuZXh0VmFsdWUgPSBtaW47XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5leHRWYWx1ZSA8IG1pbikge1xuICAgICAgICAgICAgICAgIG5leHRWYWx1ZSA9IG1heDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSB3aGlsZSAoaW5BcnJheShuZXh0VmFsdWUsIGV4Y2x1c2lvbikgPiAtMSk7XG5cbiAgICAgICAgdGhpcy5fY2hhbmdlVHlwZSA9IGlzRG93biA/ICdkb3duJyA6ICd1cCc7XG5cbiAgICAgICAgdGhpcy5zZXRWYWx1ZShuZXh0VmFsdWUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBET00oVXAvRG93biBidXR0b24pIENsaWNrIEV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCBldmVudC1vYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkNsaWNrQnV0dG9uOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB0aGlzLl9zZXROZXh0VmFsdWUoZXZlbnQuZGF0YS5pc0Rvd24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBET00oSW5wdXQgZWxlbWVudCkgS2V5ZG93biBFdmVudCBoYW5kbGVyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgZXZlbnQtb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25LZXlEb3duSW5wdXRFbGVtZW50OiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIga2V5Q29kZSA9IGV2ZW50LndoaWNoIHx8IGV2ZW50LmtleUNvZGU7XG4gICAgICAgIHZhciBpc0Rvd247XG5cbiAgICAgICAgc3dpdGNoIChrZXlDb2RlKSB7XG4gICAgICAgICAgICBjYXNlIDM4OlxuICAgICAgICAgICAgICAgIGlzRG93biA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA0MDpcbiAgICAgICAgICAgICAgICBpc0Rvd24gPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDogcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fc2V0TmV4dFZhbHVlKGlzRG93bik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIERPTShJbnB1dCBlbGVtZW50KSBDaGFuZ2UgRXZlbnQgaGFuZGxlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uQ2hhbmdlSW5wdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbmV3VmFsdWUgPSBOdW1iZXIodGhpcy5fJGlucHV0RWxlbWVudC52YWwoKSksXG4gICAgICAgICAgICBpc0NoYW5nZSA9IHRoaXMuX2lzVmFsaWRWYWx1ZShuZXdWYWx1ZSkgJiYgdGhpcy5fdmFsdWUgIT09IG5ld1ZhbHVlLFxuICAgICAgICAgICAgbmV4dFZhbHVlID0gKGlzQ2hhbmdlKSA/IG5ld1ZhbHVlIDogdGhpcy5fdmFsdWU7XG5cbiAgICAgICAgdGhpcy5fdmFsdWUgPSBuZXh0VmFsdWU7XG4gICAgICAgIHRoaXMuXyRpbnB1dEVsZW1lbnQudmFsKG5leHRWYWx1ZSk7XG5cbiAgICAgICAgdGhpcy5maXJlKCdjaGFuZ2UnLCB0aGlzLl9jaGFuZ2VUeXBlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IHN0ZXAgb2Ygc3BpbmJveFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIGZvciBzcGluYm94XG4gICAgICovXG4gICAgc2V0U3RlcDogZnVuY3Rpb24oc3RlcCkge1xuICAgICAgICBpZiAoIXRoaXMuX2lzVmFsaWRTdGVwKHN0ZXApKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fb3B0aW9uLnN0ZXAgPSBzdGVwO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBnZXQgc3RlcCBvZiBzcGluYm94XG4gICAgICogQHJldHVybnMge251bWJlcn0gc3RlcFxuICAgICAqL1xuICAgIGdldFN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9uLnN0ZXA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBhIGlucHV0IHZhbHVlLlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IERhdGEgaW4gaW5wdXQtYm94XG4gICAgICovXG4gICAgZ2V0VmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBhIHZhbHVlIHRvIGlucHV0LWJveC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBWYWx1ZSB0aGF0IHlvdSB3YW50XG4gICAgICovXG4gICAgc2V0VmFsdWU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuXyRpbnB1dEVsZW1lbnQudmFsKHZhbHVlKS5jaGFuZ2UoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGEgb3B0aW9uIG9mIGluc3RhbmNlLlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IE9wdGlvbiBvZiBpbnN0YW5jZVxuICAgICAqL1xuICAgIGdldE9wdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vcHRpb247XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCB2YWx1ZSB0aGF0IHdpbGwgYmUgZXhjbHVkZWQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gVmFsdWUgdGhhdCB3aWxsIGJlIGV4Y2x1ZGVkLlxuICAgICAqL1xuICAgIGFkZEV4Y2x1c2lvbjogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgdmFyIGV4Y2x1c2lvbiA9IHRoaXMuX29wdGlvbi5leGNsdXNpb247XG5cbiAgICAgICAgaWYgKGluQXJyYXkodmFsdWUsIGV4Y2x1c2lvbikgPiAtMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGV4Y2x1c2lvbi5wdXNoKHZhbHVlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGEgdmFsdWUgd2hpY2ggd2FzIGV4Y2x1ZGVkLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIFZhbHVlIHRoYXQgd2lsbCBiZSByZW1vdmVkIGZyb20gYSBleGNsdXNpb24gbGlzdCBvZiBpbnN0YW5jZVxuICAgICAqL1xuICAgIHJlbW92ZUV4Y2x1c2lvbjogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgdmFyIGV4Y2x1c2lvbiA9IHRoaXMuX29wdGlvbi5leGNsdXNpb24sXG4gICAgICAgICAgICBpbmRleCA9IGluQXJyYXkodmFsdWUsIGV4Y2x1c2lvbik7XG5cbiAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGV4Y2x1c2lvbi5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBnZXQgY29udGFpbmVyIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKi9cbiAgICBnZXRDb250YWluZXJFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuXyRjb250YWluZXJFbGVtZW50WzBdO1xuICAgIH1cbn0pO1xuXG50dWkudXRpbC5DdXN0b21FdmVudHMubWl4aW4oU3BpbmJveCk7XG5cbm1vZHVsZS5leHBvcnRzID0gU3BpbmJveDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3NwaW5ib3guanNcbi8vIG1vZHVsZSBpZCA9IDRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==