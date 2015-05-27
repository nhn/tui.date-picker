describe('Date Picker', function() {

    var layer1,
        layer2,
        layer3,
        calendar1,
        calendar2,
        calendar3,
        datepicker1,
        datepicker2,
        datepicker3;

    jasmine.getFixtures().fixturesPath = 'base/test/fixtures';
    jasmine.getStyleFixtures().fixturesPath = 'base/test/css';

    beforeEach(function() {
        loadStyleFixtures('common.css');
        loadFixtures('datepicker.html');

        layer1 = $('#layer1');
        layer2 = $('#layer2');
        layer3 = $('#layer3');

        calendar1 = new ne.component.Calendar({
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
        }, layer1);

        calendar2 = new ne.component.Calendar({
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
        }, layer2);

        calendar3 = new ne.component.Calendar({
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
        }, layer3);

        datepicker1 = new ne.component.DatePicker({
            date: {
                year: 2014,
                month: 11,
                date: 27
            },
            element: document.getElementById('datePick1')
        }, calendar1);

        datepicker2 = new ne.component.DatePicker({
            element: document.getElementById('datePick2'),
            dateForm: 'yy년 mm월 dd일, ',
            date: {
                year: 2015,
                month: 05,
                date: 10
            },
            startDate: {
                year: 1994,
                month: 05,
                date: 9
            },
            endDate: {
                year: 2090,
                month: 05,
                date: 11
            },
            selectableClass: 'mySelectable',
            withTimePicker: true
        }, calendar2);

        datepicker3 = new ne.component.DatePicker({
            element: document.getElementById('datePick3')
        }, calendar3);
    });

    describe('namespace', function() {
        it('check component', function() {
            expect(window.ne).toBeDefined();
            expect(window.ne.component).toBeDefined();
            expect(window.ne.component.Calendar).toBeDefined();
            expect(window.ne.component.Spinbox).toBeDefined();
            expect(window.ne.component.TimePicker).toBeDefined();
            expect(window.ne.component.DatePicker).toBeDefined();
        });
    });


    describe('생성', function() {
        it('to be defined', function() {
            expect(datepicker1).toBeDefined();
            expect(datepicker2).toBeDefined();
            expect(datepicker3).toBeDefined();
        });
    });

    describe('api 호출', function() {
        it('open datepicker', function() {
            datepicker1.open();
            expect(ne.component.DatePicker.enabledPicker).toBe(datepicker1);

            datepicker2.open();
            expect(ne.component.DatePicker.enabledPicker).toBe(datepicker2);
            datepicker2.open();
            datepicker2.open();

            datepicker3.open();
            expect(ne.component.DatePicker.enabledPicker).toBe(datepicker3);
        });

        it('close datepicker', function() {
            datepicker1.open();
            datepicker1.close();
            expect(ne.component.DatePicker.enabledPicker).toBe(null);
        });

        it('get date object', function() {
            var obj = datepicker1.getDateObject();

            expect(obj).toEqual({
                year:2014,
                month:11,
                date:27
            });
        });

        it('get day in month', function() {
            var dayInMonth = datepicker1.getDayInMonth();

            expect(dayInMonth).toBe(27);
        });

        it('get month', function() {
            var month = datepicker1.getMonth();

            expect(month).toBe(11);
        });

        it('get year', function() {
            var year = datepicker1.getYear();

            expect(year).toBe(2014);
        });

        it('get timepicker', function() {
            var tp = datepicker1.getTimePicker();

            expect(tp).toBeNull();

            tp = datepicker2.getTimePicker();
            expect(tp).toEqual(jasmine.any(ne.component.TimePicker));
        });

        it('set date', function() {
            datepicker1.setDate(2014, 3, 12);

            expect(datepicker1.getYear()).toBe(2014);
            expect(datepicker1.getMonth()).toBe(3);
            expect(datepicker1.getDayInMonth()).toBe(12);

            datepicker1.setDate(2100, 2);
            expect(datepicker1.getYear()).toBe(2100);
            expect(datepicker1.getMonth()).toBe(2);
            expect(datepicker1.getDayInMonth()).toBe(12);

            datepicker1.setDate(2104, 2, 29);
            expect(datepicker1.getYear()).toBe(2104);
            expect(datepicker1.getMonth()).toBe(2);
            expect(datepicker1.getDayInMonth()).toBe(29);

            // 2100년은 2월 29일이 존재하지 않으므로
            // 2100년 2월 29일로 변경되지 않는다.
            // 기존 날짜 : 2104년 2월 29일
            datepicker1.setDate(2100);
            expect(datepicker1.getYear()).not.toBe(2100);
            expect(datepicker1.getMonth()).toBe(2);
            expect(datepicker1.getDayInMonth()).toBe(29);
        });

        it('set date', function() {
            datepicker1.setDate('1111');

            expect(datepicker1.getDateObject()).toEqual({
                year: 2014,
                month: 11,
                date: 27
            });
        });

        it('timepicker set time', function() {
            var preInputValue = datepicker2._element.value,
                nextInputValue,
                tp = datepicker2.getTimePicker();

            tp.setTime(12, 34);
            nextInputValue = datepicker2._element.value;

            expect(nextInputValue).not.toEqual(preInputValue);
        })
    });

    describe('private 테스트', function() {
        it('_formed "yy-mm-dd" get 2014/11/28', function() {
            var str;
            datepicker1.setDate(2014, 11, 28);
            datepicker1.setDateForm('yy/mm/dd');

            str = datepicker1._formed();
            expect(str).toBe('14/11/28');
        });

        it('_formed "yyyy-mm-dd" get 1984-04-15', function() {
            var str;
            datepicker1.setDate(1984, 4, 15);
            datepicker1.setDateForm('yyyy-mm-dd');

            str = datepicker1._formed();
            expect(str).toBe('1984-04-15');
        });

        it('_formed "yy-m-d" get 84-4-2', function() {
            var str;
            datepicker1.setDateForm('yy-m-dd');
            datepicker1.setDate(1984, 4, 2);

            str = datepicker1._formed();
            expect(str).toBe('84-4-02');
        });

        it('_arrangeLayer use _getBoundingClientRect', function() {
            var bound, calbound;

            bound = datepicker1._getBoundingClientRect();
            datepicker1._$calendarElement.show();
            datepicker1._arrangeLayer();
            calbound = datepicker1._getBoundingClientRect(datepicker1._$calendarElement[0]);

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

            datepicker1.setDateForm('yymmdd');
            res1 = datepicker1._extractDate(txt1);
            expect(res1.year).toBe(2084);
            expect(res1.month).toBe(4);
            expect(res1.date).toBe(15);


            datepicker1.setDateForm('yyyymmdd');
            res2 = datepicker1._extractDate(txt2);
            expect(res2.year).toBe(1982);
            expect(res2.month).toBe(6);
            expect(res2.date).toBe(12);

            datepicker1.setDateForm('yyyymmdd');
            res3 = datepicker1._extractDate(txt3);
            expect(res3.year).toBe(2013);
            expect(res3.month).toBe(12);
            expect(res3.date).toBe(31);

            datepicker1.setDateForm('yy-mm-dd');
            res4 = datepicker1._extractDate(txt4);
            expect(res4.year).toBe(2014);
            expect(res4.month).toBe(4);
            expect(res4.date).toBe(22);

            datepicker1.setDateForm('mm/dd, yyyy');
            res5 = datepicker1._extractDate(txt5);
            expect(res5.year).toBe(1998);
            expect(res5.month).toBe(4);
            expect(res5.date).toBe(24);


            //Invalid Date - 1972/01/33
            datepicker1.setDateForm('yyyy/mm/dd');
            res6 = datepicker1._extractDate(txt6);
            expect(res6.year).toBeUndefined();
            expect(res6.month).toBeUndefined();
            expect(res6.date).toBeUndefined();
        });

        it('_checkRestrict, 제한된 날짜 판단', function() {
            var date1 = {
                    year: 2014,
                    month: 9,
                    date: 1
                },
                date2 = {
                    year: 1990,
                    month: 11,
                    date: 3
                },
                date3 = {
                    year: 2111,
                    month: 11,
                    date: 3
                };

            expect(datepicker2._isRestricted(date1)).toEqual(false);
            expect(datepicker2._isRestricted(date2)).toEqual(true);
            expect(datepicker2._isRestricted(date3)).toEqual(true);
        });


        it('_bindDrawEventForSelectableRange 선택 불가능한 영역을 입힌다.', function() {

            datepicker2._bindDrawEventForSelectableRange();
            calendar2.draw(2014, 11);
            var unselectableList = datepicker2._$calendarElement.find('.mySelectable');
            // 10/30~11/10(12)
            expect(unselectableList.length);
            expect(unselectableList.length).not.toBe(12);
        });

    });

    describe('public - 다양한 입력 케이스', function() {
        var beforeYear,
            beforeMonth,
            beforeDate;

        beforeEach(function() {
            beforeYear = datepicker1.getYear();
            beforeMonth = datepicker1.getMonth();
            beforeDate = datepicker1.getDayInMonth();
        });

        it('setDate _not valid date, set run with nothing', function() {
            var notday;
            datepicker1.setDate();
            notday = datepicker1.getDateObject();

            expect(notday.year).toBe(beforeYear);
            expect(notday.month).toBe(beforeMonth);
            expect(notday.date).toBe(beforeDate);
        });

        it('setDate _not valid date, set run with year and month', function() {
            var notday;
            datepicker1.setDate(1919, 7);
            notday = datepicker1.getDateObject();

            expect(notday.year).not.toBe(beforeYear);
            expect(notday.month).not.toBe(beforeMonth);
            expect(notday.date).toBe(beforeDate);
        });

        it('setDate _not valid date, set run with year', function() {
            var notday;
            datepicker1.setDate(1920);
            notday = datepicker1.getDateObject();

            expect(notday.year).not.toBe(beforeYear);
            expect(notday.month).toBe(beforeMonth);
            expect(notday.date).toBe(beforeDate);
        });
    });

    describe('behavior 테스트', function() {
        it('open 캘린더를 열고, draw를 통해 다른연/월로 이동하여도 ' +
        '실제 날짜는 선택하지 않았으므로 picker의 date는 갱신되지 않는다.', function() {
            var beforeDate,
                afterDate;

            calendar1.draw();
            beforeDate = datepicker1.getDateObject();

            datepicker1.open();
            calendar1.draw(2000, 12);
            afterDate = datepicker1.getDateObject();

            expect(beforeDate).toEqual(afterDate);
        });

        it('_onClickCalendar 달력의 날짜를 눌렀을때를 테스트한다.', function() {
            var td = document.createElement('td');
            td.innerHTML = '<a>9</a>';
            var e = {
                target: td,
                stopPropagation: function() {}
            };

            datepicker1.open();
            datepicker1.setDateForm('dd-mm-yyyy');
            datepicker1._onClickCalendar(e);
            expect(datepicker1._element.value).toBe('09-11-2014');
        });

        it('_onKeydownPicker 엔터를 쳤을때와 아닐때, 동작테스트', function() {
            datepicker2.setDateForm('yyyymmdd');
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
            datepicker2.setDateForm('yy-mm-dd');
            datepicker2._element.value = '14-11-01';
            datepicker2._onKeydownPicker(e1);
            res1 = datepicker2.getDateObject();
            expect(res1.date).not.toBe(1);

            // enter를 치면 동작
            datepicker2.setDateForm('yy-mm-dd');
            datepicker2._element.value = '14-11-01';
            datepicker2._onKeydownPicker(e2);
            res1 = datepicker2.getDateObject();
            expect(res1.date).toBe(1);

            // 제한된 날짜인 경우 엔터를 처도 날짜가 바뀌지 않는다.
            // === restric데이터라 갱신되지 않는다.
            datepicker2.setDateForm('yy-mm-dd');
            datepicker2._element.value = '99-04-11';
            datepicker2._onKeydownPicker(e2);
            res2 = datepicker2.getDateObject();

            expect(res2.year).toBe(2014);
            expect(res2.month).toBe(11);
            expect(res2.date).toBe(1);
            expect(datepicker2._element.value).not.toBe('99-04-11');

            // 올바른 데이터는 정상적으로 동작한다.
            datepicker2._element.value = '2014-11-09';
            datepicker2._onKeydownPicker(e2);
            res3 = datepicker2.getDateObject();
            expect(res3.year).toBe(2014);
            expect(res3.month).toBe(11);
            expect(res3.date).toBe(9);
        });
    });
});