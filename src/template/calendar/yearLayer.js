'use strict';

var template = require('tui-code-snippet/domUtil//template');

module.exports = function(context) {
  var source =
    '<table class="tui-calendar-body-inner">' +
    '  <caption><span>Years</span></caption>' +
    '  <tbody>' +
    '    {{each yearGroups}}' +
    '    <tr class="tui-calendar-year-group">' +
    '      {{each @this}}' +
    '      <td class="tui-calendar-year" data-timestamp={{getFirstDayTimestamp @this 0}}>' +
    '        {{@this}}' +
    '      </td>' +
    '      {{/each}}' +
    '    </tr>' +
    '    {{/each}}' +
    '  </tbody>' +
    '</table>';

  return template(source, context);
};
