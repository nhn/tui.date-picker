/**
 * @fileoverview DatePicker component
 * @author NHN ent FE dev Lab <dl_javascript@nhnent.com>
 */

'use strict';

var $ = require('jquery');
var snippet = require('tui-code-snippet');
var TimePicker = require('tui-time-picker');

var Calendar = require('../calendar');
var RangeModel = require('./../rangeModel/index');
var constants = require('../constants');
var localeTexts = require('../localeTexts');
var dateUtil = require('../dateUtil');
var setTouchClickEvent = require('../setTouchClickEvent');
var tmpl = require('../../template/datepicker/index.hbs');
var DatePickerInput = require('./input');

var DEFAULT_LANGUAGE_TYPE = constants.DEFAULT_LANGUAGE_TYPE;
var TYPE_DATE = constants.TYPE_DATE;
var TYPE_MONTH = constants.TYPE_MONTH;
var TYPE_YEAR = constants.TYPE_YEAR;
var CLASS_NAME_NEXT_YEAR_BTN = constants.CLASS_NAME_NEXT_YEAR_BTN;
var CLASS_NAME_NEXT_MONTH_BTN = constants.CLASS_NAME_NEXT_MONTH_BTN;
var CLASS_NAME_PREV_YEAR_BTN = constants.CLASS_NAME_PREV_YEAR_BTN;
var CLASS_NAME_PREV_MONTH_BTN = constants.CLASS_NAME_PREV_MONTH_BTN;
var CLASS_NAME_SELECTED = constants.CLASS_NAME_SELECTED;

var CLASS_NAME_SELECTABLE = 'tui-is-selectable';
var CLASS_NAME_BLOCKED = 'tui-is-blocked';
var CLASS_NAME_CHECKED = 'tui-is-checked';
var CLASS_NAME_SELECTOR_BUTTON = 'tui-datepicker-selector-button';
var CLASS_NAME_TODAY = 'tui-calendar-today';

var SELECTOR_BODY = '.tui-datepicker-body';
var SELECTOR_FOOTER = '.tui-datepicker-footer';
var SELECTOR_DATE_ICO = '.tui-ico-date';

/**
 * Merge default option
 * @ignore
 * @param {object} option - DatePicker option
 * @returns {object}
 */
var mergeDefaultOption = function(option) {
    option = snippet.extend({
        language: DEFAULT_LANGUAGE_TYPE,
        calendar: {},
        input: {
            element: null,
            format: null
        },
        timepicker: null,
        date: null,
        showAlways: false,
        type: TYPE_DATE,
        selectableRanges: null,
        openers: [],
        autoClose: true
    }, option);

    option.selectableRanges = option.selectableRanges || [[constants.MIN_DATE, constants.MAX_DATE]];

    if (!snippet.isObject(option.calendar)) {
        throw new Error('Calendar option must be an object');
    }
    if (!snippet.isObject(option.input)) {
        throw new Error('Input option must be an object');
    }
    if (!snippet.isArray(option.selectableRanges)) {
        throw new Error('Selectable-ranges must be a 2d-array');
    }

    option.localeText = localeTexts[option.language];

    // override calendar option
    option.calendar.language = option.language;
    option.calendar.type = option.type;

    return option;
};

