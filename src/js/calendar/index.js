/**
 * @fileoverview Calendar component
 * @author NHN. FE dev Lab <dl_javascript@nhn.com>
 */

'use strict';

var defineClass = require('tui-code-snippet/defineClass/defineClass');
var CustomEvents = require('tui-code-snippet/customEvents/customEvents');
var addClass = require('tui-code-snippet/domUtil/addClass');
var hasClass = require('tui-code-snippet/domUtil/hasClass');
var removeClass = require('tui-code-snippet/domUtil/removeClass');
var removeElement = require('tui-code-snippet/domUtil/removeElement');
var extend = require('tui-code-snippet/object/extend');

var Header = require('./header');
var Body = require('./body');
var localeTexts = require('../localeTexts');
var constants = require('../constants');
var dateUtil = require('../dateUtil');
var util = require('../util');

var DEFAULT_WEEK_START_DAY = constants.DEFAULT_WEEK_START_DAY;
var DEFAULT_LANGUAGE_TYPE = constants.DEFAULT_LANGUAGE_TYPE;

var TYPE_DATE = constants.TYPE_DATE;
var TYPE_MONTH = constants.TYPE_MONTH;
var TYPE_YEAR = constants.TYPE_YEAR;

var CLASS_NAME_PREV_MONTH_BTN = constants.CLASS_NAME_PREV_MONTH_BTN;
var CLASS_NAME_PREV_YEAR_BTN = constants.CLASS_NAME_PREV_YEAR_BTN;
var CLASS_NAME_NEXT_YEAR_BTN = constants.CLASS_NAME_NEXT_YEAR_BTN;
var CLASS_NAME_NEXT_MONTH_BTN = constants.CLASS_NAME_NEXT_MONTH_BTN;

var CLASS_NAME_CALENDAR_MONTH = 'tui-calendar-month';
var CLASS_NAME_CALENDAR_YEAR = 'tui-calendar-year';
var CLASS_NAME_HIDDEN = 'tui-hidden';

var HEADER_SELECTOR = '.tui-calendar-header';
var BODY_SELECTOR = '.tui-calendar-body';

/**
 * @class
 * @description
 * Create a calendar by {@link DatePicker#createCalendar DatePicker.createCalendar()}.
 * @see {@link /tutorial-example07-calendar Calendar example}
 * @param {HTMLElement|string} container - Container or selector of the Calendar
 * @param {Object} [options] - Calendar options
 *     @param {Date} [options.date = new Date()] - Initial date (default: today)
 *     @param {('date'|'month'|'year')} [options.type = 'date'] - Calendar type. Determine whether to show a date, month, or year.
 *     @param {string} [options.language = 'en'] - Language code. English('en') and Korean('ko') are provided as default. To use the other languages, use {@link DatePicker#localeTexts DatePicker.localeTexts}.
 *     @param {boolean} [options.showToday = true] - Show today.
 *     @param {boolean} [options.showJumpButtons = false] - Show the yearly jump buttons (move to the previous and next year in 'date' Calendar)
 *     @param {boolean} [options.usageStatistics = true] - Send a hostname to Google Analytics (default: true)
 *     @param {string} [options.weekStartDay = 'Sun'] - Start of the week. 'Sun', 'Mon', ..., 'Sat'(default: 'Sun'(start on Sunday))
 * @example
 * //ES6
 * import DatePicker from 'tui-date-picker'
 *
 * // CommonJS
 * const DatePicker = require('tui-date-picker');
 *
 * // Browser
 * const DatePicker = tui.DatePicker;
 *
 * const calendar = DatePicker.createCalendar('#calendar-wrapper', {
 *     language: 'en',
 *     showToday: true,
 *     showJumpButtons: false,
 *     date: new Date(),
 *     type: 'date',
 *     weekStartDay: 'Mon',
 * });
 *
 * calendar.on('draw', (event) => {
 *     console.log(event.date);
 *     console.log(event.type);
 *     for (let i = 0, len = event.dateElements.length; i < len; i += 1) {
 *         const el = event.dateElements[i];
 *         const date = new Date(getData(el, 'timestamp'));
 *         console.log(date);
 *     }
 * });
 */
