/**
 * @fileoverview Calendar body
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var $ = require('jquery');
var snippet = require('tui-code-snippet');

var DateLayer = require('./layerBody/date');
var MonthLayer = require('./layerBody/month');
var YearLayer = require('./layerBody/year');
var constants = require('../constants');

var TYPE_DATE = constants.TYPE_DATE;
var TYPE_MONTH = constants.TYPE_MONTH;
var TYPE_YEAR = constants.TYPE_YEAR;

/**
 * @ignore
 * @class
 */
var Body = snippet.defineClass(/** @lends Body.prototype */{
    init: function(bodyContainer, option) {
        var language = option.language;

        /**
         * Body container element
         * @type {jQuery}
         * @private
         */
        this._$container = $(bodyContainer);

        /**
         * DateLayer
         * @type {DateLayer}
         * @private
         */
        this._dateLayer = new DateLayer(language);

        /**
         * MonthLayer
         * @type {MonthLayer}
         * @private
         */
        this._monthLayer = new MonthLayer(language);

        /**
         * YearLayer
         * @type {YearLayer}
         * @private
         */
        this._yearLayer = new YearLayer(language);

        /**
         * Current Layer
         * @type {DateLayer|MonthLayer|YearLayer}
         * @private
         */
        this._currentLayer = this._dateLayer;
    },

    /**
     * Returns matched layer
     * @param {string} type - Layer type
     * @returns {Base} - Layer
     * @private
     */
    _getLayer: function(type) {
        switch (type) {
            case TYPE_DATE:
                return this._dateLayer;
            case TYPE_MONTH:
                return this._monthLayer;
            case TYPE_YEAR:
                return this._yearLayer;
            default:
                return this._currentLayer;
        }
    },

    /**
     * Iterate each layer
     * @param {Function} fn - function
     * @private
     */
    _eachLayer: function(fn) {
        snippet.forEach([this._dateLayer, this._monthLayer, this._yearLayer], fn);
    },

    /**
     * Change language
     * @param {string} language - Language
     */
    changeLanguage: function(language) {
        this._eachLayer(function(layer) {
            layer.changeLanguage(language);
        });
    },

    /**
     * Render body
     * @param {Date} date - date
     * @param {string} type - Layer type
     */
    render: function(date, type) {
        var nextLayer = this._getLayer(type);
        var prevLayer = this._currentLayer;

        prevLayer.remove();
        nextLayer.render(date);
        nextLayer.appendTo(this._$container);

        this._currentLayer = nextLayer;
    },

    /**
     * Returns date jQuery elements
     * @returns {jQuery}
     */
    getDateElements: function() {
        return this._currentLayer.getDateElements();
    },

    /**
     * Destory
     */
    destroy: function() {
        this._eachLayer(function(layer) {
            layer.remove();
        });

        this._$container = this._currentLayer = this._dateLayer = this._monthLayer = this._yearLayer = null;
    }
});

module.exports = Body;
