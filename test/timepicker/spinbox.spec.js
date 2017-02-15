/**
 * @fileoverview Spinbox spec
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */
'use strict';

var Spinbox = require('../../src/js/timepicker/spinbox');

/**
 * Class names
 * @see Spinbox
 */
var CLASS_NAME_UP_BUTTON = 'tui-timepicker-btn-up';
var CLASS_NAME_DOWN_BUTTON = 'tui-timepicker-btn-down';

describe('Timepicker - Spinbox', function() {
    var $container = $('<div></div>');
    var spinbox;

    beforeEach(function() {
        spinbox = new Spinbox($container, {
            initialValue: 4,
            items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        });
    });

    afterEach(function() {
        spinbox.destroy();
    });

    describe('initialization', function() {
        it('should set input attr - size, maxlength', function() {
            var $inputEl = spinbox._$inputElement;

            expect($inputEl.attr('size')).toEqual('2');
            expect($inputEl.attr('maxlength')).toEqual('2');
        });
    });

    describe('api', function() {
        it('"getValue" should return value', function() {
            expect(spinbox.getValue()).toBe(4);
        });

        it('"setValue" should set value to input', function() {
            spinbox.setValue(8);
            expect(spinbox._$inputElement.val()).toBe('8');
            expect(spinbox.getValue()).toBe(8);
        });

        it('"setValue" should not change if the value is invalid', function() {
            spinbox.setValue(11111111);
            expect(spinbox._$inputElement.val()).toBe('4');
            expect(spinbox.getValue()).toBe(4);
        });
    });

    describe('user interaction', function() {
        it('should increase value when click the up-button', function() {
            $container.find('.' + CLASS_NAME_UP_BUTTON).click();

            expect(spinbox.getValue()).toEqual(5);
        });

        it('should decrease value when click the down-button', function() {
            $container.find('.' + CLASS_NAME_DOWN_BUTTON).click();

            expect(spinbox.getValue()).toEqual(3);
        });

        it('should set max if next value is lower than min', function() {
            spinbox.setValue(1);
            $container.find('.' + CLASS_NAME_DOWN_BUTTON).click();

            expect(spinbox.getValue()).toEqual(10);
        });

        it('should set min if next value is upper than max', function() {
            spinbox.setValue(10);
            $container.find('.' + CLASS_NAME_UP_BUTTON).click();

            expect(spinbox.getValue()).toEqual(1);
        });

        it('should increase value when the up-arrow key key-down', function() {
            var ev = $.Event('keydown');

            ev.which = 38;  // up-arrow;
            spinbox._$inputElement.trigger(ev);

            expect(spinbox.getValue()).toEqual(5);
        });

        it('should decrease value when the down-arrow key-down', function() {
            var ev = $.Event('keydown');

            ev.which = 40;  // down-arrow;
            spinbox._$inputElement.trigger(ev);

            expect(spinbox.getValue()).toEqual(3);
        });
    });

    describe('custom event', function() {
        it('should fire change event when the value is changed', function() {
            var spy = jasmine.createSpy();
            spinbox.on('change', spy);

            spinbox.setValue(10);
            expect(spy).toHaveBeenCalledWith({
                value: 10
            });
        });

        it('should fire change event from key-down', function() {
            var ev = $.Event('keydown');
            var spy = jasmine.createSpy();
            spinbox.on('change', spy);

            ev.which = 40;  // down-arrow;
            spinbox._$inputElement.trigger(ev);

            expect(spy).toHaveBeenCalledWith({
                value: 3
            });

            ev.which = 38; // up-arrow;
            spinbox._$inputElement.trigger(ev);
            expect(spy).toHaveBeenCalledWith({
                value: 4
            });
        });
    });
});