var Calendar = defineClass(
  /** @lends Calendar.prototype */ {
    static: {
      localeTexts: localeTexts
    },
    init: function(container, options) {
      options = extend(
        {
          language: DEFAULT_LANGUAGE_TYPE,
          showToday: true,
          showJumpButtons: false,
          date: new Date(),
          type: TYPE_DATE,
          usageStatistics: true,
          weekStartDay: DEFAULT_WEEK_START_DAY
        },
        options
      );

      /**
       * Container element
       * @type {HTMLElement}
       * @private
       */
      this._container = util.getElement(container);
      this._container.innerHTML =
        '<div class="tui-calendar">' +
        '    <div class="tui-calendar-header"></div>' +
        '    <div class="tui-calendar-body"></div>' +
        '</div>';

      /**
       * Wrapper element
       * @type {HTMLElement}
       * @private
       */
      this._element = this._container.firstChild;

      /**
       * Date
       * @type {Date}
       * @private
       */
      this._date = null;

      /**
       * Layer type
       * @type {string}
       * @private
       */
      this._type = null;

      /**
       * Header box
       * @type {Header}
       * @private
       */
      this._header = null;

      /**
       * Body box
       * @type {Body}
       * @private
       */
      this._body = null;

      this._initHeader(options);
      this._initBody(options);
      this.draw({
        date: options.date,
        type: options.type
      });

      if (options.usageStatistics) {
        util.sendHostName();
      }
    },

    /**
     * Initialize header
     * @param {object} options - Header options
     * @private
     */
    _initHeader: function(options) {
      var headerContainer = this._element.querySelector(HEADER_SELECTOR);

      this._header = new Header(headerContainer, options);
      this._header.on(
        'click',
        function(ev) {
          var target = util.getTarget(ev);
          if (hasClass(target, CLASS_NAME_PREV_MONTH_BTN)) {
            this.drawPrev();
          } else if (hasClass(target, CLASS_NAME_PREV_YEAR_BTN)) {
            this._onClickPrevYear();
          } else if (hasClass(target, CLASS_NAME_NEXT_MONTH_BTN)) {
            this.drawNext();
          } else if (hasClass(target, CLASS_NAME_NEXT_YEAR_BTN)) {
            this._onClickNextYear();
          }
        },
        this
      );
    },

    /**
     * Initialize body
     * @param {object} options - Body options
     * @private
     */
    _initBody: function(options) {
      var bodyContainer = this._element.querySelector(BODY_SELECTOR);

      this._body = new Body(bodyContainer, options);
    },

    /**
     * clickHandler - prev year button
     * @private
     */
    _onClickPrevYear: function() {
      if (this.getType() === TYPE_DATE) {
        this.draw({
          date: this._getRelativeDate(-12)
        });
      } else {
        this.drawPrev();
      }
    },

    /**
     * clickHandler - next year button
     * @private
     */
    _onClickNextYear: function() {
      if (this.getType() === TYPE_DATE) {
        this.draw({
          date: this._getRelativeDate(12)
        });
      } else {
        this.drawNext();
      }
    },

    /**
     * Returns whether the layer type is valid
     * @param {string} type - Layer type to check
     * @returns {boolean}
     * @private
     */
    _isValidType: function(type) {
      return type === TYPE_DATE || type === TYPE_MONTH || type === TYPE_YEAR;
    },

    /**
     * @param {Date} date - Date to draw
     * @param {string} type - Layer type to draw
     * @returns {boolean}
     * @private
     */
    _shouldUpdate: function(date, type) {
      var prevDate = this._date;

      if (!dateUtil.isValidDate(date)) {
        throw new Error('Invalid date');
      }

      if (!this._isValidType(type)) {
        throw new Error('Invalid layer type');
      }

      return (
        !prevDate ||
        prevDate.getFullYear() !== date.getFullYear() ||
        prevDate.getMonth() !== date.getMonth() ||
        this.getType() !== type
      );
    },

    /**
     * Render header & body elements
     * @private
     */
    _render: function() {
      var date = this._date;
      var type = this.getType();

      this._header.render(date, type);
      this._body.render(date, type);
      removeClass(this._element, CLASS_NAME_CALENDAR_MONTH, CLASS_NAME_CALENDAR_YEAR);

      switch (type) {
        case TYPE_MONTH:
          addClass(this._element, CLASS_NAME_CALENDAR_MONTH);
          break;
        case TYPE_YEAR:
          addClass(this._element, CLASS_NAME_CALENDAR_YEAR);
          break;
        default:
          break;
      }
    },

    /**
     * Returns relative date
     * @param {number} step - Month step
     * @returns {Date}
     * @private
     */
    _getRelativeDate: function(step) {
      var prev = this._date;

      return new Date(prev.getFullYear(), prev.getMonth() + step);
    },

    /**
     * Draw the calendar.
     * @param {Object} [options] - Draw options
     *   @param {Date} [options.date] - Date to set
     *   @param {('date'|'month'|'year')} [options.type = 'date'] - Calendar type. Determine whether to show a date, month, or year.
     * @example
     * calendar.draw();
     * calendar.draw({
     *     date: new Date()
     * });
     * calendar.draw({
     *     type: 'month'
     * });
     * calendar.draw({
     *     type: 'month',
     *     date: new Date()
     * });
     */
    draw: function(options) {
      var date, type;

      options = options || {};
      date = options.date || this._date;
      type = (options.type || this.getType()).toLowerCase();

      if (this._shouldUpdate(date, type)) {
        this._date = date;
        this._type = type;
        this._render();
      }

      /**
       * Occur after the calendar draws.
       * @event Calendar#draw
       * @see {@link https://nhn.github.io/tui.code-snippet/latest/CustomEvents#on calendar.on()} to bind event handlers.
       * @see {@link https://nhn.github.io/tui.code-snippet/latest/CustomEvents#off calendar.off()} to unbind event handlers.
       * @see Refer to {@link https://nhn.github.io/tui.code-snippet/latest/CustomEvents CustomEvents from tui-code-snippet} for more methods. Calendar mixes in the methods from CustomEvents.
       * @property {Date} date - Calendar date
       * @property {('date'|'month'|'year')} type - Calendar type
       * @property {HTMLElement[]} dateElements - elements for dates
       * @example
       * // bind the 'draw' event
       * calendar.on('draw', ({type, date}) => {
       *     console.log(`Draw the ${type} calendar and its date is ${date}.`);
       * });
       *
       * // unbind the 'draw' event
       * calendar.off('draw');
       */
      this.fire('draw', {
        date: this._date,
        type: type,
        dateElements: this._body.getDateElements()
      });
    },

    /**
     * Show the calendar.
     */
    show: function() {
      removeClass(this._element, CLASS_NAME_HIDDEN);
    },

    /**
     * Hide the calendar.
     */
    hide: function() {
      addClass(this._element, CLASS_NAME_HIDDEN);
    },

    /**
     * Draw the next page.
     */
    drawNext: function() {
      this.draw({
        date: this.getNextDate()
      });
    },

    /**
     * Draw the previous page.
     */
    drawPrev: function() {
      this.draw({
        date: this.getPrevDate()
      });
    },

    /**
     * Return the next date.
     * @returns {Date}
     */
    getNextDate: function() {
      if (this.getType() === TYPE_DATE) {
        return this._getRelativeDate(1);
      }

      return this.getNextYearDate();
    },

    /**
     * Return the previous date.
     * @returns {Date}
     */
    getPrevDate: function() {
      if (this.getType() === TYPE_DATE) {
        return this._getRelativeDate(-1);
      }

      return this.getPrevYearDate();
    },

    /**
     * Return the date a year later.
     * @returns {Date}
     */
    getNextYearDate: function() {
      switch (this.getType()) {
        case TYPE_DATE:
        case TYPE_MONTH:
          return this._getRelativeDate(12); // 12 months = 1 year
        case TYPE_YEAR:
          return this._getRelativeDate(108); // 108 months = 9 years = 12 * 9
        default:
          throw new Error('Unknown layer type');
      }
    },

    /**
     * Return the date a year previously.
     * @returns {Date}
     */
    getPrevYearDate: function() {
      switch (this.getType()) {
        case TYPE_DATE:
        case TYPE_MONTH:
          return this._getRelativeDate(-12); // 12 months = 1 year
        case TYPE_YEAR:
          return this._getRelativeDate(-108); // 108 months = 9 years = 12 * 9
        default:
          throw new Error('Unknown layer type');
      }
    },

    /**
     * Change language.
     * @param {string} language - Language code. English('en') and Korean('ko') are provided as default.
     * @see To set to the other languages, use {@link DatePicker#localeTexts DatePicker.localeTexts}.
     */
    changeLanguage: function(language) {
      this._header.changeLanguage(language);
      this._body.changeLanguage(language);
      this._render();
    },

    /**
     * Return the rendered date.
     * @returns {Date}
     */
    getDate: function() {
      return new Date(this._date);
    },

    /**
     * Return the calendar's type.
     * @returns {('date'|'month'|'year')}
     */
    getType: function() {
      return this._type;
    },

    /**
     * Returns HTML elements for dates.
     * @returns {HTMLElement[]}
     */
    getDateElements: function() {
      return this._body.getDateElements();
    },

    /**
     * Apply a CSS class to the calendar.
     * @param {string} className - Class name
     */
    addCssClass: function(className) {
      addClass(this._element, className);
    },

    /**
     * Remove a CSS class from the calendar.
     * @param {string} className - Class name
     */
    removeCssClass: function(className) {
      removeClass(this._element, className);
    },

    /**
     * Destroy the calendar.
     */
    destroy: function() {
      this._header.destroy();
      this._body.destroy();
      removeElement(this._element);

      this._type = this._date = this._container = this._element = this._header = this._body = null;
    }
  }
);

CustomEvents.mixin(Calendar);
module.exports = Calendar;
