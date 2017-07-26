/**
 * @fileoverview Calendar Header
 * @author NHN Ent. FE dev Lab <dl_javascript@nhnent.com>
 */

'use strict';

var $ = require('jquery');
var snippet = require('tui-code-snippet');

var localeTexts = require('./../localeTexts');
var headerTmpl = require('./../../template/calendar/header.hbs');
var DateTimeFormatter = require('../dateTimeFormatter');
var constants = require('../constants');

var TYPE_DATE = constants.TYPE_DATE;
var TYPE_MONTH = constants.TYPE_MONTH;
var TYPE_YEAR = constants.TYPE_YEAR;

var CLASS_NAME_PREV_MONTH_BTN = constants.CLASS_NAME_PREV_MONTH_BTN;
var CLASS_NAME_PREV_YEAR_BTN = constants.CLASS_NAME_PREV_YEAR_BTN;
var CLASS_NAME_NEXT_YEAR_BTN = constants.CLASS_NAME_NEXT_YEAR_BTN;
var CLASS_NAME_NEXT_MONTH_BTN = constants.CLASS_NAME_NEXT_MONTH_BTN;

var CLASS_NAME_TITLE_MONTH = 'tui-calendar-title-month';
var CLASS_NAME_TITLE_YEAR = 'tui-calendar-title-year';
var CLASS_NAME_TITLE_YEAR_TO_YEAR = 'tui-calendar-title-year-to-year';

var YEAR_TITLE_FORMAT = 'yyyy';

/**
 * @ignore
 * @class
 * @param {string|Element|jQuery} container - Header container
 * @param {object} option - Header option
 * @param {string} option.language - Header language
 * @param {boolean} option.showToday - Has today box or not.
 * @param {boolean} option.showJumpButtons - Has jump buttons or not.
 */
var Header = snippet.defineClass(/** @lends Header.prototype */{
    init: function(container, option) {
        /**
         * Container element
         * @type {jQuery}
         * @private
         */
        this._$container = $(container);

        /**
         * headerElement
         * @type {jQuery}
         * @private
         */
        this._$element = $();

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
     * Set formatters
     * @param {object} localeText - Locale text
     * @private
     */
    _setFormatters: function(localeText) {
        this._yearMonthTitleFormatter = new DateTimeFormatter(localeText.titleFormat, localeText.titles);
        this._yearTitleFormatter = new DateTimeFormatter(YEAR_TITLE_FORMAT, localeText.titles);
        this._todayFormatter = new DateTimeFormatter(localeText.todayFormat, localeText.titles);
    },

    /**
     * Set events for firing customEvents
     * @param {object} option - Constructor option
     * @private
     */
    _setEvents: function() {
        var self = this;
        var classNames = [
            CLASS_NAME_PREV_MONTH_BTN,
            CLASS_NAME_PREV_YEAR_BTN,
            CLASS_NAME_NEXT_MONTH_BTN,
            CLASS_NAME_NEXT_YEAR_BTN
        ];

        snippet.forEach(classNames, function(className) {
            self._$container.on('touchend.calendar click.calendar', '.' + className, function(ev) {
                self.fire('click', ev);
                ev.preventDefault(); // To prevent click after touchend
            });
        });
    },

    /**
     * Returns title class
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
     * Returns title text
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

                return this._yearTitleFormatter.format(start) + ' - ' + this._yearTitleFormatter.format(end);
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

        this._$element.remove();
        this._$element = $(headerTmpl(context));
        this._$element.appendTo(this._$container);
    },

    /**
     * Destroy header
     */
    destroy: function() {
        this.off();
        this._$container.off('.calendar');
        this._$element.remove();
        this._$container
            = this._showToday
            = this._showJumpButtons
            = this._yearMonthTitleFormatter
            = this._yearTitleFormatter
            = this._todayFormatter
            = this._$element
            = null;
    }
});

snippet.CustomEvents.mixin(Header);
module.exports = Header;
