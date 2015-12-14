/**
 * Created by nhnent on 15. 4. 28..
 */
var Spinbox = require('../src/spinbox');
/**
 * @todo refactoring
 */
describe('Spinbox', function() {

    jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

    var spinbox,
        spinboxWithOption;

    beforeEach(function() {
        jasmine.getFixtures().cleanUp();
        loadFixtures('spinbox.html');

        spinbox = new Spinbox('#spinbox-default');
        spinboxWithOption = new Spinbox('#spinbox-with-option', {
            defaultValue: 0,
            step: 2,
            min: 0,
            max: 59,
            exclusion: [],
            upBtnTag: '<button class="btn-lg">+</button>',
            downBtnTag: '<button class="btn-lg">-</button>'
        });
    });

    describe('constructor', function () {
        it('spinbox is created by constructor with default option', function () {
            expect(spinbox).toBeDefined();
        });

        it('spinbox is created by constructor with custom option', function () {
            var $container = spinboxWithOption._$containerElement;

            expect(spinboxWithOption).toBeDefined();
            expect($container.find('button').hasClass('btn-lg')).toEqual(true);
        });

        it('created spinbox with invalid option, error will occurs', function() {
            function optionError() {
                new Spinbox('#spinbox-default', {
                    defaultValue: 'aaa',
                    step: 10,
                    min: 10,
                    max: 5
                });
            }
            expect(optionError).toThrowError();
        });
    });

    describe('input text element size', function() {
        it('if input element has no size/maxlength attributes,' +
            ' size will be 16 (= Number.MAX_SAFE_INTEGER.length)', function() {
            var $inputEl = spinbox._$inputElement,
                expectedSize = String(-9007199254740991).length;

            expect($inputEl.attr('size')).toEqual(String(expectedSize));
            expect($inputEl.attr('maxlength')).toEqual(String(expectedSize));
        });

        it('when input element has "size" or "maxlength" attributes', function() {
            var $inputEl = spinboxWithOption._$inputElement,
                expectedSize = '2';

            expect($inputEl.attr('size')).toEqual(expectedSize);
            expect($inputEl.attr('maxlength')).toEqual(expectedSize);
        });
    });

    describe('value getter/setter', function() {
        it('set value to input element', function() {
            spinbox.setValue(0);
            spinboxWithOption.setValue(10);

            expect(spinbox._$inputElement.val()).toEqual('0');
            expect(spinboxWithOption._$inputElement.val()).toEqual('10');
        });

        it('get value from input element', function() {
            var realValue;

            realValue = spinbox._$inputElement.val();
            realValue = parseInt(realValue, 10);
            expect(spinbox.getValue()).toEqual(realValue);

            realValue = spinboxWithOption._$inputElement.val();
            realValue = parseInt(realValue, 10);
            expect(spinbox.getValue()).toEqual(realValue);
        });

        it('set invalid value, value will not change', function() {
            var originValue = spinbox.getValue();

            spinbox.setValue('aaa');
            expect(spinbox.getValue()).toEqual(originValue);
        });

        it('set invalid step, step will not chnage', function() {
            var originStep = spinbox.getStep();

            spinbox.setStep('aaaa');
            expect(spinbox.getStep()).toEqual(originStep);
        });
    });


    describe('up/down button', function() {
        it('click up-button', function() {
            var preValue = spinbox.getValue(),
                step = spinbox._option.step;
            spinbox._$upButton.click();

            expect(spinbox.getValue()).toEqual(preValue + step);
        });

        it('click down-button', function() {
            var preValue = spinbox.getValue(),
                step = spinbox._option.step;
            spinbox._$downButton.click();

            expect(spinbox.getValue()).toEqual(preValue - step);
        });
    });


    describe('value up/down', function() {
        it('value is increased with 1-step', function() {
            var preValue = 1,
                step = 1;
            spinbox.setValue(preValue);
            spinbox._$upButton.click();
            expect(preValue + step).toEqual(spinbox.getValue());
        });

        it('value is increased by with 2-step', function() {
            var preValue = 2,
                step = 2;
            spinboxWithOption.setValue(preValue);
            spinboxWithOption._$upButton.click();;
            expect(preValue + step).toEqual(spinboxWithOption.getValue());
        });

        it('value is decreased with 1-step', function() {
            var preValue = 2,
                step = 1;
            spinbox.setValue(preValue);
            spinbox._$downButton.click();
            expect(preValue - step).toEqual(spinbox.getValue());
        });

        it('value is descreased with 2-step', function() {
            var preValue = 3,
                step = 2;
            spinboxWithOption.setValue(preValue);
            spinboxWithOption._$downButton.click();
            expect(preValue - step).toEqual(spinboxWithOption.getValue());
        });
    });

    describe('option getter/setter', function() {
        it('get option', function() {
            var opt = spinboxWithOption.getOption();

            expect(opt).toEqual(spinboxWithOption._option);
        });

        it('set option', function() {
            var option = {
                    step: 2
                },
                curValue = spinboxWithOption.getValue();

            spinboxWithOption._setOption(option);
            spinboxWithOption._$upButton.click();

            expect(spinboxWithOption.getValue()).toEqual(curValue+2);

            option.step = 1;
            spinboxWithOption._setOption(option);
            spinboxWithOption._$upButton.click();

            expect(spinboxWithOption.getValue()).toEqual(curValue+3);
        });
    });

    describe('max/min value', function() {
        it('check circular change max to min', function() {
            spinbox._setOption({
                min: 0,
                max: 10
            });
            spinbox.setValue(10);
            spinbox._$upButton.click();

            expect(spinbox.getValue()).toEqual(0);
        });

        it('check circular change min to max', function() {
            spinbox._setOption({
                min: 0,
                max: 10
            });
            spinbox.setValue(0);
            spinbox._$downButton.click();

            expect(spinbox.getValue()).toEqual(10);
        });
    });

    describe('exclusion', function() {
        it('add exclusion', function() {
            spinbox.removeExclusion(1);
            spinbox.addExclusion(1);
            spinbox.setValue(0);
            spinbox._$upButton.click();

            expect(spinbox.getValue()).toEqual(2);
        });

        it('remove exclusion', function() {
            spinbox.addExclusion(1);
            spinbox.removeExclusion(1);
            spinbox.setValue(0);
            spinbox._$upButton.click();

            expect(spinbox.getValue()).toEqual(1);
        });


        it('although you add same value to exclusion two times,' +
        ' it requires one time to remove', function() {
            spinbox.addExclusion(1);
            spinbox.addExclusion(1);

            spinbox.setValue(0);
            spinbox._$upButton.click();
            expect(2).toEqual(spinbox.getValue());

            spinbox.setValue(0);
            spinbox.removeExclusion(1);
            spinbox._$upButton.click();
            expect(1).toEqual(spinbox.getValue());
        });
    });

    describe('fire key event', function() {

        var preValue;

        beforeEach(function() {
            preValue = spinbox.getValue();
        });


        it('when push the up-arrow, value will be increased - event.which', function() {
            var ev = $.Event('keydown'),
                nextValue;

            ev.which = 38;  // up-arrow;
            spinbox._$inputElement.trigger(ev);
            nextValue = spinbox.getValue();

            expect(nextValue).toEqual(preValue + spinbox.getStep());
        });

        it('when push the down-arrow, value will be decreased - event.keyCode', function() {
            var ev = $.Event('keydown'),
                nextValue;

            ev.keyCode = 40;  // down-arrow;
            spinbox._$inputElement.trigger(ev);
            nextValue = spinbox.getValue();

            expect(nextValue).toEqual(preValue - spinbox.getStep());
        });

        it('when push an invalid key, no operate', function() {
           var ev = $.Event('keydown'),
               nextValue;

            ev.keycode = 22;
            spinbox._$inputElement.trigger(ev);
            nextValue = spinbox.getValue();

            expect(nextValue).toEqual(preValue);
        });
    });
});


