/**
 * @fileoverview TimePicker Component
 * @author NHN ent FE dev <dl_javascript@nhnent.com> <minkyu.yi@nhnent.com>
 * @dependency jquery-1.8.3, code-snippet-1.0.2, spinbox.js
 */

'use strict';

var Spinbox = require('./spinbox');
var utils = require('./utils');

var util = tui.util;
var timeRegExp = /\s*(\d{1,2})\s*:\s*(\d{1,2})\s*([ap][m])?(?:[\s\S]*)/i;
var timePickerTag = '<table class="timepicker"><tr class="timepicker-row"></tr></table>';
var columnTag = '<td class="timepicker-column"></td>';
var spinBoxTag = '<td class="timepicker-column timepicker-spinbox">' +
                '<div><input type="text" class="timepicker-spinbox-input"></div></td>';
var upBtnTag = '<button type="button" class="timepicker-btn timepicker-btn-up"><b>+</b></button>';
var downBtnTag = '<button type="button" class="timepicker-btn timepicker-btn-down"><b>-</b></button>';
var meridiemTag = '<select><option value="AM">AM</option><option value="PM">PM</option></select>';

/**
 * @constructor
 * @param {Object} [option] - option for initialization
 *
 * @param {number} [option.defaultHour = 0] - initial setting value of hour
 * @param {number} [option.defaultMinute = 0] - initial setting value of minute
 * @param {HTMLElement} [option.inputElement = null] - optional input element with timepicker
 * @param {number} [option.hourStep = 1] - step of hour spinbox. if step = 2, hour value 1 -> 3 -> 5 -> ...
 * @param {number} [option.minuteStep = 1] - step of minute spinbox. if step = 2, minute value 1 -> 3 -> 5 -> ...
 * @param {Array} [option.hourExclusion = null] - hour value to be excluded.
 *                                                if hour [1,3] is excluded, hour value 0 -> 2 -> 4 -> 5 -> ...
 * @param {Array} [option.minuteExclusion = null] - minute value to be excluded.
 *                                                  if minute [1,3] is excluded, minute value 0 -> 2 -> 4 -> 5 -> ...
 * @param {boolean} [option.showMeridian = false] - is time expression-"hh:mm AM/PM"?
 * @param {Object} [option.position = {}] - left, top position of timepicker element
 */
