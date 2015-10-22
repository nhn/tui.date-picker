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

var util = tui.util,
    inArray = util.inArray,
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
        minYear: 1970,
        maxYear: 2999,
        monthDays: [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        wrapperTag: '<div style="position:absolute;"></div>',
        defaultCentury: '20',
        selectableClassName: 'selectable',
        selectedClassName: 'selected'
    };

/**
 * Create DatePicker<br>
 * You can get a date from 'getYear', 'getMonth', 'getDayInMonth', 'getDateObject'
 * @constructor
 * @param {Object} option - options for DatePicker
 *      @param {HTMLElement|string} option.element - input element(or selector) of DatePicker
 *      @param {Object} [option.date = today] - initial date object
 *          @param {number} [option.date.year] - year
 *          @param {number} [option.date.month] - month
 *          @param {number} [option.date.date] - day in month
 *      @param {string} [option.dateForm = 'yyyy-mm-dd'] - format of date string
 *      @param {string} [option.defaultCentury = 20] - if year-format is yy, this value is prepended automatically.
 *      @param {string} [option.selectableClassName = 'selectable'] - for selectable date elements
 *      @param {string} [option.selectedClassName = 'selected'] - for selected date element
 *      @param {Object} [option.startDate] - start date in calendar
 *          @param {number} [option.startDate.year] - year
 *          @param {number} [option.startDate.month] - month
 *          @param {number} [option.startDate.date] - day in month
 *      @param {Object} [option.endDate] - last date in calendar
 *          @param {number} [option.endDate.year] - year
 *          @param {number} [option.endDate.month] - month
 *          @param {number} [option.endDate.date] - day in month
 *      @param {Object} [option.pos] - calendar position style vlaue
 *          @param {number} [option.pos.left] - position left of calendar
 *          @param {number} [option.pos.top] - position top of calendar
 *          @param {number} [option.pos.zIndex] - z-index of calendar
 *      @param {Object} [option.openers = [element]] - opener button list (example - icon, button, etc.)
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
 *   var picker1 = new tui.component.DatePicker({
 *       element: '#picker',
 *       dateForm: 'yyyy년 mm월 dd일 - ',
 *       date: {year: 2015, month: 1, date: 1 },
 *       startDate: {year:2012, month:1, date:17},
 *       endDate: {year: 2070, month:12, date:31},
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
        this._$wrapperElement = null;

        /**
         * Format of date string
         * @type {string}
         * @private
         */
        this._dateForm = option.dateForm || 'yyyy-mm-dd ';

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
         *  // If the format is a 'mm-dd, yyyy'
         *  // `this._formOrder` is ['month', 'date', 'year']
         */
        this._formOrder = [];

        /**
         * Object having date values
         * @type {{year: number, month: number, date: number}}
         * @private
         */
        this._date = null;

        /**
         * This value is prepended automatically when year-format is 'yy'
         * @type {string}
         * @private
         * @example
         *  //
         *  // If this vlaue is '20', the format is 'yy-mm-dd' and the date string is '15-04-12',
         *  // the date value object is
         *  //  {
         *  //      year: 2015,
         *  //      month: 4,
         *  //      date: 12
         *  //  }
         */
        this._defaultCentury = option.defaultCentury || CONSTANTS.defaultCentury;

        /**
         * Class name for selectable date elements
         * @type {string}
         * @private
         */
        this._selectableClassName = option.selectableClassName || CONSTANTS.selectableClassName;

        /**
         * Class name for selected date element
         * @type {string}
         * @private
         */
        this._selectedClassName = option.selectedClassName || CONSTANTS.selectedClassName;

        /**
         * Start date that can be selected
         * It is number of date (=timestamp)
         * @type {number}
         * @private
         */
        this._startEdge = option.startDate;

        /**
         * End date that can be selected
         * It is number of date (=timestamp)
         * @type {number}
         * @private
         */
        this._endEdge = option.endDate;

        /**
         * TimePicker instance
         * @type {TimePicker}
         * @private
         * @since 1.1.0
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

        this._initializeDatePicker(option);
    },

    /**
     * Initialize method
     * @param {Object} option - user option
     * @private
     */
    _initializeDatePicker: function(option) {
        this._setWrapperElement();
        this._setDefaultDate(option.date);
        this._setDefaultPosition(option.pos);
        this._restrictDate(option.startDate, option.endDate);
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
        this._$wrapperElement = $(CONSTANTS.wrapperTag)
            .insertAfter(this._$element)
            .append(this._calendar.$element);
    },

    /**
     * Set default date
     * @param {{year: number, month: number, date: number}|Date} opDate [option.date] - user setting: date
     * @private
     */
    _setDefaultDate: function(opDate) {
        if (!opDate) {
            this._date = utils.getDateHashTable();
        } else {
            this._date = {
                year: util.isNumber(opDate.year) ? opDate.year : CONSTANTS.minYear,
                month: util.isNumber(opDate.month) ? opDate.month : 1,
                date: util.isNumber(opDate.date) ? opDate.date : 1
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

        pos.left = pos.left || bound.left;
        pos.top = pos.top || bound.bottom;
        pos.zIndex = pos.zIndex || 9999;
    },

    /**
     * Restrict date
     * @param {{year: number, month: number, date: number}} opStartDate [option.startDate] - start date in calendar
     * @param {{year: number, month: number, date: number}} opEndDate [option.endDate] - end date in calendar
     * @private
     */
    _restrictDate: function(opStartDate, opEndDate) {
        var startDate = opStartDate || {year: CONSTANTS.minYear, month: 1, date: 1},
            endDate = opEndDate || {year: CONSTANTS.maxYear, month: 12, date: 31};

        this._startEdge = utils.getTime(startDate) - 1;
        this._endEdge = utils.getTime(endDate) + 1;
    },

    /**
     * Store opener element list
     * @param {Array} opOpeners [option.openers] - opener element list
     * @private
     */
    _setOpeners: function(opOpeners) {
        this.addOpener(this._$element);
        util.forEach(opOpeners, function(opener) {
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
        var onChangeTimePicker = util.bind(this.setDate, this);

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
        return util.isNumber(year) && year > CONSTANTS.minYear && year < CONSTANTS.maxYear;
    },

    /**
     * Check validation of a month
     * @param {number} month - month
     * @returns {boolean} - whether the month is valid or not
     * @private
     */
    _isValidMonth: function(month) {
        return util.isNumber(month) && month > 0 && month < 13;
    },

    /**
     * Check validation of values in a date object having year, month, day-in-month
     * @param {{year: number, month: number, date: number}} datehash - date object
     * @returns {boolean} - whether the date object is valid or not
     * @private
     */
    _isValidDate: function(datehash) {
        var year = datehash.year,
            month = datehash.month,
            date = datehash.date,
            isLeapYear = (year % 4 === 0) && (year % 100 !== 0) || (year % 400 === 0),
            lastDayInMonth,
            isBetween;

        if (!this._isValidYear(year) || !this._isValidMonth(month)) {
            return false;
        }

        lastDayInMonth = CONSTANTS.monthDays[month];
        if (isLeapYear && month === 2) {
                lastDayInMonth = 29;
        }
        isBetween = !!(util.isNumber(date) && (date > 0) && (date <= lastDayInMonth));

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

        util.forEach(this._openers, function(opener) {
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

        if (date && !this._isRestricted(date)) {
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
     * @returns {{year: number, month: number, date: number}|false} - extracted date object or false
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
     * Check a date-object is restricted or not
     * @param {{year: number, month: number, date: number}} datehash - date object
     * @returns {boolean} - whether the date-object is restricted or not
     * @private
     */
    _isRestricted: function(datehash) {
        var start = this._startEdge,
            end = this._endEdge,
            date = utils.getTime(datehash);

        return !this._isValidDate(datehash) || (date < start || date > end);
    },

    /**
     * Set selectable-class-name to selectable date element.
     * @param {HTMLElement|jQuery} element - date element
     * @param {{year: number, month: number, date: number}} dateHash - date object
     * @private
     */
    _setSelectableClassName: function(element, dateHash) {
        if (!this._isRestricted(dateHash)) {
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
        var proxies = this._proxyHandlers;

        // Event handlers for element
        proxies.onMousedownDocument = util.bind(this._onMousedownDocument, this);
        proxies.onKeydownElement = util.bind(this._onKeydownElement, this);
        proxies.onClickCalendar = util.bind(this._onClickCalendar, this);
        proxies.onClickOpener = util.bind(this._onClickOpener, this);

        // Event handlers for custom event of calendar
        proxies.onBeforeDrawCalendar = util.bind(this._onBeforeDrawCalendar, this);
        proxies.onDrawCalendar = util.bind(this._onDrawCalendar, this);
        proxies.onAfterDrawCalendar = util.bind(this._onAfterDrawCalendar, this);
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
        this._bindOnClickCalendar();
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
     * Bind mousedown event of documnet
     * @private
     */
    _bindOnMousedownDocumnet: function() {
        $(document).on('mousedown', this._proxyHandlers.onMousedownDocument);
    },

    /**
     * Unbind mousedown event of documnet
     * @private
     */
    _unbindOnMousedownDocument: function() {
        $(document).off('mousedown', this._proxyHandlers.onMousedownDocument);
    },

    /**
     * Bind click event of calendar
     * @private
     */
    _bindOnClickCalendar: function() {
        var handler = this._proxyHandlers.onClickCalendar;
        this._$wrapperElement.find('.' + this._selectableClassName).on('click', handler);
    },

    /**
     * Unbind click event of calendar
     * @private
     */
    _unbindOnClickCalendar: function() {
        var handler = this._proxyHandlers.onClickCalendar;
        this._$wrapperElement.find('.' + this._selectableClassName).off('click', handler);
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
     * Set position-left, top of calendar
     * @param {number} x - position-left
     * @param {number} y - position-top
     * @since 1.1.1
     */
    setXY: function(x, y) {
        var pos = this._pos;

        pos.left = util.isNumber(x) ? x : pos.left;
        pos.top = util.isNumber(y) ? y : pos.top;
        this._arrangeLayer();
    },

    /**
     * Set z-index of calendar
     * @param {number} zIndex - z-index value
     * @since 1.1.1
     */
    setZIndex: function(zIndex) {
        if (!util.isNumber(zIndex)) {
            return;
        }

        this._pos.zIndex = zIndex;
        this._arrangeLayer();
    },

    /**
     * add opener
     * @param {HTMLElement|jQuery} opener - element
     */
    addOpener: function(opener) {
        if (inArray(opener, this._openers) < 0) {
            this._openers.push($(opener)[0]);
            $(opener).on('click', this._proxyHandlers.onClickOpener);
        }
    },

    /**
     * remove opener
     * @param {HTMLElement} opener - element
     */
    removeOpener: function(opener) {
        var index = inArray(opener, this._openers);

        if (index > -1) {
            $(this._openers[index]).off('click', this._proxyHandlers.onClickOpener);
            this._openers.splice(index, 1);
        }
    },

    /**
     * Open calendar with arranging position
     */
    open: function() {
        if (this.isOpened()) {
            return;
        }
        this._arrangeLayer();
        this._bindCalendarCustomEvent();
        this._bindOnMousedownDocumnet();
        this._calendar.draw(this._date.year, this._date.month, false);
        this._$wrapperElement.show();
        this.fire('open');
    },

    /**
     * Close calendar with unbinding some events
     */
    close: function() {
        if (!this.isOpened()) {
            return;
        }
        this._unbindCalendarCustomEvent();
        this._unbindOnMousedownDocument();
        this._$wrapperElement.hide();
        this.fire('close');
    },

    /**
     * Get date-object of current DatePicker instance.
     * @returns {Object} - date-object having year, month and day-in-month
     */
    getDateObject: function() {
        return util.extend({}, this._date);
    },

    /**
     * Return year
     * @returns {number} - year
     */
    getYear: function() {
        return this._date.year;
    },

    /**
     * Return month
     * @returns {number} - month
     */
    getMonth: function() {
        return this._date.month;
    },

    /**
     * Return day-in-month
     * @returns {number} - day-in-month
     */
    getDayInMonth: function() {
        return this._date.date;
    },

    /**
     * Set date from values(year, month, date) and then fire 'update' custom event
     * @param {string|number} [year] - year
     * @param {string|number} [month] - month
     * @param {string|number} [date] - day in month
     */
    setDate: function(year, month, date) {
        var dateObj = this._date,
            newDateObj = {};

        newDateObj.year = year || dateObj.year;
        newDateObj.month = month || dateObj.month;
        newDateObj.date = date || dateObj.date;

        if (!this._isRestricted(newDateObj)) {
            util.extend(dateObj, newDateObj);
        }
        this._setValueToInputElement();
        this._calendar.draw(dateObj.year, dateObj.month, false);

        this.fire('update');
    },

    /**
     * Set or update date-form
     * @param {String} [form] - date-format
     * @example
     *  datepicker.setDateForm('yyyy-mm-dd');
     *  datepicker.setDateForm('mm-dd, yyyy');
     *  datepicker.setDateForm('y/m/d');
     *  datepicker.setDateForm('yy/mm/dd');
     */
    setDateForm: function(form) {
        this._dateForm = form || this._dateForm;
        this._setRegExp();
        this.setDate();
    },

    /**
     * Return whether the calendar is opened or not
     * @returns {boolean} - true if opened, false otherwise
     */
    isOpened: function() {
        return this._$wrapperElement.css('display') === 'block';
    },

    /**
     * Return TimePicker instance
     * @returns {TimePicker} - TimePicker instance
     */
    getTimePicker: function() {
        return this._timePicker;
    }
});

util.CustomEvents.mixin(DatePicker);

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
 * Created by nhnent on 15. 4. 30..
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
 *
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
        var firstDay = this.getFirstDay(year, month),
            lastDate = this.getLastDate(year, month);

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
        return this.getDateObject(date).getTime();
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
    }
};

module.exports = utils;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9kYXRlcGlja2VyLmpzIiwic3JjL3NwaW5ib3guanMiLCJzcmMvdGltZXBpY2tlci5qcyIsInNyYy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4OEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidHVpLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCd0dWkuY29tcG9uZW50LlNwaW5ib3gnLCByZXF1aXJlKCcuL3NyYy9zcGluYm94JykpO1xudHVpLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCd0dWkuY29tcG9uZW50LlRpbWVQaWNrZXInLCByZXF1aXJlKCcuL3NyYy90aW1lcGlja2VyJykpO1xudHVpLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCd0dWkuY29tcG9uZW50LkRhdGVQaWNrZXInLCByZXF1aXJlKCcuL3NyYy9kYXRlcGlja2VyJykpO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IG5obmVudCBvbiAxNS4gNS4gMTQuLlxuICogQGZpbGVvdmVydmlldyBUaGlzIGNvbXBvbmVudCBwcm92aWRlcyBhIGNhbGVuZGFyIGZvciBwaWNraW5nIGEgZGF0ZSAmIHRpbWUuXG4gKiBAYXV0aG9yIE5ITiBlbnQgRkUgZGV2IDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+IDxtaW5reXUueWlAbmhuZW50LmNvbT5cbiAqIEBkZXBlbmRlbmN5IGpxdWVyeS0xLjguMywgY29kZS1zbmlwcGV0LTEuMC4yLCBjb21wb25lbnQtY2FsZW5kYXItMS4wLjEsIHRpbWVQaWNrZXIuanNcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIHV0aWwgPSB0dWkudXRpbCxcbiAgICBpbkFycmF5ID0gdXRpbC5pbkFycmF5LFxuICAgIGZvcm1hdFJlZ0V4cCA9IC95eXl5fHl5fG1tfG18ZGR8ZC9naSxcbiAgICBtYXBGb3JDb252ZXJ0aW5nID0ge1xuICAgICAgICB5eXl5OiB7ZXhwcmVzc2lvbjogJyhcXFxcZHs0fXxcXFxcZHsyfSknLCB0eXBlOiAneWVhcid9LFxuICAgICAgICB5eToge2V4cHJlc3Npb246ICcoXFxcXGR7NH18XFxcXGR7Mn0pJywgdHlwZTogJ3llYXInfSxcbiAgICAgICAgeToge2V4cHJlc3Npb246ICcoXFxcXGR7NH18XFxcXGR7Mn0pJywgdHlwZTogJ3llYXInfSxcbiAgICAgICAgbW06IHtleHByZXNzaW9uOiAnKDFbMDEyXXwwWzEtOV18WzEtOV1cXFxcYiknLCB0eXBlOiAnbW9udGgnfSxcbiAgICAgICAgbToge2V4cHJlc3Npb246ICcoMVswMTJdfDBbMS05XXxbMS05XVxcXFxiKScsIHR5cGU6ICdtb250aCd9LFxuICAgICAgICBkZDoge2V4cHJlc3Npb246ICcoWzEyXVxcXFxkezF9fDNbMDFdfDBbMS05XXxbMS05XVxcXFxiKScsIHR5cGU6ICdkYXRlJ30sXG4gICAgICAgIGQ6IHtleHByZXNzaW9uOiAnKFsxMl1cXFxcZHsxfXwzWzAxXXwwWzEtOV18WzEtOV1cXFxcYiknLCB0eXBlOiAnZGF0ZSd9XG4gICAgfSxcbiAgICBDT05TVEFOVFMgPSB7XG4gICAgICAgIG1pblllYXI6IDE5NzAsXG4gICAgICAgIG1heFllYXI6IDI5OTksXG4gICAgICAgIG1vbnRoRGF5czogWzAsIDMxLCAyOCwgMzEsIDMwLCAzMSwgMzAsIDMxLCAzMSwgMzAsIDMxLCAzMCwgMzFdLFxuICAgICAgICB3cmFwcGVyVGFnOiAnPGRpdiBzdHlsZT1cInBvc2l0aW9uOmFic29sdXRlO1wiPjwvZGl2PicsXG4gICAgICAgIGRlZmF1bHRDZW50dXJ5OiAnMjAnLFxuICAgICAgICBzZWxlY3RhYmxlQ2xhc3NOYW1lOiAnc2VsZWN0YWJsZScsXG4gICAgICAgIHNlbGVjdGVkQ2xhc3NOYW1lOiAnc2VsZWN0ZWQnXG4gICAgfTtcblxuLyoqXG4gKiBDcmVhdGUgRGF0ZVBpY2tlcjxicj5cbiAqIFlvdSBjYW4gZ2V0IGEgZGF0ZSBmcm9tICdnZXRZZWFyJywgJ2dldE1vbnRoJywgJ2dldERheUluTW9udGgnLCAnZ2V0RGF0ZU9iamVjdCdcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbiAtIG9wdGlvbnMgZm9yIERhdGVQaWNrZXJcbiAqICAgICAgQHBhcmFtIHtIVE1MRWxlbWVudHxzdHJpbmd9IG9wdGlvbi5lbGVtZW50IC0gaW5wdXQgZWxlbWVudChvciBzZWxlY3Rvcikgb2YgRGF0ZVBpY2tlclxuICogICAgICBAcGFyYW0ge09iamVjdH0gW29wdGlvbi5kYXRlID0gdG9kYXldIC0gaW5pdGlhbCBkYXRlIG9iamVjdFxuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24uZGF0ZS55ZWFyXSAtIHllYXJcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLmRhdGUubW9udGhdIC0gbW9udGhcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLmRhdGUuZGF0ZV0gLSBkYXkgaW4gbW9udGhcbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IFtvcHRpb24uZGF0ZUZvcm0gPSAneXl5eS1tbS1kZCddIC0gZm9ybWF0IG9mIGRhdGUgc3RyaW5nXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9uLmRlZmF1bHRDZW50dXJ5ID0gMjBdIC0gaWYgeWVhci1mb3JtYXQgaXMgeXksIHRoaXMgdmFsdWUgaXMgcHJlcGVuZGVkIGF1dG9tYXRpY2FsbHkuXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9uLnNlbGVjdGFibGVDbGFzc05hbWUgPSAnc2VsZWN0YWJsZSddIC0gZm9yIHNlbGVjdGFibGUgZGF0ZSBlbGVtZW50c1xuICogICAgICBAcGFyYW0ge3N0cmluZ30gW29wdGlvbi5zZWxlY3RlZENsYXNzTmFtZSA9ICdzZWxlY3RlZCddIC0gZm9yIHNlbGVjdGVkIGRhdGUgZWxlbWVudFxuICogICAgICBAcGFyYW0ge09iamVjdH0gW29wdGlvbi5zdGFydERhdGVdIC0gc3RhcnQgZGF0ZSBpbiBjYWxlbmRhclxuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24uc3RhcnREYXRlLnllYXJdIC0geWVhclxuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24uc3RhcnREYXRlLm1vbnRoXSAtIG1vbnRoXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gW29wdGlvbi5zdGFydERhdGUuZGF0ZV0gLSBkYXkgaW4gbW9udGhcbiAqICAgICAgQHBhcmFtIHtPYmplY3R9IFtvcHRpb24uZW5kRGF0ZV0gLSBsYXN0IGRhdGUgaW4gY2FsZW5kYXJcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLmVuZERhdGUueWVhcl0gLSB5ZWFyXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gW29wdGlvbi5lbmREYXRlLm1vbnRoXSAtIG1vbnRoXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gW29wdGlvbi5lbmREYXRlLmRhdGVdIC0gZGF5IGluIG1vbnRoXG4gKiAgICAgIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uLnBvc10gLSBjYWxlbmRhciBwb3NpdGlvbiBzdHlsZSB2bGF1ZVxuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24ucG9zLmxlZnRdIC0gcG9zaXRpb24gbGVmdCBvZiBjYWxlbmRhclxuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24ucG9zLnRvcF0gLSBwb3NpdGlvbiB0b3Agb2YgY2FsZW5kYXJcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLnBvcy56SW5kZXhdIC0gei1pbmRleCBvZiBjYWxlbmRhclxuICogICAgICBAcGFyYW0ge09iamVjdH0gW29wdGlvbi5vcGVuZXJzID0gW2VsZW1lbnRdXSAtIG9wZW5lciBidXR0b24gbGlzdCAoZXhhbXBsZSAtIGljb24sIGJ1dHRvbiwgZXRjLilcbiAqICAgICAgQHBhcmFtIHt0dWkuY29tcG9uZW50LlRpbWVQaWNrZXJ9IFtvcHRpb24udGltZVBpY2tlcl0gLSBUaW1lUGlja2VyIGluc3RhbmNlXG4gKiBAcGFyYW0ge3R1aS5jb21wb25lbnQuQ2FsZW5kYXJ9IGNhbGVuZGFyIC0gQ2FsZW5kYXIgaW5zdGFuY2VcbiAqIEBleGFtcGxlXG4gKiAgIHZhciBjYWxlbmRhciA9IG5ldyB0dWkuY29tcG9uZW50LkNhbGVuZGFyKHtcbiAqICAgICAgIGVsZW1lbnQ6ICcjbGF5ZXInLFxuICogICAgICAgdGl0bGVGb3JtYXQ6ICd5eXl564WEIG3sm5QnLFxuICogICAgICAgdG9kYXlGb3JtYXQ6ICd5eXl564WEIG1t7JuUIGRk7J28IChEKSdcbiAqICAgfSk7XG4gKlxuICogICB2YXIgdGltZVBpY2tlciA9IG5ldyB0dWkuY29tcG9uZW50LlRpbWVQaWNrZXIoe1xuICogICAgICAgc2hvd01lcmlkaWFuOiB0cnVlLFxuICogICAgICAgZGVmYXVsdEhvdXI6IDEzLFxuICogICAgICAgZGVmYXVsdE1pbnV0ZTogMjRcbiAqICAgfSk7XG4gKlxuICogICB2YXIgcGlja2VyMSA9IG5ldyB0dWkuY29tcG9uZW50LkRhdGVQaWNrZXIoe1xuICogICAgICAgZWxlbWVudDogJyNwaWNrZXInLFxuICogICAgICAgZGF0ZUZvcm06ICd5eXl564WEIG1t7JuUIGRk7J28IC0gJyxcbiAqICAgICAgIGRhdGU6IHt5ZWFyOiAyMDE1LCBtb250aDogMSwgZGF0ZTogMSB9LFxuICogICAgICAgc3RhcnREYXRlOiB7eWVhcjoyMDEyLCBtb250aDoxLCBkYXRlOjE3fSxcbiAqICAgICAgIGVuZERhdGU6IHt5ZWFyOiAyMDcwLCBtb250aDoxMiwgZGF0ZTozMX0sXG4gKiAgICAgICBvcGVuZXJzOiBbJyNvcGVuZXInXSxcbiAqICAgICAgIHRpbWVQaWNrZXI6IHRpbWVQaWNrZXJcbiAqICAgfSwgY2FsZW5kYXIpO1xuICpcbiAqICAgLy8gQ2xvc2UgY2FsZW5kYXIgd2hlbiBzZWxlY3QgYSBkYXRlXG4gKiAgICQoJyNsYXllcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gKiAgICAgICB2YXIgJGVsID0gJChldmVudC50YXJnZXQpO1xuICpcbiAqICAgICAgIGlmICgkZWwuaGFzQ2xhc3MoJ3NlbGVjdGFibGUnKSkge1xuICogICAgICAgICAgIHBpY2tlcjEuY2xvc2UoKTtcbiAqICAgICAgIH1cbiAqICAgfSk7XG4gKi9cbnZhciBEYXRlUGlja2VyID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBEYXRlUGlja2VyLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb24sIGNhbGVuZGFyKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDYWxlbmRhciBpbnN0YW5jZVxuICAgICAgICAgKiBAdHlwZSB7Q2FsZW5kYXJ9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9jYWxlbmRhciA9IGNhbGVuZGFyO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFbGVtZW50IGZvciBkaXNwbGF5aW5nIGEgZGF0ZSB2YWx1ZVxuICAgICAgICAgKiBAdHlwZSB7SFRNTEVsZW1lbnR9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl8kZWxlbWVudCA9ICQob3B0aW9uLmVsZW1lbnQpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFbGVtZW50IHdyYXBwaW5nIGNhbGVuZGFyXG4gICAgICAgICAqIEB0eXBlIHtIVE1MRWxlbWVudH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuXyR3cmFwcGVyRWxlbWVudCA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZvcm1hdCBvZiBkYXRlIHN0cmluZ1xuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fZGF0ZUZvcm0gPSBvcHRpb24uZGF0ZUZvcm0gfHwgJ3l5eXktbW0tZGQgJztcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVnRXhwIGluc3RhbmNlIGZvciBmb3JtYXQgb2YgZGF0ZSBzdHJpbmdcbiAgICAgICAgICogQHR5cGUge1JlZ0V4cH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3JlZ0V4cCA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFycmF5IHNhdmluZyBhIG9yZGVyIG9mIGZvcm1hdFxuICAgICAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBzZWUge3R1aS5jb21wb25lbnQuRGF0ZVBpY2tlci5wcm90b3R5cGUuc2V0RGF0ZUZvcm19XG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqICAvLyBJZiB0aGUgZm9ybWF0IGlzIGEgJ21tLWRkLCB5eXl5J1xuICAgICAgICAgKiAgLy8gYHRoaXMuX2Zvcm1PcmRlcmAgaXMgWydtb250aCcsICdkYXRlJywgJ3llYXInXVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fZm9ybU9yZGVyID0gW107XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIE9iamVjdCBoYXZpbmcgZGF0ZSB2YWx1ZXNcbiAgICAgICAgICogQHR5cGUge3t5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRhdGU6IG51bWJlcn19XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9kYXRlID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhpcyB2YWx1ZSBpcyBwcmVwZW5kZWQgYXV0b21hdGljYWxseSB3aGVuIHllYXItZm9ybWF0IGlzICd5eSdcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICogIC8vXG4gICAgICAgICAqICAvLyBJZiB0aGlzIHZsYXVlIGlzICcyMCcsIHRoZSBmb3JtYXQgaXMgJ3l5LW1tLWRkJyBhbmQgdGhlIGRhdGUgc3RyaW5nIGlzICcxNS0wNC0xMicsXG4gICAgICAgICAqICAvLyB0aGUgZGF0ZSB2YWx1ZSBvYmplY3QgaXNcbiAgICAgICAgICogIC8vICB7XG4gICAgICAgICAqICAvLyAgICAgIHllYXI6IDIwMTUsXG4gICAgICAgICAqICAvLyAgICAgIG1vbnRoOiA0LFxuICAgICAgICAgKiAgLy8gICAgICBkYXRlOiAxMlxuICAgICAgICAgKiAgLy8gIH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2RlZmF1bHRDZW50dXJ5ID0gb3B0aW9uLmRlZmF1bHRDZW50dXJ5IHx8IENPTlNUQU5UUy5kZWZhdWx0Q2VudHVyeTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2xhc3MgbmFtZSBmb3Igc2VsZWN0YWJsZSBkYXRlIGVsZW1lbnRzXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9zZWxlY3RhYmxlQ2xhc3NOYW1lID0gb3B0aW9uLnNlbGVjdGFibGVDbGFzc05hbWUgfHwgQ09OU1RBTlRTLnNlbGVjdGFibGVDbGFzc05hbWU7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENsYXNzIG5hbWUgZm9yIHNlbGVjdGVkIGRhdGUgZWxlbWVudFxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fc2VsZWN0ZWRDbGFzc05hbWUgPSBvcHRpb24uc2VsZWN0ZWRDbGFzc05hbWUgfHwgQ09OU1RBTlRTLnNlbGVjdGVkQ2xhc3NOYW1lO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTdGFydCBkYXRlIHRoYXQgY2FuIGJlIHNlbGVjdGVkXG4gICAgICAgICAqIEl0IGlzIG51bWJlciBvZiBkYXRlICg9dGltZXN0YW1wKVxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fc3RhcnRFZGdlID0gb3B0aW9uLnN0YXJ0RGF0ZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRW5kIGRhdGUgdGhhdCBjYW4gYmUgc2VsZWN0ZWRcbiAgICAgICAgICogSXQgaXMgbnVtYmVyIG9mIGRhdGUgKD10aW1lc3RhbXApXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9lbmRFZGdlID0gb3B0aW9uLmVuZERhdGU7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRpbWVQaWNrZXIgaW5zdGFuY2VcbiAgICAgICAgICogQHR5cGUge1RpbWVQaWNrZXJ9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBzaW5jZSAxLjEuMFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fdGltZVBpY2tlciA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHBvc2l0aW9uIC0gbGVmdCAmIHRvcCAmIHpJbmRleFxuICAgICAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAc2luY2UgMS4xLjFcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3BvcyA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIG9wZW5lcnMgLSBvcGVuZXIgbGlzdFxuICAgICAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBzaW5jZSAxLjEuMVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fb3BlbmVycyA9IFtdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBIYW5kbGVycyBiaW5kaW5nIGNvbnRleHRcbiAgICAgICAgICogQHR5cGUge09iamVjdH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3Byb3h5SGFuZGxlcnMgPSB7fTtcblxuICAgICAgICB0aGlzLl9pbml0aWFsaXplRGF0ZVBpY2tlcihvcHRpb24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIG1ldGhvZFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb24gLSB1c2VyIG9wdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXRpYWxpemVEYXRlUGlja2VyOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgdGhpcy5fc2V0V3JhcHBlckVsZW1lbnQoKTtcbiAgICAgICAgdGhpcy5fc2V0RGVmYXVsdERhdGUob3B0aW9uLmRhdGUpO1xuICAgICAgICB0aGlzLl9zZXREZWZhdWx0UG9zaXRpb24ob3B0aW9uLnBvcyk7XG4gICAgICAgIHRoaXMuX3Jlc3RyaWN0RGF0ZShvcHRpb24uc3RhcnREYXRlLCBvcHRpb24uZW5kRGF0ZSk7XG4gICAgICAgIHRoaXMuX3NldFByb3h5SGFuZGxlcnMoKTtcbiAgICAgICAgdGhpcy5fYmluZE9wZW5lckV2ZW50KG9wdGlvbi5vcGVuZXJzKTtcbiAgICAgICAgdGhpcy5fc2V0VGltZVBpY2tlcihvcHRpb24udGltZVBpY2tlcik7XG4gICAgICAgIHRoaXMuc2V0RGF0ZUZvcm0oKTtcbiAgICAgICAgdGhpcy5fJHdyYXBwZXJFbGVtZW50LmhpZGUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHdyYXBwZXIgZWxlbWVudCg9IGNvbnRhaW5lcilcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRXcmFwcGVyRWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuXyR3cmFwcGVyRWxlbWVudCA9ICQoQ09OU1RBTlRTLndyYXBwZXJUYWcpXG4gICAgICAgICAgICAuaW5zZXJ0QWZ0ZXIodGhpcy5fJGVsZW1lbnQpXG4gICAgICAgICAgICAuYXBwZW5kKHRoaXMuX2NhbGVuZGFyLiRlbGVtZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGRlZmF1bHQgZGF0ZVxuICAgICAqIEBwYXJhbSB7e3llYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF0ZTogbnVtYmVyfXxEYXRlfSBvcERhdGUgW29wdGlvbi5kYXRlXSAtIHVzZXIgc2V0dGluZzogZGF0ZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldERlZmF1bHREYXRlOiBmdW5jdGlvbihvcERhdGUpIHtcbiAgICAgICAgaWYgKCFvcERhdGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2RhdGUgPSB1dGlscy5nZXREYXRlSGFzaFRhYmxlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9kYXRlID0ge1xuICAgICAgICAgICAgICAgIHllYXI6IHV0aWwuaXNOdW1iZXIob3BEYXRlLnllYXIpID8gb3BEYXRlLnllYXIgOiBDT05TVEFOVFMubWluWWVhcixcbiAgICAgICAgICAgICAgICBtb250aDogdXRpbC5pc051bWJlcihvcERhdGUubW9udGgpID8gb3BEYXRlLm1vbnRoIDogMSxcbiAgICAgICAgICAgICAgICBkYXRlOiB1dGlsLmlzTnVtYmVyKG9wRGF0ZS5kYXRlKSA/IG9wRGF0ZS5kYXRlIDogMVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTYXZlIGRlZmF1bHQgc3R5bGUtcG9zaXRpb24gb2YgY2FsZW5kYXJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3BQb3MgW29wdGlvbi5wb3NdIC0gdXNlciBzZXR0aW5nOiBwb3NpdGlvbihsZWZ0LCB0b3AsIHpJbmRleClcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXREZWZhdWx0UG9zaXRpb246IGZ1bmN0aW9uKG9wUG9zKSB7XG4gICAgICAgIHZhciBwb3MgPSB0aGlzLl9wb3MgPSBvcFBvcyB8fCB7fSxcbiAgICAgICAgICAgIGJvdW5kID0gdGhpcy5fZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgcG9zLmxlZnQgPSBwb3MubGVmdCB8fCBib3VuZC5sZWZ0O1xuICAgICAgICBwb3MudG9wID0gcG9zLnRvcCB8fCBib3VuZC5ib3R0b207XG4gICAgICAgIHBvcy56SW5kZXggPSBwb3MuekluZGV4IHx8IDk5OTk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlc3RyaWN0IGRhdGVcbiAgICAgKiBAcGFyYW0ge3t5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRhdGU6IG51bWJlcn19IG9wU3RhcnREYXRlIFtvcHRpb24uc3RhcnREYXRlXSAtIHN0YXJ0IGRhdGUgaW4gY2FsZW5kYXJcbiAgICAgKiBAcGFyYW0ge3t5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRhdGU6IG51bWJlcn19IG9wRW5kRGF0ZSBbb3B0aW9uLmVuZERhdGVdIC0gZW5kIGRhdGUgaW4gY2FsZW5kYXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9yZXN0cmljdERhdGU6IGZ1bmN0aW9uKG9wU3RhcnREYXRlLCBvcEVuZERhdGUpIHtcbiAgICAgICAgdmFyIHN0YXJ0RGF0ZSA9IG9wU3RhcnREYXRlIHx8IHt5ZWFyOiBDT05TVEFOVFMubWluWWVhciwgbW9udGg6IDEsIGRhdGU6IDF9LFxuICAgICAgICAgICAgZW5kRGF0ZSA9IG9wRW5kRGF0ZSB8fCB7eWVhcjogQ09OU1RBTlRTLm1heFllYXIsIG1vbnRoOiAxMiwgZGF0ZTogMzF9O1xuXG4gICAgICAgIHRoaXMuX3N0YXJ0RWRnZSA9IHV0aWxzLmdldFRpbWUoc3RhcnREYXRlKSAtIDE7XG4gICAgICAgIHRoaXMuX2VuZEVkZ2UgPSB1dGlscy5nZXRUaW1lKGVuZERhdGUpICsgMTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3RvcmUgb3BlbmVyIGVsZW1lbnQgbGlzdFxuICAgICAqIEBwYXJhbSB7QXJyYXl9IG9wT3BlbmVycyBbb3B0aW9uLm9wZW5lcnNdIC0gb3BlbmVyIGVsZW1lbnQgbGlzdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldE9wZW5lcnM6IGZ1bmN0aW9uKG9wT3BlbmVycykge1xuICAgICAgICB0aGlzLmFkZE9wZW5lcih0aGlzLl8kZWxlbWVudCk7XG4gICAgICAgIHV0aWwuZm9yRWFjaChvcE9wZW5lcnMsIGZ1bmN0aW9uKG9wZW5lcikge1xuICAgICAgICAgICAgdGhpcy5hZGRPcGVuZXIob3BlbmVyKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBUaW1lUGlja2VyIGluc3RhbmNlXG4gICAgICogQHBhcmFtIHt0dWkuY29tcG9uZW50LlRpbWVQaWNrZXJ9IFtvcFRpbWVQaWNrZXJdIC0gVGltZVBpY2tlciBpbnN0YW5jZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldFRpbWVQaWNrZXI6IGZ1bmN0aW9uKG9wVGltZVBpY2tlcikge1xuICAgICAgICBpZiAoIW9wVGltZVBpY2tlcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fdGltZVBpY2tlciA9IG9wVGltZVBpY2tlcjtcbiAgICAgICAgdGhpcy5fYmluZEN1c3RvbUV2ZW50V2l0aFRpbWVQaWNrZXIoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBjdXN0b20gZXZlbnQgd2l0aCBUaW1lUGlja2VyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYmluZEN1c3RvbUV2ZW50V2l0aFRpbWVQaWNrZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb25DaGFuZ2VUaW1lUGlja2VyID0gdXRpbC5iaW5kKHRoaXMuc2V0RGF0ZSwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5vbignb3BlbicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5fdGltZVBpY2tlci5zZXRUaW1lRnJvbUlucHV0RWxlbWVudCh0aGlzLl8kZWxlbWVudCk7XG4gICAgICAgICAgICB0aGlzLl90aW1lUGlja2VyLm9uKCdjaGFuZ2UnLCBvbkNoYW5nZVRpbWVQaWNrZXIpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5vbignY2xvc2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuX3RpbWVQaWNrZXIub2ZmKCdjaGFuZ2UnLCBvbkNoYW5nZVRpbWVQaWNrZXIpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgdmFsaWRhdGlvbiBvZiBhIHllYXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geWVhciAtIHllYXJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSB3aGV0aGVyIHRoZSB5ZWFyIGlzIHZhbGlkIG9yIG5vdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzVmFsaWRZZWFyOiBmdW5jdGlvbih5ZWFyKSB7XG4gICAgICAgIHJldHVybiB1dGlsLmlzTnVtYmVyKHllYXIpICYmIHllYXIgPiBDT05TVEFOVFMubWluWWVhciAmJiB5ZWFyIDwgQ09OU1RBTlRTLm1heFllYXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrIHZhbGlkYXRpb24gb2YgYSBtb250aFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtb250aCAtIG1vbnRoXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IC0gd2hldGhlciB0aGUgbW9udGggaXMgdmFsaWQgb3Igbm90XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNWYWxpZE1vbnRoOiBmdW5jdGlvbihtb250aCkge1xuICAgICAgICByZXR1cm4gdXRpbC5pc051bWJlcihtb250aCkgJiYgbW9udGggPiAwICYmIG1vbnRoIDwgMTM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrIHZhbGlkYXRpb24gb2YgdmFsdWVzIGluIGEgZGF0ZSBvYmplY3QgaGF2aW5nIHllYXIsIG1vbnRoLCBkYXktaW4tbW9udGhcbiAgICAgKiBAcGFyYW0ge3t5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRhdGU6IG51bWJlcn19IGRhdGVoYXNoIC0gZGF0ZSBvYmplY3RcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSB3aGV0aGVyIHRoZSBkYXRlIG9iamVjdCBpcyB2YWxpZCBvciBub3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc1ZhbGlkRGF0ZTogZnVuY3Rpb24oZGF0ZWhhc2gpIHtcbiAgICAgICAgdmFyIHllYXIgPSBkYXRlaGFzaC55ZWFyLFxuICAgICAgICAgICAgbW9udGggPSBkYXRlaGFzaC5tb250aCxcbiAgICAgICAgICAgIGRhdGUgPSBkYXRlaGFzaC5kYXRlLFxuICAgICAgICAgICAgaXNMZWFwWWVhciA9ICh5ZWFyICUgNCA9PT0gMCkgJiYgKHllYXIgJSAxMDAgIT09IDApIHx8ICh5ZWFyICUgNDAwID09PSAwKSxcbiAgICAgICAgICAgIGxhc3REYXlJbk1vbnRoLFxuICAgICAgICAgICAgaXNCZXR3ZWVuO1xuXG4gICAgICAgIGlmICghdGhpcy5faXNWYWxpZFllYXIoeWVhcikgfHwgIXRoaXMuX2lzVmFsaWRNb250aChtb250aCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxhc3REYXlJbk1vbnRoID0gQ09OU1RBTlRTLm1vbnRoRGF5c1ttb250aF07XG4gICAgICAgIGlmIChpc0xlYXBZZWFyICYmIG1vbnRoID09PSAyKSB7XG4gICAgICAgICAgICAgICAgbGFzdERheUluTW9udGggPSAyOTtcbiAgICAgICAgfVxuICAgICAgICBpc0JldHdlZW4gPSAhISh1dGlsLmlzTnVtYmVyKGRhdGUpICYmIChkYXRlID4gMCkgJiYgKGRhdGUgPD0gbGFzdERheUluTW9udGgpKTtcblxuICAgICAgICByZXR1cm4gaXNCZXR3ZWVuO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBhbiBlbGVtZW50IGlzIGFuIG9wZW5lci5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSB0YXJnZXQgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSAtIG9wZW5lciB0cnVlL2ZhbHNlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNPcGVuZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG5cbiAgICAgICAgdXRpbC5mb3JFYWNoKHRoaXMuX29wZW5lcnMsIGZ1bmN0aW9uKG9wZW5lcikge1xuICAgICAgICAgICAgaWYgKHRhcmdldCA9PT0gb3BlbmVyIHx8ICQuY29udGFpbnMob3BlbmVyLCB0YXJnZXQpKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgc3R5bGUtcG9zaXRpb24gb2YgY2FsZW5kYXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hcnJhbmdlTGF5ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc3R5bGUgPSB0aGlzLl8kd3JhcHBlckVsZW1lbnRbMF0uc3R5bGUsXG4gICAgICAgICAgICBwb3MgPSB0aGlzLl9wb3M7XG5cbiAgICAgICAgc3R5bGUubGVmdCA9IHBvcy5sZWZ0ICsgJ3B4JztcbiAgICAgICAgc3R5bGUudG9wID0gcG9zLnRvcCArICdweCc7XG4gICAgICAgIHN0eWxlLnpJbmRleCA9IHBvcy56SW5kZXg7XG4gICAgICAgIHRoaXMuXyR3cmFwcGVyRWxlbWVudC5hcHBlbmQodGhpcy5fY2FsZW5kYXIuJGVsZW1lbnQpO1xuICAgICAgICBpZiAodGhpcy5fdGltZVBpY2tlcikge1xuICAgICAgICAgICAgdGhpcy5fJHdyYXBwZXJFbGVtZW50LmFwcGVuZCh0aGlzLl90aW1lUGlja2VyLiR0aW1lUGlja2VyRWxlbWVudCk7XG4gICAgICAgICAgICB0aGlzLl90aW1lUGlja2VyLnNob3coKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYm91bmRpbmdDbGllbnRSZWN0IG9mIGFuIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fGpRdWVyeX0gW2VsZW1lbnRdIC0gZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IC0gYW4gb2JqZWN0IGhhdmluZyBsZWZ0LCB0b3AsIGJvdHRvbSwgcmlnaHQgb2YgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEJvdW5kaW5nQ2xpZW50UmVjdDogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICB2YXIgZWwgPSAkKGVsZW1lbnQpWzBdIHx8IHRoaXMuXyRlbGVtZW50WzBdLFxuICAgICAgICAgICAgYm91bmQsXG4gICAgICAgICAgICBjZWlsO1xuXG4gICAgICAgIGJvdW5kID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNlaWwgPSBNYXRoLmNlaWw7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsZWZ0OiBjZWlsKGJvdW5kLmxlZnQpLFxuICAgICAgICAgICAgdG9wOiBjZWlsKGJvdW5kLnRvcCksXG4gICAgICAgICAgICBib3R0b206IGNlaWwoYm91bmQuYm90dG9tKSxcbiAgICAgICAgICAgIHJpZ2h0OiBjZWlsKGJvdW5kLnJpZ2h0KVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgZGF0ZSBmcm9tIHN0cmluZ1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdHIgLSBkYXRlIHN0cmluZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldERhdGVGcm9tU3RyaW5nOiBmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgdmFyIGRhdGUgPSB0aGlzLl9leHRyYWN0RGF0ZShzdHIpO1xuXG4gICAgICAgIGlmIChkYXRlICYmICF0aGlzLl9pc1Jlc3RyaWN0ZWQoZGF0ZSkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl90aW1lUGlja2VyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdGltZVBpY2tlci5zZXRUaW1lRnJvbUlucHV0RWxlbWVudCh0aGlzLl8kZWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldERhdGUoZGF0ZS55ZWFyLCBkYXRlLm1vbnRoLCBkYXRlLmRhdGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXREYXRlKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGZvcm1lZCBkYXRlLXN0cmluZyBmcm9tIGRhdGUgb2JqZWN0XG4gICAgICogQHJldHVybiB7c3RyaW5nfSAtIGZvcm1lZCBkYXRlLXN0cmluZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Zvcm1lZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB5ZWFyID0gdGhpcy5fZGF0ZS55ZWFyLFxuICAgICAgICAgICAgbW9udGggPSB0aGlzLl9kYXRlLm1vbnRoLFxuICAgICAgICAgICAgZGF0ZSA9IHRoaXMuX2RhdGUuZGF0ZSxcbiAgICAgICAgICAgIGZvcm0gPSB0aGlzLl9kYXRlRm9ybSxcbiAgICAgICAgICAgIHJlcGxhY2VNYXAsXG4gICAgICAgICAgICBkYXRlU3RyaW5nO1xuXG4gICAgICAgIG1vbnRoID0gbW9udGggPCAxMCA/ICgnMCcgKyBtb250aCkgOiBtb250aDtcbiAgICAgICAgZGF0ZSA9IGRhdGUgPCAxMCA/ICgnMCcgKyBkYXRlKSA6IGRhdGU7XG5cbiAgICAgICAgcmVwbGFjZU1hcCA9IHtcbiAgICAgICAgICAgIHl5eXk6IHllYXIsXG4gICAgICAgICAgICB5eTogU3RyaW5nKHllYXIpLnN1YnN0cigyLCAyKSxcbiAgICAgICAgICAgIG1tOiBtb250aCxcbiAgICAgICAgICAgIG06IE51bWJlcihtb250aCksXG4gICAgICAgICAgICBkZDogZGF0ZSxcbiAgICAgICAgICAgIGQ6IE51bWJlcihkYXRlKVxuICAgICAgICB9O1xuXG4gICAgICAgIGRhdGVTdHJpbmcgPSBmb3JtLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiByZXBsYWNlTWFwW2tleS50b0xvd2VyQ2FzZSgpXSB8fCAnJztcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGRhdGVTdHJpbmc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4dHJhY3QgZGF0ZS1vYmplY3QgZnJvbSBpbnB1dCBzdHJpbmcgd2l0aCBjb21wYXJpbmcgZGF0ZS1mb3JtYXQ8YnI+XG4gICAgICogSWYgY2FuIG5vdCBleHRyYWN0LCByZXR1cm4gZmFsc2VcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyIC0gaW5wdXQgc3RyaW5nKHRleHQpXG4gICAgICogQHJldHVybnMge3t5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRhdGU6IG51bWJlcn18ZmFsc2V9IC0gZXh0cmFjdGVkIGRhdGUgb2JqZWN0IG9yIGZhbHNlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZXh0cmFjdERhdGU6IGZ1bmN0aW9uKHN0cikge1xuICAgICAgICB2YXIgZm9ybU9yZGVyID0gdGhpcy5fZm9ybU9yZGVyLFxuICAgICAgICAgICAgcmVzdWx0RGF0ZSA9IHt9LFxuICAgICAgICAgICAgcmVnRXhwID0gdGhpcy5fcmVnRXhwO1xuXG4gICAgICAgIHJlZ0V4cC5sYXN0SW5kZXggPSAwO1xuICAgICAgICBpZiAocmVnRXhwLnRlc3Qoc3RyKSkge1xuICAgICAgICAgICAgcmVzdWx0RGF0ZVtmb3JtT3JkZXJbMF1dID0gTnVtYmVyKFJlZ0V4cC4kMSk7XG4gICAgICAgICAgICByZXN1bHREYXRlW2Zvcm1PcmRlclsxXV0gPSBOdW1iZXIoUmVnRXhwLiQyKTtcbiAgICAgICAgICAgIHJlc3VsdERhdGVbZm9ybU9yZGVyWzJdXSA9IE51bWJlcihSZWdFeHAuJDMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKFN0cmluZyhyZXN1bHREYXRlLnllYXIpLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgcmVzdWx0RGF0ZS55ZWFyID0gTnVtYmVyKHRoaXMuX2RlZmF1bHRDZW50dXJ5ICsgcmVzdWx0RGF0ZS55ZWFyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHREYXRlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBhIGRhdGUtb2JqZWN0IGlzIHJlc3RyaWN0ZWQgb3Igbm90XG4gICAgICogQHBhcmFtIHt7eWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXRlOiBudW1iZXJ9fSBkYXRlaGFzaCAtIGRhdGUgb2JqZWN0XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IC0gd2hldGhlciB0aGUgZGF0ZS1vYmplY3QgaXMgcmVzdHJpY3RlZCBvciBub3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc1Jlc3RyaWN0ZWQ6IGZ1bmN0aW9uKGRhdGVoYXNoKSB7XG4gICAgICAgIHZhciBzdGFydCA9IHRoaXMuX3N0YXJ0RWRnZSxcbiAgICAgICAgICAgIGVuZCA9IHRoaXMuX2VuZEVkZ2UsXG4gICAgICAgICAgICBkYXRlID0gdXRpbHMuZ2V0VGltZShkYXRlaGFzaCk7XG5cbiAgICAgICAgcmV0dXJuICF0aGlzLl9pc1ZhbGlkRGF0ZShkYXRlaGFzaCkgfHwgKGRhdGUgPCBzdGFydCB8fCBkYXRlID4gZW5kKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHNlbGVjdGFibGUtY2xhc3MtbmFtZSB0byBzZWxlY3RhYmxlIGRhdGUgZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fGpRdWVyeX0gZWxlbWVudCAtIGRhdGUgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e3llYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF0ZTogbnVtYmVyfX0gZGF0ZUhhc2ggLSBkYXRlIG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldFNlbGVjdGFibGVDbGFzc05hbWU6IGZ1bmN0aW9uKGVsZW1lbnQsIGRhdGVIYXNoKSB7XG4gICAgICAgIGlmICghdGhpcy5faXNSZXN0cmljdGVkKGRhdGVIYXNoKSkge1xuICAgICAgICAgICAgJChlbGVtZW50KS5hZGRDbGFzcyh0aGlzLl9zZWxlY3RhYmxlQ2xhc3NOYW1lKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgc2VsZWN0ZWQtY2xhc3MtbmFtZSB0byBzZWxlY3RlZCBkYXRlIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fGpRdWVyeX0gZWxlbWVudCAtIGRhdGUgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7e3llYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF0ZTogbnVtYmVyfX0gZGF0ZUhhc2ggLSBkYXRlIG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldFNlbGVjdGVkQ2xhc3NOYW1lOiBmdW5jdGlvbihlbGVtZW50LCBkYXRlSGFzaCkge1xuICAgICAgICB2YXIgeWVhciA9IHRoaXMuX2RhdGUueWVhcixcbiAgICAgICAgICAgIG1vbnRoID0gdGhpcy5fZGF0ZS5tb250aCxcbiAgICAgICAgICAgIGRhdGUgPSB0aGlzLl9kYXRlLmRhdGUsXG4gICAgICAgICAgICBpc1NlbGVjdGVkID0gKHllYXIgPT09IGRhdGVIYXNoLnllYXIpICYmIChtb250aCA9PT0gZGF0ZUhhc2gubW9udGgpICYmIChkYXRlID09PSBkYXRlSGFzaC5kYXRlKTtcblxuICAgICAgICBpZiAoaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgJChlbGVtZW50KS5hZGRDbGFzcyh0aGlzLl9zZWxlY3RlZENsYXNzTmFtZSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHZhbHVlIGEgZGF0ZS1zdHJpbmcgb2YgY3VycmVudCB0aGlzIGluc3RhbmNlIHRvIGlucHV0IGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRWYWx1ZVRvSW5wdXRFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGRhdGVTdHJpbmcgPSB0aGlzLl9mb3JtZWQoKSxcbiAgICAgICAgICAgIHRpbWVTdHJpbmcgPSAnJztcblxuICAgICAgICBpZiAodGhpcy5fdGltZVBpY2tlcikge1xuICAgICAgICAgICAgdGltZVN0cmluZyA9IHRoaXMuX3RpbWVQaWNrZXIuZ2V0VGltZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuXyRlbGVtZW50LnZhbChkYXRlU3RyaW5nICsgdGltZVN0cmluZyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldChvciBtYWtlKSBSZWdFeHAgaW5zdGFuY2UgZnJvbSB0aGUgZGF0ZS1mb3JtYXQgb2YgdGhpcyBpbnN0YW5jZS5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRSZWdFeHA6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVnRXhwU3RyID0gJ14nLFxuICAgICAgICAgICAgaW5kZXggPSAwLFxuICAgICAgICAgICAgZm9ybU9yZGVyID0gdGhpcy5fZm9ybU9yZGVyO1xuXG4gICAgICAgIHRoaXMuX2RhdGVGb3JtLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBzdHIudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAgICAgcmVnRXhwU3RyICs9IChtYXBGb3JDb252ZXJ0aW5nW2tleV0uZXhwcmVzc2lvbiArICdbXFxcXERcXFxcc10qJyk7XG4gICAgICAgICAgICBmb3JtT3JkZXJbaW5kZXhdID0gbWFwRm9yQ29udmVydGluZ1trZXldLnR5cGU7XG4gICAgICAgICAgICBpbmRleCArPSAxO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fcmVnRXhwID0gbmV3IFJlZ0V4cChyZWdFeHBTdHIsICdnaScpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgZXZlbnQgaGFuZGxlcnMgdG8gYmluZCBjb250ZXh0IGFuZCB0aGVuIHN0b3JlLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldFByb3h5SGFuZGxlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcHJveGllcyA9IHRoaXMuX3Byb3h5SGFuZGxlcnM7XG5cbiAgICAgICAgLy8gRXZlbnQgaGFuZGxlcnMgZm9yIGVsZW1lbnRcbiAgICAgICAgcHJveGllcy5vbk1vdXNlZG93bkRvY3VtZW50ID0gdXRpbC5iaW5kKHRoaXMuX29uTW91c2Vkb3duRG9jdW1lbnQsIHRoaXMpO1xuICAgICAgICBwcm94aWVzLm9uS2V5ZG93bkVsZW1lbnQgPSB1dGlsLmJpbmQodGhpcy5fb25LZXlkb3duRWxlbWVudCwgdGhpcyk7XG4gICAgICAgIHByb3hpZXMub25DbGlja0NhbGVuZGFyID0gdXRpbC5iaW5kKHRoaXMuX29uQ2xpY2tDYWxlbmRhciwgdGhpcyk7XG4gICAgICAgIHByb3hpZXMub25DbGlja09wZW5lciA9IHV0aWwuYmluZCh0aGlzLl9vbkNsaWNrT3BlbmVyLCB0aGlzKTtcblxuICAgICAgICAvLyBFdmVudCBoYW5kbGVycyBmb3IgY3VzdG9tIGV2ZW50IG9mIGNhbGVuZGFyXG4gICAgICAgIHByb3hpZXMub25CZWZvcmVEcmF3Q2FsZW5kYXIgPSB1dGlsLmJpbmQodGhpcy5fb25CZWZvcmVEcmF3Q2FsZW5kYXIsIHRoaXMpO1xuICAgICAgICBwcm94aWVzLm9uRHJhd0NhbGVuZGFyID0gdXRpbC5iaW5kKHRoaXMuX29uRHJhd0NhbGVuZGFyLCB0aGlzKTtcbiAgICAgICAgcHJveGllcy5vbkFmdGVyRHJhd0NhbGVuZGFyID0gdXRpbC5iaW5kKHRoaXMuX29uQWZ0ZXJEcmF3Q2FsZW5kYXIsIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFdmVudCBoYW5kbGVyIGZvciBtb3VzZWRvd24gb2YgZG9jdW1lbnQ8YnI+XG4gICAgICogLSBXaGVuIGNsaWNrIHRoZSBvdXQgb2YgbGF5ZXIsIGNsb3NlIHRoZSBsYXllclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gZXZlbnQgb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25Nb3VzZWRvd25Eb2N1bWVudDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyIGlzQ29udGFpbnMgPSAkLmNvbnRhaW5zKHRoaXMuXyR3cmFwcGVyRWxlbWVudFswXSwgZXZlbnQudGFyZ2V0KTtcblxuICAgICAgICBpZiAoKCFpc0NvbnRhaW5zICYmICF0aGlzLl9pc09wZW5lcihldmVudC50YXJnZXQpKSkge1xuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV2ZW50IGhhbmRsZXIgZm9yIGVudGVyLWtleSBkb3duIG9mIGlucHV0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBbZXZlbnRdIC0gZXZlbnQgb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25LZXlkb3duRWxlbWVudDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKCFldmVudCB8fCBldmVudC5rZXlDb2RlICE9PSAxMykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3NldERhdGVGcm9tU3RyaW5nKHRoaXMuXyRlbGVtZW50LnZhbCgpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXZlbnQgaGFuZGxlciBmb3IgY2xpY2sgb2YgY2FsZW5kYXI8YnI+XG4gICAgICogLSBVcGRhdGUgZGF0ZSBmb3JtIGV2ZW50LXRhcmdldFxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gZXZlbnQgb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25DbGlja0NhbGVuZGFyOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LFxuICAgICAgICAgICAgY2xhc3NOYW1lID0gdGFyZ2V0LmNsYXNzTmFtZSxcbiAgICAgICAgICAgIHZhbHVlID0gTnVtYmVyKCh0YXJnZXQuaW5uZXJUZXh0IHx8IHRhcmdldC50ZXh0Q29udGVudCB8fCB0YXJnZXQubm9kZVZhbHVlKSksXG4gICAgICAgICAgICBzaG93bkRhdGUsXG4gICAgICAgICAgICByZWxhdGl2ZU1vbnRoLFxuICAgICAgICAgICAgZGF0ZTtcblxuICAgICAgICBpZiAodmFsdWUgJiYgIWlzTmFOKHZhbHVlKSkge1xuICAgICAgICAgICAgaWYgKGNsYXNzTmFtZS5pbmRleE9mKCdwcmV2LW1vbnRoJykgPiAtMSkge1xuICAgICAgICAgICAgICAgIHJlbGF0aXZlTW9udGggPSAtMTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY2xhc3NOYW1lLmluZGV4T2YoJ25leHQtbW9udGgnKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgcmVsYXRpdmVNb250aCA9IDE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlbGF0aXZlTW9udGggPSAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzaG93bkRhdGUgPSB0aGlzLl9jYWxlbmRhci5nZXREYXRlKCk7XG4gICAgICAgICAgICBzaG93bkRhdGUuZGF0ZSA9IHZhbHVlO1xuICAgICAgICAgICAgZGF0ZSA9IHV0aWxzLmdldFJlbGF0aXZlRGF0ZSgwLCByZWxhdGl2ZU1vbnRoLCAwLCBzaG93bkRhdGUpO1xuICAgICAgICAgICAgdGhpcy5zZXREYXRlKGRhdGUueWVhciwgZGF0ZS5tb250aCwgZGF0ZS5kYXRlKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFdmVudCBoYW5kbGVyIGZvciBjbGljayBvZiBvcGVuZXItZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uQ2xpY2tPcGVuZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLm9wZW4oKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXZlbnQgaGFuZGxlciBmb3IgJ2JlZm9yZURyYXcnLWN1c3RvbSBldmVudCBvZiBjYWxlbmRhclxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHNlZSB7dHVpLmNvbXBvbmVudC5DYWxlbmRhci5kcmF3fVxuICAgICAqL1xuICAgIF9vbkJlZm9yZURyYXdDYWxlbmRhcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX3VuYmluZE9uQ2xpY2tDYWxlbmRhcigpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFdmVudCBoYW5kbGVyIGZvciAnZHJhdyctY3VzdG9tIGV2ZW50IG9mIGNhbGVuZGFyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50RGF0YSAtIGN1c3RvbSBldmVudCBkYXRhXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAc2VlIHt0dWkuY29tcG9uZW50LkNhbGVuZGFyLmRyYXd9XG4gICAgICovXG4gICAgX29uRHJhd0NhbGVuZGFyOiBmdW5jdGlvbihldmVudERhdGEpIHtcbiAgICAgICAgdmFyIGRhdGVIYXNoID0ge1xuICAgICAgICAgICAgeWVhcjogZXZlbnREYXRhLnllYXIsXG4gICAgICAgICAgICBtb250aDogZXZlbnREYXRhLm1vbnRoLFxuICAgICAgICAgICAgZGF0ZTogZXZlbnREYXRhLmRhdGVcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5fc2V0U2VsZWN0YWJsZUNsYXNzTmFtZShldmVudERhdGEuJGRhdGVDb250YWluZXIsIGRhdGVIYXNoKTtcbiAgICAgICAgdGhpcy5fc2V0U2VsZWN0ZWRDbGFzc05hbWUoZXZlbnREYXRhLiRkYXRlQ29udGFpbmVyLCBkYXRlSGFzaCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV2ZW50IGhhbmRsZXIgZm9yICdhZnRlckRyYXcnLWN1c3RvbSBldmVudCBvZiBjYWxlbmRhclxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHNlZSB7dHVpLmNvbXBvbmVudC5DYWxlbmRhci5kcmF3fVxuICAgICAqL1xuICAgIF9vbkFmdGVyRHJhd0NhbGVuZGFyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fYmluZE9uQ2xpY2tDYWxlbmRhcigpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCaW5kIG9wZW5lci1lbGVtZW50cyBldmVudFxuICAgICAqIEBwYXJhbSB7QXJyYXl9IG9wT3BlbmVycyBbb3B0aW9uLm9wZW5lcnNdIC0gbGlzdCBvZiBvcGVuZXIgZWxlbWVudHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9iaW5kT3BlbmVyRXZlbnQ6IGZ1bmN0aW9uKG9wT3BlbmVycykge1xuICAgICAgICB0aGlzLl9zZXRPcGVuZXJzKG9wT3BlbmVycyk7XG4gICAgICAgIHRoaXMuXyRlbGVtZW50Lm9uKCdrZXlkb3duJywgdGhpcy5fcHJveHlIYW5kbGVycy5vbktleWRvd25FbGVtZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBtb3VzZWRvd24gZXZlbnQgb2YgZG9jdW1uZXRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9iaW5kT25Nb3VzZWRvd25Eb2N1bW5ldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZWRvd24nLCB0aGlzLl9wcm94eUhhbmRsZXJzLm9uTW91c2Vkb3duRG9jdW1lbnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVbmJpbmQgbW91c2Vkb3duIGV2ZW50IG9mIGRvY3VtbmV0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfdW5iaW5kT25Nb3VzZWRvd25Eb2N1bWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgICQoZG9jdW1lbnQpLm9mZignbW91c2Vkb3duJywgdGhpcy5fcHJveHlIYW5kbGVycy5vbk1vdXNlZG93bkRvY3VtZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBjbGljayBldmVudCBvZiBjYWxlbmRhclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2JpbmRPbkNsaWNrQ2FsZW5kYXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaGFuZGxlciA9IHRoaXMuX3Byb3h5SGFuZGxlcnMub25DbGlja0NhbGVuZGFyO1xuICAgICAgICB0aGlzLl8kd3JhcHBlckVsZW1lbnQuZmluZCgnLicgKyB0aGlzLl9zZWxlY3RhYmxlQ2xhc3NOYW1lKS5vbignY2xpY2snLCBoYW5kbGVyKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5iaW5kIGNsaWNrIGV2ZW50IG9mIGNhbGVuZGFyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfdW5iaW5kT25DbGlja0NhbGVuZGFyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGhhbmRsZXIgPSB0aGlzLl9wcm94eUhhbmRsZXJzLm9uQ2xpY2tDYWxlbmRhcjtcbiAgICAgICAgdGhpcy5fJHdyYXBwZXJFbGVtZW50LmZpbmQoJy4nICsgdGhpcy5fc2VsZWN0YWJsZUNsYXNzTmFtZSkub2ZmKCdjbGljaycsIGhhbmRsZXIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCaW5kIGN1c3RvbSBldmVudCBvZiBjYWxlbmRhclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2JpbmRDYWxlbmRhckN1c3RvbUV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHByb3h5SGFuZGxlcnMgPSB0aGlzLl9wcm94eUhhbmRsZXJzLFxuICAgICAgICAgICAgb25CZWZvcmVEcmF3ID0gcHJveHlIYW5kbGVycy5vbkJlZm9yZURyYXdDYWxlbmRhcixcbiAgICAgICAgICAgIG9uRHJhdyA9IHByb3h5SGFuZGxlcnMub25EcmF3Q2FsZW5kYXIsXG4gICAgICAgICAgICBvbkFmdGVyRHJhdyA9IHByb3h5SGFuZGxlcnMub25BZnRlckRyYXdDYWxlbmRhcjtcblxuICAgICAgICB0aGlzLl9jYWxlbmRhci5vbih7XG4gICAgICAgICAgICAnYmVmb3JlRHJhdyc6IG9uQmVmb3JlRHJhdyxcbiAgICAgICAgICAgICdkcmF3Jzogb25EcmF3LFxuICAgICAgICAgICAgJ2FmdGVyRHJhdyc6IG9uQWZ0ZXJEcmF3XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgIC8qKlxuICAgICogVW5iaW5kIGN1c3RvbSBldmVudCBvZiBjYWxlbmRhclxuICAgICogQHByaXZhdGVcbiAgICAqL1xuICAgIF91bmJpbmRDYWxlbmRhckN1c3RvbUV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICB2YXIgcHJveHlIYW5kbGVycyA9IHRoaXMuX3Byb3h5SGFuZGxlcnMsXG4gICAgICAgICAgIG9uQmVmb3JlRHJhdyA9IHByb3h5SGFuZGxlcnMub25CZWZvcmVEcmF3Q2FsZW5kYXIsXG4gICAgICAgICAgIG9uRHJhdyA9IHByb3h5SGFuZGxlcnMub25EcmF3Q2FsZW5kYXIsXG4gICAgICAgICAgIG9uQWZ0ZXJEcmF3ID0gcHJveHlIYW5kbGVycy5vbkFmdGVyRHJhd0NhbGVuZGFyO1xuXG4gICAgICAgdGhpcy5fY2FsZW5kYXIub2ZmKHtcbiAgICAgICAgICAgJ2JlZm9yZURyYXcnOiBvbkJlZm9yZURyYXcsXG4gICAgICAgICAgICdkcmF3Jzogb25EcmF3LFxuICAgICAgICAgICAnYWZ0ZXJEcmF3Jzogb25BZnRlckRyYXdcbiAgICAgICB9KTtcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBTZXQgcG9zaXRpb24tbGVmdCwgdG9wIG9mIGNhbGVuZGFyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHggLSBwb3NpdGlvbi1sZWZ0XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHkgLSBwb3NpdGlvbi10b3BcbiAgICAgKiBAc2luY2UgMS4xLjFcbiAgICAgKi9cbiAgICBzZXRYWTogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICB2YXIgcG9zID0gdGhpcy5fcG9zO1xuXG4gICAgICAgIHBvcy5sZWZ0ID0gdXRpbC5pc051bWJlcih4KSA/IHggOiBwb3MubGVmdDtcbiAgICAgICAgcG9zLnRvcCA9IHV0aWwuaXNOdW1iZXIoeSkgPyB5IDogcG9zLnRvcDtcbiAgICAgICAgdGhpcy5fYXJyYW5nZUxheWVyKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCB6LWluZGV4IG9mIGNhbGVuZGFyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHpJbmRleCAtIHotaW5kZXggdmFsdWVcbiAgICAgKiBAc2luY2UgMS4xLjFcbiAgICAgKi9cbiAgICBzZXRaSW5kZXg6IGZ1bmN0aW9uKHpJbmRleCkge1xuICAgICAgICBpZiAoIXV0aWwuaXNOdW1iZXIoekluZGV4KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fcG9zLnpJbmRleCA9IHpJbmRleDtcbiAgICAgICAgdGhpcy5fYXJyYW5nZUxheWVyKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGFkZCBvcGVuZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fGpRdWVyeX0gb3BlbmVyIC0gZWxlbWVudFxuICAgICAqL1xuICAgIGFkZE9wZW5lcjogZnVuY3Rpb24ob3BlbmVyKSB7XG4gICAgICAgIGlmIChpbkFycmF5KG9wZW5lciwgdGhpcy5fb3BlbmVycykgPCAwKSB7XG4gICAgICAgICAgICB0aGlzLl9vcGVuZXJzLnB1c2goJChvcGVuZXIpWzBdKTtcbiAgICAgICAgICAgICQob3BlbmVyKS5vbignY2xpY2snLCB0aGlzLl9wcm94eUhhbmRsZXJzLm9uQ2xpY2tPcGVuZXIpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJlbW92ZSBvcGVuZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBvcGVuZXIgLSBlbGVtZW50XG4gICAgICovXG4gICAgcmVtb3ZlT3BlbmVyOiBmdW5jdGlvbihvcGVuZXIpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gaW5BcnJheShvcGVuZXIsIHRoaXMuX29wZW5lcnMpO1xuXG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAkKHRoaXMuX29wZW5lcnNbaW5kZXhdKS5vZmYoJ2NsaWNrJywgdGhpcy5fcHJveHlIYW5kbGVycy5vbkNsaWNrT3BlbmVyKTtcbiAgICAgICAgICAgIHRoaXMuX29wZW5lcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPcGVuIGNhbGVuZGFyIHdpdGggYXJyYW5naW5nIHBvc2l0aW9uXG4gICAgICovXG4gICAgb3BlbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmlzT3BlbmVkKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9hcnJhbmdlTGF5ZXIoKTtcbiAgICAgICAgdGhpcy5fYmluZENhbGVuZGFyQ3VzdG9tRXZlbnQoKTtcbiAgICAgICAgdGhpcy5fYmluZE9uTW91c2Vkb3duRG9jdW1uZXQoKTtcbiAgICAgICAgdGhpcy5fY2FsZW5kYXIuZHJhdyh0aGlzLl9kYXRlLnllYXIsIHRoaXMuX2RhdGUubW9udGgsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5fJHdyYXBwZXJFbGVtZW50LnNob3coKTtcbiAgICAgICAgdGhpcy5maXJlKCdvcGVuJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENsb3NlIGNhbGVuZGFyIHdpdGggdW5iaW5kaW5nIHNvbWUgZXZlbnRzXG4gICAgICovXG4gICAgY2xvc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNPcGVuZWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3VuYmluZENhbGVuZGFyQ3VzdG9tRXZlbnQoKTtcbiAgICAgICAgdGhpcy5fdW5iaW5kT25Nb3VzZWRvd25Eb2N1bWVudCgpO1xuICAgICAgICB0aGlzLl8kd3JhcHBlckVsZW1lbnQuaGlkZSgpO1xuICAgICAgICB0aGlzLmZpcmUoJ2Nsb3NlJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBkYXRlLW9iamVjdCBvZiBjdXJyZW50IERhdGVQaWNrZXIgaW5zdGFuY2UuXG4gICAgICogQHJldHVybnMge09iamVjdH0gLSBkYXRlLW9iamVjdCBoYXZpbmcgeWVhciwgbW9udGggYW5kIGRheS1pbi1tb250aFxuICAgICAqL1xuICAgIGdldERhdGVPYmplY3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdXRpbC5leHRlbmQoe30sIHRoaXMuX2RhdGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4geWVhclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IC0geWVhclxuICAgICAqL1xuICAgIGdldFllYXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGF0ZS55ZWFyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gbW9udGhcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSAtIG1vbnRoXG4gICAgICovXG4gICAgZ2V0TW9udGg6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGF0ZS5tb250aDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGRheS1pbi1tb250aFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IC0gZGF5LWluLW1vbnRoXG4gICAgICovXG4gICAgZ2V0RGF5SW5Nb250aDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kYXRlLmRhdGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBkYXRlIGZyb20gdmFsdWVzKHllYXIsIG1vbnRoLCBkYXRlKSBhbmQgdGhlbiBmaXJlICd1cGRhdGUnIGN1c3RvbSBldmVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW3llYXJdIC0geWVhclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW21vbnRoXSAtIG1vbnRoXG4gICAgICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbZGF0ZV0gLSBkYXkgaW4gbW9udGhcbiAgICAgKi9cbiAgICBzZXREYXRlOiBmdW5jdGlvbih5ZWFyLCBtb250aCwgZGF0ZSkge1xuICAgICAgICB2YXIgZGF0ZU9iaiA9IHRoaXMuX2RhdGUsXG4gICAgICAgICAgICBuZXdEYXRlT2JqID0ge307XG5cbiAgICAgICAgbmV3RGF0ZU9iai55ZWFyID0geWVhciB8fCBkYXRlT2JqLnllYXI7XG4gICAgICAgIG5ld0RhdGVPYmoubW9udGggPSBtb250aCB8fCBkYXRlT2JqLm1vbnRoO1xuICAgICAgICBuZXdEYXRlT2JqLmRhdGUgPSBkYXRlIHx8IGRhdGVPYmouZGF0ZTtcblxuICAgICAgICBpZiAoIXRoaXMuX2lzUmVzdHJpY3RlZChuZXdEYXRlT2JqKSkge1xuICAgICAgICAgICAgdXRpbC5leHRlbmQoZGF0ZU9iaiwgbmV3RGF0ZU9iaik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc2V0VmFsdWVUb0lucHV0RWxlbWVudCgpO1xuICAgICAgICB0aGlzLl9jYWxlbmRhci5kcmF3KGRhdGVPYmoueWVhciwgZGF0ZU9iai5tb250aCwgZmFsc2UpO1xuXG4gICAgICAgIHRoaXMuZmlyZSgndXBkYXRlJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBvciB1cGRhdGUgZGF0ZS1mb3JtXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IFtmb3JtXSAtIGRhdGUtZm9ybWF0XG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAgZGF0ZXBpY2tlci5zZXREYXRlRm9ybSgneXl5eS1tbS1kZCcpO1xuICAgICAqICBkYXRlcGlja2VyLnNldERhdGVGb3JtKCdtbS1kZCwgeXl5eScpO1xuICAgICAqICBkYXRlcGlja2VyLnNldERhdGVGb3JtKCd5L20vZCcpO1xuICAgICAqICBkYXRlcGlja2VyLnNldERhdGVGb3JtKCd5eS9tbS9kZCcpO1xuICAgICAqL1xuICAgIHNldERhdGVGb3JtOiBmdW5jdGlvbihmb3JtKSB7XG4gICAgICAgIHRoaXMuX2RhdGVGb3JtID0gZm9ybSB8fCB0aGlzLl9kYXRlRm9ybTtcbiAgICAgICAgdGhpcy5fc2V0UmVnRXhwKCk7XG4gICAgICAgIHRoaXMuc2V0RGF0ZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gd2hldGhlciB0aGUgY2FsZW5kYXIgaXMgb3BlbmVkIG9yIG5vdFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSAtIHRydWUgaWYgb3BlbmVkLCBmYWxzZSBvdGhlcndpc2VcbiAgICAgKi9cbiAgICBpc09wZW5lZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl8kd3JhcHBlckVsZW1lbnQuY3NzKCdkaXNwbGF5JykgPT09ICdibG9jayc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBUaW1lUGlja2VyIGluc3RhbmNlXG4gICAgICogQHJldHVybnMge1RpbWVQaWNrZXJ9IC0gVGltZVBpY2tlciBpbnN0YW5jZVxuICAgICAqL1xuICAgIGdldFRpbWVQaWNrZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdGltZVBpY2tlcjtcbiAgICB9XG59KTtcblxudXRpbC5DdXN0b21FdmVudHMubWl4aW4oRGF0ZVBpY2tlcik7XG5cbm1vZHVsZS5leHBvcnRzID0gRGF0ZVBpY2tlcjtcblxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IG5obmVudCBvbiAxNS4gNC4gMjguLlxuICogQGZpbGVvdmVydmlldyBTcGluYm94IENvbXBvbmVudFxuICogQGF1dGhvciBOSE4gZW50IEZFIGRldiA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPiA8bWlua3l1LnlpQG5obmVudC5jb20+XG4gKiBAZGVwZW5kZW5jeSBqcXVlcnktMS44LjMsIGNvZGUtc25pcHBldC0xLjAuMlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWwgPSB0dWkudXRpbCxcbiAgICBpbkFycmF5ID0gdXRpbC5pbkFycmF5O1xuXG4vKipcbiAqIEBjb25zdHJ1Y3RvclxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfEhUTUxFbGVtZW50fSBjb250YWluZXIgLSBjb250YWluZXIgb2Ygc3BpbmJveFxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25dIC0gb3B0aW9uIGZvciBpbml0aWFsaXphdGlvblxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLmRlZmF1bHRWYWx1ZSA9IDBdIC0gaW5pdGlhbCBzZXR0aW5nIHZhbHVlXG4gKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbi5zdGVwID0gMV0gLSBpZiBzdGVwID0gMiwgdmFsdWUgOiAwIC0+IDIgLT4gNCAtPiAuLi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLm1heCA9IDkwMDcxOTkyNTQ3NDA5OTFdIC0gbWF4IHZhbHVlXG4gKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbi5taW4gPSAtOTAwNzE5OTI1NDc0MDk5MV0gLSBtaW4gdmFsdWVcbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9uLnVwQnRuVGFnID0gYnV0dG9uIEhUTUxdIC0gdXAgYnV0dG9uIGh0bWwgc3RyaW5nXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbi5kb3duQnRuVGFnID0gYnV0dG9uIEhUTUxdIC0gZG93biBidXR0b24gaHRtbCBzdHJpbmdcbiAqIEBwYXJhbSB7QXJyYXl9ICBbb3B0aW9uLmV4Y2x1c2lvbiA9IFtdXSAtIHZhbHVlIHRvIGJlIGV4Y2x1ZGVkLiBpZiB0aGlzIGlzIFsxLDNdLCAwIC0+IDIgLT4gNCAtPiA1IC0+Li4uLlxuICovXG52YXIgU3BpbmJveCA9IHV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBTcGluYm94LnByb3RvdHlwZSAqLyB7XG4gICAgaW5pdDogZnVuY3Rpb24oY29udGFpbmVyLCBvcHRpb24pIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtqUXVlcnl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl8kY29udGFpbmVyRWxlbWVudCA9ICQoY29udGFpbmVyKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge2pRdWVyeX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuXyRpbnB1dEVsZW1lbnQgPSB0aGlzLl8kY29udGFpbmVyRWxlbWVudC5maW5kKCdpbnB1dFt0eXBlPVwidGV4dFwiXScpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fdmFsdWUgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fb3B0aW9uID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge2pRdWVyeX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuXyR1cEJ1dHRvbiA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtqUXVlcnl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl8kZG93bkJ1dHRvbiA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5faW5pdGlhbGl6ZShvcHRpb24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIHdpdGggb3B0aW9uXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbiAtIE9wdGlvbiBmb3IgSW5pdGlhbGl6YXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbml0aWFsaXplOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgdGhpcy5fc2V0T3B0aW9uKG9wdGlvbik7XG4gICAgICAgIHRoaXMuX2Fzc2lnbkhUTUxFbGVtZW50cygpO1xuICAgICAgICB0aGlzLl9hc3NpZ25EZWZhdWx0RXZlbnRzKCk7XG4gICAgICAgIHRoaXMuc2V0VmFsdWUodGhpcy5fb3B0aW9uLmRlZmF1bHRWYWx1ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBhIG9wdGlvbiB0byBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb24gLSBPcHRpb24gdGhhdCB5b3Ugd2FudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldE9wdGlvbjogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIHRoaXMuX29wdGlvbiA9IHtcbiAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogMCxcbiAgICAgICAgICAgIHN0ZXA6IDEsXG4gICAgICAgICAgICBtYXg6IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSIHx8IDkwMDcxOTkyNTQ3NDA5OTEsXG4gICAgICAgICAgICBtaW46IE51bWJlci5NSU5fU0FGRV9JTlRFR0VSIHx8IC05MDA3MTk5MjU0NzQwOTkxLFxuICAgICAgICAgICAgdXBCdG5UYWc6ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIj48Yj4rPC9iPjwvYnV0dG9uPicsXG4gICAgICAgICAgICBkb3duQnRuVGFnOiAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCI+PGI+LTwvYj48L2J1dHRvbj4nXG4gICAgICAgIH07XG4gICAgICAgIHV0aWwuZXh0ZW5kKHRoaXMuX29wdGlvbiwgb3B0aW9uKTtcblxuICAgICAgICBpZiAoIXV0aWwuaXNBcnJheSh0aGlzLl9vcHRpb24uZXhjbHVzaW9uKSkge1xuICAgICAgICAgICAgdGhpcy5fb3B0aW9uLmV4Y2x1c2lvbiA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLl9pc1ZhbGlkT3B0aW9uKCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU3BpbmJveCBvcHRpb24gaXMgaW52YWlsZCcpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGlzIGEgdmFsaWQgb3B0aW9uP1xuICAgICAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc1ZhbGlkT3B0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wdCA9IHRoaXMuX29wdGlvbjtcblxuICAgICAgICByZXR1cm4gKHRoaXMuX2lzVmFsaWRWYWx1ZShvcHQuZGVmYXVsdFZhbHVlKSAmJiB0aGlzLl9pc1ZhbGlkU3RlcChvcHQuc3RlcCkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBpcyBhIHZhbGlkIHZhbHVlP1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSBmb3Igc3BpbmJveFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc1ZhbGlkVmFsdWU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHZhciBvcHQsXG4gICAgICAgICAgICBpc0JldHdlZW4sXG4gICAgICAgICAgICBpc05vdEluQXJyYXk7XG5cbiAgICAgICAgaWYgKCF1dGlsLmlzTnVtYmVyKHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgb3B0ID0gdGhpcy5fb3B0aW9uO1xuICAgICAgICBpc0JldHdlZW4gPSB2YWx1ZSA8PSBvcHQubWF4ICYmIHZhbHVlID49IG9wdC5taW47XG4gICAgICAgIGlzTm90SW5BcnJheSA9IChpbkFycmF5KHZhbHVlLCBvcHQuZXhjbHVzaW9uKSA9PT0gLTEpO1xuXG4gICAgICAgIHJldHVybiAoaXNCZXR3ZWVuICYmIGlzTm90SW5BcnJheSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGlzIGEgdmFsaWQgc3RlcD9cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RlcCBmb3Igc3BpbmJveCB1cC9kb3duXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzVmFsaWRTdGVwOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgIHZhciBtYXhTdGVwID0gKHRoaXMuX29wdGlvbi5tYXggLSB0aGlzLl9vcHRpb24ubWluKTtcblxuICAgICAgICByZXR1cm4gKHV0aWwuaXNOdW1iZXIoc3RlcCkgJiYgc3RlcCA8IG1heFN0ZXApO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBc3NpZ24gZWxlbWVudHMgdG8gaW5zaWRlIG9mIGNvbnRhaW5lci5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hc3NpZ25IVE1MRWxlbWVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9zZXRJbnB1dFNpemVBbmRNYXhMZW5ndGgoKTtcbiAgICAgICAgdGhpcy5fbWFrZUJ1dHRvbigpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNYWtlIHVwL2Rvd24gYnV0dG9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUJ1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkaW5wdXQgPSB0aGlzLl8kaW5wdXRFbGVtZW50LFxuICAgICAgICAgICAgJHVwQnRuID0gdGhpcy5fJHVwQnV0dG9uID0gJCh0aGlzLl9vcHRpb24udXBCdG5UYWcpLFxuICAgICAgICAgICAgJGRvd25CdG4gPSB0aGlzLl8kZG93bkJ1dHRvbiA9ICQodGhpcy5fb3B0aW9uLmRvd25CdG5UYWcpO1xuXG4gICAgICAgICR1cEJ0bi5pbnNlcnRCZWZvcmUoJGlucHV0KTtcbiAgICAgICAgJHVwQnRuLndyYXAoJzxkaXY+PC9kaXY+Jyk7XG4gICAgICAgICRkb3duQnRuLmluc2VydEFmdGVyKCRpbnB1dCk7XG4gICAgICAgICRkb3duQnRuLndyYXAoJzxkaXY+PC9kaXY+Jyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBzaXplL21heGxlbmd0aCBhdHRyaWJ1dGVzIG9mIGlucHV0IGVsZW1lbnQuXG4gICAgICogRGVmYXVsdCB2YWx1ZSBpcyBhIGRpZ2l0cyBvZiBhIGxvbmdlciB2YWx1ZSBvZiBvcHRpb24ubWluIG9yIG9wdGlvbi5tYXhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRJbnB1dFNpemVBbmRNYXhMZW5ndGg6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJGlucHV0ID0gdGhpcy5fJGlucHV0RWxlbWVudCxcbiAgICAgICAgICAgIG1pblZhbHVlTGVuZ3RoID0gU3RyaW5nKHRoaXMuX29wdGlvbi5taW4pLmxlbmd0aCxcbiAgICAgICAgICAgIG1heFZhbHVlTGVuZ3RoID0gU3RyaW5nKHRoaXMuX29wdGlvbi5tYXgpLmxlbmd0aCxcbiAgICAgICAgICAgIG1heGxlbmd0aCA9IE1hdGgubWF4KG1pblZhbHVlTGVuZ3RoLCBtYXhWYWx1ZUxlbmd0aCk7XG5cbiAgICAgICAgaWYgKCEkaW5wdXQuYXR0cignc2l6ZScpKSB7XG4gICAgICAgICAgICAkaW5wdXQuYXR0cignc2l6ZScsIG1heGxlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEkaW5wdXQuYXR0cignbWF4bGVuZ3RoJykpIHtcbiAgICAgICAgICAgICRpbnB1dC5hdHRyKCdtYXhsZW5ndGgnLCBtYXhsZW5ndGgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFzc2lnbiBkZWZhdWx0IGV2ZW50cyB0byB1cC9kb3duIGJ1dHRvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Fzc2lnbkRlZmF1bHRFdmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb25DbGljayA9IHV0aWwuYmluZCh0aGlzLl9vbkNsaWNrQnV0dG9uLCB0aGlzKSxcbiAgICAgICAgICAgIG9uS2V5RG93biA9IHV0aWwuYmluZCh0aGlzLl9vbktleURvd25JbnB1dEVsZW1lbnQsIHRoaXMpO1xuXG4gICAgICAgIHRoaXMuXyR1cEJ1dHRvbi5vbignY2xpY2snLCB7aXNEb3duOiBmYWxzZX0sIG9uQ2xpY2spO1xuICAgICAgICB0aGlzLl8kZG93bkJ1dHRvbi5vbignY2xpY2snLCB7aXNEb3duOiB0cnVlfSwgb25DbGljayk7XG4gICAgICAgIHRoaXMuXyRpbnB1dEVsZW1lbnQub24oJ2tleWRvd24nLCBvbktleURvd24pO1xuICAgICAgICB0aGlzLl8kaW5wdXRFbGVtZW50Lm9uKCdjaGFuZ2UnLCB1dGlsLmJpbmQodGhpcy5fb25DaGFuZ2VJbnB1dCwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgaW5wdXQgdmFsdWUgd2hlbiB1c2VyIGNsaWNrIGEgYnV0dG9uLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNEb3duIC0gSWYgYSB1c2VyIGNsaWNrZWQgYSBkb3duLWJ1dHR0b24sIHRoaXMgdmFsdWUgaXMgdHJ1ZS4gIEVsc2UgaWYgYSB1c2VyIGNsaWNrZWQgYSB1cC1idXR0b24sIHRoaXMgdmFsdWUgaXMgZmFsc2UuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0TmV4dFZhbHVlOiBmdW5jdGlvbihpc0Rvd24pIHtcbiAgICAgICAgdmFyIG9wdCA9IHRoaXMuX29wdGlvbixcbiAgICAgICAgICAgIHN0ZXAgPSBvcHQuc3RlcCxcbiAgICAgICAgICAgIG1pbiA9IG9wdC5taW4sXG4gICAgICAgICAgICBtYXggPSBvcHQubWF4LFxuICAgICAgICAgICAgZXhjbHVzaW9uID0gb3B0LmV4Y2x1c2lvbixcbiAgICAgICAgICAgIG5leHRWYWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblxuICAgICAgICBpZiAoaXNEb3duKSB7XG4gICAgICAgICAgICBzdGVwID0gLXN0ZXA7XG4gICAgICAgIH1cblxuICAgICAgICBkbyB7XG4gICAgICAgICAgICBuZXh0VmFsdWUgKz0gc3RlcDtcbiAgICAgICAgICAgIGlmIChuZXh0VmFsdWUgPiBtYXgpIHtcbiAgICAgICAgICAgICAgICBuZXh0VmFsdWUgPSBtaW47XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5leHRWYWx1ZSA8IG1pbikge1xuICAgICAgICAgICAgICAgIG5leHRWYWx1ZSA9IG1heDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSB3aGlsZSAoaW5BcnJheShuZXh0VmFsdWUsIGV4Y2x1c2lvbikgPiAtMSk7XG5cbiAgICAgICAgdGhpcy5zZXRWYWx1ZShuZXh0VmFsdWUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBET00oVXAvRG93biBidXR0b24pIENsaWNrIEV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCBldmVudC1vYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkNsaWNrQnV0dG9uOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB0aGlzLl9zZXROZXh0VmFsdWUoZXZlbnQuZGF0YS5pc0Rvd24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBET00oSW5wdXQgZWxlbWVudCkgS2V5ZG93biBFdmVudCBoYW5kbGVyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgZXZlbnQtb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25LZXlEb3duSW5wdXRFbGVtZW50OiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIga2V5Q29kZSA9IGV2ZW50LndoaWNoIHx8IGV2ZW50LmtleUNvZGUsXG4gICAgICAgICAgICBpc0Rvd247XG4gICAgICAgIHN3aXRjaCAoa2V5Q29kZSkge1xuICAgICAgICAgICAgY2FzZSAzODogaXNEb3duID0gZmFsc2U7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA0MDogaXNEb3duID0gdHJ1ZTsgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OiByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9zZXROZXh0VmFsdWUoaXNEb3duKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRE9NKElucHV0IGVsZW1lbnQpIENoYW5nZSBFdmVudCBoYW5kbGVyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25DaGFuZ2VJbnB1dDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBuZXdWYWx1ZSA9IE51bWJlcih0aGlzLl8kaW5wdXRFbGVtZW50LnZhbCgpKSxcbiAgICAgICAgICAgIGlzQ2hhbmdlID0gdGhpcy5faXNWYWxpZFZhbHVlKG5ld1ZhbHVlKSAmJiB0aGlzLl92YWx1ZSAhPT0gbmV3VmFsdWUsXG4gICAgICAgICAgICBuZXh0VmFsdWUgPSAoaXNDaGFuZ2UpID8gbmV3VmFsdWUgOiB0aGlzLl92YWx1ZTtcblxuICAgICAgICB0aGlzLl92YWx1ZSA9IG5leHRWYWx1ZTtcbiAgICAgICAgdGhpcy5fJGlucHV0RWxlbWVudC52YWwobmV4dFZhbHVlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IHN0ZXAgb2Ygc3BpbmJveFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIGZvciBzcGluYm94XG4gICAgICovXG4gICAgc2V0U3RlcDogZnVuY3Rpb24oc3RlcCkge1xuICAgICAgICBpZiAoIXRoaXMuX2lzVmFsaWRTdGVwKHN0ZXApKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fb3B0aW9uLnN0ZXAgPSBzdGVwO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBnZXQgc3RlcCBvZiBzcGluYm94XG4gICAgICogQHJldHVybnMge251bWJlcn0gc3RlcFxuICAgICAqL1xuICAgIGdldFN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9uLnN0ZXA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBhIGlucHV0IHZhbHVlLlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IERhdGEgaW4gaW5wdXQtYm94XG4gICAgICovXG4gICAgZ2V0VmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBhIHZhbHVlIHRvIGlucHV0LWJveC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBWYWx1ZSB0aGF0IHlvdSB3YW50XG4gICAgICovXG4gICAgc2V0VmFsdWU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuXyRpbnB1dEVsZW1lbnQudmFsKHZhbHVlKS5jaGFuZ2UoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGEgb3B0aW9uIG9mIGluc3RhbmNlLlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IE9wdGlvbiBvZiBpbnN0YW5jZVxuICAgICAqL1xuICAgIGdldE9wdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vcHRpb247XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCB2YWx1ZSB0aGF0IHdpbGwgYmUgZXhjbHVkZWQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gVmFsdWUgdGhhdCB3aWxsIGJlIGV4Y2x1ZGVkLlxuICAgICAqL1xuICAgIGFkZEV4Y2x1c2lvbjogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgdmFyIGV4Y2x1c2lvbiA9IHRoaXMuX29wdGlvbi5leGNsdXNpb247XG5cbiAgICAgICAgaWYgKGluQXJyYXkodmFsdWUsIGV4Y2x1c2lvbikgPiAtMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGV4Y2x1c2lvbi5wdXNoKHZhbHVlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGEgdmFsdWUgd2hpY2ggd2FzIGV4Y2x1ZGVkLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIFZhbHVlIHRoYXQgd2lsbCBiZSByZW1vdmVkIGZyb20gYSBleGNsdXNpb24gbGlzdCBvZiBpbnN0YW5jZVxuICAgICAqL1xuICAgIHJlbW92ZUV4Y2x1c2lvbjogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgdmFyIGV4Y2x1c2lvbiA9IHRoaXMuX29wdGlvbi5leGNsdXNpb24sXG4gICAgICAgICAgICBpbmRleCA9IGluQXJyYXkodmFsdWUsIGV4Y2x1c2lvbik7XG5cbiAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGV4Y2x1c2lvbi5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBnZXQgY29udGFpbmVyIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH0gZWxlbWVudFxuICAgICAqL1xuICAgIGdldENvbnRhaW5lckVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fJGNvbnRhaW5lckVsZW1lbnRbMF07XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU3BpbmJveDtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBuaG5lbnQgb24gMTUuIDQuIDMwLi5cbiAqIEBmaWxlb3ZlcnZpZXcgVGltZVBpY2tlciBDb21wb25lbnRcbiAqIEBhdXRob3IgTkhOIGVudCBGRSBkZXYgPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT4gPG1pbmt5dS55aUBuaG5lbnQuY29tPlxuICogQGRlcGVuZGVuY3kganF1ZXJ5LTEuOC4zLCBjb2RlLXNuaXBwZXQtMS4wLjIsIHNwaW5ib3guanNcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciB1dGlsID0gdHVpLnV0aWwsXG4gICAgU3BpbmJveCA9IHJlcXVpcmUoJy4vc3BpbmJveCcpLFxuICAgIHRpbWVSZWdFeHAgPSAvXFxzKihcXGR7MSwyfSlcXHMqOlxccyooXFxkezEsMn0pXFxzKihbYXBdW21dKT8oPzpbXFxzXFxTXSopL2ksXG4gICAgdGltZVBpY2tlclRhZyA9ICc8dGFibGUgY2xhc3M9XCJ0aW1lcGlja2VyXCI+PHRyIGNsYXNzPVwidGltZXBpY2tlci1yb3dcIj48L3RyPjwvdGFibGU+JyxcbiAgICBjb2x1bW5UYWcgPSAnPHRkIGNsYXNzPVwidGltZXBpY2tlci1jb2x1bW5cIj48L3RkPicsXG4gICAgc3BpbkJveFRhZyA9ICc8dGQgY2xhc3M9XCJ0aW1lcGlja2VyLWNvbHVtbiB0aW1lcGlja2VyLXNwaW5ib3hcIj48ZGl2PjxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwidGltZXBpY2tlci1zcGluYm94LWlucHV0XCI+PC9kaXY+PC90ZD4nLFxuICAgIHVwQnRuVGFnID0gJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwidGltZXBpY2tlci1idG4gdGltZXBpY2tlci1idG4tdXBcIj48Yj4rPC9iPjwvYnV0dG9uPicsXG4gICAgZG93bkJ0blRhZyA9ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cInRpbWVwaWNrZXItYnRuIHRpbWVwaWNrZXItYnRuLWRvd25cIj48Yj4tPC9iPjwvYnV0dG9uPic7XG5cbi8qKlxuICogQGNvbnN0cnVjdG9yXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25dIC0gb3B0aW9uIGZvciBpbml0aWFsaXphdGlvblxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLmRlZmF1bHRIb3VyID0gMF0gLSBpbml0aWFsIHNldHRpbmcgdmFsdWUgb2YgaG91clxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24uZGVmYXVsdE1pbnV0ZSA9IDBdIC0gaW5pdGlhbCBzZXR0aW5nIHZhbHVlIG9mIG1pbnV0ZVxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gW29wdGlvbi5pbnB1dEVsZW1lbnQgPSBudWxsXSAtIG9wdGlvbmFsIGlucHV0IGVsZW1lbnQgd2l0aCB0aW1lcGlja2VyXG4gKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbi5ob3VyU3RlcCA9IDFdIC0gc3RlcCBvZiBob3VyIHNwaW5ib3guIGlmIHN0ZXAgPSAyLCBob3VyIHZhbHVlIDEgLT4gMyAtPiA1IC0+IC4uLlxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24ubWludXRlU3RlcCA9IDFdIC0gc3RlcCBvZiBtaW51dGUgc3BpbmJveC4gaWYgc3RlcCA9IDIsIG1pbnV0ZSB2YWx1ZSAxIC0+IDMgLT4gNSAtPiAuLi5cbiAqIEBwYXJhbSB7QXJyYXl9IFtvcHRpb24uaG91ckV4Y2x1c2lvbiA9IG51bGxdIC0gaG91ciB2YWx1ZSB0byBiZSBleGNsdWRlZC4gaWYgaG91ciBbMSwzXSBpcyBleGNsdWRlZCwgaG91ciB2YWx1ZSAwIC0+IDIgLT4gNCAtPiA1IC0+IC4uLlxuICogQHBhcmFtIHtBcnJheX0gW29wdGlvbi5taW51dGVFeGNsdXNpb24gPSBudWxsXSAtIG1pbnV0ZSB2YWx1ZSB0byBiZSBleGNsdWRlZC4gaWYgbWludXRlIFsxLDNdIGlzIGV4Y2x1ZGVkLCBtaW51dGUgdmFsdWUgMCAtPiAyIC0+IDQgLT4gNSAtPiAuLi5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbi5zaG93TWVyaWRpYW4gPSBmYWxzZV0gLSBpcyB0aW1lIGV4cHJlc3Npb24tXCJoaDptbSBBTS9QTVwiP1xuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb24ucG9zaXRpb24gPSB7fV0gLSBsZWZ0LCB0b3AgcG9zaXRpb24gb2YgdGltZXBpY2tlciBlbGVtZW50XG4gKi9cbnZhciBUaW1lUGlja2VyID0gdXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFRpbWVQaWNrZXIucHJvdG90eXBlICovIHtcbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtqUXVlcnl9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLiR0aW1lUGlja2VyRWxlbWVudCA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtqUXVlcnl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl8kaW5wdXRFbGVtZW50ID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge2pRdWVyeX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuXyRtZXJpZGlhbkVsZW1lbnQgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7U3BpbmJveH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2hvdXJTcGluYm94ID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge1NwaW5ib3h9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9taW51dGVTcGluYm94ID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogdGltZSBwaWNrZXIgZWxlbWVudCBzaG93IHVwP1xuICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2lzU2hvd24gPSBmYWxzZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge09iamVjdH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX29wdGlvbiA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9ob3VyID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX21pbnV0ZSA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5faW5pdGlhbGl6ZShvcHRpb24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIHdpdGggb3B0aW9uXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbiBmb3IgdGltZSBwaWNrZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbml0aWFsaXplOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgdGhpcy5fc2V0T3B0aW9uKG9wdGlvbik7XG4gICAgICAgIHRoaXMuX21ha2VTcGluYm94ZXMoKTtcbiAgICAgICAgdGhpcy5fbWFrZVRpbWVQaWNrZXJFbGVtZW50KCk7XG4gICAgICAgIHRoaXMuX2Fzc2lnbkRlZmF1bHRFdmVudHMoKTtcbiAgICAgICAgdGhpcy5mcm9tU3BpbmJveGVzKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBvcHRpb25cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uIGZvciB0aW1lIHBpY2tlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldE9wdGlvbjogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIHRoaXMuX29wdGlvbiA9IHtcbiAgICAgICAgICAgIGRlZmF1bHRIb3VyOiAwLFxuICAgICAgICAgICAgZGVmYXVsdE1pbnV0ZTogMCxcbiAgICAgICAgICAgIGlucHV0RWxlbWVudDogbnVsbCxcbiAgICAgICAgICAgIGhvdXJTdGVwOiAxLFxuICAgICAgICAgICAgbWludXRlU3RlcDogMSxcbiAgICAgICAgICAgIGhvdXJFeGNsdXNpb246IG51bGwsXG4gICAgICAgICAgICBtaW51dGVFeGNsdXNpb246IG51bGwsXG4gICAgICAgICAgICBzaG93TWVyaWRpYW46IGZhbHNlLFxuICAgICAgICAgICAgcG9zaXRpb246IHt9XG4gICAgICAgIH07XG5cbiAgICAgICAgdXRpbC5leHRlbmQodGhpcy5fb3B0aW9uLCBvcHRpb24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBtYWtlIHNwaW5ib3hlcyAoaG91ciAmIG1pbnV0ZSlcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlU3BpbmJveGVzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wdCA9IHRoaXMuX29wdGlvbjtcblxuICAgICAgICB0aGlzLl9ob3VyU3BpbmJveCA9IG5ldyBTcGluYm94KHNwaW5Cb3hUYWcsIHtcbiAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogb3B0LmRlZmF1bHRIb3VyLFxuICAgICAgICAgICAgbWluOiAwLFxuICAgICAgICAgICAgbWF4OiAyMyxcbiAgICAgICAgICAgIHN0ZXA6IG9wdC5ob3VyU3RlcCxcbiAgICAgICAgICAgIHVwQnRuVGFnOiB1cEJ0blRhZyxcbiAgICAgICAgICAgIGRvd25CdG5UYWc6IGRvd25CdG5UYWcsXG4gICAgICAgICAgICBleGNsdXNpb246IG9wdC5ob3VyRXhjbHVzaW9uXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuX21pbnV0ZVNwaW5ib3ggPSBuZXcgU3BpbmJveChzcGluQm94VGFnLCB7XG4gICAgICAgICAgICBkZWZhdWx0VmFsdWU6IG9wdC5kZWZhdWx0TWludXRlLFxuICAgICAgICAgICAgbWluOiAwLFxuICAgICAgICAgICAgbWF4OiA1OSxcbiAgICAgICAgICAgIHN0ZXA6IG9wdC5taW51dGVTdGVwLFxuICAgICAgICAgICAgdXBCdG5UYWc6IHVwQnRuVGFnLFxuICAgICAgICAgICAgZG93bkJ0blRhZzogZG93bkJ0blRhZyxcbiAgICAgICAgICAgIGV4Y2x1c2lvbjogb3B0Lm1pbnV0ZUV4Y2x1c2lvblxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogbWFrZSB0aW1lcGlja2VyIGNvbnRhaW5lclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VUaW1lUGlja2VyRWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcHQgPSB0aGlzLl9vcHRpb24sXG4gICAgICAgICAgICAkdHAgPSAkKHRpbWVQaWNrZXJUYWcpLFxuICAgICAgICAgICAgJHRwUm93ID0gJHRwLmZpbmQoJy50aW1lcGlja2VyLXJvdycpLFxuICAgICAgICAgICAgJG1lcmlkaWFuLFxuICAgICAgICAgICAgJGNvbG9uID0gJChjb2x1bW5UYWcpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCdjb2xvbicpXG4gICAgICAgICAgICAgICAgLmFwcGVuZCgnOicpO1xuXG5cbiAgICAgICAgJHRwUm93LmFwcGVuZCh0aGlzLl9ob3VyU3BpbmJveC5nZXRDb250YWluZXJFbGVtZW50KCksICRjb2xvbiwgdGhpcy5fbWludXRlU3BpbmJveC5nZXRDb250YWluZXJFbGVtZW50KCkpO1xuXG4gICAgICAgIGlmIChvcHQuc2hvd01lcmlkaWFuKSB7XG4gICAgICAgICAgICAkbWVyaWRpYW4gPSAkKGNvbHVtblRhZylcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ21lcmlkaWFuJylcbiAgICAgICAgICAgICAgICAuYXBwZW5kKHRoaXMuX2lzUE0gPyAnUE0nIDogJ0FNJyk7XG4gICAgICAgICAgICB0aGlzLl8kbWVyaWRpYW5FbGVtZW50ID0gJG1lcmlkaWFuO1xuICAgICAgICAgICAgJHRwUm93LmFwcGVuZCgkbWVyaWRpYW4pO1xuICAgICAgICB9XG5cbiAgICAgICAgJHRwLmhpZGUoKTtcbiAgICAgICAgJCgnYm9keScpLmFwcGVuZCgkdHApO1xuICAgICAgICB0aGlzLiR0aW1lUGlja2VyRWxlbWVudCA9ICR0cDtcblxuICAgICAgICBpZiAob3B0LmlucHV0RWxlbWVudCkge1xuICAgICAgICAgICAgJHRwLmNzcygncG9zaXRpb24nLCAnYWJzb2x1dGUnKTtcbiAgICAgICAgICAgIHRoaXMuXyRpbnB1dEVsZW1lbnQgPSAkKG9wdC5pbnB1dEVsZW1lbnQpO1xuICAgICAgICAgICAgdGhpcy5fc2V0RGVmYXVsdFBvc2l0aW9uKHRoaXMuXyRpbnB1dEVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCBwb3NpdGlvbiBvZiB0aW1lcGlja2VyIGNvbnRhaW5lclxuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSAkaW5wdXQganF1ZXJ5LW9iamVjdCAoZWxlbWVudClcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXREZWZhdWx0UG9zaXRpb246IGZ1bmN0aW9uKCRpbnB1dCkge1xuICAgICAgICB2YXIgaW5wdXRFbCA9ICRpbnB1dFswXSxcbiAgICAgICAgICAgIHBvc2l0aW9uID0gdGhpcy5fb3B0aW9uLnBvc2l0aW9uLFxuICAgICAgICAgICAgeCA9IHBvc2l0aW9uLngsXG4gICAgICAgICAgICB5ID0gcG9zaXRpb24ueTtcblxuICAgICAgICBpZiAoIXV0aWwuaXNOdW1iZXIoeCkgfHwgIXV0aWwuaXNOdW1iZXIoeSkpIHtcbiAgICAgICAgICAgIHggPSBpbnB1dEVsLm9mZnNldExlZnQ7XG4gICAgICAgICAgICB5ID0gaW5wdXRFbC5vZmZzZXRUb3AgKyBpbnB1dEVsLm9mZnNldEhlaWdodCArIDM7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRYWVBvc2l0aW9uKHgsIHkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBhc3NpZ24gZGVmYXVsdCBldmVudHNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hc3NpZ25EZWZhdWx0RXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyICRpbnB1dCA9IHRoaXMuXyRpbnB1dEVsZW1lbnQ7XG5cbiAgICAgICAgaWYgKCRpbnB1dCkge1xuICAgICAgICAgICAgdGhpcy5fYXNzaWduRXZlbnRzVG9JbnB1dEVsZW1lbnQoKTtcbiAgICAgICAgICAgIHRoaXMub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICRpbnB1dC52YWwodGhpcy5nZXRUaW1lKCkpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy4kdGltZVBpY2tlckVsZW1lbnQub24oJ2NoYW5nZScsIHV0aWwuYmluZCh0aGlzLl9vbkNoYW5nZVRpbWVQaWNrZXIsIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogYXR0YWNoIGV2ZW50IHRvIElucHV0IGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hc3NpZ25FdmVudHNUb0lucHV0RWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICRpbnB1dCA9IHRoaXMuXyRpbnB1dEVsZW1lbnQ7XG5cbiAgICAgICAgJGlucHV0Lm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBzZWxmLm9wZW4oZXZlbnQpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkaW5wdXQub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCFzZWxmLnNldFRpbWVGcm9tSW5wdXRFbGVtZW50KCkpIHtcbiAgICAgICAgICAgICAgICAkaW5wdXQudmFsKHNlbGYuZ2V0VGltZSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGRvbSBldmVudCBoYW5kbGVyICh0aW1lcGlja2VyKVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uQ2hhbmdlVGltZVBpY2tlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZnJvbVNwaW5ib3hlcygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBpcyBjbGlja2VkIGluc2lkZSBvZiBjb250YWluZXI/XG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgZXZlbnQtb2JqZWN0XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzQ2xpY2tlZEluc2lkZTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyIGlzQ29udGFpbnMgPSAkLmNvbnRhaW5zKHRoaXMuJHRpbWVQaWNrZXJFbGVtZW50WzBdLCBldmVudC50YXJnZXQpLFxuICAgICAgICAgICAgaXNJbnB1dEVsZW1lbnQgPSAodGhpcy5fJGlucHV0RWxlbWVudCAmJiB0aGlzLl8kaW5wdXRFbGVtZW50WzBdID09PSBldmVudC50YXJnZXQpO1xuXG4gICAgICAgIHJldHVybiBpc0NvbnRhaW5zIHx8IGlzSW5wdXRFbGVtZW50O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiB0cmFuc2Zvcm0gdGltZSBpbnRvIGZvcm1hdHRlZCBzdHJpbmdcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0aW1lIHN0cmluZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Zvcm1Ub1RpbWVGb3JtYXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaG91ciA9IHRoaXMuX2hvdXIsXG4gICAgICAgICAgICBtaW51dGUgPSB0aGlzLl9taW51dGUsXG4gICAgICAgICAgICBwb3N0Zml4ID0gdGhpcy5fZ2V0UG9zdGZpeCgpLFxuICAgICAgICAgICAgZm9ybWF0dGVkSG91cixcbiAgICAgICAgICAgIGZvcm1hdHRlZE1pbnV0ZTtcblxuICAgICAgICBpZiAodGhpcy5fb3B0aW9uLnNob3dNZXJpZGlhbikge1xuICAgICAgICAgICAgaG91ciAlPSAxMjtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvcm1hdHRlZEhvdXIgPSAoaG91ciA8IDEwKSA/ICcwJyArIGhvdXIgOiBob3VyO1xuICAgICAgICBmb3JtYXR0ZWRNaW51dGUgPSAobWludXRlIDwgMTApID8gJzAnICsgbWludXRlIDogbWludXRlO1xuICAgICAgICByZXR1cm4gZm9ybWF0dGVkSG91ciArICc6JyArIGZvcm1hdHRlZE1pbnV0ZSArIHBvc3RmaXg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCB0aGUgYm9vbGVhbiB2YWx1ZSAnaXNQTScgd2hlbiBBTS9QTSBvcHRpb24gaXMgdHJ1ZS5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRJc1BNOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5faXNQTSA9ICh0aGlzLl9ob3VyID4gMTEpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBnZXQgcG9zdGZpeCB3aGVuIEFNL1BNIG9wdGlvbiBpcyB0cnVlLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHBvc3RmaXggKEFNL1BNKVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFBvc3RmaXg6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcG9zdGZpeCA9ICcnO1xuXG4gICAgICAgIGlmICh0aGlzLl9vcHRpb24uc2hvd01lcmlkaWFuKSB7XG4gICAgICAgICAgICBwb3N0Zml4ID0gKHRoaXMuX2lzUE0pID8gJyBQTScgOiAnIEFNJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcG9zdGZpeDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IHBvc2l0aW9uIG9mIGNvbnRhaW5lclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gaXQgd2lsbCBiZSBvZmZzZXRMZWZ0IG9mIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geSAtIGl0IHdpbGwgYmUgb2Zmc2V0VG9wIG9mIGVsZW1lbnRcbiAgICAgKi9cbiAgICBzZXRYWVBvc2l0aW9uOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIHZhciBwb3NpdGlvbjtcblxuICAgICAgICBpZiAoIXV0aWwuaXNOdW1iZXIoeCkgfHwgIXV0aWwuaXNOdW1iZXIoeSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHBvc2l0aW9uID0gdGhpcy5fb3B0aW9uLnBvc2l0aW9uO1xuICAgICAgICBwb3NpdGlvbi54ID0geDtcbiAgICAgICAgcG9zaXRpb24ueSA9IHk7XG4gICAgICAgIHRoaXMuJHRpbWVQaWNrZXJFbGVtZW50LmNzcyh7bGVmdDogeCwgdG9wOiB5fSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNob3cgdGltZSBwaWNrZXIgZWxlbWVudFxuICAgICAqL1xuICAgIHNob3c6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLiR0aW1lUGlja2VyRWxlbWVudC5zaG93KCk7XG4gICAgICAgIHRoaXMuX2lzU2hvd24gPSB0cnVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBoaWRlIHRpbWUgcGlja2VyIGVsZW1lbnRcbiAgICAgKi9cbiAgICBoaWRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy4kdGltZVBpY2tlckVsZW1lbnQuaGlkZSgpO1xuICAgICAgICB0aGlzLl9pc1Nob3duID0gZmFsc2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGxpc3RlbmVyIHRvIHNob3cgY29udGFpbmVyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgZXZlbnQtb2JqZWN0XG4gICAgICovXG4gICAgb3BlbjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzU2hvd24pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsIHV0aWwuYmluZCh0aGlzLmNsb3NlLCB0aGlzKSk7XG4gICAgICAgIHRoaXMuc2hvdygpO1xuICAgICAgICB0aGlzLmZpcmUoJ29wZW4nLCBldmVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGxpc3RlbmVyIHRvIGhpZGUgY29udGFpbmVyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgZXZlbnQtb2JqZWN0XG4gICAgICovXG4gICAgY2xvc2U6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmICghdGhpcy5faXNTaG93biB8fCB0aGlzLl9pc0NsaWNrZWRJbnNpZGUoZXZlbnQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAkKGRvY3VtZW50KS5vZmYoZXZlbnQpO1xuICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICAgICAgdGhpcy5maXJlKCdjbG9zZScsIGV2ZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IHZhbHVlcyBpbiBzcGluYm94ZXMgZnJvbSB0aW1lXG4gICAgICovXG4gICAgdG9TcGluYm94ZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaG91ciA9IHRoaXMuX2hvdXIsXG4gICAgICAgICAgICBtaW51dGUgPSB0aGlzLl9taW51dGU7XG5cbiAgICAgICAgdGhpcy5faG91clNwaW5ib3guc2V0VmFsdWUoaG91cik7XG4gICAgICAgIHRoaXMuX21pbnV0ZVNwaW5ib3guc2V0VmFsdWUobWludXRlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IHRpbWUgZnJvbSBzcGluYm94ZXMgdmFsdWVzXG4gICAgICovXG4gICAgZnJvbVNwaW5ib3hlczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBob3VyID0gdGhpcy5faG91clNwaW5ib3guZ2V0VmFsdWUoKSxcbiAgICAgICAgICAgIG1pbnV0ZSA9IHRoaXMuX21pbnV0ZVNwaW5ib3guZ2V0VmFsdWUoKTtcblxuICAgICAgICB0aGlzLnNldFRpbWUoaG91ciwgbWludXRlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IHRpbWUgZnJvbSBpbnB1dCBlbGVtZW50LlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR8alF1ZXJ5fSBbaW5wdXRFbGVtZW50XSBqcXVlcnkgb2JqZWN0IChlbGVtZW50KVxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHJlc3VsdCBvZiBzZXQgdGltZVxuICAgICAqL1xuICAgIHNldFRpbWVGcm9tSW5wdXRFbGVtZW50OiBmdW5jdGlvbihpbnB1dEVsZW1lbnQpIHtcbiAgICAgICAgdmFyIGlucHV0ID0gJChpbnB1dEVsZW1lbnQpWzBdIHx8IHRoaXMuXyRpbnB1dEVsZW1lbnRbMF07XG4gICAgICAgIHJldHVybiAhIShpbnB1dCAmJiB0aGlzLnNldFRpbWVGcm9tU3RyaW5nKGlucHV0LnZhbHVlKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCBob3VyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhvdXIgZm9yIHRpbWUgcGlja2VyXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gcmVzdWx0IG9mIHNldCB0aW1lXG4gICAgICovXG4gICAgc2V0SG91cjogZnVuY3Rpb24oaG91cikge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRUaW1lKGhvdXIsIHRoaXMuX21pbnV0ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCBtaW51dGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWludXRlIGZvciB0aW1lIHBpY2tlclxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHJlc3VsdCBvZiBzZXQgdGltZVxuICAgICAqL1xuICAgIHNldE1pbnV0ZTogZnVuY3Rpb24obWludXRlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldFRpbWUodGhpcy5faG91ciwgbWludXRlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IHRpbWVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaG91ciBmb3IgdGltZSBwaWNrZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWludXRlIGZvciB0aW1lIHBpY2tlclxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHJlc3VsdCBvZiBzZXQgdGltZVxuICAgICAqL1xuICAgIHNldFRpbWU6IGZ1bmN0aW9uKGhvdXIsIG1pbnV0ZSkge1xuICAgICAgICB2YXIgaXNOdW1iZXIgPSAodXRpbC5pc051bWJlcihob3VyKSAmJiB1dGlsLmlzTnVtYmVyKG1pbnV0ZSkpLFxuICAgICAgICAgICAgaXNDaGFuZ2UgPSAodGhpcy5faG91ciAhPT0gaG91ciB8fCB0aGlzLl9taW51dGUgIT09IG1pbnV0ZSksXG4gICAgICAgICAgICBpc1ZhbGlkID0gKGhvdXIgPCAyNCAmJiBtaW51dGUgPCA2MCk7XG5cbiAgICAgICAgaWYgKCFpc051bWJlciB8fCAhaXNDaGFuZ2UgfHwgIWlzVmFsaWQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2hvdXIgPSBob3VyO1xuICAgICAgICB0aGlzLl9taW51dGUgPSBtaW51dGU7XG4gICAgICAgIHRoaXMuX3NldElzUE0oKTtcbiAgICAgICAgdGhpcy50b1NwaW5ib3hlcygpO1xuICAgICAgICBpZiAodGhpcy5fJG1lcmlkaWFuRWxlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5fJG1lcmlkaWFuRWxlbWVudC5odG1sKHRoaXMuX2dldFBvc3RmaXgoKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5maXJlKCdjaGFuZ2UnKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCB0aW1lIGZyb20gdGltZS1zdHJpbmdcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGltZVN0cmluZyB0aW1lLXN0cmluZ1xuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHJlc3VsdCBvZiBzZXQgdGltZVxuICAgICAqL1xuICAgIHNldFRpbWVGcm9tU3RyaW5nOiBmdW5jdGlvbih0aW1lU3RyaW5nKSB7XG4gICAgICAgIHZhciBob3VyLFxuICAgICAgICAgICAgbWludXRlLFxuICAgICAgICAgICAgcG9zdGZpeCxcbiAgICAgICAgICAgIGlzUE07XG5cbiAgICAgICAgaWYgKHRpbWVSZWdFeHAudGVzdCh0aW1lU3RyaW5nKSkge1xuICAgICAgICAgICAgaG91ciA9IE51bWJlcihSZWdFeHAuJDEpO1xuICAgICAgICAgICAgbWludXRlID0gTnVtYmVyKFJlZ0V4cC4kMik7XG4gICAgICAgICAgICBwb3N0Zml4ID0gUmVnRXhwLiQzLnRvVXBwZXJDYXNlKCk7XG5cbiAgICAgICAgICAgIGlmIChob3VyIDwgMjQgJiYgdGhpcy5fb3B0aW9uLnNob3dNZXJpZGlhbikge1xuICAgICAgICAgICAgICAgIGlmIChwb3N0Zml4ID09PSAnUE0nKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzUE0gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocG9zdGZpeCA9PT0gJ0FNJykge1xuICAgICAgICAgICAgICAgICAgICBpc1BNID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaXNQTSA9IHRoaXMuX2lzUE07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGlzUE0pIHtcbiAgICAgICAgICAgICAgICAgICAgaG91ciArPSAxMjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0VGltZShob3VyLCBtaW51dGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgc3RlcCBvZiBob3VyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0ZXAgZm9yIHRpbWUgcGlja2VyXG4gICAgICovXG4gICAgc2V0SG91clN0ZXA6IGZ1bmN0aW9uKHN0ZXApIHtcbiAgICAgICAgdGhpcy5faG91clNwaW5ib3guc2V0U3RlcChzdGVwKTtcbiAgICAgICAgdGhpcy5fb3B0aW9uLmhvdXJTdGVwID0gdGhpcy5faG91clNwaW5ib3guZ2V0U3RlcCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgc3RlcCBvZiBtaW51dGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RlcCBmb3IgdGltZSBwaWNrZXJcbiAgICAgKi9cbiAgICBzZXRNaW51dGVTdGVwOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgIHRoaXMuX21pbnV0ZVNwaW5ib3guc2V0U3RlcChzdGVwKTtcbiAgICAgICAgdGhpcy5fb3B0aW9uLm1pbnV0ZVN0ZXAgPSB0aGlzLl9taW51dGVTcGluYm94LmdldFN0ZXAoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogYWRkIGEgc3BlY2lmaWMgaG91ciB0byBleGNsdWRlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhvdXIgZm9yIGV4Y2x1c2lvblxuICAgICAqL1xuICAgIGFkZEhvdXJFeGNsdXNpb246IGZ1bmN0aW9uKGhvdXIpIHtcbiAgICAgICAgdGhpcy5faG91clNwaW5ib3guYWRkRXhjbHVzaW9uKGhvdXIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBhZGQgYSBzcGVjaWZpYyBtaW51dGUgdG8gZXhjbHVkZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW51dGUgZm9yIGV4Y2x1c2lvblxuICAgICAqL1xuICAgIGFkZE1pbnV0ZUV4Y2x1c2lvbjogZnVuY3Rpb24obWludXRlKSB7XG4gICAgICAgIHRoaXMuX21pbnV0ZVNwaW5ib3guYWRkRXhjbHVzaW9uKG1pbnV0ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGdldCBzdGVwIG9mIGhvdXJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBob3VyIHVwL2Rvd24gc3RlcFxuICAgICAqL1xuICAgIGdldEhvdXJTdGVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbi5ob3VyU3RlcDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogZ2V0IHN0ZXAgb2YgbWludXRlXG4gICAgICogQHJldHVybnMge251bWJlcn0gbWludXRlIHVwL2Rvd24gc3RlcFxuICAgICAqL1xuICAgIGdldE1pbnV0ZVN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9uLm1pbnV0ZVN0ZXA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJlbW92ZSBob3VyIGZyb20gZXhjbHVzaW9uIGxpc3RcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaG91ciB0aGF0IHlvdSB3YW50IHRvIHJlbW92ZVxuICAgICAqL1xuICAgIHJlbW92ZUhvdXJFeGNsdXNpb246IGZ1bmN0aW9uKGhvdXIpIHtcbiAgICAgICAgdGhpcy5faG91clNwaW5ib3gucmVtb3ZlRXhjbHVzaW9uKGhvdXIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZW1vdmUgbWludXRlIGZyb20gZXhjbHVzaW9uIGxpc3RcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWludXRlIHRoYXQgeW91IHdhbnQgdG8gcmVtb3ZlXG4gICAgICovXG4gICAgcmVtb3ZlTWludXRlRXhjbHVzaW9uOiBmdW5jdGlvbihtaW51dGUpIHtcbiAgICAgICAgdGhpcy5fbWludXRlU3BpbmJveC5yZW1vdmVFeGNsdXNpb24obWludXRlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogZ2V0IGhvdXJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBob3VyXG4gICAgICovXG4gICAgZ2V0SG91cjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ob3VyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBnZXQgbWludXRlXG4gICAgICogQHJldHVybnMge251bWJlcn0gbWludXRlXG4gICAgICovXG4gICAgZ2V0TWludXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21pbnV0ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogZ2V0IHRpbWVcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSAnaGg6bW0gKEFNL1BNKSdcbiAgICAgKi9cbiAgICBnZXRUaW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Zvcm1Ub1RpbWVGb3JtYXQoKTtcbiAgICB9XG59KTtcbnR1aS51dGlsLkN1c3RvbUV2ZW50cy5taXhpbihUaW1lUGlja2VyKTtcblxubW9kdWxlLmV4cG9ydHMgPSBUaW1lUGlja2VyO1xuXG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVXRpbHMgZm9yIGNhbGVuZGFyIGNvbXBvbmVudFxuICogQGF1dGhvciBOSE4gTmV0LiBGRSBkZXYgdGVhbS4gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqIEBkZXBlbmRlbmN5IG5lLWNvZGUtc25pcHBldCB+MS4wLjJcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXRpbHMgb2YgY2FsZW5kYXJcbiAqIEBuYW1lc3BhY2UgdXRpbHNcbiAqL1xudmFyIHV0aWxzID0ge1xuICAgIC8qKlxuICAgICAqIFJldHVybiBkYXRlIGhhc2ggYnkgcGFyYW1ldGVyLlxuICAgICAqICBpZiB0aGVyZSBhcmUgMyBwYXJhbWV0ZXIsIHRoZSBwYXJhbWV0ZXIgaXMgY29yZ25pemVkIERhdGUgb2JqZWN0XG4gICAgICogIGlmIHRoZXJlIGFyZSBubyBwYXJhbWV0ZXIsIHJldHVybiB0b2RheSdzIGhhc2ggZGF0ZVxuICAgICAqIEBmdW5jdGlvbiBnZXREYXRlSGFzaFRhYmxlXG4gICAgICogQG1lbWJlcm9mIHV0aWxzXG4gICAgICogQHBhcmFtIHtEYXRlfG51bWJlcn0gW3llYXJdIEEgZGF0ZSBpbnN0YW5jZSBvciB5ZWFyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFttb250aF0gQSBtb250aFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbZGF0ZV0gQSBkYXRlXG4gICAgICogQHJldHVybnMge3t5ZWFyOiAqLCBtb250aDogKiwgZGF0ZTogKn19IFxuICAgICAqL1xuICAgIGdldERhdGVIYXNoVGFibGU6IGZ1bmN0aW9uKHllYXIsIG1vbnRoLCBkYXRlKSB7XG4gICAgICAgIHZhciBuRGF0ZTtcblxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgICAgIG5EYXRlID0gYXJndW1lbnRzWzBdIHx8IG5ldyBEYXRlKCk7XG5cbiAgICAgICAgICAgIHllYXIgPSBuRGF0ZS5nZXRGdWxsWWVhcigpO1xuICAgICAgICAgICAgbW9udGggPSBuRGF0ZS5nZXRNb250aCgpICsgMTtcbiAgICAgICAgICAgIGRhdGUgPSBuRGF0ZS5nZXREYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeWVhcjogeWVhcixcbiAgICAgICAgICAgIG1vbnRoOiBtb250aCxcbiAgICAgICAgICAgIGRhdGU6IGRhdGVcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRvZGF5IHRoYXQgc2F2ZWQgb24gY29tcG9uZW50IG9yIGNyZWF0ZSBuZXcgZGF0ZS5cbiAgICAgKiBAZnVuY3Rpb24gZ2V0VG9kYXlcbiAgICAgKiBAcmV0dXJucyB7e3llYXI6ICosIG1vbnRoOiAqLCBkYXRlOiAqfX1cbiAgICAgKiBAbWVtYmVyb2YgdXRpbHNcbiAgICAgKi9cbiAgICBnZXRUb2RheTogZnVuY3Rpb24oKSB7XG4gICAgICAgcmV0dXJuIHV0aWxzLmdldERhdGVIYXNoVGFibGUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHdlZWtzIGNvdW50IGJ5IHBhcmFtZW50ZXJcbiAgICAgKiBAZnVuY3Rpb24gZ2V0V2Vla3NcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geWVhciBBIHllYXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbW9udGggQSBtb250aFxuICAgICAqIEByZXR1cm4ge251bWJlcn0g7KO8ICg0fjYpXG4gICAgICogQG1lbWJlcm9mIHV0aWxzXG4gICAgICoqL1xuICAgIGdldFdlZWtzOiBmdW5jdGlvbih5ZWFyLCBtb250aCkge1xuICAgICAgICB2YXIgZmlyc3REYXkgPSB0aGlzLmdldEZpcnN0RGF5KHllYXIsIG1vbnRoKSxcbiAgICAgICAgICAgIGxhc3REYXRlID0gdGhpcy5nZXRMYXN0RGF0ZSh5ZWFyLCBtb250aCk7XG5cbiAgICAgICAgcmV0dXJuIE1hdGguY2VpbCgoZmlyc3REYXkgKyBsYXN0RGF0ZSkgLyA3KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHVuaXggdGltZSBmcm9tIGRhdGUgaGFzaFxuICAgICAqIEBmdW5jdGlvbiBnZXRUaW1lXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGUgQSBkYXRlIGhhc2hcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGF0ZS55ZWFyIEEgeWVhclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBkYXRlLm1vbnRoIEEgbW9udGhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGF0ZS5kYXRlIEEgZGF0ZVxuICAgICAqIEByZXR1cm4ge251bWJlcn0gXG4gICAgICogQG1lbWJlcm9mIHV0aWxzXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB1dGlscy5nZXRUaW1lKHt5ZWFyOjIwMTAsIG1vbnRoOjUsIGRhdGU6MTJ9KTsgLy8gMTI3MzU5MDAwMDAwMFxuICAgICAqKi9cbiAgICBnZXRUaW1lOiBmdW5jdGlvbihkYXRlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldERhdGVPYmplY3QoZGF0ZSkuZ2V0VGltZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgd2hpY2ggZGF5IGlzIGZpcnN0IGJ5IHBhcmFtZXRlcnMgdGhhdCBpbmNsdWRlIHllYXIgYW5kIG1vbnRoIGluZm9ybWF0aW9uLlxuICAgICAqIEBmdW5jdGlvbiBnZXRGaXJzdERheVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5ZWFyIEEgeWVhclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtb250aCBBIG1vbnRoXG4gICAgICogQHJldHVybiB7bnVtYmVyfSAoMH42KVxuICAgICAqIEBtZW1iZXJvZiB1dGlsc1xuICAgICAqKi9cbiAgICBnZXRGaXJzdERheTogZnVuY3Rpb24oeWVhciwgbW9udGgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHllYXIsIG1vbnRoIC0gMSwgMSkuZ2V0RGF5KCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB3aGljaCBkYXkgaXMgbGFzdCBieSBwYXJhbWV0ZXJzIHRoYXQgaW5jbHVkZSB5ZWFyIGFuZCBtb250aCBpbmZvcm1hdGlvbi5cbiAgICAgKiBAZnVuY3Rpb24gZ2V0TGFzdERheVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5ZWFyIEEgeWVhclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtb250aCBBIG1vbnRoXG4gICAgICogQHJldHVybiB7bnVtYmVyfSAoMH42KVxuICAgICAqIEBtZW1iZXJvZiB1dGlsc1xuICAgICAqKi9cbiAgICBnZXRMYXN0RGF5OiBmdW5jdGlvbih5ZWFyLCBtb250aCkge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoeWVhciwgbW9udGgsIDApLmdldERheSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgbGFzdCBkYXRlIGJ5IHBhcmFtZXRlcnMgdGhhdCBpbmNsdWRlIHllYXIgYW5kIG1vbnRoIGluZm9ybWF0aW9uLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5ZWFyIEEgeWVhclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtb250aCBBIG1vbnRoXG4gICAgICogQHJldHVybiB7bnVtYmVyfSAoMX4zMSlcbiAgICAgKiBAbWVtYmVyb2YgdXRpbHNcbiAgICAgKiovXG4gICAgZ2V0TGFzdERhdGU6IGZ1bmN0aW9uKHllYXIsIG1vbnRoKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgMCkuZ2V0RGF0ZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZGF0ZSBpbnN0YW5jZS5cbiAgICAgKiBAZnVuY3Rpb24gZ2V0RGF0ZU9iamVjdFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRlIEEgZGF0ZSBoYXNoXG4gICAgICogQHJldHVybiB7RGF0ZX0gRGF0ZSAgXG4gICAgICogQG1lbWJlcm9mIHV0aWxzXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAgdXRpbHMuZ2V0RGF0ZU9iamVjdCh7eWVhcjoyMDEwLCBtb250aDo1LCBkYXRlOjEyfSk7XG4gICAgICogIHV0aWxzLmdldERhdGVPYmplY3QoMjAxMCwgNSwgMTIpOyAvL3llYXIsbW9udGgsZGF0ZVxuICAgICAqKi9cbiAgICBnZXREYXRlT2JqZWN0OiBmdW5jdGlvbihkYXRlKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGUoYXJndW1lbnRzWzBdLCBhcmd1bWVudHNbMV0gLSAxLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShkYXRlLnllYXIsIGRhdGUubW9udGggLSAxLCBkYXRlLmRhdGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcmVsYXRlZCBkYXRlIGhhc2ggd2l0aCBwYXJhbWV0ZXJzIHRoYXQgaW5jbHVkZSBkYXRlIGluZm9ybWF0aW9uLlxuICAgICAqIEBmdW5jdGlvbiBnZXRSZWxhdGl2ZURhdGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geWVhciBBIHJlbGF0ZWQgdmFsdWUgZm9yIHllYXIoeW91IGNhbiB1c2UgKy8tKVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtb250aCBBIHJlbGF0ZWQgdmFsdWUgZm9yIG1vbnRoICh5b3UgY2FuIHVzZSArLy0pXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGRhdGUgQSByZWxhdGVkIHZhbHVlIGZvciBkYXkgKHlvdSBjYW4gdXNlICsvLSlcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0ZU9iaiBzdGFuZGFyZCBkYXRlIGhhc2hcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IGRhdGVPYmogXG4gICAgICogQG1lbWJlcm9mIHV0aWxzXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAgdXRpbHMuZ2V0UmVsYXRpdmVEYXRlKDEsIDAsIDAsIHt5ZWFyOjIwMDAsIG1vbnRoOjEsIGRhdGU6MX0pOyAvLyB7eWVhcjoyMDAxLCBtb250aDoxLCBkYXRlOjF9XG4gICAgICogIHV0aWxzLmdldFJlbGF0aXZlRGF0ZSgwLCAwLCAtMSwge3llYXI6MjAxMCwgbW9udGg6MSwgZGF0ZToxfSk7IC8vIHt5ZWFyOjIwMDksIG1vbnRoOjEyLCBkYXRlOjMxfVxuICAgICAqKi9cbiAgICBnZXRSZWxhdGl2ZURhdGU6IGZ1bmN0aW9uKHllYXIsIG1vbnRoLCBkYXRlLCBkYXRlT2JqKSB7XG4gICAgICAgIHZhciBuWWVhciA9IChkYXRlT2JqLnllYXIgKyB5ZWFyKSxcbiAgICAgICAgICAgIG5Nb250aCA9IChkYXRlT2JqLm1vbnRoICsgbW9udGggLSAxKSxcbiAgICAgICAgICAgIG5EYXRlID0gKGRhdGVPYmouZGF0ZSArIGRhdGUpLFxuICAgICAgICAgICAgbkRhdGVPYmogPSBuZXcgRGF0ZShuWWVhciwgbk1vbnRoLCBuRGF0ZSk7XG5cbiAgICAgICAgcmV0dXJuIHV0aWxzLmdldERhdGVIYXNoVGFibGUobkRhdGVPYmopO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbHM7XG4iXX0=
