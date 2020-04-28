/**
 * @fileoverview The entry file of DatePicker components
 * @author NHN. FE Development Team
 */

'use strict';

var DatePicker = require('./datepicker');
var DateRangePicker = require('./dateRangePicker');
var Calendar = require('./calendar');

require('../css/calendar.css');

/**
 * Create a calendar.
 * @see {@link Calendar}
 * @see {@link /tutorial-example07-calendar Calendar example}
 * @static
 * @param {HTMLElement|string} wrapperElement - Container element or selector of the Calendar
 * @param {Object} [options] - {@link Calendar} options. Refer to the {@link Calendar Calendar instance's options}.
 * @returns {Calendar}
 * @example
 * const calendar = DatePicker.createCalendar('#calendar-wrapper', {
 *    language: 'en',
 *    showToday: true,
 *    showJumpButtons: false,
 *    date: new Date(),
 *    type: 'date'
 * });
 */
DatePicker.createCalendar = function(wrapperElement, options) {
  return new Calendar(wrapperElement, options);
};

/**
 * Create a date-range picker.
 * @see {@link DateRangePicker}
 * @see {@link /tutorial-example08-daterangepicker DateRangePicker example}
 * @static
 * @param {object} options - {@link DateRangePicker} options. Refer to the {@link DateRangePicker DateRangePicker instance's options}.
 * @returns {DateRangePicker}
 * @example
 * const rangepicker = DatePicker.createRangePicker({
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
DatePicker.createRangePicker = function(options) {
  return new DateRangePicker(options);
};

module.exports = DatePicker;
