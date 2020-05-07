'use strict';

var template = require('tui-code-snippet/domUtil/template');

module.exports = function(context) {
  var source =
    '<div class="tui-datepicker">' +
    '  {{if timePicker}}' +
    '    {{if isTab}}' +
    '      <div class="tui-datepicker-selector">' +
    '        <button type="button" class="tui-datepicker-selector-button tui-is-checked" aria-label="selected">' +
    '          <span class="tui-ico-date"></span>{{localeText["date"]}}' +
    '        </button>' +
    '        <button type="button" class="tui-datepicker-selector-button">' +
    '          <span class="tui-ico-time"></span>{{localeText["time"]}}' +
    '        </button>' +
    '      </div>' +
    '      <div class="tui-datepicker-body">' +
    '        <div class="tui-calendar-container"></div>' +
    '        <div class="tui-timepicker-container"></div>' +
    '      </div>' +
    '    {{else}}' +
    '      <div class="tui-datepicker-body">' +
    '        <div class="tui-calendar-container"></div>' +
    '      </div>' +
    '      <div class="tui-datepicker-footer">' +
    '        <div class="tui-timepicker-container"></div>' +
    '      </div>' +
    '    {{/if}}' +
    '  {{else}}' +
    '    <div class="tui-datepicker-body">' +
    '      <div class="tui-calendar-container"></div>' +
    '    </div>' +
    '  {{/if}}' +
    '</div>';

  return template(source, context);
};
