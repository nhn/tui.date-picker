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
 * @param {object} options - Date-Range picker options
 *     @param {object} options.startpicker - Startpicker options
 *     @param {HTMLElement|string} options.startpicker.input - Startpicker input element or selector
 *     @param {HTMLElement|string} options.startpicker.container - Startpicker container element or selector
 *     @param {object} options.endpicker - Endpicker options
 *     @param {HTMLElement|string} options.endpicker.input - Endpicker input element or selector
 *     @param {HTMLElement|string} options.endpicker.container - Endpicker container element or selector
 *     @param {string} options.format - Input date-string format
 *     @param {string} [options.type = 'date'] - DatePicker type - ('date' | 'month' | 'year')
 *     @param {string} [options.language='en'] - Language key
 *     @param {object|boolean} [options.timePicker] - [TimePicker](https://nhn.github.io/tui.time-picker/latest) options. This option's name is changed from 'timepicker' and 'timepicker' will be deprecated in v5.0.0.
 *     @param {object} [options.calendar] - {@link Calendar} options
 *     @param {Array.<Array.<Date|number>>} [options.selectableRanges] - Selectable ranges
 *     @param {boolean} [options.showAlways = false] - Whether the datepicker shows always
 *     @param {boolean} [options.autoClose = true] - Close after click a date
 *     @param {Boolean} [options.usageStatistics=true|false] send hostname to google analytics [default value is true]
 * @example
 * var DatePicker = tui.DatePicker; // or require('tui-date-picker');
 * var rangepicker = DatePicker.createRangePicker({
 *     startpicker: {
 *         input: '#start-input',
 *         container: '#start-container'
 *     },
 *     endpicker: {
 *         input: '#end-input',
 *         container: '#end-container'
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

      this._initializePickers(options);
      this.setStartDate(startpickerOpt.date);
      this.setEndDate(endpickerOpt.date);
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
        }
      });
      var endpickerOpt = extend({}, options, {
        input: {
          element: endInput,
          format: options.format
        }
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
       * @event DateRangePicker#change:start
       * @example
       *
       * rangepicker.on('change:start', function() {
       *     console.log(rangepicker.getStartDate());
       * });
       */
      this.fire('change:start');
    },

    /**
     * After change on end-picker
     * @private
     */
    _onChangeEndpicker: function() {
      /**
       * @event DateRangePicker#change:end
       * @example
       *
       * rangepicker.on('change:end', function() {
       *     console.log(rangepicker.getEndDate());
       * });
       */
      this.fire('change:end');
    },

    /**
     * Returns start-datepicker
     * @returns {DatePicker}
     */
    getStartpicker: function() {
      return this._startpicker;
    },

    /**
     * Returns end-datepicker
     * @returns {DatePicker}
     */
    getEndpicker: function() {
      return this._endpicker;
    },

    /**
     * Set start date
     * @param {Date} date - Start date
     */
    setStartDate: function(date) {
      this._startpicker.setDate(date);
    },

    /**
     * Returns start-date
     * @returns {?Date}
     */
    getStartDate: function() {
      return this._startpicker.getDate();
    },

    /**
     * Returns end-date
     * @returns {?Date}
     */
    getEndDate: function() {
      return this._endpicker.getDate();
    },

    /**
     * Set end date
     * @param {Date} date - End date
     */
    setEndDate: function(date) {
      this._endpicker.setDate(date);
    },

    /**
     * Set selectable ranges
     * @param {Array.<Array.<number|Date>>} ranges - Selectable ranges
     * @see {@link DatePicker#setRanges}
     */
    setRanges: function(ranges) {
      this._startpicker.setRanges(ranges);
      this._syncRangesToEndpicker();
    },

    /**
     * Add a range
     * @param {Date|number} start - startDate
     * @param {Date|number} end - endDate
     * @see {@link DatePicker#addRange}
     */
    addRange: function(start, end) {
      this._startpicker.addRange(start, end);
      this._syncRangesToEndpicker();
    },

    /**
     * Remove a range
     * @param {Date|number} start - startDate
     * @param {Date|number} end - endDate
     * @param {null|'date'|'month'|'year'} type - Range type, If falsy -> Use strict timestamp;
     * @see {@link DatePicker#removeRange}
     */
    removeRange: function(start, end, type) {
      this._startpicker.removeRange(start, end, type);
      this._syncRangesToEndpicker();
    },

    /**
     * Change language
     * @param {string} language - Language
     * @see {@link DatePicker#localeTexts}
     */
    changeLanguage: function(language) {
      this._startpicker.changeLanguage(language);
      this._endpicker.changeLanguage(language);
    },

    /**
     * Destroy date-range picker
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
