/**
 * @fileoverview Date-Range picker
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */

'use strict';

var forEachArray = require('tui-code-snippet/collection/forEachArray');
var defineClass = require('tui-code-snippet/defineClass/defineClass');
var CustomEvents = require('tui-code-snippet/customEvents/customEvents');
var addClass = require('tui-code-snippet/domUtil/addClass');
var getData = require('tui-code-snippet/domUtil/getData');
var removeClass = require('tui-code-snippet/domUtil/removeClass');
var extend = require('tui-code-snippet/object/extend');

var DatePicker = require('../datepicker');
var dateUtil = require('../dateUtil');
var constants = require('../constants');
var util = require('../util');

var CLASS_NAME_RANGE_PICKER = 'tui-rangepicker';
var CLASS_NAME_SELECTED = constants.CLASS_NAME_SELECTED;
var CLASS_NAME_SELECTED_RANGE = 'tui-is-selected-range';

/**
 * @class
 * @description
 * Create a date-range picker by {@link DatePicker#createRangePicker DatePicker.createRangePicker()}.
 * @see {@link /tutorial-example08-daterangepicker DateRangePicker example}
 * @param {object} options - DateRangePicker options
 *     @param {object} options.startpicker - Startpicker options
 *         @param {HTMLElement|string} options.startpicker.input - Startpicker input element or selector
 *         @param {HTMLElement|string} options.startpicker.container - Startpicker container element or selector
 *         @param {Date|number} [options.startpicker.date] - Initial date of the start picker. Set by a Date instance or a number(timestamp). (default: no initial date)
 *         @param {string} [options.startpicker.weekStartDay = 'Sun'] - Start of the week. 'Sun', 'Mon', ..., 'Sat'(default: 'Sun'(start on Sunday))
 *     @param {object} options.endpicker - Endpicker options
 *         @param {HTMLElement|string} options.endpicker.input - Endpicker input element or selector
 *         @param {HTMLElement|string} options.endpicker.container - Endpicker container element or selector
 *         @param {Date|number} [options.endpicker.date] - Initial date of the end picker. Set by a Date instance or a number(timestamp). (default: no initial date)
 *         @param {string} [options.endpicker.weekStartDay = 'Sun'] - Start of the week. 'Sun', 'Mon', ..., 'Sat'(default: 'Sun'(start on Sunday))
 *     @param {('date'|'month'|'year')} [options.type = 'date'] - DatePicker type. Determine whether to choose a date, month, or year.
 *     @param {string} [options.language='en'] - Language code. English('en') and Korean('ko') are provided as default. To use the other languages, use {@link DatePicker#localeTexts DatePicker.localeTexts}.
 *     @param {object|boolean} [options.timePicker] - [TimePicker](https://nhn.github.io/tui.time-picker/latest) options. Refer to the [TimePicker instance's options](https://nhn.github.io/tui.time-picker/latest/TimePicker). To create the TimePicker without customization, set to true.
 *     @param {object} [options.calendar] - {@link Calendar} options. Refer to the {@link Calendar Calendar instance's options}.
 *     @param {string} [options.format = 'yyyy-mm-dd'] - Format of the Date string
 *     @param {Array.<Array.<Date|number>>} [options.selectableRanges] - Ranges of selectable date. Set by Date instances or numbers(timestamp).
 *     @param {boolean} [options.showAlways = false] - Show the DateRangePicker always
 *     @param {boolean} [options.autoClose = true] - Close the DateRangePicker after clicking the date
 *     @param {boolean} [options.usageStatistics = true] - Send a hostname to Google Analytics (default: true)
 * @example
 * // ES6
 * import DatePicker from 'tui-date-picker'
 *
 * // CommonJS
 * const DatePicker = require('tui-date-picker');
 *
 * // Browser
 * const DatePicker = tui.DatePicker;
 *
 * const rangePicker = DatePicker.createRangePicker({
 *     startpicker: {
 *         input: '#start-input',
 *         container: '#start-container'
 *         date: new Date(2019, 3, 1),
 *         weekStartDay: 'Mon',
 *     },
 *     endpicker: {
 *         input: '#end-input',
 *         container: '#end-container',
 *         weekStartDay: 'Mon',
 *     },
 *     type: 'date',
 *     format: 'yyyy-MM-dd'
 *     selectableRanges: [
 *         [new Date(2017, 3, 1), new Date(2017, 5, 1)],
 *         [new Date(2017, 6, 3), new Date(2017, 10, 5)]
 *     ]
 * });
 */
