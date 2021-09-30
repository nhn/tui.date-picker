/**
 * @fileoverview DatePicker component
 * @author NHN. FE dev Lab <dl_javascript@nhn.com>
 */

'use strict';

var inArray = require('tui-code-snippet/array/inArray');
var forEachArray = require('tui-code-snippet/collection/forEachArray');
var defineClass = require('tui-code-snippet/defineClass/defineClass');
var CustomEvents = require('tui-code-snippet/customEvents/customEvents');
var addClass = require('tui-code-snippet/domUtil/addClass');
var closest = require('tui-code-snippet/domUtil/closest');
var getData = require('tui-code-snippet/domUtil/getData');
var hasClass = require('tui-code-snippet/domUtil/hasClass');
var removeClass = require('tui-code-snippet/domUtil/removeClass');
var removeElement = require('tui-code-snippet/domUtil/removeElement');
var extend = require('tui-code-snippet/object/extend');
var isArray = require('tui-code-snippet/type/isArray');
var isDate = require('tui-code-snippet/type/isDate');
var isNumber = require('tui-code-snippet/type/isNumber');
var isObject = require('tui-code-snippet/type/isObject');

var TimePicker = require('tui-time-picker');

var Calendar = require('../calendar');
var RangeModel = require('./../rangeModel/index');
var constants = require('../constants');
var localeTexts = require('../localeTexts');
var dateUtil = require('../dateUtil');
var util = require('../util');
var mouseTouchEvent = require('../mouseTouchEvent');
var tmpl = require('../../template/datepicker/index');
var DatePickerInput = require('./input');

var DEFAULT_WEEK_START_DAY = constants.DEFAULT_WEEK_START_DAY;
var DEFAULT_LANGUAGE_TYPE = constants.DEFAULT_LANGUAGE_TYPE;
var TYPE_DATE = constants.TYPE_DATE;
var TYPE_MONTH = constants.TYPE_MONTH;
var TYPE_YEAR = constants.TYPE_YEAR;
var CLASS_NAME_NEXT_YEAR_BTN = constants.CLASS_NAME_NEXT_YEAR_BTN;
var CLASS_NAME_NEXT_MONTH_BTN = constants.CLASS_NAME_NEXT_MONTH_BTN;
var CLASS_NAME_PREV_YEAR_BTN = constants.CLASS_NAME_PREV_YEAR_BTN;
var CLASS_NAME_PREV_MONTH_BTN = constants.CLASS_NAME_PREV_MONTH_BTN;
var CLASS_NAME_SELECTED = constants.CLASS_NAME_SELECTED;
var CLASS_NAME_TITLE_TODAY = constants.CLASS_NAME_TITLE_TODAY;

var CLASS_NAME_SELECTABLE = 'tui-is-selectable';
var CLASS_NAME_BLOCKED = 'tui-is-blocked';
var CLASS_NAME_CHECKED = 'tui-is-checked';
var CLASS_NAME_SELECTOR_BUTTON = 'tui-datepicker-selector-button';
var CLASS_NAME_TODAY = 'tui-calendar-today';
var CLASS_NAME_HIDDEN = 'tui-hidden';

var SELECTOR_BODY = '.tui-datepicker-body';
var SELECTOR_DATE_ICO = '.tui-ico-date';
var SELECTOR_CALENDAR_TITLE = '.tui-calendar-title';
var SELECTOR_CALENDAR_CONTAINER = '.tui-calendar-container';
var SELECTOR_TIMEPICKER_CONTAINER = '.tui-timepicker-container';

/**
 * Merge default option
 * @ignore
 * @param {object} option - DatePicker option
 * @returns {object}
 */
var mergeDefaultOption = function(option) {
  option = extend(
    {
      language: DEFAULT_LANGUAGE_TYPE,
      calendar: {},
      input: {
        element: null,
        format: null
      },
      timePicker: null,
      date: null,
      showAlways: false,
      type: TYPE_DATE,
      selectableRanges: null,
      openers: [],
      autoClose: true,
      usageStatistics: true,
      weekStartDay: DEFAULT_WEEK_START_DAY
    },
    option
  );

  option.selectableRanges = option.selectableRanges || [[constants.MIN_DATE, constants.MAX_DATE]];

  if (!isObject(option.calendar)) {
    throw new Error('Calendar option must be an object');
  }
  if (!isObject(option.input)) {
    throw new Error('Input option must be an object');
  }
  if (!isArray(option.selectableRanges)) {
    throw new Error('Selectable-ranges must be a 2d-array');
  }

  option.localeText = localeTexts[option.language];

  // override calendar option
  option.calendar.language = option.language;
  option.calendar.type = option.type;

  // @TODO: after v5.0.0, remove option.timepicker
  option.timePicker = option.timePicker || option.timepicker;

  return option;
};

