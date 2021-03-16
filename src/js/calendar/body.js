/**
 * @fileoverview Calendar body
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */

'use strict';

var forEachArray = require('tui-code-snippet/collection/forEachArray');
var defineClass = require('tui-code-snippet/defineClass/defineClass');

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
var Body = defineClass(
  /** @lends Body.prototype */ {
    init: function(bodyContainer, options) {
      var language = options.language;
      var weekStartDay = options.weekStartDay;

      /**
       * Body container element
       * @type {HTMLElement}
       * @private
       */
      this._container = bodyContainer;

      /**
       * DateLayer
       * @type {DateLayer}
       * @private
       */
      this._dateLayer = new DateLayer(language, weekStartDay);

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
      forEachArray([this._dateLayer, this._monthLayer, this._yearLayer], fn);
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
      nextLayer.render(date, this._container);

      this._currentLayer = nextLayer;
    },

    /**
     * Returns date elements
     * @returns {HTMLElement[]}
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

      this._container = this._currentLayer = this._dateLayer = this._monthLayer = this._yearLayer = null;
    }
  }
);

module.exports = Body;
