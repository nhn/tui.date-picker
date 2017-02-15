/**
 * @fileoverview Selectbox spec
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */
'use strict';

var Selectbox = require('../../src/js/timepicker/selectbox');

describe('Timepicker - Selectbox', function() {
    var $container = $('<div></div>');
    var selectbox;

    beforeEach(function() {
        selectbox = new Selectbox($container, {
            initialValue: 4,
            items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        });
    });

    afterEach(function() {
        selectbox.destroy();
    });

    describe('initialization', function() {
        it('should set index of initial value', function() {
            var selectedIndex = selectbox._selectedIndex;

            expect(selectedIndex).toEqual(3);
        });
    });

    describe('api', function() {
        it('"getValue" should return value', function() {
            expect(selectbox.getValue()).toBe(4);
        });

        it('"setValue" should set value to input', function() {
            selectbox.setValue(8);
            expect(selectbox._$element.val()).toBe('8');
            expect(selectbox.getValue()).toBe(8);
        });

        it('"setValue" should not change if the value is invalid', function() {
            selectbox.setValue(11111111);
            expect(selectbox._$element.val()).toBe('4');
            expect(selectbox.getValue()).toBe(4);
        });
    });

    describe('custom event', function() {
        it('should fire change event when the value is changed', function() {
            var spy = jasmine.createSpy();
            selectbox.on('change', spy);

            selectbox.setValue(10);
            expect(spy).toHaveBeenCalledWith({
                value: 10
            });
        });
    });
});
