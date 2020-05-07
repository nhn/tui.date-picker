'use strict';

var template = require('tui-code-snippet/domUtil/template');

module.exports = function(context) {
  var source =
    '{{if isDateCalendar}}' +
    '  {{if showJumpButtons}}' +
    '    <div class="tui-calendar-header-inner tui-calendar-has-btns">' +
    '      <button class="tui-calendar-btn tui-calendar-btn-prev-year">Prev year</button>' +
    '      <button class="tui-calendar-btn tui-calendar-btn-prev-month">Prev month</button>' +
    '      <em class="tui-calendar-title {{titleClass}}">{{title}}</em>' +
    '      <button class="tui-calendar-btn tui-calendar-btn-next-month">Next month</button>' +
    '      <button class="tui-calendar-btn tui-calendar-btn-next-year">Next year</button>' +
    '    </div>' +
    '  {{else}}' +
    '    <div class="tui-calendar-header-inner">' +
    '      <button class="tui-calendar-btn tui-calendar-btn-prev-month">Prev month</button>' +
    '      <em class="tui-calendar-title {{titleClass}}">{{title}}</em>' +
    '      <button class="tui-calendar-btn tui-calendar-btn-next-month">Next month</button>' +
    '    </div>' +
    '  {{/if}}' +
    '{{else}}' +
    '  <div class="tui-calendar-header-inner">' +
    '    <button class="tui-calendar-btn tui-calendar-btn-prev-year">Prev year</button>' +
    '    <em class="tui-calendar-title {{titleClass}}">{{title}}</em>' +
    '    <button class="tui-calendar-btn tui-calendar-btn-next-year">Next year</button>' +
    '  </div>' +
    '{{/if}}' +
    '{{if showToday}}' +
    '  <div class="tui-calendar-header-info">' +
    '    <p class="tui-calendar-title-today">{{todayText}}</p>' +
    '  </div>' +
    '{{/if}}';

  return template(source, context);
};
