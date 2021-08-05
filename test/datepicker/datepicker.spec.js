/**
 * @fileoverview DatePicker spec
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */
'use strict';

var inArray = require('tui-code-snippet/array/inArray');
var addClass = require('tui-code-snippet/domUtil/addClass');
var hasClass = require('tui-code-snippet/domUtil/hasClass');
var removeElement = require('tui-code-snippet/domUtil/removeElement');
var setData = require('tui-code-snippet/domUtil/setData');

var TimePicker = require('tui-time-picker');

var DatePicker = require('../../src/js/datepicker');
var Calendar = require('../../src/js/calendar');
var constants = require('../../src/js/constants');

var CLASS_NAME_TITLE_TODAY = constants.CLASS_NAME_TITLE_TODAY;

var CLASS_NAME_SELECTABLE = 'tui-is-selectable';
var CLASS_NAME_HIDDEN = 'tui-hidden';

describe('Date Picker', function() {
  describe('date=null on constructor', function() {
    var datepicker, input, container;

    function clickBtnInDatePicker(className) {
      container.querySelector('.' + className).click();
    }

    beforeEach(function() {
      container = document.createElement('div');
      input = document.createElement('input');
      datepicker = new DatePicker(container, {
        input: {
          element: input
        },
        date: null
      });
    });

    afterEach(function() {
      container = null;
      input = null;
      datepicker.destroy();
    });

    it('should set blank input', function() {
      expect(input.value).toBe('');
      expect(datepicker.getDate()).toBeNull();
    });

    it('should show today calendar if date is null', function() {
      var calendarDate = datepicker.getCalendar().getDate();

      expect(calendarDate.setHours(0, 0, 0, 0)).toEqual(new Date().setHours(0, 0, 0, 0));
    });

    it('should set new date if selectable', function() {
      datepicker.setDate(new Date(2016, 11, 3));

      expect(datepicker.getDate()).toEqual(new Date(2016, 11, 3));
    });

    it('should set date to today when click today text', function() {
      var pickerDate;
      var today = new Date();
      datepicker.setDate(new Date(2016, 11, 3));

      clickBtnInDatePicker(CLASS_NAME_TITLE_TODAY);

      pickerDate = datepicker.getDate().toLocaleDateString();

      expect(pickerDate).toBe(today.toLocaleDateString());
    });
  });

  describe('apis - ', function() {
    var datepicker;

    beforeEach(function() {
      datepicker = new DatePicker(document.createElement('div'), {
        date: new Date(2017, 10, 27),
        selectableRanges: [[new Date(2016, 10, 27), new Date(2018, 10, 27)]],
        openers: [document.createElement('button')],
        timePicker: {
          showMeridiem: true
        }
      });
    });

    afterEach(function() {
      datepicker.destroy();
    });

    it('setNull', function() {
      var input = document.createElement('input');

      input.value = 'foo';
      datepicker.setInput(input);
      datepicker.setNull();

      expect(datepicker.getDate()).toBeNull();
      expect(input.value).toBe('');
    });

    it('open', function() {
      datepicker.open();

      expect(datepicker.isOpened()).toBe(true);
    });

    it('close', function() {
      datepicker.open();
      datepicker.close();

      expect(datepicker.isOpened()).toBe(false);
    });

    it('getDate', function() {
      var date = datepicker.getDate();

      expect(date).toEqual(new Date(2017, 10, 27));
    });

    it('getTimePicker', function() {
      expect(datepicker.getTimePicker()).toEqual(expect.any(TimePicker));
    });

    it('getCalendar', function() {
      expect(datepicker.getCalendar()).toEqual(expect.any(Calendar));
    });

    it('setDate', function() {
      datepicker.setDate(new Date(2017, 2, 12));

      expect(datepicker.getDate()).toEqual(new Date(2017, 2, 12));

      datepicker.setDate();

      expect(datepicker.getDate()).toEqual(new Date(2017, 2, 12));
    });

    it('setType', function() {
      expect(datepicker.getType()).toBe('date');

      datepicker.setType('month');

      expect(datepicker.getType()).toBe('month');

      datepicker.setType('year');

      expect(datepicker.getType()).toBe('year');

      datepicker.setType('date');

      expect(datepicker.getType()).toBe('date');
    });

    it('isSelectable', function() {
      var date1, date2, date3;

      datepicker.setRanges([[new Date(1994, 4, 9), new Date(2090, 4, 11)]]);

      date1 = new Date(2014, 8, 1);
      date2 = new Date(1990, 10, 3);
      date3 = new Date(2111, 10, 3);

      expect(datepicker.isSelectable(date1)).toBe(true);
      expect(datepicker.isSelectable(date2)).toBe(false);
      expect(datepicker.isSelectable(date3)).toBe(false);
    });

    it('isSelected', function() {
      datepicker.setDate(new Date(2017, 2, 12));

      expect(datepicker.isSelected(new Date(2017, 2, 12))).toBe(true);
    });

    it('timePicker.setTime -> input text', function() {
      var input = document.createElement('input');

      datepicker.setInput(input);
      datepicker.setDateFormat('yyyyMMdd hh:mm A');
      datepicker.getTimePicker().setTime(12, 34);

      expect(input.value).toBe('20171127 12:34 PM');
    });

    it('addOpener', function() {
      var btn = document.createElement('BUTTON');

      datepicker.addOpener(btn);

      expect(inArray(btn, datepicker._openers)).not.toBe(-1);
    });

    it('removeOpener', function() {
      var btn = document.createElement('BUTTON');

      datepicker.addOpener(btn);
      datepicker.removeOpener(btn);

      expect(inArray(btn, datepicker._openers)).toBe(-1);
    });

    it('setRanges', function() {
      var start = new Date(2010, 10, 11);
      var end = new Date(2011, 10, 11);
      var prevModel = datepicker._rangeModel;
      var nextModel;

      expect(datepicker.isSelectable(start)).toBe(false);
      expect(datepicker.isSelectable(end)).toBe(false);

      datepicker.setRanges([[start, end]]);
      nextModel = datepicker._rangeModel;

      expect(prevModel).not.toBe(nextModel);
      expect(datepicker.isSelectable(start)).toBe(true);
      expect(datepicker.isSelectable(end)).toBe(true);
      expect(datepicker.getDate()).toBeNull();
    });

    it('addRange', function() {
      var start = new Date(2020, 0, 1);
      var end = new Date(2021, 1, 1);

      expect(datepicker.isSelectable(start)).toBe(false);
      expect(datepicker.isSelectable(end)).toBe(false);

      datepicker.addRange(start, end);

      expect(datepicker.isSelectable(start)).toBe(true);
      expect(datepicker.isSelectable(end)).toBe(true);
    });

    it('removeRange', function() {
      var start = new Date(2017, 0, 1);
      var end = new Date(2017, 1, 1);
      var removeStart = new Date(2017, 0, 5);
      var removeEnd = new Date(2017, 0, 20);

      datepicker.setRanges([[start, end]]);

      expect(datepicker.isSelectable(new Date(2017, 0, 5))).toBe(true);
      expect(datepicker.isSelectable(new Date(2017, 0, 7))).toBe(true);
      expect(datepicker.isSelectable(new Date(2017, 0, 20))).toBe(true);

      datepicker.removeRange(removeStart, removeEnd, 'date');

      expect(datepicker.isSelectable(new Date(2017, 0, 5))).toBe(false);
      expect(datepicker.isSelectable(new Date(2017, 0, 7))).toBe(false);
      expect(datepicker.isSelectable(new Date(2017, 0, 20))).toBe(false);
    });

    it('setInput - syncFromInput=false', function() {
      var input = document.createElement('input');
      datepicker.setDate(new Date(2017, 0, 1, 10, 10));

      datepicker.setInput(input, {
        format: 'yyyyMMdd'
      });

      expect(input.value).toBe('20170101');
    });

    it('setInput - syncFromInput=true with selectable input value', function() {
      var input = document.createElement('input');

      datepicker.setDate(new Date(2017, 0, 1, 10, 10));

      input.value = '20171111';
      datepicker.setInput(input, {
        format: 'yyyyMMdd',
        syncFromInput: true
      });

      expect(datepicker.getDate()).toEqual(new Date(2017, 10, 11));
    });

    it('setInput - syncFromInput=true with unselectable input value', function() {
      var input = document.createElement('input');

      datepicker.setDate(new Date(2017, 0, 1, 10, 10));

      input.value = '20200101';
      datepicker.setInput(input, {
        format: 'yyyyMMdd',
        syncFromInput: true
      });

      expect(input.value).toEqual('');
      expect(datepicker.getDate()).toBeNull();
    });

    it('disable', function() {
      var handler = jest.fn();
      var input = document.createElement('input');
      var opener = document.createElement('button');

      datepicker.setInput(input);
      datepicker.addOpener(opener);
      datepicker.on('open', handler);

      datepicker.disable();

      expect(input.disabled).toBe(true);
      expect(opener.disabled).toBe(true);

      datepicker.open();

      expect(handler).not.toHaveBeenCalled();
    });

    it('enable', function() {
      var handler = jest.fn();
      var input = document.createElement('input');
      var opener = document.createElement('button');

      datepicker.setInput(input);
      datepicker.addOpener(opener);
      datepicker.on('open', handler);

      datepicker.disable();
      datepicker.enable();

      expect(input.disabled).toBe(false);
      expect(opener.disabled).toBe(false);

      datepicker.open();

      expect(handler).toHaveBeenCalled();
    });

    it('findOverlappedRange', function() {
      var actual;

      datepicker.setRanges([
        [new Date(2016, 0, 1), new Date(2016, 1, 1)],
        [new Date(2016, 4, 1), new Date(2016, 5, 1)],
        [new Date(2017, 2, 1), new Date(2017, 3, 1)]
      ]);

      actual = datepicker.findOverlappedRange(new Date(2016, 4, 3), new Date(2017, 4, 20));
      expect(actual).toEqual([new Date(2016, 4, 1), new Date(2016, 5, 1)]);

      actual = datepicker.findOverlappedRange(new Date(2017, 0, 1), new Date(2017, 4, 20));
      expect(actual).toEqual([new Date(2017, 2, 1), new Date(2017, 3, 1)]);
    });

    it('"changeLanguage" should call the changeLanguage method of the calendar instance', function() {
      var calendar = datepicker.getCalendar();

      calendar.changeLanguage = jest.fn();

      datepicker.changeLanguage('ko');

      expect(calendar.changeLanguage).toHaveBeenCalled();
    });

    it('`locateTitle` should also be changed when you run `locateLanguage`', function() {
      datepicker.changeLanguage('ko');

      expect(datepicker._datepickerInput._titles).toBe(datepicker.getLocaleText().titles);
    });
  });

  describe('events - ', function() {
    var datepicker, input;

    beforeEach(function() {
      input = document.createElement('input');
      datepicker = new DatePicker(document.createElement('div'), {
        input: {
          element: input,
          format: 'yy년 MM월 dd일'
        },
        date: new Date(2015, 4, 10),
        selectableRanges: [[new Date(1994, 4, 9), new Date(2090, 4, 11)]]
      });
    });

    afterEach(function() {
      datepicker.destroy();
    });

    it('click-date event should change the date', function() {
      var td = document.createElement('td');
      var today = new Date();

      addClass(td, CLASS_NAME_SELECTABLE);
      setData(td, 'timestamp', today.setHours(0, 0, 0, 0)); // Calendar-date does not have hours
      document.body.appendChild(td);

      datepicker._onClickHandler({
        target: td,
        preventDefault: jest.fn()
      });

      expect(datepicker.getDate().getTime()).toEqual(today.setHours(0, 0, 0, 0));
    });

    it('_onChangeInput', function() {
      input.value = '20170203';
      datepicker._onChangeInput();

      expect(datepicker.getDate().getTime()).toEqual(new Date(2017, 1, 3).getTime());
      expect(input.value).toBe('17년 02월 03일');
    });

    it('mousedown-document event should call "close" when showAlways=false', function() {
      datepicker.close = jest.fn();

      datepicker.showAlways = false;
      datepicker.open();
      datepicker._onMousedownDocument({
        target: document
      });

      expect(datepicker.close).toHaveBeenCalled();
    });

    it('mousedown-document event should not call "close" when showAlways=true', function() {
      datepicker.close = jest.fn();
      datepicker.showAlways = true;
      datepicker.open();
      datepicker._onMousedownDocument({
        target: document
      });

      expect(datepicker.close).not.toHaveBeenCalled();
    });

    it('click-date event should call "close" when autoClose=true', function() {
      var el = document.createElement('td');
      addClass(el, CLASS_NAME_SELECTABLE);
      setData(el, 'timestamp', new Date(2017, 0, 1).getTime());
      document.body.appendChild(el);

      datepicker.close = jest.fn();
      datepicker.autoClose = true;
      datepicker.open();
      datepicker._onClickHandler({
        target: el,
        preventDefault: jest.fn()
      });

      expect(datepicker.close).toHaveBeenCalled();
    });

    it('click-date event should not call "close" when autoClose=false', function() {
      var el = document.createElement('td');
      addClass(el, CLASS_NAME_SELECTABLE);
      setData(el, 'timestamp', new Date(2017, 0, 1).getTime());

      datepicker.close = jest.fn();
      datepicker.autoClose = false;
      datepicker.open();
      datepicker._onClickHandler({
        target: el,
        preventDefault: jest.fn()
      });

      expect(datepicker.close).not.toHaveBeenCalled();
    });
  });

  describe('changing ranges - ', function() {
    var datepicker, container, input;

    beforeEach(function() {
      container = document.createElement('div');
      input = document.createElement('input');
      datepicker = new DatePicker(container, {
        date: new Date(2017, 0, 1),
        input: {
          element: input
        },
        selectableRanges: [[new Date(2016, 0, 1), new Date(2018, 0, 1)]]
      });
    });

    afterEach(function() {
      datepicker.destroy();
      input = null;
      container = null;
      datepicker = null;
    });

    it('should not change current date when selectable after "setRanges"', function() {
      var prevInputValue = input.value;

      datepicker.setRanges([[new Date(2016, 0, 1), new Date(2017, 11, 1)]]);

      expect(datepicker.getDate()).toEqual(new Date(2017, 0, 1));
      expect(input.value).toBe(prevInputValue);
    });

    it('shuold not change current date when selectable after "removeRange"', function() {
      var prevInputValue = input.value;

      datepicker.removeRange(new Date(2016, 11, 1), new Date(2016, 11, 31), 'date');

      expect(datepicker.getDate()).toEqual(new Date(2017, 0, 1));
      expect(input.value).toBe(prevInputValue);
    });

    it('should set current-date to null when unselectable after "setRanges"', function() {
      datepicker.setRanges([[new Date(2016, 0, 1), new Date(2016, 11, 1)]]);

      expect(datepicker.getDate()).toBeNull();
      expect(input.value).toBe('');
    });

    it('should set current-date to null when unselectable after "removeRanges"', function() {
      datepicker.removeRange(new Date(2016, 11, 1), new Date(2017, 1, 1));

      expect(datepicker.getDate()).toBeNull();
      expect(input.value).toBe('');
    });

    it('should change (unselectable)calendar-date to minimum-selectable after "setRanges"', function() {
      datepicker.setRanges([[new Date(2015, 0, 1), new Date(2016, 0, 1)]]);
      expect(datepicker.getCalendar().getDate()).toEqual(new Date(2015, 0, 1));
    });

    it('should not change (selectable)calendar-date when selectable after "setRanges"', function() {
      datepicker.setDate(new Date(2017, 5, 1));
      datepicker.setRanges([[new Date(2017, 0, 1), new Date(2018, 0, 1)]]);

      expect(datepicker.getCalendar().getDate()).toEqual(new Date(2017, 5, 1));
    });
  });

  describe('about useless-buttons', function() {
    var datepicker, container;

    function isHidden(el) {
      // eslint-disable-line
      return hasClass(el, CLASS_NAME_HIDDEN);
    }

    beforeEach(function() {
      container = document.createElement('div');
      datepicker = new DatePicker(container, {
        date: new Date(2017, 6, 1),
        calendar: {
          showJumpButtons: true
        },
        selectableRanges: [[new Date(2016, 4, 1), new Date(2018, 4, 1)]]
      });
    });

    afterEach(function() {
      datepicker.destroy();
      removeElement(container);
      container = null;
    });

    it('should hide the prev-year-btn out of selectables', function() {
      var btn = container.querySelector('.' + constants.CLASS_NAME_PREV_YEAR_BTN);
      expect(isHidden(btn)).toBe(false);

      datepicker.setDate(new Date(2017, 3, 1));

      btn = container.querySelector('.' + constants.CLASS_NAME_PREV_YEAR_BTN);
      expect(isHidden(btn)).toBe(true);
    });

    it('should hide the prev-month-btn out of selectables', function() {
      var btn = container.querySelector('.' + constants.CLASS_NAME_PREV_MONTH_BTN);
      expect(isHidden(btn)).toBe(false);

      datepicker.setDate(new Date(2016, 4, 3));

      btn = container.querySelector('.' + constants.CLASS_NAME_PREV_MONTH_BTN);
      expect(isHidden(btn)).toBe(true);
    });

    it('should hide the next-year-btn out of selectables', function() {
      var btn;
      datepicker.setDate(new Date(2017, 4, 3));

      btn = container.querySelector('.' + constants.CLASS_NAME_NEXT_YEAR_BTN);
      expect(isHidden(btn)).toBe(false);

      datepicker.setDate(new Date(2017, 5, 3));

      btn = container.querySelector('.' + constants.CLASS_NAME_NEXT_YEAR_BTN);
      expect(isHidden(btn)).toBe(true);
    });

    it('should hide the next-month-btn out of selectables', function() {
      var btn = container.querySelector('.' + constants.CLASS_NAME_NEXT_MONTH_BTN);
      expect(isHidden(btn)).toBe(false);

      datepicker.setDate(new Date(2018, 4, 1));

      btn = container.querySelector('.' + constants.CLASS_NAME_NEXT_MONTH_BTN);
      expect(isHidden(btn)).toBe(true);
    });

    it('should not hide next/prev-year-btn when equals to selectables minimum/maximum', function() {
      var btn;
      datepicker.setRanges([[new Date(2015, 0, 1), new Date(2017, 0, 1)]]);
      datepicker.setDate(new Date(2016, 0, 1));

      btn = container.querySelector('.' + constants.CLASS_NAME_NEXT_YEAR_BTN);
      expect(isHidden(btn)).toBe(false);

      btn = container.querySelector('.' + constants.CLASS_NAME_PREV_YEAR_BTN);
      expect(isHidden(btn)).toBe(false);
    });
  });
});
