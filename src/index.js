'use strict';

var DatePicker = require('./datepicker');
var TimePicker = require('./timepicker');
var Spinbox = require('./spinbox');

tui.util.defineNamespace('tui.component', {
    DatePicker: DatePicker,
    TimePicker: TimePicker,
    Spinbox: Spinbox
});