/**
 * @class
 * @param {HTMLElement|jQuery|string} container - Container element of datepicker
 * @param {Object} [options] - Options
 *      @param {Date|number} [options.date] - Initial date. Default - null for no initial date
 *      @param {string} [options.type = 'date'] - DatePicker type - ('date' | 'month' | 'year')
 *      @param {string} [options.language='en'] - Language key
 *      @param {object|boolean} [options.timePicker] -
 *                              [TimePicker]{@link https://nhnent.github.io/tui.time-picker/latest} options
 *      @param {object} [options.calendar] - {@link Calendar} options
 *      @param {object} [options.input] - Input option
 *      @param {HTMLElement|string|jQuery} [options.input.element] - Input element
 *      @param {string} [options.input.format = 'yyyy-mm-dd'] - Date string format
 *      @param {Array.<Array.<Date|number>>} [options.selectableRanges = 1900/1/1 ~ 2999/12/31]
 *                                                                      - Selectable date ranges.
 *      @param {Array} [options.openers = []] - Opener button list (example - icon, button, etc.)
 *      @param {boolean} [options.showAlways = false] - Whether the datepicker shows always
 *      @param {boolean} [options.autoClose = true] - Close after click a date
 * @example
 * var DatePicker = tui.DatePicker; // or require('tui-date-picker');
 *
 * var range1 = [new Date(2015, 2, 1), new Date(2015, 3, 1)];
 * var range2 = [1465570800000, 1481266182155]; // timestamps
 *
 * var picker1 = new DatePicker('#datepicker-container1', {
 *     showAlways: true
 * });
 *
 * var picker2 = new DatePicker('#datepicker-container2', {
 *    showAlways: true,
 *    timepicker: true
 * });
 *
 * var picker3 = new DatePicker('#datepicker-container3', {
 *     // There are two supporting types by default - 'en' and 'ko'.
 *     // See "{@link DatePicker.localeTexts}"
 *     language: 'ko',
 *     calendar: {
 *         showToday: true
 *     },
 *     timepicker: {
 *         showMeridiem: true,
 *         defaultHour: 13,
 *         defaultMinute: 24
 *     },
 *     input: {
 *         element: '#datepicker-input',
 *         format: 'yyyy년 MM월 dd일 hh:mm A'
 *     }
 *     type: 'date',
 *     date: new Date(2015, 0, 1) // or timestamp. (default: null-(no initial date))
 *     selectableRanges: [range1, range2],
 *     openers: ['#opener']
 * });
 */
