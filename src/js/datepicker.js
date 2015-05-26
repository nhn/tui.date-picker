/**
 * Created by nhnent on 15. 5. 14..
 * @fileoverview 날짜를 선택하는 기능을 구현한다. 특정 범위를 받으면, 그 날짜만 선택 가능하다.
 * @author 이제인(jein.yi@nhnent.com)
 * @author 이민규(minkyu.yi@nhnent.com) 2015-05-14
 * @dependency jquery.1.8.3.js, code-snippet.js, calendar.js
 */

'use strict';

 /* istanbul ignore if */
if (!window.ne) {
    window.ne = {};
}
/* istanbul ignore if */
if (!ne.component) {
    ne.component = {};
}

(function(exports){
    var calendarUtil = ne.component.Calendar.Util,
        util = ne.util,
        formatRegExp = /yyyy|yy|mm|m|dd|d/gi,
        mapForConverting = {
            yyyy: {expression: '(\\d{4}|\\d{2})', type: 'year'},
            yy: {expression: '(\\d{4}|\\d{2})', type: 'year'},
            y: {expression: '(\\d{4}|\\d{2})', type: 'year'},
            mm: {expression: '(1[012]|0[1-9]|[1-9]\\b)', type: 'month'},
            m: {expression: '(1[012]|0[1-9]|[1-9]\\b)', type: 'month'},
            dd: {expression: '([12]\\d{1}|3[01]|0[1-9]|[1-9]\\b)', type: 'date'},
            d: {expression: '([12]\\d{1}|3[01]|0[1-9]|[1-9]\\b)', type: 'date'}
        },
        MIN_YEAR = 1900,
        MAX_YEAR = 3000,
        MONTH_DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    /**
     * 달력 생성
     * 날짜를 선택한다.
     * 선택한 날짜의 클래스를 비교, picker-selectable혹은 사용자가 지정한 클래스를 보유하고 있으면 getYear, getMonth, getDayInMonth를 이용해 날짜를 받아온다.
     *
     * @namespace ne.component.DatePicker
     * @constructor
     * @param {Object} option DatePicker 옵션값
     *      @param {HTMLElement} option.element DatePicker의 input 창
     *      @param {Object} [option.date = 오늘] 초기 날짜
     *        @param {Object} option.date.year 년도
     *        @param {Object} option.date.month 월
     *        @param {Object} option.date.date 일
     *      @param {string} [option.dateForm = yyyy-mm-dd] 날짜 형식
     *      @param {string} [option.defaultCentury = 20] yy 형식일때 자동으로 붙여지는 값 [19|20]
     *      @param {string} [option.selectableClass = selectableClass] 선택가능한 날짜에 입힐 클래스
     *      @param {Object} [option.startDate = 1900.01.01] 날짜 시작일 (해당 날짜 선택 불가)
     *      @param {Object} [option.endDate = 3000.01.01] 날짜 종료일 (해당 날짜 선택 불가)
     * @param {ne.component.Calendar} calendar 캘린더 컴포넌트
     * */
    exports.DatePicker = ne.util.defineClass(/**@lends ne.component.DatePicker.prototype */{
        init: function(option, calendar) {
            /**
             * 캘린더 객체
             * @type{Calendar}
             * @private
             */
            this._calendar = calendar;

            /**
             * 캘린더 엘리먼트
             * @type {HTMLElement}
             * @private
             */
            this._$calendarElement = $(calendar.getElement());

            /**
             * 실제 날짜값 문자열이 보여질 엘리먼트
             * @type {HTMLElement}
             * @private
             */
            this._element = option.element;

            /**
             * 날짜 표시 형식
             * @type {string}
             * @private
             */
            this._dateForm = option.dateForm || 'yyyy-mm-dd';

            /**
             * 날짜 형식에 맞는 정규표현식 객체
             * @type {RegExp}
             * @private
             * @see ne.component.DatePicker.prototype.setDateForm
             */
            this._regExp = null;

            /**
             * 날짜 형식의 순서를 저장한다.
             * @type {Array}
             * @private
             * @example
             * datepicker.setDateForm('mm-dd, yyyy');
             * datepicker._formOrder === ['month', 'date', 'year'] // true
             */
            this._formOrder = [];

            /**
             * 데이터를 해쉬 형식으로 저장
             * @type {Date}
             * @private
             */
            this._date = option.date || util.getDateHashTable(null);

            /**
             * yy-mm-dd형식으로 인풋창에 값을 직접 입력 할 시, 앞에 자동으로 붙을 숫자.
             * @type {string}
             * @private
             */
            this._defaultCentury = option.defaultCentury || '20';

            /**
             * (선택 제한시) 선택 가능한 날짜엘리먼트에 추가될 클래스명
             * @type {string}
             * @private
             */
            this._selectableClass = option.selectableClass || 'selectableClass';

            /**
             * (선택 제한시) 선택 할 수 있는 첫 날
             * @type {Date}
             * @private
             */
            this._startEdge = option.startDate;

            /**
             * (선택 제한시) 선택 할 수 있는 마지막 날
             * @type {Date}
             * @private
             */
            this._endEdge = option.endDate;

            /**
             * 추가 - timepicker option
             * @type {boolean}
             * @private
             */
            this._withTimePicker = !!(option.withTimePicker);

            /**
             * 추가 - TimePicker Object
             * @type {TimePicker}
             * @private
             */
            this._timePicker = null;

            this._initializeDatePicker(option);
        },

        /**
         * 초기화 진행 메서드
         * @param {Object} option 사용자 옵션
         * @private
         */
        _initializeDatePicker: function(option) {
            // 날짜 제한 값을 설정한다.
            option.startDate = option.startDate || {year:MIN_YEAR, month:1, date: 1};
            option.endDate = option.endDate || {year:MAX_YEAR, month:1 , date: 1};

            this._startEdge = calendarUtil.getTime(option.startDate);
            this._endEdge = calendarUtil.getTime(option.endDate);

            // 엘리먼트가 존재하면 이벤트를 등록한다.
            if(this._element) {
                this._bindElementEvent();
            }

            if (this._withTimePicker) {
                this._initializeTimePicker();
            }
            // 날짜 형식을 지정하고 현재 날짜를 input element에 출력한다.
            this.setDateForm();
        },

        /**
         * 타임 피커 포함시 초기화 메서드
         * @private
         */
        _initializeTimePicker: function() {
            var self = this;

            this._timePicker = new ne.component.TimePicker({
                showMeridian: true
            });

            this._timePicker.on('change', function() {
                self.setDate();
            });

            this._$calendarElement.append(this._timePicker.$timePickerElement);
            this._timePicker.show();
        },

        /**
         * 해당 년도가 유효한지 판단한다.
         * @param {number} year
         * @returns {boolean}
         * @private
         */
        _isValidYear: function(year) {
            return util.isNumber(year) && year > MIN_YEAR && year < MAX_YEAR;
        },

        /**
         * 해당 월이 유효한지 판단한다.
         * @param {number} month
         * @returns {boolean}
         * @private
         */
        _isValidMonth: function(month) {
            return util.isNumber(month) && month > 0 && month < 13;
        },

        /**
         * 해당 날짜가 유효한 날짜인지 판단한다.
         * @param {Object} datehash
         * @returns {boolean} 유효한 날짜 여부
         * @private
         */
        _isValidDate: function(datehash) {
            var year = datehash.year,
                month = datehash.month,
                date = datehash.date,
                lastDayInMonth;

            if(!this._isValidYear(year) || !this._isValidMonth(month)) {
                return false;
            }

            /**
             * 1. 서력 기원 연수가 4로 나누어 떨어지는 해는 우선 윤년으로 하고,
             * 2. 그 중에서 100으로 나누어 떨어지는 해는 평년으로 하며,
             * 3. 다만 400으로 나누어 떨어지는 해는 다시 윤년으로 정하였다.
             * @type {number}
             */
            lastDayInMonth = MONTH_DAYS[month];
            if (month === 2 && year % 4 === 0) {
                if(year % 100 !== 0 || year % 400 === 0) {
                    lastDayInMonth = 29;
                }
            }

            return !!(
            util.isNumber(date) &&
            date > 0 &&
            date <= lastDayInMonth
            );
        },

        /**
         * 엘리먼트 클릭시 이벤트 바인딩
         * @private
         */
        _bindElementEvent: function() {
            // 데이트 피커 엘리먼트에 이벤트 바인딩.
            $(this._element).on('click', ne.util.bind(this._onClickPicker, this));
            $(this._element).on('keydown', ne.util.bind(this._onKeydownPicker, this));
        },

        /**
         * 레이어가 펼쳐지면 다른 곳을 클릭할 때 달력을 닫히도록 한다.
         * @private
         */
        _bindCloseLayerEvent: function() {
            var layer = ne.util.bind(function(event) {
                /**
                 * 이벤트 발생 이후에
                 * 캘린더를 새로 그리는 this._calendar.draw() 가 호출되는 경우,
                 * $.contains() 메서드로 event.target을 검사하면 false 가 반환되는 경우가 있다.
                 * 그래서 isDateElement로 한번 더 확인을 한다.
                 */
                var isDateElement = (event.target.className.indexOf(this._calendar._option.classPrefix) > -1),
                    isContains = $.contains(this._$calendarElement[0], event.target),
                    isInputElement = (this._element === event.target),
                    isOpened = (this.constructor.enabledPicker === this);

                /**
                 * calendar를 클릭하지 않았을 경우
                 * 데이트 피커는 닫히게 된다.
                 */
                if ((isOpened && !isDateElement && !isContains && !isInputElement)) {
                    $(document).off('click', layer);
                    this._onKeydownPicker(event);
                    this.close();
                }
            }, this);
            $(document).on('click', layer);
        },

        /**
         * 캘린더를 해당 레이어 아래로 이동시킨다.
         * @private
         */
        _arrangeLayer: function() {
            var $element = this._$calendarElement,
                bound = this._getBoundingClientRect();

            if (bound) {
                $element.css({
                    position: 'absolute',
                    left: bound.left + 'px',
                    top: bound.bottom + 'px'
                });
            }
        },

        /**
         * 앨리먼트의 BoundingClientRect를 구한다.
         * @param {HTMLElement} [element]
         * @returns {Object}
         * @private
         */
        _getBoundingClientRect: function(element) {
            var el = element || this._element,
                bound,
                ceil;

            if(!el) {
                return null;
            } else {
                bound = el.getBoundingClientRect();
                ceil = Math.ceil;
                return {
                    left: ceil(bound.left),
                    top: ceil(bound.top),
                    bottom: ceil(bound.bottom),
                    right: ceil(bound.right)
                };
            }
        },

        /**
         * 달력에 이벤트를 붙인다.
         * @private
         */
        _bindOnClickToCalendar: function() {
            if (!ne.util.isFunction(this._binder)) {
                this._binder = ne.util.bind(this._onClickCalendar, this);
            }

            this._$calendarElement.find('.' + this._selectableClass).on('click', this._binder);
        },

        /**
         * 달력 이벤트를 제거한다
         * @private
         */
        _unbindOnClickToCalendar: function() {
            this._$calendarElement.find('.' + this._selectableClass).off('click');
        },

        /**
         * 피커 이벤트 핸들러.
         * @private
         */
        _onClickPicker: function() {
            this.open();
        },

        /**
         * 문자열로부터 날짜 정보를 추출하여 저장한다.
         * @param str {string}
         * @private
         */
        _setDateFromString: function(str) {
            var date = this._extractDate(str);

            if (date && !this._isRestricted(date)) {
                if (this._timePicker) {
                    this._timePicker.setTimeFromInputElement($(this._element));
                }
                this.setDate(date.year, date.month, date.date);
            } else {
                this.setDate();
            }
        },

        /**
         * 인풋 상자에서 엔터를 쳤을 경우 이벤트 처리
         * @param {Event} [event]
         * @private
         */
        _onKeydownPicker: function(event) {
            if (!event || event.keyCode !== 13) {
                return;
            }

            this._setDateFromString(this._element.value);
        },

        /**
         * 클릭시 발생한 이벤트
         * @param {Event} e
         * @private
         */
        _onClickCalendar: function(e) {
            var target = e.target,
                className = target.className,
                value = Number((target.innerText || target.textContent || target.nodeValue)),
                date;

            if (value && !isNaN(value)) {
                if(className.indexOf('prev-mon') > -1) {
                    date = calendarUtil.getRelativeDate(0, -1, value-1, this._calendar._getShownDate());
                } else if (className.indexOf('next-mon') > -1) {
                    date = calendarUtil.getRelativeDate(0, 1, value-1, this._calendar._getShownDate());
                } else {
                    date = calendarUtil.getRelativeDate(0, 0, value-1, this._calendar._getShownDate());
                }

                this.setDate(date.year, date.month, date.date);
            }
        },

        /**
         * 날짜 해쉬를 받아 양식에 맞춘 값을 생성해 돌려준다.
         *
         * @return {string} - 폼에 맞춘 날짜 스트링
         * @private
         */
        _formed: function() {
            var year = this._date.year,
                month = this._date.month,
                date = this._date.date;

            month = month < 10 ? ('0' + month) : month;
            date = date < 10 ? ('0' + date) : date;

            var form = this._dateForm,
                replaceMap = {
                    yyyy: year,
                    yy: String(year).substr(2, 2),
                    mm: month,
                    m: Number(month),
                    dd: date,
                    d: Number(date)
                },
                dateString;

            dateString = form.replace(formatRegExp, function(key) {
                return replaceMap[key.toLowerCase()] || '';
            });

            return dateString;
        },

        /**
         * 입력 텍스트로부터 지정한 날짜 형식과 비교하여 datehash객체를 만들고 그 결과를 반환한다.
         * @param {String} str 사용자가 입력한 텍스트
         * @returns {Object|boolean}
         * @private
         */
        _extractDate: function(str) {
            var formOrder = this._formOrder,
                resultDate = {},
                regExp = this._regExp;

            regExp.lastIndex = 0;
            if (regExp.test(str)) {
                resultDate[formOrder[0]] = Number(RegExp.$1);
                resultDate[formOrder[1]] = Number(RegExp.$2);
                resultDate[formOrder[2]] = Number(RegExp.$3);
            } else {
                return false;
            }

            if (String(resultDate.year).length === 2) {
                resultDate.year = Number(this._defaultCentury + resultDate.year);
            }

            return resultDate;
        },

        /**
         * 선택 불가능한 날짜인지 확인한다.
         * @param {Object} datehash 비교할 날짜데이터
         * @returns {boolean}
         * @private
         */
        _isRestricted: function(datehash) {
            var start = this._startEdge,
                end = this._endEdge,
                date = calendarUtil.getTime(datehash);

            //start, end, date는 모두 밀리세컨즈로 비교함.
            return !this._isValidDate(datehash) || (date < start || date > end);
        },

        /**
         * 선택 가능한 영역에 클래스를 입힌다.
         * @private
         */
        _bindDrawEventForSelectableRange: function() {
            this._calendar.on('draw', ne.util.bind(function(data) {
                if (!this._isRestricted(data)) {
                    data.$dateContainer.addClass(this._selectableClass);
                }
            }, this));
        },

        /**
         * 달력이 갱신될때 이벤트를 건다.
         * @private
         */
        _bindCalendarCustomEvent: function() {
            this._calendar.on('beforeDraw', ne.util.bind(function() {
                this._unbindOnClickToCalendar();
            }, this));
            this._calendar.on('afterDraw', ne.util.bind(function() {
                this._bindOnClickToCalendar();
            }, this));
        },

        /**
         * 달력이 닫힐때 이벤트 제거
         * @private
         */
        _unbindCalendarEvent: function() {
            this._calendar.off();
        },

        /**
         * 달력의 위치를 조정하고, 달력을 펼친다.
         */
        open: function() {
            var enabledPicker = this.constructor.enabledPicker;

            // 달력을 물고있는 활성화된 picker가 있으면 닫는다.
            if (enabledPicker) {
                if(enabledPicker === this) {
                    return;
                } else {
                    enabledPicker.close();
                }
            }

            this._arrangeLayer();

            // 선택영역 제한이 있는지 확인후 선택불가능한 부분을 설정한다.
            this._bindDrawEventForSelectableRange();

            // 달력 레이어를 뺀 위치에서 마우스 클릭시 달력닫힘
            this._bindCloseLayerEvent();
            // 달력 커스텀이벤트
            this._bindCalendarCustomEvent();

            this._calendar.draw(this._date.year, this._date.month, false);
            this._$calendarElement.show();

            this.constructor.enabledPicker = this;
        },

        /**
         * 달력에 걸린 이벤트를 해지하고
         * 달력 레이어를 닫는다.
         */
        close: function() {
            this._setDateFromString(this._element.value);
            this._unbindOnClickToCalendar();
            this._unbindCalendarEvent();
            this._$calendarElement.hide();
            this.constructor.enabledPicker = null;
        },

        /**
         * 현재 날짜 해시 객체를 반환한다.
         * @returns {Object}
         */
        getDateObject: function() {
            return util.extend({}, this._date);
        },

        /**
         * 년도를 반환한다.
         * @returns {number}
         */
        getYear: function() {
            return this._date.year;
        },

        /**
         * 월을 반환한다.
         * @returns {number}
         */
        getMonth: function() {
            return this._date.month;
        },

        /**
         * 일을 반환한다.
         * @returns {number}
         */
        getDayInMonth: function() {
            return this._date.date;
        },

        /**
         * 데이터 저장
         * @param {string|number} [year] 연도
         * @param {string|number} [month] 월
         * @param {string|number} [date] 날짜
         */
        setDate: function(year, month, date) {
            var dateObj = this._date,
                newDateObj = {},
                value;

            newDateObj.year = year || dateObj.year;
            newDateObj.month = month || dateObj.month;
            newDateObj.date = date || dateObj.date;

            if (!this._isRestricted(newDateObj)) {
                util.extend(dateObj, newDateObj);
            }

            if (this._element) {
                value = this._formed();
                if (this._withTimePicker) {
                    value = value + this._timePicker.getTime();
                }
                this._element.value = value;
            }

            this._calendar.draw(dateObj.year, dateObj.month, false);
        },

        /**
         * 날짜 폼을 변경한다.
         * @param {String} [form] - 날짜 형식 (ex- 'yyyy-mm-dd', 'mm-dd, yyyy', 'y/m/d', 'yy/mm/dd')
         */
        setDateForm: function(form) {
            this._dateForm = form || this._dateForm;

            var regExpStr = '^',
                formOrder = this._formOrder,
                index = 0;

            /**
             * formOrder는 날짜 형식의 순서를 기억한다.
             * 만약 날짜 형식이 'mm-dd, yyyy'라면
             * formOrder = ['month', 'date', 'year'];
             *
             * 날짜 형식은 setDateForm에 따라 가변적이기 때문에,
             * index 변수를 사용해서 항상
             * 0, 1, 2 순서에 저장하도록 한다.
             */
            this._dateForm.replace(formatRegExp, function(str) {
                var key = str.toLowerCase();

                regExpStr += mapForConverting[key].expression + '(?:[\\D\\s]*)';
                formOrder[index] = mapForConverting[key].type;

                index += 1;
            });

            this._regExp = new RegExp(regExpStr, 'gi');
            this.setDate();
        },

        /**
         * TimePicker 엘리먼트를 반환한다.
         * @returns {TimePicker}
         */
        getTimePicker: function() {
            return this._timePicker;
        }
    });
})(ne.component);