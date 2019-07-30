/**
 * @fileoverview Year layer
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */

'use strict';

var snippet = require('tui-code-snippet');

var bodyTmpl = require('../../../template/calendar/yearLayer.hbs');
var LayerBase = require('./base');
var TYPE_YEAR = require('../../constants').TYPE_YEAR;
var dateUtil = require('../../dateUtil');

var DATE_SELECTOR = '.tui-calendar-year';

/**
 * @class
 * @extends LayerBase
 * @param {string} language - Initial language
 * @ignore
 */
var YearLayer = snippet.defineClass(LayerBase, /** @lends YearLayer.prototype */{
    init: function(language) {
        LayerBase.call(this, language);
    },

    /**
     * Layer type
     * @type {string}
     * @private
     */
    _type: TYPE_YEAR,

    /**
     * @override
     * @returns {object} Template context
     * @private
     */
    _makeContext: function(date) {
        var year = date.getFullYear();

        return {
            yearGroups: [
                dateUtil.getRangeArr(year - 4, year - 2),
                dateUtil.getRangeArr(year - 1, year + 1),
                dateUtil.getRangeArr(year + 2, year + 4)
            ]
        };
    },

    /**
     * Render year-layer element
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
     * Returns year elements
     * @override
     * @returns {NodeList}
     */
    getDateElements: function() {
        return this._element.querySelectorAll(DATE_SELECTOR);
    }
});

module.exports = YearLayer;
