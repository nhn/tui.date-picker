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
    body._dateLayer.changeLanguage = jest.fn();
    body._monthLayer.changeLanguage = jest.fn();
    body._yearLayer.changeLanguage = jest.fn();

    body.changeLanguage('ko');
    expect(body._dateLayer.changeLanguage).toHaveBeenCalledWith('ko');
    expect(body._monthLayer.changeLanguage).toHaveBeenCalledWith('ko');
    expect(body._yearLayer.changeLanguage).toHaveBeenCalledWith('ko');
  });

  it('"render" should remove prevLayer and render matched layer', function() {
    body.render(new Date(), 'date');

    body._dateLayer.remove = jest.fn();
    body._monthLayer.render = jest.fn();

    body.render(new Date(), 'month');

    expect(body._dateLayer.remove).toHaveBeenCalled();
    expect(body._monthLayer.render).toHaveBeenCalled();
  });

  it('"getDateElements" should return date HTML elements', function() {
    var dateElements;

    body.render(new Date(2016, 0), 'month');

    dateElements = body.getDateElements();

    expect(dateElements.length).toBe(12);
  });
});
