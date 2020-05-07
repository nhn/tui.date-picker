'use strict';

var template = require('tui-code-snippet/domUtil/template');

module.exports = function(context) {
  var source =
    '<table class="tui-calendar-body-inner" cellspacing="0" cellpadding="0">' +
    '  <caption><span>Dates</span></caption>' +
    '  <thead class="tui-calendar-body-header">' +
    '    <tr>' +
    '      <th class="tui-sun" scope="col">{{Sun}}</th>' +
    '      <th scope="col">{{Mon}}</th>' +
    '      <th scope="col">{{Tue}}</th>' +
    '      <th scope="col">{{Wed}}</th>' +
    '      <th scope="col">{{Thu}}</th>' +
    '      <th scope="col">{{Fri}}</th>' +
    '      <th class="tui-sat" scope="col">{{Sat}}</th>' +
    '    </tr>' +
    '  </thead>' +
    '  <tbody>' +
    '    {{each weeks}}' +
    '    <tr class="tui-calendar-week">' +
    '      {{each @this}}' +
    '      <td class="{{@this["className"]}}" data-timestamp="{{@this["timestamp"]}}">{{@this["dayInMonth"]}}</td>' +
    '      {{/each}}' +
    '    </tr>' +
    '    {{/each}}' +
    '  </tbody>' +
    '</table>';

  return template(source, context);
};
