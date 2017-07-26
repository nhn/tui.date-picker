/**
 * @fileoverview Year layer
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var $ = require('jquery');
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
     * Render month-layer element
     * @override
     */
    render: function(date) {
        var context = this._makeContext(date);

        this._$element = $(bodyTmpl(context));
    },

    /**
     * Returns year elements
     * @override
     * @returns {jQuery}
     */
    getDateElements: function() {
        return this._$element.find(DATE_SELECTOR);
    }
});

module.exports = YearLayer;
