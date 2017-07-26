/**
 * @fileoverview DatePicker input(element) component
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var $ = require('jquery');
var snippet = require('tui-code-snippet');

var DateTimeFormatter = require('../dateTimeFormatter');
var setTouchClickEvent = require('../setTouchClickEvent');

var DEFAULT_FORMAT = 'yyyy-MM-dd';

/**
 * DatePicker Input
 * @ignore
 * @class
 * @param {string|jQuery|HTMLElement} inputElement - Input element
 * @param {object} option - Option
 * @param {string} option.id - Id
 * @param {string} option.format - Text format
 */
var DatePickerInput = snippet.defineClass(/** @lends DatePickerInput.prototype */{
    init: function(inputElement, option) {
        option.format = option.format || DEFAULT_FORMAT;

        /**
         * Input element
         * @type {jQuery}
         * @private
         */
        this._$input = $(inputElement);

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
     * Set input 'click', 'change' event
     * @private
     */
    _setEvents: function() {
        this._$input.on('change.' + this._id, $.proxy(this.fire, this, 'change'));

        setTouchClickEvent(this._$input, $.proxy(this.fire, this, 'click'), {
            namespace: this._id
        });
    },

    /**
     * @see {@link http://api.jquery.com/is/}
     * @param {string|jQuery|HTMLElement|function} el - To check matched set of elements
     * @returns {boolean}
     */
    is: function(el) {
        return this._$input.is(el);
    },

    /**
     * Enable input
     */
    enable: function() {
        this._$input.removeAttr('disabled');
    },

    /**
     * Disable input
     */
    disable: function() {
        this._$input.attr('disabled', true);
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
        this._$input.val('');
    },

    /**
     * Set value from date
     * @param {Date} date - Date
     */
    setDate: function(date) {
        this._$input.val(this._formatter.format(date));
    },

    /**
     * Returns date from input-text
     * @returns {Date}
     * @throws {Error}
     */
    getDate: function() {
        var value = this._$input.val();

        return this._formatter.parse(value);
    },

    /**
     * Destroy
     */
    destroy: function() {
        var evNamespace = '.' + this._id;

        this.off();
        this._$input.off(evNamespace);

        this._$input
            = this._id
            = this._formatter
            = null;
    }
});

snippet.CustomEvents.mixin(DatePickerInput);
module.exports = DatePickerInput;
