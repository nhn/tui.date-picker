/**
 * @fileoverview Datepicker spec
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Datepicker = require('../../src/js/datepicker');
var Calendar = require('../../src/js/calendar');
var Timepicker = require('../../src/js/timepicker');
var constants = require('../../src/js/constants');

describe('Date Picker', function() {
    describe('date=null on constructor', function() {
        var datepicker, input, container;

        beforeEach(function() {
            container = document.createElement('div');
            input = document.createElement('input');
            datepicker = new Datepicker(container, {
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
            expect(input.value).toEqual('');
            expect(datepicker.getDate()).toBeNull();
        });

        it('should open today calendar', function() {
            var calendarDate;

            datepicker.open();
            calendarDate = datepicker.getCalendar().getDate();

            expect(calendarDate.setHours(0, 0, 0, 0)).toEqual(new Date().setHours(0, 0, 0, 0));
        });

        it('should set new date if selectable', function() {
            datepicker.setDate(new Date(2016, 11, 3));

            expect(datepicker.getDate()).toEqual(new Date(2016, 11, 3));
        });
    });

    describe('apis - ', function() {
        var datepicker;

        beforeEach(function() {
            datepicker = new Datepicker($('<div></div>'), {
                date: new Date(2014, 10, 27),
                selectableRanges: [
                    [new Date(2013, 10, 27), new Date(2015, 10, 27)]
                ],
                openers: [
                    document.createElement('button')
                ],
                timepicker: {
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
            expect(input.value).toEqual('');
        });

        it('open', function() {
            datepicker.open();

            expect(datepicker.isOpened()).toEqual(true);
        });

        it('close', function() {
            datepicker.open();
            datepicker.close();

            expect(datepicker.isOpened()).toEqual(false);
        });

        it('getDate', function() {
            var date = datepicker.getDate();

            expect(date).toEqual(new Date(2014, 10, 27));
        });

        it('getTimepicker', function() {
            expect(datepicker.getTimepicker()).toEqual(jasmine.any(Timepicker));
        });

        it('getCalendar', function() {
            expect(datepicker.getCalendar()).toEqual(jasmine.any(Calendar));
        });

        it('setDate', function() {
            datepicker.setDate(new Date(2014, 2, 12));

            expect(datepicker.getDate()).toEqual(new Date(2014, 2, 12));

            datepicker.setDate();

            expect(datepicker.getDate()).toEqual(new Date(2014, 2, 12));
        });

        it('isSelectable', function() {
            datepicker.setRanges([
                [new Date(1994, 4, 9), new Date(2090, 4, 11)]
            ]);

            var date1 = new Date(2014, 8, 1);
            var date2 = new Date(1990, 10, 3);
            var date3 = new Date(2111, 10, 3);

            expect(datepicker.isSelectable(date1)).toEqual(true);
            expect(datepicker.isSelectable(date2)).toEqual(false);
            expect(datepicker.isSelectable(date3)).toEqual(false);
        });

        it('isSelected', function() {
            datepicker.setDate(new Date(2014, 2, 12));

            expect(datepicker.isSelected(new Date(2014, 2, 12))).toBe(true);
        });

        it('timepicker.setTime -> input text', function() {
            var input = document.createElement('input');

            datepicker.setInput(input);
            datepicker.setDateFormat('yyyyMMdd hh:mm A');
            datepicker.getTimepicker().setTime(12, 34);

            expect(input.value).toEqual('20141127 12:34 PM');
        });

        it('addOpener', function() {
            var btn = document.createElement('BUTTON');

            datepicker.addOpener(btn);

            expect(tui.util.inArray(btn, datepicker._openers)).not.toEqual(-1);
        });

        it('removeOpener', function() {
            var btn = document.createElement('BUTTON');

            datepicker.addOpener(btn);
            datepicker.removeOpener(btn);

            expect(tui.util.inArray(btn, datepicker._openers)).toEqual(-1);
        });

        it('setRanges', function() {
            var start = new Date(2016, 10, 11);
            var end = new Date(2017, 10, 11);
            var prevModel = datepicker._rangeModel;
            var nextModel;

            expect(datepicker.isSelectable(start)).toBe(false);
            expect(datepicker.isSelectable(end)).toBe(false);

            datepicker.setRanges([
                [start, end]
            ]);
            nextModel = datepicker._rangeModel;

            expect(prevModel).not.toBe(nextModel);
            expect(datepicker.isSelectable(start)).toBe(true);
            expect(datepicker.isSelectable(end)).toBe(true);
        });

        it('addRange', function() {
            var start = new Date(2017, 0, 1);
            var end = new Date(2017, 1, 1);

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

            datepicker.setRanges([
                [start, end]
            ]);

            expect(datepicker.isSelectable(new Date(2017, 0, 5))).toBe(true);
            expect(datepicker.isSelectable(new Date(2017, 0, 7))).toBe(true);
            expect(datepicker.isSelectable(new Date(2017, 0, 20))).toBe(true);

            datepicker.removeRange(removeStart, removeEnd);

            expect(datepicker.isSelectable(new Date(2017, 0, 5))).toBe(false);
            expect(datepicker.isSelectable(new Date(2017, 0, 7))).toBe(false);
            expect(datepicker.isSelectable(new Date(2017, 0, 20))).toBe(false);
        });

        it('disable', function() {
            var handler = jasmine.createSpy('custom event handler');
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
            var handler = jasmine.createSpy('custom event handler');
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
    });

    describe('events - ', function() {
        var datepicker, input;

        beforeEach(function() {
            input = document.createElement('input');
            datepicker = new Datepicker($('<div></div>'), {
                input: {
                    element: input,
                    format: 'yy년 MM월 dd일'
                },
                date: new Date(2015, 4 ,10),
                selectableRanges: [
                    [new Date(1994, 4, 9), new Date(2090, 4, 11)]
                ]
            });
        });

        afterEach(function() {
            datepicker.destroy();
        });

        it('_onClickDate', function() {
            var td = document.createElement('td');
            var ev = {
                target: td
            };
            var today = new Date();
            $(td).data('timestamp', today.setHours(0, 0, 0, 0)); // Calendar-date does not have hours
            datepicker._onClickDate(ev);

            expect(datepicker.getDate().getTime()).toEqual(today.setHours(0, 0, 0, 0));
        });

        it('_onChangeInput', function() {
            input.value = '20170203';
            datepicker._onChangeInput();

            expect(datepicker.getDate().getTime()).toEqual(new Date(2017, 1, 3).getTime());
            expect(input.value).toEqual('17년 02월 03일');
        });

        it('click-opener event should call "toggle"', function() {
            var opener = document.createElement('button');

            spyOn(datepicker, 'toggle');
            datepicker.addOpener(opener);
            $(opener).click();

            expect(datepicker.toggle).toHaveBeenCalled();
        });

        it('mousedown-document event should call "close" when showAlways=false', function() {
            spyOn(datepicker, 'close');
            datepicker.showAlways = false;
            datepicker.open();
            $(document).mousedown();

            expect(datepicker.close).toHaveBeenCalled();
        });

        it('mousedown-document event should not call "close" when showAlways=true', function() {
            spyOn(datepicker, 'close');
            datepicker.showAlways = true;
            datepicker.open();
            $(document).mousedown();

            expect(datepicker.close).not.toHaveBeenCalled();
        });

        it('click-date event should call "close" when autoClose=true', function() {
            var $el = $('<td data-timestamp="' + new Date(2017, 0, 1).getTime() + '"></td>');

            spyOn(datepicker, 'close');
            datepicker.autoClose = true;
            datepicker.open();
            datepicker._onClickDate({
                target: $el[0]
            });

            expect(datepicker.close).toHaveBeenCalled();
        });

        it('click-date event should not call "close" when autoClose=false', function() {
            var $el = $('<td data-timestamp="' + new Date(2017, 0, 1).getTime() + '"></td>');

            spyOn(datepicker, 'close');
            datepicker.autoClose = false;
            datepicker.open();
            datepicker._onClickDate({
                target: $el[0]
            });

            expect(datepicker.close).not.toHaveBeenCalled();
        });
    });

    describe('should refersh date & input', function() {
        var datepicker, container, input;

        beforeEach(function() {
            container = document.createElement('div');
            input = document.createElement('input');
            datepicker = new Datepicker(container, {
                date: new Date(2017, 0, 1),
                input: {
                    element: input
                },
                selectableRanges: [
                    [new Date(2016, 0, 1), new Date(2018, 0, 1)]
                ]
            });
        });

        afterEach(function() {
            datepicker.destroy();
            input = null;
            container = null;
        });

        it('with no change from "setRanges" containing current date', function() {
            var prevInputValue = input.value;

            datepicker.setRanges([
                [new Date(2016, 0, 1), new Date(2017, 11, 1)]
            ]);

            expect(datepicker.getDate()).toEqual(new Date(2017, 0, 1));
            expect(input.value).toEqual(prevInputValue);
        });

        it('with no change from "removeRange" excepting current date', function() {
            var prevInputValue = input.value;

            datepicker.removeRange(new Date(2016, 11, 1), new Date(2016, 11, 31));

            expect(datepicker.getDate()).toEqual(new Date(2017, 0, 1));
            expect(input.value).toEqual(prevInputValue);
        });

        it('to null from "setRanges" excepting current date', function() {
            datepicker.setRanges([
                [new Date(2016, 0, 1), new Date(2016, 11, 1)]
            ]);

            expect(datepicker.getDate()).toBeNull();
            expect(input.value).toEqual('');
        });

        it('to null from "removeRange" containing current date', function() {
            datepicker.removeRange(new Date(2016, 11, 1), new Date(2017, 1, 1));

            expect(datepicker.getDate()).toBeNull();
            expect(input.value).toEqual('');
        });
    });

    describe('about useless-buttons', function() {
        var datepicker, $container;

        function isHidden($el) {
            return $el.css('display') === 'none';
        }

        beforeEach(function() {
            $container = $('<div></div>');
            datepicker = new Datepicker($container, {
                date: new Date(2017, 6, 1),
                calendar: {
                    showJumpButtons: true
                },
                selectableRanges: [
                    [new Date(2016, 4, 1), new Date(2018, 4, 1)]
                ]
            });
        });

        afterEach(function() {
            datepicker.destroy();
            $container.remove();
            $container = null;
        });

        it('should hide the prev-year-btn out of selectables', function() {
            var $btn = $container.find('.' + constants.CLASS_NAME_PREV_YEAR_BTN);
            expect(isHidden($btn)).toBe(false);

            datepicker.setDate(new Date(2017, 3, 1));

            $btn = $container.find('.' + constants.CLASS_NAME_PREV_YEAR_BTN);
            expect(isHidden($btn)).toBe(true);
        });

        it('should hide the prev-month-btn out of selectables', function() {
            var $btn = $container.find('.' + constants.CLASS_NAME_PREV_MONTH_BTN);
            expect(isHidden($btn)).toBe(false);

            datepicker.setDate(new Date(2016, 4, 3));

            $btn = $container.find('.' + constants.CLASS_NAME_PREV_MONTH_BTN);
            expect(isHidden($btn)).toBe(true);
        });

        it('should hide the next-year-btn out of selectables', function() {
            var $btn;
            datepicker.setDate(new Date(2017, 4, 3));

            $btn = $container.find('.' + constants.CLASS_NAME_NEXT_YEAR_BTN);
            expect(isHidden($btn)).toBe(false);

            datepicker.setDate(new Date(2017, 5, 3));

            $btn = $container.find('.' + constants.CLASS_NAME_NEXT_YEAR_BTN);
            expect(isHidden($btn)).toBe(true);
        });

        it('should hide the next-month-btn out of selectables', function() {
            var $btn = $container.find('.' + constants.CLASS_NAME_NEXT_MONTH_BTN);
            expect(isHidden($btn)).toBe(false);

            datepicker.setDate(new Date(2018, 4, 1));

            $btn = $container.find('.' + constants.CLASS_NAME_NEXT_MONTH_BTN);
            expect(isHidden($btn)).toBe(true);
        });
    });
});
