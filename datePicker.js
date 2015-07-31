/* !component-date-picker v1.1.1 | NHN Entertainment */

(function() {
/**
 * Created by nhnent on 15. 4. 28..
 * @fileoverview Spinbox Component
 * @author NHN ent FE dev <dl_javascript@nhnent.com> <minkyu.yi@nhnent.com>
 * @dependency jquery-1.8.3, code-snippet-1.0.2
 */

'use strict';

var util = ne.util,
    inArray = util.inArray;

util.defineNamespace('ne.component');

/**
 * @namespace ne.component.Spinbox
 * @constructor
 *
 * @param {String|HTMLElement} container - container of spinbox
 * @param {Object} [option] - option for initialization
 *
 * @param {number} [option.defaultValue = 0] - initial setting value
 * @param {number} [option.step = 1] - if step = 2, value : 0 -> 2 -> 4 -> ...
 * @param {number} [option.max = 9007199254740991] - max value
 * @param {number} [option.min = -9007199254740991] - min value
 * @param {string} [option.upBtnTag = button HTML] - up button html string
 * @param {string} [option.downBtnTag = button HTML] - down button html string
 * @param {Array}  [option.exclusion = []] - value to be excluded. if this is [1,3], 0 -> 2 -> 4 -> 5 ->....
 */
ne.component.Spinbox = util.defineClass(/** @lends ne.component.Spinbox.prototype */ {
    init: function(container, option) {
        /**
         * @type {jQuery}
         * @private
         */
        this._$containerElement = $(container);

        /**
         * @type {jQuery}
         * @private
         */
        this._$inputElement = this._$containerElement.find('input[type="text"]');

        /**
         * @type {number}
         * @private
         */
        this._value = null;

        /**
         * @type {Object}
         * @private
         */
        this._option = null;

        /**
         * @type {jQuery}
         * @private
         */
        this._$upButton = null;

        /**
         * @type {jQuery}
         * @private
         */
        this._$downButton = null;

        this._initialize(option);
    },

    /**
     * Initialize with option
     * @param {Object} option - Option for Initialization
     * @private
     */
    _initialize: function(option) {
        this._setOption(option);
        this._assignHTMLElements();
        this._assignDefaultEvents();
        this.setValue(this._option.defaultValue);
    },

    /**
     * Set a option to instance
     * @param {Object} option - Option that you want
     * @private
     */
    _setOption: function(option) {
        this._option = {
            defaultValue: 0,
            step: 1,
            max: Number.MAX_SAFE_INTEGER || 9007199254740991,
            min: Number.MIN_SAFE_INTEGER || -9007199254740991,
            upBtnTag: '<button type="button"><b>+</b></button>',
            downBtnTag: '<button type="button"><b>-</b></button>'
        };
        util.extend(this._option, option);

        if (!util.isArray(this._option.exclusion)) {
            this._option.exclusion = [];
        }

        if (!this._isValidOption()) {
            throw new Error('Spinbox option is invaild');
        }
    },

    /**
     * is a valid option?
     * @returns {boolean} result
     * @private
     */
    _isValidOption: function() {
        var opt = this._option;

        return (this._isValidValue(opt.defaultValue) && this._isValidStep(opt.step));
    },

    /**
     * is a valid value?
     * @param {number} value for spinbox
     * @returns {boolean} result
     * @private
     */
    _isValidValue: function(value) {
        var opt,
            isBetween,
            isNotInArray;

        if (!util.isNumber(value)) {
            return false;
        }

        opt = this._option;
        isBetween = value <= opt.max && value >= opt.min;
        isNotInArray = (inArray(value, opt.exclusion) === -1);

        return (isBetween && isNotInArray);
    },

    /**
     * is a valid step?
     * @param {number} step for spinbox up/down
     * @returns {boolean} result
     * @private
     */
    _isValidStep: function(step) {
        var maxStep = (this._option.max - this._option.min);

        return (util.isNumber(step) && step < maxStep);
    },

    /**
     * Assign elements to inside of container.
     * @private
     */
    _assignHTMLElements: function() {
        this._setInputSizeAndMaxLength();
        this._makeButton();
    },

    /**
     * Make up/down button
     * @private
     */
    _makeButton: function() {
        var $input = this._$inputElement,
            $upBtn = this._$upButton = $(this._option.upBtnTag),
            $downBtn = this._$downButton = $(this._option.downBtnTag);

        $upBtn.insertBefore($input);
        $upBtn.wrap('<div></div>');
        $downBtn.insertAfter($input);
        $downBtn.wrap('<div></div>');
    },

    /**
     * Set size/maxlength attributes of input element.
     * Default value is a digits of a longer value of option.min or option.max
     * @private
     */
    _setInputSizeAndMaxLength: function() {
        var $input = this._$inputElement,
            minValueLength = String(this._option.min).length,
            maxValueLength = String(this._option.max).length,
            maxlength = Math.max(minValueLength, maxValueLength);

        if (!$input.attr('size')) {
            $input.attr('size', maxlength);
        }
        if (!$input.attr('maxlength')) {
            $input.attr('maxlength', maxlength);
        }
    },

    /**
     * Assign default events to up/down button
     * @private
     */
    _assignDefaultEvents: function() {
        var onClick = util.bind(this._onClickButton, this),
            onKeyDown = util.bind(this._onKeyDownInputElement, this);

        this._$upButton.on('click', {isDown: false}, onClick);
        this._$downButton.on('click', {isDown: true}, onClick);
        this._$inputElement.on('keydown', onKeyDown);
        this._$inputElement.on('change', util.bind(this._onChangeInput, this));
    },

    /**
     * Set input value when user click a button.
     * @param {boolean} isDown - If a user clicked a down-buttton, this value is true.  Else if a user clicked a up-button, this value is false.
     * @private
     */
    _setNextValue: function(isDown) {
        var opt = this._option,
            step = opt.step,
            min = opt.min,
            max = opt.max,
            exclusion = opt.exclusion,
            nextValue = this.getValue();

        if (isDown) {
            step = -step;
        }

        do {
            nextValue += step;
            if (nextValue > max) {
                nextValue = min;
            } else if (nextValue < min) {
                nextValue = max;
            }
        } while (inArray(nextValue, exclusion) > -1);

        this.setValue(nextValue);
    },

    /**
     * DOM(Up/Down button) Click Event handler
     * @param {Event} event event-object
     * @private
     */
    _onClickButton: function(event) {
        this._setNextValue(event.data.isDown);
    },

    /**
     * DOM(Input element) Keydown Event handler
     * @param {Event} event event-object
     * @private
     */
    _onKeyDownInputElement: function(event) {
        var keyCode = event.which || event.keyCode,
            isDown;
        switch (keyCode) {
            case 38: isDown = false; break;
            case 40: isDown = true; break;
            default: return;
        }

        this._setNextValue(isDown);
    },

    /**
     * DOM(Input element) Change Event handler
     * @private
     */
    _onChangeInput: function() {
        var newValue = Number(this._$inputElement.val()),
            isChange = this._isValidValue(newValue) && this._value !== newValue,
            nextValue = (isChange) ? newValue : this._value;

        this._value = nextValue;
        this._$inputElement.val(nextValue);
    },

    /**
     * set step of spinbox
     * @param {number} step for spinbox
     */
    setStep: function(step) {
        if (!this._isValidStep(step)) {
            return;
        }
        this._option.step = step;
    },

    /**
     * get step of spinbox
     * @returns {number} step
     */
    getStep: function() {
        return this._option.step;
    },

    /**
     * Return a input value.
     * @returns {number} Data in input-box
     */
    getValue: function() {
        return this._value;
    },

    /**
     * Set a value to input-box.
     * @param {number} value - Value that you want
     */
    setValue: function(value) {
        this._$inputElement.val(value).change();
    },

    /**
     * Return a option of instance.
     * @returns {Object} Option of instance
     */
    getOption: function() {
        return this._option;
    },

    /**
     * Add value that will be excluded.
     * @param {number} value - Value that will be excluded.
     */
    addExclusion: function(value) {
        var exclusion = this._option.exclusion;

        if (inArray(value, exclusion) > -1) {
            return;
        }
        exclusion.push(value);
    },

    /**
     * Remove a value which was excluded.
     * @param {number} value - Value that will be removed from a exclusion list of instance
     */
    removeExclusion: function(value) {
        var exclusion = this._option.exclusion,
            index = inArray(value, exclusion);

        if (index === -1) {
            return;
        }
        exclusion.splice(index, 1);
    },

    /**
     * get container element
     * @return {HTMLElement} element
     */
    getContainerElement: function() {
        return this._$containerElement[0];
    }
});

})();