/**
 * @class
 * @description
 * Create a date picker.
 * @see {@link /tutorial-example01-basic DatePicker example}
 * @param {HTMLElement|string} container - Container element or selector of DatePicker
 * @param {Object} [options] - Options
 *      @param {Date|number} [options.date = null] - Initial date. Set by a Date instance or a number(timestamp). (default: no initial date)
 *      @param {('date'|'month'|'year')} [options.type = 'date'] - DatePicker type. Determine whether to choose a date, month, or year.
 *      @param {string} [options.language='en'] - Language code. English('en') and Korean('ko') are provided as default. To set to the other languages, use {@link DatePicker#localeTexts DatePicker.localeTexts}.
 *      @param {object|boolean} [options.timePicker] - [TimePicker](https://nhn.github.io/tui.time-picker/latest) options. Refer to the [TimePicker instance's options](https://nhn.github.io/tui.time-picker/latest/TimePicker). To create the TimePicker without customization, set to true.
 *      @param {object} [options.calendar] - {@link Calendar} options. Refer to the {@link Calendar Calendar instance's options}.
 *      @param {object} [options.input] - Input option
 *      @param {HTMLElement|string} [options.input.element] - Input element or selector
 *      @param {string} [options.input.format = 'yyyy-mm-dd'] - Format of the Date string
 *      @param {Array.<Array.<Date|number>>} [options.selectableRanges = 1900/1/1 ~ 2999/12/31]
 *        - Ranges of selectable date. Set by Date instances or numbers(timestamp).
 *      @param {Array<HTMLElement|string>} [options.openers = []] - List of the openers to open the DatePicker (example - icon, button, etc.)
 *      @param {boolean} [options.showAlways = false] - Show the DatePicker always
 *      @param {boolean} [options.autoClose = true] - Close the DatePicker after clicking the date
 *      @param {boolean} [options.usageStatistics = true] - Send a hostname to Google Analytics (default: true)
 *      @param {string} [options.weekStartDay = 'Sun'] - Start of the week. 'Sun', 'Mon', ..., 'Sat'(default: 'Sun'(start on Sunday))
 * @example
 * // ES6
 * import DatePicker from 'tui-date-picker'
 *
 * // CommonJS
 * const DatePicker = require('tui-date-picker');
 *
 * // Browser
 * const DatePicker = tui.DatePicker;
 *
 * const range1 = [new Date(2015, 2, 1), new Date(2015, 3, 1)];
 * const range2 = [1465570800000, 1481266182155]; // timestamps
 *
 * const picker1 = new DatePicker('#datepicker-container1', {
 *     showAlways: true
 * });
 *
 * const picker2 = new DatePicker('#datepicker-container2', {
 *    showAlways: true,
 *    timePicker: true
 * });
 *
 * const picker3 = new DatePicker('#datepicker-container3', {
 *     language: 'ko',
 *     calendar: {
 *         showToday: true
 *     },
 *     timePicker: {
 *         showMeridiem: true,
 *         defaultHour: 13,
 *         defaultMinute: 24
 *     },
 *     input: {
 *         element: '#datepicker-input',
 *         format: 'yyyy년 MM월 dd일 hh:mm A'
 *     }
 *     type: 'date',
 *     date: new Date(2015, 0, 1)
 *     selectableRanges: [range1, range2],
 *     openers: ['#opener'],
 *     weekStartDay: 'Mon',
 * });
 */
