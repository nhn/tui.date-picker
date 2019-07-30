/**
 * @fileoverview Date layer
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */

'use strict';

var snippet = require('tui-code-snippet');

var bodyTmpl = require('./../../../template/calendar/dateLayer.hbs');
var LayerBase = require('./base');
var TYPE_DATE = require('../../constants').TYPE_DATE;

var DATE_SELECTOR = '.tui-calendar-date';

/**
 * @ignore
 * @class
 * @extends LayerBase
 * @param {string} language - Initial language
 */
var DateLayer = snippet.defineClass(LayerBase, /** @lends DateLayer.prototype */{
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
            month: month
        };
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
     * Retunrs date elements
     * @override
     * @returns {NodeList}
     */
    getDateElements: function() {
        return this._element.querySelectorAll(DATE_SELECTOR);
    }
});

module.exports = DateLayer;
