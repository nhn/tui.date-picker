'use strict';


var Datepicker = require('./datepicker');
var DateRangePicker = require('./dateRangePicker');
var Calendar = require('./calendar');
var Timepicker = require('./timepicker');

require('../css/calendar.css');
require('../css/timepicker.css');

tui.util.defineNamespace('tui.component', {
    Calendar: Calendar,
    Datepicker: Datepicker,
    DateRangePicker: DateRangePicker,
    Timepicker: Timepicker
});
