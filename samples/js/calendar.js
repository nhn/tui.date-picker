(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
tui.util.defineNamespace('tui.component.Calendar', require('./src/js/calendar'), true);

},{"./src/js/calendar":2}],2:[function(require,module,exports){
/**
 * @fileoverview Calendar component(from Pug component)
 * @author NHN Ent. FE dev team. <dl_javascript@nhnent.com>
 */
'use strict';

var utils = require('./utils');
var CONSTANTS = require('./constants');

var util = tui.util;
var bind = util.bind;
var extend = util.extend;

/**
 * Calendar component class
 * @constructor
 * @param {Object} [option] A options for initialize
 *     @param {HTMLElement} option.element A root element
 *     @param {string} [option.classPrefix="calendar-"] A prefix class for markup structure
 *     @param {number} [option.year=this year] A year for initialize
 *     @param {number} [option.month=this month] A month for initialize
 *     @param {string} [option.titleFormat="yyyy-mm"] A title format.
 *                     This component find title element by className '[prefix]title'
 *     @param {string} [option.todayFormat = "yyyy Year mm Month dd Day (D)"] A today format.
 *                     This component find today element by className '[prefix]today'
 *     @param {string} [option.yearTitleFormat = "yyyy"] A year title formant.
 *                     This component find year title element by className '[prefix]year'
 *     @param {string} [option.monthTitleFormat = "m"] A month title format.
 *                     This component find month title element by className이 '[prefix]month'
 *     @param {Array} [option.monthTitles = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"]]
 *                    A label of each month.
 *     @param {Array} [option.dayTitles = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]] A label for day.
 *                    If you set the other option todayFormat 'D', you can use this name.
 * @example
 * var calendar = new tui.component.Calendar({
 *                    element: '#layer',
 *                    classPrefix: "calendar-",
 *                    year: 1983,
 *                    month: 5,
 *                    titleFormat: "yyyy-mm", // title
 *                    todayFormat: "yyyy / mm / dd (D)" // today
 *                    yearTitleFormat: "yyyy", // year title
 *                    monthTitleFormat: "m", // month title
 *                    monthTitles: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
 *                    dayTitles: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] // days
 *                    itemCountOfYear: 12
 *             });
 */
var Calendar = util.defineClass(/** @lends Calendar.prototype */ {
    init: function(option) {
        /**
         * Set options
         * option: {
         *     classPrefix: string,
         *     year: number
         *     month: number
         *     titleFormat: string,
         *     todayFormat: string,
         *     yearTitleFormat: string,
         *     monthTitleFormat: string,
         *     monthTitles: Array,
         *     dayTitles: Array,
         *     itemCountOfYear: number
         * }
         * @private
         */
        this._option = {};

        /**
         * A day that is shown
         * @type {{year: number, month: number}}
         */
        this._shownDate = {year: 0, month: 1, date: 1};

        /**======================================
         * jQuery - HTMLElement
         *======================================*/
        /**
         * =========Root Element=========
         * If options do not include element, this component jedge initialize element without options
         * @type {jQuery}
         * @private
         */
        this.$element = $(option.element || arguments[0]);

        /**
         * =========Header=========
         * @type {jQuery}
         */
        this.$header = null;

        /**
         * A tilte
         * @type {jQuery}
         */
        this.$title = null;

        /**
         * A year title
         * @type {jQuery}
         */
        this.$titleYear = null;

        /**
         * A month title
         * @type {jQuery}
         */
        this.$titleMonth = null;

        /**
         * =========Body=========
         * @type {jQuery}
         */
        this.$body = null;

        /**
         * A template of week
         * @type {jQuery}
         */
        this.$weekTemplate = null;

        /**
         * A week parent element
         * @type {jQuery}
         */
        this.$weekAppendTarget = null;

        /**-------- footer --------*/
        this.$footer = null;

        /** Today */
        this.$today = null;

        /**
         * A date element
         * @type {jQuery}
         * @private
         */
        this._$dateElement = null;

        /**
         * A date wrapper element
         * @type {jQuery}
         * @private
         */
        this._$dateContainerElement = null;

        /**
         * =========Footer=========
         * @type {jQuery}
         */
        this.$footer = null;

        /**
         * Today element
         * @type {jQuery}
         */
        this.$today = null;

        /**
         * Index of shown layer
         * @type {number}
         */
        this.shownLayerIdx = 0;

        /**
         * Data of month's layer
         * @type {Object}
         */
        this.dataOfMonthLayer = {};

        /**
         * Data of year's layer
         * @type {Object}
         */
        this.dataOfYearLayer = {};

        /**
         * Handlers binding context
         * @type {Object}
         */
        this.handlers = {};

        /** Set default options */
        this._setDefault(option);
    },

    /**
     * Set defulat opitons
     * @param {Object} [option] A options to initialzie component
     * @private
     */
    _setDefault: function(option) {
        this._setOption(option);
        this._assignHTMLElements();
        this._attachEvent();
        this.draw(this._option.year, this._option.month, false, 0);
    },

    /**
     * Save options
     * @param {Object} [option] A options to initialize component
     * @private
     */
    _setOption: function(option) {
        var instanceOption = this._option,
            today = utils.getDateHashTable();

        var defaultOption = {
            classPrefix: 'calendar-',
            year: today.year,
            month: today.month,
            titleFormat: 'yyyy-mm',
            todayFormat: 'yyyy/mm/dd (D)',
            yearTitleFormat: 'yyyy',
            monthTitleFormat: 'm',
            monthTitles: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
            dayTitles: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            itemCountOfYear: CONSTANTS.itemCountOfYear
        };
        extend(instanceOption, defaultOption, option);
    },

    /**
     * Set element to filed
     * @private
     */
    _assignHTMLElements: function() {
        var classPrefix = this._option.classPrefix,
            $element = this.$element,
            classSelector = '.' + classPrefix;

        this._assignHeader($element, classSelector, classPrefix);
        this._assignBody($element, classSelector, classPrefix);
        this._assignFooter($element, classSelector, classPrefix);
    },

    /**
     * Register header element.
     * @param {jQuery} $element The root element of component
     * @param {string} classSelector A class selector
     * @param {string} classPrefix A prefix for class
     * @private
     */
    _assignHeader: function($element, classSelector, classPrefix) {
        var $header = $element.find(classSelector + 'header'),
            headerTemplate,
            defaultClassPrefixRegExp,
            key = CONSTANTS.relativeMonthValueKey,
            btnClassName = 'btn-';

        if (!$header.length) {
            headerTemplate = CONSTANTS.calendarHeader;
            defaultClassPrefixRegExp = CONSTANTS.defaultClassPrefixRegExp;

            $header = $(headerTemplate.replace(defaultClassPrefixRegExp, classPrefix));
            $element.append($header);
        }

        // button
        $header.find(classSelector + btnClassName + CONSTANTS.prevYear).data(key, -12);
        $header.find(classSelector + btnClassName + CONSTANTS.prevMonth).data(key, -1);
        $header.find(classSelector + btnClassName + CONSTANTS.nextYear).data(key, 12);
        $header.find(classSelector + btnClassName + CONSTANTS.nextMonth).data(key, 1);

        // title text
        this.$title = $header.find(classSelector + 'title');
        this.$titleYear = $header.find(classSelector + 'title-year');
        this.$titleMonth = $header.find(classSelector + 'title-month');

        this.$header = $header;
    },

    /**
     * Register body element
     * @param {jQuery} $element The root elment of component
     * @param {string} classSelector A selector
     * @param {string} classPrefix A prefix for class
     * @private
     */
    _assignBody: function($element, classSelector, classPrefix) {
        var $body = $element.find(classSelector + 'body'),
            bodyTemplate,
            defaultClassPrefixRegExp;

        if (!$body.length) {
            bodyTemplate = CONSTANTS.calendarBody;
            defaultClassPrefixRegExp = CONSTANTS.defaultClassPrefixRegExp;

            $body = $(bodyTemplate.replace(defaultClassPrefixRegExp, classPrefix));
            $element.append($body);
        }

        this._assignWeek(classSelector);
        this._assignMonthLayer(classSelector);
        this._assignYearLayer(classSelector);

        this.$body = $body.hide();
    },

    /**
     * Register week elemnt on body
     * @param {string} classSelector A selector
     * @private
     */
    _assignWeek: function(classSelector) {
        var $body = this.$element.find(classSelector + 'body');
        var $weekTemplate = $body.find(classSelector + 'week');

        this.$weekTemplate = $weekTemplate.clone(true);
        this.$weekAppendTarget = $weekTemplate.parent();
    },

    /**
     * Register element of month's layer and save drawing info
     * @param {string} classSelector A selector
     * @private
     */
    _assignMonthLayer: function(classSelector) {
        var $body = this.$element.find(classSelector + 'body');
        var $monthsTemplate = $body.find(classSelector + 'month-group');
        var cols = $monthsTemplate.find(classSelector + 'month').length;
        var rows = Math.ceil(this._option.monthTitles.length / cols);

        this.dataOfMonthLayer = {
            template: $monthsTemplate.clone(true),
            appendedTarget: $monthsTemplate.parent(),
            frame: {
                cols: cols,
                rows: rows
            }
        };
    },

    /**
     * Register element of year's layer and save drawing info
     * @param {string} classSelector A selector
     * @private
     */
    _assignYearLayer: function(classSelector) {
        var $body = this.$element.find(classSelector + 'body');
        var $yearsTemplate = $body.find(classSelector + 'year-group');
        var cols = $yearsTemplate.find(classSelector + 'year').length;
        var rows = Math.ceil(this._option.itemCountOfYear / cols);

        this.dataOfYearLayer = {
            template: $yearsTemplate.clone(true),
            appendedTarget: $yearsTemplate.parent(),
            frame: {
                cols: cols,
                rows: rows
            }
        };
    },

    /**
     * Register footer element
     * @param {jQuery} $element The root element of component
     * @param {string} classSelector A selector
     * @param {string} classPrefix A prefix for class
     * @private
     */
    _assignFooter: function($element, classSelector, classPrefix) {
        var $footer = $element.find(classSelector + 'footer'),
            footerTemplate,
            defaultClassPrefixRegExp;

        if (!$footer.length) {
            footerTemplate = CONSTANTS.calendarFooter;
            defaultClassPrefixRegExp = CONSTANTS.defaultClassPrefixRegExp;

            $footer = $(footerTemplate.replace(defaultClassPrefixRegExp, classPrefix));
            $element.append($footer);
        }
        this.$today = $footer.find(classSelector + 'today');
        this.$footer = $footer;
    },

    /**
     * Set event handlers and attach event on element
     * @private
     */
    _attachEvent: function() {
        this.handlers.clickRolloverBtn = bind(this._onClickRolloverButton, this);

        this.attachEventToRolloverBtn();

        extend(this.handlers, {
            clickTitle: bind(this._onClickTitle, this),
            clickYearLayer: bind(this._onClickYearLayer, this),
            clickMonthLayer: bind(this._onClickMonthLayer, this)
        });

        this.attachEventToTitle();
        this.attachEventToBody();
    },

    /**
     * Attach event on rollover buttons in "header" element
     */
    attachEventToRolloverBtn: function() {
        var selector = '.' + this._option.classPrefix + 'rollover';
        var btns = this.$header.find(selector);

        btns.on('click', this.handlers.clickRolloverBtn);
    },

    /**
     * Detach event on rollover buttons in "header" element
     */
    detachEventToRolloverBtn: function() {
        var selector = '.' + this._option.classPrefix + 'rollover';
        var btns = this.$header.find(selector);

        btns.off('click', this.handlers.clickRolloverBtn);
    },

    /**
     * Attach event on title in "header" element
     */
    attachEventToTitle: function() {
        this.$title.on('click', this.handlers.clickTitle);
    },

    /**
     * Detach event on title in "header" element
     */
    detachEventToTitle: function() {
        this.$title.off('click', this.handlers.clickTitle);
    },

    /**
     * Attach event on title in "body" element (month & year layer)
     */
    attachEventToBody: function() {
        var classPrefix = '.' + this._option.classPrefix;
        var yearLayer = this.dataOfYearLayer.appendedTarget;
        var monthLayer = this.dataOfMonthLayer.appendedTarget;

        yearLayer.on('click', classPrefix + 'year', this.handlers.clickYearLayer);
        monthLayer.on('click', classPrefix + 'month', this.handlers.clickMonthLayer);
    },

    /**
     * Detach event on title in "body" element (month & year layer)
     */
    detachEventToBody: function() {
        var classPrefix = '.' + this._option.classPrefix;
        var yearLayer = this.dataOfYearLayer.appendedTarget;
        var monthLayer = this.dataOfMonthLayer.appendedTarget;

        yearLayer.off('click', classPrefix + 'year', this.handlers.clickYearLayer);
        monthLayer.off('click', classPrefix + 'month', this.handlers.clickMonthLayer);
    },

    /**
     * Event handler - click on rollover buttons
     * @param {MouseEvent} event - Mouse event
     * @private
     */
    _onClickRolloverButton: function(event) {
        var relativeMonthValue = $(event.currentTarget).data(CONSTANTS.relativeMonthValueKey);
        event.preventDefault();
        this.draw(0, relativeMonthValue, true);
    },

    /**
     * Event handler - click on title
     * @param {MouseEvent} event - Mouse event
     * @private
     */
    _onClickTitle: function(event) {
        var shownLayerIdx = this.shownLayerIdx;
        var date;

        event.preventDefault();

        if (shownLayerIdx === 2) {
            return;
        }

        shownLayerIdx = (shownLayerIdx !== 2) ? (shownLayerIdx + 1) : 0;
        date = this.getDate();

        this.draw(date.year, date.month, false, shownLayerIdx);
    },

    /**
     * Event handler - click on month's layer
     * @param {MouseEvent} event - Mouse event
     * @private
     */
    _onClickYearLayer: function(event) {
        var relativeMonthValue = $(event.currentTarget).data(CONSTANTS.relativeMonthValueKey);
        event.preventDefault();
        this.draw(0, relativeMonthValue, true, 1);
    },

    /**
     * Event handler - click on year's layer
     * @param {MouseEvent} event - Mouse event
     * @private
     */
    _onClickMonthLayer: function(event) {
        var relativeMonthValue = $(event.currentTarget).data(CONSTANTS.relativeMonthValueKey);
        event.preventDefault();
        this.draw(0, relativeMonthValue, true, 0);
    },

    /**
     * Get Hash data to drow calendar
     * @param {number} year A year
     * @param {number} month A month
     * @param {boolean} [isRelative]  Whether is related other value or not
     * @returns {{year: number, month: number}} A date hash
     * @private
     */
    _getDateForDrawing: function(year, month, isRelative) {
        var nDate = this.getDate(),
            relativeDate;

        nDate.date = 1;
        if (!util.isNumber(year) && !util.isNumber(month)) {
            return nDate;
        }

        if (isRelative) {
            relativeDate = utils.getRelativeDate(year, month, 0, nDate);
            nDate.year = relativeDate.year;
            nDate.month = relativeDate.month;
        } else {
            nDate.year = year || nDate.year;
            nDate.month = month || nDate.month;
        }

        return nDate;
    },

    /**
     * Judge to redraw calendar
     * @param {number} year A year
     * @param {number} month A month
     * @returns {boolean} reflow
     * @private
     */
    _isNecessaryForDrawing: function(year, month) {
        var shownDate = this._shownDate;

        return (shownDate.year !== year || shownDate.month !== month);
    },

    /**
     * Draw calendar text
     * @param {{year: number, month: number}} dateForDrawing Tha hash that show up on calendar
     * @private
     */
    _setCalendarText: function(dateForDrawing) {
        var year = dateForDrawing.year,
            month = dateForDrawing.month;

        this._setCalendarToday();
        this._setCalendarTitle(year, month);
    },

    /**
     * Draw dates by month.
     * @param {{year: number, month: number}} dateForDrawing A date to draw
     * @param {string} classPrefix A class prefix
     * @private
     */
    _drawDates: function(dateForDrawing, classPrefix) {
        var year = dateForDrawing.year,
            month = dateForDrawing.month,
            dayInWeek = 0,
            datePrevMonth = utils.getRelativeDate(0, -1, 0, dateForDrawing),
            dateNextMonth = utils.getRelativeDate(0, 1, 0, dateForDrawing),
            dates = [],
            firstDay = utils.getFirstDay(year, month),
            indexOfLastDate = this._fillDates(year, month, dates);

        util.forEach(dates, function(date, i) {
            var isPrevMonth = false,
                isNextMonth = false,
                $dateContainer = $(this._$dateContainerElement[i]),
                tempYear = year,
                tempMonth = month,
                eventData;

            if (i < firstDay) {
                isPrevMonth = true;
                $dateContainer.addClass(classPrefix + CONSTANTS.prevMonth);
                tempYear = datePrevMonth.year;
                tempMonth = datePrevMonth.month;
            } else if (i > indexOfLastDate) {
                isNextMonth = true;
                $dateContainer.addClass(classPrefix + CONSTANTS.nextMonth);
                tempYear = dateNextMonth.year;
                tempMonth = dateNextMonth.month;
            }

            // Weekend
            this._setWeekend(dayInWeek, $dateContainer, classPrefix);

            // Today
            if (this._isToday(tempYear, tempMonth, date)) {
                $dateContainer.addClass(classPrefix + 'today');
            }

            eventData = {
                $date: $(this._$dateElement.get(i)),
                $dateContainer: $dateContainer,
                year: tempYear,
                month: tempMonth,
                date: date,
                isPrevMonth: isPrevMonth,
                isNextMonth: isNextMonth,
                html: date
            };
            $(eventData.$date).html(eventData.html.toString());
            dayInWeek = (dayInWeek + 1) % 7;

            /**
             * Fire draw event when calendar draw each date.
             * @api
             * @event Calendar#draw
             * @param {string} type A name of custom event
             * @param {boolean} isPrevMonth Whether the draw day is last month or not
             * @param {boolean} isNextMonth Wehter the draw day is next month or not
             * @param {jQuery} $date The element have date html
             * @param {jQuery} $dateContainer Child element that has className [prefix]week.
             *                                It is possible this element equel elDate.
             * @param {number} date A draw date
             * @param {number} month A draw month
             * @param {number} year A draw year
             * @param {string} html A html string
             * @example
             * // draw custom even handlers
             * calendar.on('draw', function(drawEvent){ ... });
             **/
            this.fire('draw', eventData);
        }, this);
    },

    /**
     * Jedge the input date is today.
     * @param {number} year A year
     * @param {number} month A month
     * @param {number} date A date
     * @returns {boolean}
     * @private
     */
    _isToday: function(year, month, date) {
        var today = utils.getDateHashTable();
        var isYear = year ? (today.year === year) : true;
        var isMonth = month ? (today.month === month) : true;
        var isDate = date ? (today.date === date) : true;

        return isYear && isMonth && isDate;
    },

    /**
     * Make one week tempate.
     * @param {number} year  A year
     * @param {number} month A month
     * @private
     */
    _setWeeks: function(year, month) {
        var $elWeek,
            weeks = utils.getWeeks(year, month),
            i;
        for (i = 0; i < weeks; i += 1) {
            $elWeek = this.$weekTemplate.clone(true);
            $elWeek.appendTo(this.$weekAppendTarget);
            this._weekElements.push($elWeek);
        }
    },

    /**
     * Save draw dates to array
     * @param {string} year A draw year
     * @param {string} month A draw month
     * @param {Array} dates A draw date
     * @returns {number} index of last date
     * @private
     */
    _fillDates: function(year, month, dates) {
        var firstDay = utils.getFirstDay(year, month),
            lastDay = utils.getLastDay(year, month),
            lastDate = utils.getLastDate(year, month),
            datePrevMonth = utils.getRelativeDate(0, -1, 0, {year: year, month: month, date: 1}),
            prevMonthLastDate = utils.getLastDate(datePrevMonth.year, datePrevMonth.month),
            indexOfLastDate,
            i;

        if (firstDay > 0) {
            for (i = prevMonthLastDate - firstDay; i < prevMonthLastDate; i += 1) {
                dates.push(i + 1);
            }
        }
        for (i = 1; i < lastDate + 1; i += 1) {
            dates.push(i);
        }
        indexOfLastDate = dates.length - 1;
        for (i = 1; i < 7 - lastDay; i += 1) {
            dates.push(i);
        }

        return indexOfLastDate;
    },

    /**
     * Set weekend
     * @param {number} day A date
     * @param {jQuery} $dateContainer A container element for date
     * @param {string} classPrefix A prefix of class
     * @private
     */
    _setWeekend: function(day, $dateContainer, classPrefix) {
        if (day === 0) {
            $dateContainer.addClass(classPrefix + 'sun');
        } else if (day === 6) {
            $dateContainer.addClass(classPrefix + 'sat');
        }
    },

    /**
     * Clear calendar
     * @private
     */
    _clear: function() {
        this._weekElements = [];
        this.$weekAppendTarget.empty();
        this.dataOfMonthLayer.appendedTarget.empty();
        this.dataOfYearLayer.appendedTarget.empty();
    },

    /**
     * Draw title with format option.
     * @param {number} year A value of year (ex. 2008)
     * @param {(number|string)} month A month (1 ~ 12)
     * @private
     **/
    _setCalendarTitle: function(year, month) {
        var option = this._option,
            titleFormat = option.titleFormat,
            replaceMap,
            reg;

        month = utils.prependLeadingZero(month);
        replaceMap = this._getReplaceMap(year, month);

        reg = CONSTANTS.titleRegExp;
        this._setDateTextInCalendar(this.$title, titleFormat, replaceMap, reg);

        reg = CONSTANTS.titleYearRegExp;
        this._setDateTextInCalendar(this.$titleYear, option.yearTitleFormat, replaceMap, reg);

        reg = CONSTANTS.titleMonthRegExp;
        this._setDateTextInCalendar(this.$titleMonth, option.monthTitleFormat, replaceMap, reg);
    },

    /**
     * Update title
     * @param {jQuery|HTMLElement} element A update element
     * @param {string} form A update form
     * @param {Object} map A object that has value matched regExp
     * @param {RegExp} reg A regExp to chagne form
     * @private
     */
    _setDateTextInCalendar: function(element, form, map, reg) {
        var title,
            $el = $(element);

        if (!$el.length) {
            return;
        }
        title = utils.getConvertedTitle(form, map, reg);
        $el.text(title);
    },

    /**
     * Get map data for form
     * @param {string|number} year A year
     * @param {string|number} month A month
     * @param {string|number} [date] A day
     * @returns {Object} ReplaceMap
     * @private
     */
    _getReplaceMap: function(year, month, date) {
        var option = this._option,
            yearSub = (year.toString()).substr(2, 2),
            monthLabel = option.monthTitles[month - 1],
            labelKey = new Date(year, month - 1, date || 1).getDay(),
            dayLabel = option.dayTitles[labelKey];

        return {
            yyyy: year,
            yy: yearSub,
            mm: month,
            m: Number(month),
            M: monthLabel,
            dd: date,
            d: Number(date),
            D: dayLabel
        };
    },

    /**
     * Set today
     * @private
     */
    _setCalendarToday: function() {
        var $today = this.$today,
            todayFormat,
            today,
            year,
            month,
            date,
            replaceMap,
            reg;

        if (!$today.length) {
            return;
        }

        today = utils.getDateHashTable();
        year = today.year;
        month = utils.prependLeadingZero(today.month);
        date = utils.prependLeadingZero(today.date);
        todayFormat = this._option.todayFormat;
        replaceMap = this._getReplaceMap(year, month, date);
        reg = CONSTANTS.todayRegExp;
        this._setDateTextInCalendar($today, todayFormat, replaceMap, reg);
    },

    /**
     * Set title on year's layer
     * @param {number} year - Year
     */
    _setTitleOnYearLayer: function(year) {
        var itemCountOfYear = this._getInfoOfYearRange(year);
        var startYearText = this._getConvertedYearTitle(itemCountOfYear.startYear);
        var endYearText = this._getConvertedYearTitle(itemCountOfYear.endYear);
        var title = startYearText + ' - ' + endYearText;

        this.$title.text(title);
    },

    /**
     * Set class name on title
     * @param {number} shownLayerIdx - Year
     */
    _setClassNameOnTitle: function(shownLayerIdx) {
        var className = CONSTANTS.clickable;

        if (shownLayerIdx !== 2) {
            this.$title.addClass(className);
        } else {
            this.$title.removeClass(className);
        }
    },

    /**
     * Get converted year text on year and month layer
     * @param {number} year - Year
     * @returns {string} Converted year text
     */
    _getConvertedYearTitle: function(year) {
        var option = this._option;
        var replaceMap, reg;

        replaceMap = this._getReplaceMap(year);
        reg = CONSTANTS.titleYearRegExp;

        return utils.getConvertedTitle(option.yearTitleFormat, replaceMap, reg);
    },

    /**
     * Get years info by "itemCountOfYear" option
     * @param {number} year - Year
     * @returns {Object} Info of year's range
     */
    _getInfoOfYearRange: function(year) {
        var frameInfo = this.dataOfYearLayer.frame;
        var cols = frameInfo.cols;
        var rows = frameInfo.rows;
        var baseIdx = (cols * Math.floor(rows / 2)) + Math.floor(cols / 2);
        var startYear = year - baseIdx;
        var endYear = startYear + (cols * rows) - 1;

        return {
            startYear: startYear,
            endYear: endYear
        };
    },

    /**
     * Get index of current shown layer by layer's type
     * @param {string|number} type - Type of layer
     * @returns {number} Index of shown layer
     */
    _getIndexOfShownLayer: function(type) {
        return (type ? util.inArray(type, CONSTANTS.layerKeys) : this.shownLayerIdx);
    },

    /**
     * Draw header element
     * @param {{year: number, month: number}} dateForDrawing - The hash that show up on calendar
     * @param {number} shownLayerIdx - Index of shown layer
     * @private
     */
    _drawHeader: function(dateForDrawing, shownLayerIdx) {
        var classSelector = '.' + this._option.classPrefix + 'btn-';
        var prevBtn = this.$header.find(classSelector + CONSTANTS.prev);
        var nextBtn = this.$header.find(classSelector + CONSTANTS.next);
        var key = CONSTANTS.relativeMonthValueKey;
        var itemCountOfYear = this._option.itemCountOfYear;
        var prevValue, nextValue;

        this._setClassNameOnTitle(shownLayerIdx);

        if (shownLayerIdx === 0) {
            this._setCalendarText(dateForDrawing);
            prevValue = -1;
            nextValue = 1;
        } else if (shownLayerIdx === 1) {
            this.$title.text(this._getConvertedYearTitle(dateForDrawing.year));
            prevValue = -12;
            nextValue = 12;
        } else if (shownLayerIdx === 2) {
            this._setTitleOnYearLayer(dateForDrawing.year);
            prevValue = -12 * itemCountOfYear;
            nextValue = 12 * itemCountOfYear;
        }

        prevBtn.data(key, prevValue);
        nextBtn.data(key, nextValue);
    },

    /**
     * Draw body elements
     * @param {{year: number, month: number}} dateForDrawing - The hash that show up on calendar
     * @param {number} shownLayerIdx - Index of shown layer
     * @private
     */
    _drawBody: function(dateForDrawing, shownLayerIdx) {
        var year = dateForDrawing.year;
        var month = dateForDrawing.month;
        var classPrefix = this._option.classPrefix;

        // weeks
        this._setWeeks(year, month);
        this._$dateElement = $('.' + classPrefix + 'date', this.$weekAppendTarget);
        this._$dateContainerElement = $('.' + classPrefix + 'week > *', this.$weekAppendTarget);

        // dates
        this._drawDates(dateForDrawing, classPrefix);

        // month layer
        this._drawFrameOnMonthLayer();
        this._drawButtonsOfMonth(dateForDrawing, classPrefix);

        // year layer
        this._drawFrameOnYearLayer();
        this._drawButtonsOfYear(dateForDrawing, classPrefix);

        // show layer
        this._changeShownLayer(shownLayerIdx);
    },

    /**
     * Draw frame containing buttons on month's layer
     * @private
     */
    _drawFrameOnMonthLayer: function() {
        var i = 0;
        var rows = this.dataOfMonthLayer.frame.rows;
        var dataOfMonthLayer = this.dataOfMonthLayer;
        var $monthGroupEl;

        for (; i < rows; i += 1) {
            $monthGroupEl = dataOfMonthLayer.template.clone(true);
            $monthGroupEl.appendTo(dataOfMonthLayer.appendedTarget);
        }
    },

    /**
     * Draw selectable buttons on month's layer
     * @param {{year: number, month: number}} dateForDrawing - The hash that show up on calendar
     * @param {string} classPrefix - A class prefix
     * @private
     */
    _drawButtonsOfMonth: function(dateForDrawing, classPrefix) {
        var key = CONSTANTS.relativeMonthValueKey;
        var selectedMonth = dateForDrawing.month;
        var monthTitles = this._option.monthTitles;
        var $monthEls = this.dataOfMonthLayer.appendedTarget.find('.' + classPrefix + 'month');
        var $buttonEl, month, relativeMonth;
        var eventData;

        util.forEach(monthTitles, function(title, idx) {
            $buttonEl = $monthEls.eq(idx);
            month = idx + 1;

            if (month === selectedMonth) {
                $buttonEl.addClass(classPrefix + CONSTANTS.selected);
            }

            if (this._isToday(this._shownDate.year, month)) {
                $buttonEl.addClass(classPrefix + CONSTANTS.today);
            }

            relativeMonth = month - selectedMonth;

            $buttonEl.data(key, relativeMonth).html(title);

            eventData = {
                $date: $buttonEl,
                $dateContainer: $buttonEl,
                year: dateForDrawing.year,
                month: month,
                date: 0
            };

            this.fire('draw', eventData);
        }, this);
    },

    /**
     * Draw frame containing buttons on year's layer
     * @private
     */
    _drawFrameOnYearLayer: function() {
        var i = 0;
        var rows = this.dataOfMonthLayer.frame.rows;
        var dataOfYearLayer = this.dataOfYearLayer;
        var $yearGroupEl;

        for (; i < rows; i += 1) {
            $yearGroupEl = dataOfYearLayer.template.clone(true);
            $yearGroupEl.appendTo(dataOfYearLayer.appendedTarget);
        }
    },

    /**
     * Draw selectable buttons on year's layer
     * @param {{year: number, month: number}} dateForDrawing - The hash that show up on calendar
     * @param {string} classPrefix - A class prefix
     * @private
     */
    _drawButtonsOfYear: function(dateForDrawing, classPrefix) {
        var key = CONSTANTS.relativeMonthValueKey;
        var year = dateForDrawing.year;
        var itemCountOfYear = this._getInfoOfYearRange(year);
        var startYear = itemCountOfYear.startYear;
        var endYear = itemCountOfYear.endYear;
        var cnt = 0;
        var $yearEls = this.dataOfYearLayer.appendedTarget.find('.' + classPrefix + 'year');
        var $buttonEl, relativeMonth;
        var eventData;

        for (; startYear <= endYear; startYear += 1) {
            $buttonEl = $yearEls.eq(cnt);

            if (startYear === year) {
                $buttonEl.addClass(classPrefix + CONSTANTS.selected);
            }

            if (this._isToday(startYear)) {
                $buttonEl.addClass(classPrefix + CONSTANTS.today);
            }

            relativeMonth = (startYear - year) * 12;

            $buttonEl.data(key, relativeMonth).html(startYear);

            cnt += 1;

            eventData = {
                $date: $buttonEl,
                $dateContainer: $buttonEl,
                year: startYear,
                month: 0,
                date: 0
            };

            this.fire('draw', eventData);
        }
    },

    /**
     * Change current shown layer on calendar
     * @param {number} shownLayerIdx - Index of shown layer
     */
    _changeShownLayer: function(shownLayerIdx) {
        var classPrefix = this._option.classPrefix;
        var prevshownLayerIdx = this.shownLayerIdx;
        var $bodys = this.$element.find('.' + classPrefix + 'body');

        this.shownLayerIdx = shownLayerIdx;

        $bodys.eq(prevshownLayerIdx).hide();
        $bodys.eq(shownLayerIdx).show();
    },

    /**
     * Draw calendar
     * @api
     * @param {number} [year] A year (ex. 2008)
     * @param {number} [month] A month (1 ~ 12)
     * @param {Boolean} [isRelative] A year and month is related
     * @param {string} [shownType] Shown type of layer (ex. [day, month, year] | [0] ~ 2])
     * @example
     * calendar.draw(); // Draw with now date.
     * calendar.draw(2008, 12); // Draw 2008/12
     * calendar.draw(null, 12); // Draw current year/12
     * calendar.draw(2010, null); // Draw 2010/current month
     * calendar.draw(0, 1, true); // Draw next month
     * calendar.draw(-1, null, true); // Draw prev year
     * calendar.draw(0, 0, false, 'date'); // Draw today with date's layer
     * calendar.draw(2010, 10, false, 'month'); // Draw 2010/10 with month's layer
     * calendar.draw(2016, null, false, 'year'); // Draw 2016/month with year's layer
     **/
    draw: function(year, month, isRelative, shownType) {
        var dateForDrawing = this._getDateForDrawing(year, month, isRelative);
        var isReadyForDrawing = this.invoke('beforeDraw', dateForDrawing);
        var shownLayerIdx;

        /**===============
         * beforeDraw
         =================*/
        if (!isReadyForDrawing) {
            return;
        }

        /**===============
         * draw
         =================*/
        shownLayerIdx = util.isNumber(shownType) ?
                        shownType : this._getIndexOfShownLayer(shownType);

        year = dateForDrawing.year;
        month = dateForDrawing.month;

        this.setDate(year, month);

        this._clear();
        this._drawHeader(dateForDrawing, shownLayerIdx);
        this._drawBody(dateForDrawing, shownLayerIdx);

        /**===============
         * afterDraw
         ================*/
        this.fire('afterDraw', dateForDrawing);
    },

    /**
     * Return current year and month(just shown).
     * @api
     * @returns {{year: number, month: number}}
     * @example
     *  getDate(); => { year: xxxx, month: xx };
     */
    getDate: function() {
        return {
            year: this._shownDate.year,
            month: this._shownDate.month
        };
    },

    /**
     * Set date
     * @api
     * @param {number} [year] A year (ex. 2008)
     * @param {number} [month] A month (1 ~ 12)
     * @example
     *  setDate(1984, 04);
     **/
    setDate: function(year, month) {
        var date = this._shownDate;
        date.year = util.isNumber(year) ? year : date.year;
        date.month = util.isNumber(month) ? month : date.month;
    }
});

util.CustomEvents.mixin(Calendar);
module.exports = Calendar;

},{"./constants":3,"./utils":4}],3:[function(require,module,exports){
'use strict';

var CONSTANTS = {
    relativeMonthValueKey: 'relativeMonthValue',
    prev: 'prev',
    prevYear: 'prev-year',
    prevMonth: 'prev-month',
    next: 'next',
    nextYear: 'next-year',
    nextMonth: 'next-month',
    selected: 'selected',
    today: 'today',
    clickable: 'clickable',
    calendarHeader: null,
    calendarBody: null,
    calendarFooter: null,
    defaultClassPrefixRegExp: /calendar-/g,
    titleRegExp: /yyyy|yy|mm|m|M/g,
    titleYearRegExp: /yyyy|yy/g,
    titleMonthRegExp: /mm|m|M/g,
    todayRegExp: /yyyy|yy|mm|m|M|dd|d|D/g,
    itemCountOfYear: 12,
    layerKeys: ['date', 'month', 'year']
};

/* eslint-disable */
CONSTANTS.calendarHeader = [
    '<div class="calendar-header">',
        '<a href="#" class="calendar-rollover calendar-btn-' + CONSTANTS.prev + '">Prev</a>',
        '<strong class="calendar-title"></strong>',
        '<a href="#" class="calendar-rollover calendar-btn-' + CONSTANTS.next + '">Next</a>',
    '</div>'].join('');

CONSTANTS.calendarBody = [
    '<div class="calendar-body">',
        '<table>',
            '<thead>',
                '<tr>',
                   '<th class="calendar-sun">Su</th><th>Mo</th><th>Tu</th><th>We</th><th>Th</th><th>Fa</th><th class="calendar-sat">Sa</th>',
                '</tr>',
            '</thead>',
            '<tbody>',
                '<tr class="calendar-week">',
                    '<td class="calendar-date"></td>',
                    '<td class="calendar-date"></td>',
                    '<td class="calendar-date"></td>',
                    '<td class="calendar-date"></td>',
                    '<td class="calendar-date"></td>',
                    '<td class="calendar-date"></td>',
                    '<td class="calendar-date"></td>',
                '</tr>',
            '</tbody>',
        '</table>',
    '</div>',
    '<div class="calendar-body">',
        '<table>',
            '<tbody>',
                '<tr class="calendar-month-group">',
                    '<td class="calendar-month"></td>',
                    '<td class="calendar-month"></td>',
                    '<td class="calendar-month"></td>',
                '</tr>',
            '</tbody>',
        '</table>',
    '</div>',
    '<div class="calendar-body">',
        '<table>',
            '<tbody>',
                '<tr class="calendar-year-group">',
                    '<td class="calendar-year"></td>',
                    '<td class="calendar-year"></td>',
                    '<td class="calendar-year"></td>',
                '</tr>',
            '</tbody>',
        '</table>',
    '</div>'].join('');

CONSTANTS.calendarFooter = [
    '<div class="calendar-footer">',
        '<p>오늘 <em class="calendar-today"></em></p>',
    '</div>'].join('');
/* eslint-enable */

module.exports = CONSTANTS;

},{}],4:[function(require,module,exports){
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
     * @returns {number} 주 (4~6)
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
     * @returns {number}
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
     * @returns {number} (0~6)
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
     * @returns {number} (0~6)
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
     * @returns {number} (1~31)
     * @memberof utils
     **/
    getLastDate: function(year, month) {
        return new Date(year, month, 0).getDate();
    },

    /**
     * Get date instance.
     * @function getDateObject
     * @param {Object} date A date hash
     * @returns {Date} Date
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
     * @returns {Object} dateObj
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
     * Chagne number 0~9 to '00~09'
     * @param {number} number number
     * @returns {string}
     * @private
     * @example
     *  utils.prependLeadingZero(0); //  '00'
     *  utils.prependLeadingZero(9); //  '09'
     *  utils.prependLeadingZero(12); //  '12'
     */
    prependLeadingZero: function(number) {
        var prefix = '';

        if (number < 10) {
            prefix = '0';
        }

        return prefix + number;
    },

    /**
     * Chage text and return.
     * @param {string} str A text to chagne
     * @param {Object} map A chagne key, value set
     * @param {RegExp} reg A regExp to chagne
     * @returns {string}
     * @private
     */
    getConvertedTitle: function(str, map, reg) {
        str = str.replace(reg, function(matchedString) {
            return map[matchedString] || '';
        });

        return str;
    }
};

module.exports = utils;

},{}]},{},[1]);
