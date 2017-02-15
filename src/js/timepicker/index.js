/**
 * @fileoverview Timepicker component
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 * @dependency jquery-1.8.3, code-snippet-1.0.2, spinbox.js
 */

'use strict';

var Spinbox = require('./spinbox');
var Selectbox = require('./selectbox');
var dateUtil = require('./../dateUtil');
var tmpl = require('./../../template/timepicker/index.hbs');

var util = tui.util;

var SELECTOR_MERIDIEM_ELELEMENT = '.tui-timepicker-meridiem';
var SELECTOR_HOUR_ELELEMENT = '.tui-timepicker-hour';
var SELECTOR_MINUTE_ELELEMENT = '.tui-timepicker-minute';

/**
 * Merge default option
 * @ignore
 * @param {object} option - option
 * @returns {object} Merged option
 */
var mergeDefaultOption = function(option) {
    return util.extend({
        initialHour: 0,
        initialMinute: 0,
        showMeridiem: true,
        inputType: 'selectbox'
    }, option);
};

/**
 * @class
 * @param {string|jQuery|HTMLElement} container - Container element
 * @param {Object} [option] - Option for initialization
 * @param {number} [option.initialHour = 0] - Initial setting value of hour
 * @param {number} [option.initialMinute = 0] - Initial setting value of minute
 * @param {string} [option.inputType = 'selectbox'] - 'selectbox' or 'spinbox'
 * @param {boolean} [option.showMeridiem = true] - Show meridiem expression?
 *
 * @tutorial timepickers
 */
