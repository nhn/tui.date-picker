/**
 * @fileoverview Calendar body spec
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */
'use strict';

var Body = require('../../src/js/calendar/body');

describe('Calendar - Body', function() {
  var body;
  var container = document.createElement('div');

  beforeEach(function() {
    body = new Body(container, { language: 'en' });
  });

  afterEach(function() {
    body.destroy();
  });

  it('"changeLanguage" should change each layer\'s language', function() {
    body.changeLanguage('ko');

    body.render(new Date(), 'date');
    expect(container.querySelector('.tui-sun').textContent).toMatch(/^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]$/);

    body.render(new Date(), 'month');
    expect(container.querySelector('.tui-calendar-month').textContent).toMatch(
      /^[0-9]+[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]$/
    );
  });

  it('"render" should remove prevLayer and render matched layer', function() {
    var prevRenderedContent;

    body.render(new Date(), 'date');
    prevRenderedContent = container.innerHTML;

    body.render(new Date(), 'month');
    expect(container.innerHTML).not.toEqual(prevRenderedContent);
  });

  it('"getDateElements" should return date HTML elements', function() {
    var dateElements;

    body.render(new Date(2016, 0), 'month');

    dateElements = body.getDateElements();

    expect(dateElements.length).toBe(12);
  });
});
