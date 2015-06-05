/**
 * Created by nhnent on 15. 4. 28..
 */
describe('Timepicker', function() {

    jasmine.getFixtures().fixturesPath = 'base/test/fixtures';
    var TimePicker = ne.component.TimePicker;

    var timepicker1,
        timepicker2;

    beforeEach(function() {
        loadFixtures('timepicker.html');

        timepicker1 = new TimePicker({
            inputElement: '#timepicker-default'
        });
        timepicker2 = new TimePicker({
            inputElement: '#timepicker-option',
            defaultHour: 12,
            defaultMinute: 34,
            showMeridian: true,
            position: {x: 10, y: 10}
        });
    });

    describe('constructor', function() {
        it('instances are created by constructor', function() {
            expect(timepicker1).toBeDefined();
            expect(timepicker2).toBeDefined();
        });

        it('create with a input element but no other options', function() {
            var opt = timepicker1._option,
                showMeridian = opt.showMeridian,
                position = opt.position;

            expect(showMeridian).toEqual(false);
            expect(timepicker1.getTime()).toEqual('00:00');
            expect(position).toEqual(jasmine.any(Object));
            expect(position.x).toEqual(jasmine.any(Number));
            expect(position.y).toEqual(jasmine.any(Number));
        });

        it('create with options', function() {
            var opt = timepicker2._option,
                showMeridian = opt.showMeridian,
                position = opt.position;

            expect(showMeridian).toEqual(true);
            expect(timepicker2.getTime()).toEqual('00:34 PM');
            expect(position).toEqual({x:10, y:10});
        });

        it('create with another options', function() {
            var tp = new TimePicker({
                defaultHour: 15,
                hourStep: 2,
                minuteStep: 2,
                hourExclusion: [8, 12],
                minuteExclusion: [14, 16],
                showMeridian: true
            });

            expect(tp).toBeDefined();
            expect(tp.getHour()).toEqual(15);
            expect(tp.getTime()).toEqual('03:00 PM');
        });

        it('create without input element', function() {
            var tp = new TimePicker();

            expect(tp).toBeDefined();
            expect(tp).toEqual(jasmine.any(TimePicker));
            expect(tp.getTime()).toEqual('00:00');
        });
    });

    describe('setter/getter', function() {
        var originTime1,
            originTime2,
            originHour1,
            originHour2,
            originMinute1,
            originMinute2;

        beforeEach(function() {
            originTime1 = timepicker1.getTime();
            originTime2 = timepicker2.getTime();
            originHour1 = timepicker1.getHour();
            originHour2 = timepicker2.getHour();
            originMinute1 = timepicker1.getMinute();
            originMinute2 = timepicker2.getMinute();
        });


        it('setHour, getHour', function() {
            timepicker1.setHour(13);
            expect(timepicker1.getHour()).toEqual(13);
        });

        it('setMinute, getMinute', function() {
            timepicker1.setMinute(25);
            expect(timepicker1.getMinute()).toEqual(25);
        });

        it('setHour, setMinute, getTime', function() {
            timepicker1.setHour(1);
            timepicker1.setMinute(5);
            expect(timepicker1.getTime()).toEqual('01:05');

            timepicker1.setHour(15);
            timepicker1.setMinute(23);
            expect(timepicker1.getTime()).toEqual('15:23');
        });

        it('set time from string - valid', function() {
            timepicker1.setHour(1);
            timepicker1.setMinute(1);
            expect(timepicker1.getTime()).toEqual('01:01');
        });

        it('set time from string - invalid', function() {
            originTime1 = timepicker1.getTime();
            timepicker1.setTimeFromString('24:33 PM');
            expect(timepicker1.getTime()).toEqual(originTime1);

            timepicker2.setTimeFromString('13:33 PM');
            expect(timepicker2.getTime()).toEqual(originTime2);

            timepicker1.setTimeFromString('34:34 CC');
            expect(timepicker1.getTime()).toEqual(originTime1);

            timepicker2.setTimeFromString('15:22 DD');
            expect(timepicker2.getTime()).toEqual(originTime2);
        });

        it('set invalid value to input element', function() {
            timepicker1._$inputElement.val('AAAAAA').change();

            expect(timepicker1.getTime()).toEqual(originTime1);
            expect(timepicker1._$inputElement.val()).toEqual(originTime1);
        });

        it('set hour step to 2', function() {
            timepicker1.setHourStep(2);
            timepicker1._hourSpinbox._$upButton.click();

            expect(timepicker1.getHourStep()).toEqual(2);
            expect(timepicker1.getHour()).toEqual(originHour1 + 2);
        });

        it('set minute step to 10', function() {
            timepicker1.setMinuteStep(10);
            timepicker1._minuteSpinbox._$upButton.click();

            expect(timepicker1.getMinuteStep()).toEqual(10);
            expect(timepicker1.getMinute()).toEqual(originMinute1 + 10);
        });

        it('add a specific hour to exclude', function() {
            timepicker1.setHour(1);
            timepicker1.addHourExclusion(2);
            timepicker1._hourSpinbox._$upButton.click();

            // 다음 값이 제외 목록에 있는 시간인 경우 건너 뛴다.
            expect(timepicker1.getHour()).toEqual(3);

            // 직접 지정하는 시각이 제외 목록에 있는 시각인경우 변하지 않는다.
            timepicker1.setHour(2);
            expect(timepicker1.getHour()).toEqual(3);
        });

        it('add a specific minute to exclude', function() {
            timepicker1.setMinute(1);
            timepicker1.addMinuteExclusion(2);
            timepicker1._minuteSpinbox._$upButton.click();

            // 다음 값이 제외 목록에 있는 시간인 경우 건너 뛴다.
            expect(timepicker1.getMinute()).toEqual(3);

            // 직접 지정하는 시각이 제외 목록에 있는 시각인경우 변하지 않는다.
            timepicker1.setMinute(2);
            expect(timepicker1.getMinute()).toEqual(3);
        });

        it('remove a specific hour in exclusion list', function() {
            timepicker1.setHour(1);
            timepicker1.addHourExclusion(2);
            timepicker1._hourSpinbox._$upButton.click();
            // 다음 값이 제외 목록에 있는 시간인 경우 건너 뛴다.
            expect(timepicker1.getHour()).toEqual(3);

            timepicker1.setHour(1);
            timepicker1.removeHourExclusion(2);
            timepicker1._hourSpinbox._$upButton.click();
            // 제외 목록에 2시는 다시 사라졌으므로 다음 값은 2시가 맞다.
            expect(timepicker1.getHour()).toEqual(2);
        });

        it('remove a specific minute in exclusion list', function() {
            timepicker1.setMinute(1);
            timepicker1.addMinuteExclusion(2);
            timepicker1._minuteSpinbox._$upButton.click();
            // 다음 값이 제외 목록에 있는 시간인 경우 건너 뛴다.
            expect(timepicker1.getMinute()).toEqual(3);

            timepicker1.setMinute(1);
            timepicker1.removeMinuteExclusion(2);
            timepicker1._minuteSpinbox._$upButton.click();
            // 제외 목록에 '2분'은 다시 지워졌으므로 다음 값은 '2분'이 맞다.
            expect(timepicker1.getMinute()).toEqual(2);
        });
    });

    describe('display', function() {
        it('test open method', function() {
            var mockEventObject = {};
            timepicker1.open(mockEventObject);

            expect(timepicker1.$timePickerElement.css('display')).not.toEqual('none');

        });

        it('test open mehtod x2 --> open event is fired just one time', function() {
            var spy = jasmine.createSpy('spy'),
                mockEventObject = {};

            timepicker1.on('open', spy);
            timepicker1.open(mockEventObject);
            timepicker1.open(mockEventObject);

            expect(spy.calls.count()).toEqual(1);
        });

        it('close timepicker', function() {
            var mockEventObject = {
                target: document.body
            };

            timepicker1.open(mockEventObject);
            expect(timepicker1.$timePickerElement.css('display')).not.toEqual('none');
            timepicker1.close(mockEventObject);
            expect(timepicker1.$timePickerElement.css('display')).toEqual('none');
        });

        it('test open method when click the input element', function() {
            timepicker1._$inputElement.click();
            expect(timepicker1.$timePickerElement.css('display')).not.toEqual('none');

            $(document.body).click();
            expect(timepicker1.$timePickerElement.css('display')).toEqual('none');
        });

        it('if clicked in timepicker, timepicker do not close', function() {
            timepicker1._$inputElement.click();
            expect(timepicker1.$timePickerElement.css('display')).not.toEqual('none');

            timepicker1._hourSpinbox._$containerElement.click();
            expect(timepicker1.$timePickerElement.css('display')).not.toEqual('none');

            timepicker1._minuteSpinbox._$containerElement.click();
            expect(timepicker1.$timePickerElement.css('display')).not.toEqual('none');
        });
    });

    describe('circular time', function() {
        it('test when occurs change-event on input element', function() {
            timepicker1._$inputElement.val('01:01').change();
            expect(timepicker1._hourSpinbox.getValue()).toEqual(1);
            expect(timepicker1._minuteSpinbox.getValue()).toEqual(1);
        });

        it('up to AM', function() {
            timepicker2.setHour(23);
            timepicker2._hourSpinbox._$upButton.click();
            expect(timepicker2.getTime()).toEqual('00:34 AM');
        });

        it('down to PM', function() {
            timepicker2.setHour(0);
            expect(timepicker2.getTime()).toEqual('00:34 AM');
            timepicker2._hourSpinbox._$downButton.click();
            expect(timepicker2.getTime()).toEqual('11:34 PM');
        });

        it('up to PM', function() {
            timepicker2.setHour(11);
            expect(timepicker2.getTime()).toEqual('11:34 AM');

            timepicker2._hourSpinbox._$upButton.click();
            expect(timepicker2.getTime()).toEqual('00:34 PM');
        });

        it('if option.ampm is ture and value is "13:34 AM",' +
            ' getTime() will return "01:34 PM"',  function() {
            timepicker2._$inputElement.val('13:34 AM').change();

            expect(timepicker2.getTime()).toEqual('01:34 PM');
            expect(timepicker2.getHour()).toEqual(13);
        });
    });

    describe('xy postion', function() {
        it('setPosition', function() {
            timepicker1.setXYPosition(0, 0);
            expect(timepicker1.$timePickerElement.css('left')).toEqual('0px');
            expect(timepicker1.$timePickerElement.css('top')).toEqual('0px');
        });

        it('set Invalid position', function() {
            timepicker1.setXYPosition(0, 0);
            expect(timepicker1.$timePickerElement.css('left')).toEqual('0px');
            expect(timepicker1.$timePickerElement.css('top')).toEqual('0px');

            //invalid position
            timepicker1.setXYPosition(null, 0);
            expect(timepicker1.$timePickerElement.css('left')).toEqual('0px');
            expect(timepicker1.$timePickerElement.css('top')).toEqual('0px');
        });
    });

    describe('invaild value', function() {
        it('test when inputText is \'\', the time will be not change', function() {
            timepicker1._$inputElement.val('');
            expect(timepicker1.getTime()).toEqual('00:00');
        });

        it('set string to hour', function() {
            var hour = '??????';

            timepicker1.setHour(hour);
            expect(timepicker1.getHour()).not.toEqual(hour);
        });

        it('set string to minute', function() {
            var minute = '!!!!!!!';

            timepicker1.setMinute(minute);
            expect(timepicker1.getMinute()).not.toEqual(minute);
        });
    });


});