var Timepicker = util.defineClass(/** @lends Timepicker.prototype */ {
    init: function(container, option) {
        option = mergeDefaultOption(option);

        /**
         * @type {jQuery}
         * @private
         */
        this._$container = $(container);

        /**
         * @type {jQuery}
         * @private
         */
        this._$element = $();

        /**
         * @type {jQuery}
         * @private
         */
        this._$meridiemElement = $();

        /**
         * @type {jQuery}
         * @private
         */
        this._$amEl = $();

        /**
         * @type {jQuery}
         * @private
         */
        this._$pmEl = $();

        /**
         * @type {boolean}
         * @private
         */
        this._showMeridiem = option.showMeridiem;

        /**
         * @type {Spinbox}
         * @private
         */
        this._hourInput = null;

        /**
         * @type {Spinbox}
         * @private
         */
        this._minuteInput = null;

        /**
         * @type {number}
         * @private
         */
        this._hour = option.initialHour || 0;

        /**
         * @type {number}
         * @private
         */
        this._minute = option.initialMinute || 0;

        /**
         * Timepicker inputType
         * @type {'spinbox'|'selectbox'}
         * @private
         */
        this._inputType = option.inputType;

        this._render();
        this._setEvents();
    },

    /**
     * Set event handlers to selectors, container
     * @private
     */
    _setEvents: function() {
        this._hourInput.on('change', this._onChangeTimeInput, this);
        this._minuteInput.on('change', this._onChangeTimeInput, this);

        if (this._showMeridiem) {
            this._$container.on(
                'change.timepicker',
                SELECTOR_MERIDIEM_ELELEMENT,
                $.proxy(this._onChangeMeridiem, this)
            );
        }
    },

    /**
     * Render element
     * @private
     */
    _render: function() {
        var context = {
            showMeridiem: this._showMeridiem,
            inputType: this._inputType
        };

        this._$element.remove();
        this._$element = $(tmpl(context));
        this._$element.appendTo(this._$container);

        this._renderTimeInputs();

        if (this._showMeridiem) {
            this._$meridiemElement = this._$element.find(SELECTOR_MERIDIEM_ELELEMENT);
            this._$amEl = this._$meridiemElement.find('[value="AM"]');
            this._$pmEl = this._$meridiemElement.find('[value="PM"]');
            this._syncToMeridiemElements();
        }
    },

    /**
     * Render time selectors
     * @private
     */
    _renderTimeInputs: function() {
        var hour = this._hour;
        var showMeridiem = this._showMeridiem;
        var $hourElement = this._$element.find(SELECTOR_HOUR_ELELEMENT);
        var $minuteElement = this._$element.find(SELECTOR_MINUTE_ELELEMENT);
        var BoxComponent = this._inputType.toLowerCase() === 'selectbox' ? Selectbox : Spinbox;

        if (showMeridiem) {
            hour = dateUtil.getMeridiemHour(hour);
        }

        this._hourInput = new BoxComponent($hourElement, {
            initialValue: hour,
            items: showMeridiem ? dateUtil.getRangeArr(1, 12) : dateUtil.getRangeArr(0, 23)
        });

        this._minuteInput = new BoxComponent($minuteElement, {
            initialValue: this._minute,
            items: dateUtil.getRangeArr(0, 59)
        });
    },

    /**
     * Initialize meridiem elements
     * @private
     */
    _syncToMeridiemElements: function() {
        var isPM = this._hour >= 12;

        this._$amEl.attr({
            selected: !isPM,
            checked: !isPM
        });
        this._$pmEl.attr({
            selected: isPM,
            checked: isPM
        });
    },

    /**
     * Set values in spinboxes from time
     * @private
     */
    _syncToInputs: function() {
        var hour = this._hour;
        var minute = this._minute;

        if (this._showMeridiem) {
            hour = dateUtil.getMeridiemHour(hour);
        }

        this._hourInput.setValue(hour);
        this._minuteInput.setValue(minute);
    },

    /**
     * DOM event handler
     * @param {Event} event - Change event on meridiem element
     * @private
     */
    _onChangeMeridiem: function(event) {
        var hour = this._hour;
        var isPM = (event.target.value === 'PM');

        hour = this._to24Hour(isPM, hour);
        this.setTime(hour, this._minute);
    },

    /**
     * Time change event handler
     * @private
     */
    _onChangeTimeInput: function() {
        var hour = this._hourInput.getValue();
        var minute = this._minuteInput.getValue();
        var isPM = this._hour >= 12;

        if (this._showMeridiem) {
            hour = this._to24Hour(isPM, hour);
        }
        this.setTime(hour, minute);
    },

    /**
     * 12Hour-expression to 24Hour-expression
     * @param {boolean} isPM - Is pm?
     * @param {number} hour - Hour
     * @returns {number}
     * @private
     */
    _to24Hour: function(isPM, hour) {
        hour %= 12;
        if (isPM) {
            hour += 12;
        }

        return hour;
    },

    /**
     * Show time picker element
     */
    show: function() {
        this._$element.show();
    },

    /**
     * Hide time picker element
     */
    hide: function() {
        this._$element.hide();
    },

    /**
     * Set hour
     * @param {number} hour for time picker - (0~23)
     * @returns {boolean} result of set time
     */
    setHour: function(hour) {
        return this.setTime(hour, this._minute);
    },

    /**
     * Set minute
     * @param {number} minute for time picker
     * @returns {boolean} result of set time
     */
    setMinute: function(minute) {
        return this.setTime(this._hour, minute);
    },

    /**
     * Set time
     * @param {number} hour for time picker - (0~23)
     * @param {number} minute for time picker
     */
    setTime: function(hour, minute) {
        var isNumber = util.isNumber(hour) && util.isNumber(minute);
        if (!isNumber || (hour > 23) || (minute > 59)) {
            return;
        }

        this._hour = hour;
        this._minute = minute;

        this._syncToInputs();
        this._syncToMeridiemElements();
        /**
         * Change event - Timepicker
         * @event Timepicker#change
         */
        this.fire('change', {
            hour: this._hour,
            minute: this._minute
        });
    },

    /**
     * Get hour
     * @returns {number} hour - (0~23)
     */
    getHour: function() {
        return this._hour;
    },

    /**
     * Get minute
     * @returns {number} minute
     */
    getMinute: function() {
        return this._minute;
    },

    /**
     * Destroy
     */
    destroy: function() {
        this.off();
        this._hourInput.destroy();
        this._minuteInput.destroy();
        this._$container.off('.timepicker');
        this._$element.remove();

        this._$container
            = this._showMeridiem
            = this._hourInput
            = this._minuteInput
            = this._hour
            = this._minute
            = this._inputType
            = this._$element
            = this._$meridiemElement
            = this._$amEl
            = this._$pmEl
            = null;
    }
});

util.CustomEvents.mixin(Timepicker);
module.exports = Timepicker;
