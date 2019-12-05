/**
 * @fileoverview Month layer
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */

'use strict';

var defineClass = require('tui-code-snippet/defineClass/defineClass');

var bodyTmpl = require('./../../../template/calendar/monthLayer');
var LayerBase = require('./base');
var TYPE_MONTH = require('../../constants').TYPE_MONTH;
var dateUtil = require('../../dateUtil');

var DATE_SELECTOR = '.tui-calendar-month';

/**
 * @class
 * @extends LayerBase
 * @param {string} language - Initial language
 * @ignore
 */
var MonthLayer = defineClass(
  LayerBase,
  /** @lends MonthLayer.prototype */ {
    init: function(language) {
      LayerBase.call(this, language);
    },

    /**
     * Layer type
     * @type {string}
     * @private
     */
    _type: TYPE_MONTH,

    /**
     * @override
     * @returns {object} Template context
     * @private
     */
    _makeContext: function(date) {
      var monthsShort = this._localeText.titles.MMM;

      return {
        year: date.getFullYear(),
        Jan: monthsShort[0],
        Feb: monthsShort[1],
        Mar: monthsShort[2],
        Apr: monthsShort[3],
        May: monthsShort[4],
        Jun: monthsShort[5],
        Jul: monthsShort[6],
        Aug: monthsShort[7],
        Sep: monthsShort[8],
        Oct: monthsShort[9],
        Nov: monthsShort[10],
        Dec: monthsShort[11],
        getFirstDayTimestamp: dateUtil.getFirstDayTimestamp
      };
    },

    /**
     * Render month-layer element
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
     * Returns month elements
     * @override
     * @returns {HTMLElement[]}
     */
    getDateElements: function() {
      return this._element.querySelectorAll(DATE_SELECTOR);
    }
  }
);

module.exports = MonthLayer;
