/**
 * Created by nhnent on 15. 5. 14..
 * @fileoverview 날짜를 선택하는 기능을 구현한다. 특정 범위를 받으면, 그 날짜만 선택 가능하다.
 * @author NHN ENTERTAINMENT FE 개발팀(e0242@nhnent.com)
 * @author 이제인(jein.yi@nhnent.com)
 * @author 이민규(minkyu.yi@nhnent.com) 2015-05-14
 * @dependency jquery 1.8.3, code-snippet 1.0.2, component-calendar 1.0.1
 */

'use strict';

var calendarUtil = ne.component.Calendar.Util,
    util = ne.util,
    inArray = util.inArray,
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
    CONSTANTS = {
        minYear: 1970,
        maxYear: 2999,
        monthDays: [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        wrapperTag: '<div style="position:absolute;"><p>Calendar</p></div>'
    };

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
 *          @param {number} [option.date.year] 년도
 *          @param {number} [option.date.month] 월
 *          @param {number} [option.date.date] 일
 *      @param {string} [option.dateForm = 'yyyy-mm-dd'] 날짜 형식
 *      @param {string} [option.defaultCentury = 20] yy 형식일때 자동으로 붙여지는 값 [19|20]
 *      @param {string} [option.selectableClass = 'selectableClass'] 선택가능한 날짜에 입힐 클래스
 *      @param {Object} [option.startDate = {year:1970, month:1, date:1}] 날짜 시작일 (해당 날짜 선택 불가)
 *          @param {number} [option.startDate.year] 시작 날짜 - 년도
 *          @param {number} [option.startDate.month] 시작 날짜 - 월
 *          @param {number} [option.startDate.date] 시작 날짜 - 일
 *      @param {Object} [option.endDate = {year:3000, month:12, date:31}] 날짜 종료일 (해당 날짜 선택 불가)
 *          @param {number} [option.endDate.year] 끝 날짜 - 년도
 *          @param {number} [option.endDate.month] 끝 날짜 - 월
 *          @param {number} [option.endDate.date] 끝 날짜 - 일
 *      @param {Object} [option.pos = {x: number, y: number, zIndex: number}] position - left & top & zIndex
 *          @param {number} [option.pos.x] 캘린더의 position left 값
 *          @param {number} [option.pos.y] 캘린더의 position top 값
 *          @param {number} [option.pos.zIndex] 캘린더의 z-index 값
 *      @param {Object} [option.openers = []] opener list
 *      @param {ne.component.TimePicker} [option.timePicker] 데이트피커에 붙을 타임피커
 * @param {ne.component.Calendar} calendar 캘린더 컴포넌트
 * */
ne.component.DatePicker = ne.util.defineClass(/** @lends ne.component.DatePicker.prototype */{
    init: function(option, calendar) {
        /**
         * 캘린더 객체
         * @type{Calendar}
         * @private
         */
        this._calendar = calendar;

        /**
         * 실제 날짜값 문자열이 보여질 엘리먼트
         * @type {HTMLElement}
         * @private
         */
        this._$element = $(option.element);

        /**
         * 캘린더 엘리먼트
         * @type {HTMLElement}
         * @private
         */
        this._$wrapperElement = null;

        /**
         * 날짜 표시 형식
         * @type {string}
         * @private
         */
        this._dateForm = option.dateForm || 'yyyy-mm-dd ';

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
        this._date = null;

        /**
         * yy-mm-dd 형식으로 인풋창에 값을 직접 입력 할 시, 앞에 자동으로 붙을 숫자.
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
         * TimePicker Object
         * @type {TimePicker}
         * @private
         * @since 1.1.0
         */
        this._timePicker = null;

        /**
         * position - left & top & zIndex
         * @type {Object}
         * @private
         * @since 1.1.1
         */
        this._pos = null;

        /**
         * openers - opener list
         * @type {Array}
         * @private
         * @since 1.1.1
         */
        this._openers = [];

        /**
         * this._binders
         * @todo
         *      unbindCalendarEvent
         */
        this._binders = {};

        this._initializeDatePicker(option);
    },

    /**
     * 초기화 진행 메서드
     * @param {Object} option 사용자 옵션
     * @private
     */
    _initializeDatePicker: function(option) {
        this._setWrapperElement();
        this._setDefaultDate(option.date);
        this._setDefaultPosition(option.pos);
        this._setRestrictiveDate(option.startDate, option.endDate);
        // 엘리먼트가 존재하면 이벤트를 등록한다.
        this._bindElementEvent(option.openers);

        // timePicker를 등록하거나 새로 생성한다.
        if (option.timePicker) {
            this._timePicker = option.timePicker;
            this._setTimePicker();
        }
        // 날짜 형식을 지정하고 현재 날짜를 input element에 출력한다.
        this.setDateForm();

        // wrapperElement를 숨긴다.
        this._$wrapperElement.hide();
    },

    /**
     *
     * @private
     */
    _setWrapperElement: function() {
        this._$wrapperElement = $(CONSTANTS.wrapperTag)
            .insertAfter(this._$element)
            .append(this._calendar.$element);
    },

    /**
     * 데이트피커의 기본값 날짜를 지정한다.
     * @param {Object} opDate [option.date] 사용자가 지정한 기본값 날짜
     * @private
     */
    _setDefaultDate: function(opDate) {
        if (!opDate) {
            this._date = calendarUtil.getDateHashTable();
        } else {
            this._date = {
                year: util.isNumber(opDate.year) ? opDate.year : CONSTANTS.minYear,
                month: util.isNumber(opDate.month) ? opDate.month : 1,
                date: util.isNumber(opDate.date) ? opDate.date : 1
            };
        }
    },

    /**
     * 캘린더의 기본 포지션을 설정한다.
     * @param {Object} opPos [option.pos] 사용자가 지정한 캘린더엘리먼트의 좌표와 zIndex
     * @private
     */
    _setDefaultPosition: function(opPos) {
        var pos = this._pos = opPos || {},
            bound = this._getBoundingClientRect();

        pos.left = pos.left || bound.left;
        pos.top = pos.top || bound.bottom;
        pos.zIndex = pos.zIndex || 9999;
    },

    /**
     * 데이트피커의 제한 날짜를 설정한다.
     * @param {Object} opStartDate [option.startDate] 선택 가능한 시작 날짜
     * @param {Object} opEndDate [option.endDate] 선택 가능한 마지막 날짜
     * @private
     */
    _setRestrictiveDate: function(opStartDate, opEndDate) {
        var startDate = opStartDate || {year: CONSTANTS.minYear, month: 1, date: 1},
            endDate = opEndDate || {year: CONSTANTS.maxYear, month: 12, date: 31};

        this._startEdge = calendarUtil.getTime(startDate) - 1;
        this._endEdge = calendarUtil.getTime(endDate) + 1;
    },

    /**
     * opener list를 저장한다.
     * @param {Array} opOpeners [option.openers] opener 엘리먼트 리스트
     * @private
     */
    _setOpeners: function(opOpeners) {
        this.addOpener(this._$element);
        util.forEach(opOpeners, function(opener) {
            this.addOpener(opener);
        }, this);
    },

    /**
     * 타임 피커 포함시 초기화 메서드
     * @private
     */
    _setTimePicker: function() {
        this._timePicker = new ne.component.TimePicker({
            showMeridian: true
        });
        this._timePicker.on('change', function() {
            this.setDate();
        }, this);
        this._calendar.$element.append(this._timePicker.$timePickerElement);
        this._timePicker.show();
    },

    /**
     * 해당 년도가 유효한지 판단한다.
     * @param {number} year 년도
     * @returns {boolean} 유효 여부
     * @private
     */
    _isValidYear: function(year) {
        return util.isNumber(year) && year > CONSTANTS.minYear && year < CONSTANTS.maxYear;
    },

    /**
     * 해당 월이 유효한지 판단한다.
     * @param {number} month 월
     * @returns {boolean} 유효 여부
     * @private
     */
    _isValidMonth: function(month) {
        return util.isNumber(month) && month > 0 && month < 13;
    },

    /**
     * 해당 날짜가 유효한 날짜인지 판단한다.
     * @param {Object} datehash 날짜 값 객체
     * @returns {boolean} 유효한 날짜 여부
     * @private
     */
    _isValidDate: function(datehash) {
        var year = datehash.year,
            month = datehash.month,
            date = datehash.date,
            isLeapYear = (year % 4 === 0) && (year % 100 !== 0) || (year % 400 === 0),
            lastDayInMonth,
            isBetween;

        if (!this._isValidYear(year) || !this._isValidMonth(month)) {
            return false;
        }

        lastDayInMonth = CONSTANTS.monthDays[month];
        if (isLeapYear && month === 2) {
                lastDayInMonth = 29;
        }
        isBetween = !!(util.isNumber(date) && (date > 0) && (date <= lastDayInMonth));

        return isBetween;
    },

    /**
     * 엘리먼트 클릭시 이벤트 바인딩
     * @param {Array} opOpeners [option.openers] opener 엘리먼트 리스트
     * @private
     */
    _bindElementEvent: function(opOpeners) {
        this._setOpeners(opOpeners);
        if (this._$element) {
            this._$element.on('keydown', ne.util.bind(this._onKeydownPicker, this));
        }
    },

    /**
     * closeLayer 이벤트 리스너를 document에 등록한다.
     * @private
     */
    _bindCloseLayer: function() {
        $(document).on('mousedown', util.bind(this._closeLayer, this));
    },

    /**
     * 레이어 영역 밖을 클릭했을 때 레이어를 닫는다.
     * @param {Event} event 이벤트객체
     * @private
     */
    _closeLayer: function(event) {
        var isContains = $.contains(this._calendar.$element[0], event.target);

        if ((!isContains && !this._isOpener(event.target))) {
            $(document).off(event);
            this._setDateFromString(this._$element.val());
            this.close();
        }
    },

    /**
     * 해당 엘리먼트가 opener 인지 확인한다.
     * @param {HTMLElement} target element
     * @returns {boolean} opener true/false
     * @private
     */
    _isOpener: function(target) {
        var result = false;

        util.forEach(this._openers, function(opener) {
            if (target === opener || $.contains(opener, target)) {
                result = true;
                return false;
            }
        });
        return result;
    },

    /**
     * 캘린더를 해당 레이어 아래로 이동시킨다.
     * @private
     */
    _arrangeLayer: function() {
        var style = this._$wrapperElement[0].style,
            pos = this._pos;

        style.left = pos.left + 'px';
        style.top = pos.top + 'px';
        style.zIndex = pos.zIndex;
        this._$wrapperElement.append(this._calendar.$element);
    },

    /**
     * 앨리먼트의 BoundingClientRect를 구한다.
     * @param {HTMLElement|jQuery} [element] 엘리먼트
     * @returns {Object} 경계 값들 - left, top, bottom, right
     * @private
     */
    _getBoundingClientRect: function(element) {
        var el = $(element)[0] || this._$element[0],
            bound,
            ceil;

        bound = el.getBoundingClientRect();
        ceil = Math.ceil;
        return {
            left: ceil(bound.left),
            top: ceil(bound.top),
            bottom: ceil(bound.bottom),
            right: ceil(bound.right)
        };
    },

    /**
     * 달력에 이벤트를 붙인다.
     * @private
     */
    _bindOnClickCalendar: function() {
        var binders = this._binders,
            binder = binders._onClickCalendar;

        if (!ne.util.isFunction(binder)) {
            binder = binders._onClickCalendar = ne.util.bind(this._onClickCalendar, this);
        }
        this._$wrapperElement.find('.' + this._selectableClass).on('click', binder);
    },

    /**
     * 달력 이벤트를 제거한다
     * @private
     */
    _unbindOnClickCalendar: function() {
        var binder = this._binders._onClickCalendar;

        this._$wrapperElement.find('.' + this._selectableClass).off('click', binder);
    },

    /**
     * 문자열로부터 날짜 정보를 추출하여 저장한다.
     * @param {string} str 문자열
     * @private
     */
    _setDateFromString: function(str) {
        var date = this._extractDate(str);

        if (date && !this._isRestricted(date)) {
            if (this._timePicker) {
                this._timePicker.setTimeFromInputElement(this._$element);
            }
            this.setDate(date.year, date.month, date.date);
        } else {
            this.setDate();
        }
    },

    /**
     * 인풋 상자에서 엔터를 쳤을 경우 이벤트 처리
     * @param {Event} [event] 이벤트 객체
     * @private
     */
    _onKeydownPicker: function(event) {
        if (!event || event.keyCode !== 13) {
            return;
        }

        this._setDateFromString(this._$element.val());
    },

    /**
     * 클릭시 발생한 이벤트.
     * 이벤트 타겟의 값으로 날짜를 업데이트한다.
     * @param {Event} e 이벤트 객체
     * @private
     */
    _onClickCalendar: function(e) {
        var target = e.target,
            className = target.className,
            value = Number((target.innerText || target.textContent || target.nodeValue)),
            shownDate,
            relativeMonth,
            date;

        if (value && !isNaN(value)) {
            if (className.indexOf('prev-mon') > -1) {
                relativeMonth = -1;
            } else if (className.indexOf('next-mon') > -1) {
                relativeMonth = 1;
            } else {
                relativeMonth = 0;
            }

            shownDate = this._calendar.getDate();
            shownDate.date = value;
            date = calendarUtil.getRelativeDate(0, relativeMonth, 0, shownDate);
            this.setDate(date.year, date.month, date.date);
        }
    },

    /**
     * 날짜 해쉬를 받아 양식에 맞춘 값을 생성해 돌려준다.
     * @return {string} - 폼에 맞춘 날짜 스트링
     * @private
     */
    _formed: function() {
        var year = this._date.year,
            month = this._date.month,
            date = this._date.date,
            form = this._dateForm,
            replaceMap,
            dateString;

        month = month < 10 ? ('0' + month) : month;
        date = date < 10 ? ('0' + date) : date;

        replaceMap = {
            yyyy: year,
            yy: String(year).substr(2, 2),
            mm: month,
            m: Number(month),
            dd: date,
            d: Number(date)
        };

        dateString = form.replace(formatRegExp, function(key) {
            return replaceMap[key.toLowerCase()] || '';
        });

        return dateString;
    },

    /**
     * 입력 텍스트로부터 지정한 날짜 형식과 비교하여 날짜 데이터 객체를 만들고 그 결과를 반환한다.
     * @param {String} str 입력 텍스트
     * @returns {Object|boolean} false 또는 추출한 날짜 데이터 객체
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
     * @param {Object} datehash 날짜 데이터 객체
     * @returns {boolean} 제한 여부
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
            var dateHash = {
                year: data.year,
                month: data.month,
                date: data.date
            };

            if (!this._isRestricted(dateHash)) {
                data.$dateContainer.addClass(this._selectableClass);
            }
        }, this));
    },

    /**
     * 달력이 갱신될때 이벤트를 건다.
     * @private
     * @todo this.binders에 등록
     */
    _bindCalendarCustomEvent: function() {
        this._calendar.on('beforeDraw', ne.util.bind(function() {
            this._unbindOnClickCalendar();
        }, this));
        this._calendar.on('afterDraw', ne.util.bind(function() {
            this._bindOnClickCalendar();
        }, this));
    },

   /**
    * 달력이 닫힐때 커스텀이벤트 제거
    * @private
    * @todo this.binders에서 선택적 제거가 필요함!!!!
    */
    _unbindCalendarEvent: function() {
        this._calendar.off();
    },

    /**
     * calendar element의 left, top값 지정
     * @param {number} x left값
     * @param {number} y top값
     * @since 1.1.1
     */
    setXY: function(x, y) {
        var pos = this._pos;

        pos.left = util.isNumber(x) ? x : pos.left;
        pos.top = util.isNumber(y) ? y : pos.top;
        this._arrangeLayer();
    },

    /**
     * calendar element의 z-index 값 지정
     * @param {number} zIndex z-index 값
     * @since 1.1.1
     */
    setZIndex: function(zIndex) {
        if (!util.isNumber(zIndex)) {
            return;
        }

        this._pos.zIndex = zIndex;
        this._arrangeLayer();
    },

    /**
     * add opener
     * @param {HTMLElement|jQuery} opener element
     */
    addOpener: function(opener) {
        if (inArray(opener, this._openers) < 0) {
            this._openers.push($(opener)[0]);
            $(opener).on('click', util.bind(this.open, this));
        }
    },

    /**
     * remove opener
     * @param {HTMLElement} opener element
     */
    removeOpener: function(opener) {
        var index = inArray(opener, this._openers);

        if (index > -1) {
            $(this._openers[index]).off('click');
            this._openers.splice(index, 1);
        }
    },

    /**
     * 달력의 위치를 조정하고, 달력을 펼친다.
     */
    open: function() {
        if (this.isOpened()) {
            return;
        }

        // 달력 레이어 위치 조정
        this._arrangeLayer();

        // 선택영역 제한이 있는지 확인후 선택불가능한 부분을 설정한다.
        this._bindDrawEventForSelectableRange();

        // 달력 커스텀이벤트
        this._bindCalendarCustomEvent();

        // 달력 레이어를 뺀 위치에서 마우스 클릭시 달력닫힘
        this._bindCloseLayer();

        this.setDate();
        // 달력을 그린다.
        //this._calendar.draw(this._date.year, this._date.month, false);

        // wrapperElement를 보인다.
        this._$wrapperElement.show();
    },

    /**
     * 달력에 걸린 이벤트를 해지하고
     * 달력 레이어를 닫는다.
     */
    close: function() {
        if (!this.isOpened()) {
            return;
        }
        this._setDateFromString(this._$element.val());
        this._unbindOnClickCalendar();
        //this._unbindCalendarEvent();
        this._$wrapperElement.hide();
    },

    /**
     * 현재 날짜 해시 객체를 반환한다.
     * @returns {Object} 날짜 데이터 객체
     */
    getDateObject: function() {
        return util.extend({}, this._date);
    },

    /**
     * 년도를 반환한다.
     * @returns {number} 년도
     */
    getYear: function() {
        return this._date.year;
    },

    /**
     * 월을 반환한다.
     * @returns {number} 월
     */
    getMonth: function() {
        return this._date.month;
    },

    /**
     * 일을 반환한다.
     * @returns {number} 일
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
        if (this._$element) {
            value = this._formed();
            if (this._timePicker) {
                value = value + this._timePicker.getTime();
            }
            this._$element.val(value);
        }
        this._calendar.draw(dateObj.year, dateObj.month, false);
    },

    /**
     * 날짜 폼을 변경한다.
     * @param {String} [form] - 날짜 형식 (ex- 'yyyy-mm-dd', 'mm-dd, yyyy', 'y/m/d', 'yy/mm/dd')
     */
    setDateForm: function(form) {
        var regExpStr = '^',
            formOrder = this._formOrder,
            index = 0;
        this._dateForm = form || this._dateForm;

        /**
         * formOrder는 날짜 형식의 순서를 기억한다.
         * 만약 날짜 형식이 'mm-dd, yyyy'라면
         * formOrder = ['month', 'date', 'year'];
         *
         * 날짜 형식은 setDateForm에 따라 가변적이기 때문에,
         * index 변수를 사용해서 항상
         * 0, 1, 2 순서에 저장하도록 한다.
         *
         * @param {string} str 날짜 형식의 키값
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

    isOpened: function() {
        return this._$wrapperElement.css('display') === 'block';
    },

    /**
     * TimePicker 엘리먼트를 반환한다.
     * @returns {TimePicker} 타임 피커 객체
     */
    getTimePicker: function() {
        return this._timePicker;
    }
});
