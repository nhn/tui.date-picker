/**
 * @fileoverview The entry file of DatePicker components
 * @author NHN Ent. FE Development Team
 */

'use strict';

var DatePicker = require('./datepicker');
var DateRangePicker = require('./dateRangePicker');
var Calendar = require('./calendar');

require('../css/calendar.css');

/**
 * Create a calendar component
 * @static
 * @param {HTMLElement|jQuery|string} wrapperElement - Wrapper element or selector
 *     @param {Object} [options] - Options for initialize
 *     @param {string} [options.language = 'en'] - Calendar language - {@link Calendar.localeTexts}
 *     @param {boolean} [options.showToday] - If true, shows today
 *     @param {boolean} [options.showJumpButtons] - If true, shows jump buttons (next,prev-year in 'date'-Calendar)
 *     @param {Date} [options.date = new Date()] - Initial date
 *     @param {string} [options.type = 'date'] - Calendar types - 'date', 'month', 'year'
 * @returns {Calendar} Instance of Calendar
 * @example
 * var DatePicker = tui.DatePicker; // or require('tui-date-picker');
 * var calendar = DatePicker.createCalendar('#calendar-wrapper', {
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
 * Create a calendar component
 * @static
 * @param {object} options - Date-Range picker options
 *     @param {object} options.startpicker - Startpicker options
 *     @param {Element|jQuery|string} options.startpicker.input - Startpicker input element
 *     @param {Element|jQuery|string} options.startpicker.container - Startpicker container element
 *     @param {object} options.endpicker - Endpicker options
 *     @param {Element|jQuery|string} options.endpicker.input - Endpicker input element
 *     @param {Element|jQuery|string} options.endpicker.container - Endpicker container element
 *     @param {string} options.format - Input date-string format
 *     @param {string} [options.type = 'date'] - DatePicker type - ('date' | 'month' | 'year')
 *     @param {string} [options.language='en'] - Language key
 *     @param {object|boolean} [options.timePicker] - {@link TimePicker} option
 *     @param {object} [options.calendar] - {@link Calendar} option
 *     @param {Array.<Array.<Date|number>>} [options.selectableRanges] - Selectable ranges
 *     @param {boolean} [options.showAlways = false] - Whether the datepicker shows always
 *     @param {boolean} [options.autoClose = true] - Close after click a date
 * @returns {DateRangePicker} Instance of DateRangePicker
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
DatePicker.createRangePicker = function(options) {
    return new DateRangePicker(options);
};

module.exports = DatePicker;
