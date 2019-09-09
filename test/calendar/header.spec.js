/**
 * @fileoverview Calendar-header spec
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */
'use strict';

var Header = require('../../src/js/calendar/header');
var constants = require('../../src/js/constants');

describe('Calendar', function() {
  describe('Header', function() {
    var header = null;
    var container = document.createElement('div');

    beforeEach(function() {
      header = new Header(container, {
        language: 'en',
        showJumpButtons: true
      });
      header.render(new Date(2016, 11), 'date');
    });

    afterEach(function() {
      header.destroy();
    });

    it('should render buttons', function() {
      expect(
        header._container.querySelectorAll('.' + constants.CLASS_NAME_NEXT_MONTH_BTN).length
      ).toBe(1);
      expect(
        header._container.querySelectorAll('.' + constants.CLASS_NAME_NEXT_YEAR_BTN).length
      ).toBe(1);
      expect(
        header._container.querySelectorAll('.' + constants.CLASS_NAME_PREV_MONTH_BTN).length
      ).toBe(1);
      expect(
        header._container.querySelectorAll('.' + constants.CLASS_NAME_PREV_YEAR_BTN).length
      ).toBe(1);
    });

    it('should set title text formatted', function() {
      expect(header._container.querySelector('.tui-calendar-title').innerText).toBe(
        'December 2016'
      );
    });

    it('should fire "click" custom event when click a button', function() {
      var spy = jasmine.createSpy('button click handler');
      header.on('click', spy);

      header._container.querySelector('.' + constants.CLASS_NAME_NEXT_MONTH_BTN).click();
      expect(spy).toHaveBeenCalled();

      spy.calls.reset();

      header._container.querySelector('.' + constants.CLASS_NAME_NEXT_YEAR_BTN).click();
      expect(spy).toHaveBeenCalled();

      spy.calls.reset();

      header._container.querySelector('.' + constants.CLASS_NAME_PREV_MONTH_BTN).click();
      expect(spy).toHaveBeenCalled();

      spy.calls.reset();

      header._container.querySelector('.' + constants.CLASS_NAME_PREV_YEAR_BTN).click();
      expect(spy).toHaveBeenCalled();
    });

    it('should be able to destroy', function() {
      var nContainer = document.createElement('div');
      var nHeader = new Header(nContainer, {
        language: 'en',
        showToday: true
      });

      nHeader.render();
      nHeader.destroy();

      expect(nContainer.children.length).toBe(0);
      expect(nHeader._container).toBeNull();
      expect(nHeader._innerElement).toBeNull();
      expect(nHeader._infoElement).toBeNull();
    });

    it('"changeLanaguage" should re-initilize formatters', function() {
      spyOn(header, '_setFormatters');
      header.changeLanguage('ko');

      expect(header._setFormatters).toHaveBeenCalled();
    });

    it('should render today box if allowed', function() {
      var nContainer = document.createElement('div');
      var nHeader = new Header(nContainer, {
        language: 'en',
        showToday: true
      });

      nHeader.render();

      expect(nHeader._container.querySelectorAll('.tui-calendar-title-today').length).toBe(1);

      nHeader.destroy();
    });
  });
});