var DatePicker = defineClass(
  /** @lends DatePicker.prototype */ {
    static: {
      /**
       * Locale text data. English('en') and Korean('ko') are provided as default.
       * @type {object}
       * @memberof DatePicker
       * @static
       * @example
       * DatePicker.localeTexts['customKey'] = {
       *     titles: {
       *         // days
       *         DD: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
       *         // daysShort
       *         D: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
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
       * const datepicker = new DatePicker('#datepicker-container', {
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
       * @type {HTMLElement}
       * @private
       */
      this._container = util.getElement(container);
      this._container.innerHTML = tmpl(
        extend(options, {
          isTab: options.timePicker && options.timePicker.layoutType === 'tab'
        })
      );

      /**
       * DatePicker element
       * @type {HTMLElement}
       * @private
       */
      this._element = this._container.firstChild;

      /**
       * Calendar instance
       * @type {Calendar}
       * @private
       */
      this._calendar = new Calendar(
        this._element.querySelector(SELECTOR_CALENDAR_CONTAINER),
        extend(options.calendar, {
          usageStatistics: options.usageStatistics,
          weekStartDay: options.weekStartDay
        })
      );

      /**
       * TimePicker instance
       * @type {TimePicker}
       * @private
       */
      this._timePicker = null;

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
       * @type {number}
       * @private
       */
      this._id = 'tui-datepicker-' + util.generateId();

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
      this._setEvents();
      this._initTimePicker(option.timePicker, option.usageStatistics);
      this.setInput(option.input.element);
      this.setDateFormat(option.input.format);
      this.setDate(option.date);

      forEachArray(option.openers, this.addOpener, this);
      if (!this.showAlways) {
        this._hide();
      }

      if (this.getType() === TYPE_DATE) {
        addClass(this._element.querySelector(SELECTOR_BODY), 'tui-datepicker-type-date');
      }
    },

    /**
     * Set events on the date picker's element
     * @param {object} option - Constructor option
     * @private
     */
    _setEvents: function() {
      mouseTouchEvent.on(this._element, 'click', this._onClickHandler, this);
      this._calendar.on('draw', this._onDrawCalendar, this);
    },

    /**
     * Remove events on the date picker's element
     * @private
     */
    _removeEvents: function() {
      mouseTouchEvent.off(this._element, 'click', this._onClickHandler, this);
      this._calendar.off();
    },

    /**
     * Set events on the document
     * @private
     */
    _setDocumentEvents: function() {
      mouseTouchEvent.on(document, 'mousedown', this._onMousedownDocument, this);
    },

    /**
     * Remove events on the document
     * @private
     */
    _removeDocumentEvents: function() {
      mouseTouchEvent.off(document, 'mousedown', this._onMousedownDocument);
    },

    /**
     * Set events on the opener
     * @param {HTMLElement} opener An opener to bind the events
     * @private
     */
    _setOpenerEvents: function(opener) {
      mouseTouchEvent.on(opener, 'click', this.toggle, this);
    },

    /**
     * Remove events on the opener
     * @param {HTMLElement} opener An opener to unbind the events
     * @private
     */
    _removeOpenerEvents: function(opener) {
      mouseTouchEvent.off(opener, 'click', this.toggle);
    },

    /**
     * Set TimePicker instance
     * @param {object|boolean} opTimePicker - TimePicker instance options
     * @param {boolean} usageStatistics - GA tracking options
     * @private
     */
    _initTimePicker: function(opTimePicker, usageStatistics) {
      var layoutType;
      if (!opTimePicker) {
        return;
      }

      layoutType = opTimePicker.layoutType || '';

      if (isObject(opTimePicker)) {
        opTimePicker.usageStatistics = usageStatistics;
      } else {
        opTimePicker = {
          usageStatistics: usageStatistics
        };
      }

      this._timePicker = new TimePicker(
        this._element.querySelector(SELECTOR_TIMEPICKER_CONTAINER),
        opTimePicker
      );

      if (layoutType.toLowerCase() === 'tab') {
        this._timePicker.hide();
      }

      this._timePicker.on(
        'change',
        function(ev) {
          var prevDate;
          if (this._date) {
            prevDate = new Date(this._date);
            this.setDate(prevDate.setHours(ev.hour, ev.minute));
          }
        },
        this
      );
    },

    /**
     * Change picker's type by a selector button.
     * @param {HTMLElement} target A target element
     * @private
     */
    _changePicker: function(target) {
      var btnSelector = '.' + CLASS_NAME_SELECTOR_BUTTON;
      var selectedBtn = closest(target, btnSelector);
      var isDateElement = !!selectedBtn.querySelector(SELECTOR_DATE_ICO);

      if (isDateElement) {
        this._calendar.show();
        this._timePicker.hide();
      } else {
        this._calendar.hide();
        this._timePicker.show();
      }
      removeClass(this._element.querySelector('.' + CLASS_NAME_CHECKED), CLASS_NAME_CHECKED);
      addClass(selectedBtn, CLASS_NAME_CHECKED);
    },

    /**
     * Returns whether the element is opener
     * @param {string|HTMLElement} element - Element or selector
     * @returns {boolean}
     * @private
     */
    _isOpener: function(element) {
      var el = util.getElement(element);

      return inArray(el, this._openers) > -1;
    },

    /**
     * add/remove today-class-name to date element
     * @param {HTMLElement} el - date element
     * @private
     */
    _setTodayClassName: function(el) {
      var timestamp, isToday;

      if (this.getCalendarType() !== TYPE_DATE) {
        return;
      }

      timestamp = Number(getData(el, 'timestamp'));
      isToday = timestamp === new Date().setHours(0, 0, 0, 0);

      if (isToday) {
        addClass(el, CLASS_NAME_TODAY);
      } else {
        removeClass(el, CLASS_NAME_TODAY);
      }
    },

    /**
     * add/remove selectable-class-name to date element
     * @param {HTMLElement} el - date element
     * @private
     */
    _setSelectableClassName: function(el) {
      var elDate = new Date(Number(getData(el, 'timestamp')));

      if (this._isSelectableOnCalendar(elDate)) {
        addClass(el, CLASS_NAME_SELECTABLE);
        removeClass(el, CLASS_NAME_BLOCKED);
      } else {
        removeClass(el, CLASS_NAME_SELECTABLE);
        addClass(el, CLASS_NAME_BLOCKED);
      }
    },

    /**
     * add/remove selected-class-name to date element
     * @param {HTMLElement} el - date element
     * @private
     */
    _setSelectedClassName: function(el) {
      var elDate = new Date(Number(getData(el, 'timestamp')));

      if (this._isSelectedOnCalendar(elDate)) {
        addClass(el, CLASS_NAME_SELECTED);
      } else {
        removeClass(el, CLASS_NAME_SELECTED);
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
     * Show the date picker element
     * @private
     */
    _show: function() {
      removeClass(this._element, CLASS_NAME_HIDDEN);
    },

    /**
     * Hide the date picker element
     * @private
     */
    _hide: function() {
      addClass(this._element, CLASS_NAME_HIDDEN);
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
          if (this._timePicker) {
            this._timePicker.setTime(date.getHours(), date.getMinutes());
          }
          this.setDate(date);
        } else {
          isFailed = true;
        }
      } catch (err) {
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
      var target = util.getTarget(ev);
      var selector = util.getSelector(target);
      var isContain = selector ? this._element.querySelector(selector) : false;
      var isInput = this._datepickerInput.is(target);
      var isInOpener = inArray(target, this._openers) > -1;
      var shouldClose = !(this.showAlways || isInput || isContain || isInOpener);

      if (shouldClose) {
        this.close();
      }
    },

    /**
     * Event handler for click of calendar
     * @param {Event} ev An event object
     * @private
     */
    _onClickHandler: function(ev) {
      var target = util.getTarget(ev);

      if (closest(target, '.' + CLASS_NAME_SELECTABLE)) {
        ev.preventDefault();
        this._updateDate(target);
      } else if (closest(target, '.' + CLASS_NAME_TITLE_TODAY)) {
        ev.preventDefault();
        this._updateDateToToday();
      } else if (closest(target, SELECTOR_CALENDAR_TITLE)) {
        this.drawUpperCalendar(this._date);
      } else if (closest(target, '.' + CLASS_NAME_SELECTOR_BUTTON)) {
        this._changePicker(target);
      }
    },

    /**
     * Update date to today
     * @private
     */
    _updateDateToToday: function() {
      this.setDate(Date.now());
      this.close();
    },

    /**
     * Update date from event-target
     * @param {HTMLElement} target An event target element
     * @private
     */
    _updateDate: function(target) {
      var timestamp = Number(getData(target, 'timestamp'));
      var newDate = new Date(timestamp);
      var timePicker = this._timePicker;
      var prevDate = this._date;
      var calendarType = this.getCalendarType();
      var pickerType = this.getType();

      if (calendarType !== pickerType) {
        this.drawLowerCalendar(newDate);
      } else {
        if (timePicker) {
          newDate.setHours(timePicker.getHour(), timePicker.getMinute());
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
     * @see {@link Calendar#draw}
     * @private
     */
    _onDrawCalendar: function(eventData) {
      forEachArray(
        eventData.dateElements,
        function(el) {
          this._setTodayClassName(el);
          this._setSelectableClassName(el);
          this._setSelectedClassName(el);
        },
        this
      );
      this._setDisplayHeadButtons();

      /**
       * Occur after the calendar is drawn.
       * @event DatePicker#draw
       * @see {@link https://nhn.github.io/tui.code-snippet/latest/CustomEvents#on datepicker.on()} to bind event handlers.
       * @see {@link https://nhn.github.io/tui.code-snippet/latest/CustomEvents#off datepicker.off()} to unbind event handlers.
       * @see Refer to {@link https://nhn.github.io/tui.code-snippet/latest/CustomEvents CustomEvents from tui-code-snippet} for more methods. DatePicker mixes in the methods from CustomEvents.
       * @property {Date} date - Calendar date
       * @property {('date'|'month'|'year')} type - Calendar type
       * @property {HTMLElement[]} dateElements - elements for dates
       * @example
       * // bind the 'draw' event
       * datepicker.on('draw', (event) => {
       *     console.log(`Draw the ${event.type} calendar and its date is ${event.date}.`);
       * });
       *
       * // unbind the 'draw' event
       * datepicker.off('draw');
       */
      this.fire('draw', eventData);
    },

    /**
     * Hide useless buttons (next, next-year, prev, prev-year)
     * @see Don't save buttons reference. The buttons are rerendered every "calendar.draw".
     * @private
     */
    _setDisplayHeadButtons: function() {
      var nextYearDate = this._calendar.getNextYearDate();
      var prevYearDate = this._calendar.getPrevYearDate();
      var maxTimestamp = this._rangeModel.getMaximumValue();
      var minTimestamp = this._rangeModel.getMinimumValue();
      var nextYearBtn = this._element.querySelector('.' + CLASS_NAME_NEXT_YEAR_BTN);
      var prevYearBtn = this._element.querySelector('.' + CLASS_NAME_PREV_YEAR_BTN);
      var nextMonthDate, prevMonthDate, nextMonBtn, prevMonBtn;

      if (this.getCalendarType() === TYPE_DATE) {
        nextMonthDate = dateUtil.cloneWithStartOf(this._calendar.getNextDate(), TYPE_MONTH);
        prevMonthDate = dateUtil.cloneWithEndOf(this._calendar.getPrevDate(), TYPE_MONTH);

        nextMonBtn = this._element.querySelector('.' + CLASS_NAME_NEXT_MONTH_BTN);
        prevMonBtn = this._element.querySelector('.' + CLASS_NAME_PREV_MONTH_BTN);

        this._setDisplay(nextMonBtn, nextMonthDate.getTime() <= maxTimestamp);
        this._setDisplay(prevMonBtn, prevMonthDate.getTime() >= minTimestamp);

        prevYearDate.setDate(1);
        nextYearDate.setDate(1);
      } else {
        prevYearDate.setMonth(12, 0);
        nextYearDate.setMonth(0, 1);
      }

      this._setDisplay(nextYearBtn, nextYearDate.getTime() <= maxTimestamp);
      this._setDisplay(prevYearBtn, prevYearDate.getTime() >= minTimestamp);
    },

    /**
     * Set display show/hide by condition
     * @param {HTMLElement} el - An Element
     * @param {boolean} shouldShow - Condition
     * @private
     */
    _setDisplay: function(el, shouldShow) {
      if (el) {
        if (shouldShow) {
          removeClass(el, CLASS_NAME_HIDDEN);
        } else {
          addClass(el, CLASS_NAME_HIDDEN);
        }
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

      return !prevDate || date.getTime() !== prevDate.getTime();
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
     * Return the current calendar's type.
     * @returns {('date'|'month'|'year')}
     */
    getCalendarType: function() {
      return this._calendar.getType();
    },

    /**
     * Return the date picker's type.
     * @returns {('date'|'month'|'year')}
     */
    getType: function() {
      return this._type;
    },

    /**
     * Return whether the date is selectable.
     * @param {Date} date - Date to check
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
     * Return whether the date is selected.
     * @param {Date} date - Date to check
     * @returns {boolean}
     */
    isSelected: function(date) {
      return dateUtil.isValidDate(date) && dateUtil.isSame(this._date, date, this.getType());
    },

    /**
     * Set selectable ranges. Previous ranges will be removed.
     * @param {Array.<Array<Date|number>>} ranges - Selectable ranges. Use Date instances or numbers(timestamp).
     * @example
     * datepicker.setRanges([
     *     [new Date(2017, 0, 1), new Date(2018, 0, 2)],
     *     [new Date(2015, 2, 3), new Date(2016, 4, 2)]
     * ]);
     */
    setRanges: function(ranges) {
      var result = [];
      forEachArray(ranges, function(range) {
        var start = new Date(range[0]).getTime();
        var end = new Date(range[1]).getTime();

        result.push([start, end]);
      });

      this._rangeModel = new RangeModel(result);
      this._refreshFromRanges();
    },

    /**
     * Set the calendar's type.
     * @param {('date'|'month'|'year')} type - Calendar type
     * @example
     * datepicker.setType('month');
     */
    setType: function(type) {
      this._type = type;
    },

    /**
     * Add a selectable range. Use Date instances or numbers(timestamp).
     * @param {Date|number} start - the start date
     * @param {Date|number} end - the end date
     * @example
     * const start = new Date(2015, 1, 3);
     * const end = new Date(2015, 2, 6);
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
     * Remove a range. Use Date instances or numbers(timestamp).
     * @param {Date|number} start - the start date
     * @param {Date|number} end - the end date
     * @param {null|'date'|'month'|'year'} type - Range type. If falsy, start and end values are considered as timestamp
     * @example
     * const start = new Date(2015, 1, 3);
     * const end = new Date(2015, 2, 6);
     *
     * datepicker.removeRange(start, end);
     */
    removeRange: function(start, end, type) {
      start = new Date(start);
      end = new Date(end);

      if (type) {
        // @todo Consider time-range on timePicker
        start = dateUtil.cloneWithStartOf(start, type);
        end = dateUtil.cloneWithEndOf(end, type);
      }

      this._rangeModel.exclude(start.getTime(), end.getTime());
      this._refreshFromRanges();
    },

    /**
     * Add an opener.
     * @param {HTMLElement|string} opener - element or selector of opener
     */
    addOpener: function(opener) {
      opener = util.getElement(opener);

      if (!this._isOpener(opener)) {
        this._openers.push(opener);
        this._setOpenerEvents(opener);
      }
    },

    /**
     * Remove an opener.
     * @param {HTMLElement|string} opener - element or selector of opener
     */
    removeOpener: function(opener) {
      var index;

      opener = util.getElement(opener);
      index = inArray(opener, this._openers);

      if (index > -1) {
        this._removeOpenerEvents(opener);
        this._openers.splice(index, 1);
      }
    },

    /**
     * Remove all openers.
     */
    removeAllOpeners: function() {
      forEachArray(
        this._openers,
        function(opener) {
          this._removeOpenerEvents(opener);
        },
        this
      );
      this._openers = [];
    },

    /**
     * Open the date picker.
     * @example
     * datepicker.open();
     */
    open: function() {
      if (this.isOpened() || !this._isEnabled) {
        return;
      }

      this._calendar.draw({
        date: this._date,
        type: this._type
      });
      this._show();

      if (!this.showAlways) {
        this._setDocumentEvents();
      }

      /**
       * Occur after the date picker opens.
       * @event DatePicker#open
       * @see {@link https://nhn.github.io/tui.code-snippet/latest/CustomEvents#on datepicker.on()} to bind event handlers.
       * @see {@link https://nhn.github.io/tui.code-snippet/latest/CustomEvents#off datepicker.off()} to unbind event handlers.
       * @see Refer to {@link https://nhn.github.io/tui.code-snippet/latest/CustomEvents CustomEvents from tui-code-snippet} for more methods. DatePicker mixes in the methods from CustomEvents.
       * @example
       * // bind the 'open' event
       * datepicker.on('open', () => {
       *     alert('open');
       * });
       *
       * // unbind the 'open' event
       * datepicker.off('open');
       */
      this.fire('open');
    },

    /**
     * Raise the calendar type. (date -> month -> year)
     * @param {Date} [date] - Date to set
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
     * Lower the calendar type. (year -> month -> date)
     * @param {Date} [date] - Date to set
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
     * Close the date picker.
     * @exmaple
     * datepicker.close();
     */
    close: function() {
      if (!this.isOpened()) {
        return;
      }
      this._removeDocumentEvents();
      this._hide();

      /**
       * Occur after the date picker closes.
       * @event DatePicker#close
       * @see {@link https://nhn.github.io/tui.code-snippet/latest/CustomEvents#on datepicker.on()} to bind event handlers.
       * @see {@link https://nhn.github.io/tui.code-snippet/latest/CustomEvents#off datepicker.off()} to unbind event handlers.
       * @see Refer to {@link https://nhn.github.io/tui.code-snippet/latest/CustomEvents CustomEvents from tui-code-snippet} for more methods. DatePicker mixes in the methods from CustomEvents.
       * @example
       * // bind the 'close' event
       * datepicker.on('close', () => {
       *     alert('close');
       * });
       *
       * // unbind the 'close' event
       * datepicker.off('close');
       */
      this.fire('close');
    },

    /**
     * Toggle the date picker.
     * @example
     * datepicker.toggle();
     */
    toggle: function() {
      if (this.isOpened()) {
        this.close();
      } else {
        this.open();
      }
    },

    /**
     * Return the selected date.
     * @returns {?Date} - selected date
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
     * Select the date.
     * @param {Date|number} date - Date instance or timestamp to set
     * @example
     * datepicker.setDate(new Date()); // Set today
     */
    // eslint-disable-next-line complexity
    setDate: function(date) {
      var isValidInput, newDate, shouldUpdate;

      if (date === null) {
        this.setNull();

        return;
      }

      isValidInput = isNumber(date) || isDate(date);
      newDate = new Date(date);
      shouldUpdate = isValidInput && this._isChanged(newDate) && this.isSelectable(newDate);

      if (shouldUpdate) {
        newDate = new Date(date);
        this._date = newDate;
        this._calendar.draw({ date: newDate });
        if (this._timePicker) {
          this._timePicker.setTime(newDate.getHours(), newDate.getMinutes());
        }
        this._syncToInput();

        /**
         * Occur after the selected date is changed.
         * @event DatePicker#change
         * @see {@link https://nhn.github.io/tui.code-snippet/latest/CustomEvents#on datepicker.on()} to bind event handlers.
         * @see {@link https://nhn.github.io/tui.code-snippet/latest/CustomEvents#off datepicker.off()} to unbind event handlers.
         * @see Refer to {@link https://nhn.github.io/tui.code-snippet/latest/CustomEvents CustomEvents from tui-code-snippet} for more methods. DatePicker mixes in the methods from CustomEvents.
         * @example
         * // bind the 'change' event
         * datepicker.on('change', () => {
         *     console.log(`Selected date: ${datepicker.getDate()}`);
         * });
         *
         * // unbind the 'change' event
         * datepicker.off('change');
         */
        this.fire('change');
      }
    },

    /**
     * Set no date to be selected. (Selected date: null)
     */
    setNull: function() {
      var calendarDate = this._calendar.getDate();
      var isChagned = this._date !== null;

      this._date = null;

      if (this._datepickerInput) {
        this._datepickerInput.clearText();
      }
      if (this._timePicker) {
        this._timePicker.setTime(0, 0);
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
     * Select the date by the date string format.
     * @param {String} [format] - Date string format
     * @example
     * datepicker.setDateFormat('yyyy-MM-dd');
     * datepicker.setDateFormat('MM-dd, yyyy');
     * datepicker.setDateFormat('yy/M/d');
     * datepicker.setDateFormat('yy/MM/dd');
     */
    setDateFormat: function(format) {
      this._datepickerInput.setFormat(format);
      this._syncToInput();
    },

    /**
     * Return whether the datepicker opens or not
     * @returns {boolean}
     * @example
     * datepicker.close();
     * datepicker.isOpened(); // false
     *
     * datepicker.open();
     * datepicker.isOpened(); // true
     */
    isOpened: function() {
      return !hasClass(this._element, CLASS_NAME_HIDDEN);
    },

    /**
     * Return the time picker instance
     * @returns {?TimePicker} - TimePicker instance
     * @see {@link https://nhn.github.io/tui.time-picker/latest tui-time-picker}
     * @example
     * const timePicker = this.getTimePicker();
     */
    getTimePicker: function() {
      return this._timePicker;
    },

    /**
     * Return the calendar instance.
     * @see {@link calendar Calendar}
     * @returns {Calendar}
     */
    getCalendar: function() {
      return this._calendar;
    },

    /**
     * Return the locale text object.
     * @see {@link DatePicker#localeTexts DatePicker.localeTexts}
     * @returns {object}
     */
    getLocaleText: function() {
      return localeTexts[this._language] || localeTexts[DEFAULT_LANGUAGE_TYPE];
    },

    /**
     * Set the input element
     * @param {string|HTMLElement} element - Input element or selector
     * @param {object} [options] - Input option
     * @param {string} [options.format = prevInput.format] - Format of the Date string in the input
     * @param {boolean} [options.syncFromInput = false] - Whether set the date from the input
     */
    setInput: function(element, options) {
      var prev = this._datepickerInput;
      var localeText = this.getLocaleText();
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

      this._datepickerInput.on(
        {
          change: this._onChangeInput,
          click: this.open
        },
        this
      );

      if (options.syncFromInput) {
        this._syncFromInput();
      } else {
        this._syncToInput();
      }
    },

    /**
     * Enable the date picker.
     */
    enable: function() {
      if (this._isEnabled) {
        return;
      }
      this._isEnabled = true;
      this._datepickerInput.enable();

      forEachArray(
        this._openers,
        function(opener) {
          opener.removeAttribute('disabled');
          this._setOpenerEvents(opener);
        },
        this
      );
    },

    /**
     * Disable the date picker.
     */
    disable: function() {
      if (!this._isEnabled) {
        return;
      }

      this._isEnabled = false;
      this.close();
      this._datepickerInput.disable();

      forEachArray(
        this._openers,
        function(opener) {
          opener.setAttribute('disabled', true);
          this._removeOpenerEvents(opener);
        },
        this
      );
    },

    /**
     * Return whether the date picker is disabled
     * @returns {boolean}
     */
    isDisabled: function() {
      // @todo this._isEnabled --> this._isDisabled
      return !this._isEnabled;
    },

    /**
     * Apply a CSS class to the date picker.
     * @param {string} className - Class name
     */
    addCssClass: function(className) {
      addClass(this._element, className);
    },

    /**
     * Remove a CSS class from the date picker.
     * @param {string} className - Class name
     */
    removeCssClass: function(className) {
      removeClass(this._element, className);
    },

    /**
     * Return the date elements on the calendar.
     * @returns {HTMLElement[]}
     */
    getDateElements: function() {
      return this._calendar.getDateElements();
    },

    /**
     * Return the first overlapped range from the point or range.
     * @param {Date|number} startDate - Start date to find overlapped range
     * @param {Date|number} endDate - End date to find overlapped range
     * @returns {Array.<Date>} - \[startDate, endDate]
     */
    findOverlappedRange: function(startDate, endDate) {
      var startTimestamp = new Date(startDate).getTime();
      var endTimestamp = new Date(endDate).getTime();
      var overlappedRange = this._rangeModel.findOverlappedRange(startTimestamp, endTimestamp);

      return [new Date(overlappedRange[0]), new Date(overlappedRange[1])];
    },

    /**
     * Change language.
     * @param {string} language - Language code. English('en') and Korean('ko') are provided as default.
     * @see To set to the other languages, use {@link DatePicker#localeTexts DatePicker.localeTexts}.
     */
    changeLanguage: function(language) {
      this._language = language;
      this._calendar.changeLanguage(this._language);
      this._datepickerInput.changeLocaleTitles(this.getLocaleText().titles);
      this.setDateFormat(this._datepickerInput.getFormat());

      if (this._timePicker) {
        this._timePicker.changeLanguage(this._language);
      }
    },

    /**
     * Destroy the date picker.
     */
    destroy: function() {
      this._removeDocumentEvents();
      this._calendar.destroy();
      if (this._timePicker) {
        this._timePicker.destroy();
      }
      if (this._datepickerInput) {
        this._datepickerInput.destroy();
      }
      this._removeEvents();
      removeElement(this._element);
      this.removeAllOpeners();

      this._calendar = this._timePicker = this._datepickerInput = this._container = this._element = this._date = this._rangeModel = this._openers = this._isEnabled = this._id = null;
    }
  }
);

CustomEvents.mixin(DatePicker);
module.exports = DatePicker;