var TimePicker = util.defineClass(/** @lends TimePicker.prototype */ {
    init: function(option) {
        /**
         * @type {jQuery}
         */
        this.$timePickerElement = null;

        /**
         * @type {jQuery}
         * @private
         */
        this._$inputElement = null;

        /**
         * @type {jQuery}
         * @private
         */
        this._$meridianElement = null;

        /**
         * @type {Spinbox}
         * @private
         */
        this._hourSpinbox = null;

        /**
         * @type {Spinbox}
         * @private
         */
        this._minuteSpinbox = null;

        /**
         * time picker element show up?
         * @type {boolean}
         * @private
         */
        this._isShown = false;

        /**
         * @type {Object}
         * @private
         */
        this._option = null;

        /**
         * @type {number}
         * @private
         */
        this._hour = null;

        /**
         * @type {number}
         * @private
         */
        this._minute = null;

        this._initialize(option);
    },

    /**
     * Initialize with option
     * @param {Object} option for time picker
     * @private
     */
    _initialize: function(option) {
        this._setOption(option);
        this._makeSpinboxes();
        this._makeTimePickerElement();
        this._assignDefaultEvents();
        this._setTime(this._option.defaultHour, this._option.defaultMinute, false);
    },

    /**
     * Set option
     * @param {Object} option for time picker
     * @private
     */
    _setOption: function(option) {
        this._option = {
            defaultHour: 0,
            defaultMinute: 0,
            inputElement: null,
            hourStep: 1,
            minuteStep: 1,
            hourExclusion: null,
            minuteExclusion: null,
            showMeridian: false,
            position: {}
        };

        util.extend(this._option, option);
    },

    /**
     * make spinboxes (hour & minute)
     * @private
     */
    _makeSpinboxes: function() {
        var opt = this._option;
        var defaultHour = opt.defaultHour;

        if (opt.showMeridian) {
            defaultHour = utils.getMeridiemHour(defaultHour);
        }

        this._hourSpinbox = new Spinbox(spinBoxTag, {
            defaultValue: defaultHour,
            min: (opt.showMeridian) ? 1 : 0,
            max: (opt.showMeridian) ? 12 : 23,
            step: opt.hourStep,
            upBtnTag: upBtnTag,
            downBtnTag: downBtnTag,
            exclusion: opt.hourExclusion
        });

        this._minuteSpinbox = new Spinbox(spinBoxTag, {
            defaultValue: opt.defaultMinute,
            min: 0,
            max: 59,
            step: opt.minuteStep,
            upBtnTag: upBtnTag,
            downBtnTag: downBtnTag,
            exclusion: opt.minuteExclusion
        });
    },

    /**
     * make timepicker container
     * @private
     */
    _makeTimePickerElement: function() {
        var opt = this._option;
        var $tp = $(timePickerTag);
        var $tpRow = $tp.find('.timepicker-row');
        var $colon = $(columnTag).addClass('colon').append(':');
        var $meridian;

        $tpRow.append(this._hourSpinbox.getContainerElement(), $colon, this._minuteSpinbox.getContainerElement());

        if (opt.showMeridian) {
            $meridian = $(columnTag)
                .addClass('meridian')
                .append(meridiemTag);
            this._$meridianElement = $meridian.find('select').eq(0);
            $tpRow.append($meridian);
        }

        $tp.hide();
        $('body').append($tp);
        this.$timePickerElement = $tp;

        if (opt.inputElement) {
            $tp.css('position', 'absolute');
            this._$inputElement = $(opt.inputElement);
            this._setDefaultPosition(this._$inputElement);
        }
    },

    /**
     * set position of timepicker container
     * @param {jQuery} $input jquery-object (element)
     * @private
     */
    _setDefaultPosition: function($input) {
        var inputEl = $input[0];
        var position = this._option.position;
        var x = position.x;
        var y = position.y;

        if (!util.isNumber(x) || !util.isNumber(y)) {
            x = inputEl.offsetLeft;
            y = inputEl.offsetTop + inputEl.offsetHeight + 3;
        }
        this.setXYPosition(x, y);
    },

    /**
     * assign default events
     * @private
     */
    _assignDefaultEvents: function() {
        var $input = this._$inputElement;

        if ($input) {
            this._assignEventsToInputElement();
            this.on('change', function() {
                $input.val(this.getTime());
            }, this);
        }

        this._hourSpinbox.on('change', util.bind(this._onChangeSpinbox, this));
        this._minuteSpinbox.on('change', util.bind(this._onChangeSpinbox, this));

        this.$timePickerElement.on('change', 'select', util.bind(this._onChangeMeridiem, this));
    },

    /**
     * attach event to Input element
     * @private
     */
    _assignEventsToInputElement: function() {
        var self = this;
        var $input = this._$inputElement;

        $input.on('click', function(event) {
            self.open(event);
        });

        $input.on('change', function() {
            if (!self.setTimeFromInputElement()) {
                $input.val(self.getTime());
            }
        });
    },

    /**
     * Custom event handler
     * @param {string} type - Change type on spinbox (type: up, down, defualt)
     * @private
     */
    _onChangeSpinbox: function(type) {
        var hour = this._hourSpinbox.getValue();
        var minute = this._minuteSpinbox.getValue();

        if (this._option.showMeridian) {
            if ((type === 'up' && hour === 12) ||
                (type === 'down' && hour === 11)) {
                this._isPM = !this._isPM;
            }
            hour = this._getOriginalHour(hour);
        }

        this._setTime(hour, minute, false);
    },

    /**
     * DOM event handler
     * @param {Event} event - Change event on meridiem element
     * @private
     */
    _onChangeMeridiem: function(event) {
        var isPM = (event.target.value === 'PM');
        var currentHour = this._hour;
        var hour = isPM ? (currentHour + 12) : (currentHour % 12);

        this._setTime(hour, this._minuteSpinbox.getValue(), false);
    },

    /**
     * is clicked inside of container?
     * @param {Event} event event-object
     * @returns {boolean} result
     * @private
     */
    _isClickedInside: function(event) {
        var isContains = $.contains(this.$timePickerElement[0], event.target);
        var isInputElement = (this._$inputElement &&
                            this._$inputElement[0] === event.target);

        return isContains || isInputElement;
    },

    /**
     * transform time into formatted string
     * @returns {string} time string
     * @private
     */
    _formToTimeFormat: function() {
        var hour = this._hour;
        var minute = this._minute;
        var postfix = this._getPostfix();
        var formattedHour, formattedMinute;

        if (this._option.showMeridian) {
            hour = utils.getMeridiemHour(hour);
        }

        formattedHour = (hour < 10) ? '0' + hour : hour;
        formattedMinute = (minute < 10) ? '0' + minute : minute;

        return formattedHour + ':' + formattedMinute + postfix;
    },

    /**
     * set the boolean value 'isPM' when AM/PM option is true.
     * @private
     */
    _setIsPM: function() {
        this._isPM = (this._hour > 11);
    },

    /**
     * get postfix when AM/PM option is true.
     * @returns {string} postfix (AM/PM)
     * @private
     */
    _getPostfix: function() {
        var postfix = '';

        if (this._option.showMeridian) {
            postfix = (this._isPM) ? ' PM' : ' AM';
        }

        return postfix;
    },

    /**
     * set position of container
     * @param {number} x - it will be offsetLeft of element
     * @param {number} y - it will be offsetTop of element
     */
    setXYPosition: function(x, y) {
        var position;

        if (!util.isNumber(x) || !util.isNumber(y)) {
            return;
        }

        position = this._option.position;
        position.x = x;
        position.y = y;
        this.$timePickerElement.css({left: x, top: y});
    },

    /**
     * show time picker element
     */
    show: function() {
        this.$timePickerElement.show();
        this._isShown = true;
    },

    /**
     * hide time picker element
     */
    hide: function() {
        this.$timePickerElement.hide();
        this._isShown = false;
    },

    /**
     * listener to show container
     * @param {Event} event event-object
     */
    open: function(event) {
        if (this._isShown) {
            return;
        }

        $(document).on('click', util.bind(this.close, this));
        this.show();

        /**
         * Open event - TimePicker
         * @event TimePicker#open
         * @param {(jQuery.Event|undefined)} - Click the input element
         */
        this.fire('open', event);
    },

    /**
     * listener to hide container
     * @param {Event} event event-object
     */
    close: function(event) {
        if (!this._isShown || this._isClickedInside(event)) {
            return;
        }

        $(document).off(event);
        this.hide();

        /**
         * Hide event - Timepicker
         * @event TimePicker#close
         * @param {(jQuery.Event|undefined)} - Click the document (not TimePicker)
         */
        this.fire('close', event);
    },

    /**
     * set values in spinboxes from time
     */
    toSpinboxes: function() {
        var hour = this._hour;
        var minute = this._minute;

        if (this._option.showMeridian) {
            hour = utils.getMeridiemHour(hour);
        }

        this._hourSpinbox.setValue(hour);
        this._minuteSpinbox.setValue(minute);
    },

    /**
     * Get original hour from meridiem hour
     * @param {hour} hour - Meridiem hour
     * @returns {number} Original hour
     */
    _getOriginalHour: function(hour) {
        var isPM = this._isPM;

        if (isPM) {
            hour = (hour < 12) ? (hour + 12) : 12;
        } else {
            hour = (hour < 12) ? (hour % 12) : 0;
        }

        return hour;
    },

    /**
     * set time from input element.
     * @param {HTMLElement|jQuery} [inputElement] jquery object (element)
     * @returns {boolean} result of set time
     */
    setTimeFromInputElement: function(inputElement) {
        var input = $(inputElement)[0] || this._$inputElement[0];

        return !!(input && this.setTimeFromString(input.value));
    },

    /**
     * set hour
     * @param {number} hour for time picker
     * @returns {boolean} result of set time
     */
    setHour: function(hour) {
        return this._setTime(hour, this._minute, true);
    },

    /**
     * set minute
     * @param {number} minute for time picker
     * @returns {boolean} result of set time
     */
    setMinute: function(minute) {
        return this._setTime(this._hour, minute, true);
    },

    /**
     * set time for extenal call
     * @api
     * @param {number} hour for time picker
     * @param {number} minute for time picker
     * @returns {boolean} result of set time
     */
    setTime: function(hour, minute) {
        return this._setTime(hour, minute);
    },

    /**
     * set time
     * @param {number} hour for time picker
     * @param {number} minute for time picker
     * @param {boolean} isSetSpinbox Whether spinbox set or not
     * @returns {boolean} result of set time
     * @private
     */
    _setTime: function(hour, minute, isSetSpinbox) {
        var isNumber = (util.isNumber(hour) && util.isNumber(minute));
        var isValid = (hour < 24 && minute < 60);
        var postfix;

        if (!isNumber || !isValid) {
            return false;
        }

        this._hour = hour;
        this._minute = minute;

        this._setIsPM();

        if (isSetSpinbox) {
            this.toSpinboxes();
        }

        if (this._$meridianElement) {
            postfix = this._getPostfix().replace(/\s+/, '');
            this._$meridianElement.val(postfix);
        }

        /**
         * Change event - TimePicker
         * @event TimePicker#change
         */
        this.fire('change', isSetSpinbox);

        return true;
    },

    /**
     * set time from time-string
     * @param {string} timeString time-string
     * @returns {boolean} result of set time
     */
    setTimeFromString: function(timeString) {
        var hour, minute, postfix, isPM;

        if (timeRegExp.test(timeString)) {
            hour = Number(RegExp.$1);
            minute = Number(RegExp.$2);
            postfix = RegExp.$3.toUpperCase();

            if (hour < 24 && this._option.showMeridian) {
                if (postfix === 'PM') {
                    isPM = true;
                } else if (postfix === 'AM') {
                    isPM = (hour > 12);
                } else {
                    isPM = this._isPM;
                }

                if (isPM && hour < 12) {
                    hour += 12;
                } else if (!isPM && hour === 12) {
                    hour = 0;
                }
            }
        }

        return this._setTime(hour, minute, true);
    },

    /**
     * set step of hour
     * @param {number} step for time picker
     */
    setHourStep: function(step) {
        this._hourSpinbox.setStep(step);
        this._option.hourStep = this._hourSpinbox.getStep();
    },

    /**
     * set step of minute
     * @param {number} step for time picker
     */
    setMinuteStep: function(step) {
        this._minuteSpinbox.setStep(step);
        this._option.minuteStep = this._minuteSpinbox.getStep();
    },

    /**
     * add a specific hour to exclude
     * @param {number} hour for exclusion
     */
    addHourExclusion: function(hour) {
        this._hourSpinbox.addExclusion(hour);
    },

    /**
     * add a specific minute to exclude
     * @param {number} minute for exclusion
     */
    addMinuteExclusion: function(minute) {
        this._minuteSpinbox.addExclusion(minute);
    },

    /**
     * get step of hour
     * @returns {number} hour up/down step
     */
    getHourStep: function() {
        return this._option.hourStep;
    },

    /**
     * get step of minute
     * @returns {number} minute up/down step
     */
    getMinuteStep: function() {
        return this._option.minuteStep;
    },

    /**
     * remove hour from exclusion list
     * @param {number} hour that you want to remove
     */
    removeHourExclusion: function(hour) {
        this._hourSpinbox.removeExclusion(hour);
    },

    /**
     * remove minute from exclusion list
     * @param {number} minute that you want to remove
     */
    removeMinuteExclusion: function(minute) {
        this._minuteSpinbox.removeExclusion(minute);
    },

    /**
     * get hour
     * @returns {number} hour
     */
    getHour: function() {
        return this._hour;
    },

    /**
     * get minute
     * @returns {number} minute
     */
    getMinute: function() {
        return this._minute;
    },

    /**
     * get time
     * @api
     * @returns {string} 'hh:mm (AM/PM)'
     */
    getTime: function() {
        return this._formToTimeFormat();
    }
});
tui.util.CustomEvents.mixin(TimePicker);

module.exports = TimePicker;