(function() {
/**
 * Created by nhnent on 15. 4. 30..
 * @fileoverview TimePicker Component
 * @author NHN ent FE dev <dl_javascript@nhnent.com> <minkyu.yi@nhnent.com>
 * @dependency jquery-1.8.3, code-snippet-1.0.2, spinbox.js
 */

'use strict';

var util = ne.util,
    Spinbox = ne.component.Spinbox,
    timeRegExp = /\s*(\d{1,2})\s*:\s*(\d{1,2})\s*([ap][m])?(?:[\s\S]*)/i,
    timePickerTag = '<table class="timepicker"><tr class="timepicker-row"></tr></table>',
    columnTag = '<td class="timepicker-column"></td>',
    spinBoxTag = '<td class="timepicker-column timepicker-spinbox"><div><input type="text" class="timepicker-spinbox-input"></div></td>',
    upBtnTag = '<button type="button" class="timepicker-btn timepicker-btn-up"><b>+</b></button>',
    downBtnTag = '<button type="button" class="timepicker-btn timepicker-btn-down"><b>-</b></button>';

util.defineNamespace('ne.component');

/**
 * @namespace ne.component.TimePicker
 * @constructor
 *
 * @param {Object} [option] - option for initialization
 *
 * @param {number} [option.defaultHour = 0] - initial setting value of hour
 * @param {number} [option.defaultMinute = 0] - initial setting value of minute
 * @param {HTMLElement} [option.inputElement = null] - optional input element with timepicker
 * @param {number} [option.hourStep = 1] - step of hour spinbox. if step = 2, hour value 1 -> 3 -> 5 -> ...
 * @param {number} [option.minuteStep = 1] - step of minute spinbox. if step = 2, minute value 1 -> 3 -> 5 -> ...
 * @param {Array} [option.hourExclusion = null] - hour value to be excluded. if hour [1,3] is excluded, hour value 0 -> 2 -> 4 -> 5 -> ...
 * @param {Array} [option.minuteExclusion = null] - minute value to be excluded. if minute [1,3] is excluded, minute value 0 -> 2 -> 4 -> 5 -> ...
 * @param {boolean} [option.showMeridian = false] - is time expression-"hh:mm AM/PM"?
 * @param {Object} [option.position = {}] - left, top position of timepicker element
 */
ne.component.TimePicker = util.defineClass(/** @lends ne.component.TimePicker.prototype */ {
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
        this.fromSpinboxes();
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

        this._hourSpinbox = new Spinbox(spinBoxTag, {
            defaultValue: opt.defaultHour,
            min: 0,
            max: 23,
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
        var opt = this._option,
            $tp = $(timePickerTag),
            $tpRow = $tp.find('.timepicker-row'),
            $meridian,
            $colon = $(columnTag)
                .addClass('colon')
                .append(':');


        $tpRow.append(this._hourSpinbox.getContainerElement(), $colon, this._minuteSpinbox.getContainerElement());

        if (opt.showMeridian) {
            $meridian = $(columnTag)
                .addClass('meridian')
                .append(this._isPM ? 'PM' : 'AM');
            this._$meridianElement = $meridian;
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
        var inputEl = $input[0],
            position = this._option.position,
            x = position.x,
            y = position.y;

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
        this.$timePickerElement.on('change', util.bind(this._onChangeTimePicker, this));
    },

    /**
     * attach event to Input element
     * @private
     */
    _assignEventsToInputElement: function() {
        var self = this,
            $input = this._$inputElement;

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
     * dom event handler (timepicker)
     * @private
     */
    _onChangeTimePicker: function() {
        this.fromSpinboxes();
    },

    /**
     * is clicked inside of container?
     * @param {Event} event event-object
     * @returns {boolean} result
     * @private
     */
    _isClickedInside: function(event) {
        var isContains = $.contains(this.$timePickerElement[0], event.target),
            isInputElement = (this._$inputElement && this._$inputElement[0] === event.target);

        return isContains || isInputElement;
    },

    /**
     * transform time into formatted string
     * @returns {string} time string
     * @private
     */
    _formToTimeFormat: function() {
        var hour = this._hour,
            minute = this._minute,
            postfix = this._getPostfix(),
            formattedHour,
            formattedMinute;

        if (this._option.showMeridian) {
            hour %= 12;
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
        this.fire('close', event);
    },

    /**
     * set values in spinboxes from time
     */
    toSpinboxes: function() {
        var hour = this._hour,
            minute = this._minute;

        this._hourSpinbox.setValue(hour);
        this._minuteSpinbox.setValue(minute);
    },

    /**
     * set time from spinboxes values
     */
    fromSpinboxes: function() {
        var hour = this._hourSpinbox.getValue(),
            minute = this._minuteSpinbox.getValue();

        this.setTime(hour, minute);
    },

    /**
     * set time from input element.
     * @param {HTMLElement|jQuery} [inputElement] jquery object (element)
     * @return {boolean} result of set time
     */
    setTimeFromInputElement: function(inputElement) {
        var input = $(inputElement)[0] || this._$inputElement[0];
        return !!(input && this.setTimeFromString(input.value));
    },

    /**
     * set hour
     * @param {number} hour for time picker
     * @return {boolean} result of set time
     */
    setHour: function(hour) {
        return this.setTime(hour, this._minute);
    },

    /**
     * set minute
     * @param {number} minute for time picker
     * @return {boolean} result of set time
     */
    setMinute: function(minute) {
        return this.setTime(this._hour, minute);
    },

    /**
     * set time
     * @param {number} hour for time picker
     * @param {number} minute for time picker
     * @return {boolean} result of set time
     */
    setTime: function(hour, minute) {
        var isNumber = (util.isNumber(hour) && util.isNumber(minute)),
            isChange = (this._hour !== hour || this._minute !== minute),
            isValid = (hour < 24 && minute < 60);

        if (!isNumber || !isChange || !isValid) {
            return false;
        }

        this._hour = hour;
        this._minute = minute;
        this._setIsPM();
        this.toSpinboxes();
        if (this._$meridianElement) {
            this._$meridianElement.html(this._getPostfix());
        }
        this.fire('change');
        return true;
    },

    /**
     * set time from time-string
     * @param {string} timeString time-string
     * @return {boolean} result of set time
     */
    setTimeFromString: function(timeString) {
        var hour,
            minute,
            postfix,
            isPM;

        if (timeRegExp.test(timeString)) {
            hour = Number(RegExp.$1);
            minute = Number(RegExp.$2);
            postfix = RegExp.$3.toUpperCase();

            if (hour < 24 && this._option.showMeridian) {
                if (postfix === 'PM') {
                    isPM = true;
                } else if (postfix === 'AM') {
                    isPM = false;
                } else {
                    isPM = this._isPM;
                }

                if (isPM) {
                    hour += 12;
                }
            }
        }
        return this.setTime(hour, minute);
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
     * @returns {string} 'hh:mm (AM/PM)'
     */
    getTime: function() {
        return this._formToTimeFormat();
    }
});
ne.util.CustomEvents.mixin(ne.component.TimePicker);



})();


(function() {
/**
 * Created by nhnent on 15. 5. 14..
 * @fileoverview This component provides a calendar for picking a date & time.
 * @author NHN ent FE dev <dl_javascript@nhnent.com> <minkyu.yi@nhnent.com>
 * @dependency jquery-1.8.3, code-snippet-1.0.2, component-calendar-1.0.1, timePicker.js
 */

'use strict';

var calendarUtil = ne.component.Calendar.Util,
    util = ne.util,
    inArray = util.inArray,
    formatRegExp = /yyyy|yy|mm|m|dd|d/gi,
    mapForConverting = {
        yyyy: {expression: '(\\d{4}|\\d{2})', type: 'year'},
        yy: {expression: '(\\d{4}|\\d{2})', type: 'year'},
        y: {expression: '(\\d{4}|\\d{2})', type: 'year'},
        mm: {expression: '(1[012]|0[1-9]|[1-9]\\b)', type: 'month'},
        m: {expression: '(1[012]|0[1-9]|[1-9]\\b)', type: 'month'},
        dd: {expression: '([12]\\d{1}|3[01]|0[1-9]|[1-9]\\b)', type: 'date'},
        d: {expression: '([12]\\d{1}|3[01]|0[1-9]|[1-9]\\b)', type: 'date'}
    },
    CONSTANTS = {
        minYear: 1970,
        maxYear: 2999,
        monthDays: [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        wrapperTag: '<div style="position:absolute;"></div>',
        defaultCentury: '20',
        selectableClassName: 'selectable',
        selectedClassName: 'selected'
    };

/**
 * Create DatePicker<br>
 * You can get a date from 'getYear', 'getMonth', 'getDayInMonth', 'getDateObject'
 * @namespace ne.component.DatePicker
 * @constructor
 * @param {Object} option - options for DatePicker
 *      @param {HTMLElement|string} option.element - input element(or selector) of DatePicker
 *      @param {Object} [option.date = today] - initial date object
 *          @param {number} [option.date.year] - year
 *          @param {number} [option.date.month] - month
 *          @param {number} [option.date.date] - day in month
 *      @param {string} [option.dateForm = 'yyyy-mm-dd'] - format of date string
 *      @param {string} [option.defaultCentury = 20] - if year-format is yy, this value is prepended automatically.
 *      @param {string} [option.selectableClassName = 'selectable'] - for selectable date elements
 *      @param {string} [option.selectedClassName = 'selected'] - for selected date element
 *      @param {Object} [option.startDate] - start date in calendar
 *          @param {number} [option.startDate.year] - year
 *          @param {number} [option.startDate.month] - month
 *          @param {number} [option.startDate.date] - day in month
 *      @param {Object} [option.endDate] - last date in calendar
 *          @param {number} [option.endDate.year] - year
 *          @param {number} [option.endDate.month] - month
 *          @param {number} [option.endDate.date] - day in month
 *      @param {Object} [option.pos] - calendar position style vlaue
 *          @param {number} [option.pos.left] - position left of calendar
 *          @param {number} [option.pos.top] - position top of calendar
 *          @param {number} [option.pos.zIndex] - z-index of calendar
 *      @param {Object} [option.openers = [element]] - opener button list (example - icon, button, etc.)
 *      @param {ne.component.TimePicker} [option.timePicker] - TimePicker instance
 * @param {ne.component.Calendar} calendar - Calendar instance
 * @example
 *   var calendar = new ne.component.Calendar({
 *       element: '#layer',
 *       titleFormat: 'yyyy년 m월',
 *       todayFormat: 'yyyy년 mm월 dd일 (D)'
 *   });
 *
 *   var timePicker = new ne.component.TimePicker({
 *       showMeridian: true,
 *       defaultHour: 13,
 *       defaultMinute: 24
 *   });
 *
 *   var picker1 = new ne.component.DatePicker({
 *       element: '#picker',
 *       dateForm: 'yyyy년 mm월 dd일 - ',
 *       date: {year: 2015, month: 1, date: 1 },
 *       startDate: {year:2012, month:1, date:17},
 *       endDate: {year: 2070, month:12, date:31},
 *       openers: ['#opener'],
 *       timePicker: timePicker
 *   }, calendar);
 *
 *   // Close calendar when select a date
 *   $('#layer').on('click', function(event) {
 *       var $el = $(event.target);
 *
 *       if ($el.hasClass('selectable')) {
 *           picker1.close();
 *       }
 *   });
 */
ne.component.DatePicker = ne.util.defineClass(/** @lends ne.component.DatePicker.prototype */{
    init: function(option, calendar) {
        /**
         * Calendar instance
         * @type {Calendar}
         * @private
         */
        this._calendar = calendar;

        /**
         * Element for displaying a date value
         * @type {HTMLElement}
         * @private
         */
        this._$element = $(option.element);

        /**
         * Element wrapping calendar
         * @type {HTMLElement}
         * @private
         */
        this._$wrapperElement = null;

        /**
         * Format of date string
         * @type {string}
         * @private
         */
        this._dateForm = option.dateForm || 'yyyy-mm-dd ';

        /**
         * RegExp instance for format of date string
         * @type {RegExp}
         * @private
         */
        this._regExp = null;

        /**
         * Array saving a order of format
         * @type {Array}
         * @private
         * @see {ne.component.DatePicker.prototype.setDateForm}
         * @example
         *  // If the format is a 'mm-dd, yyyy'
         *  // `this._formOrder` is ['month', 'date', 'year']
         */
        this._formOrder = [];

        /**
         * Object having date values
         * @type {{year: number, month: number, date: number}}
         * @private
         */
        this._date = null;

        /**
         * This value is prepended automatically when year-format is 'yy'
         * @type {string}
         * @private
         * @example
         *  //
         *  // If this vlaue is '20', the format is 'yy-mm-dd' and the date string is '15-04-12',
         *  // the date value object is
         *  //  {
         *  //      year: 2015,
         *  //      month: 4,
         *  //      date: 12
         *  //  }
         */
        this._defaultCentury = option.defaultCentury || CONSTANTS.defaultCentury;

        /**
         * Class name for selectable date elements
         * @type {string}
         * @private
         */
        this._selectableClassName = option.selectableClassName || CONSTANTS.selectableClassName;

        /**
         * Class name for selected date element
         * @type {string}
         * @private
         */
        this._selectedClassName = option.selectedClassName || CONSTANTS.selectedClassName;

        /**
         * Start date that can be selected
         * It is number of date (=timestamp)
         * @type {number}
         * @private
         */
        this._startEdge = option.startDate;

        /**
         * End date that can be selected
         * It is number of date (=timestamp)
         * @type {number}
         * @private
         */
        this._endEdge = option.endDate;

        /**
         * TimePicker instance
         * @type {TimePicker}
         * @private
         * @since 1.1.0
         */
        this._timePicker = null;

        /**
         * position - left & top & zIndex
         * @type {Object}
         * @private
         * @since 1.1.1
         */
        this._pos = null;

        /**
         * openers - opener list
         * @type {Array}
         * @private
         * @since 1.1.1
         */
        this._openers = [];

        /**
         * Handlers binding context
         * @type {Object}
         * @private
         */
        this._proxyHandlers = {};

        this._initializeDatePicker(option);
    },

    /**
     * Initialize method
     * @param {Object} option - user option
     * @private
     */
    _initializeDatePicker: function(option) {
        this._setWrapperElement();
        this._setDefaultDate(option.date);
        this._setDefaultPosition(option.pos);
        this._restrictDate(option.startDate, option.endDate);
        this._setProxyHandlers();
        this._bindOpenerEvent(option.openers);
        this._setTimePicker(option.timePicker);
        this.setDateForm();
        this._$wrapperElement.hide();
    },

    /**
     * Set wrapper element(= container)
     * @private
     */
    _setWrapperElement: function() {
        this._$wrapperElement = $(CONSTANTS.wrapperTag)
            .insertAfter(this._$element)
            .append(this._calendar.$element);
    },

    /**
     * Set default date
     * @param {{year: number, month: number, date: number}|Date} opDate [option.date] - user setting: date
     * @private
     */
    _setDefaultDate: function(opDate) {
        if (!opDate) {
            this._date = calendarUtil.getDateHashTable();
        } else {
            this._date = {
                year: util.isNumber(opDate.year) ? opDate.year : CONSTANTS.minYear,
                month: util.isNumber(opDate.month) ? opDate.month : 1,
                date: util.isNumber(opDate.date) ? opDate.date : 1
            };
        }
    },

    /**
     * Save default style-position of calendar
     * @param {Object} opPos [option.pos] - user setting: position(left, top, zIndex)
     * @private
     */
    _setDefaultPosition: function(opPos) {
        var pos = this._pos = opPos || {},
            bound = this._getBoundingClientRect();

        pos.left = pos.left || bound.left;
        pos.top = pos.top || bound.bottom;
        pos.zIndex = pos.zIndex || 9999;
    },

    /**
     * Restrict date
     * @param {{year: number, month: number, date: number}} opStartDate [option.startDate] - start date in calendar
     * @param {{year: number, month: number, date: number}} opEndDate [option.endDate] - end date in calendar
     * @private
     */
    _restrictDate: function(opStartDate, opEndDate) {
        var startDate = opStartDate || {year: CONSTANTS.minYear, month: 1, date: 1},
            endDate = opEndDate || {year: CONSTANTS.maxYear, month: 12, date: 31};

        this._startEdge = calendarUtil.getTime(startDate) - 1;
        this._endEdge = calendarUtil.getTime(endDate) + 1;
    },

    /**
     * Store opener element list
     * @param {Array} opOpeners [option.openers] - opener element list
     * @private
     */
    _setOpeners: function(opOpeners) {
        this.addOpener(this._$element);
        util.forEach(opOpeners, function(opener) {
            this.addOpener(opener);
        }, this);
    },

    /**
     * Set TimePicker instance
     * @param {ne.component.TimePicker} [opTimePicker] - TimePicker instance
     * @private
     */
    _setTimePicker: function(opTimePicker) {
        if (!opTimePicker) {
            return;
        }

        this._timePicker = opTimePicker;
        this._bindCustomEventWithTimePicker();
    },

    /**
     * Bind custom event with TimePicker
     * @private
     */
    _bindCustomEventWithTimePicker: function() {
        var onChangeTimePicker = util.bind(this.setDate, this);

        this.on('open', function() {
            this._timePicker.setTimeFromInputElement(this._$element);
            this._timePicker.on('change', onChangeTimePicker);
        });
        this.on('close', function() {
            this._timePicker.off('change', onChangeTimePicker);
        });
    },

    /**
     * Check validation of a year
     * @param {number} year - year
     * @returns {boolean} - whether the year is valid or not
     * @private
     */
    _isValidYear: function(year) {
        return util.isNumber(year) && year > CONSTANTS.minYear && year < CONSTANTS.maxYear;
    },

    /**
     * Check validation of a month
     * @param {number} month - month
     * @returns {boolean} - whether the month is valid or not
     * @private
     */
    _isValidMonth: function(month) {
        return util.isNumber(month) && month > 0 && month < 13;
    },

    /**
     * Check validation of values in a date object having year, month, day-in-month
     * @param {{year: number, month: number, date: number}} datehash - date object
     * @returns {boolean} - whether the date object is valid or not
     * @private
     */
    _isValidDate: function(datehash) {
        var year = datehash.year,
            month = datehash.month,
            date = datehash.date,
            isLeapYear = (year % 4 === 0) && (year % 100 !== 0) || (year % 400 === 0),
            lastDayInMonth,
            isBetween;

        if (!this._isValidYear(year) || !this._isValidMonth(month)) {
            return false;
        }

        lastDayInMonth = CONSTANTS.monthDays[month];
        if (isLeapYear && month === 2) {
                lastDayInMonth = 29;
        }
        isBetween = !!(util.isNumber(date) && (date > 0) && (date <= lastDayInMonth));

        return isBetween;
    },

    /**
     * Check an element is an opener.
     * @param {HTMLElement} target element
     * @returns {boolean} - opener true/false
     * @private
     */
    _isOpener: function(target) {
        var result = false;

        util.forEach(this._openers, function(opener) {
            if (target === opener || $.contains(opener, target)) {
                result = true;
                return false;
            }
        });
        return result;
    },

    /**
     * Set style-position of calendar
     * @private
     */
    _arrangeLayer: function() {
        var style = this._$wrapperElement[0].style,
            pos = this._pos;

        style.left = pos.left + 'px';
        style.top = pos.top + 'px';
        style.zIndex = pos.zIndex;
        this._$wrapperElement.append(this._calendar.$element);
        if (this._timePicker) {
            this._$wrapperElement.append(this._timePicker.$timePickerElement);
            this._timePicker.show();
        }
    },

    /**
     * Get boundingClientRect of an element
     * @param {HTMLElement|jQuery} [element] - element
     * @returns {Object} - an object having left, top, bottom, right of element
     * @private
     */
    _getBoundingClientRect: function(element) {
        var el = $(element)[0] || this._$element[0],
            bound,
            ceil;

        bound = el.getBoundingClientRect();
        ceil = Math.ceil;
        return {
            left: ceil(bound.left),
            top: ceil(bound.top),
            bottom: ceil(bound.bottom),
            right: ceil(bound.right)
        };
    },

    /**
     * Set date from string
     * @param {string} str - date string
     * @private
     */
    _setDateFromString: function(str) {
        var date = this._extractDate(str);

        if (date && !this._isRestricted(date)) {
            if (this._timePicker) {
                this._timePicker.setTimeFromInputElement(this._$element);
            }
            this.setDate(date.year, date.month, date.date);
        } else {
            this.setDate();
        }
    },

    /**
     * Return formed date-string from date object
     * @return {string} - formed date-string
     * @private
     */
    _formed: function() {
        var year = this._date.year,
            month = this._date.month,
            date = this._date.date,
            form = this._dateForm,
            replaceMap,
            dateString;

        month = month < 10 ? ('0' + month) : month;
        date = date < 10 ? ('0' + date) : date;

        replaceMap = {
            yyyy: year,
            yy: String(year).substr(2, 2),
            mm: month,
            m: Number(month),
            dd: date,
            d: Number(date)
        };

        dateString = form.replace(formatRegExp, function(key) {
            return replaceMap[key.toLowerCase()] || '';
        });

        return dateString;
    },

    /**
     * Extract date-object from input string with comparing date-format<br>
     * If can not extract, return false
     * @param {String} str - input string(text)
     * @returns {{year: number, month: number, date: number}|false} - extracted date object or false
     * @private
     */
    _extractDate: function(str) {
        var formOrder = this._formOrder,
            resultDate = {},
            regExp = this._regExp;

        regExp.lastIndex = 0;
        if (regExp.test(str)) {
            resultDate[formOrder[0]] = Number(RegExp.$1);
            resultDate[formOrder[1]] = Number(RegExp.$2);
            resultDate[formOrder[2]] = Number(RegExp.$3);
        } else {
            return false;
        }

        if (String(resultDate.year).length === 2) {
            resultDate.year = Number(this._defaultCentury + resultDate.year);
        }

        return resultDate;
    },

    /**
     * Check a date-object is restricted or not
     * @param {{year: number, month: number, date: number}} datehash - date object
     * @returns {boolean} - whether the date-object is restricted or not
     * @private
     */
    _isRestricted: function(datehash) {
        var start = this._startEdge,
            end = this._endEdge,
            date = calendarUtil.getTime(datehash);

        return !this._isValidDate(datehash) || (date < start || date > end);
    },

    /**
     * Set selectable-class-name to selectable date element.
     * @param {HTMLElement|jQuery} element - date element
     * @param {{year: number, month: number, date: number}} dateHash - date object
     * @private
     */
    _setSelectableClassName: function(element, dateHash) {
        if (!this._isRestricted(dateHash)) {
            $(element).addClass(this._selectableClassName);
        }
    },

    /**
     * Set selected-class-name to selected date element
     * @param {HTMLElement|jQuery} element - date element
     * @param {{year: number, month: number, date: number}} dateHash - date object
     * @private
     */
    _setSelectedClassName: function(element, dateHash) {
        var year = this._date.year,
            month = this._date.month,
            date = this._date.date,
            isSelected = (year === dateHash.year) && (month === dateHash.month) && (date === dateHash.date);

        if (isSelected) {
            $(element).addClass(this._selectedClassName);
        }
    },

    /**
     * Set value a date-string of current this instance to input element
     * @private
     */
    _setValueToInputElement: function() {
        var dateString = this._formed(),
            timeString = '';

        if (this._timePicker) {
            timeString = this._timePicker.getTime();
        }
        this._$element.val(dateString + timeString);
    },

    /**
     * Set(or make) RegExp instance from the date-format of this instance.
     * @private
     */
    _setRegExp: function() {
        var regExpStr = '^',
            index = 0,
            formOrder = this._formOrder;

        this._dateForm.replace(formatRegExp, function(str) {
            var key = str.toLowerCase();

            regExpStr += (mapForConverting[key].expression + '[\\D\\s]*');
            formOrder[index] = mapForConverting[key].type;
            index += 1;
        });
        this._regExp = new RegExp(regExpStr, 'gi');
    },

    /**
     * Set event handlers to bind context and then store.
     * @private
     */
    _setProxyHandlers: function() {
        var proxies = this._proxyHandlers;

        // Event handlers for element
        proxies.onMousedownDocument = util.bind(this._onMousedownDocument, this);
        proxies.onKeydownElement = util.bind(this._onKeydownElement, this);
        proxies.onClickCalendar = util.bind(this._onClickCalendar, this);
        proxies.onClickOpener = util.bind(this._onClickOpener, this);

        // Event handlers for custom event of calendar
        proxies.onBeforeDrawCalendar = util.bind(this._onBeforeDrawCalendar, this);
        proxies.onDrawCalendar = util.bind(this._onDrawCalendar, this);
        proxies.onAfterDrawCalendar = util.bind(this._onAfterDrawCalendar, this);
    },

    /**
     * Event handler for mousedown of document<br>
     * - When click the out of layer, close the layer
     * @param {Event} event - event object
     * @private
     */
    _onMousedownDocument: function(event) {
        var isContains = $.contains(this._$wrapperElement[0], event.target);

        if ((!isContains && !this._isOpener(event.target))) {
            this.close();
        }
    },

    /**
     * Event handler for enter-key down of input element
     * @param {Event} [event] - event object
     * @private
     */
    _onKeydownElement: function(event) {
        if (!event || event.keyCode !== 13) {
            return;
        }
        this._setDateFromString(this._$element.val());
    },

    /**
     * Event handler for click of calendar<br>
     * - Update date form event-target
     * @param {Event} event - event object
     * @private
     */
    _onClickCalendar: function(event) {
        var target = event.target,
            className = target.className,
            value = Number((target.innerText || target.textContent || target.nodeValue)),
            shownDate,
            relativeMonth,
            date;

        if (value && !isNaN(value)) {
            if (className.indexOf('prev-month') > -1) {
                relativeMonth = -1;
            } else if (className.indexOf('next-month') > -1) {
                relativeMonth = 1;
            } else {
                relativeMonth = 0;
            }

            shownDate = this._calendar.getDate();
            shownDate.date = value;
            date = calendarUtil.getRelativeDate(0, relativeMonth, 0, shownDate);
            this.setDate(date.year, date.month, date.date);
        }
    },

    /**
     * Event handler for click of opener-element
     * @private
     */
    _onClickOpener: function() {
        this.open();
    },

    /**
     * Event handler for 'beforeDraw'-custom event of calendar
     * @private
     * @see {ne.component.Calendar.draw}
     */
    _onBeforeDrawCalendar: function() {
        this._unbindOnClickCalendar();
    },

    /**
     * Event handler for 'draw'-custom event of calendar
     * @param {Object} eventData - custom event data
     * @private
     * @see {ne.component.Calendar.draw}
     */
    _onDrawCalendar: function(eventData) {
        var dateHash = {
            year: eventData.year,
            month: eventData.month,
            date: eventData.date
        };
        this._setSelectableClassName(eventData.$dateContainer, dateHash);
        this._setSelectedClassName(eventData.$dateContainer, dateHash);
    },

    /**
     * Event handler for 'afterDraw'-custom event of calendar
     * @private
     * @see {ne.component.Calendar.draw}
     */
    _onAfterDrawCalendar: function() {
        this._bindOnClickCalendar();
    },

    /**
     * Bind opener-elements event
     * @param {Array} opOpeners [option.openers] - list of opener elements
     * @private
     */
    _bindOpenerEvent: function(opOpeners) {
        this._setOpeners(opOpeners);
        this._$element.on('keydown', this._proxyHandlers.onKeydownElement);
    },

    /**
     * Bind mousedown event of documnet
     * @private
     */
    _bindOnMousedownDocumnet: function() {
        $(document).on('mousedown', this._proxyHandlers.onMousedownDocument);
    },

    /**
     * Unbind mousedown event of documnet
     * @private
     */
    _unbindOnMousedownDocument: function() {
        $(document).off('mousedown', this._proxyHandlers.onMousedownDocument);
    },

    /**
     * Bind click event of calendar
     * @private
     */
    _bindOnClickCalendar: function() {
        var handler = this._proxyHandlers.onClickCalendar;
        this._$wrapperElement.find('.' + this._selectableClassName).on('click', handler);
    },

    /**
     * Unbind click event of calendar
     * @private
     */
    _unbindOnClickCalendar: function() {
        var handler = this._proxyHandlers.onClickCalendar;
        this._$wrapperElement.find('.' + this._selectableClassName).off('click', handler);
    },

    /**
     * Bind custom event of calendar
     * @private
     */
    _bindCalendarCustomEvent: function() {
        var proxyHandlers = this._proxyHandlers,
            onBeforeDraw = proxyHandlers.onBeforeDrawCalendar,
            onDraw = proxyHandlers.onDrawCalendar,
            onAfterDraw = proxyHandlers.onAfterDrawCalendar;

        this._calendar.on({
            'beforeDraw': onBeforeDraw,
            'draw': onDraw,
            'afterDraw': onAfterDraw
        });
    },

   /**
    * Unbind custom event of calendar
    * @private
    */
    _unbindCalendarCustomEvent: function() {
       var proxyHandlers = this._proxyHandlers,
           onBeforeDraw = proxyHandlers.onBeforeDrawCalendar,
           onDraw = proxyHandlers.onDrawCalendar,
           onAfterDraw = proxyHandlers.onAfterDrawCalendar;

       this._calendar.off({
           'beforeDraw': onBeforeDraw,
           'draw': onDraw,
           'afterDraw': onAfterDraw
       });
    },


    /**
     * Set position-left, top of calendar
     * @param {number} x - position-left
     * @param {number} y - position-top
     * @since 1.1.1
     */
    setXY: function(x, y) {
        var pos = this._pos;

        pos.left = util.isNumber(x) ? x : pos.left;
        pos.top = util.isNumber(y) ? y : pos.top;
        this._arrangeLayer();
    },

    /**
     * Set z-index of calendar
     * @param {number} zIndex - z-index value
     * @since 1.1.1
     */
    setZIndex: function(zIndex) {
        if (!util.isNumber(zIndex)) {
            return;
        }

        this._pos.zIndex = zIndex;
        this._arrangeLayer();
    },

    /**
     * add opener
     * @param {HTMLElement|jQuery} opener - element
     */
    addOpener: function(opener) {
        if (inArray(opener, this._openers) < 0) {
            this._openers.push($(opener)[0]);
            $(opener).on('click', this._proxyHandlers.onClickOpener);
        }
    },

    /**
     * remove opener
     * @param {HTMLElement} opener - element
     */
    removeOpener: function(opener) {
        var index = inArray(opener, this._openers);

        if (index > -1) {
            $(this._openers[index]).off('click', this._proxyHandlers.onClickOpener);
            this._openers.splice(index, 1);
        }
    },

    /**
     * Open calendar with arranging position
     */
    open: function() {
        if (this.isOpened()) {
            return;
        }
        this._arrangeLayer();
        this._bindCalendarCustomEvent();
        this._bindOnMousedownDocumnet();
        this._calendar.draw(this._date.year, this._date.month, false);
        this._$wrapperElement.show();
        this.fire('open');
    },

    /**
     * Close calendar with unbinding some events
     */
    close: function() {
        if (!this.isOpened()) {
            return;
        }
        this._unbindCalendarCustomEvent();
        this._unbindOnMousedownDocument();
        this._$wrapperElement.hide();
        this.fire('close');
    },

    /**
     * Get date-object of current DatePicker instance.
     * @returns {Object} - date-object having year, month and day-in-month
     */
    getDateObject: function() {
        return util.extend({}, this._date);
    },

    /**
     * Return year
     * @returns {number} - year
     */
    getYear: function() {
        return this._date.year;
    },

    /**
     * Return month
     * @returns {number} - month
     */
    getMonth: function() {
        return this._date.month;
    },

    /**
     * Return day-in-month
     * @returns {number} - day-in-month
     */
    getDayInMonth: function() {
        return this._date.date;
    },

    /**
     * Set date from values(year, month, date) and then fire 'update' custom event
     * @param {string|number} [year] - year
     * @param {string|number} [month] - month
     * @param {string|number} [date] - day in month
     */
    setDate: function(year, month, date) {
        var dateObj = this._date,
            newDateObj = {};

        newDateObj.year = year || dateObj.year;
        newDateObj.month = month || dateObj.month;
        newDateObj.date = date || dateObj.date;

        if (!this._isRestricted(newDateObj)) {
            util.extend(dateObj, newDateObj);
        }
        this._setValueToInputElement();
        this._calendar.draw(dateObj.year, dateObj.month, false);

        this.fire('update');
    },

    /**
     * Set or update date-form
     * @param {String} [form] - date-format
     * @example
     *  datepicker.setDateForm('yyyy-mm-dd');
     *  datepicker.setDateForm('mm-dd, yyyy');
     *  datepicker.setDateForm('y/m/d');
     *  datepicker.setDateForm('yy/mm/dd');
     */
    setDateForm: function(form) {
        this._dateForm = form || this._dateForm;
        this._setRegExp();
        this.setDate();
    },

    /**
     * Return whether the calendar is opened or not
     * @returns {boolean} - true if opened, false otherwise
     */
    isOpened: function() {
        return this._$wrapperElement.css('display') === 'block';
    },

    /**
     * Return TimePicker instance
     * @returns {TimePicker} - TimePicker instance
     */
    getTimePicker: function() {
        return this._timePicker;
    }
});

util.CustomEvents.mixin(ne.component.DatePicker);


})();
