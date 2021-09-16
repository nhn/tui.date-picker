/**
 * @fileoverview Calendar Header
 * @author NHN. FE dev Lab <dl_javascript@nhn.com>
 */

'use strict';

var defineClass = require('tui-code-snippet/defineClass/defineClass');
var CustomEvents = require('tui-code-snippet/customEvents/customEvents');
var closest = require('tui-code-snippet/domUtil/closest');
var removeElement = require('tui-code-snippet/domUtil/removeElement');

var localeTexts = require('./../localeTexts');
var headerTmpl = require('./../../template/calendar/header');
var DateTimeFormatter = require('../dateTimeFormatter');
var constants = require('../constants');
var util = require('../util');
var mouseTouchEvent = require('../mouseTouchEvent');

var TYPE_DATE = constants.TYPE_DATE;
var TYPE_MONTH = constants.TYPE_MONTH;
var TYPE_YEAR = constants.TYPE_YEAR;

var CLASS_NAME_TITLE_MONTH = 'tui-calendar-title-month';
var CLASS_NAME_TITLE_YEAR = 'tui-calendar-title-year';
var CLASS_NAME_TITLE_YEAR_TO_YEAR = 'tui-calendar-title-year-to-year';

var SELECTOR_INNER_ELEM = '.tui-calendar-header-inner';
var SELECTOR_INFO_ELEM = '.tui-calendar-header-info';
var SELECTOR_BTN = '.tui-calendar-btn';

var YEAR_TITLE_FORMAT = 'yyyy';

/**
 * @ignore
 * @class
 * @param {string|HTMLElement} container - Header container or selector
 * @param {object} option - Header option
 * @param {string} option.language - Header language
 * @param {boolean} option.showToday - Has today box or not.
 * @param {boolean} option.showJumpButtons - Has jump buttons or not.
 */
var Header = defineClass(
  /** @lends Header.prototype */ {
    init: function(container, option) {
      /**
       * Container element
       * @type {HTMLElement}
       * @private
       */
      this._container = util.getElement(container);

      /**
       * Header inner element
       * @type {HTMLElement}
       * @private
       */
      this._innerElement = null;

      /**
       * Header info element
       * @type {HTMLElement}
       * @private
       */
      this._infoElement = null;

      /**
       * Render today box or not
       * @type {boolean}
       * @private
       */
      this._showToday = option.showToday;

      /**
       * Render jump buttons or not (next,prev year on date calendar)
       * @type {boolean}
       * @private
       */
      this._showJumpButtons = option.showJumpButtons;

      /**
       * Year_Month title formatter
       * @type {DateTimeFormatter}
       * @private
       */
      this._yearMonthTitleFormatter = null;

      /**
       * Year title formatter
       * @type {DateTimeFormatter}
       * @private
       */
      this._yearTitleFormatter = null;

      /**
       * Today formatter
       * @type {DateTimeFormatter}
       * @private
       */
      this._todayFormatter = null;

      this._setFormatters(localeTexts[option.language]);
      this._setEvents(option);
    },

    /**
     * @param {object} localeText - Locale text
     * @private
     */
    _setFormatters: function(localeText) {
      this._yearMonthTitleFormatter = new DateTimeFormatter(
        localeText.titleFormat,
        localeText.titles
      );
      this._yearTitleFormatter = new DateTimeFormatter(YEAR_TITLE_FORMAT, localeText.titles);
      this._todayFormatter = new DateTimeFormatter(localeText.todayFormat, localeText.titles);
    },

    /**
     * @param {object} option - Constructor option
     * @private
     */
    _setEvents: function() {
      mouseTouchEvent.on(this._container, 'click', this._onClickHandler, this);
    },

    /**
     * @private
     */
    _removeEvents: function() {
      this.off();
      mouseTouchEvent.off(this._container, 'click', this._onClickHandler);
    },

    /**
     * Fire customEvents
     * @param {Event} ev An event object
     * @private
     */
    _onClickHandler: function(ev) {
      var target = util.getTarget(ev);

      if (closest(target, SELECTOR_BTN)) {
        this.fire('click', ev);
      }
    },

    /**
     * @param {string} type - Calendar type
     * @returns {string}
     * @private
     */
    _getTitleClass: function(type) {
      switch (type) {
        case TYPE_DATE:
          return CLASS_NAME_TITLE_MONTH;
        case TYPE_MONTH:
          return CLASS_NAME_TITLE_YEAR;
        case TYPE_YEAR:
          return CLASS_NAME_TITLE_YEAR_TO_YEAR;
        default:
          return '';
      }
    },

    /**
     * @param {Date} date - date
     * @param {string} type - Calendar type
     * @returns {string}
     * @private
     */
    _getTitleText: function(date, type) {
      var currentYear, start, end;

      switch (type) {
        case TYPE_DATE:
          return this._yearMonthTitleFormatter.format(date);
        case TYPE_MONTH:
          return this._yearTitleFormatter.format(date);
        case TYPE_YEAR:
          currentYear = date.getFullYear();
          start = new Date(currentYear - 4, 0, 1);
          end = new Date(currentYear + 4, 0, 1);

          return (
            this._yearTitleFormatter.format(start) + ' - ' + this._yearTitleFormatter.format(end)
          );
        default:
          return '';
      }
    },

    /**
     * Change langauge
     * @param {string} language - Language
     */
    changeLanguage: function(language) {
      this._setFormatters(localeTexts[language]);
    },

    /**
     * Render header
     * @param {Date} date - date
     * @param {string} type - Calendar type
     */
    render: function(date, type) {
      var context = {
        showToday: this._showToday,
        showJumpButtons: this._showJumpButtons,
        todayText: this._todayFormatter.format(new Date()),
        isDateCalendar: type === TYPE_DATE,
        titleClass: this._getTitleClass(type),
        title: this._getTitleText(date, type)
      };

      this._container.innerHTML = headerTmpl(context).replace(/^\s+|\s+$/g, '');
      this._innerElement = this._container.querySelector(SELECTOR_INNER_ELEM);
      if (context.showToday) {
        this._infoElement = this._container.querySelector(SELECTOR_INFO_ELEM);
      }
    },

    /**
     * Destroy header
     */
    destroy: function() {
      this._removeEvents();
      removeElement(this._innerElement);
      removeElement(this._infoElement);
      this._container = this._showToday = this._showJumpButtons = this._yearMonthTitleFormatter = this._yearTitleFormatter = this._todayFormatter = this._innerElement = this._infoElement = null;
    }
  }
);

CustomEvents.mixin(Header);
module.exports = Header;
