/**
 * @fileoverview Spinbox (in Timepicker)
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 * @dependency jquery-1.8.3, code-snippet-1.0.2
 */

'use strict';

var tmpl = require('./../../template/timepicker/spinbox.hbs');

var util = tui.util;

var SELECTOR_UP_BUTTON = '.tui-timepicker-btn-up';
var SELECTOR_DOWN_BUTTON = '.tui-timepicker-btn-down';

/**
 * @class
 * @ignore
 * @param {jQuery|String|HTMLElement} container - Container of spinbox
 * @param {Object} [option] - Option for initialization
 * @param {number} [option.initialValue] - initial setting value
 * @param {Array.<number>} items - Items
 */
var Spinbox = util.defineClass(/** @lends Spinbox.prototype */ {
    init: function(container, option) {
        option = util.extend({
            items: []
        }, option);

        /**
         * @type {jQuery}
         * @private
         */
        this._$container = $(container);

        /**
         * Spinbox element
         * @type {jQuery}
         * @private
         */
        this._$element = null;

        /**
         * @type {jQuery}
         * @private
         */
        this._$inputElement = null;

        /**
         * Spinbox value items
         * @type {Array.<number>}
         * @private
         */
        this._items = option.items;

        /**
         * @type {number}
         * @private
         */
        this._selectedIndex = Math.max(0, util.inArray(option.initialValue, this._items));

        this._render();
        this._setEvents();
    },

    /**
     * Render spinbox
     * @private
     */
    _render: function() {
        var context = {
            maxLength: this._getMaxLength(),
            initialValue: this.getValue()
        };

        this._$element = $(tmpl(context));
        this._$element.appendTo(this._$container);
        this._$inputElement = this._$element.find('input');
    },

    /**
     * Returns maxlength of value
     * @returns {number}
     * @private
     */
    _getMaxLength: function() {
        var lengths = util.map(this._items, function(item) {
            return String(item).length;
        });

        return Math.max.apply(null, lengths);
    },

    /**
     * Assign default events to up/down button
     * @private
     */
    _setEvents: function() {
        this._$container.on('click.spinbox', SELECTOR_UP_BUTTON, $.proxy(this._setNextValue, this, false))
            .on('click.spinbox', SELECTOR_DOWN_BUTTON, $.proxy(this._setNextValue, this, true))
            .on('keydown.spinbox', 'input', $.proxy(this._onKeyDownInputElement, this))
            .on('change.spinbox', 'input', $.proxy(this._onChangeInput, this));
    },

    /**
     * Set input value when user click a button.
     * @param {boolean} isDown - From down-action?
     * @private
     */
    _setNextValue: function(isDown) {
        var index = this._selectedIndex;

        if (isDown) {
            index = index ? index - 1 : this._items.length - 1;
        } else {
            index = (index < (this._items.length - 1)) ? index + 1 : 0;
        }

        this.setValue(this._items[index]);
    },

    /**
     * DOM(Input element) Keydown Event handler
     * @param {Event} event event-object
     * @private
     */
    _onKeyDownInputElement: function(event) {
        var keyCode = event.which || event.keyCode;
        var isDown;

        switch (keyCode) {
            case 38:
                isDown = false;
                break;
            case 40:
                isDown = true;
                break;
            default: return;
        }

        this._setNextValue(isDown);
    },

    /**
     * DOM(Input element) Change Event handler
     * @private
     */
    _onChangeInput: function() {
        var newValue = Number(this._$inputElement.val());
        var newIndex = util.inArray(newValue, this._items);

        if (newIndex === this._selectedIndex) {
            return;
        }

        if (newIndex === -1) {
            this.setValue(this._items[this._selectedIndex]);
        } else {
            this._selectedIndex = newIndex;
            this.fire('change', {
                value: newValue
            });
        }
    },

    /**
     * Set value to input-box.
     * @param {number} value - Value
     */
    setValue: function(value) {
        this._$inputElement.val(value).change();
    },

    /**
     * Returns current value
     * @returns {number}
     */
    getValue: function() {
        return this._items[this._selectedIndex];
    },

    /**
     * Destory
     */
    destroy: function() {
        this.off();
        this._$container.off('.spinbox');
        this._$element.remove();
        this._$container
            = this._$element
            = this._$inputElement
            = this._items
            = this._selectedIndex
            = null;
    }
});

util.CustomEvents.mixin(Spinbox);
module.exports = Spinbox;
