/**
 * @fileoverview Calendar-header spec
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */
'use strict';

var Header = require('../../src/js/calendar/header');
var constants = require('../../src/js/constants');

var CLASS_NAME_NEXT_MONTH_BTN = constants.CLASS_NAME_NEXT_MONTH_BTN;
var CLASS_NAME_NEXT_YEAR_BTN = constants.CLASS_NAME_NEXT_YEAR_BTN;
var CLASS_NAME_PREV_MONTH_BTN = constants.CLASS_NAME_PREV_MONTH_BTN;
var CLASS_NAME_PREV_YEAR_BTN = constants.CLASS_NAME_PREV_YEAR_BTN;

describe('Calendar', function() {
  describe('Header', function() {
    var header = null;
    var container = document.createElement('div');

    function clickBtnInHeader(className) {
      container.querySelector('.' + className).click();
    }

    function getElementCountInHeader(className) {
      return container.querySelectorAll('.' + className).length;
    }

    beforeEach(function() {
      header = new Header(container, {
        language: 'en',
        showJumpButtons: true,
        showToday: true
      });
      header.render(new Date(2016, 11), 'date');
    });

    afterEach(function() {
      header.destroy();
    });

    it('should render buttons', function() {
      expect(getElementCountInHeader(CLASS_NAME_NEXT_MONTH_BTN)).toBe(1);
      expect(getElementCountInHeader(CLASS_NAME_NEXT_YEAR_BTN)).toBe(1);
      expect(getElementCountInHeader(CLASS_NAME_PREV_MONTH_BTN)).toBe(1);
      expect(getElementCountInHeader(CLASS_NAME_PREV_YEAR_BTN)).toBe(1);
    });

    it('should set title text formatted', function() {
      expect(header._container.querySelector('.tui-calendar-title').textContent).toBe(
        'December 2016'
      );
    });

    it('should fire "click" custom event when click a button', function() {
      var spy = jest.fn();
      header.on('click', spy);

      clickBtnInHeader(CLASS_NAME_NEXT_MONTH_BTN);
      expect(spy).toHaveBeenCalled();

      spy.mockReset();

      clickBtnInHeader(CLASS_NAME_NEXT_YEAR_BTN);
      expect(spy).toHaveBeenCalled();

      spy.mockReset();

      clickBtnInHeader(CLASS_NAME_PREV_MONTH_BTN);
      expect(spy).toHaveBeenCalled();

      spy.mockReset();

      clickBtnInHeader(CLASS_NAME_PREV_YEAR_BTN);
      expect(spy).toHaveBeenCalled();
    });

    it('should be able to destroy', function() {
      var nContainer = document.createElement('div');
      var nHeader = new Header(nContainer, {
        language: 'en'
      });

      nHeader.render();
      nHeader.destroy();

      expect(nContainer.children.length).toBe(0);
      expect(nHeader._container).toBeNull();
      expect(nHeader._innerElement).toBeNull();
      expect(nHeader._infoElement).toBeNull();
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
