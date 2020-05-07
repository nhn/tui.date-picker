'use strict';

var template = require('tui-code-snippet/domUtil/template');

module.exports = function(context) {
  var source =
    '<table class="tui-calendar-body-inner">' +
    '  <caption><span>Months</span></caption>' +
    '  <tbody>' +
    '    <tr class="tui-calendar-month-group">' +
    '      <td class="tui-calendar-month" data-timestamp={{getFirstDayTimestamp year 0}}>{{Jan}}</td>' +
    '      <td class="tui-calendar-month" data-timestamp={{getFirstDayTimestamp year 1}}>{{Feb}}</td>' +
    '      <td class="tui-calendar-month" data-timestamp={{getFirstDayTimestamp year 2}}>{{Mar}}</td>' +
    '      <td class="tui-calendar-month" data-timestamp={{getFirstDayTimestamp year 3}}>{{Apr}}</td>' +
    '    </tr>' +
    '    <tr class="tui-calendar-month-group">' +
    '      <td class="tui-calendar-month" data-timestamp={{getFirstDayTimestamp year 4}}>{{May}}</td>' +
    '      <td class="tui-calendar-month" data-timestamp={{getFirstDayTimestamp year 5}}>{{Jun}}</td>' +
    '      <td class="tui-calendar-month" data-timestamp={{getFirstDayTimestamp year 6}}>{{Jul}}</td>' +
    '      <td class="tui-calendar-month" data-timestamp={{getFirstDayTimestamp year 7}}>{{Aug}}</td>' +
    '    </tr>' +
    '    <tr class="tui-calendar-month-group">' +
    '      <td class="tui-calendar-month" data-timestamp={{getFirstDayTimestamp year 8}}>{{Sep}}</td>' +
    '      <td class="tui-calendar-month" data-timestamp={{getFirstDayTimestamp year 9}}>{{Oct}}</td>' +
    '      <td class="tui-calendar-month" data-timestamp={{getFirstDayTimestamp year 10}}>{{Nov}}</td>' +
    '      <td class="tui-calendar-month" data-timestamp={{getFirstDayTimestamp year 11}}>{{Dec}}</td>' +
    '    </tr>' +
    '  </tbody>' +
    '</table>';

  return template(source, context);
};
