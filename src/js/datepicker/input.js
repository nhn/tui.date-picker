/**
 * @fileoverview DatePicker input(element) component
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */

'use strict';

var defineClass = require('tui-code-snippet/defineClass/defineClass');
var CustomEvents = require('tui-code-snippet/customEvents/customEvents');
var on = require('tui-code-snippet/domEvent/on');
var off = require('tui-code-snippet/domEvent/off');

var DateTimeFormatter = require('../dateTimeFormatter');
var mouseTouchEvent = require('../mouseTouchEvent');
var util = require('../util');

var DEFAULT_FORMAT = 'yyyy-MM-dd';

/**
 * DatePicker Input
 * @ignore
 * @class
 * @param {string|HTMLElement} inputElement - Input element or selector
 * @param {object} option - Option
 * @param {string} option.id - Id
 * @param {string} option.format - Text format
 */
var DatePickerInput = defineClass(
  /** @lends DatePickerInput.prototype */ {
    init: function(inputElement, option) {
      option.format = option.format || DEFAULT_FORMAT;

      /**
       * Input element
       * @type {HTMLElement}
       * @private
       */
      this._input = util.getElement(inputElement);

      /**
       * Id
       * @type {string}
       * @private
       */
      this._id = option.id;

      /**
       * LocaleText titles
       * @type {Object}
       * @private
       */
      this._titles = option.localeText.titles;

      /**
       * Text<->DateTime Formatter
       * @type {DateTimeFormatter}
       * @private
       */
      this._formatter = new DateTimeFormatter(option.format, this._titles);

      this._setEvents();
    },

    /**
     * Change locale titles
     * @param {object} titles - locale text in format
     */
    changeLocaleTitles: function(titles) {
      this._titles = titles;
    },

    /**
     * Set input 'click', 'change' event
     * @private
     */
    _setEvents: function() {
      if (this._input) {
        on(this._input, 'change', this._onChangeHandler, this);
        mouseTouchEvent.on(this._input, 'click', this._onClickHandler, this);
      }
    },

    /**
     * Remove events
     * @private
     */
    _removeEvents: function() {
      this.off();

      if (this._input) {
        off(this._input, 'change', this._onChangeHandler);
        mouseTouchEvent.off(this._input, 'click', this._onClickHandler);
      }
    },

    /**
     * Onchange handler
     */
    _onChangeHandler: function() {
      this.fire('change');
    },

    /**
     * Onclick handler
     */
    _onClickHandler: function() {
      this.fire('click');
    },

    /**
     * Check element is same as the input element.
     * @param {HTMLElement} el - To check matched set of elements
     * @returns {boolean}
     */
    is: function(el) {
      return this._input === el;
    },

    /**
     * Enable input
     */
    enable: function() {
      if (this._input) {
        this._input.removeAttribute('disabled');
      }
    },

    /**
     * Disable input
     */
    disable: function() {
      if (this._input) {
        this._input.setAttribute('disabled', true);
      }
    },

    /**
     * Return format
     * @returns {string}
     */
    getFormat: function() {
      return this._formatter.getRawString();
    },

    /**
     * Set format
     * @param {string} format - Format
     */
    setFormat: function(format) {
      if (!format) {
        return;
      }

      this._formatter = new DateTimeFormatter(format, this._titles);
    },

    /**
     * Clear text
     */
    clearText: function() {
      if (this._input) {
        this._input.value = '';
      }
    },

    /**
     * Set value from date
     * @param {Date} date - Date
     */
    setDate: function(date) {
      if (this._input) {
        this._input.value = this._formatter.format(date);
      }
    },

    /**
     * Returns date from input-text
     * @returns {Date}
     * @throws {Error}
     */
    getDate: function() {
      var value = '';

      if (this._input) {
        value = this._input.value;
      }

      return this._formatter.parse(value);
    },

    /**
     * Destroy
     */
    destroy: function() {
      this._removeEvents();

      this._input = this._id = this._formatter = null;
    }
  }
);

CustomEvents.mixin(DatePickerInput);
module.exports = DatePickerInput;
