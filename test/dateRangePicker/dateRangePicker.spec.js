/**
 * @fileoverview DateRangePicker specs
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */
'use strict';

var DatePicker = require('../../src/js/datepicker');
var DateRangePicker = require('../../src/js/dateRangePicker');

var rangedHours = [
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false }
];

var rangedMins = [
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: true },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false },
  { disabled: false }
];

describe('DateRangePicker', function() {
  var picker, startpickerInput, endpickerInput, startpickerContainer, endpickerContainer;

  beforeEach(function() {
    startpickerInput = document.createElement('input');
    endpickerInput = document.createElement('input');
    startpickerContainer = document.createElement('div');
    endpickerContainer = document.createElement('div');

    picker = new DateRangePicker({
      startpicker: {
        date: new Date(2017, 0, 1),
        input: startpickerInput,
        container: startpickerContainer
      },
      endpicker: {
        date: new Date(2017, 0, 15),
        input: endpickerInput,
        container: endpickerContainer
      },
      selectableRanges: [[new Date(2017, 0, 1), new Date(2017, 1, 3)]]
    });
  });

  afterEach(function() {
    picker.destroy();
    picker = startpickerContainer = startpickerInput = endpickerContainer = endpickerInput = null;
  });

  it('"changeLanguage" should call the changeLanguage method of the datePicker instance', function() {
    picker._startpicker.changeLanguage = jest.fn();
    picker._endpicker.changeLanguage = jest.fn();

    picker.changeLanguage('ko');

    expect(picker.getStartpicker().changeLanguage).toHaveBeenCalled();
    expect(picker.getEndpicker().changeLanguage).toHaveBeenCalled();
  });

  it('should create two datepickers', function() {
    expect(picker.getStartpicker()).toEqual(expect.any(DatePicker));
    expect(picker.getEndpicker()).toEqual(expect.any(DatePicker));
  });

  it('should set start-date', function() {
    picker.setStartDate(new Date(2017, 0, 10));

    expect(picker.getStartDate()).toEqual(new Date(2017, 0, 10));
  });

  it('should set end-date', function() {
    picker.setEndDate(new Date(2017, 0, 5));

    expect(picker.getEndDate()).toEqual(new Date(2017, 0, 5));
  });

  it('should set null to end-date when changing start-date to a later date than end-date', function() {
    picker.setStartDate(new Date(2017, 0, 20));

    expect(picker.getEndDate()).toBeNull();
  });

  it('should not set end-date which is earlier than start-date', function() {
    var prevEndDate = picker.getEndDate();

    picker.setStartDate(new Date(2017, 0, 10));
    picker.setEndDate(new Date(2017, 0, 2));

    expect(picker.getEndDate()).toEqual(prevEndDate);
  });

  it('should fire "change:start" when changing start-date', function() {
    var spy = jest.fn();

    picker.on('change:start', spy);
    picker.setStartDate(new Date(2017, 0, 4));

    expect(spy).toHaveBeenCalled();
  });

  it('should fire "change:end" when changing end-date', function() {
    var spy = jest.fn();
    picker.on('change:end', spy);
    picker.setEndDate(new Date(2017, 0, 4));

    expect(spy).toHaveBeenCalled();
  });

  it('should (re)set ranges', function() {
    picker.setRanges([[new Date(2018, 0, 1), new Date(2019, 0, 1)]]);

    expect(picker.getStartDate()).toBeNull();
    expect(picker.getEndDate()).toBeNull();

    picker.setStartDate(new Date(2018, 0, 1));

    expect(picker.getStartDate()).toEqual(new Date(2018, 0, 1));
  });

  it('should set hour range on endpicker', function() {
    var date = new Date(2021, 1, 1, 9, 30);
    var hourSelect;

    picker = new DateRangePicker({
      startpicker: {
        input: startpickerInput,
        container: startpickerContainer
      },
      endpicker: {
        date: new Date(),
        input: endpickerInput,
        container: endpickerContainer
      },
      timePicker: { showMeridiem: false }
    });

    picker.setStartDate(date);
    picker.setEndDate(date);

    hourSelect = Array.from(endpickerContainer.querySelectorAll('.tui-timepicker-hour option'));

    expect(hourSelect).toMatchObject(rangedHours);
  });

  it('should set minute range on endpicker', function() {
    var date = new Date(2021, 1, 1, 9, 30);
    var minuteSelect;

    picker = new DateRangePicker({
      startpicker: {
        input: startpickerInput,
        container: startpickerContainer
      },
      endpicker: {
        date: new Date(),
        input: endpickerInput,
        container: endpickerContainer
      },
      timePicker: { showMeridiem: false }
    });

    picker.setStartDate(date);
    picker.setEndDate(date);

    minuteSelect = Array.from(endpickerContainer.querySelectorAll('.tui-timepicker-minute option'));

    expect(minuteSelect).toMatchObject(rangedMins);
  });

  it('should disable endpicker with null when initial start-date is null', function() {
    picker = new DateRangePicker({
      startpicker: {
        input: startpickerInput,
        container: startpickerContainer
      },
      endpicker: {
        date: new Date(),
        input: endpickerInput,
        container: endpickerContainer
      }
    });

    expect(picker.getEndpicker().isDisabled()).toBe(true);
    expect(picker.getEndDate()).toBeNull();
  });
});