var DateRangePicker = defineClass(
  /** @lends DateRangePicker.prototype */ {
    init: function(options) {
      var startpickerOpt, endpickerOpt;

      options = options || {};
      startpickerOpt = options.startpicker;
      endpickerOpt = options.endpicker;

      if (!startpickerOpt) {
        throw new Error('The "startpicker" option is required.');
      }
      if (!endpickerOpt) {
        throw new Error('The "endpicker" option is required.');
      }

      /**
       * Start picker
       * @type {DatePicker}
       * @private
       */
      this._startpicker = null;

      /**
       * End picker
       * @type {DatePicker}
       * @private
       */
      this._endpicker = null;

      this._isRangeSet = false;

      this._preEndPickerDate = new Date().getDate();

      this._initializePickers(options);
      this._syncRangesToEndpicker();
    },

    /**
     * Create picker
     * @param {Object} options - DatePicker options
     * @private
     */
    _initializePickers: function(options) {
      var startpickerContainer = util.getElement(options.startpicker.container);
      var endpickerContainer = util.getElement(options.endpicker.container);
      var startInput = util.getElement(options.startpicker.input);
      var endInput = util.getElement(options.endpicker.input);

      var startpickerOpt = extend({}, options, {
        input: {
          element: startInput,
          format: options.format
        },
        date: options.startpicker.date,
        weekStartDay: options.startpicker.weekStartDay
      });
      var endpickerOpt = extend({}, options, {
        input: {
          element: endInput,
          format: options.format
        },
        date: options.endpicker.date,
        weekStartDay: options.endpicker.weekStartDay
      });

      this._startpicker = new DatePicker(startpickerContainer, startpickerOpt);
      this._startpicker.addCssClass(CLASS_NAME_RANGE_PICKER);
      this._startpicker.on('change', this._onChangeStartpicker, this);
      this._startpicker.on('draw', this._onDrawPicker, this);

      this._endpicker = new DatePicker(endpickerContainer, endpickerOpt);
      this._endpicker.addCssClass(CLASS_NAME_RANGE_PICKER);
      this._endpicker.on('change', this._onChangeEndpicker, this);
      this._endpicker.on('draw', this._onDrawPicker, this);
    },

    /**
     * Set selection-class to elements after calendar drawing
     * @param {Object} eventData - Event data {@link DatePicker#event:draw}
     * @private
     */
    _onDrawPicker: function(eventData) {
      var calendarType = eventData.type;
      var startDate = this._startpicker.getDate();
      var endDate = this._endpicker.getDate();

      if (!startDate) {
        return;
      }

      if (!endDate) {
        // Convert null to invaild date.
        endDate = new Date(NaN);
      }

      forEachArray(
        eventData.dateElements,
        function(el) {
          var elDate = new Date(Number(getData(el, 'timestamp')));
          var isInRange = dateUtil.inRange(startDate, endDate, elDate, calendarType);
          var isSelected =
            dateUtil.isSame(startDate, elDate, calendarType) ||
            dateUtil.isSame(endDate, elDate, calendarType);

          this._setRangeClass(el, isInRange);
          this._setSelectedClass(el, isSelected);
        },
        this
      );
    },

    /**
     * Set range class to element
     * @param {HTMLElement} el - Element
     * @param {boolean} isInRange - In range
     * @private
     */
    _setRangeClass: function(el, isInRange) {
      if (isInRange) {
        addClass(el, CLASS_NAME_SELECTED_RANGE);
      } else {
        removeClass(el, CLASS_NAME_SELECTED_RANGE);
      }
    },

    /**
     * Set selected class to element
     * @param {HTMLElement} el - Element
     * @param {boolean} isSelected - Is selected
     * @private
     */
    _setSelectedClass: function(el, isSelected) {
      if (isSelected) {
        addClass(el, CLASS_NAME_SELECTED);
      } else {
        removeClass(el, CLASS_NAME_SELECTED);
      }
    },

    /**
     * Sync ranges to endpicker
     * @private
     */
    _syncRangesToEndpicker: function() {
      var startDate = this._startpicker.getDate();
      var overlappedRange;

      if (startDate) {
        overlappedRange = this._startpicker.findOverlappedRange(
          dateUtil.cloneWithStartOf(startDate).getTime(),
          dateUtil.cloneWithEndOf(startDate).getTime()
        );

        this._endpicker.enable();
        this._endpicker.setRanges([[startDate.getTime(), overlappedRange[1].getTime()]]);

        this._setTimeRangeOnEndPicker();
      } else {
        this._endpicker.setNull();
        this._endpicker.disable();
      }
    },

    /**
     * After change on start-picker
     * @private
     */
    _onChangeStartpicker: function() {
      this._syncRangesToEndpicker();
      /**
       * Occur after the start date is changed.
       * @event DateRangePicker#change:start
       * @see {@link https://nhn.github.io/tui.code-snippet/latest/CustomEvents#on rangePicker.on()} to bind event handlers.
       * @see {@link https://nhn.github.io/tui.code-snippet/latest/CustomEvents#off rangePicker.off()} to unbind event handlers.
       * @see Refer to {@link https://nhn.github.io/tui.code-snippet/latest/CustomEvents CustomEvents} for more methods. DateRangePicker mixes in the methods from CustomEvents.
       * @example
       * // bind the 'change:start' event
       * rangePicker.on('change:start', () => {
       *     console.log(`Start date: ${rangePicker.getStartDate()}`);
       * });
       *
       * // unbind the 'change:start' event
       * rangePicker.off('change:start');
       */
      this.fire('change:start');
    },

    /**
     * After change on end-picker
     * @private
     */
    _onChangeEndpicker: function() {
      /**
       * Occur after the end date is changed.
       * @event DateRangePicker#change:end
       * @see {@link https://nhn.github.io/tui.code-snippet/latest/CustomEvents#on rangePicker.on()} to bind event handlers.
       * @see {@link https://nhn.github.io/tui.code-snippet/latest/CustomEvents#off rangePicker.off()} to unbind event handlers.
       * @see Refer to {@link https://nhn.github.io/tui.code-snippet/latest/CustomEvents CustomEvents} for more methods. DateRangePicker mixes in the methods from CustomEvents.
       * @example
       * // bind the 'change:end' event
       * rangePicker.on('change:end', () => {
       *     console.log(`End date: ${rangePicker.getEndDate()}`);
       * });
       *
       * // unbind the 'change:end' event
       * rangePicker.off('change:end');
       */

      var date;
      var endPickerDate = this._endpicker.getDate();

      if (endPickerDate) {
        date = endPickerDate.getDate();
        if (this._preEndPickerDate !== date) {
          this._setTimeRangeOnEndPicker();
        }

        this._preEndPickerDate = date;
      } else {
        this._preEndPickerDate = null;
      }

      this.fire('change:end');
    },

    /**
     * Set time range on end picker
     * @private
     */
    _setTimeRangeOnEndPicker: function() {
      var pickerDate, timeRange;
      var endTimePicker = this._endpicker._timePicker;

      if (!endTimePicker) {
        return;
      }

      pickerDate = this._endpicker.getDate() || this._startpicker.getDate();
      timeRange = this._getTimeRangeFromStartPicker();

      if (pickerDate && timeRange[pickerDate.getDate()]) {
        endTimePicker.setRange(timeRange[pickerDate.getDate()]);
        this._isRangeSet = true;
      } else if (this._isRangeSet) {
        endTimePicker.setRange({ hour: 0, minute: 0 });
        endTimePicker.resetMinuteRange();
        this._isRangeSet = false;
      }
    },

    /**
     * Return object of time range from start picker.
     * @returns {object}
     * @private
     */
    _getTimeRangeFromStartPicker: function() {
      var startDate = this._startpicker.getDate();
      var timeRange = {};

      timeRange[startDate.getDate()] = {
        hour: startDate.getHours(),
        minute: startDate.getMinutes()
      };

      return timeRange;
    },

    /**
     * Return a start-datepicker.
     * @returns {DatePicker}
     */
    getStartpicker: function() {
      return this._startpicker;
    },

    /**
     * Return a end-datepicker.
     * @returns {DatePicker}
     */
    getEndpicker: function() {
      return this._endpicker;
    },

    /**
     * Set the start date.
     * @param {Date} date - Start date
     */
    setStartDate: function(date) {
      this._startpicker.setDate(date);
    },

    /**
     * Return the start date.
     * @returns {?Date}
     */
    getStartDate: function() {
      return this._startpicker.getDate();
    },

    /**
     * Return the end date.
     * @returns {?Date}
     */
    getEndDate: function() {
      return this._endpicker.getDate();
    },

    /**
     * Set the end date.
     * @param {Date} date - End date
     */
    setEndDate: function(date) {
      this._endpicker.setDate(date);
    },

    /**
     * Set selectable ranges.
     * @param {Array.<Array.<number|Date>>} ranges - Selectable ranges. Use Date instances or numbers(timestamp).
     */
    setRanges: function(ranges) {
      this._startpicker.setRanges(ranges);
      this._syncRangesToEndpicker();
    },

    /**
     * Add a selectable range. Use Date instances or numbers(timestamp).
     * @param {Date|number} start - the start date
     * @param {Date|number} end - the end date
     */
    addRange: function(start, end) {
      this._startpicker.addRange(start, end);
      this._syncRangesToEndpicker();
    },

    /**
     * Remove a range. Use Date instances or numbers(timestamp).
     * @param {Date|number} start - the start date
     * @param {Date|number} end - the end date
     * @param {null|'date'|'month'|'year'} type - Range type. If falsy, start and end values are considered as timestamp
     */
    removeRange: function(start, end, type) {
      this._startpicker.removeRange(start, end, type);
      this._syncRangesToEndpicker();
    },

    /**
     * Change language.
     * @param {string} language - Language code. English('en') and Korean('ko') are provided as default.
     * @see To set to the other languages, use {@link DatePicker#localeTexts DatePicker.localeTexts}.
     */
    changeLanguage: function(language) {
      this._startpicker.changeLanguage(language);
      this._endpicker.changeLanguage(language);
    },

    /**
     * Destroy the date-range picker.
     */
    destroy: function() {
      this.off();
      this._startpicker.destroy();
      this._endpicker.destroy();
      this._startpicker = this._endpicker = null;
    }
  }
);

CustomEvents.mixin(DateRangePicker);
module.exports = DateRangePicker;
