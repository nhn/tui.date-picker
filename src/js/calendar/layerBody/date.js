/**
 * @fileoverview Date layer
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */

'use strict';

var defineClass = require('tui-code-snippet/defineClass/defineClass');

var dateUtil = require('../../dateUtil');
var bodyTmpl = require('./../../../template/calendar/dateLayer');
var LayerBase = require('./base');
var TYPE_DATE = require('../../constants').TYPE_DATE;

var DATE_SELECTOR = '.tui-calendar-date';

/**
 * @ignore
 * @class
 * @extends LayerBase
 * @param {string} language - Initial language
 */
var DateLayer = defineClass(
  LayerBase,
  /** @lends DateLayer.prototype */ {
    init: function(language) {
      LayerBase.call(this, language);
    },

    /**
     * Layer type
     * @type {string}
     * @private
     */
    _type: TYPE_DATE,

    /**
     * @override
     * @private
     * @returns {object} Template context
     */
    _makeContext: function(date) {
      var daysShort = this._localeText.titles.D;
      var year, month;

      date = date || new Date();
      year = date.getFullYear();
      month = date.getMonth() + 1;

      return {
        Sun: daysShort[0],
        Mon: daysShort[1],
        Tue: daysShort[2],
        Wed: daysShort[3],
        Thu: daysShort[4],
        Fri: daysShort[5],
        Sat: daysShort[6],
        year: year,
        month: month,
        weeks: this._getWeeks(year, month)
      };
    },

    /**
     * weeks (templating) for date-calendar
     * @param {number} year - Year
     * @param {number} month - Month
     * @returns {Array.<Array.<Date>>}
     * @private
     */
    _getWeeks: function(year, month) {
      var weekNumber = 0;
      var weeksCount = 6; // Fix for no changing height
      var weeks = [];
      var dates, i;

      for (; weekNumber < weeksCount; weekNumber += 1) {
        dates = [];
        for (i = 0; i < 7; i += 1) {
          dates.push(dateUtil.getDateOfWeek(year, month, weekNumber, i));
        }
        weeks.push(this._getWeek(year, month, dates));
      }

      return weeks;
    },

    /**
     * week (templating) for date-calendar
     * @param {number} currentYear 
     * @param {number} currentMonth 
     * @param {Array.<Date>} dates
     * @private
     */
    _getWeek: function(currentYear, currentMonth, dates) {
      var firstDateOfCurrentMonth = new Date(currentYear, currentMonth - 1, 1);
      var lastDateOfCurrentMonth = new Date(currentYear, currentMonth, 0);
      var contexts = [];
      var i = 0;
      var length = dates.length;
      var date, className;

      for (; i < length; i += 1) {
        className = 'tui-calendar-date';
        date = dates[i];

        if (date < firstDateOfCurrentMonth) {
          className += ' tui-calendar-prev-month';
        }

        if (date > lastDateOfCurrentMonth) {
          className += ' tui-calendar-next-month';
        }

        if (date.getDay() === 0) {
          className += ' tui-calendar-sun';
        } else if (date.getDay() === 6) {
          className += ' tui-calendar-sat';
        }

        contexts.push({
          dayInMonth: date.getDate(),
          className: className,
          timestamp: date.getTime()
        });
      }

      return contexts;
    },

    /**
     * Render date-layer
     * @override
     * @param {Date} date Date to render
     * @param {HTMLElement} container A container element for the rendered element
     */
    render: function(date, container) {
      var context = this._makeContext(date);

      container.innerHTML = bodyTmpl(context);
      this._element = container.firstChild;
    },

    /**
     * Return date elements
     * @override
     * @returns {HTMLElement[]}
     */
    getDateElements: function() {
      return this._element.querySelectorAll(DATE_SELECTOR);
    }
  }
);

module.exports = DateLayer;
