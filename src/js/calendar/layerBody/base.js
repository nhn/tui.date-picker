/**
 * @fileoverview Layer base
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');

var localeText = require('../../localeTexts');
var DEFAULT_LANGUAGE_TYPE = require('../../constants').DEFAULT_LANGUAGE_TYPE;

/**
 * @abstract
 * @class
 * @ignore
 * @param {string} language - Initial language
 * Layer base
 */
var LayerBase = snippet.defineClass(/** @lends LayerBase.prototype */{
    init: function(language) {
        language = language || DEFAULT_LANGUAGE_TYPE;

        /**
         * Layer element
         * @type {jQuery}
         * @private
         */
        this._$element = null;

        /**
         * Language type
         * @type {string}
         * @private
         */
        this._localeText = localeText[language];

        /**
         * Layer type
         * @type {string}
         * @private
         */
        this._type = 'base';
    },

    /**
     * Make context
     * @abstract
     * @throws {Error}
     * @returns {object}
     * @private
     */
    _makeContext: function() {
        throwOverrideError(this.getType(), '_makeContext');
    },

    /**
     * Render the layer element
     * @abstract
     * @throws {Error}
     */
    render: function() {
        throwOverrideError(this.getType(), 'render');
    },

    /**
     * Returns date elements
     * @abstract
     * @throws {Error}
     * @returns {jQuery}
     */
    getDateElements: function() {
        throwOverrideError(this.getType(), 'getDateElements');
    },

    /**
     * Returns layer type
     * @returns {string}
     */
    getType: function() {
        return this._type;
    },

    /**
     * Set language
     * @param {string} language - Language name
     */
    changeLanguage: function(language) {
        this._localeText = localeText[language];
    },

    /**
     * Append to parent element
     * @param {string|HTMLElement|jQuery} parent - Parent element
     * @returns {jQuery}
     */
    appendTo: function(parent) {
        return this._$element.appendTo(parent);
    },

    /**
     * Remove elements
     */
    remove: function() {
        if (this._$element) {
            this._$element.remove();
        }
        this._$element = null;
    }
});

/**
 * Throw - method override error
 * @ignore
 * @param {string} layerType - Layer type
 * @param {string} methodName - Method name
 * @throws {Error}
 */
function throwOverrideError(layerType, methodName) {
    throw new Error(layerType + ' layer does not have the "' + methodName + '" method.');
}

module.exports = LayerBase;
