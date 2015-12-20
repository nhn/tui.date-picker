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
     * @api
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
     * @api
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
     * @api
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
     * @api
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
     * @api
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
     */
    close: function() {
        if (!this.isOpened()) {
            return;
        }
        this._unbindCalendarCustomEvent();
        this._unbindOnMousedownDocument();
        this._$wrapperElement.hide();

        /**
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
     */
    getDateObject: function() {
        return util.extend({}, this._date);
    },

    /**
     * Return year
     * @api
     * @returns {number} - year
     */
    getYear: function() {
        return this._date.year;
    },

    /**
     * Return month
     * @api
     * @returns {number} - month
     */
    getMonth: function() {
        return this._date.month;
    },

    /**
     * Return day-in-month
     * @api
     * @returns {number} - day-in-month
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
     * @api
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
     * @api
     * @returns {boolean} - true if opened, false otherwise
     */
    isOpened: function() {
        return this._$wrapperElement.css('display') === 'block';
    },

    /**
     * Return TimePicker instance
     * @api
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9kYXRlcGlja2VyLmpzIiwic3JjL3NwaW5ib3guanMiLCJzcmMvdGltZXBpY2tlci5qcyIsInNyYy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeCtCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsV0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMWpCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInR1aS51dGlsLmRlZmluZU5hbWVzcGFjZSgndHVpLmNvbXBvbmVudC5TcGluYm94JywgcmVxdWlyZSgnLi9zcmMvc3BpbmJveCcpKTtcbnR1aS51dGlsLmRlZmluZU5hbWVzcGFjZSgndHVpLmNvbXBvbmVudC5UaW1lUGlja2VyJywgcmVxdWlyZSgnLi9zcmMvdGltZXBpY2tlcicpKTtcbnR1aS51dGlsLmRlZmluZU5hbWVzcGFjZSgndHVpLmNvbXBvbmVudC5EYXRlUGlja2VyJywgcmVxdWlyZSgnLi9zcmMvZGF0ZXBpY2tlcicpKTtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBuaG5lbnQgb24gMTUuIDUuIDE0Li5cbiAqIEBmaWxlb3ZlcnZpZXcgVGhpcyBjb21wb25lbnQgcHJvdmlkZXMgYSBjYWxlbmRhciBmb3IgcGlja2luZyBhIGRhdGUgJiB0aW1lLlxuICogQGF1dGhvciBOSE4gZW50IEZFIGRldiA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPiA8bWlua3l1LnlpQG5obmVudC5jb20+XG4gKiBAZGVwZW5kZW5jeSBqcXVlcnktMS44LjMsIGNvZGUtc25pcHBldC0xLjAuMiwgY29tcG9uZW50LWNhbGVuZGFyLTEuMC4xLCB0aW1lUGlja2VyLmpzXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciB1dGlsID0gdHVpLnV0aWwsXG4gICAgaW5BcnJheSA9IHV0aWwuaW5BcnJheSxcbiAgICBmb3JtYXRSZWdFeHAgPSAveXl5eXx5eXxtbXxtfGRkfGQvZ2ksXG4gICAgbWFwRm9yQ29udmVydGluZyA9IHtcbiAgICAgICAgeXl5eToge2V4cHJlc3Npb246ICcoXFxcXGR7NH18XFxcXGR7Mn0pJywgdHlwZTogJ3llYXInfSxcbiAgICAgICAgeXk6IHtleHByZXNzaW9uOiAnKFxcXFxkezR9fFxcXFxkezJ9KScsIHR5cGU6ICd5ZWFyJ30sXG4gICAgICAgIHk6IHtleHByZXNzaW9uOiAnKFxcXFxkezR9fFxcXFxkezJ9KScsIHR5cGU6ICd5ZWFyJ30sXG4gICAgICAgIG1tOiB7ZXhwcmVzc2lvbjogJygxWzAxMl18MFsxLTldfFsxLTldXFxcXGIpJywgdHlwZTogJ21vbnRoJ30sXG4gICAgICAgIG06IHtleHByZXNzaW9uOiAnKDFbMDEyXXwwWzEtOV18WzEtOV1cXFxcYiknLCB0eXBlOiAnbW9udGgnfSxcbiAgICAgICAgZGQ6IHtleHByZXNzaW9uOiAnKFsxMl1cXFxcZHsxfXwzWzAxXXwwWzEtOV18WzEtOV1cXFxcYiknLCB0eXBlOiAnZGF0ZSd9LFxuICAgICAgICBkOiB7ZXhwcmVzc2lvbjogJyhbMTJdXFxcXGR7MX18M1swMV18MFsxLTldfFsxLTldXFxcXGIpJywgdHlwZTogJ2RhdGUnfVxuICAgIH0sXG4gICAgQ09OU1RBTlRTID0ge1xuICAgICAgICBtaW5ZZWFyOiAxOTcwLFxuICAgICAgICBtYXhZZWFyOiAyOTk5LFxuICAgICAgICBtb250aERheXM6IFswLCAzMSwgMjgsIDMxLCAzMCwgMzEsIDMwLCAzMSwgMzEsIDMwLCAzMSwgMzAsIDMxXSxcbiAgICAgICAgd3JhcHBlclRhZzogJzxkaXYgc3R5bGU9XCJwb3NpdGlvbjphYnNvbHV0ZTtcIj48L2Rpdj4nLFxuICAgICAgICBkZWZhdWx0Q2VudHVyeTogJzIwJyxcbiAgICAgICAgc2VsZWN0YWJsZUNsYXNzTmFtZTogJ3NlbGVjdGFibGUnLFxuICAgICAgICBzZWxlY3RlZENsYXNzTmFtZTogJ3NlbGVjdGVkJ1xuICAgIH07XG5cbi8qKlxuICogQ3JlYXRlIERhdGVQaWNrZXI8YnI+XG4gKiBZb3UgY2FuIGdldCBhIGRhdGUgZnJvbSAnZ2V0WWVhcicsICdnZXRNb250aCcsICdnZXREYXlJbk1vbnRoJywgJ2dldERhdGVPYmplY3QnXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb24gLSBvcHRpb25zIGZvciBEYXRlUGlja2VyXG4gKiAgICAgIEBwYXJhbSB7SFRNTEVsZW1lbnR8c3RyaW5nfSBvcHRpb24uZWxlbWVudCAtIGlucHV0IGVsZW1lbnQob3Igc2VsZWN0b3IpIG9mIERhdGVQaWNrZXJcbiAqICAgICAgQHBhcmFtIHtPYmplY3R9IFtvcHRpb24uZGF0ZSA9IHRvZGF5XSAtIGluaXRpYWwgZGF0ZSBvYmplY3RcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLmRhdGUueWVhcl0gLSB5ZWFyXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gW29wdGlvbi5kYXRlLm1vbnRoXSAtIG1vbnRoXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gW29wdGlvbi5kYXRlLmRhdGVdIC0gZGF5IGluIG1vbnRoXG4gKiAgICAgIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9uLmRhdGVGb3JtID0gJ3l5eXktbW0tZGQnXSAtIGZvcm1hdCBvZiBkYXRlIHN0cmluZ1xuICogICAgICBAcGFyYW0ge3N0cmluZ30gW29wdGlvbi5kZWZhdWx0Q2VudHVyeSA9IDIwXSAtIGlmIHllYXItZm9ybWF0IGlzIHl5LCB0aGlzIHZhbHVlIGlzIHByZXBlbmRlZCBhdXRvbWF0aWNhbGx5LlxuICogICAgICBAcGFyYW0ge3N0cmluZ30gW29wdGlvbi5zZWxlY3RhYmxlQ2xhc3NOYW1lID0gJ3NlbGVjdGFibGUnXSAtIGZvciBzZWxlY3RhYmxlIGRhdGUgZWxlbWVudHNcbiAqICAgICAgQHBhcmFtIHtzdHJpbmd9IFtvcHRpb24uc2VsZWN0ZWRDbGFzc05hbWUgPSAnc2VsZWN0ZWQnXSAtIGZvciBzZWxlY3RlZCBkYXRlIGVsZW1lbnRcbiAqICAgICAgQHBhcmFtIHtPYmplY3R9IFtvcHRpb24uc3RhcnREYXRlXSAtIHN0YXJ0IGRhdGUgaW4gY2FsZW5kYXJcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLnN0YXJ0RGF0ZS55ZWFyXSAtIHllYXJcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLnN0YXJ0RGF0ZS5tb250aF0gLSBtb250aFxuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24uc3RhcnREYXRlLmRhdGVdIC0gZGF5IGluIG1vbnRoXG4gKiAgICAgIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uLmVuZERhdGVdIC0gbGFzdCBkYXRlIGluIGNhbGVuZGFyXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gW29wdGlvbi5lbmREYXRlLnllYXJdIC0geWVhclxuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24uZW5kRGF0ZS5tb250aF0gLSBtb250aFxuICogICAgICAgICAgQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24uZW5kRGF0ZS5kYXRlXSAtIGRheSBpbiBtb250aFxuICogICAgICBAcGFyYW0ge09iamVjdH0gW29wdGlvbi5wb3NdIC0gY2FsZW5kYXIgcG9zaXRpb24gc3R5bGUgdmxhdWVcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLnBvcy5sZWZ0XSAtIHBvc2l0aW9uIGxlZnQgb2YgY2FsZW5kYXJcbiAqICAgICAgICAgIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLnBvcy50b3BdIC0gcG9zaXRpb24gdG9wIG9mIGNhbGVuZGFyXG4gKiAgICAgICAgICBAcGFyYW0ge251bWJlcn0gW29wdGlvbi5wb3MuekluZGV4XSAtIHotaW5kZXggb2YgY2FsZW5kYXJcbiAqICAgICAgQHBhcmFtIHtPYmplY3R9IFtvcHRpb24ub3BlbmVycyA9IFtlbGVtZW50XV0gLSBvcGVuZXIgYnV0dG9uIGxpc3QgKGV4YW1wbGUgLSBpY29uLCBidXR0b24sIGV0Yy4pXG4gKiAgICAgIEBwYXJhbSB7dHVpLmNvbXBvbmVudC5UaW1lUGlja2VyfSBbb3B0aW9uLnRpbWVQaWNrZXJdIC0gVGltZVBpY2tlciBpbnN0YW5jZVxuICogQHBhcmFtIHt0dWkuY29tcG9uZW50LkNhbGVuZGFyfSBjYWxlbmRhciAtIENhbGVuZGFyIGluc3RhbmNlXG4gKiBAZXhhbXBsZVxuICogICB2YXIgY2FsZW5kYXIgPSBuZXcgdHVpLmNvbXBvbmVudC5DYWxlbmRhcih7XG4gKiAgICAgICBlbGVtZW50OiAnI2xheWVyJyxcbiAqICAgICAgIHRpdGxlRm9ybWF0OiAneXl5eeuFhCBt7JuUJyxcbiAqICAgICAgIHRvZGF5Rm9ybWF0OiAneXl5eeuFhCBtbeyblCBkZOydvCAoRCknXG4gKiAgIH0pO1xuICpcbiAqICAgdmFyIHRpbWVQaWNrZXIgPSBuZXcgdHVpLmNvbXBvbmVudC5UaW1lUGlja2VyKHtcbiAqICAgICAgIHNob3dNZXJpZGlhbjogdHJ1ZSxcbiAqICAgICAgIGRlZmF1bHRIb3VyOiAxMyxcbiAqICAgICAgIGRlZmF1bHRNaW51dGU6IDI0XG4gKiAgIH0pO1xuICpcbiAqICAgdmFyIHBpY2tlcjEgPSBuZXcgdHVpLmNvbXBvbmVudC5EYXRlUGlja2VyKHtcbiAqICAgICAgIGVsZW1lbnQ6ICcjcGlja2VyJyxcbiAqICAgICAgIGRhdGVGb3JtOiAneXl5eeuFhCBtbeyblCBkZOydvCAtICcsXG4gKiAgICAgICBkYXRlOiB7eWVhcjogMjAxNSwgbW9udGg6IDEsIGRhdGU6IDEgfSxcbiAqICAgICAgIHN0YXJ0RGF0ZToge3llYXI6MjAxMiwgbW9udGg6MSwgZGF0ZToxN30sXG4gKiAgICAgICBlbmREYXRlOiB7eWVhcjogMjA3MCwgbW9udGg6MTIsIGRhdGU6MzF9LFxuICogICAgICAgb3BlbmVyczogWycjb3BlbmVyJ10sXG4gKiAgICAgICB0aW1lUGlja2VyOiB0aW1lUGlja2VyXG4gKiAgIH0sIGNhbGVuZGFyKTtcbiAqXG4gKiAgIC8vIENsb3NlIGNhbGVuZGFyIHdoZW4gc2VsZWN0IGEgZGF0ZVxuICogICAkKCcjbGF5ZXInKS5vbignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICogICAgICAgdmFyICRlbCA9ICQoZXZlbnQudGFyZ2V0KTtcbiAqXG4gKiAgICAgICBpZiAoJGVsLmhhc0NsYXNzKCdzZWxlY3RhYmxlJykpIHtcbiAqICAgICAgICAgICBwaWNrZXIxLmNsb3NlKCk7XG4gKiAgICAgICB9XG4gKiAgIH0pO1xuICovXG52YXIgRGF0ZVBpY2tlciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgRGF0ZVBpY2tlci5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9uLCBjYWxlbmRhcikge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ2FsZW5kYXIgaW5zdGFuY2VcbiAgICAgICAgICogQHR5cGUge0NhbGVuZGFyfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fY2FsZW5kYXIgPSBjYWxlbmRhcjtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRWxlbWVudCBmb3IgZGlzcGxheWluZyBhIGRhdGUgdmFsdWVcbiAgICAgICAgICogQHR5cGUge0hUTUxFbGVtZW50fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fJGVsZW1lbnQgPSAkKG9wdGlvbi5lbGVtZW50KTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRWxlbWVudCB3cmFwcGluZyBjYWxlbmRhclxuICAgICAgICAgKiBAdHlwZSB7SFRNTEVsZW1lbnR9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl8kd3JhcHBlckVsZW1lbnQgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGb3JtYXQgb2YgZGF0ZSBzdHJpbmdcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2RhdGVGb3JtID0gb3B0aW9uLmRhdGVGb3JtIHx8ICd5eXl5LW1tLWRkICc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlZ0V4cCBpbnN0YW5jZSBmb3IgZm9ybWF0IG9mIGRhdGUgc3RyaW5nXG4gICAgICAgICAqIEB0eXBlIHtSZWdFeHB9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9yZWdFeHAgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBcnJheSBzYXZpbmcgYSBvcmRlciBvZiBmb3JtYXRcbiAgICAgICAgICogQHR5cGUge0FycmF5fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAc2VlIHt0dWkuY29tcG9uZW50LkRhdGVQaWNrZXIucHJvdG90eXBlLnNldERhdGVGb3JtfVxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKiAgLy8gSWYgdGhlIGZvcm1hdCBpcyBhICdtbS1kZCwgeXl5eSdcbiAgICAgICAgICogIC8vIGB0aGlzLl9mb3JtT3JkZXJgIGlzIFsnbW9udGgnLCAnZGF0ZScsICd5ZWFyJ11cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2Zvcm1PcmRlciA9IFtdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBPYmplY3QgaGF2aW5nIGRhdGUgdmFsdWVzXG4gICAgICAgICAqIEB0eXBlIHt7eWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXRlOiBudW1iZXJ9fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fZGF0ZSA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoaXMgdmFsdWUgaXMgcHJlcGVuZGVkIGF1dG9tYXRpY2FsbHkgd2hlbiB5ZWFyLWZvcm1hdCBpcyAneXknXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqICAvL1xuICAgICAgICAgKiAgLy8gSWYgdGhpcyB2bGF1ZSBpcyAnMjAnLCB0aGUgZm9ybWF0IGlzICd5eS1tbS1kZCcgYW5kIHRoZSBkYXRlIHN0cmluZyBpcyAnMTUtMDQtMTInLFxuICAgICAgICAgKiAgLy8gdGhlIGRhdGUgdmFsdWUgb2JqZWN0IGlzXG4gICAgICAgICAqICAvLyAge1xuICAgICAgICAgKiAgLy8gICAgICB5ZWFyOiAyMDE1LFxuICAgICAgICAgKiAgLy8gICAgICBtb250aDogNCxcbiAgICAgICAgICogIC8vICAgICAgZGF0ZTogMTJcbiAgICAgICAgICogIC8vICB9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9kZWZhdWx0Q2VudHVyeSA9IG9wdGlvbi5kZWZhdWx0Q2VudHVyeSB8fCBDT05TVEFOVFMuZGVmYXVsdENlbnR1cnk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENsYXNzIG5hbWUgZm9yIHNlbGVjdGFibGUgZGF0ZSBlbGVtZW50c1xuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fc2VsZWN0YWJsZUNsYXNzTmFtZSA9IG9wdGlvbi5zZWxlY3RhYmxlQ2xhc3NOYW1lIHx8IENPTlNUQU5UUy5zZWxlY3RhYmxlQ2xhc3NOYW1lO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDbGFzcyBuYW1lIGZvciBzZWxlY3RlZCBkYXRlIGVsZW1lbnRcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3NlbGVjdGVkQ2xhc3NOYW1lID0gb3B0aW9uLnNlbGVjdGVkQ2xhc3NOYW1lIHx8IENPTlNUQU5UUy5zZWxlY3RlZENsYXNzTmFtZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogU3RhcnQgZGF0ZSB0aGF0IGNhbiBiZSBzZWxlY3RlZFxuICAgICAgICAgKiBJdCBpcyBudW1iZXIgb2YgZGF0ZSAoPXRpbWVzdGFtcClcbiAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3N0YXJ0RWRnZSA9IG9wdGlvbi5zdGFydERhdGU7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEVuZCBkYXRlIHRoYXQgY2FuIGJlIHNlbGVjdGVkXG4gICAgICAgICAqIEl0IGlzIG51bWJlciBvZiBkYXRlICg9dGltZXN0YW1wKVxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fZW5kRWRnZSA9IG9wdGlvbi5lbmREYXRlO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaW1lUGlja2VyIGluc3RhbmNlXG4gICAgICAgICAqIEB0eXBlIHtUaW1lUGlja2VyfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAc2luY2UgMS4xLjBcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3RpbWVQaWNrZXIgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBwb3NpdGlvbiAtIGxlZnQgJiB0b3AgJiB6SW5kZXhcbiAgICAgICAgICogQHR5cGUge09iamVjdH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHNpbmNlIDEuMS4xXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9wb3MgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBvcGVuZXJzIC0gb3BlbmVyIGxpc3RcbiAgICAgICAgICogQHR5cGUge0FycmF5fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAc2luY2UgMS4xLjFcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX29wZW5lcnMgPSBbXTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogSGFuZGxlcnMgYmluZGluZyBjb250ZXh0XG4gICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9wcm94eUhhbmRsZXJzID0ge307XG5cbiAgICAgICAgdGhpcy5faW5pdGlhbGl6ZURhdGVQaWNrZXIob3B0aW9uKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBtZXRob2RcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uIC0gdXNlciBvcHRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbml0aWFsaXplRGF0ZVBpY2tlcjogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIHRoaXMuX3NldFdyYXBwZXJFbGVtZW50KCk7XG4gICAgICAgIHRoaXMuX3NldERlZmF1bHREYXRlKG9wdGlvbi5kYXRlKTtcbiAgICAgICAgdGhpcy5fc2V0RGVmYXVsdFBvc2l0aW9uKG9wdGlvbi5wb3MpO1xuICAgICAgICB0aGlzLl9yZXN0cmljdERhdGUob3B0aW9uLnN0YXJ0RGF0ZSwgb3B0aW9uLmVuZERhdGUpO1xuICAgICAgICB0aGlzLl9zZXRQcm94eUhhbmRsZXJzKCk7XG4gICAgICAgIHRoaXMuX2JpbmRPcGVuZXJFdmVudChvcHRpb24ub3BlbmVycyk7XG4gICAgICAgIHRoaXMuX3NldFRpbWVQaWNrZXIob3B0aW9uLnRpbWVQaWNrZXIpO1xuICAgICAgICB0aGlzLnNldERhdGVGb3JtKCk7XG4gICAgICAgIHRoaXMuXyR3cmFwcGVyRWxlbWVudC5oaWRlKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCB3cmFwcGVyIGVsZW1lbnQoPSBjb250YWluZXIpXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0V3JhcHBlckVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl8kd3JhcHBlckVsZW1lbnQgPSAkKENPTlNUQU5UUy53cmFwcGVyVGFnKVxuICAgICAgICAgICAgLmluc2VydEFmdGVyKHRoaXMuXyRlbGVtZW50KVxuICAgICAgICAgICAgLmFwcGVuZCh0aGlzLl9jYWxlbmRhci4kZWxlbWVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBkZWZhdWx0IGRhdGVcbiAgICAgKiBAcGFyYW0ge3t5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRhdGU6IG51bWJlcn18RGF0ZX0gb3BEYXRlIFtvcHRpb24uZGF0ZV0gLSB1c2VyIHNldHRpbmc6IGRhdGVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXREZWZhdWx0RGF0ZTogZnVuY3Rpb24ob3BEYXRlKSB7XG4gICAgICAgIGlmICghb3BEYXRlKSB7XG4gICAgICAgICAgICB0aGlzLl9kYXRlID0gdXRpbHMuZ2V0RGF0ZUhhc2hUYWJsZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fZGF0ZSA9IHtcbiAgICAgICAgICAgICAgICB5ZWFyOiB1dGlsLmlzTnVtYmVyKG9wRGF0ZS55ZWFyKSA/IG9wRGF0ZS55ZWFyIDogQ09OU1RBTlRTLm1pblllYXIsXG4gICAgICAgICAgICAgICAgbW9udGg6IHV0aWwuaXNOdW1iZXIob3BEYXRlLm1vbnRoKSA/IG9wRGF0ZS5tb250aCA6IDEsXG4gICAgICAgICAgICAgICAgZGF0ZTogdXRpbC5pc051bWJlcihvcERhdGUuZGF0ZSkgPyBvcERhdGUuZGF0ZSA6IDFcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2F2ZSBkZWZhdWx0IHN0eWxlLXBvc2l0aW9uIG9mIGNhbGVuZGFyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wUG9zIFtvcHRpb24ucG9zXSAtIHVzZXIgc2V0dGluZzogcG9zaXRpb24obGVmdCwgdG9wLCB6SW5kZXgpXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0RGVmYXVsdFBvc2l0aW9uOiBmdW5jdGlvbihvcFBvcykge1xuICAgICAgICB2YXIgcG9zID0gdGhpcy5fcG9zID0gb3BQb3MgfHwge30sXG4gICAgICAgICAgICBib3VuZCA9IHRoaXMuX2dldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgIHBvcy5sZWZ0ID0gcG9zLmxlZnQgfHwgYm91bmQubGVmdDtcbiAgICAgICAgcG9zLnRvcCA9IHBvcy50b3AgfHwgYm91bmQuYm90dG9tO1xuICAgICAgICBwb3MuekluZGV4ID0gcG9zLnpJbmRleCB8fCA5OTk5O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXN0cmljdCBkYXRlXG4gICAgICogQHBhcmFtIHt7eWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXRlOiBudW1iZXJ9fSBvcFN0YXJ0RGF0ZSBbb3B0aW9uLnN0YXJ0RGF0ZV0gLSBzdGFydCBkYXRlIGluIGNhbGVuZGFyXG4gICAgICogQHBhcmFtIHt7eWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXRlOiBudW1iZXJ9fSBvcEVuZERhdGUgW29wdGlvbi5lbmREYXRlXSAtIGVuZCBkYXRlIGluIGNhbGVuZGFyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfcmVzdHJpY3REYXRlOiBmdW5jdGlvbihvcFN0YXJ0RGF0ZSwgb3BFbmREYXRlKSB7XG4gICAgICAgIHZhciBzdGFydERhdGUgPSBvcFN0YXJ0RGF0ZSB8fCB7eWVhcjogQ09OU1RBTlRTLm1pblllYXIsIG1vbnRoOiAxLCBkYXRlOiAxfSxcbiAgICAgICAgICAgIGVuZERhdGUgPSBvcEVuZERhdGUgfHwge3llYXI6IENPTlNUQU5UUy5tYXhZZWFyLCBtb250aDogMTIsIGRhdGU6IDMxfTtcblxuICAgICAgICB0aGlzLl9zdGFydEVkZ2UgPSB1dGlscy5nZXRUaW1lKHN0YXJ0RGF0ZSkgLSAxO1xuICAgICAgICB0aGlzLl9lbmRFZGdlID0gdXRpbHMuZ2V0VGltZShlbmREYXRlKSArIDE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN0b3JlIG9wZW5lciBlbGVtZW50IGxpc3RcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBvcE9wZW5lcnMgW29wdGlvbi5vcGVuZXJzXSAtIG9wZW5lciBlbGVtZW50IGxpc3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRPcGVuZXJzOiBmdW5jdGlvbihvcE9wZW5lcnMpIHtcbiAgICAgICAgdGhpcy5hZGRPcGVuZXIodGhpcy5fJGVsZW1lbnQpO1xuICAgICAgICB1dGlsLmZvckVhY2gob3BPcGVuZXJzLCBmdW5jdGlvbihvcGVuZXIpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkT3BlbmVyKG9wZW5lcik7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgVGltZVBpY2tlciBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSB7dHVpLmNvbXBvbmVudC5UaW1lUGlja2VyfSBbb3BUaW1lUGlja2VyXSAtIFRpbWVQaWNrZXIgaW5zdGFuY2VcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRUaW1lUGlja2VyOiBmdW5jdGlvbihvcFRpbWVQaWNrZXIpIHtcbiAgICAgICAgaWYgKCFvcFRpbWVQaWNrZXIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3RpbWVQaWNrZXIgPSBvcFRpbWVQaWNrZXI7XG4gICAgICAgIHRoaXMuX2JpbmRDdXN0b21FdmVudFdpdGhUaW1lUGlja2VyKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgY3VzdG9tIGV2ZW50IHdpdGggVGltZVBpY2tlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2JpbmRDdXN0b21FdmVudFdpdGhUaW1lUGlja2VyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9uQ2hhbmdlVGltZVBpY2tlciA9IHV0aWwuYmluZCh0aGlzLnNldERhdGUsIHRoaXMpO1xuXG4gICAgICAgIHRoaXMub24oJ29wZW4nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuX3RpbWVQaWNrZXIuc2V0VGltZUZyb21JbnB1dEVsZW1lbnQodGhpcy5fJGVsZW1lbnQpO1xuICAgICAgICAgICAgdGhpcy5fdGltZVBpY2tlci5vbignY2hhbmdlJywgb25DaGFuZ2VUaW1lUGlja2VyKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMub24oJ2Nsb3NlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLl90aW1lUGlja2VyLm9mZignY2hhbmdlJywgb25DaGFuZ2VUaW1lUGlja2VyKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrIHZhbGlkYXRpb24gb2YgYSB5ZWFyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHllYXIgLSB5ZWFyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IC0gd2hldGhlciB0aGUgeWVhciBpcyB2YWxpZCBvciBub3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc1ZhbGlkWWVhcjogZnVuY3Rpb24oeWVhcikge1xuICAgICAgICByZXR1cm4gdXRpbC5pc051bWJlcih5ZWFyKSAmJiB5ZWFyID4gQ09OU1RBTlRTLm1pblllYXIgJiYgeWVhciA8IENPTlNUQU5UUy5tYXhZZWFyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayB2YWxpZGF0aW9uIG9mIGEgbW9udGhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbW9udGggLSBtb250aFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSAtIHdoZXRoZXIgdGhlIG1vbnRoIGlzIHZhbGlkIG9yIG5vdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzVmFsaWRNb250aDogZnVuY3Rpb24obW9udGgpIHtcbiAgICAgICAgcmV0dXJuIHV0aWwuaXNOdW1iZXIobW9udGgpICYmIG1vbnRoID4gMCAmJiBtb250aCA8IDEzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayB2YWxpZGF0aW9uIG9mIHZhbHVlcyBpbiBhIGRhdGUgb2JqZWN0IGhhdmluZyB5ZWFyLCBtb250aCwgZGF5LWluLW1vbnRoXG4gICAgICogQHBhcmFtIHt7eWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXRlOiBudW1iZXJ9fSBkYXRlaGFzaCAtIGRhdGUgb2JqZWN0XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IC0gd2hldGhlciB0aGUgZGF0ZSBvYmplY3QgaXMgdmFsaWQgb3Igbm90XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNWYWxpZERhdGU6IGZ1bmN0aW9uKGRhdGVoYXNoKSB7XG4gICAgICAgIHZhciB5ZWFyID0gZGF0ZWhhc2gueWVhcixcbiAgICAgICAgICAgIG1vbnRoID0gZGF0ZWhhc2gubW9udGgsXG4gICAgICAgICAgICBkYXRlID0gZGF0ZWhhc2guZGF0ZSxcbiAgICAgICAgICAgIGlzTGVhcFllYXIgPSAoeWVhciAlIDQgPT09IDApICYmICh5ZWFyICUgMTAwICE9PSAwKSB8fCAoeWVhciAlIDQwMCA9PT0gMCksXG4gICAgICAgICAgICBsYXN0RGF5SW5Nb250aCxcbiAgICAgICAgICAgIGlzQmV0d2VlbjtcblxuICAgICAgICBpZiAoIXRoaXMuX2lzVmFsaWRZZWFyKHllYXIpIHx8ICF0aGlzLl9pc1ZhbGlkTW9udGgobW9udGgpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBsYXN0RGF5SW5Nb250aCA9IENPTlNUQU5UUy5tb250aERheXNbbW9udGhdO1xuICAgICAgICBpZiAoaXNMZWFwWWVhciAmJiBtb250aCA9PT0gMikge1xuICAgICAgICAgICAgICAgIGxhc3REYXlJbk1vbnRoID0gMjk7XG4gICAgICAgIH1cbiAgICAgICAgaXNCZXR3ZWVuID0gISEodXRpbC5pc051bWJlcihkYXRlKSAmJiAoZGF0ZSA+IDApICYmIChkYXRlIDw9IGxhc3REYXlJbk1vbnRoKSk7XG5cbiAgICAgICAgcmV0dXJuIGlzQmV0d2VlbjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgYW4gZWxlbWVudCBpcyBhbiBvcGVuZXIuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBvcGVuZXIgdHJ1ZS9mYWxzZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzT3BlbmVyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuXG4gICAgICAgIHV0aWwuZm9yRWFjaCh0aGlzLl9vcGVuZXJzLCBmdW5jdGlvbihvcGVuZXIpIHtcbiAgICAgICAgICAgIGlmICh0YXJnZXQgPT09IG9wZW5lciB8fCAkLmNvbnRhaW5zKG9wZW5lciwgdGFyZ2V0KSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHN0eWxlLXBvc2l0aW9uIG9mIGNhbGVuZGFyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXJyYW5nZUxheWVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHN0eWxlID0gdGhpcy5fJHdyYXBwZXJFbGVtZW50WzBdLnN0eWxlLFxuICAgICAgICAgICAgcG9zID0gdGhpcy5fcG9zO1xuXG4gICAgICAgIHN0eWxlLmxlZnQgPSBwb3MubGVmdCArICdweCc7XG4gICAgICAgIHN0eWxlLnRvcCA9IHBvcy50b3AgKyAncHgnO1xuICAgICAgICBzdHlsZS56SW5kZXggPSBwb3MuekluZGV4O1xuICAgICAgICB0aGlzLl8kd3JhcHBlckVsZW1lbnQuYXBwZW5kKHRoaXMuX2NhbGVuZGFyLiRlbGVtZW50KTtcbiAgICAgICAgaWYgKHRoaXMuX3RpbWVQaWNrZXIpIHtcbiAgICAgICAgICAgIHRoaXMuXyR3cmFwcGVyRWxlbWVudC5hcHBlbmQodGhpcy5fdGltZVBpY2tlci4kdGltZVBpY2tlckVsZW1lbnQpO1xuICAgICAgICAgICAgdGhpcy5fdGltZVBpY2tlci5zaG93KCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGJvdW5kaW5nQ2xpZW50UmVjdCBvZiBhbiBlbGVtZW50XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudHxqUXVlcnl9IFtlbGVtZW50XSAtIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSAtIGFuIG9iamVjdCBoYXZpbmcgbGVmdCwgdG9wLCBib3R0b20sIHJpZ2h0IG9mIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRCb3VuZGluZ0NsaWVudFJlY3Q6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgdmFyIGVsID0gJChlbGVtZW50KVswXSB8fCB0aGlzLl8kZWxlbWVudFswXSxcbiAgICAgICAgICAgIGJvdW5kLFxuICAgICAgICAgICAgY2VpbDtcblxuICAgICAgICBib3VuZCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjZWlsID0gTWF0aC5jZWlsO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGVmdDogY2VpbChib3VuZC5sZWZ0KSxcbiAgICAgICAgICAgIHRvcDogY2VpbChib3VuZC50b3ApLFxuICAgICAgICAgICAgYm90dG9tOiBjZWlsKGJvdW5kLmJvdHRvbSksXG4gICAgICAgICAgICByaWdodDogY2VpbChib3VuZC5yaWdodClcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGRhdGUgZnJvbSBzdHJpbmdcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyIC0gZGF0ZSBzdHJpbmdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXREYXRlRnJvbVN0cmluZzogZnVuY3Rpb24oc3RyKSB7XG4gICAgICAgIHZhciBkYXRlID0gdGhpcy5fZXh0cmFjdERhdGUoc3RyKTtcblxuICAgICAgICBpZiAoZGF0ZSAmJiAhdGhpcy5faXNSZXN0cmljdGVkKGRhdGUpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fdGltZVBpY2tlcikge1xuICAgICAgICAgICAgICAgIHRoaXMuX3RpbWVQaWNrZXIuc2V0VGltZUZyb21JbnB1dEVsZW1lbnQodGhpcy5fJGVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXREYXRlKGRhdGUueWVhciwgZGF0ZS5tb250aCwgZGF0ZS5kYXRlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0RGF0ZSgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBmb3JtZWQgZGF0ZS1zdHJpbmcgZnJvbSBkYXRlIG9iamVjdFxuICAgICAqIEByZXR1cm4ge3N0cmluZ30gLSBmb3JtZWQgZGF0ZS1zdHJpbmdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mb3JtZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgeWVhciA9IHRoaXMuX2RhdGUueWVhcixcbiAgICAgICAgICAgIG1vbnRoID0gdGhpcy5fZGF0ZS5tb250aCxcbiAgICAgICAgICAgIGRhdGUgPSB0aGlzLl9kYXRlLmRhdGUsXG4gICAgICAgICAgICBmb3JtID0gdGhpcy5fZGF0ZUZvcm0sXG4gICAgICAgICAgICByZXBsYWNlTWFwLFxuICAgICAgICAgICAgZGF0ZVN0cmluZztcblxuICAgICAgICBtb250aCA9IG1vbnRoIDwgMTAgPyAoJzAnICsgbW9udGgpIDogbW9udGg7XG4gICAgICAgIGRhdGUgPSBkYXRlIDwgMTAgPyAoJzAnICsgZGF0ZSkgOiBkYXRlO1xuXG4gICAgICAgIHJlcGxhY2VNYXAgPSB7XG4gICAgICAgICAgICB5eXl5OiB5ZWFyLFxuICAgICAgICAgICAgeXk6IFN0cmluZyh5ZWFyKS5zdWJzdHIoMiwgMiksXG4gICAgICAgICAgICBtbTogbW9udGgsXG4gICAgICAgICAgICBtOiBOdW1iZXIobW9udGgpLFxuICAgICAgICAgICAgZGQ6IGRhdGUsXG4gICAgICAgICAgICBkOiBOdW1iZXIoZGF0ZSlcbiAgICAgICAgfTtcblxuICAgICAgICBkYXRlU3RyaW5nID0gZm9ybS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gcmVwbGFjZU1hcFtrZXkudG9Mb3dlckNhc2UoKV0gfHwgJyc7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBkYXRlU3RyaW5nO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFeHRyYWN0IGRhdGUtb2JqZWN0IGZyb20gaW5wdXQgc3RyaW5nIHdpdGggY29tcGFyaW5nIGRhdGUtZm9ybWF0PGJyPlxuICAgICAqIElmIGNhbiBub3QgZXh0cmFjdCwgcmV0dXJuIGZhbHNlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHN0ciAtIGlucHV0IHN0cmluZyh0ZXh0KVxuICAgICAqIEByZXR1cm5zIHt7eWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXRlOiBudW1iZXJ9fGZhbHNlfSAtIGV4dHJhY3RlZCBkYXRlIG9iamVjdCBvciBmYWxzZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2V4dHJhY3REYXRlOiBmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgdmFyIGZvcm1PcmRlciA9IHRoaXMuX2Zvcm1PcmRlcixcbiAgICAgICAgICAgIHJlc3VsdERhdGUgPSB7fSxcbiAgICAgICAgICAgIHJlZ0V4cCA9IHRoaXMuX3JlZ0V4cDtcblxuICAgICAgICByZWdFeHAubGFzdEluZGV4ID0gMDtcbiAgICAgICAgaWYgKHJlZ0V4cC50ZXN0KHN0cikpIHtcbiAgICAgICAgICAgIHJlc3VsdERhdGVbZm9ybU9yZGVyWzBdXSA9IE51bWJlcihSZWdFeHAuJDEpO1xuICAgICAgICAgICAgcmVzdWx0RGF0ZVtmb3JtT3JkZXJbMV1dID0gTnVtYmVyKFJlZ0V4cC4kMik7XG4gICAgICAgICAgICByZXN1bHREYXRlW2Zvcm1PcmRlclsyXV0gPSBOdW1iZXIoUmVnRXhwLiQzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChTdHJpbmcocmVzdWx0RGF0ZS55ZWFyKS5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgIHJlc3VsdERhdGUueWVhciA9IE51bWJlcih0aGlzLl9kZWZhdWx0Q2VudHVyeSArIHJlc3VsdERhdGUueWVhcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0RGF0ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgYSBkYXRlLW9iamVjdCBpcyByZXN0cmljdGVkIG9yIG5vdFxuICAgICAqIEBwYXJhbSB7e3llYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF0ZTogbnVtYmVyfX0gZGF0ZWhhc2ggLSBkYXRlIG9iamVjdFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSAtIHdoZXRoZXIgdGhlIGRhdGUtb2JqZWN0IGlzIHJlc3RyaWN0ZWQgb3Igbm90XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNSZXN0cmljdGVkOiBmdW5jdGlvbihkYXRlaGFzaCkge1xuICAgICAgICB2YXIgc3RhcnQgPSB0aGlzLl9zdGFydEVkZ2UsXG4gICAgICAgICAgICBlbmQgPSB0aGlzLl9lbmRFZGdlLFxuICAgICAgICAgICAgZGF0ZSA9IHV0aWxzLmdldFRpbWUoZGF0ZWhhc2gpO1xuXG4gICAgICAgIHJldHVybiAhdGhpcy5faXNWYWxpZERhdGUoZGF0ZWhhc2gpIHx8IChkYXRlIDwgc3RhcnQgfHwgZGF0ZSA+IGVuZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBzZWxlY3RhYmxlLWNsYXNzLW5hbWUgdG8gc2VsZWN0YWJsZSBkYXRlIGVsZW1lbnQuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudHxqUXVlcnl9IGVsZW1lbnQgLSBkYXRlIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3t5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRhdGU6IG51bWJlcn19IGRhdGVIYXNoIC0gZGF0ZSBvYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRTZWxlY3RhYmxlQ2xhc3NOYW1lOiBmdW5jdGlvbihlbGVtZW50LCBkYXRlSGFzaCkge1xuICAgICAgICBpZiAoIXRoaXMuX2lzUmVzdHJpY3RlZChkYXRlSGFzaCkpIHtcbiAgICAgICAgICAgICQoZWxlbWVudCkuYWRkQ2xhc3ModGhpcy5fc2VsZWN0YWJsZUNsYXNzTmFtZSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHNlbGVjdGVkLWNsYXNzLW5hbWUgdG8gc2VsZWN0ZWQgZGF0ZSBlbGVtZW50XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudHxqUXVlcnl9IGVsZW1lbnQgLSBkYXRlIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3t5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRhdGU6IG51bWJlcn19IGRhdGVIYXNoIC0gZGF0ZSBvYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRTZWxlY3RlZENsYXNzTmFtZTogZnVuY3Rpb24oZWxlbWVudCwgZGF0ZUhhc2gpIHtcbiAgICAgICAgdmFyIHllYXIgPSB0aGlzLl9kYXRlLnllYXIsXG4gICAgICAgICAgICBtb250aCA9IHRoaXMuX2RhdGUubW9udGgsXG4gICAgICAgICAgICBkYXRlID0gdGhpcy5fZGF0ZS5kYXRlLFxuICAgICAgICAgICAgaXNTZWxlY3RlZCA9ICh5ZWFyID09PSBkYXRlSGFzaC55ZWFyKSAmJiAobW9udGggPT09IGRhdGVIYXNoLm1vbnRoKSAmJiAoZGF0ZSA9PT0gZGF0ZUhhc2guZGF0ZSk7XG5cbiAgICAgICAgaWYgKGlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICQoZWxlbWVudCkuYWRkQ2xhc3ModGhpcy5fc2VsZWN0ZWRDbGFzc05hbWUpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCB2YWx1ZSBhIGRhdGUtc3RyaW5nIG9mIGN1cnJlbnQgdGhpcyBpbnN0YW5jZSB0byBpbnB1dCBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0VmFsdWVUb0lucHV0RWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkYXRlU3RyaW5nID0gdGhpcy5fZm9ybWVkKCksXG4gICAgICAgICAgICB0aW1lU3RyaW5nID0gJyc7XG5cbiAgICAgICAgaWYgKHRoaXMuX3RpbWVQaWNrZXIpIHtcbiAgICAgICAgICAgIHRpbWVTdHJpbmcgPSB0aGlzLl90aW1lUGlja2VyLmdldFRpbWUoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl8kZWxlbWVudC52YWwoZGF0ZVN0cmluZyArIHRpbWVTdHJpbmcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQob3IgbWFrZSkgUmVnRXhwIGluc3RhbmNlIGZyb20gdGhlIGRhdGUtZm9ybWF0IG9mIHRoaXMgaW5zdGFuY2UuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0UmVnRXhwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlZ0V4cFN0ciA9ICdeJyxcbiAgICAgICAgICAgIGluZGV4ID0gMCxcbiAgICAgICAgICAgIGZvcm1PcmRlciA9IHRoaXMuX2Zvcm1PcmRlcjtcblxuICAgICAgICB0aGlzLl9kYXRlRm9ybS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oc3RyKSB7XG4gICAgICAgICAgICB2YXIga2V5ID0gc3RyLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgICAgIHJlZ0V4cFN0ciArPSAobWFwRm9yQ29udmVydGluZ1trZXldLmV4cHJlc3Npb24gKyAnW1xcXFxEXFxcXHNdKicpO1xuICAgICAgICAgICAgZm9ybU9yZGVyW2luZGV4XSA9IG1hcEZvckNvbnZlcnRpbmdba2V5XS50eXBlO1xuICAgICAgICAgICAgaW5kZXggKz0gMTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX3JlZ0V4cCA9IG5ldyBSZWdFeHAocmVnRXhwU3RyLCAnZ2knKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGV2ZW50IGhhbmRsZXJzIHRvIGJpbmQgY29udGV4dCBhbmQgdGhlbiBzdG9yZS5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRQcm94eUhhbmRsZXJzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHByb3hpZXMgPSB0aGlzLl9wcm94eUhhbmRsZXJzO1xuXG4gICAgICAgIC8vIEV2ZW50IGhhbmRsZXJzIGZvciBlbGVtZW50XG4gICAgICAgIHByb3hpZXMub25Nb3VzZWRvd25Eb2N1bWVudCA9IHV0aWwuYmluZCh0aGlzLl9vbk1vdXNlZG93bkRvY3VtZW50LCB0aGlzKTtcbiAgICAgICAgcHJveGllcy5vbktleWRvd25FbGVtZW50ID0gdXRpbC5iaW5kKHRoaXMuX29uS2V5ZG93bkVsZW1lbnQsIHRoaXMpO1xuICAgICAgICBwcm94aWVzLm9uQ2xpY2tDYWxlbmRhciA9IHV0aWwuYmluZCh0aGlzLl9vbkNsaWNrQ2FsZW5kYXIsIHRoaXMpO1xuICAgICAgICBwcm94aWVzLm9uQ2xpY2tPcGVuZXIgPSB1dGlsLmJpbmQodGhpcy5fb25DbGlja09wZW5lciwgdGhpcyk7XG5cbiAgICAgICAgLy8gRXZlbnQgaGFuZGxlcnMgZm9yIGN1c3RvbSBldmVudCBvZiBjYWxlbmRhclxuICAgICAgICBwcm94aWVzLm9uQmVmb3JlRHJhd0NhbGVuZGFyID0gdXRpbC5iaW5kKHRoaXMuX29uQmVmb3JlRHJhd0NhbGVuZGFyLCB0aGlzKTtcbiAgICAgICAgcHJveGllcy5vbkRyYXdDYWxlbmRhciA9IHV0aWwuYmluZCh0aGlzLl9vbkRyYXdDYWxlbmRhciwgdGhpcyk7XG4gICAgICAgIHByb3hpZXMub25BZnRlckRyYXdDYWxlbmRhciA9IHV0aWwuYmluZCh0aGlzLl9vbkFmdGVyRHJhd0NhbGVuZGFyLCB0aGlzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXZlbnQgaGFuZGxlciBmb3IgbW91c2Vkb3duIG9mIGRvY3VtZW50PGJyPlxuICAgICAqIC0gV2hlbiBjbGljayB0aGUgb3V0IG9mIGxheWVyLCBjbG9zZSB0aGUgbGF5ZXJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCAtIGV2ZW50IG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uTW91c2Vkb3duRG9jdW1lbnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHZhciBpc0NvbnRhaW5zID0gJC5jb250YWlucyh0aGlzLl8kd3JhcHBlckVsZW1lbnRbMF0sIGV2ZW50LnRhcmdldCk7XG5cbiAgICAgICAgaWYgKCghaXNDb250YWlucyAmJiAhdGhpcy5faXNPcGVuZXIoZXZlbnQudGFyZ2V0KSkpIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFdmVudCBoYW5kbGVyIGZvciBlbnRlci1rZXkgZG93biBvZiBpbnB1dCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtFdmVudH0gW2V2ZW50XSAtIGV2ZW50IG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uS2V5ZG93bkVsZW1lbnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmICghZXZlbnQgfHwgZXZlbnQua2V5Q29kZSAhPT0gMTMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zZXREYXRlRnJvbVN0cmluZyh0aGlzLl8kZWxlbWVudC52YWwoKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV2ZW50IGhhbmRsZXIgZm9yIGNsaWNrIG9mIGNhbGVuZGFyPGJyPlxuICAgICAqIC0gVXBkYXRlIGRhdGUgZm9ybSBldmVudC10YXJnZXRcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCAtIGV2ZW50IG9iamVjdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uQ2xpY2tDYWxlbmRhcjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldCxcbiAgICAgICAgICAgIGNsYXNzTmFtZSA9IHRhcmdldC5jbGFzc05hbWUsXG4gICAgICAgICAgICB2YWx1ZSA9IE51bWJlcigodGFyZ2V0LmlubmVyVGV4dCB8fCB0YXJnZXQudGV4dENvbnRlbnQgfHwgdGFyZ2V0Lm5vZGVWYWx1ZSkpLFxuICAgICAgICAgICAgc2hvd25EYXRlLFxuICAgICAgICAgICAgcmVsYXRpdmVNb250aCxcbiAgICAgICAgICAgIGRhdGU7XG5cbiAgICAgICAgaWYgKHZhbHVlICYmICFpc05hTih2YWx1ZSkpIHtcbiAgICAgICAgICAgIGlmIChjbGFzc05hbWUuaW5kZXhPZigncHJldi1tb250aCcpID4gLTEpIHtcbiAgICAgICAgICAgICAgICByZWxhdGl2ZU1vbnRoID0gLTE7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNsYXNzTmFtZS5pbmRleE9mKCduZXh0LW1vbnRoJykgPiAtMSkge1xuICAgICAgICAgICAgICAgIHJlbGF0aXZlTW9udGggPSAxO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZWxhdGl2ZU1vbnRoID0gMDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2hvd25EYXRlID0gdGhpcy5fY2FsZW5kYXIuZ2V0RGF0ZSgpO1xuICAgICAgICAgICAgc2hvd25EYXRlLmRhdGUgPSB2YWx1ZTtcbiAgICAgICAgICAgIGRhdGUgPSB1dGlscy5nZXRSZWxhdGl2ZURhdGUoMCwgcmVsYXRpdmVNb250aCwgMCwgc2hvd25EYXRlKTtcbiAgICAgICAgICAgIHRoaXMuc2V0RGF0ZShkYXRlLnllYXIsIGRhdGUubW9udGgsIGRhdGUuZGF0ZSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXZlbnQgaGFuZGxlciBmb3IgY2xpY2sgb2Ygb3BlbmVyLWVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkNsaWNrT3BlbmVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5vcGVuKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV2ZW50IGhhbmRsZXIgZm9yICdiZWZvcmVEcmF3Jy1jdXN0b20gZXZlbnQgb2YgY2FsZW5kYXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBzZWUge3R1aS5jb21wb25lbnQuQ2FsZW5kYXIuZHJhd31cbiAgICAgKi9cbiAgICBfb25CZWZvcmVEcmF3Q2FsZW5kYXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl91bmJpbmRPbkNsaWNrQ2FsZW5kYXIoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXZlbnQgaGFuZGxlciBmb3IgJ2RyYXcnLWN1c3RvbSBldmVudCBvZiBjYWxlbmRhclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudERhdGEgLSBjdXN0b20gZXZlbnQgZGF0YVxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHNlZSB7dHVpLmNvbXBvbmVudC5DYWxlbmRhci5kcmF3fVxuICAgICAqL1xuICAgIF9vbkRyYXdDYWxlbmRhcjogZnVuY3Rpb24oZXZlbnREYXRhKSB7XG4gICAgICAgIHZhciBkYXRlSGFzaCA9IHtcbiAgICAgICAgICAgIHllYXI6IGV2ZW50RGF0YS55ZWFyLFxuICAgICAgICAgICAgbW9udGg6IGV2ZW50RGF0YS5tb250aCxcbiAgICAgICAgICAgIGRhdGU6IGV2ZW50RGF0YS5kYXRlXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX3NldFNlbGVjdGFibGVDbGFzc05hbWUoZXZlbnREYXRhLiRkYXRlQ29udGFpbmVyLCBkYXRlSGFzaCk7XG4gICAgICAgIHRoaXMuX3NldFNlbGVjdGVkQ2xhc3NOYW1lKGV2ZW50RGF0YS4kZGF0ZUNvbnRhaW5lciwgZGF0ZUhhc2gpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFdmVudCBoYW5kbGVyIGZvciAnYWZ0ZXJEcmF3Jy1jdXN0b20gZXZlbnQgb2YgY2FsZW5kYXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBzZWUge3R1aS5jb21wb25lbnQuQ2FsZW5kYXIuZHJhd31cbiAgICAgKi9cbiAgICBfb25BZnRlckRyYXdDYWxlbmRhcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2JpbmRPbkNsaWNrQ2FsZW5kYXIoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBvcGVuZXItZWxlbWVudHMgZXZlbnRcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBvcE9wZW5lcnMgW29wdGlvbi5vcGVuZXJzXSAtIGxpc3Qgb2Ygb3BlbmVyIGVsZW1lbnRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYmluZE9wZW5lckV2ZW50OiBmdW5jdGlvbihvcE9wZW5lcnMpIHtcbiAgICAgICAgdGhpcy5fc2V0T3BlbmVycyhvcE9wZW5lcnMpO1xuICAgICAgICB0aGlzLl8kZWxlbWVudC5vbigna2V5ZG93bicsIHRoaXMuX3Byb3h5SGFuZGxlcnMub25LZXlkb3duRWxlbWVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgbW91c2Vkb3duIGV2ZW50IG9mIGRvY3VtbmV0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYmluZE9uTW91c2Vkb3duRG9jdW1uZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAkKGRvY3VtZW50KS5vbignbW91c2Vkb3duJywgdGhpcy5fcHJveHlIYW5kbGVycy5vbk1vdXNlZG93bkRvY3VtZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5iaW5kIG1vdXNlZG93biBldmVudCBvZiBkb2N1bW5ldFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3VuYmluZE9uTW91c2Vkb3duRG9jdW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAkKGRvY3VtZW50KS5vZmYoJ21vdXNlZG93bicsIHRoaXMuX3Byb3h5SGFuZGxlcnMub25Nb3VzZWRvd25Eb2N1bWVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgY2xpY2sgZXZlbnQgb2YgY2FsZW5kYXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9iaW5kT25DbGlja0NhbGVuZGFyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGhhbmRsZXIgPSB0aGlzLl9wcm94eUhhbmRsZXJzLm9uQ2xpY2tDYWxlbmRhcjtcbiAgICAgICAgdGhpcy5fJHdyYXBwZXJFbGVtZW50LmZpbmQoJy4nICsgdGhpcy5fc2VsZWN0YWJsZUNsYXNzTmFtZSkub24oJ2NsaWNrJywgaGFuZGxlcik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVuYmluZCBjbGljayBldmVudCBvZiBjYWxlbmRhclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3VuYmluZE9uQ2xpY2tDYWxlbmRhcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBoYW5kbGVyID0gdGhpcy5fcHJveHlIYW5kbGVycy5vbkNsaWNrQ2FsZW5kYXI7XG4gICAgICAgIHRoaXMuXyR3cmFwcGVyRWxlbWVudC5maW5kKCcuJyArIHRoaXMuX3NlbGVjdGFibGVDbGFzc05hbWUpLm9mZignY2xpY2snLCBoYW5kbGVyKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBjdXN0b20gZXZlbnQgb2YgY2FsZW5kYXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9iaW5kQ2FsZW5kYXJDdXN0b21FdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwcm94eUhhbmRsZXJzID0gdGhpcy5fcHJveHlIYW5kbGVycyxcbiAgICAgICAgICAgIG9uQmVmb3JlRHJhdyA9IHByb3h5SGFuZGxlcnMub25CZWZvcmVEcmF3Q2FsZW5kYXIsXG4gICAgICAgICAgICBvbkRyYXcgPSBwcm94eUhhbmRsZXJzLm9uRHJhd0NhbGVuZGFyLFxuICAgICAgICAgICAgb25BZnRlckRyYXcgPSBwcm94eUhhbmRsZXJzLm9uQWZ0ZXJEcmF3Q2FsZW5kYXI7XG5cbiAgICAgICAgdGhpcy5fY2FsZW5kYXIub24oe1xuICAgICAgICAgICAgJ2JlZm9yZURyYXcnOiBvbkJlZm9yZURyYXcsXG4gICAgICAgICAgICAnZHJhdyc6IG9uRHJhdyxcbiAgICAgICAgICAgICdhZnRlckRyYXcnOiBvbkFmdGVyRHJhd1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAvKipcbiAgICAqIFVuYmluZCBjdXN0b20gZXZlbnQgb2YgY2FsZW5kYXJcbiAgICAqIEBwcml2YXRlXG4gICAgKi9cbiAgICBfdW5iaW5kQ2FsZW5kYXJDdXN0b21FdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgdmFyIHByb3h5SGFuZGxlcnMgPSB0aGlzLl9wcm94eUhhbmRsZXJzLFxuICAgICAgICAgICBvbkJlZm9yZURyYXcgPSBwcm94eUhhbmRsZXJzLm9uQmVmb3JlRHJhd0NhbGVuZGFyLFxuICAgICAgICAgICBvbkRyYXcgPSBwcm94eUhhbmRsZXJzLm9uRHJhd0NhbGVuZGFyLFxuICAgICAgICAgICBvbkFmdGVyRHJhdyA9IHByb3h5SGFuZGxlcnMub25BZnRlckRyYXdDYWxlbmRhcjtcblxuICAgICAgIHRoaXMuX2NhbGVuZGFyLm9mZih7XG4gICAgICAgICAgICdiZWZvcmVEcmF3Jzogb25CZWZvcmVEcmF3LFxuICAgICAgICAgICAnZHJhdyc6IG9uRHJhdyxcbiAgICAgICAgICAgJ2FmdGVyRHJhdyc6IG9uQWZ0ZXJEcmF3XG4gICAgICAgfSk7XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogU2V0IHBvc2l0aW9uLWxlZnQsIHRvcCBvZiBjYWxlbmRhclxuICAgICAqIEBhcGlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geCAtIHBvc2l0aW9uLWxlZnRcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geSAtIHBvc2l0aW9uLXRvcFxuICAgICAqIEBzaW5jZSAxLjEuMVxuICAgICAqL1xuICAgIHNldFhZOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIHZhciBwb3MgPSB0aGlzLl9wb3M7XG5cbiAgICAgICAgcG9zLmxlZnQgPSB1dGlsLmlzTnVtYmVyKHgpID8geCA6IHBvcy5sZWZ0O1xuICAgICAgICBwb3MudG9wID0gdXRpbC5pc051bWJlcih5KSA/IHkgOiBwb3MudG9wO1xuICAgICAgICB0aGlzLl9hcnJhbmdlTGF5ZXIoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IHotaW5kZXggb2YgY2FsZW5kYXJcbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHpJbmRleCAtIHotaW5kZXggdmFsdWVcbiAgICAgKiBAc2luY2UgMS4xLjFcbiAgICAgKi9cbiAgICBzZXRaSW5kZXg6IGZ1bmN0aW9uKHpJbmRleCkge1xuICAgICAgICBpZiAoIXV0aWwuaXNOdW1iZXIoekluZGV4KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fcG9zLnpJbmRleCA9IHpJbmRleDtcbiAgICAgICAgdGhpcy5fYXJyYW5nZUxheWVyKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGFkZCBvcGVuZXJcbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudHxqUXVlcnl9IG9wZW5lciAtIGVsZW1lbnRcbiAgICAgKi9cbiAgICBhZGRPcGVuZXI6IGZ1bmN0aW9uKG9wZW5lcikge1xuICAgICAgICBpZiAoaW5BcnJheShvcGVuZXIsIHRoaXMuX29wZW5lcnMpIDwgMCkge1xuICAgICAgICAgICAgdGhpcy5fb3BlbmVycy5wdXNoKCQob3BlbmVyKVswXSk7XG4gICAgICAgICAgICAkKG9wZW5lcikub24oJ2NsaWNrJywgdGhpcy5fcHJveHlIYW5kbGVycy5vbkNsaWNrT3BlbmVyKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZW1vdmUgb3BlbmVyXG4gICAgICogQGFwaVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IG9wZW5lciAtIGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW1vdmVPcGVuZXI6IGZ1bmN0aW9uKG9wZW5lcikge1xuICAgICAgICB2YXIgaW5kZXggPSBpbkFycmF5KG9wZW5lciwgdGhpcy5fb3BlbmVycyk7XG5cbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgICQodGhpcy5fb3BlbmVyc1tpbmRleF0pLm9mZignY2xpY2snLCB0aGlzLl9wcm94eUhhbmRsZXJzLm9uQ2xpY2tPcGVuZXIpO1xuICAgICAgICAgICAgdGhpcy5fb3BlbmVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE9wZW4gY2FsZW5kYXIgd2l0aCBhcnJhbmdpbmcgcG9zaXRpb25cbiAgICAgKiBAYXBpXG4gICAgICovXG4gICAgb3BlbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmlzT3BlbmVkKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9hcnJhbmdlTGF5ZXIoKTtcbiAgICAgICAgdGhpcy5fYmluZENhbGVuZGFyQ3VzdG9tRXZlbnQoKTtcbiAgICAgICAgdGhpcy5fYmluZE9uTW91c2Vkb3duRG9jdW1uZXQoKTtcbiAgICAgICAgdGhpcy5fY2FsZW5kYXIuZHJhdyh0aGlzLl9kYXRlLnllYXIsIHRoaXMuX2RhdGUubW9udGgsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5fJHdyYXBwZXJFbGVtZW50LnNob3coKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQGFwaVxuICAgICAgICAgKiBAZXZlbnQgRGF0ZVBpY2tlciNvcGVuXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqIGRhdGVQaWNrZXIub24oJ29wZW4nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICogICAgIGFsZXJ0KCdvcGVuJyk7XG4gICAgICAgICAqIH0pO1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5maXJlKCdvcGVuJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENsb3NlIGNhbGVuZGFyIHdpdGggdW5iaW5kaW5nIHNvbWUgZXZlbnRzXG4gICAgICogQGFwaVxuICAgICAqL1xuICAgIGNsb3NlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzT3BlbmVkKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl91bmJpbmRDYWxlbmRhckN1c3RvbUV2ZW50KCk7XG4gICAgICAgIHRoaXMuX3VuYmluZE9uTW91c2Vkb3duRG9jdW1lbnQoKTtcbiAgICAgICAgdGhpcy5fJHdyYXBwZXJFbGVtZW50LmhpZGUoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQGFwaVxuICAgICAgICAgKiBAZXZlbnQgRGF0ZVBpY2tlciNjbG9zZVxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKiBkYXRlUGlja2VyLm9uKCdjbG9zZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgKiAgICAgYWxlcnQoJ2Nsb3NlJyk7XG4gICAgICAgICAqIH0pO1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5maXJlKCdjbG9zZScpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZGF0ZS1vYmplY3Qgb2YgY3VycmVudCBEYXRlUGlja2VyIGluc3RhbmNlLlxuICAgICAqIEBhcGlcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSAtIGRhdGUtb2JqZWN0IGhhdmluZyB5ZWFyLCBtb250aCBhbmQgZGF5LWluLW1vbnRoXG4gICAgICovXG4gICAgZ2V0RGF0ZU9iamVjdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB1dGlsLmV4dGVuZCh7fSwgdGhpcy5fZGF0ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiB5ZWFyXG4gICAgICogQGFwaVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IC0geWVhclxuICAgICAqL1xuICAgIGdldFllYXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGF0ZS55ZWFyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gbW9udGhcbiAgICAgKiBAYXBpXG4gICAgICogQHJldHVybnMge251bWJlcn0gLSBtb250aFxuICAgICAqL1xuICAgIGdldE1vbnRoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGUubW9udGg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBkYXktaW4tbW9udGhcbiAgICAgKiBAYXBpXG4gICAgICogQHJldHVybnMge251bWJlcn0gLSBkYXktaW4tbW9udGhcbiAgICAgKi9cbiAgICBnZXREYXlJbk1vbnRoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGUuZGF0ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGRhdGUgZnJvbSB2YWx1ZXMoeWVhciwgbW9udGgsIGRhdGUpIGFuZCB0aGVuIGZpcmUgJ3VwZGF0ZScgY3VzdG9tIGV2ZW50XG4gICAgICogQGFwaVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW3llYXJdIC0geWVhclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gW21vbnRoXSAtIG1vbnRoXG4gICAgICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBbZGF0ZV0gLSBkYXkgaW4gbW9udGhcbiAgICAgKi9cbiAgICBzZXREYXRlOiBmdW5jdGlvbih5ZWFyLCBtb250aCwgZGF0ZSkge1xuICAgICAgICB2YXIgZGF0ZU9iaiA9IHRoaXMuX2RhdGUsXG4gICAgICAgICAgICBuZXdEYXRlT2JqID0ge307XG5cbiAgICAgICAgbmV3RGF0ZU9iai55ZWFyID0geWVhciB8fCBkYXRlT2JqLnllYXI7XG4gICAgICAgIG5ld0RhdGVPYmoubW9udGggPSBtb250aCB8fCBkYXRlT2JqLm1vbnRoO1xuICAgICAgICBuZXdEYXRlT2JqLmRhdGUgPSBkYXRlIHx8IGRhdGVPYmouZGF0ZTtcblxuICAgICAgICBpZiAoIXRoaXMuX2lzUmVzdHJpY3RlZChuZXdEYXRlT2JqKSkge1xuICAgICAgICAgICAgdXRpbC5leHRlbmQoZGF0ZU9iaiwgbmV3RGF0ZU9iaik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc2V0VmFsdWVUb0lucHV0RWxlbWVudCgpO1xuICAgICAgICB0aGlzLl9jYWxlbmRhci5kcmF3KGRhdGVPYmoueWVhciwgZGF0ZU9iai5tb250aCwgZmFsc2UpO1xuXG4gICAgICAgIHRoaXMuZmlyZSgndXBkYXRlJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBvciB1cGRhdGUgZGF0ZS1mb3JtXG4gICAgICogQGFwaVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbZm9ybV0gLSBkYXRlLWZvcm1hdFxuICAgICAqIEBleGFtcGxlXG4gICAgICogIGRhdGVwaWNrZXIuc2V0RGF0ZUZvcm0oJ3l5eXktbW0tZGQnKTtcbiAgICAgKiAgZGF0ZXBpY2tlci5zZXREYXRlRm9ybSgnbW0tZGQsIHl5eXknKTtcbiAgICAgKiAgZGF0ZXBpY2tlci5zZXREYXRlRm9ybSgneS9tL2QnKTtcbiAgICAgKiAgZGF0ZXBpY2tlci5zZXREYXRlRm9ybSgneXkvbW0vZGQnKTtcbiAgICAgKi9cbiAgICBzZXREYXRlRm9ybTogZnVuY3Rpb24oZm9ybSkge1xuICAgICAgICB0aGlzLl9kYXRlRm9ybSA9IGZvcm0gfHwgdGhpcy5fZGF0ZUZvcm07XG4gICAgICAgIHRoaXMuX3NldFJlZ0V4cCgpO1xuICAgICAgICB0aGlzLnNldERhdGUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHdoZXRoZXIgdGhlIGNhbGVuZGFyIGlzIG9wZW5lZCBvciBub3RcbiAgICAgKiBAYXBpXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IC0gdHJ1ZSBpZiBvcGVuZWQsIGZhbHNlIG90aGVyd2lzZVxuICAgICAqL1xuICAgIGlzT3BlbmVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuXyR3cmFwcGVyRWxlbWVudC5jc3MoJ2Rpc3BsYXknKSA9PT0gJ2Jsb2NrJztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIFRpbWVQaWNrZXIgaW5zdGFuY2VcbiAgICAgKiBAYXBpXG4gICAgICogQHJldHVybnMge1RpbWVQaWNrZXJ9IC0gVGltZVBpY2tlciBpbnN0YW5jZVxuICAgICAqL1xuICAgIGdldFRpbWVQaWNrZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdGltZVBpY2tlcjtcbiAgICB9XG59KTtcblxudXRpbC5DdXN0b21FdmVudHMubWl4aW4oRGF0ZVBpY2tlcik7XG5cbm1vZHVsZS5leHBvcnRzID0gRGF0ZVBpY2tlcjtcblxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IG5obmVudCBvbiAxNS4gNC4gMjguLlxuICogQGZpbGVvdmVydmlldyBTcGluYm94IENvbXBvbmVudFxuICogQGF1dGhvciBOSE4gZW50IEZFIGRldiA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPiA8bWlua3l1LnlpQG5obmVudC5jb20+XG4gKiBAZGVwZW5kZW5jeSBqcXVlcnktMS44LjMsIGNvZGUtc25pcHBldC0xLjAuMlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWwgPSB0dWkudXRpbCxcbiAgICBpbkFycmF5ID0gdXRpbC5pbkFycmF5O1xuXG4vKipcbiAqIEBjb25zdHJ1Y3RvclxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfEhUTUxFbGVtZW50fSBjb250YWluZXIgLSBjb250YWluZXIgb2Ygc3BpbmJveFxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25dIC0gb3B0aW9uIGZvciBpbml0aWFsaXphdGlvblxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLmRlZmF1bHRWYWx1ZSA9IDBdIC0gaW5pdGlhbCBzZXR0aW5nIHZhbHVlXG4gKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbi5zdGVwID0gMV0gLSBpZiBzdGVwID0gMiwgdmFsdWUgOiAwIC0+IDIgLT4gNCAtPiAuLi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLm1heCA9IDkwMDcxOTkyNTQ3NDA5OTFdIC0gbWF4IHZhbHVlXG4gKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbi5taW4gPSAtOTAwNzE5OTI1NDc0MDk5MV0gLSBtaW4gdmFsdWVcbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9uLnVwQnRuVGFnID0gYnV0dG9uIEhUTUxdIC0gdXAgYnV0dG9uIGh0bWwgc3RyaW5nXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbi5kb3duQnRuVGFnID0gYnV0dG9uIEhUTUxdIC0gZG93biBidXR0b24gaHRtbCBzdHJpbmdcbiAqIEBwYXJhbSB7QXJyYXl9ICBbb3B0aW9uLmV4Y2x1c2lvbiA9IFtdXSAtIHZhbHVlIHRvIGJlIGV4Y2x1ZGVkLiBpZiB0aGlzIGlzIFsxLDNdLCAwIC0+IDIgLT4gNCAtPiA1IC0+Li4uLlxuICovXG52YXIgU3BpbmJveCA9IHV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBTcGluYm94LnByb3RvdHlwZSAqLyB7XG4gICAgaW5pdDogZnVuY3Rpb24oY29udGFpbmVyLCBvcHRpb24pIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtqUXVlcnl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl8kY29udGFpbmVyRWxlbWVudCA9ICQoY29udGFpbmVyKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge2pRdWVyeX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuXyRpbnB1dEVsZW1lbnQgPSB0aGlzLl8kY29udGFpbmVyRWxlbWVudC5maW5kKCdpbnB1dFt0eXBlPVwidGV4dFwiXScpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fdmFsdWUgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fb3B0aW9uID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge2pRdWVyeX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuXyR1cEJ1dHRvbiA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtqUXVlcnl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl8kZG93bkJ1dHRvbiA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5faW5pdGlhbGl6ZShvcHRpb24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIHdpdGggb3B0aW9uXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbiAtIE9wdGlvbiBmb3IgSW5pdGlhbGl6YXRpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pbml0aWFsaXplOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgdGhpcy5fc2V0T3B0aW9uKG9wdGlvbik7XG4gICAgICAgIHRoaXMuX2Fzc2lnbkhUTUxFbGVtZW50cygpO1xuICAgICAgICB0aGlzLl9hc3NpZ25EZWZhdWx0RXZlbnRzKCk7XG4gICAgICAgIHRoaXMuc2V0VmFsdWUodGhpcy5fb3B0aW9uLmRlZmF1bHRWYWx1ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBhIG9wdGlvbiB0byBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb24gLSBPcHRpb24gdGhhdCB5b3Ugd2FudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldE9wdGlvbjogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIHRoaXMuX29wdGlvbiA9IHtcbiAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogMCxcbiAgICAgICAgICAgIHN0ZXA6IDEsXG4gICAgICAgICAgICBtYXg6IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSIHx8IDkwMDcxOTkyNTQ3NDA5OTEsXG4gICAgICAgICAgICBtaW46IE51bWJlci5NSU5fU0FGRV9JTlRFR0VSIHx8IC05MDA3MTk5MjU0NzQwOTkxLFxuICAgICAgICAgICAgdXBCdG5UYWc6ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIj48Yj4rPC9iPjwvYnV0dG9uPicsXG4gICAgICAgICAgICBkb3duQnRuVGFnOiAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCI+PGI+LTwvYj48L2J1dHRvbj4nXG4gICAgICAgIH07XG4gICAgICAgIHV0aWwuZXh0ZW5kKHRoaXMuX29wdGlvbiwgb3B0aW9uKTtcblxuICAgICAgICBpZiAoIXV0aWwuaXNBcnJheSh0aGlzLl9vcHRpb24uZXhjbHVzaW9uKSkge1xuICAgICAgICAgICAgdGhpcy5fb3B0aW9uLmV4Y2x1c2lvbiA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLl9pc1ZhbGlkT3B0aW9uKCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU3BpbmJveCBvcHRpb24gaXMgaW52YWlsZCcpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGlzIGEgdmFsaWQgb3B0aW9uP1xuICAgICAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc1ZhbGlkT3B0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wdCA9IHRoaXMuX29wdGlvbjtcblxuICAgICAgICByZXR1cm4gKHRoaXMuX2lzVmFsaWRWYWx1ZShvcHQuZGVmYXVsdFZhbHVlKSAmJiB0aGlzLl9pc1ZhbGlkU3RlcChvcHQuc3RlcCkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBpcyBhIHZhbGlkIHZhbHVlP1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSBmb3Igc3BpbmJveFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc1ZhbGlkVmFsdWU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHZhciBvcHQsXG4gICAgICAgICAgICBpc0JldHdlZW4sXG4gICAgICAgICAgICBpc05vdEluQXJyYXk7XG5cbiAgICAgICAgaWYgKCF1dGlsLmlzTnVtYmVyKHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgb3B0ID0gdGhpcy5fb3B0aW9uO1xuICAgICAgICBpc0JldHdlZW4gPSB2YWx1ZSA8PSBvcHQubWF4ICYmIHZhbHVlID49IG9wdC5taW47XG4gICAgICAgIGlzTm90SW5BcnJheSA9IChpbkFycmF5KHZhbHVlLCBvcHQuZXhjbHVzaW9uKSA9PT0gLTEpO1xuXG4gICAgICAgIHJldHVybiAoaXNCZXR3ZWVuICYmIGlzTm90SW5BcnJheSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGlzIGEgdmFsaWQgc3RlcD9cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RlcCBmb3Igc3BpbmJveCB1cC9kb3duXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHJlc3VsdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2lzVmFsaWRTdGVwOiBmdW5jdGlvbihzdGVwKSB7XG4gICAgICAgIHZhciBtYXhTdGVwID0gKHRoaXMuX29wdGlvbi5tYXggLSB0aGlzLl9vcHRpb24ubWluKTtcblxuICAgICAgICByZXR1cm4gKHV0aWwuaXNOdW1iZXIoc3RlcCkgJiYgc3RlcCA8IG1heFN0ZXApO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBc3NpZ24gZWxlbWVudHMgdG8gaW5zaWRlIG9mIGNvbnRhaW5lci5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hc3NpZ25IVE1MRWxlbWVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9zZXRJbnB1dFNpemVBbmRNYXhMZW5ndGgoKTtcbiAgICAgICAgdGhpcy5fbWFrZUJ1dHRvbigpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNYWtlIHVwL2Rvd24gYnV0dG9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZUJ1dHRvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkaW5wdXQgPSB0aGlzLl8kaW5wdXRFbGVtZW50LFxuICAgICAgICAgICAgJHVwQnRuID0gdGhpcy5fJHVwQnV0dG9uID0gJCh0aGlzLl9vcHRpb24udXBCdG5UYWcpLFxuICAgICAgICAgICAgJGRvd25CdG4gPSB0aGlzLl8kZG93bkJ1dHRvbiA9ICQodGhpcy5fb3B0aW9uLmRvd25CdG5UYWcpO1xuXG4gICAgICAgICR1cEJ0bi5pbnNlcnRCZWZvcmUoJGlucHV0KTtcbiAgICAgICAgJHVwQnRuLndyYXAoJzxkaXY+PC9kaXY+Jyk7XG4gICAgICAgICRkb3duQnRuLmluc2VydEFmdGVyKCRpbnB1dCk7XG4gICAgICAgICRkb3duQnRuLndyYXAoJzxkaXY+PC9kaXY+Jyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBzaXplL21heGxlbmd0aCBhdHRyaWJ1dGVzIG9mIGlucHV0IGVsZW1lbnQuXG4gICAgICogRGVmYXVsdCB2YWx1ZSBpcyBhIGRpZ2l0cyBvZiBhIGxvbmdlciB2YWx1ZSBvZiBvcHRpb24ubWluIG9yIG9wdGlvbi5tYXhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRJbnB1dFNpemVBbmRNYXhMZW5ndGg6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJGlucHV0ID0gdGhpcy5fJGlucHV0RWxlbWVudCxcbiAgICAgICAgICAgIG1pblZhbHVlTGVuZ3RoID0gU3RyaW5nKHRoaXMuX29wdGlvbi5taW4pLmxlbmd0aCxcbiAgICAgICAgICAgIG1heFZhbHVlTGVuZ3RoID0gU3RyaW5nKHRoaXMuX29wdGlvbi5tYXgpLmxlbmd0aCxcbiAgICAgICAgICAgIG1heGxlbmd0aCA9IE1hdGgubWF4KG1pblZhbHVlTGVuZ3RoLCBtYXhWYWx1ZUxlbmd0aCk7XG5cbiAgICAgICAgaWYgKCEkaW5wdXQuYXR0cignc2l6ZScpKSB7XG4gICAgICAgICAgICAkaW5wdXQuYXR0cignc2l6ZScsIG1heGxlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEkaW5wdXQuYXR0cignbWF4bGVuZ3RoJykpIHtcbiAgICAgICAgICAgICRpbnB1dC5hdHRyKCdtYXhsZW5ndGgnLCBtYXhsZW5ndGgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFzc2lnbiBkZWZhdWx0IGV2ZW50cyB0byB1cC9kb3duIGJ1dHRvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Fzc2lnbkRlZmF1bHRFdmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb25DbGljayA9IHV0aWwuYmluZCh0aGlzLl9vbkNsaWNrQnV0dG9uLCB0aGlzKSxcbiAgICAgICAgICAgIG9uS2V5RG93biA9IHV0aWwuYmluZCh0aGlzLl9vbktleURvd25JbnB1dEVsZW1lbnQsIHRoaXMpO1xuXG4gICAgICAgIHRoaXMuXyR1cEJ1dHRvbi5vbignY2xpY2snLCB7aXNEb3duOiBmYWxzZX0sIG9uQ2xpY2spO1xuICAgICAgICB0aGlzLl8kZG93bkJ1dHRvbi5vbignY2xpY2snLCB7aXNEb3duOiB0cnVlfSwgb25DbGljayk7XG4gICAgICAgIHRoaXMuXyRpbnB1dEVsZW1lbnQub24oJ2tleWRvd24nLCBvbktleURvd24pO1xuICAgICAgICB0aGlzLl8kaW5wdXRFbGVtZW50Lm9uKCdjaGFuZ2UnLCB1dGlsLmJpbmQodGhpcy5fb25DaGFuZ2VJbnB1dCwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgaW5wdXQgdmFsdWUgd2hlbiB1c2VyIGNsaWNrIGEgYnV0dG9uLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNEb3duIC0gSWYgYSB1c2VyIGNsaWNrZWQgYSBkb3duLWJ1dHR0b24sIHRoaXMgdmFsdWUgaXMgdHJ1ZS4gIEVsc2UgaWYgYSB1c2VyIGNsaWNrZWQgYSB1cC1idXR0b24sIHRoaXMgdmFsdWUgaXMgZmFsc2UuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0TmV4dFZhbHVlOiBmdW5jdGlvbihpc0Rvd24pIHtcbiAgICAgICAgdmFyIG9wdCA9IHRoaXMuX29wdGlvbixcbiAgICAgICAgICAgIHN0ZXAgPSBvcHQuc3RlcCxcbiAgICAgICAgICAgIG1pbiA9IG9wdC5taW4sXG4gICAgICAgICAgICBtYXggPSBvcHQubWF4LFxuICAgICAgICAgICAgZXhjbHVzaW9uID0gb3B0LmV4Y2x1c2lvbixcbiAgICAgICAgICAgIG5leHRWYWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblxuICAgICAgICBpZiAoaXNEb3duKSB7XG4gICAgICAgICAgICBzdGVwID0gLXN0ZXA7XG4gICAgICAgIH1cblxuICAgICAgICBkbyB7XG4gICAgICAgICAgICBuZXh0VmFsdWUgKz0gc3RlcDtcbiAgICAgICAgICAgIGlmIChuZXh0VmFsdWUgPiBtYXgpIHtcbiAgICAgICAgICAgICAgICBuZXh0VmFsdWUgPSBtaW47XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5leHRWYWx1ZSA8IG1pbikge1xuICAgICAgICAgICAgICAgIG5leHRWYWx1ZSA9IG1heDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSB3aGlsZSAoaW5BcnJheShuZXh0VmFsdWUsIGV4Y2x1c2lvbikgPiAtMSk7XG5cbiAgICAgICAgdGhpcy5zZXRWYWx1ZShuZXh0VmFsdWUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBET00oVXAvRG93biBidXR0b24pIENsaWNrIEV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCBldmVudC1vYmplY3RcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkNsaWNrQnV0dG9uOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB0aGlzLl9zZXROZXh0VmFsdWUoZXZlbnQuZGF0YS5pc0Rvd24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBET00oSW5wdXQgZWxlbWVudCkgS2V5ZG93biBFdmVudCBoYW5kbGVyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgZXZlbnQtb2JqZWN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25LZXlEb3duSW5wdXRFbGVtZW50OiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIga2V5Q29kZSA9IGV2ZW50LndoaWNoIHx8IGV2ZW50LmtleUNvZGUsXG4gICAgICAgICAgICBpc0Rvd247XG4gICAgICAgIHN3aXRjaCAoa2V5Q29kZSkge1xuICAgICAgICAgICAgY2FzZSAzODogaXNEb3duID0gZmFsc2U7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA0MDogaXNEb3duID0gdHJ1ZTsgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OiByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9zZXROZXh0VmFsdWUoaXNEb3duKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRE9NKElucHV0IGVsZW1lbnQpIENoYW5nZSBFdmVudCBoYW5kbGVyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfb25DaGFuZ2VJbnB1dDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBuZXdWYWx1ZSA9IE51bWJlcih0aGlzLl8kaW5wdXRFbGVtZW50LnZhbCgpKSxcbiAgICAgICAgICAgIGlzQ2hhbmdlID0gdGhpcy5faXNWYWxpZFZhbHVlKG5ld1ZhbHVlKSAmJiB0aGlzLl92YWx1ZSAhPT0gbmV3VmFsdWUsXG4gICAgICAgICAgICBuZXh0VmFsdWUgPSAoaXNDaGFuZ2UpID8gbmV3VmFsdWUgOiB0aGlzLl92YWx1ZTtcblxuICAgICAgICB0aGlzLl92YWx1ZSA9IG5leHRWYWx1ZTtcbiAgICAgICAgdGhpcy5fJGlucHV0RWxlbWVudC52YWwobmV4dFZhbHVlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IHN0ZXAgb2Ygc3BpbmJveFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIGZvciBzcGluYm94XG4gICAgICovXG4gICAgc2V0U3RlcDogZnVuY3Rpb24oc3RlcCkge1xuICAgICAgICBpZiAoIXRoaXMuX2lzVmFsaWRTdGVwKHN0ZXApKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fb3B0aW9uLnN0ZXAgPSBzdGVwO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBnZXQgc3RlcCBvZiBzcGluYm94XG4gICAgICogQHJldHVybnMge251bWJlcn0gc3RlcFxuICAgICAqL1xuICAgIGdldFN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9uLnN0ZXA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBhIGlucHV0IHZhbHVlLlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IERhdGEgaW4gaW5wdXQtYm94XG4gICAgICovXG4gICAgZ2V0VmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBhIHZhbHVlIHRvIGlucHV0LWJveC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBWYWx1ZSB0aGF0IHlvdSB3YW50XG4gICAgICovXG4gICAgc2V0VmFsdWU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuXyRpbnB1dEVsZW1lbnQudmFsKHZhbHVlKS5jaGFuZ2UoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGEgb3B0aW9uIG9mIGluc3RhbmNlLlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IE9wdGlvbiBvZiBpbnN0YW5jZVxuICAgICAqL1xuICAgIGdldE9wdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vcHRpb247XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCB2YWx1ZSB0aGF0IHdpbGwgYmUgZXhjbHVkZWQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gVmFsdWUgdGhhdCB3aWxsIGJlIGV4Y2x1ZGVkLlxuICAgICAqL1xuICAgIGFkZEV4Y2x1c2lvbjogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgdmFyIGV4Y2x1c2lvbiA9IHRoaXMuX29wdGlvbi5leGNsdXNpb247XG5cbiAgICAgICAgaWYgKGluQXJyYXkodmFsdWUsIGV4Y2x1c2lvbikgPiAtMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGV4Y2x1c2lvbi5wdXNoKHZhbHVlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGEgdmFsdWUgd2hpY2ggd2FzIGV4Y2x1ZGVkLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIFZhbHVlIHRoYXQgd2lsbCBiZSByZW1vdmVkIGZyb20gYSBleGNsdXNpb24gbGlzdCBvZiBpbnN0YW5jZVxuICAgICAqL1xuICAgIHJlbW92ZUV4Y2x1c2lvbjogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgdmFyIGV4Y2x1c2lvbiA9IHRoaXMuX29wdGlvbi5leGNsdXNpb24sXG4gICAgICAgICAgICBpbmRleCA9IGluQXJyYXkodmFsdWUsIGV4Y2x1c2lvbik7XG5cbiAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGV4Y2x1c2lvbi5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBnZXQgY29udGFpbmVyIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH0gZWxlbWVudFxuICAgICAqL1xuICAgIGdldENvbnRhaW5lckVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fJGNvbnRhaW5lckVsZW1lbnRbMF07XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU3BpbmJveDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBUaW1lUGlja2VyIENvbXBvbmVudFxuICogQGF1dGhvciBOSE4gZW50IEZFIGRldiA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPiA8bWlua3l1LnlpQG5obmVudC5jb20+XG4gKiBAZGVwZW5kZW5jeSBqcXVlcnktMS44LjMsIGNvZGUtc25pcHBldC0xLjAuMiwgc3BpbmJveC5qc1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWwgPSB0dWkudXRpbCxcbiAgICBTcGluYm94ID0gcmVxdWlyZSgnLi9zcGluYm94JyksXG4gICAgdGltZVJlZ0V4cCA9IC9cXHMqKFxcZHsxLDJ9KVxccyo6XFxzKihcXGR7MSwyfSlcXHMqKFthcF1bbV0pPyg/OltcXHNcXFNdKikvaSxcbiAgICB0aW1lUGlja2VyVGFnID0gJzx0YWJsZSBjbGFzcz1cInRpbWVwaWNrZXJcIj48dHIgY2xhc3M9XCJ0aW1lcGlja2VyLXJvd1wiPjwvdHI+PC90YWJsZT4nLFxuICAgIGNvbHVtblRhZyA9ICc8dGQgY2xhc3M9XCJ0aW1lcGlja2VyLWNvbHVtblwiPjwvdGQ+JyxcbiAgICBzcGluQm94VGFnID0gJzx0ZCBjbGFzcz1cInRpbWVwaWNrZXItY29sdW1uIHRpbWVwaWNrZXItc3BpbmJveFwiPjxkaXY+PGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJ0aW1lcGlja2VyLXNwaW5ib3gtaW5wdXRcIj48L2Rpdj48L3RkPicsXG4gICAgdXBCdG5UYWcgPSAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJ0aW1lcGlja2VyLWJ0biB0aW1lcGlja2VyLWJ0bi11cFwiPjxiPis8L2I+PC9idXR0b24+JyxcbiAgICBkb3duQnRuVGFnID0gJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwidGltZXBpY2tlci1idG4gdGltZXBpY2tlci1idG4tZG93blwiPjxiPi08L2I+PC9idXR0b24+JztcblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uXSAtIG9wdGlvbiBmb3IgaW5pdGlhbGl6YXRpb25cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbi5kZWZhdWx0SG91ciA9IDBdIC0gaW5pdGlhbCBzZXR0aW5nIHZhbHVlIG9mIGhvdXJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLmRlZmF1bHRNaW51dGUgPSAwXSAtIGluaXRpYWwgc2V0dGluZyB2YWx1ZSBvZiBtaW51dGVcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IFtvcHRpb24uaW5wdXRFbGVtZW50ID0gbnVsbF0gLSBvcHRpb25hbCBpbnB1dCBlbGVtZW50IHdpdGggdGltZXBpY2tlclxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb24uaG91clN0ZXAgPSAxXSAtIHN0ZXAgb2YgaG91ciBzcGluYm94LiBpZiBzdGVwID0gMiwgaG91ciB2YWx1ZSAxIC0+IDMgLT4gNSAtPiAuLi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9uLm1pbnV0ZVN0ZXAgPSAxXSAtIHN0ZXAgb2YgbWludXRlIHNwaW5ib3guIGlmIHN0ZXAgPSAyLCBtaW51dGUgdmFsdWUgMSAtPiAzIC0+IDUgLT4gLi4uXG4gKiBAcGFyYW0ge0FycmF5fSBbb3B0aW9uLmhvdXJFeGNsdXNpb24gPSBudWxsXSAtIGhvdXIgdmFsdWUgdG8gYmUgZXhjbHVkZWQuIGlmIGhvdXIgWzEsM10gaXMgZXhjbHVkZWQsIGhvdXIgdmFsdWUgMCAtPiAyIC0+IDQgLT4gNSAtPiAuLi5cbiAqIEBwYXJhbSB7QXJyYXl9IFtvcHRpb24ubWludXRlRXhjbHVzaW9uID0gbnVsbF0gLSBtaW51dGUgdmFsdWUgdG8gYmUgZXhjbHVkZWQuIGlmIG1pbnV0ZSBbMSwzXSBpcyBleGNsdWRlZCwgbWludXRlIHZhbHVlIDAgLT4gMiAtPiA0IC0+IDUgLT4gLi4uXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb24uc2hvd01lcmlkaWFuID0gZmFsc2VdIC0gaXMgdGltZSBleHByZXNzaW9uLVwiaGg6bW0gQU0vUE1cIj9cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uLnBvc2l0aW9uID0ge31dIC0gbGVmdCwgdG9wIHBvc2l0aW9uIG9mIHRpbWVwaWNrZXIgZWxlbWVudFxuICovXG52YXIgVGltZVBpY2tlciA9IHV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBUaW1lUGlja2VyLnByb3RvdHlwZSAqLyB7XG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7alF1ZXJ5fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy4kdGltZVBpY2tlckVsZW1lbnQgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7alF1ZXJ5fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fJGlucHV0RWxlbWVudCA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtqUXVlcnl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl8kbWVyaWRpYW5FbGVtZW50ID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge1NwaW5ib3h9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9ob3VyU3BpbmJveCA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtTcGluYm94fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fbWludXRlU3BpbmJveCA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHRpbWUgcGlja2VyIGVsZW1lbnQgc2hvdyB1cD9cbiAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9pc1Nob3duID0gZmFsc2U7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9vcHRpb24gPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5faG91ciA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9taW51dGUgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuX2luaXRpYWxpemUob3B0aW9uKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSB3aXRoIG9wdGlvblxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb24gZm9yIHRpbWUgcGlja2VyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIHRoaXMuX3NldE9wdGlvbihvcHRpb24pO1xuICAgICAgICB0aGlzLl9tYWtlU3BpbmJveGVzKCk7XG4gICAgICAgIHRoaXMuX21ha2VUaW1lUGlja2VyRWxlbWVudCgpO1xuICAgICAgICB0aGlzLl9hc3NpZ25EZWZhdWx0RXZlbnRzKCk7XG4gICAgICAgIHRoaXMuZnJvbVNwaW5ib3hlcygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgb3B0aW9uXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbiBmb3IgdGltZSBwaWNrZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRPcHRpb246IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICB0aGlzLl9vcHRpb24gPSB7XG4gICAgICAgICAgICBkZWZhdWx0SG91cjogMCxcbiAgICAgICAgICAgIGRlZmF1bHRNaW51dGU6IDAsXG4gICAgICAgICAgICBpbnB1dEVsZW1lbnQ6IG51bGwsXG4gICAgICAgICAgICBob3VyU3RlcDogMSxcbiAgICAgICAgICAgIG1pbnV0ZVN0ZXA6IDEsXG4gICAgICAgICAgICBob3VyRXhjbHVzaW9uOiBudWxsLFxuICAgICAgICAgICAgbWludXRlRXhjbHVzaW9uOiBudWxsLFxuICAgICAgICAgICAgc2hvd01lcmlkaWFuOiBmYWxzZSxcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7fVxuICAgICAgICB9O1xuXG4gICAgICAgIHV0aWwuZXh0ZW5kKHRoaXMuX29wdGlvbiwgb3B0aW9uKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogbWFrZSBzcGluYm94ZXMgKGhvdXIgJiBtaW51dGUpXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbWFrZVNwaW5ib3hlczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcHQgPSB0aGlzLl9vcHRpb247XG5cbiAgICAgICAgdGhpcy5faG91clNwaW5ib3ggPSBuZXcgU3BpbmJveChzcGluQm94VGFnLCB7XG4gICAgICAgICAgICBkZWZhdWx0VmFsdWU6IG9wdC5kZWZhdWx0SG91cixcbiAgICAgICAgICAgIG1pbjogMCxcbiAgICAgICAgICAgIG1heDogMjMsXG4gICAgICAgICAgICBzdGVwOiBvcHQuaG91clN0ZXAsXG4gICAgICAgICAgICB1cEJ0blRhZzogdXBCdG5UYWcsXG4gICAgICAgICAgICBkb3duQnRuVGFnOiBkb3duQnRuVGFnLFxuICAgICAgICAgICAgZXhjbHVzaW9uOiBvcHQuaG91ckV4Y2x1c2lvblxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9taW51dGVTcGluYm94ID0gbmV3IFNwaW5ib3goc3BpbkJveFRhZywge1xuICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiBvcHQuZGVmYXVsdE1pbnV0ZSxcbiAgICAgICAgICAgIG1pbjogMCxcbiAgICAgICAgICAgIG1heDogNTksXG4gICAgICAgICAgICBzdGVwOiBvcHQubWludXRlU3RlcCxcbiAgICAgICAgICAgIHVwQnRuVGFnOiB1cEJ0blRhZyxcbiAgICAgICAgICAgIGRvd25CdG5UYWc6IGRvd25CdG5UYWcsXG4gICAgICAgICAgICBleGNsdXNpb246IG9wdC5taW51dGVFeGNsdXNpb25cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG1ha2UgdGltZXBpY2tlciBjb250YWluZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9tYWtlVGltZVBpY2tlckVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3B0ID0gdGhpcy5fb3B0aW9uLFxuICAgICAgICAgICAgJHRwID0gJCh0aW1lUGlja2VyVGFnKSxcbiAgICAgICAgICAgICR0cFJvdyA9ICR0cC5maW5kKCcudGltZXBpY2tlci1yb3cnKSxcbiAgICAgICAgICAgICRtZXJpZGlhbixcbiAgICAgICAgICAgICRjb2xvbiA9ICQoY29sdW1uVGFnKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnY29sb24nKVxuICAgICAgICAgICAgICAgIC5hcHBlbmQoJzonKTtcblxuXG4gICAgICAgICR0cFJvdy5hcHBlbmQodGhpcy5faG91clNwaW5ib3guZ2V0Q29udGFpbmVyRWxlbWVudCgpLCAkY29sb24sIHRoaXMuX21pbnV0ZVNwaW5ib3guZ2V0Q29udGFpbmVyRWxlbWVudCgpKTtcblxuICAgICAgICBpZiAob3B0LnNob3dNZXJpZGlhbikge1xuICAgICAgICAgICAgJG1lcmlkaWFuID0gJChjb2x1bW5UYWcpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCdtZXJpZGlhbicpXG4gICAgICAgICAgICAgICAgLmFwcGVuZCh0aGlzLl9pc1BNID8gJ1BNJyA6ICdBTScpO1xuICAgICAgICAgICAgdGhpcy5fJG1lcmlkaWFuRWxlbWVudCA9ICRtZXJpZGlhbjtcbiAgICAgICAgICAgICR0cFJvdy5hcHBlbmQoJG1lcmlkaWFuKTtcbiAgICAgICAgfVxuXG4gICAgICAgICR0cC5oaWRlKCk7XG4gICAgICAgICQoJ2JvZHknKS5hcHBlbmQoJHRwKTtcbiAgICAgICAgdGhpcy4kdGltZVBpY2tlckVsZW1lbnQgPSAkdHA7XG5cbiAgICAgICAgaWYgKG9wdC5pbnB1dEVsZW1lbnQpIHtcbiAgICAgICAgICAgICR0cC5jc3MoJ3Bvc2l0aW9uJywgJ2Fic29sdXRlJyk7XG4gICAgICAgICAgICB0aGlzLl8kaW5wdXRFbGVtZW50ID0gJChvcHQuaW5wdXRFbGVtZW50KTtcbiAgICAgICAgICAgIHRoaXMuX3NldERlZmF1bHRQb3NpdGlvbih0aGlzLl8kaW5wdXRFbGVtZW50KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgcG9zaXRpb24gb2YgdGltZXBpY2tlciBjb250YWluZXJcbiAgICAgKiBAcGFyYW0ge2pRdWVyeX0gJGlucHV0IGpxdWVyeS1vYmplY3QgKGVsZW1lbnQpXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0RGVmYXVsdFBvc2l0aW9uOiBmdW5jdGlvbigkaW5wdXQpIHtcbiAgICAgICAgdmFyIGlucHV0RWwgPSAkaW5wdXRbMF0sXG4gICAgICAgICAgICBwb3NpdGlvbiA9IHRoaXMuX29wdGlvbi5wb3NpdGlvbixcbiAgICAgICAgICAgIHggPSBwb3NpdGlvbi54LFxuICAgICAgICAgICAgeSA9IHBvc2l0aW9uLnk7XG5cbiAgICAgICAgaWYgKCF1dGlsLmlzTnVtYmVyKHgpIHx8ICF1dGlsLmlzTnVtYmVyKHkpKSB7XG4gICAgICAgICAgICB4ID0gaW5wdXRFbC5vZmZzZXRMZWZ0O1xuICAgICAgICAgICAgeSA9IGlucHV0RWwub2Zmc2V0VG9wICsgaW5wdXRFbC5vZmZzZXRIZWlnaHQgKyAzO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0WFlQb3NpdGlvbih4LCB5KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogYXNzaWduIGRlZmF1bHQgZXZlbnRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXNzaWduRGVmYXVsdEV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkaW5wdXQgPSB0aGlzLl8kaW5wdXRFbGVtZW50O1xuXG4gICAgICAgIGlmICgkaW5wdXQpIHtcbiAgICAgICAgICAgIHRoaXMuX2Fzc2lnbkV2ZW50c1RvSW5wdXRFbGVtZW50KCk7XG4gICAgICAgICAgICB0aGlzLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkaW5wdXQudmFsKHRoaXMuZ2V0VGltZSgpKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuJHRpbWVQaWNrZXJFbGVtZW50Lm9uKCdjaGFuZ2UnLCB1dGlsLmJpbmQodGhpcy5fb25DaGFuZ2VUaW1lUGlja2VyLCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGF0dGFjaCBldmVudCB0byBJbnB1dCBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXNzaWduRXZlbnRzVG9JbnB1dEVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICAkaW5wdXQgPSB0aGlzLl8kaW5wdXRFbGVtZW50O1xuXG4gICAgICAgICRpbnB1dC5vbignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgc2VsZi5vcGVuKGV2ZW50KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJGlucHV0Lm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICghc2VsZi5zZXRUaW1lRnJvbUlucHV0RWxlbWVudCgpKSB7XG4gICAgICAgICAgICAgICAgJGlucHV0LnZhbChzZWxmLmdldFRpbWUoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBkb20gZXZlbnQgaGFuZGxlciAodGltZXBpY2tlcilcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkNoYW5nZVRpbWVQaWNrZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmZyb21TcGluYm94ZXMoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogaXMgY2xpY2tlZCBpbnNpZGUgb2YgY29udGFpbmVyP1xuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IGV2ZW50LW9iamVjdFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSByZXN1bHRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc0NsaWNrZWRJbnNpZGU6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHZhciBpc0NvbnRhaW5zID0gJC5jb250YWlucyh0aGlzLiR0aW1lUGlja2VyRWxlbWVudFswXSwgZXZlbnQudGFyZ2V0KSxcbiAgICAgICAgICAgIGlzSW5wdXRFbGVtZW50ID0gKHRoaXMuXyRpbnB1dEVsZW1lbnQgJiYgdGhpcy5fJGlucHV0RWxlbWVudFswXSA9PT0gZXZlbnQudGFyZ2V0KTtcblxuICAgICAgICByZXR1cm4gaXNDb250YWlucyB8fCBpc0lucHV0RWxlbWVudDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogdHJhbnNmb3JtIHRpbWUgaW50byBmb3JtYXR0ZWQgc3RyaW5nXG4gICAgICogQHJldHVybnMge3N0cmluZ30gdGltZSBzdHJpbmdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9mb3JtVG9UaW1lRm9ybWF0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGhvdXIgPSB0aGlzLl9ob3VyLFxuICAgICAgICAgICAgbWludXRlID0gdGhpcy5fbWludXRlLFxuICAgICAgICAgICAgcG9zdGZpeCA9IHRoaXMuX2dldFBvc3RmaXgoKSxcbiAgICAgICAgICAgIGZvcm1hdHRlZEhvdXIsXG4gICAgICAgICAgICBmb3JtYXR0ZWRNaW51dGU7XG5cbiAgICAgICAgaWYgKHRoaXMuX29wdGlvbi5zaG93TWVyaWRpYW4pIHtcbiAgICAgICAgICAgIGhvdXIgJT0gMTI7XG4gICAgICAgIH1cblxuICAgICAgICBmb3JtYXR0ZWRIb3VyID0gKGhvdXIgPCAxMCkgPyAnMCcgKyBob3VyIDogaG91cjtcbiAgICAgICAgZm9ybWF0dGVkTWludXRlID0gKG1pbnV0ZSA8IDEwKSA/ICcwJyArIG1pbnV0ZSA6IG1pbnV0ZTtcbiAgICAgICAgcmV0dXJuIGZvcm1hdHRlZEhvdXIgKyAnOicgKyBmb3JtYXR0ZWRNaW51dGUgKyBwb3N0Zml4O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgdGhlIGJvb2xlYW4gdmFsdWUgJ2lzUE0nIHdoZW4gQU0vUE0gb3B0aW9uIGlzIHRydWUuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0SXNQTTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2lzUE0gPSAodGhpcy5faG91ciA+IDExKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogZ2V0IHBvc3RmaXggd2hlbiBBTS9QTSBvcHRpb24gaXMgdHJ1ZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBwb3N0Zml4IChBTS9QTSlcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRQb3N0Zml4OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBvc3RmaXggPSAnJztcblxuICAgICAgICBpZiAodGhpcy5fb3B0aW9uLnNob3dNZXJpZGlhbikge1xuICAgICAgICAgICAgcG9zdGZpeCA9ICh0aGlzLl9pc1BNKSA/ICcgUE0nIDogJyBBTSc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBvc3RmaXg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCBwb3NpdGlvbiBvZiBjb250YWluZXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geCAtIGl0IHdpbGwgYmUgb2Zmc2V0TGVmdCBvZiBlbGVtZW50XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHkgLSBpdCB3aWxsIGJlIG9mZnNldFRvcCBvZiBlbGVtZW50XG4gICAgICovXG4gICAgc2V0WFlQb3NpdGlvbjogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICB2YXIgcG9zaXRpb247XG5cbiAgICAgICAgaWYgKCF1dGlsLmlzTnVtYmVyKHgpIHx8ICF1dGlsLmlzTnVtYmVyKHkpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBwb3NpdGlvbiA9IHRoaXMuX29wdGlvbi5wb3NpdGlvbjtcbiAgICAgICAgcG9zaXRpb24ueCA9IHg7XG4gICAgICAgIHBvc2l0aW9uLnkgPSB5O1xuICAgICAgICB0aGlzLiR0aW1lUGlja2VyRWxlbWVudC5jc3Moe2xlZnQ6IHgsIHRvcDogeX0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzaG93IHRpbWUgcGlja2VyIGVsZW1lbnRcbiAgICAgKi9cbiAgICBzaG93OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy4kdGltZVBpY2tlckVsZW1lbnQuc2hvdygpO1xuICAgICAgICB0aGlzLl9pc1Nob3duID0gdHJ1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogaGlkZSB0aW1lIHBpY2tlciBlbGVtZW50XG4gICAgICovXG4gICAgaGlkZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuJHRpbWVQaWNrZXJFbGVtZW50LmhpZGUoKTtcbiAgICAgICAgdGhpcy5faXNTaG93biA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBsaXN0ZW5lciB0byBzaG93IGNvbnRhaW5lclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IGV2ZW50LW9iamVjdFxuICAgICAqL1xuICAgIG9wZW46IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLl9pc1Nob3duKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCB1dGlsLmJpbmQodGhpcy5jbG9zZSwgdGhpcykpO1xuICAgICAgICB0aGlzLnNob3coKTtcbiAgICAgICAgdGhpcy5maXJlKCdvcGVuJywgZXZlbnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBsaXN0ZW5lciB0byBoaWRlIGNvbnRhaW5lclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IGV2ZW50LW9iamVjdFxuICAgICAqL1xuICAgIGNsb3NlOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBpZiAoIXRoaXMuX2lzU2hvd24gfHwgdGhpcy5faXNDbGlja2VkSW5zaWRlKGV2ZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgJChkb2N1bWVudCkub2ZmKGV2ZW50KTtcbiAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgIHRoaXMuZmlyZSgnY2xvc2UnLCBldmVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCB2YWx1ZXMgaW4gc3BpbmJveGVzIGZyb20gdGltZVxuICAgICAqL1xuICAgIHRvU3BpbmJveGVzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGhvdXIgPSB0aGlzLl9ob3VyLFxuICAgICAgICAgICAgbWludXRlID0gdGhpcy5fbWludXRlO1xuXG4gICAgICAgIHRoaXMuX2hvdXJTcGluYm94LnNldFZhbHVlKGhvdXIpO1xuICAgICAgICB0aGlzLl9taW51dGVTcGluYm94LnNldFZhbHVlKG1pbnV0ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCB0aW1lIGZyb20gc3BpbmJveGVzIHZhbHVlc1xuICAgICAqL1xuICAgIGZyb21TcGluYm94ZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaG91ciA9IHRoaXMuX2hvdXJTcGluYm94LmdldFZhbHVlKCksXG4gICAgICAgICAgICBtaW51dGUgPSB0aGlzLl9taW51dGVTcGluYm94LmdldFZhbHVlKCk7XG5cbiAgICAgICAgdGhpcy5zZXRUaW1lKGhvdXIsIG1pbnV0ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCB0aW1lIGZyb20gaW5wdXQgZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fGpRdWVyeX0gW2lucHV0RWxlbWVudF0ganF1ZXJ5IG9iamVjdCAoZWxlbWVudClcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSByZXN1bHQgb2Ygc2V0IHRpbWVcbiAgICAgKi9cbiAgICBzZXRUaW1lRnJvbUlucHV0RWxlbWVudDogZnVuY3Rpb24oaW5wdXRFbGVtZW50KSB7XG4gICAgICAgIHZhciBpbnB1dCA9ICQoaW5wdXRFbGVtZW50KVswXSB8fCB0aGlzLl8kaW5wdXRFbGVtZW50WzBdO1xuICAgICAgICByZXR1cm4gISEoaW5wdXQgJiYgdGhpcy5zZXRUaW1lRnJvbVN0cmluZyhpbnB1dC52YWx1ZSkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgaG91clxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBob3VyIGZvciB0aW1lIHBpY2tlclxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHJlc3VsdCBvZiBzZXQgdGltZVxuICAgICAqL1xuICAgIHNldEhvdXI6IGZ1bmN0aW9uKGhvdXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0VGltZShob3VyLCB0aGlzLl9taW51dGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgbWludXRlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbnV0ZSBmb3IgdGltZSBwaWNrZXJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSByZXN1bHQgb2Ygc2V0IHRpbWVcbiAgICAgKi9cbiAgICBzZXRNaW51dGU6IGZ1bmN0aW9uKG1pbnV0ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRUaW1lKHRoaXMuX2hvdXIsIG1pbnV0ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCB0aW1lXG4gICAgICogQGFwaVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBob3VyIGZvciB0aW1lIHBpY2tlclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW51dGUgZm9yIHRpbWUgcGlja2VyXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gcmVzdWx0IG9mIHNldCB0aW1lXG4gICAgICovXG4gICAgc2V0VGltZTogZnVuY3Rpb24oaG91ciwgbWludXRlKSB7XG4gICAgICAgIHZhciBpc051bWJlciA9ICh1dGlsLmlzTnVtYmVyKGhvdXIpICYmIHV0aWwuaXNOdW1iZXIobWludXRlKSksXG4gICAgICAgICAgICBpc0NoYW5nZSA9ICh0aGlzLl9ob3VyICE9PSBob3VyIHx8IHRoaXMuX21pbnV0ZSAhPT0gbWludXRlKSxcbiAgICAgICAgICAgIGlzVmFsaWQgPSAoaG91ciA8IDI0ICYmIG1pbnV0ZSA8IDYwKTtcblxuICAgICAgICBpZiAoIWlzTnVtYmVyIHx8ICFpc0NoYW5nZSB8fCAhaXNWYWxpZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5faG91ciA9IGhvdXI7XG4gICAgICAgIHRoaXMuX21pbnV0ZSA9IG1pbnV0ZTtcbiAgICAgICAgdGhpcy5fc2V0SXNQTSgpO1xuICAgICAgICB0aGlzLnRvU3BpbmJveGVzKCk7XG4gICAgICAgIGlmICh0aGlzLl8kbWVyaWRpYW5FbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLl8kbWVyaWRpYW5FbGVtZW50Lmh0bWwodGhpcy5fZ2V0UG9zdGZpeCgpKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZpcmUoJ2NoYW5nZScpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IHRpbWUgZnJvbSB0aW1lLXN0cmluZ1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0aW1lU3RyaW5nIHRpbWUtc3RyaW5nXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gcmVzdWx0IG9mIHNldCB0aW1lXG4gICAgICovXG4gICAgc2V0VGltZUZyb21TdHJpbmc6IGZ1bmN0aW9uKHRpbWVTdHJpbmcpIHtcbiAgICAgICAgdmFyIGhvdXIsXG4gICAgICAgICAgICBtaW51dGUsXG4gICAgICAgICAgICBwb3N0Zml4LFxuICAgICAgICAgICAgaXNQTTtcblxuICAgICAgICBpZiAodGltZVJlZ0V4cC50ZXN0KHRpbWVTdHJpbmcpKSB7XG4gICAgICAgICAgICBob3VyID0gTnVtYmVyKFJlZ0V4cC4kMSk7XG4gICAgICAgICAgICBtaW51dGUgPSBOdW1iZXIoUmVnRXhwLiQyKTtcbiAgICAgICAgICAgIHBvc3RmaXggPSBSZWdFeHAuJDMudG9VcHBlckNhc2UoKTtcblxuICAgICAgICAgICAgaWYgKGhvdXIgPCAyNCAmJiB0aGlzLl9vcHRpb24uc2hvd01lcmlkaWFuKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBvc3RmaXggPT09ICdQTScpIHtcbiAgICAgICAgICAgICAgICAgICAgaXNQTSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwb3N0Zml4ID09PSAnQU0nKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzUE0gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpc1BNID0gdGhpcy5faXNQTTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoaXNQTSkge1xuICAgICAgICAgICAgICAgICAgICBob3VyICs9IDEyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5zZXRUaW1lKGhvdXIsIG1pbnV0ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCBzdGVwIG9mIGhvdXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RlcCBmb3IgdGltZSBwaWNrZXJcbiAgICAgKi9cbiAgICBzZXRIb3VyU3RlcDogZnVuY3Rpb24oc3RlcCkge1xuICAgICAgICB0aGlzLl9ob3VyU3BpbmJveC5zZXRTdGVwKHN0ZXApO1xuICAgICAgICB0aGlzLl9vcHRpb24uaG91clN0ZXAgPSB0aGlzLl9ob3VyU3BpbmJveC5nZXRTdGVwKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHNldCBzdGVwIG9mIG1pbnV0ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIGZvciB0aW1lIHBpY2tlclxuICAgICAqL1xuICAgIHNldE1pbnV0ZVN0ZXA6IGZ1bmN0aW9uKHN0ZXApIHtcbiAgICAgICAgdGhpcy5fbWludXRlU3BpbmJveC5zZXRTdGVwKHN0ZXApO1xuICAgICAgICB0aGlzLl9vcHRpb24ubWludXRlU3RlcCA9IHRoaXMuX21pbnV0ZVNwaW5ib3guZ2V0U3RlcCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBhZGQgYSBzcGVjaWZpYyBob3VyIHRvIGV4Y2x1ZGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaG91ciBmb3IgZXhjbHVzaW9uXG4gICAgICovXG4gICAgYWRkSG91ckV4Y2x1c2lvbjogZnVuY3Rpb24oaG91cikge1xuICAgICAgICB0aGlzLl9ob3VyU3BpbmJveC5hZGRFeGNsdXNpb24oaG91cik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGFkZCBhIHNwZWNpZmljIG1pbnV0ZSB0byBleGNsdWRlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbnV0ZSBmb3IgZXhjbHVzaW9uXG4gICAgICovXG4gICAgYWRkTWludXRlRXhjbHVzaW9uOiBmdW5jdGlvbihtaW51dGUpIHtcbiAgICAgICAgdGhpcy5fbWludXRlU3BpbmJveC5hZGRFeGNsdXNpb24obWludXRlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogZ2V0IHN0ZXAgb2YgaG91clxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGhvdXIgdXAvZG93biBzdGVwXG4gICAgICovXG4gICAgZ2V0SG91clN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9uLmhvdXJTdGVwO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBnZXQgc3RlcCBvZiBtaW51dGVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBtaW51dGUgdXAvZG93biBzdGVwXG4gICAgICovXG4gICAgZ2V0TWludXRlU3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vcHRpb24ubWludXRlU3RlcDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogcmVtb3ZlIGhvdXIgZnJvbSBleGNsdXNpb24gbGlzdFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBob3VyIHRoYXQgeW91IHdhbnQgdG8gcmVtb3ZlXG4gICAgICovXG4gICAgcmVtb3ZlSG91ckV4Y2x1c2lvbjogZnVuY3Rpb24oaG91cikge1xuICAgICAgICB0aGlzLl9ob3VyU3BpbmJveC5yZW1vdmVFeGNsdXNpb24oaG91cik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJlbW92ZSBtaW51dGUgZnJvbSBleGNsdXNpb24gbGlzdFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW51dGUgdGhhdCB5b3Ugd2FudCB0byByZW1vdmVcbiAgICAgKi9cbiAgICByZW1vdmVNaW51dGVFeGNsdXNpb246IGZ1bmN0aW9uKG1pbnV0ZSkge1xuICAgICAgICB0aGlzLl9taW51dGVTcGluYm94LnJlbW92ZUV4Y2x1c2lvbihtaW51dGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBnZXQgaG91clxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGhvdXJcbiAgICAgKi9cbiAgICBnZXRIb3VyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hvdXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGdldCBtaW51dGVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBtaW51dGVcbiAgICAgKi9cbiAgICBnZXRNaW51dGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbWludXRlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBnZXQgdGltZVxuICAgICAqIEBhcGlcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSAnaGg6bW0gKEFNL1BNKSdcbiAgICAgKi9cbiAgICBnZXRUaW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Zvcm1Ub1RpbWVGb3JtYXQoKTtcbiAgICB9XG59KTtcbnR1aS51dGlsLkN1c3RvbUV2ZW50cy5taXhpbihUaW1lUGlja2VyKTtcblxubW9kdWxlLmV4cG9ydHMgPSBUaW1lUGlja2VyO1xuXG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVXRpbHMgZm9yIGNhbGVuZGFyIGNvbXBvbmVudFxuICogQGF1dGhvciBOSE4gTmV0LiBGRSBkZXYgdGVhbS4gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqIEBkZXBlbmRlbmN5IG5lLWNvZGUtc25pcHBldCB+MS4wLjJcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXRpbHMgb2YgY2FsZW5kYXJcbiAqIEBuYW1lc3BhY2UgdXRpbHNcbiAqL1xudmFyIHV0aWxzID0ge1xuICAgIC8qKlxuICAgICAqIFJldHVybiBkYXRlIGhhc2ggYnkgcGFyYW1ldGVyLlxuICAgICAqICBpZiB0aGVyZSBhcmUgMyBwYXJhbWV0ZXIsIHRoZSBwYXJhbWV0ZXIgaXMgY29yZ25pemVkIERhdGUgb2JqZWN0XG4gICAgICogIGlmIHRoZXJlIGFyZSBubyBwYXJhbWV0ZXIsIHJldHVybiB0b2RheSdzIGhhc2ggZGF0ZVxuICAgICAqIEBmdW5jdGlvbiBnZXREYXRlSGFzaFRhYmxlXG4gICAgICogQG1lbWJlcm9mIHV0aWxzXG4gICAgICogQHBhcmFtIHtEYXRlfG51bWJlcn0gW3llYXJdIEEgZGF0ZSBpbnN0YW5jZSBvciB5ZWFyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFttb250aF0gQSBtb250aFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbZGF0ZV0gQSBkYXRlXG4gICAgICogQHJldHVybnMge3t5ZWFyOiAqLCBtb250aDogKiwgZGF0ZTogKn19IFxuICAgICAqL1xuICAgIGdldERhdGVIYXNoVGFibGU6IGZ1bmN0aW9uKHllYXIsIG1vbnRoLCBkYXRlKSB7XG4gICAgICAgIHZhciBuRGF0ZTtcblxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgICAgIG5EYXRlID0gYXJndW1lbnRzWzBdIHx8IG5ldyBEYXRlKCk7XG5cbiAgICAgICAgICAgIHllYXIgPSBuRGF0ZS5nZXRGdWxsWWVhcigpO1xuICAgICAgICAgICAgbW9udGggPSBuRGF0ZS5nZXRNb250aCgpICsgMTtcbiAgICAgICAgICAgIGRhdGUgPSBuRGF0ZS5nZXREYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeWVhcjogeWVhcixcbiAgICAgICAgICAgIG1vbnRoOiBtb250aCxcbiAgICAgICAgICAgIGRhdGU6IGRhdGVcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRvZGF5IHRoYXQgc2F2ZWQgb24gY29tcG9uZW50IG9yIGNyZWF0ZSBuZXcgZGF0ZS5cbiAgICAgKiBAZnVuY3Rpb24gZ2V0VG9kYXlcbiAgICAgKiBAcmV0dXJucyB7e3llYXI6ICosIG1vbnRoOiAqLCBkYXRlOiAqfX1cbiAgICAgKiBAbWVtYmVyb2YgdXRpbHNcbiAgICAgKi9cbiAgICBnZXRUb2RheTogZnVuY3Rpb24oKSB7XG4gICAgICAgcmV0dXJuIHV0aWxzLmdldERhdGVIYXNoVGFibGUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHdlZWtzIGNvdW50IGJ5IHBhcmFtZW50ZXJcbiAgICAgKiBAZnVuY3Rpb24gZ2V0V2Vla3NcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geWVhciBBIHllYXJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbW9udGggQSBtb250aFxuICAgICAqIEByZXR1cm4ge251bWJlcn0g7KO8ICg0fjYpXG4gICAgICogQG1lbWJlcm9mIHV0aWxzXG4gICAgICoqL1xuICAgIGdldFdlZWtzOiBmdW5jdGlvbih5ZWFyLCBtb250aCkge1xuICAgICAgICB2YXIgZmlyc3REYXkgPSB0aGlzLmdldEZpcnN0RGF5KHllYXIsIG1vbnRoKSxcbiAgICAgICAgICAgIGxhc3REYXRlID0gdGhpcy5nZXRMYXN0RGF0ZSh5ZWFyLCBtb250aCk7XG5cbiAgICAgICAgcmV0dXJuIE1hdGguY2VpbCgoZmlyc3REYXkgKyBsYXN0RGF0ZSkgLyA3KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHVuaXggdGltZSBmcm9tIGRhdGUgaGFzaFxuICAgICAqIEBmdW5jdGlvbiBnZXRUaW1lXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGUgQSBkYXRlIGhhc2hcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGF0ZS55ZWFyIEEgeWVhclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBkYXRlLm1vbnRoIEEgbW9udGhcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGF0ZS5kYXRlIEEgZGF0ZVxuICAgICAqIEByZXR1cm4ge251bWJlcn0gXG4gICAgICogQG1lbWJlcm9mIHV0aWxzXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB1dGlscy5nZXRUaW1lKHt5ZWFyOjIwMTAsIG1vbnRoOjUsIGRhdGU6MTJ9KTsgLy8gMTI3MzU5MDAwMDAwMFxuICAgICAqKi9cbiAgICBnZXRUaW1lOiBmdW5jdGlvbihkYXRlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldERhdGVPYmplY3QoZGF0ZSkuZ2V0VGltZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgd2hpY2ggZGF5IGlzIGZpcnN0IGJ5IHBhcmFtZXRlcnMgdGhhdCBpbmNsdWRlIHllYXIgYW5kIG1vbnRoIGluZm9ybWF0aW9uLlxuICAgICAqIEBmdW5jdGlvbiBnZXRGaXJzdERheVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5ZWFyIEEgeWVhclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtb250aCBBIG1vbnRoXG4gICAgICogQHJldHVybiB7bnVtYmVyfSAoMH42KVxuICAgICAqIEBtZW1iZXJvZiB1dGlsc1xuICAgICAqKi9cbiAgICBnZXRGaXJzdERheTogZnVuY3Rpb24oeWVhciwgbW9udGgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHllYXIsIG1vbnRoIC0gMSwgMSkuZ2V0RGF5KCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB3aGljaCBkYXkgaXMgbGFzdCBieSBwYXJhbWV0ZXJzIHRoYXQgaW5jbHVkZSB5ZWFyIGFuZCBtb250aCBpbmZvcm1hdGlvbi5cbiAgICAgKiBAZnVuY3Rpb24gZ2V0TGFzdERheVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5ZWFyIEEgeWVhclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtb250aCBBIG1vbnRoXG4gICAgICogQHJldHVybiB7bnVtYmVyfSAoMH42KVxuICAgICAqIEBtZW1iZXJvZiB1dGlsc1xuICAgICAqKi9cbiAgICBnZXRMYXN0RGF5OiBmdW5jdGlvbih5ZWFyLCBtb250aCkge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoeWVhciwgbW9udGgsIDApLmdldERheSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgbGFzdCBkYXRlIGJ5IHBhcmFtZXRlcnMgdGhhdCBpbmNsdWRlIHllYXIgYW5kIG1vbnRoIGluZm9ybWF0aW9uLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5ZWFyIEEgeWVhclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtb250aCBBIG1vbnRoXG4gICAgICogQHJldHVybiB7bnVtYmVyfSAoMX4zMSlcbiAgICAgKiBAbWVtYmVyb2YgdXRpbHNcbiAgICAgKiovXG4gICAgZ2V0TGFzdERhdGU6IGZ1bmN0aW9uKHllYXIsIG1vbnRoKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgMCkuZ2V0RGF0ZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZGF0ZSBpbnN0YW5jZS5cbiAgICAgKiBAZnVuY3Rpb24gZ2V0RGF0ZU9iamVjdFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRlIEEgZGF0ZSBoYXNoXG4gICAgICogQHJldHVybiB7RGF0ZX0gRGF0ZSAgXG4gICAgICogQG1lbWJlcm9mIHV0aWxzXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAgdXRpbHMuZ2V0RGF0ZU9iamVjdCh7eWVhcjoyMDEwLCBtb250aDo1LCBkYXRlOjEyfSk7XG4gICAgICogIHV0aWxzLmdldERhdGVPYmplY3QoMjAxMCwgNSwgMTIpOyAvL3llYXIsbW9udGgsZGF0ZVxuICAgICAqKi9cbiAgICBnZXREYXRlT2JqZWN0OiBmdW5jdGlvbihkYXRlKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGUoYXJndW1lbnRzWzBdLCBhcmd1bWVudHNbMV0gLSAxLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShkYXRlLnllYXIsIGRhdGUubW9udGggLSAxLCBkYXRlLmRhdGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcmVsYXRlZCBkYXRlIGhhc2ggd2l0aCBwYXJhbWV0ZXJzIHRoYXQgaW5jbHVkZSBkYXRlIGluZm9ybWF0aW9uLlxuICAgICAqIEBmdW5jdGlvbiBnZXRSZWxhdGl2ZURhdGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geWVhciBBIHJlbGF0ZWQgdmFsdWUgZm9yIHllYXIoeW91IGNhbiB1c2UgKy8tKVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtb250aCBBIHJlbGF0ZWQgdmFsdWUgZm9yIG1vbnRoICh5b3UgY2FuIHVzZSArLy0pXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGRhdGUgQSByZWxhdGVkIHZhbHVlIGZvciBkYXkgKHlvdSBjYW4gdXNlICsvLSlcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0ZU9iaiBzdGFuZGFyZCBkYXRlIGhhc2hcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IGRhdGVPYmogXG4gICAgICogQG1lbWJlcm9mIHV0aWxzXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiAgdXRpbHMuZ2V0UmVsYXRpdmVEYXRlKDEsIDAsIDAsIHt5ZWFyOjIwMDAsIG1vbnRoOjEsIGRhdGU6MX0pOyAvLyB7eWVhcjoyMDAxLCBtb250aDoxLCBkYXRlOjF9XG4gICAgICogIHV0aWxzLmdldFJlbGF0aXZlRGF0ZSgwLCAwLCAtMSwge3llYXI6MjAxMCwgbW9udGg6MSwgZGF0ZToxfSk7IC8vIHt5ZWFyOjIwMDksIG1vbnRoOjEyLCBkYXRlOjMxfVxuICAgICAqKi9cbiAgICBnZXRSZWxhdGl2ZURhdGU6IGZ1bmN0aW9uKHllYXIsIG1vbnRoLCBkYXRlLCBkYXRlT2JqKSB7XG4gICAgICAgIHZhciBuWWVhciA9IChkYXRlT2JqLnllYXIgKyB5ZWFyKSxcbiAgICAgICAgICAgIG5Nb250aCA9IChkYXRlT2JqLm1vbnRoICsgbW9udGggLSAxKSxcbiAgICAgICAgICAgIG5EYXRlID0gKGRhdGVPYmouZGF0ZSArIGRhdGUpLFxuICAgICAgICAgICAgbkRhdGVPYmogPSBuZXcgRGF0ZShuWWVhciwgbk1vbnRoLCBuRGF0ZSk7XG5cbiAgICAgICAgcmV0dXJuIHV0aWxzLmdldERhdGVIYXNoVGFibGUobkRhdGVPYmopO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbHM7XG4iXX0=
