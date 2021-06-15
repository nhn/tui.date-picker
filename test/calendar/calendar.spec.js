/**
 * @fileoverview Calendar spec
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */
'use strict';

var Calendar = require('../../src/js/calendar');
var util = require('../../src/js/util');

describe('Calendar', function() {
  describe('Api', function() {
    var container = document.createElement('div');
    var calendar;

    beforeEach(function() {
      calendar = new Calendar(container);
    });

    afterEach(function() {
      calendar.destroy();
    });

    it('"getDate" should return date instance', function() {
      var date = calendar.getDate();

      expect(date).toEqual(expect.any(Date));
    });

    it('"getNextDate" should return next date', function() {
      var currentDate = calendar.getDate();

      // date calendar
      expect(calendar.getNextDate()).toEqual(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
      );

      calendar.draw({
        type: 'month'
      });

      // month calendar
      expect(calendar.getNextDate()).toEqual(
        new Date(currentDate.getFullYear() + 1, currentDate.getMonth())
      );

      calendar.draw({
        type: 'year'
      });

      // year calendar
      expect(calendar.getNextDate()).toEqual(
        new Date(currentDate.getFullYear() + 9, currentDate.getMonth())
      );
    });

    it('"getPrevDate" should return next date', function() {
      var currentDate = calendar.getDate();

      // date calendar
      expect(calendar.getPrevDate()).toEqual(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
      );

      calendar.draw({
        type: 'month'
      });

      // month calendar
      expect(calendar.getPrevDate()).toEqual(
        new Date(currentDate.getFullYear() - 1, currentDate.getMonth())
      );

      calendar.draw({
        type: 'year'
      });

      // year calendar
      expect(calendar.getPrevDate()).toEqual(
        new Date(currentDate.getFullYear() - 9, currentDate.getMonth())
      );
    });

    it('"getType" should return current type', function() {
      expect(calendar.getType()).toBe('date');

      calendar.draw({
        type: 'month'
      });
      expect(calendar.getType()).toBe('month');

      calendar.draw({
        type: 'year'
      });
      expect(calendar.getType()).toBe('year');
    });

    it('"draw" with new date should render new calendar', function() {
      var newDate = new Date(2016, 0);

      calendar.draw({
        date: newDate,
        type: 'month'
      });

      expect(calendar.getDate().getFullYear()).toBe(newDate.getFullYear());
      expect(calendar.getDate().getMonth()).toBe(newDate.getMonth());
      expect(calendar.getType()).toBe('month');
    });

    it('"draw" should throw error if get invalid type', function() {
      // eslint-disable-next-line max-nested-callbacks
      expect(function() {
        calendar.draw({
          type: 'invalid'
        });
      }).toThrow();
    });

    it('"drawNext" should draw next date', function() {
      calendar.draw({
        date: new Date(2016, 0),
        type: 'date'
      });
      calendar.drawNext();

      expect(calendar.getDate().getFullYear()).toBe(2016);
      expect(calendar.getDate().getMonth()).toBe(1);

      calendar.draw({
        date: new Date(2016, 0),
        type: 'month'
      });
      calendar.drawNext();

      expect(calendar.getDate().getFullYear()).toBe(2017);
      expect(calendar.getDate().getMonth()).toBe(0);

      calendar.draw({
        date: new Date(2016, 0),
        type: 'year'
      });
      calendar.drawNext();

      expect(calendar.getDate().getFullYear()).toBe(2025);
      expect(calendar.getDate().getMonth()).toBe(0);
    });

    it('"drawPrev" should draw prev date', function() {
      calendar.draw({
        date: new Date(2016, 0),
        type: 'date'
      });
      calendar.drawPrev();

      expect(calendar.getDate().getFullYear()).toBe(2015);
      expect(calendar.getDate().getMonth()).toBe(11);

      calendar.draw({
        date: new Date(2016, 0),
        type: 'month'
      });
      calendar.drawPrev();

      expect(calendar.getDate().getFullYear()).toBe(2015);
      expect(calendar.getDate().getMonth()).toBe(0);

      calendar.draw({
        date: new Date(2016, 0),
        type: 'year'
      });
      calendar.drawPrev();

      expect(calendar.getDate().getFullYear()).toBe(2007);
      expect(calendar.getDate().getMonth()).toBe(0);
    });

    it('"getDateElements" should return HTML elements', function() {
      var dateElements;

      calendar.draw({
        date: new Date(2017, 0),
        type: 'date'
      });

      dateElements = calendar.getDateElements();

      expect(dateElements.length).toBe(42);
    });

    it('"changeLanguage" should change header,body and rerender', function() {
      calendar._header.changeLanguage = jest.fn();
      calendar._body.changeLanguage = jest.fn();
      calendar._render = jest.fn();

      calendar.changeLanguage('ko');

      expect(calendar._header.changeLanguage).toHaveBeenCalledWith('ko');
      expect(calendar._body.changeLanguage).toHaveBeenCalledWith('ko');
      expect(calendar._render).toHaveBeenCalled();
    });

    it('"destory" should destory', function() {
      var nContainer = document.createElement('div');
      var nCalendar = new Calendar(nContainer);

      nCalendar.destroy();

      expect(nContainer.children.length).toBe(0);
      expect(nCalendar._header).toBeNull();
      expect(nCalendar._body).toBeNull();
    });
  });

  describe('usageStatistics', function() {
    var nCalendar;
    it('should send hostname by default', function() {
      util.sendHostName = jest.fn();

      nCalendar = new Calendar(document.createElement('div'));

      expect(util.sendHostName).toHaveBeenCalled();
    });

    it('should not send hostname on usageStatistics option false', function() {
      util.sendHostName = jest.fn();

      nCalendar = new Calendar(document.createElement('div'), { usageStatistics: false });

      expect(util.sendHostName).not.toHaveBeenCalled();
    });

    afterEach(function() {
      nCalendar.destroy();
    });
  });
});
