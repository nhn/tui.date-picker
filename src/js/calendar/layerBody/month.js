/**
 * @fileoverview Month layer
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var $ = require('jquery');
var snippet = require('tui-code-snippet');

var bodyTmpl = require('./../../../template/calendar/monthLayer.hbs');
var LayerBase = require('./base');
var TYPE_MONTH = require('../../constants').TYPE_MONTH;

var DATE_SELECTOR = '.tui-calendar-month';

/**
 * @class
 * @extends LayerBase
 * @param {string} language - Initial language
 * @ignore
 */
var MonthLayer = snippet.defineClass(LayerBase, /** @lends MonthLayer.prototype */{
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
            Dec: monthsShort[11]
        };
    },

    /**
     * Render month-layer element
     * @override
     */
    render: function(date) {
        var context = this._makeContext(date);

        this._$element = $(bodyTmpl(context));
    },

    /**
     * Returns month elements
     * @override
     * @returns {jQuery}
     */
    getDateElements: function() {
        return this._$element.find(DATE_SELECTOR);
    }
});

module.exports = MonthLayer;
