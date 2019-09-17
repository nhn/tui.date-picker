/**
 * @fileoverview Calendar component
 * @author NHN. FE dev Lab <dl_javascript@nhn.com>
 */

'use strict';

var snippet = require('tui-code-snippet');
var domUtil = require('tui-dom');

var tmpl = require('./../../template/calendar/index.hbs');
var Header = require('./header');
var Body = require('./body');
var localeTexts = require('../localeTexts');
var constants = require('../constants');
var dateUtil = require('../dateUtil');
var util = require('../util');

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
 * Calendar class
 * @constructor
 * @param {HTMLElement|string} wrapperElement - Wrapper element or selector
 * @param {Object} [options] - Options for initialize
 *     @param {string} [options.language = 'en'] - Calendar language - {@link Calendar.localeTexts}
 *     @param {boolean} [options.showToday] - If true, shows today
 *     @param {boolean} [options.showJumpButtons] - If true, shows jump buttons (next,prev-year in 'date'-Calendar)
 *     @param {Date} [options.date = new Date()] - Initial date
 *     @param {string} [options.type = 'date'] - Calendar types - 'date', 'month', 'year'
 *     @param {Boolean} [options.usageStatistics=true|false] send hostname to google analytics (default value is true)
 * @example
 * var DatePicker = tui.DatePicker; // or require('tui-date-picker');
 * var calendar = DatePicker.createCalendar('#calendar-wrapper', {
 *     language: 'en', // There are two supporting types by default - 'en' and 'ko'.
 *     showToday: true,
 *     showJumpButtons: false,
 *     date: new Date(),
 *     type: 'date'
 * });
 *
 * calendar.on('draw', function(event) {
 *     var i, len;
 *     console.log(event.date);
 *     console.log(event.type);
 *     for (i = 0, len = event.dateElements.length; i < len; i += 1) {
 *         var el = event.dateElements[i];
 *         var date = new Date(domUtil.getData(el, 'timestamp'));
 *         console.log(date);
 *     }
 * });
 */
var Calendar = snippet.defineClass(
  /** @lends Calendar.prototype */ {
    static: {
      /**
       * Locale text data
       * @type {object}
       * @memberof Calendar
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
       *     todayFormat: 'D, MMMM dd, yyyy'
       * };
       *
       * var calendar = DatePicker.createCalendar('#calendar-wrapper', {
       *     language: 'customKey',
       * });
       */
      localeTexts: localeTexts
    },
    init: function(container, options) {
      options = snippet.extend(
        {
          language: DEFAULT_LANGUAGE_TYPE,
          showToday: true,
          showJumpButtons: false,
          date: new Date(),
          type: TYPE_DATE,
          usageStatistics: true
        },
        options
      );

      /**
       * Container element
       * @type {HTMLElement}
       * @private
       */
      this._container = util.getElement(container);
      this._container.innerHTML = tmpl(options);

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
        snippet.sendHostname('date-picker', 'UA-129987462-1');
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
          if (domUtil.hasClass(target, CLASS_NAME_PREV_MONTH_BTN)) {
            this.drawPrev();
          } else if (domUtil.hasClass(target, CLASS_NAME_PREV_YEAR_BTN)) {
            this._onClickPrevYear();
          } else if (domUtil.hasClass(target, CLASS_NAME_NEXT_MONTH_BTN)) {
            this.drawNext();
          } else if (domUtil.hasClass(target, CLASS_NAME_NEXT_YEAR_BTN)) {
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
      domUtil.removeClass(this._element, CLASS_NAME_CALENDAR_MONTH, CLASS_NAME_CALENDAR_YEAR);

      switch (type) {
        case TYPE_MONTH:
          domUtil.addClass(this._element, CLASS_NAME_CALENDAR_MONTH);
          break;
        case TYPE_YEAR:
          domUtil.addClass(this._element, CLASS_NAME_CALENDAR_YEAR);
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
     * Draw calendar
     * @param {?object} options - Draw options
     * @example
     *
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
       * @event Calendar#draw
       * @type {object} evt
       * @property {Date} date - Calendar date
       * @property {string} type - Calendar type
       * @property {HTMLElement} dateElements - Calendar date elements
       * @example
       * calendar.on('draw', function(evt) {
       *     console.error(evt.date);
       * });
       */
      this.fire('draw', {
        date: this._date,
        type: type,
        dateElements: this._body.getDateElements()
      });
    },

    /**
     * Show calendar
     */
    show: function() {
      domUtil.removeClass(this._element, CLASS_NAME_HIDDEN);
    },

    /**
     * Hide calendar
     */
    hide: function() {
      domUtil.addClass(this._element, CLASS_NAME_HIDDEN);
    },

    /**
     * Draw next page
     * @example
     *
     * calendar.drawNext();
     */
    drawNext: function() {
      this.draw({
        date: this.getNextDate()
      });
    },

    /**
     * Draw previous page
     *
     * @example
     *
     * calendar.drawPrev();
     */
    drawPrev: function() {
      this.draw({
        date: this.getPrevDate()
      });
    },

    /**
     * Returns next date
     * @returns {Date}
     */
    getNextDate: function() {
      if (this.getType() === TYPE_DATE) {
        return this._getRelativeDate(1);
      }

      return this.getNextYearDate();
    },

    /**
     * Returns prev date
     * @returns {Date}
     */
    getPrevDate: function() {
      if (this.getType() === TYPE_DATE) {
        return this._getRelativeDate(-1);
      }

      return this.getPrevYearDate();
    },

    /**
     * Returns next year date
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
     * Returns prev year date
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
     * Change language
     * @param {string} language - Language
     * @see {@link Calendar#localeTexts}
     */
    changeLanguage: function(language) {
      this._header.changeLanguage(language);
      this._body.changeLanguage(language);
      this._render();
    },

    /**
     * Returns rendered date
     * @returns {Date}
     */
    getDate: function() {
      return new Date(this._date);
    },

    /**
     * Returns rendered layer type
     * @returns {('date'|'month'|'year')}
     */
    getType: function() {
      return this._type;
    },

    /**
     * Returns date elements on body
     * @returns {HTMLElement[]}
     */
    getDateElements: function() {
      return this._body.getDateElements();
    },

    /**
     * Add calendar css class
     * @param {string} className - Class name
     */
    addCssClass: function(className) {
      domUtil.addClass(this._element, className);
    },

    /**
     * Remove calendar css class
     * @param {string} className - Class name
     */
    removeCssClass: function(className) {
      domUtil.removeClass(this._element, className);
    },

    /**
     * Destroy calendar
     */
    destroy: function() {
      this._header.destroy();
      this._body.destroy();
      domUtil.removeElement(this._element);

      this._type = this._date = this._container = this._element = this._header = this._body = null;
    }
  }
);

snippet.CustomEvents.mixin(Calendar);
module.exports = Calendar;
