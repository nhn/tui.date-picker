/**
 * @fileoverview Selectbox (in Timepicker)
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var tmpl = require('./../../template/timepicker/selectbox.hbs');
var util = tui.util;

/**
 * @class
 * @ignore
 * @param {jQuery|string|Element} container - Container element
 * @param {object} option - Option
 * @param {Array.<number>} option.items - Items
 * @param {number} option.initialValue - Initial value
 */
var Selectbox = util.defineClass(/** @lends Selectbox.prototype */ {
    init: function(container, option) {
        option = util.extend({
            items: []
        }, option);

        /**
         * Container element
         * @type {jQuery}
         * @private
         */
        this._$container = $(container);

        /**
         * Selectbox items
         * @type {Array.<number>}
         * @private
         */
        this._items = option.items || [];

        /**
         * Selected index
         * @type {number}
         * @private
         */
        this._selectedIndex = Math.max(0, util.inArray(option.initialValue, this._items));

        /**
         * Element
         * @type {jQuery}
         * @private
         */
        this._$element = $();

        this._render();
        this._setEvents();
    },

    /**
     * Render selectbox
     * @private
     */
    _render: function() {
        var context = {
            items: this._items,
            initialValue: this.getValue()
        };

        this._$element.remove();
        this._$element = $(tmpl(context));
        this._$element.appendTo(this._$container);
    },

    /**
     * Set events
     * @private
     */
    _setEvents: function() {
        this._$container.on('change.selectbox', 'select', $.proxy(this._onChange, this));
    },

    /**
     * Change event handler
     * @param {jQuery.Event} ev - Event object
     * @private
     */
    _onChange: function(ev) {
        var newValue = Number(ev.target.value);

        this._selectedIndex = util.inArray(newValue, this._items);
        this.fire('change', {
            value: newValue
        });
    },

    /**
     * Returns current value
     * @returns {number}
     */
    getValue: function() {
        return this._items[this._selectedIndex];
    },

    /**
     * Set value
     * @param {number} value - New value
     */
    setValue: function(value) {
        var newIndex = util.inArray(value, this._items);

        if (newIndex > -1 && newIndex !== this._selectedIndex) {
            this._selectedIndex = newIndex;
            this._$element.val(value).change();
        }
    },

    /**
     * Destory
     */
    destroy: function() {
        this.off();
        this._$container.off('.selectbox');
        this._$element.remove();

        this._$container
            = this._items
            = this._selectedIndex
            = this._$element
            = this._$element
            = null;
    }
});

util.CustomEvents.mixin(Selectbox);
module.exports = Selectbox;