var DatePicker = snippet.defineClass(/** @lends DatePicker.prototype */{
    static: {
        /**
         * Locale text data
         * @type {object}
         * @memberof DatePicker
         * @static
         * @example
         * var DatePicker = tui.DatePicker; // or require('tui-date-picker');
         *
         * DatePicker.localeTexts['customKey'] = {
         *     titles: {
         *         // days
         *         DD: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
         *         // daysShort
         *         D: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fir', 'Sat'],
         *         // months
         *         MMMM: [
         *             'January', 'February', 'March', 'April', 'May', 'June',
         *             'July', 'August', 'September', 'October', 'November', 'December'
         *         ],
         *         // monthsShort
         *         MMM: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
         *     },
         *     titleFormat: 'MMM yyyy',
         *     todayFormat: 'D, MMMM dd, yyyy',
         *     date: 'Date',
         *     time: 'Time'
         * };
         *
         * var datepicker = new tui.DatePicker('#datepicker-container', {
         *     language: 'customKey'
         * });
         */
        localeTexts: localeTexts
    },
    init: function(container, options) {
        options = mergeDefaultOption(options);

        /**
         * Language type
         * @type {string}
         * @private
         */
        this._language = options.language;

        /**
         * DatePicker container
         * @type {jQuery}
         * @private
         */
        this._$container = $(container);

        /**
         * DatePicker element
         * @type {jQuery}
         * @private
         */
        this._$element = $(tmpl(options)).appendTo(this._$container);

        /**
         * Calendar instance
         * @type {Calendar}
         * @private
         */
        this._calendar = new Calendar(this._$element.find(SELECTOR_BODY), options.calendar);

        /**
         * TimePicker instance
         * @type {TimePicker}
         * @private
         */
        this._timepicker = null;

        /**
         * DatePicker input
         * @type {DatePickerInput}
         * @private
         */
        this._datepickerInput = null;

        /**
         * Object having date values
         * @type {Date}
         * @private
         */
        this._date = null;

        /**
         * Selectable date-ranges model
         * @type {RangeModel}
         * @private
         */
        this._rangeModel = null;

        /**
         * openers - opener list
         * @type {Array}
         * @private
         */
        this._openers = [];

        /**
         * State of picker enable
         * @type {boolean}
         * @private
         */
        this._isEnabled = true;

        /**
         * ID of instance
         * @private
         * @type {number}
         */
        this._id = 'tui-datepicker-' + snippet.stamp(this);

        /**
         * DatePicker type
         * @type {TYPE_DATE|TYPE_MONTH|TYPE_YEAR}
         * @private
         */
        this._type = options.type;

        /**
         * Show always or not
         * @type {boolean}
         */
        this.showAlways = options.showAlways;

        /**
         * Close after select a date
         * @type {boolean}
         */
        this.autoClose = options.autoClose;

        this._initializeDatePicker(options);
    },

    /**
     * Initialize method
     * @param {Object} option - user option
     * @private
     */
    _initializeDatePicker: function(option) {
        this.setRanges(option.selectableRanges);
        this._setEvents(option);
        this._initTimePicker(option.timepicker);
        this.setInput(option.input.element);
        this.setDateFormat(option.input.format);
        this.setDate(option.date);

        snippet.forEach(option.openers, this.addOpener, this);
        if (!this.showAlways) {
            this._$element.hide();
        }

        if (this.getType() === TYPE_DATE) {
            this._$element.find(SELECTOR_BODY).addClass('tui-datepicker-type-date');
        }
    },

    /**
     * Set events
     * @param {object} option - Constructor option
     * @private
     */
    _setEvents: function(option) {
        setTouchClickEvent(this._$element, $.proxy(this._onClickDate, this), {
            selector: '.' + CLASS_NAME_SELECTABLE,
            namespace: this._id
        });

        setTouchClickEvent(this._$element, $.proxy(this._onClickCalendarTitle, this), {
            selector: '.tui-calendar-title',
            namespace: this._id
        });

        if (option.timepicker && option.timepicker.layoutType === 'tab') {
            setTouchClickEvent(this._$element, $.proxy(this._onClickSelectorButton, this), {
                selector: '.' + CLASS_NAME_SELECTOR_BUTTON,
                namespace: this._id
            });
        }

        this._calendar.on('draw', this._onDrawCalendar, this);
    },

    /**
     * Off datepicker's events
     * @param {string|jQuery|Element} el - Element
     * @private
     */
    _offDatePickerEvents: function(el) {
        $(el).off('.' + this._id);
    },

    /**
     * Set TimePicker instance
     * @param {object|boolean} opTimePicker - TimePicker instance
     * @private
     */
    _initTimePicker: function(opTimePicker) {
        var layoutType;
        if (!opTimePicker) {
            return;
        }

        layoutType = opTimePicker.layoutType || '';
        if (layoutType.toLowerCase() === 'tab') {
            this._timepicker = new TimePicker(this._$element.find(SELECTOR_BODY), opTimePicker);
            this._timepicker.hide();
        } else {
            this._timepicker = new TimePicker(this._$element.find(SELECTOR_FOOTER), opTimePicker);
        }

        this._timepicker.on('change', function(ev) {
            var prevDate;
            if (this._date) {
                prevDate = new Date(this._date);
                this.setDate(prevDate.setHours(ev.hour, ev.minute));
            }
        }, this);
    },

    /**
     * Calendar-header click handler
     * @private
     */
    _onClickCalendarTitle: function() {
        this.drawUpperCalendar(this._date);
    },

    /**
     * Selector button click handler
     * @param {jQuery.Event} ev - Event object
     * @private
     */
    _onClickSelectorButton: function(ev) {
        var btnSelector = '.' + CLASS_NAME_SELECTOR_BUTTON;
        var $selectedBtn = $(ev.target).closest(btnSelector);
        var isDate = !!$selectedBtn.find(SELECTOR_DATE_ICO).length;

        if (isDate) {
            this._calendar.show();
            this._timepicker.hide();
        } else {
            this._calendar.hide();
            this._timepicker.show();
        }
        this._$element.find(btnSelector).removeClass(CLASS_NAME_CHECKED);
        $selectedBtn.addClass(CLASS_NAME_CHECKED);
    },

    /**
     * Returns whether the element is opener
     * @param {string|jQuery|HTMLElement} element - Element
     * @returns {boolean}
     * @private
     */
    _isOpener: function(element) {
        var el = $(element)[0];

        return snippet.inArray(el, this._openers) > -1;
    },

    /**
     * add/remove today-class-name to date element
     * @param {jQuery} $el - date element
     * @private
     */
    _setTodayClassName: function($el) {
        var timestamp, isToday;

        if (this.getCalendarType() !== TYPE_DATE) {
            return;
        }

        timestamp = $el.data('timestamp');
        isToday = timestamp === new Date().setHours(0, 0, 0, 0);

        if (isToday) {
            $el.addClass(CLASS_NAME_TODAY);
        } else {
            $el.removeClass(CLASS_NAME_TODAY);
        }
    },

    /**
     * add/remove selectable-class-name to date element
     * @param {jQuery} $el - date element
     * @private
     */
    _setSelectableClassName: function($el) {
        var elDate = new Date($el.data('timestamp'));

        if (this._isSelectableOnCalendar(elDate)) {
            $el.addClass(CLASS_NAME_SELECTABLE)
                .removeClass(CLASS_NAME_BLOCKED);
        } else {
            $el.addClass(CLASS_NAME_BLOCKED)
                .removeClass(CLASS_NAME_SELECTABLE);
        }
    },

    /**
     * add/remove selected-class-name to date element
     * @param {jQuery} $el - date element
     * @private
     */
    _setSelectedClassName: function($el) {
        var elDate = new Date($el.data('timestamp'));

        if (this._isSelectedOnCalendar(elDate)) {
            $el.addClass(CLASS_NAME_SELECTED);
        } else {
            $el.removeClass(CLASS_NAME_SELECTED);
        }
    },

    /**
     * Returns whether the date is selectable on calendar
     * @param {Date} date - Date instance
     * @returns {boolean}
     * @private
     */
    _isSelectableOnCalendar: function(date) {
        var type = this.getCalendarType();
        var start = dateUtil.cloneWithStartOf(date, type).getTime();
        var end = dateUtil.cloneWithEndOf(date, type).getTime();

        return this._rangeModel.hasOverlap(start, end);
    },

    /**
     * Returns whether the date is selected on calendar
     * @param {Date} date - Date instance
     * @returns {boolean}
     * @private
     */
    _isSelectedOnCalendar: function(date) {
        var curDate = this.getDate();
        var calendarType = this.getCalendarType();

        return curDate && dateUtil.isSame(curDate, date, calendarType);
    },

    /**
     * Set value a date-string of current this instance to input element
     * @private
     */
    _syncToInput: function() {
        if (!this._date) {
            return;
        }

        this._datepickerInput.setDate(this._date);
    },

    /**
     * Set date from input value
     * @param {boolean} [shouldRollback = false] - Should rollback from unselectable or error
     * @private
     */
    _syncFromInput: function(shouldRollback) {
        var isFailed = false;
        var date;

        try {
            date = this._datepickerInput.getDate();

            if (this.isSelectable(date)) {
                if (this._timepicker) {
                    this._timepicker.setTime(date.getHours(), date.getMinutes());
                }
                this.setDate(date);
            } else {
                isFailed = true;
            }
        } catch (err) {
            /**
             * Parsing error from input-text
             * @event DatePicker#error
             * @example
             *
             * datepicker.on('error', function(err) {
             *     console.error(err.message);
             * });
             */
            this.fire('error', {
                type: 'ParsingError',
                message: err.message
            });
            isFailed = true;
        } finally {
            if (isFailed) {
                if (shouldRollback) {
                    this._syncToInput();
                } else {
                    this.setNull();
                }
            }
        }
    },

    /**
     * Event handler for mousedown of document<br>
     * - When click the out of layer, close the layer
     * @param {Event} ev - Event object
     * @private
     */
    _onMousedownDocument: function(ev) {
        var evTarget = ev.target;
        var isContains = $.contains(this._$element[0], evTarget);
        var isInput = this._datepickerInput.is(evTarget);
        var isInOpener = !!$(evTarget).closest(this._openers).length;
        var shouldClose = !(this.showAlways || isInput || isContains || isInOpener);

        if (shouldClose) {
            this.close();
        }
    },

    /**
     * Event handler for click of calendar<br>
     * - Update date form event-target
     * @param {Event} ev - event object
     * @private
     */
    _onClickDate: function(ev) {
        var timestamp = $(ev.target).data('timestamp');
        var newDate = new Date(timestamp);
        var timepicker = this._timepicker;
        var prevDate = this._date;
        var calendarType = this.getCalendarType();
        var pickerType = this.getType();

        if (calendarType !== pickerType) {
            this.drawLowerCalendar(newDate);
        } else {
            if (timepicker) {
                newDate.setHours(timepicker.getHour(), timepicker.getMinute());
            } else if (prevDate) {
                newDate.setHours(prevDate.getHours(), prevDate.getMinutes());
            }
            this.setDate(newDate);

            if (!this.showAlways && this.autoClose) {
                this.close();
            }
        }
    },

    /**
     * Event handler for 'draw'-custom event of calendar
     * @param {Object} eventData - custom event data
     * @see {Calendar.draw}
     * @private
     */
    _onDrawCalendar: function(eventData) {
        var $dateElements = eventData.$dateElements;
        var self = this;

        $dateElements.each(function(idx, el) {
            var $el = $(el);
            self._setTodayClassName($el);
            self._setSelectableClassName($el);
            self._setSelectedClassName($el);
        });
        this._setDisplayHeadButtons();

        /**
         * Fires after calendar drawing
         * @event DatePicker#draw
         * @param {Object} event - See {@link Calendar#event:draw}
         * @param {Date} event.date - Calendar date
         * @param {string} event.type - Calendar type
         * @param {jQuery} event.$dateElements - Calendar date elements
         */
        this.fire('draw', eventData);
    },

    /**
     * Hide useless buttons (next, next-year, prev, prev-year)
     * @see Don't save buttons reference. The buttons are rerendered every "calendar.darw".
     * @private
     */
    _setDisplayHeadButtons: function() {
        var nextYearDate = this._calendar.getNextYearDate();
        var prevYearDate = this._calendar.getPrevYearDate();
        var maxTimestamp = this._rangeModel.getMaximumValue();
        var minTimestamp = this._rangeModel.getMinimumValue();
        var $nextYearBtn = this._$element.find('.' + CLASS_NAME_NEXT_YEAR_BTN);
        var $prevYearBtn = this._$element.find('.' + CLASS_NAME_PREV_YEAR_BTN);
        var nextMonthDate, prevMonthDate, $nextMonBtn, $prevMonBtn;

        if (this.getCalendarType() === TYPE_DATE) {
            nextMonthDate = dateUtil.cloneWithStartOf(this._calendar.getNextDate(), TYPE_MONTH);
            prevMonthDate = dateUtil.cloneWithEndOf(this._calendar.getPrevDate(), TYPE_MONTH);

            $nextMonBtn = this._$element.find('.' + CLASS_NAME_NEXT_MONTH_BTN);
            $prevMonBtn = this._$element.find('.' + CLASS_NAME_PREV_MONTH_BTN);

            this._setDisplay($nextMonBtn, nextMonthDate.getTime() <= maxTimestamp);
            this._setDisplay($prevMonBtn, prevMonthDate.getTime() >= minTimestamp);

            prevYearDate.setDate(1);
            nextYearDate.setDate(1);
        } else {
            prevYearDate.setMonth(12, 0);
            nextYearDate.setMonth(0, 1);
        }

        this._setDisplay($nextYearBtn, nextYearDate.getTime() <= maxTimestamp);
        this._setDisplay($prevYearBtn, prevYearDate.getTime() >= minTimestamp);
    },

    /**
     * Set display show/hide by condition
     * @param {jQuery} $el - jQuery Element
     * @param {boolean} shouldShow - Condition
     * @private
     */
    _setDisplay: function($el, shouldShow) {
        if (shouldShow) {
            $el.show();
        } else {
            $el.hide();
        }
    },

    /**
     * Input change handler
     * @private
     * @throws {Error}
     */
    _onChangeInput: function() {
        this._syncFromInput(true);
    },

    /**
     * Returns whether the date is changed
     * @param {Date} date - Date
     * @returns {boolean}
     * @private
     */
    _isChanged: function(date) {
        var prevDate = this.getDate();

        return !prevDate || (date.getTime() !== prevDate.getTime());
    },

    /**
     * Refresh datepicker
     * @private
     */
    _refreshFromRanges: function() {
        if (!this.isSelectable(this._date)) {
            this.setNull();
        } else {
            this._calendar.draw(); // view update
        }
    },

    /**
     * Returns current calendar type
     * @returns {'date'|'month'|'year'}
     */
    getCalendarType: function() {
        return this._calendar.getType();
    },

    /**
     * Returns datepicker type
     * @returns {'date'|'month'|'year'}
     */
    getType: function() {
        return this._type;
    },

    /**
     * Whether the date is selectable
     * @param {Date} date - Date instance
     * @returns {boolean}
     */
    isSelectable: function(date) {
        var type = this.getType();
        var start, end;

        if (!dateUtil.isValidDate(date)) {
            return false;
        }
        start = dateUtil.cloneWithStartOf(date, type).getTime();
        end = dateUtil.cloneWithEndOf(date, type).getTime();

        return this._rangeModel.hasOverlap(start, end);
    },

    /**
     * Returns whether the date is selected
     * @param {Date} date - Date instance
     * @returns {boolean}
     */
    isSelected: function(date) {
        return dateUtil.isValidDate(date) && dateUtil.isSame(this._date, date, this.getType());
    },

    /**
     * Set selectable ranges (prev ranges will be removed)
     * @param {Array.<Array<Date|number>>} ranges - (2d-array) Selectable ranges
     * @example
     *
     * datepicker.setRanges([
     *     [new Date(2017, 0, 1), new Date(2018, 0, 2)],
     *     [new Date(2015, 2, 3), new Date(2016, 4, 2)]
     * ]);
     */
    setRanges: function(ranges) {
        ranges = snippet.map(ranges, function(range) {
            var start = new Date(range[0]).getTime();
            var end = new Date(range[1]).getTime();

            return [start, end];
        });

        this._rangeModel = new RangeModel(ranges);
        this._refreshFromRanges();
    },

    /**
     * Add a range
     * @param {Date|number} start - startDate
     * @param {Date|number} end - endDate
     * @example
     * var start = new Date(2015, 1, 3);
     * var end = new Date(2015, 2, 6);
     *
     * datepicker.addRange(start, end);
     */
    addRange: function(start, end) {
        start = new Date(start).getTime();
        end = new Date(end).getTime();

        this._rangeModel.add(start, end);
        this._refreshFromRanges();
    },

    /**
     * Remove a range
     * @param {Date|number} start - startDate
     * @param {Date|number} end - endDate
     * @param {null|'date'|'month'|'year'} type - Range type, If falsy -> Use strict timestamp;
     * @example
     * var start = new Date(2015, 1, 3);
     * var end = new Date(2015, 2, 6);
     *
     * datepicker.removeRange(start, end);
     */
    removeRange: function(start, end, type) {
        start = new Date(start);
        end = new Date(end);

        if (type) {
            // @todo Consider time-range on timepicker
            start = dateUtil.cloneWithStartOf(start, type);
            end = dateUtil.cloneWithEndOf(end, type);
        }

        this._rangeModel.exclude(start.getTime(), end.getTime());
        this._refreshFromRanges();
    },

    /**
     * Add opener
     * @param {HTMLElement|jQuery|string} opener - element or selector
     */
    addOpener: function(opener) {
        if (!this._isOpener(opener)) {
            this._openers.push($(opener)[0]);
            setTouchClickEvent(opener, $.proxy(this.toggle, this), {
                namespace: this._id
            });
        }
    },

    /**
     * Remove opener
     * @param {HTMLElement|jQuery|string} opener - element or selector
     */
    removeOpener: function(opener) {
        var $opener = $(opener);
        var index = snippet.inArray($opener[0], this._openers);

        if (index > -1) {
            this._offDatePickerEvents(opener);
            this._openers.splice(index, 1);
        }
    },

    /**
     * Remove all openers
     */
    removeAllOpeners: function() {
        this._offDatePickerEvents(this._openers);
        this._openers = [];
    },

    /**
     * Open datepicker
     * @example
     * datepicker.open();
     */
    open: function() {
        var docEvTypes;
        if (this.isOpened() || !this._isEnabled) {
            return;
        }

        this._calendar.draw({
            date: this._date,
            type: this._type
        });
        this._$element.show();

        if (!this.showAlways) {
            docEvTypes = 'touchstart.' + this._id + ' mousedown.' + this._id;
            $(document).on(docEvTypes, $.proxy(this._onMousedownDocument, this));
        }

        /**
         * @event DatePicker#open
         * @example
         * datepicker.on('open', function() {
         *     alert('open');
         * });
         */
        this.fire('open');
    },

    /**
     * Raise calendar type
     *  - DATE --> MONTH --> YEAR
     * @param {Date} date - Date
     */
    drawUpperCalendar: function(date) {
        var calendarType = this.getCalendarType();

        if (calendarType === TYPE_DATE) {
            this._calendar.draw({
                date: date,
                type: TYPE_MONTH
            });
        } else if (calendarType === TYPE_MONTH) {
            this._calendar.draw({
                date: date,
                type: TYPE_YEAR
            });
        }
    },

    /**
     * Lower calendar type
     *  - YEAR --> MONTH --> DATE
     * @param {Date} date - Date
     */
    drawLowerCalendar: function(date) {
        var calendarType = this.getCalendarType();
        var pickerType = this.getType();
        var isLast = calendarType === pickerType;

        if (isLast) {
            return;
        }

        if (calendarType === TYPE_MONTH) {
            this._calendar.draw({
                date: date,
                type: TYPE_DATE
            });
        } else if (calendarType === TYPE_YEAR) {
            this._calendar.draw({
                date: date,
                type: TYPE_MONTH
            });
        }
    },

    /**
     * Close datepicker
     * @exmaple
     * datepicker.close();
     */
    close: function() {
        if (!this.isOpened()) {
            return;
        }
        this._offDatePickerEvents(document);
        this._$element.hide();

        /**
         * Close event - DatePicker
         * @event DatePicker#close
         * @example
         * datepicker.on('close', function() {
         *     alert('close');
         * });
         */
        this.fire('close');
    },

    /**
     * Toggle: open-close
     * @example
     * datepicker.toggle();
     */
    toggle: function() {
        var isOpened = this.isOpened();

        if (isOpened) {
            this.close();
        } else {
            this.open();
        }
    },

    /**
     * Returns date object
     * @returns {?Date} - Date
     * @example
     * // 2015-04-13
     * datepicker.getDate(); // new Date(2015, 3, 13)
     */
    getDate: function() {
        if (!this._date) {
            return null;
        }

        return new Date(this._date);
    },

    /**
     * Set date and then fire 'update' custom event
     * @param {Date|number} date - Date instance or timestamp
     * @example
     * datepicker.setDate(new Date()); // Set today
     */
    setDate: function(date) {
        var isValidInput, newDate, shouldUpdate;

        if (date === null) {
            this.setNull();

            return;
        }

        isValidInput = snippet.isNumber(date) || snippet.isDate(date);
        newDate = new Date(date);
        shouldUpdate = isValidInput && this._isChanged(newDate) && this.isSelectable(newDate);

        if (shouldUpdate) {
            newDate = new Date(date);
            this._date = newDate;
            this._calendar.draw({date: newDate});
            if (this._timepicker) {
                this._timepicker.setTime(newDate.getHours(), newDate.getMinutes());
            }
            this._syncToInput();

            /**
             * Change event
             * @event DatePicker#change
             * @example
             *
             * datepicker.on('change', function() {
             *     var newDate = datepicker.getDate();
             *
             *     console.log(newDate);
             * });
             */
            this.fire('change');
        }
    },

    /**
     * Set null date
     */
    setNull: function() {
        var calendarDate = this._calendar.getDate();
        var isChagned = this._date !== null;

        this._date = null;

        if (this._datepickerInput) {
            this._datepickerInput.clearText();
        }
        if (this._timepicker) {
            this._timepicker.setTime(0, 0);
        }

        // View update
        if (!this.isSelectable(calendarDate)) {
            this._calendar.draw({
                date: new Date(this._rangeModel.getMinimumValue())
            });
        } else {
            this._calendar.draw();
        }

        if (isChagned) {
            this.fire('change');
        }
    },

    /**
     * Set or update date-form
     * @param {String} [format] - date-format
     * @example
     * datepicker.setDateFormat('yyyy-MM-dd');
     * datepicker.setDateFormat('MM-dd, yyyy');
     * datepicker.setDateFormat('y/M/d');
     * datepicker.setDateFormat('yy/MM/dd');
     */
    setDateFormat: function(format) {
        this._datepickerInput.setFormat(format);
        this._syncToInput();
    },

    /**
     * Return whether the datepicker is opened or not
     * @returns {boolean}
     * @example
     * datepicker.close();
     * datepicker.isOpened(); // false
     *
     * datepicker.open();
     * datepicker.isOpened(); // true
     */
    isOpened: function() {
        return this._$element.css('display') !== 'none';
    },

    /**
     * Returns timepicker instance
     * @returns {?TimePicker} - TimePicker instance
     * @example
     * var timepicker = this.getTimePicker();
     */
    getTimePicker: function() {
        return this._timepicker;
    },

    /**
     * Returns calendar instance
     * @returns {Calendar}
     */
    getCalendar: function() {
        return this._calendar;
    },

    /**
     * Set input element
     * @param {string|jQuery|HTMLElement} element - Input element
     * @param {object} [options] - Input option
     * @param {string} [options.format = prevInput.format] - Input text format
     * @param {boolean} [options.syncFromInput = false] - Set date from input value
     */
    setInput: function(element, options) {
        var prev = this._datepickerInput;
        var localeText = localeTexts[this._language] || localeTexts[DEFAULT_LANGUAGE_TYPE];
        var prevFormat;
        options = options || {};

        if (prev) {
            prevFormat = prev.getFormat();
            prev.destroy();
        }

        this._datepickerInput = new DatePickerInput(element, {
            format: options.format || prevFormat,
            id: this._id,
            localeText: localeText
        });

        this._datepickerInput.on({
            change: this._onChangeInput,
            click: this.open
        }, this);

        if (options.syncFromInput) {
            this._syncFromInput();
        } else {
            this._syncToInput();
        }
    },

    /**
     * Enable
     * @example
     * datepicker.disable();
     * datepicker.enable();
     */
    enable: function() {
        if (this._isEnabled) {
            return;
        }
        this._isEnabled = true;
        this._datepickerInput.enable();

        snippet.forEach(this._openers, function(opener) {
            $(opener).removeAttr('disabled');
            setTouchClickEvent(opener, $.proxy(this.toggle, this), {
                namespace: this._id
            });
        }, this);
    },

    /**
     * Disable
     * @example
     * datepicker.enable();
     * datepicker.disable();
     */
    disable: function() {
        if (!this._isEnabled) {
            return;
        }

        this._isEnabled = false;
        this.close();
        this._datepickerInput.disable();

        this._offDatePickerEvents(this._openers);
        snippet.forEach(this._openers, function(opener) {
            $(opener).attr('disabled', true);
        }, this);
    },

    /**
     * Returns whether the datepicker is disabled
     * @returns {boolean}
     */
    isDisabled: function() {
        // @todo this._isEnabled --> this._isDisabled
        return !this._isEnabled;
    },

    /**
     * Add datepicker css class
     * @param {string} className - Class name
     */
    addCssClass: function(className) {
        this._$element.addClass(className);
    },

    /**
     * Remove datepicker css class
     * @param {string} className - Class name
     */
    removeCssClass: function(className) {
        this._$element.removeClass(className);
    },

    /**
     * Returns date elements(jQuery) on calendar
     * @returns {jQuery}
     */
    getDateElements: function() {
        return this._calendar.getDateElements();
    },

    /**
     * Returns the first overlapped range from the point or range
     * @param {Date|number} startDate - Start date to find overlapped range
     * @param {Date|number} endDate - End date to find overlapped range
     * @returns {Array.<Date>} - [startDate, endDate]
     */
    findOverlappedRange: function(startDate, endDate) {
        var startTimestamp = new Date(startDate).getTime();
        var endTimestamp = new Date(endDate).getTime();
        var overlappedRange = this._rangeModel.findOverlappedRange(startTimestamp, endTimestamp);

        return [new Date(overlappedRange[0]), new Date(overlappedRange[1])];
    },

    /**
     * Destroy
     */
    destroy: function() {
        this._offDatePickerEvents(document);
        this._calendar.destroy();
        if (this._timepicker) {
            this._timepicker.destroy();
        }
        if (this._datepickerInput) {
            this._datepickerInput.destroy();
        }
        this._$element.remove();
        this.removeAllOpeners();

        this._calendar
            = this._timepicker
            = this._datepickerInput
            = this._$container
            = this._$element
            = this._date
            = this._rangeModel
            = this._openers
            = this._isEnabled
            = this._id
            = null;
    }
});

snippet.CustomEvents.mixin(DatePicker);
module.exports = DatePicker;
