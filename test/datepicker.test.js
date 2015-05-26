describe('데이터 피커를 테스트한다.', function() {

    jasmine.getFixtures().fixturesPath = 'base/test/fixtures';
    jasmine.getStyleFixtures().fixturesPath = 'base/test/css';

    beforeEach(function() {
        loadStyleFixtures('common.css');
        loadFixtures('picker.html');
    });

    describe('picker를 생성하고 picker 기능을 테스트 한다.', function() {
        var picker,
            calendar,
            beforeYear,
            beforeMonth,
            beforeDate;

        beforeEach(function() {
            calendar = new ne.component.Calendar({
                    year: 1983,
                    month: 5,
                    date: 12,
                    todayFormat: 'yyyy\/ mm\/ dd (D)',
                    titleFormat: 'yyyy\/mm',
                    yearTitleFormat: 'yyyy',
                    monthTitleFormat: 'mm',
                    monthTitle: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
                    dayTitles: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                    isDrawOnload: true
                }, $('#layer3'));
            picker = new ne.component.DatePicker({
                dateForm: 'yyyy-mm-dd',
                date: {
                    year: 1984,
                    month: 4,
                    date: 15
                },
                element: document.getElementById('datePick')
            }, calendar);

            beforeYear = picker.getYear();
            beforeMonth = picker.getMonth();
            beforeDate = picker.getDayInMonth();
        });

        it('picker and calendar are defined?', function() {
            expect(picker).toBeDefined();
            expect(picker._calendar).toBeDefined();
        });

        it('setDate, set "2014-11-28', function() {
            picker.setDate(2014, 11, 28);
            var luckyday = picker.getDateObject();
            expect(luckyday.year).toBe(2014);
            expect(luckyday.month).toBe(11);
            expect(luckyday.date).toBe(28);
        });

        it('setDate _not valid date, set run with nothing', function() {
            picker.setDate();
            var notday = picker.getDateObject();
            expect(notday.year).toBe(beforeYear);
            expect(notday.month).toBe(beforeMonth);
            expect(notday.date).toBe(beforeDate);
        });

        it('setDate _not valid date, set run with year and month', function() {
            picker.setDate(1919, 7);
            var notday = picker.getDateObject();
            expect(notday.year).not.toBe(beforeYear);
            expect(notday.month).not.toBe(beforeMonth);
            expect(notday.date).toBe(beforeDate);
        });

        it('setDate _not valid date, set run with year', function() {
            picker.setDate(1920);
            var notday = picker.getDateObject();
            expect(notday.year).not.toBe(beforeYear);
            expect(notday.month).toBe(beforeMonth);
            expect(notday.date).toBe(beforeDate);
        });

        it('_formed "yy-mm-dd" get 2014/11/28', function() {
            picker.setDate(2014, 11, 28);
            picker.setDateForm('yy/mm/dd');

            var str = picker._formed();
            expect(str).toBe('14/11/28');
        });

        it('_formed "yyyy-mm-dd" get 1984-04-15', function() {
            picker.setDate(1984, 4, 15);
            picker.setDateForm('yyyy-mm-dd');

            var str = picker._formed();
            expect(str).toBe('1984-04-15');
        });

        it('_formed "yy-m-d" get 84-4-2', function() {
            picker.setDateForm('yy-m-dd');
            picker.setDate(1984, 4, 2);

            var str = picker._formed();
            expect(str).toBe('84-4-02');
        });

        it('_arrangeLayer use _getBoundingClientRect', function() {
            var bound, calbound;

            bound = picker._getBoundingClientRect();
            picker._$calendarElement.show();
            picker._arrangeLayer();
            calbound = picker._getBoundingClientRect(picker._$calendarElement[0]);

            var isIE7 = navigator.userAgent.indexOf('MSIE') !== -1 && navigator.userAgent.indexOf('7.0') !== -1;

            expect(bound.left).toBe(isIE7 ? calbound.left - 2 : calbound.left);
            expect(bound.bottom).toBe(isIE7 ? calbound.top - 2 : calbound.top);

        });

        it('_extractDate', function() {
            var txt1 = '840415',
                txt2 = '19820612',
                txt3 = '20131231',
                txt4 = '14-04-22',
                txt5 = '04/24, 1998',
                txt6 = '1972/01/33';
            var res1,
                res2,
                res3,
                res4,
                res5,
                res6;

            picker.setDateForm('yymmdd');
            res1 = picker._extractDate(txt1);
            expect(res1.year).toBe(2084);
            expect(res1.month).toBe(4);
            expect(res1.date).toBe(15);


            picker.setDateForm('yyyymmdd');
            res2 = picker._extractDate(txt2);
            expect(res2.year).toBe(1982);
            expect(res2.month).toBe(6);
            expect(res2.date).toBe(12);

            picker.setDateForm('yyyymmdd');
            res3 = picker._extractDate(txt3);
            expect(res3.year).toBe(2013);
            expect(res3.month).toBe(12);
            expect(res3.date).toBe(31);

            picker.setDateForm('yy-mm-dd');
            res4 = picker._extractDate(txt4);
            expect(res4.year).toBe(2014);
            expect(res4.month).toBe(4);
            expect(res4.date).toBe(22);

            picker.setDateForm('mm/dd, yyyy');
            res5 = picker._extractDate(txt5);
            expect(res5.year).toBe(1998);
            expect(res5.month).toBe(4);
            expect(res5.date).toBe(24);


            //Invalid Date - 1972/01/33
            picker.setDateForm('yyyy/mm/dd');
            res6 = picker._extractDate(txt6);
            expect(res6.year).toBeUndefined();
            expect(res6.month).toBeUndefined();
            expect(res6.date).toBeUndefined();
        });
    });

    describe('picker의 동작을 테스트 한다', function() {
        var picker,
            calendar,
            picker2;
        beforeEach(function() {
            calendar = new ne.component.Calendar({
                year: 1983,
                month: 5,
                date: 12,
                todayFormat: 'yyyy\/ mm\/ dd (D)',
                titleFormat: 'yyyy\/mm',
                yearTitleFormat: 'yyyy',
                monthTitleFormat: 'mm',
                monthTitle: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
                dayTitles: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                isDrawOnload: true
            }, $('#layer3'));
            picker = new ne.component.DatePicker({
                dateForm: 'yyyy-mm-dd',
                date: {
                    year: 2014,
                    month: 11,
                    date: 27
                },
                element: document.getElementById('datePick')
            }, calendar);
            picker2 = new ne.component.DatePicker({
                dateForm: 'yyyy-mm-dd',
                date: {
                    year: 2014,
                    month: 11,
                    date: 27
                },
                element: document.getElementById('datePick'),
                startDate: {
                    year: 2014,
                    month: 10,
                    date: 30
                },
                endDate: {
                    year: 2014,
                    month: 11,
                    date: 10
                }
            }, calendar);
        });

        it('open 캘린더를 열고, draw를 통해 다른연/월로 이동하여도 ' +
        '실제 날짜는 선택하지 않았으므로 picker의 date는 갱신되지 않는다.', function() {
            var beforeDate,
                afterDate;

            calendar.draw();
            beforeDate = picker.getDateObject();

            picker.open();
            calendar.draw(2000, 12);
            afterDate = picker.getDateObject();

            expect(beforeDate).toEqual(afterDate);
        });

        it('_checkRestrict, check date is available to select', function() {
            var date1 = {
                    year: 2014,
                    month: 9,
                    date: 1
                },
                date2 = {
                    year: 2014,
                    month: 11,
                    date: 3
                };

            expect(picker2._isRestricted(date1)).toBeTruthy();
            expect(picker2._isRestricted(date2)).toBeFalsy();
        });

        it('_bindDrawEventForSelectableRange 선택 불가능한 영역을 입힌다.', function() {
            picker2._bindDrawEventForSelectableRange();
            calendar.draw(2014, 11);
            var unselectableList = picker2._$calendarElement.find('.selectableClass');
            // 10/30~11/10(12)
            expect(unselectableList.length).toBe(12);
        });

        it('_onClickCalendar 달력의 날짜를 눌렀을때를 테스트한다.', function() {
            var td = document.createElement('td');
            td.innerHTML = '<a>9</a>';
            var e = {
                target: td,
                stopPropagation: function() {}
            };

            picker2.open();
            picker2.setDateForm('dd-mm-yyyy');
            picker2._onClickCalendar(e);
            expect(picker2._element.value).toBe('09-11-2014');
        });

        it('_onKeydownPicker 엔터를 쳤을때와 아닐때, 동작테스트', function() {
            picker2.setDateForm('yyyymmdd');
            var e1 = {
                keyCode: 10
            };
            var e2 = {
                keyCode: 13
            };
            var res1,
                res2,
                res3;

            // enter를 치지 않았기때문에 동작하지 않는다.
            picker2.setDateForm('yy-mm-dd');
            picker2._element.value = '14-11-01';
            picker2._onKeydownPicker(e1);
            res1 = picker2.getDateObject();
            expect(res1.date).not.toBe(1);

            // enter를 치면 동작
            picker2.setDateForm('yy-mm-dd');
            picker2._element.value = '14-11-01';
            picker2._onKeydownPicker(e2);
            res1 = picker2.getDateObject();
            expect(res1.date).toBe(1);

            // 제한된 날짜인 경우 엔터를 처도 날짜가 바뀌지 않는다.
            // === restric데이터라 갱신되지 않는다.
            picker2._element.value = '17-04-11';
            picker2._onKeydownPicker(e2);
            res2 = picker2.getDateObject();

            expect(res2.year).toBe(2014);
            expect(res2.month).toBe(11);
            expect(res2.date).toBe(1);
            expect(picker._element.value).not.toBe('17-04-11');

            // 올바른 데이터는 정상적으로 동작한다.
            picker2._element.value = '2014-11-09';
            picker2._onKeydownPicker(e2);
            res3 = picker2.getDateObject();
            expect(res3.year).toBe(2014);
            expect(res3.month).toBe(11);
            expect(res3.date).toBe(9);
        });
    });
});